var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var PageSchema = new mongoose.Schema({
  pageName: String,
  ctrlName: String,
  actionCtrl: {type: Object},  
});


module.exports = mongoose.model('Page', PageSchema);
