const mongoose = require('mongoose');

const complaintHistorySchema = new mongoose.Schema({
  complaint_id: { type: String, required: true },
  previous_status: { type: String, default: null },
  new_status: { type: String, required: true },
  updated_by: { type: String, required: true },
  remarks: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ComplaintHistory', complaintHistorySchema);
