var mongoose = require('mongoose');

var AssignDeviceSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.ObjectId, ref: 'User' },
  deviceId: {type: mongoose.Schema.ObjectId, ref: 'DeviceType' },
  deviceName: String,
  mdeviceId: String,
  mfKey: String,
  mfChannelId : String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
});


module.exports = mongoose.model('AssignDevice', AssignDeviceSchema);
