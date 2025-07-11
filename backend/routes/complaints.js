const express = require('express');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Create new complaint (Customer only)
router.post('/', auth, authorize('customer'), async (req, res) => {
    try {
        const { title, description, category, priority } = req.body;
        
        const complaint = new Complaint({
            title,
            description,
            category,
            priority,
            customer: req.user._id
        });

        await complaint.save();
        
        const populatedComplaint = await Complaint.findById(complaint._id)
            .populate('customer', 'name email')
            .populate('assignedAgent', 'name email');

        res.status(201).json({
            message: 'Complaint created successfully',
            complaint: populatedComplaint
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all complaints (with role-based filtering)
router.get('/', auth, async (req, res) => {
    try {
        let query = {};
        
        // Customers can only see their own complaints
        if (req.user.role === 'customer') {
            query.customer = req.user._id;
        }
        
        // Agents can see complaints assigned to them
        if (req.user.role === 'agent') {
            query.assignedAgent = req.user._id;
        }
        
        // Admins can see all complaints
        // No additional query filter needed for admin

        const complaints = await Complaint.find(query)
            .populate('customer', 'name email')
            .populate('assignedAgent', 'name email')
            .populate('assignedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single complaint by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('customer', 'name email')
            .populate('assignedAgent', 'name email')
            .populate('assignedBy', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if user has permission to view this complaint
        if (req.user.role === 'customer' && complaint.customer._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (req.user.role === 'agent' && complaint.assignedAgent && complaint.assignedAgent._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update complaint status (Agent and Admin only)
router.patch('/:id/status', auth, authorize('agent', 'admin'), async (req, res) => {
    try {
        const { status, resolution } = req.body;
        
        const updateData = { status };
        if (status === 'resolved') {
            updateData.resolvedAt = Date.now();
            updateData.resolution = resolution;
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('customer', 'name email')
         .populate('assignedAgent', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Check if agent has permission to update this complaint
        if (req.user.role === 'agent' && complaint.assignedAgent && complaint.assignedAgent._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({
            message: 'Complaint status updated successfully',
            complaint
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Assign complaint to agent (Admin only)
router.patch('/:id/assign', auth, authorize('admin'), async (req, res) => {
    try {
        const { assignedAgent } = req.body;
        
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            {
                assignedAgent,
                assignedBy: req.user._id,
                assignedAt: Date.now(),
                status: 'assigned'
            },
            { new: true, runValidators: true }
        ).populate('customer', 'name email')
         .populate('assignedAgent', 'name email')
         .populate('assignedBy', 'name email');

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json({
            message: 'Complaint assigned successfully',
            complaint
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete complaint (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        res.json({ message: 'Complaint deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 