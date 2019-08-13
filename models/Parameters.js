var mongoose = require('mongoose');

var ParametersSchema = new mongoose.Schema({
  Name: String,
  Key: String
});

module.exports = mongoose.model('Parameters', ParametersSchema);