const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaint_id: { type: String, required: true, unique: true },
  reporter_id: { type: String, required: true },
  reporter_name: { type: String, required: true },
  reporter_role: { type: String, required: true, enum: ['student', 'faculty'] },
  building: { type: String, required: true },
  block: { type: String, default: '' },
  floor: { type: String, required: true },
  room_number: { type: String, required: true },
  room_type: { type: String, required: true },
  department: { type: String, default: 'General' },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String, default: null },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Emergency'] },
  status: {
    type: String,
    required: true,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Submitted'
  },
  assigned_staff: { type: String, default: null },
  assigned_staff_phone: { type: String, default: null },
  internal_notes: { type: String, default: null },
  resolution_remarks: { type: String, default: null },
  created_date: { type: Date, default: Date.now },
  updated_date: { type: Date, default: Date.now },
  target_date: { type: Date, default: null },
  resolved_date: { type: Date, default: null }
});

module.exports = mongoose.model('Complaint', complaintSchema);
