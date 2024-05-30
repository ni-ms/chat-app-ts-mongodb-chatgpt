import {
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardHeader,
    MDBCol,
    MDBContainer,
    MDBIcon,
    MDBInput,
    MDBRow,
    MDBTextArea,
    MDBTypography,
} from "mdb-react-ui-kit";
import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {io, Socket} from 'socket.io-client';
import {addResponseMessage} from "react-chat-widget";
import 'react-chat-widget/lib/styles.css';
import 'chatbot/css/chatbot.min.css'


export default function Chat() {
    const socket = useRef<Socket>();
    const navigate = useNavigate();
    const [emails, setEmails] = useState<string[]>([]);
    const [chatMessages, setChatMessages] = useState<{
        sender: string,
        receiver: string,
        content: string,
        timestamp: Date,
    }[]>([]);
    const [otherUser, setOtherUser] = useState<string>('');
    const [loggedInUser, setLoggedInUser] = useState<string>('');
    const [chatMessageToSend, setChatMessageToSend] = useState('');
    const [statusLevel, setStatusLevel] = useState<string>('free');
    const [statusLevelOther, setStatusLevelOther] = useState<string>('free');
    const [isUserOnline, setIsUserOnline] = useState<boolean>(false);
    useEffect(() => {
        socket.current = io('http://localhost:3000', {
            query: {
                token: sessionStorage.getItem('tokenVal'),
                email: sessionStorage.getItem('emailVal')
            }
        });

        function onConnect() {
            socket.current?.connect()
        }

        function onDisconnect() {
            socket.current?.disconnect()
        }

        function onGetMessages(messages: { sender: string, receiver: string, content: string, timestamp: Date }[]) {
            console.log('Received message onGetMessages', messages);
            const filteredMessages = messages.map(({sender, receiver, content, timestamp}) => ({
                sender,
                receiver,
                content,
                timestamp
            }));
            setChatMessages(filteredMessages);
        }

        function onMessage(message: { loggedInUser: string, otherUser: string, content: string, timestamp: Date }) {
            console.log('Received message onMessageResponse', message);
            const newChatMessages = [...chatMessages, {
                sender: message.loggedInUser,
                receiver: message.otherUser,
                content: message.content,
                timestamp: message.timestamp
            }];
            console.log('New chat messages:', newChatMessages);
            setChatMessages(newChatMessages);
        }

        function onSetBusyResponse() {
            setStatusLevel('busy');
        }

        function onSetFreeResponse() {
            setStatusLevel('free');
        }

        function onGetStatusResponse(status: boolean) {
            setStatusLevelOther(status ? 'free' : 'busy');
        }

        socket.current.on('connect', onConnect);
        socket.current.on('disconnect', onDisconnect);
        socket.current.on('getMessagesResponse', onGetMessages);
        socket.current.on('messageResponse', onMessage);
        socket.current.on('setBusyResponse', onSetBusyResponse);
        socket.current.on('setFreeResponse', onSetFreeResponse);
        socket.current.on('getStatusResponse', onGetStatusResponse);


        return () => {

            socket.current?.off('connect', onConnect);
            socket.current?.off('disconnect', onDisconnect);
            socket.current?.off('getMessagesResponse', onGetMessages);
            socket.current?.off('messageResponse', onMessage);

            socket.current?.off('setBusyResponse', onSetBusyResponse);
            socket.current?.off('setFreeResponse', onSetFreeResponse);
            socket.current?.off('getStatusResponse', onGetStatusResponse);

            socket.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        const userEmail = sessionStorage.getItem('emailVal');
        if (userEmail) {
            setLoggedInUser(userEmail);
        }
        getUsers();
        console.log('Emails:', emails);
        if (!sessionStorage.getItem('tokenVal')) {
            navigate('/Login');
        }
    }, []);


    function disconnectChat() {
        console.log('Disconnecting chat');
        socket.current?.emit('disconnect');
        socket.current?.disconnect();
    }

    const sendMessage = (loggedInUser: string, otherUser: string, message: string) => {
        console.log('Sending message from', loggedInUser, 'to', otherUser, 'message:', message);
        socket.current?.emit('message', {loggedInUser, otherUser, content: message, timestamp: new Date()});
        setChatMessageToSend('');
        setChatMessages(prevMessages => [...prevMessages, {
            sender: loggedInUser,
            receiver: otherUser,
            content: message,
            timestamp: new Date()
        }]);

    }

    function ChatButton({latestText, email}: {
        latestText: string;
        email: string;
    }) {
        const getMessgeFunc = () => {
            setOtherUser(email);
            console.log('Selected user is', email)
            console.log(chatMessages);
            console.log('messages:', chatMessages);
            socket.current?.emit('getMessages', {loggedInUser: loggedInUser, otherUser: email});
        };

        const getStatus = () => {
            socket.current?.emit('getStatus', {loggedInUser: loggedInUser, otherUser: email});
            socket.current?.on('getStatusResponse', (status: boolean) => {
                setStatusLevelOther(status ? 'free' : 'busy');
            });
            return statusLevelOther;
        }
        const statlev = getStatus();

        return <a href="#!" className="d-flex justify-content-between">
            <div onClick={getMessgeFunc} className="d-flex flex-row">
                <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-8.webp"
                    alt="avatar"
                    className="rounded-circle d-flex align-self-center me-3 shadow-1-strong"
                    width="60"
                />
                <div className="pt-1">
                    <p className="fw-bold mb-0">{email}</p>
                    <p className="small text-muted">
                        {latestText}
                    </p>
                </div>
            </div>
            <div className="pt-1" onClick={getStatus}>
                <p className="small text-muted mb-1">Status:</p>
                <span className="badge bg-danger float-end">{statlev}</span>
            </div>
        </a>;
    }

    // Send and receive chat box for the ui
    function ReceiveChatBox({timestamp, content, sender, receiver}: {
        timestamp: Date;
        content: string;
        sender: string;
        receiver: string;
    }) {
        receiver;
        return <li className="d-flex justify-content-between mb-4">
            <img
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-6.webp"
                alt="avatar"
                className="rounded-circle d-flex align-self-start me-3 shadow-1-strong"
                width="60"
            />
            <MDBCard>
                <MDBCardHeader className="d-flex justify-content-between p-3">
                    <p className="fw-bold mb-0">{sender}</p>
                    <p className="text-muted small mb-0">
                        <MDBIcon far icon="clock"/> {timestamp.toString()}
                    </p>
                </MDBCardHeader>
                <MDBCardBody>
                    <p className="mb-0">
                        {content}
                    </p>
                </MDBCardBody>
            </MDBCard>
        </li>;
    }

    function SendChatBox({timestamp, content, sender, receiver}: {
        timestamp: Date;
        content: string;
        sender: string;
        receiver: string;
    }) {
        receiver;
        return <li className="d-flex justify-content-between mb-4">
            <MDBCard className="w-100">
                <MDBCardHeader className="d-flex justify-content-between p-3">
                    <p className="fw-bold mb-0">{sender}</p>
                    <p className="text-muted small mb-0">
                        <MDBIcon far icon="clock"/> {timestamp.toString()}
                    </p>
                </MDBCardHeader>
                <MDBCardBody>
                    <p className="mb-0">
                        {content}
                    </p>
                </MDBCardBody>
            </MDBCard>
            <img
                src="https://mdbcdn.b-cdn.net/img/Photos/Avatars/avatar-5.webp"
                alt="avatar"
                className="rounded-circle d-flex align-self-start ms-3 shadow-1-strong"
                width="60"
            />
        </li>;
    }

    useEffect(() => {
        addResponseMessage('Welcome to this awesome chat!');
    }, []);

    // const handleNewUserMessage = (newMessage: string) => {
    //     console.log(`New message incoming! ${newMessage}`);
    //     // Now send the message throught the backend API
    //     socket.current?.emit('getAIMessage', {loggedInUser, otherUser, content: newMessage, timestamp: new Date()});
    //     let response = "";
    //     socket.current?.on('getAIMessageResponse', (res) => {
    //         response = res;
    //     });
    //     addResponseMessage(response);
    // };

    function AIBusyChatBox() {
        const [inputValue, setInputValue] = useState<string>('');
        const [chatMessages, setChatMessages] = useState<Message[]>([]);

        type Message = {
            text: string;
            isUser: boolean;
        };

        type ChatMessageProps = {
            message: Message;
        };

        const ChatMessage: React.FC<ChatMessageProps> = ({message}) => {
            return (
                <div style={{textAlign: message.isUser ? 'right' : 'left'}}>
                    <p>{message.text}</p>
                </div>
            );
        };

        const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
        };

        const handleSendClick = () => {
            // First, send a GET request to obtain the API token
            fetch('https://cors-anywhere.herokuapp.com/https://duckduckgo.com/duckchat/v1/status', {
                method: 'GET',
                headers: {
                    'x-vqd-accept': '1'
                }
            })
                .then(response => {
                    // Extract the API token from the 'x-vqd-4' header
                    const apiToken = response.headers.get('x-vqd-4');
                    console.log('API token:', apiToken);

                    // Add the new message to the chatMessages array
                    setChatMessages([...chatMessages, {text: inputValue, isUser: true}]);
                    // Clear the input field
                    setInputValue('');

                    // Then, send a POST request to the DuckDuckGo API with the obtained API token
                    return fetch('https://cors-anywhere.herokuapp.com/https://duckduckgo.com/duckchat/v1/chat', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-vqd-4': apiToken // Use the obtained API token here
                        },
                        body: JSON.stringify({
                            model: 'gpt-3.5-turbo-0125',
                            messages: [
                                {role: 'user', content: inputValue}
                            ]
                        })
                    });
                })
                .then(response => {
                    const reader = response.body?.getReader();
                    return new ReadableStream({
                        start(controller) {
                            function push() {
                                reader?.read().then(({done, value}) => {
                                    if (done) {
                                        controller.close();
                                        return;
                                    }
                                    controller.enqueue(value);
                                    return push();
                                })
                            }

                            return push();
                        }
                    });
                })
                .then(stream => {
                    return new Response(stream, {headers: {"Content-Type": "text/html"}}).text();
                })
                .then(result => {
                    const messages = result.split('\n');
                    let completeMessage = '';
                    messages.forEach(message => {
                        if (message.startsWith('data:')) {
                            try {
                                const data = JSON.parse(message.slice(5));
                                if (data.message) {
                                    console.log('AI message:', data.message);
                                    completeMessage += data.message + ' ';
                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error);
                            }
                        }
                    });
                    console.log(completeMessage);
                    const aiMessage = {
                        text: completeMessage,
                        isUser: false
                    };
                    setChatMessages(prevMessages => [...prevMessages, aiMessage]);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        };

        return (
            <div>
                <MDBCol md="6" lg="7" xl="8">
                    <MDBTypography listUnStyled style={{maxHeight: '500px', overflowY: 'auto'}}>
                        <h2>Chat With AI</h2>
                        {chatMessages.map((message, index) => (
                            <ChatMessage key={index} message={message}/>
                        ))}
                        <MDBInput label="Your message" id="formControlLg" size="lg" value={inputValue}
                                  onChange={handleInputChange}/>
                        <button onClick={handleSendClick}>Send</button>
                        <MDBBtn color="danger" rounded className="float-end me-2"
                                onClick={() => setStatusFunc(statusLevel === 'busy' ? 'free' : 'busy')}>
                            {statusLevel === 'busy' ? 'Set free' : 'Set busy'}
                        </MDBBtn>
                    </MDBTypography>
                </MDBCol>
            </div>
        );
    }


    const getUsers = async () => {
        const response = await fetch('http://localhost:3000/auth/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('tokenVal')}` // assuming you have a token stored in keyToken
            }
        });

        if (response.ok) {
            const data = await response.json();
            const emailList = data.map((user: { _id: string, email: string }) => user.email);
            setEmails(emailList);
        } else {
            console.error('Failed to fetch users');
        }
    };

    const setStatusFunc = (status: string) => {
        if (status === 'busy') {
            socket.current?.emit('setBusy', {loggedInUser: loggedInUser});
            setIsUserOnline(true)
        } else if (status === 'free') {
            socket.current?.emit('setFree', {loggedInUser: loggedInUser});
            setIsUserOnline(false)
        }
    }
    // useEffect(() => {
    //     console.log('Chat messages updated:', chatMessages);
    // }, [chatMessages]); // Add chatMessages to the dependency array

    // const chatBoxes = useMemo(() => chatMessages.map((message, index) => {
    //     if (message.sender === otherUser) {
    //         return (
    //             <SendChatBox
    //                 key={index}
    //                 timestamp={message.timestamp}
    //                 content={message.content}
    //                 sender={message.sender}
    //                 receiver={message.receiver}
    //             />
    //         );
    //     } else if (message.receiver === otherUser) {
    //         return (
    //             <ReceiveChatBox
    //                 key={index}
    //                 timestamp={message.timestamp}
    //                 content={message.content}
    //                 sender={message.sender}
    //                 receiver={message.receiver}
    //             />
    //         );
    //     }
    //     return null;
    // }), [chatMessages, otherUser]); // Add chatMessages to the dependency array

    return (
        <MDBContainer fluid className="py-5" style={{backgroundColor: "#eee", height: "100vh"}}>
            <MDBRow style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MDBCol md="6" lg="5" xl="4" className="mb-4 mb-md-0">
                    <h5 className="font-weight-bold mb-3 text-center text-lg-start">

                    </h5>
                    <h3>Logged in: {loggedInUser}</h3>

                    <MDBCard>
                        <MDBCardBody>
                            <MDBTypography listUnStyled className="mb-0">
                                {emails.map((email) => (
                                    email !== loggedInUser && (
                                        <li
                                            key={email}
                                            className="p-2 border-bottom"
                                            style={{backgroundColor: "#eee"}}
                                        >
                                            <ChatButton latestText="Latest text goes here" email={email}/>
                                        </li>
                                    )
                                ))}

                            </MDBTypography>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
                {!isUserOnline || statusLevelOther === 'busy' ? (
                    <AIBusyChatBox/>
                ) : (
                    <MDBCol md="6" lg="7" xl="8">
                        <h3>Talking to: {otherUser}</h3>
                        <MDBTypography listUnStyled style={{maxHeight: '500px', overflowY: 'auto'}}>

                            {chatMessages.map((message, index) => {
                                if (message.sender === otherUser) {
                                    return (
                                        <SendChatBox
                                            key={index}
                                            timestamp={message.timestamp}
                                            content={message.content}
                                            sender={message.sender}
                                            receiver={message.receiver}
                                        />
                                    );
                                } else if (message.receiver === otherUser) {
                                    return (
                                        <ReceiveChatBox
                                            key={index}
                                            timestamp={message.timestamp}
                                            content={message.content}
                                            sender={message.sender}
                                            receiver={message.receiver}
                                        />
                                    );
                                }
                                return null;
                            })}

                            <li className="bg-white mb-3">
                                <MDBTextArea label="Message" id="textAreaExample" rows={4} value={chatMessageToSend}
                                             onChange={(e) => setChatMessageToSend(e.target.value)}/>
                            </li>
                            <MDBBtn color="info" rounded className="float-end"
                                    onClick={() => sendMessage(loggedInUser, otherUser, chatMessageToSend)}>
                                Send
                            </MDBBtn>
                            <MDBBtn color="danger" rounded className="float-end me-2" onClick={() => disconnectChat()}>
                                Disconnect from chat
                            </MDBBtn>
                            <MDBBtn color="danger" rounded className="float-end me-2"
                                    onClick={() => setStatusFunc(statusLevel === 'busy' ? 'free' : 'busy')}>
                                {statusLevel === 'busy' ? 'Set free' : 'Set busy'}
                            </MDBBtn>
                        </MDBTypography>
                    </MDBCol>)}
            </MDBRow>
        </MDBContainer>
    );
}