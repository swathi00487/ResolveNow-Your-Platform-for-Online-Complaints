const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    messageType: {
        type: String,
        enum: ['text', 'file', 'image'],
        default: 'text'
    },
    fileUrl: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
messageSchema.index({ complaint: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema); 