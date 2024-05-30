const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: String,
    receiver: String,
    content: String,
    timestamp: Date,
});

module.exports = mongoose.model('Message', MessageSchema);