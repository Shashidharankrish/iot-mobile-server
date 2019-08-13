const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport'); 
const mongoose = require('mongoose');
var users = require('./routes/users');
var devices = require('./routes/devices');
var shifts = require('./routes/shifts');
var user_shifts = require('./routes/user_shifts');
var app = express();
//app.use(express.static(__dirname + '/public'));

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://taurej:taurej786@ds147446.mlab.com:47446/iotmobileapp', {useNewUrlParser: true})
  .then(() =>  console.log('connection successful')).catch((err) => console.error(err));
// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
//app.use(passport.initialize());
app.use('/users', users);
app.use('/device', devices);

// start server
app.listen(3000, () => console.log(`Server started at port : 3000`));