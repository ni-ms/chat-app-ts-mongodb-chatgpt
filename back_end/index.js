const PORT = 3000;
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
const passport = require('passport');
const mongoose = require('mongoose');

const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(passport.initialize());

app.use(cors({
    origin: function (origin, callback) {
        if (origin.startsWith('http://localhost:3000') || origin.startsWith('http://localhost:5173')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    methods: ['GET', 'POST'], // Allow these HTTP methods
    credentials: true // Allow cookies
}));
const index = http.createServer(app);
const io = new Server(index, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ["websocket", "polling"],
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000,
});

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost:27017/chatapp')
    .then(() => {
        const authRoutes = require('./routes/auth')(mongoose);
        app.use('/auth', authRoutes);
    })
    .catch(err => console.log(err));
//fix authenticatiop

// io.use((socket, next) => {
//     let token = socket.handshake.query.token;
//     console.log('GETTING AUTHENTICATED', token);
//     passport.authenticate('jwt', {session: false}, (err, user) => {
//         if (err) {
//             return next(err);
//         }
//         if (!user) {
//             return next(new Error('Authentication Error'));
//         }
//         console.log('User authenticated:', user.email, user.name, user.socket, user.online);
//         socket.user = user;
//         return next();
//     })(socket.request, {}, next);
// });

let userEmailToSocketId = {};


function getMessages(email, socket) {
    // Fetch sent and received messages separately
    const sentMessages = Message.find({sender: email});
    const receivedMessages = Message.find({receiver: email});

    // Use Promise.all to wait for both queries to complete
    Promise.all([sentMessages, receivedMessages])
        .then(([sent, received]) => {
            const messages = sent.concat(received);
            messages.sort((a, b) => a.timestamp - b.timestamp);
            console.log('User messages:', messages);
            socket.emit('getMessagesResponse', messages);
        })
        .catch(err => console.log(err));
}

io.on('connection', (socket) => {
    let email = socket.handshake.query.email; // Get the token from the socket handshake query

    if (!email) {
        socket.disconnect(true);
        console.log('User disconnected')
        return;
    }
    userEmailToSocketId[email] = socket.id;
    console.log(userEmailToSocketId);
    //Update the user model for the particular email
    User.findOneAndUpdate({email: email}, {online: true});
    console.log('A user with email', email, 'connected with socket id', socket.id);

    socket.on('exit', () => {

    });
    socket.on('disconnect', () => {
        User.findOneAndUpdate({email: email}, {online: false});
    });
    socket.on('getMessages', () => {
        // Get the messages from db where the email is sender or receiver.
        getMessages(email, socket);
    });
    socket.on('setBusy', (emailv) => {
        User.findOneAndUpdate({email: emailv}, {online: false});
        socket.emit('setBusyResponse');
    });
    socket.on('setFree', (emailv) => {
        User.findOneAndUpdate({email: email}, {online: true});
        socket.emit('setFreeResponse');
    });

    socket.on('getAIMessage', (msg) => {
        console.log('AI Message:', msg);
        const otherUser = msg.loggedInUser
        const content = msg.content;

        console.log('Message received:', content, recipientSocketId);
        if (recipientSocketId) {
            console.log('Sending message', content, 'to', otherUser);
            io.to(recipientSocketId).emit('getAIMessageResponse', msg);
        }
    });

    socket.on('getStatus', (emailv) => {
        User.findOne({email: emailv})
            .then(user => {
                console.log('User status:', user.online);
                socket.emit('getStatusResponse', user.online);
            })
            .catch(err => console.log(err));
    })

    socket.on('message', (msg) => {
        console.log(msg);
        const otherUser = msg.otherUser;
        const loggedInUser = msg.loggedInUser;
        const content = msg.content;
        const recipientSocketId = userEmailToSocketId[otherUser];
        console.log('Message received:', content, recipientSocketId);
        if (recipientSocketId) {
            console.log('Sending message', content, 'to', otherUser);
            io.to(recipientSocketId).emit('messageResponse', msg);
        }

        const message = new Message({
            sender: loggedInUser,
            receiver: otherUser,
            content: content,
            timestamp: new Date(),
        });

        message.save()
            .then(() => console.log('Message stored in database'))
            .catch(err => console.log(err));
    });
});

index.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

