const express = require('express');
const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send a message
router.post('/', auth, async (req, res) => {
    try {
        const { complaintId, receiverId, content, messageType = 'text', fileUrl } = req.body;

        // Verify complaint exists and user has access
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user has permission to send message for this complaint
        if (req.user.role === 'customer' && complaint.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.user.role === 'agent' && complaint.assignedAgent && complaint.assignedAgent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const message = new Message({
            complaint: complaintId,
            sender: req.user._id,
            receiver: receiverId,
            content,
            messageType,
            fileUrl
        });

        await message.save();

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .populate('complaint', 'title');

        res.status(201).json({
            message: 'Message sent successfully',
            data: populatedMessage
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get messages for a specific complaint
router.get('/complaint/:complaintId', auth, async (req, res) => {
    try {
        const { complaintId } = req.params;

        // Verify complaint exists and user has access
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user has permission to view messages for this complaint
        if (req.user.role === 'customer' && complaint.customer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.user.role === 'agent' && complaint.assignedAgent && complaint.assignedAgent.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const messages = await Message.find({ complaint: complaintId })
            .populate('sender', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Only the receiver can mark message as read
        if (message.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        message.isRead = true;
        message.readAt = Date.now();
        await message.save();

        res.json({
            message: 'Message marked as read',
            data: message
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get unread message count for user
router.get('/unread/count', auth, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
            isRead: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all messages for current user (inbox)
router.get('/inbox', auth, async (req, res) => {
    try {
        const messages = await Message.find({ receiver: req.user._id })
            .populate('sender', 'name email')
            .populate('complaint', 'title')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 