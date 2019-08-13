const path = require('path');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/User.js');
var AssignDevice = require('../models/AssignDevice.js');
var Device = require('../models/Device.js');
//var Shift = require('../models/Shift.js');
//var User_shift = require('../models/User_shift.js');
//var User_role = require('../models/User_role.js');
//var Page = require('../models/Page.js');
var jwt = require('jsonwebtoken');
var config = require('../config/database');
var bcrypt = require('bcrypt-nodejs');
var check_auth_status = 1;

const request = require('request');
const mainFluxUrl = config.mainFluxUrl;
const mainFluxUrl_new = config.mainFluxUrl_new;
//var mainFluxtocken = '';

/* LOGIN */
router.post('/login',function(req, res, next){
	User.findOne({email: req.body.email}).exec(function (err, user) {  
		if (err) {
		  res.status(404).json(err);
		  return;
		}		
		if (!user) {
			res.status(401).json({status:false, message:'Authentication failed. User not found.'});
		} else {
			user.comparePassword(req.body.password, function (err, isMatch) {
				if (isMatch && !err) {
					var token = jwt.sign(user.toJSON(), config.secret);
					request.post({url:mainFluxUrl+"tokens", json: {"email":"vishwajits@faststreamtech.com", "password":"vishu"}, headers:{}}, 
					async function(err,httpResponse,body){
						mainFluxtocken = body.token;
						global.mainFluxtocken = body.token;
						return res.status(200).json({status: true, mftoken: mainFluxtocken, token: token, message:'Successfully authenticated'});
					});				
				} else {
					return res.status(401).json({status:false, message:'Authentication failed. Wrong password.'});
				}
			});
		}
	});
});


/* ADD NEW USER */
router.post('/', async function(req, res, next) {
	//let auth_uid = req.headers['auth-uid'];
	//if(!auth_uid && check_auth_status == 1)
	//	return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	//User.find({'_id':auth_uid}).populate('role').exec(async function (error2, results2){
		//console.log(req.body.firstName, req.body.lastName,req.body.email,req.body.password)			
		if (!req.body.firstName ||  !req.body.lastName || !req.body.email || !req.body.password)
			return res.status(400).json({status: false, message: 'Please fill all required field.'});
			
		const users_count = await User.find({'email':req.body.email}).count();
		if(users_count > 0){				
			return res.status(400).json({status: false, message: 'A user is already exists with this email address.'});
		}
		
		var newUser = new User({first_name: req.body.firstName, last_name: req.body.lastName, email: req.body.email, password: req.body.password});
		newUser.save(function(err){
			if(err) 
				return res.status(400).json({status:false, message:'There are some error with query.'});
			
			return res.status(200).json({message:'User registered sucessfully.'});
		});		
	//});
});
	

/* CHANGE PASSWORD */
router.put('/change_pass/:userId',  function(req, res, next){
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid || (auth_uid != req.params.userId))
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
		
	if (!req.body.current_password ||  !req.body.new_password) 
		return res.json({status: false, message: 'Please fill all required field.'});
	
	var password;		
	User.findOne({'_id': req.params.userId}).exec(function (err, user){  
		user.comparePassword(req.body.current_password, async function (err, isMatch) {
			if(!isMatch || err)
				return res.json({status:false, message:'Current password is wrong.'});				
			
			await bcrypt.genSalt(10, function (err, salt) {
				if(err) return next(err);
				
				bcrypt.hash(req.body.new_password, salt, null, function (err, hash) {
					if(err) return next(err);
					password = hash;				
				});
			});
			
			var userData = {password:password }
			User.findByIdAndUpdate(req.params.userId, userData, function (err, results) {
				return res.json({status: true, message:'Password successfully updated'});
			});			
		});
	});
});	

/* DASHBOARD */
router.get('/dash_board', async function(req, res, next) {   
	const users_count = await User.find().count();
   	const devices_count = await Device.find().count();
	const shifts_count = await Shift.find().count();
	const user_shift_count = await User_shift.find().count();

	return res.status(200).json({ status: true, userCount : users_count, deviceCount : devices_count, shiftCount:shifts_count, userShiftCount:user_shift_count });
});

/* GET ALL USERS */
router.get('/', function(req, res, next) {
	//let auth_uid = req.headers['auth-uid'];
	//if(!auth_uid && check_auth_status == 1)
	//	return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	//User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
	//	if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.usersCtrl.list != 1) && check_auth_status == 1)
	//		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });

		User.find({status:'active'}).exec(function (error, results) {
			if (error) 
				return res.status(404).json({ status: false, message: 'User record not found.' });
			
			return res.status(200).json(results);    
		});			
	//});	
});

