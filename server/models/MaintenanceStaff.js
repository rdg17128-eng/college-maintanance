const mongoose = require('mongoose');

const maintenanceStaffSchema = new mongoose.Schema({
  staff_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  status: { type: String, default: 'Available' }
});

module.exports = mongoose.model('MaintenanceStaff', maintenanceStaffSchema);

