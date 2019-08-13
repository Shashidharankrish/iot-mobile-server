var mongoose = require('mongoose');
var User_roleSchema = new mongoose.Schema({
  roleName: { type: String },
  roleConstId: { type: String },
  privilegeCtrl: { type: Object}
});

module.exports = mongoose.model('User_role', User_roleSchema);