/* GET SINGLE USER BY ID */
router.get('/:userId', function(req, res, next) {
	//let auth_uid = req.headers['auth-uid'];
	//if(!auth_uid && check_auth_status == 1)
	//	return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	// User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
		// if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.usersCtrl.edit != 1) && check_auth_status == 1)
			// return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
		
		User.findById(req.params.userId, function (err, results) {
			if (err)
				return res.status(404).json({ status: false, message: 'User record not found.' });
			return res.status(200).json(results);			  
		});		
	//});
});


/* DELETE USER */
router.delete('/:userId', function(req, res, next) {
	// let auth_uid = req.headers['auth-uid'];
	// if(!auth_uid && check_auth_status == 1)
		// return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	// User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
		// if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.usersCtrl.delete != 1) && check_auth_status == 1)
			// return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
			
		//User.findByIdAndRemove(req.params.userId, req.body, function (err, results) {
		User.findByIdAndUpdate(req.params.userId, {status:'in_active'}, function (err, results) {	
			if(err)
				return res.status(404).json(err);				
			return res.status(200).json({ status: true, user : results });				
		});
	//});
});					

/* UPDATE USER */
router.put('/:userId', function(req, res, next) {
	// let auth_uid = req.headers['auth-uid'];
	// if(!auth_uid && check_auth_status == 1)
		// return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	// User.find({'_id':auth_uid}).populate('role').exec(async function (error2, results2){
		// if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.usersCtrl.edit != 1) && check_auth_status == 1)
			// return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
		
		if (!req.body.firstName ||  !req.body.lastName) 
			return res.status(400).json({ message: 'Please fill all required field.'});
			
		/*const users_count = await User.find({'email':req.body.email, '_id': {$ne: req.params.userId}}).count();
		if(users_count > 0)
			return res.json({status: false, message: 'Already exists for this email address.'});*/
		
		var userData = {first_name: req.body.firstName, last_name: req.body.lastName}
		User.findByIdAndUpdate(req.params.userId, userData, function (err, results) {
			if(err)
				return res.status(400).json(err);			
			return res.status(200).json(results);		
		});
	//});
});	


/* ACTIVATE USER */
router.put('/activate_user/:userId', function(req, res, next) {
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	User.find({'_id':auth_uid}).populate('role').exec(async function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.usersCtrl.edit != 1) && check_auth_status == 1)
			return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
		
		if (!req.body.status) 
			return res.json({status: false, message: 'Please fill all required field.'});
						
		var userData = {status: 'active'}
		User.findByIdAndUpdate(req.params.userId, userData, function (err, results) {
			if(err)
				return res.json({status:false, message:'There are some error with query.'});
			
			return res.json({status:true, data:results, message:'User activated sucessfully.'});		
		});
	});
});




/* UPDATE ALLOCATED SHIFT */
router.put('/update_allotted_shift/:allottedId', function(req, res, next) {
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });	
	
	User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.allocatedShiftCtrl.edit != 1) && check_auth_status == 1)
			return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
			
		if(!req.body.usUserId ||  !req.body.usShiftId || !req.body.startDate || !req.body.endDate || !req.body.usDeviceId)
			return res.json({status: false, message: 'Please fill all required field.'});
																
		var user_shiftData = {usUserId: req.body.usUserId, usShiftId: req.body.usShiftId, startDate: req.body.startDate, endDate: req.body.endDate, usDeviceId: req.body.usDeviceId}
		
		User_shift.findByIdAndUpdate(req.params.allottedId, user_shiftData, function (err, results) {
			if(err)
				return res.json({status:false, message:'There are some error with query.'});
			
			return res.json({status:true, data:results, message:'Allocated Shift updated sucessfully.'});
		});	
	});	
});

/* DELETE ALLOCATED SHIFT */
router.delete('/delete_allotted_shift/:allottedId', function(req, res, next){
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.allocatedShiftCtrl.delete != 1) && check_auth_status == 1)
			return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
			
		//User_shift.findByIdAndRemove(req.params.allottedId, req.body, function(err, results){
		User_shift.findByIdAndUpdate(req.params.allottedId, {status:'in_active'}, function (err, results) {
			if(err)
				return res.status(404).json({ status: false, message: 'Allocated Shift record not found.' });
			
			return res.status(200).json({ status: true, user : results });
		});
	});
});

