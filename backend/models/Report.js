const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    fileAName: String,
    fileBName: String,
    totalRecords: Number,
    matchedCount: Number,
    mismatchCount: Number,
    unmatchedACount: Number,
    unmatchedBCount: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
