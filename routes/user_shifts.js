var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User_shift = require('../models/User_shift.js');
var Device = require('../models/Device.js');
var jwt = require('jsonwebtoken');
var config = require('../config/database');
/* GET ALL ALLOCATED SHIFTS */
router.get('/all_allotted_shifts', function(req, res, next) {
  User_shift.find(function (error, results) {
    if (error) {
      return res.status(404).json({ status: false, message: 'Record not found.' });
    }else{ console.log(results)
          return res.status(200).json({ status: true, list : results });
     
    }
  });
});

/* GET SINGLE ALLOCATED SHIFTS BY ID */
router.get('/get_allotted_shift_byid/:allottedId', function(req, res, next) {
  User_shift.findById(req.params.allottedId, function (err, results) {
    if (err) {
      return res.status(404).json({ status: false, message: 'Record not found.' });
    }else{
      return res.status(200).json({ status: true, list : results });
    }  
    
  });
});

/* SAVE SHIFT */
router.post('/add_allotted_shift', function(req, res, next) {
  if (!req.body.usUserId ||  !req.body.usShiftId || !req.body.startDate ||  !req.body.endDate || !req.body.usDeviceId) {
    res.json({status: false, message: 'Please fill all required field.'});
  } else {
    var newUser_shift = new User_shift({
      usUserId:req.body.usUserId,
      usShiftId:req.body.usShiftId,
      startDate:req.body.startDate,
	  endDate:req.body.endDate,
	  usDeviceId:req.body.usDeviceId
  	});
   
    newUser_shift.save(function(err) {
      if (err) {
        return res.json({
          status:false,
          message:'There are some error with query.'
        });
      }
      res.json({
        status:true,
        message:'Shift Allotted sucessfully'
      });
    });
  }
});

/* UPDATE SHIFT */
router.put('/update_allotted_shift/:allottedId', function(req, res, next) {
if (!req.body.usUserId ||  !req.body.usShiftId || !req.body.startDate || !req.body.endDate || !req.body.usDeviceId) {
    	res.json({status: false, message: 'Please fill all required field.'});
  } else {
	  var user_shiftData = {
		usUserId: req.body.usUserId,
		usShiftId: req.body.usShiftId,
		startDate: req.body.startDate,
		endDate: req.body.endDate,
		usDeviceId: req.body.usDeviceId
	  }
	  User_shift.findByIdAndUpdate(req.params.allottedId, user_shiftData, function (err, results) {
		if (err){
		  res.json({
			status:false,
			message:'There are some error with query.'
		})
		} else{
		  res.json({
			  status:true,
			  data:results,
			  message:'Allocated Shift updated sucessfully.'
		  })
		}
	  });
  }
});

/* DELETE SHIFT */
router.delete('/delete_allotted_shift/:allottedId', function(req, res, next) {
  User_shift.findByIdAndRemove(req.params.allottedId, req.body, function (err, results) {
    if (err){
      return res.status(404).json({ status: false, message: 'Allocated Shift record not found.' });
    } else{
      return res.status(200).json({ status: true, user : results });
    }
  });
});

module.exports = router;