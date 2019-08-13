// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://taurej:taurej786@ds139946.mlab.com:39946/iotplateform';
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;