require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const Report = require('./models/Report');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// 1. Auth / Login (Mocked logic but real DB)
app.post('/api/login', async (req, res) => {
    try {
        const { email } = req.body;
        let user = await User.findOne({ email });

        // Auto-signup for demo
        if (!user) {
            user = new User({
                name: email.split('@')[0],
                email
            });
            await user.save();
        }

        // Convert _id to string for consistency with frontend types
        res.json({ id: user._id.toString(), name: user.name, email: user.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Reports
app.get('/api/reports', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'UserId is required' });
        }

        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        // Transform _id to id
        const formatted = reports.map(r => ({
            id: r._id.toString(),
            date: r.date,
            fileAName: r.fileAName,
            fileBName: r.fileBName,
            totalRecords: r.totalRecords,
            matchedCount: r.matchedCount,
            matchedCountPercentage: r.totalRecords ? ((r.matchedCount * 2) / r.totalRecords) * 100 : 0, // Added for convenience if needed
            mismatchCount: r.mismatchCount,
            unmatchedACount: r.unmatchedACount,
            unmatchedBCount: r.unmatchedBCount
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const reportData = req.body;

        // Basic validation
        if (!reportData.userId) {
            return res.status(400).json({ error: 'UserId is required to save a report' });
        }

        const newReport = new Report(reportData);
        await newReport.save();

        res.status(201).json({
            id: newReport._id.toString(),
            ...reportData
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Smart Reconciliator API is running');
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}
module.exports = app;
