var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
//var User = require('../models/User.js');
var Device = require('../models/Device.js');
var DeviceType = require('../models/DeviceType.js');
var AssignDevice = require('../models/AssignDevice.js');
var Parameters = require('../models/Parameters.js');
//var User_role = require('../models/User_role.js');
//var jwt = require('jsonwebtoken');
var config = require('../config/database');
//var check_auth_status = 1;
const request = require('request');
const mainFluxUrl = config.mainFluxUrl;
const mainFluxUrl_new = config.mainFluxUrl_new;



/* ADD DEVICE */
router.post('/assigndevice', function(req, res, next) {

	let mainFluxtoken = req.headers['mftoken'];
	if(!mainFluxtoken )
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
	
	var devicename 		= req.body.deviceName.split("-");
	var device_info 	= {'name': devicename[0], 'type':'device'};
	var channel_info 	= {'name': devicename[0]};
	
	var addchannel = function(){		
		return new Promise(function(resolve, reject) {
			request.post({
						url:mainFluxUrl+'channels', 
						json: channel_info, 
						headers:{"Authorization": mainFluxtoken}
					}, 
					function(err,httpResponse,body){				
					 if (err) {
							return reject(err);
					  } else {
						resolve(httpResponse);
					  }
					});			
		});
	}
	
	var adddevice = function (){
		return new Promise(function(resolve, reject) {
			request.post({
						url:mainFluxUrl+'things', 
						json: device_info, 
						headers:{"Authorization": mainFluxtoken}
					}, 
					function(err,httpResponse,body){				
					 if (err) {
							return reject(err);
					  } else {
						resolve(httpResponse);
					  }
					});			
		});
	}
	
	var mapDevice = function(mfChannelId, mfDeviceId){		
		return new Promise(function(resolve, reject) {
			request.put({
						url:mainFluxUrl+'channels/'+mfChannelId+'/things/'+mfDeviceId, 
						json: {}, 
						headers:{"Authorization": mainFluxtoken}
						}, 
					function(err,httpResponse,body){				
					 if (err) {
							return reject(err);
					  } else {
						resolve(httpResponse);
					  }
					});			
		});
	}
	
	var getdevice = function(mfDeviceId){
		return new Promise(function(resolve, reject) {
			request.get({
						url:mainFluxUrl+'things/'+mfDeviceId, 
						json: {}, 
						headers:{"Authorization": mainFluxtoken}
					  },
					function(err,httpResponse,body){				
					 if (err) {
							return reject(err);
					  } else {
						resolve(body);
					  }
					});			
		});
	}
	
	Promise.all([adddevice(), addchannel()]).then(values => {
		let mfDeviceId	=  values[0].headers.location.split('/')[2];
		let mfChannelId =  values[1].headers.location.split('/')[2];
		
		mapDevice(mfChannelId, mfDeviceId).then(result => {			
				return getdevice(mfDeviceId);				
			}).then(result => {
					let rmfKey = result.key;
					let assigndevice = new AssignDevice({deviceName: devicename[0], deviceId: devicename[1], userId: req.body.users, mdeviceId: mfDeviceId, mfKey: rmfKey, mfChannelId: mfChannelId});
					assigndevice.save().then( results => {			
						res.status(200).json({'mesage': 'Device added successfully'});
					}).catch(err => {
						res.status(400).send("unable to save to database");
					});
			}).catch(err => {
				res.status(400).send("unable to save to database");
			});
	}).catch(err => { 
		res.status(400).json({ error: err });
	});
	
	
	
	// adddevice().then(result => {
		// let mfDeviceId   = result.headers.location.split('/')[2];
		
		// let assigndevice = new AssignDevice({deviceName: devicename[0], deviceId: devicename[1], userId: req.body.users, mdeviceId: mfDeviceId });
		// assigndevice.save().then( results => {			
			// res.status(200).json({'mesage': 'Device added successfully'});
		// }).catch(err => {
			// res.status(400).send("unable to save to database");
		// });
	// },
	// err => {
		 // res.status(400).json({ error: err });
	// });	
	
});

/* GET PARAMETERS LIST */
router.get('/parameters', function(req, res, next){	
	Parameters.find({}).exec(function (error, results){
		if(error)
			return res.status(400).json({status: false, message: 'Record not found.'});
		
		return res.status(200).json({status: true, list : results});
	});	
});


