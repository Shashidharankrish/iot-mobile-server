var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var DeviceSchema = new mongoose.Schema({
  deviceName: String,
  mfKey: String,
  mfDeviceId: String,
  mfChannelId: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
});


module.exports = mongoose.model('Device', DeviceSchema);
