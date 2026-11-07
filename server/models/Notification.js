const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: {
    type: String,
    default: () => `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
  },
  user_id: { type: String, required: true },
  complaint_id: { type: String, default: null },
  title: { type: String, default: '' },
  message: { type: String, required: true },
  read_status: { type: Number, default: 0 },
  created_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);

