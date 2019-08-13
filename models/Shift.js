var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var ShiftSchema = new mongoose.Schema({
  shiftName: String,
  fromTime: String,
  toTime: String,
  status: { type: String, default: 'active' }
});

module.exports = mongoose.model('Shift', ShiftSchema);