router.post('/', async function(req, res, next) {
	let mainFluxtocken = req.headers['mftoken'];
	//let auth_uid = req.headers['auth-uid'];
	if(!mainFluxtocken )
		return res.status(401).json({ status: false, message: 'Unauthorized Request.' });
		const device_count = await Device.find({'deviceName':req.body.deviceName, 'status': {$ne: 'in_active'}}).count();
		if(device_count > 0)
			return res.json({status: false, message: 'Already exists this device name.'});
		
		var device_info = {'name': req.body.deviceName, 'type':'device'};
		request.post({url:mainFluxUrl+'things', json: device_info, headers:{"Authorization": mainFluxtocken}}, 
		function(err,httpResponse,body){
			if (err == null && httpResponse.statusCode == 201){				
				let mfDeviceId = httpResponse.headers.location.split('/')[2];
				
				var channel_info = {'name': req.body.deviceName};
				request.post({url:mainFluxUrl+'channels', json: channel_info, headers:{"Authorization": mainFluxtocken}}, 
				function(err2,httpResponse2,body2){					
					if (err2 == null && httpResponse2.statusCode == 201){						
						let mfChannelId = httpResponse2.headers.location.split('/')[2];
						
						request.put({url:mainFluxUrl+'channels/'+mfChannelId+'/things/', json: {}, headers:{"Authorization": mainFluxtocken}}, 
						function(err3,httpResponse3,body3){							
							if(err3 == null && httpResponse3.statusCode == 200){								
								request.get({url:mainFluxUrl+'things/'+mfDeviceId, json: {}, headers:{"Authorization": mainFluxtocken}}, 
								function(err4,httpResponse4,body4){									
									if (err4 == null && httpResponse4.statusCode == 200){
										
										let mfKey = body4.key;
										var device = new Device({deviceName: req.body.deviceName,  mfKey: mfKey, mfDeviceId: mfDeviceId, mfChannelId: mfChannelId});
										device.save(function(err) {
											if(err)
												return res.json({status:false, message:err});
										
											return res.json({status:true, message:'Device added sucessfully.'});
										});
									}
								});
							}else{
							}
						});
					}
				});
			}else{
				return res.json({status:false, message:err});
			}
		})
	
});


/* GET ALL DEVICES TYPE*/
router.get('/type', function(req, res, next){
	let mainFluxtocken = req.headers['mftoken'];
	if(!mainFluxtocken )
		return res.status(401).json({status: false, message: 'Unauthorized Request.'});
	
	DeviceType.find({status:'active'}).exec(function (error, results){
		if(error)
			return res.status(404).json({status: false, message: 'Record not found.'});
		
		return res.status(200).json({status: true, devicetypelist : results});
	});
	
});


/* GET ALL DEVICES */
router.get('/', function(req, res, next){
	let mainFluxtocken = req.headers['mftoken'];
	if(!mainFluxtocken )
		return res.status(401).json({status: false, message: 'Unauthorized Request.'});
	
	Device.find({status:'active'}).exec(function (error, results){
		if(error)
			return res.status(404).json({status: false, message: 'Record not found.'});
		
		return res.status(200).json({status: true, devicelist : results});
	});
	
});


/* GET Single DEVICE */
router.get('/:deviceid', function(req, res, next){
	//let mainFluxtocken = req.headers['mftoken'];
	//if(!mainFluxtocken )
	//	return res.status(401).json({status: false, message: 'Unauthorized Request.'});
		
		Device.findById(req.params.deviceid, function (err, results) {
			if(err)
				return res.status(400).json({status: false, message: 'Device not found.'});
			
			return res.status(200).json({ status: true, row : results });      
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
		const device_count = await Device.find({'deviceName': req.body.name, 'mfDeviceId': {$ne: req.params.mfDeviceId}, 'status': {$ne: 'in_active'}}).count();		
		if(device_count > 0)
			return res.json({status: false, message: 'Already exists this device name.'});
		
		return res.json({status: true, message: 'Device name available.'});
	}
});

/* ADD DEVICE Type*/
router.post('/type', async function(req, res, next) {
	//let auth_uid = req.headers['auth-uid'];
	//if(!auth_uid && check_auth_status == 1)
	//	return res.status(401).json({ status: false, message: 'Unauthorized Request.' });	
			
	const devicetypeCount = await DeviceType.find({'deviceType':req.body.deviceType, 'status': {$ne: 'in_active'}}).count();
	if(devicetypeCount > 0)
		return res.status(401).json({status: false, message: 'Already exists this device type.'});
		
	var deviceType = new DeviceType({deviceType: req.body.deviceType, range: req.body.range});
	
	deviceType.save().then( results => {
		res.status(200).json({'mesage': 'Device type added successfully'});
	}).catch(err => {
		res.status(400).send("unable to save to database");
	});
	
});



module.exports = router;