/* GET ALL DEVIDES */
router.get('/all_devices', function(req, res, next){
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({status: false, message: 'Unauthorized Request.'});
	
	User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.devicesCtrl.list != 1) && check_auth_status == 1)
			return res.status(401).json({status: false, message: 'Unauthorized Request.'});

		Device.find({status:'active'}).exec(function (error, results){
			if(error)
				return res.status(404).json({status: false, message: 'Record not found.'});
			
			return res.status(200).json({status: true, list : results});
		});
	});
});

/* ADD DEVICE */
router.post('/adddevice-old', function(req, res, next) {
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	User.find({'_id':auth_uid}).populate('role').exec(async function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.devicesCtrl.add != 1) && check_auth_status == 1)
			return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
			
		const device_count = await Device.find({'deviceName':req.body.deviceName, 'status': {$ne: 'in_active'}}).count();
		if(device_count > 0)
			return res.json({status: false, message: 'Already exists this device name.'});
			
		var device = new Device({deviceName: req.body.deviceName, deviceLocation: req.body.deviceLocation, mfKey: req.body.mfKey, mfDeviceId: req.body.mfDeviceId,
								mfChannelId: req.body.mfChannelId});
		device.save(function(err) {
			if(err)
				return res.json({status:false, message:'There are some error with query.'});
		
			return res.json({status:true, message:'Device added sucessfully.'});
		});
	});
});

/* UPDATE DEVICE */
router.put('/update_device/:mfDeviceId', function(req, res, next) {
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });	
	
	User.find({'_id':auth_uid}).populate('role').exec(async function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.devicesCtrl.edit != 1) && check_auth_status == 1)
			return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
			
		if(!req.body.name)
			return res.json({status: false, message: 'Please fill all required field.'});
			
		const device_count = await Device.find({'deviceName':req.body.name, 'mfDeviceId': {$ne: req.params.mfDeviceId}, 'status': {$ne: 'in_active'}}).count();		
		if(device_count > 0)
			return res.json({status: false, message: 'Already exists this device name.'});
				
		Device.updateOne({mfDeviceId: req.params.mfDeviceId}, {$set: {deviceName: req.body.name}}, function (err, results) {
			if(err)
				return res.json({status:false, message:'There are some error with query.'});
			
			return res.json({status:true, data:results, message:'Device updated sucessfully.'});
		});	
	});	
});

/* DELETE DEVICE */
router.delete('/delete_device/:mfDeviceId', function(req, res, next){
	let auth_uid = req.headers['auth-uid'];
	if(!auth_uid && check_auth_status == 1)
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	User.find({'_id':auth_uid}).populate('role').exec(function (error2, results2){
		if ((error2 || !results2[0] || results2[0].role.privilegeCtrl.devicesCtrl.delete != 1) && check_auth_status == 1)
			return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
			
		//Device.deleteOne({mfDeviceId: req.params.mfDeviceId}, function(err, results){
		Device.updateOne({mfDeviceId: req.params.mfDeviceId}, {$set: {status: 'in_active'}}, async function(err, results){			
			if(err)
				return res.status(404).json({ status: false, message: 'Device record not found.' });
			
			const userShiftInfo = await Device.findOne({mfDeviceId: req.params.mfDeviceId});
			User_shift.updateMany({usDeviceId: userShiftInfo._id}, {$set: {status: 'in_active'}}, function (err3, results3){
				if(err3)
					return res.status(404).json({ status: false, message: err3});
				
				return res.status(200).json({ status: true, user : results });	
			});			
		});
	});
});

/* CHECK DEVICE STATUS */
router.put('/check_device_status', async function(req, res, next) {
	if(!req.body.deviceId || !req.body.deviceName)
		return res.json({status: false, message: 'Please fill all required field.'});
	
	if(req.body.deviceId == "1"){
		const device_count = await Device.find({'deviceName':req.body.deviceName, 'status': {$ne: 'in_active'}}).count();
		if(device_count > 0)
			return res.json({status: false, message: 'Already exists this device name.'});
			
		return res.json({status: true, message: 'Device name available.'});
	}else{
		const device_count = await Device.find({'deviceName':req.body.name, 'mfDeviceId': {$ne: req.params.mfDeviceId}, 'status': {$ne: 'in_active'}}).count();		
		if(device_count > 0)
			return res.json({status: false, message: 'Already exists this device name.'});
		
		return res.json({status: true, message: 'Device name available.'});
	}
});


/* Assign Device Type */
router.post('/assigndevice', function(req, res, next) {				
	
	var assigndevice = new AssignDevice({deviceId: req.body.deviceType, userId: req.body.users});
		assigndevice.save().then( results => {
			res.status(200).json({'mesage': 'Device type added successfully'});
		}).catch(err => {
			res.status(400).send("unable to save to database");
		});
	
});

module.exports = router;