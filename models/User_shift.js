var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var User_shiftSchema = new mongoose.Schema({
  usUserId: {type: mongoose.Schema.ObjectId, ref: 'User' },
  usShiftId: {type: mongoose.Schema.ObjectId, ref: 'Shift' },
  usDeviceId: {type: mongoose.Schema.ObjectId, ref: 'Device' },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'active' }
});

module.exports = mongoose.model('User_shift', User_shiftSchema);