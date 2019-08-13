var mongoose = require('mongoose');

var DeviceTypeSchema = new mongoose.Schema({
  deviceType: String,
  range : {},
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
});


module.exports = mongoose.model('DeviceType', DeviceTypeSchema);
