var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var LocationSchema = new mongoose.Schema({
  locationName: String,
  parent_id:{type: String, default: 0},
  status: { type: String, default: 'active' },
  range: { type: {} }
});

module.exports = mongoose.model('Location', LocationSchema);