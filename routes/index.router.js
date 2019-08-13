const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/adduser', ctrlUser.adduser);
router.post('/login', ctrlUser.authenticate);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);
router.get('/alluser', ctrlUser.alluser);
router.delete('/user/:userId', ctrlUser.deleteuser);
router.get('/edituser/:userId', ctrlUser.getuserbyid);
router.put('/updateuser/:userId', ctrlUser.updateuser);
module.exports = router;