const express = require('express');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require admin role
router.use(auth, authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all agents
router.get('/agents', async (req, res) => {
    try {
        const agents = await User.find({ role: 'agent' }).select('-password').sort({ createdAt: -1 });
        res.json(agents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all customers
router.get('/customers', async (req, res) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, role, phone, address, isActive } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role, phone, address, isActive },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'customer' });
        const totalAgents = await User.countDocuments({ role: 'agent' });
        const totalComplaints = await Complaint.countDocuments();
        const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
        const assignedComplaints = await Complaint.countDocuments({ status: 'assigned' });
        const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
        const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });

        // Get recent complaints
        const recentComplaints = await Complaint.find()
            .populate('customer', 'name email')
            .populate('assignedAgent', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get complaints by category
        const complaintsByCategory = await Complaint.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get complaints by status
        const complaintsByStatus = await Complaint.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            statistics: {
                totalUsers,
                totalCustomers,
                totalAgents,
                totalComplaints,
                pendingComplaints,
                assignedComplaints,
                inProgressComplaints,
                resolvedComplaints
            },
            recentComplaints,
            complaintsByCategory,
            complaintsByStatus
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get unassigned complaints
router.get('/complaints/unassigned', async (req, res) => {
    try {
        const complaints = await Complaint.find({ 
            status: 'pending',
            assignedAgent: { $exists: false }
        })
        .populate('customer', 'name email')
        .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Bulk assign complaints to agents
router.post('/complaints/bulk-assign', async (req, res) => {
    try {
        const { complaintIds, agentId } = req.body;

        const agent = await User.findById(agentId);
        if (!agent || agent.role !== 'agent') {
            return res.status(400).json({ message: 'Invalid agent ID' });
        }

        const result = await Complaint.updateMany(
            { _id: { $in: complaintIds } },
            {
                assignedAgent: agentId,
                assignedBy: req.user._id,
                assignedAt: Date.now(),
                status: 'assigned'
            }
        );

        res.json({
            message: `${result.modifiedCount} complaints assigned successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router; 