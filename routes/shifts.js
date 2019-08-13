var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Shift = require('../models/Shift.js');
var Device = require('../models/Device.js');
var jwt = require('jsonwebtoken');
var config = require('../config/database');
/* GET ALL SHIFTS */
router.get('/all_shifts', function(req, res, next) {
  Shift.find(function (error, results) {
    if (error) {
      return res.status(404).json({ status: false, message: 'Record not found.' });
    }else{ console.log(results)
          return res.status(200).json({ status: true, list : results });
     
    }
  });
});

/* GET SINGLE SHIFTS BY ID */
router.get('/get_shift_byid/:shiftId', function(req, res, next) {
  Shift.findById(req.params.shiftId, function (err, results) {
    if (err) {
      return res.status(404).json({ status: false, message: 'Record not found.' });
    }else{
      return res.status(200).json({ status: true, list : results });
    }  
    
  });
});

/* SAVE SHIFT */
router.post('/add_shift', function(req, res, next) {
  if (!req.body.shiftName ||  !req.body.fromTime || !req.body.toTime) {
    res.json({status: false, message: 'Please fill all required field.'});
  } else {
    var newShift = new Shift({
      shiftName:req.body.shiftName,
      fromTime:req.body.fromTime,
      toTime:req.body.toTime	  
  	});
   
    newShift.save(function(err) {
      if (err) {
        return res.json({
          status:false,
          message:'There are some error with query.'
        });
      }
      res.json({
        status:true,
        message:'Shift created sucessfully'
      });
    });
  }
});

/* UPDATE SHIFT */
router.put('/update_shift/:shiftId', function(req, res, next) {
if (!req.body.shiftName ||  !req.body.fromTime || !req.body.toTime) {
    	res.json({status: false, message: 'Please fill all required field.'});
  } else {
	  var shiftData = {
		shiftName: req.body.shiftName,
		fromTime: req.body.fromTime,
		toTime: req.body.toTime
	  }
	  Shift.findByIdAndUpdate(req.params.shiftId, shiftData, function (err, results) {
		if (err){
		  res.json({
			status:false,
			message:'There are some error with query.'
		})
		} else{
		  res.json({
			  status:true,
			  data:results,
			  message:'Shift updated sucessfully.'
		  })
		}
	  });
  }
});

/* DELETE SHIFT */
router.delete('/delete_shift/:shiftId', function(req, res, next) {
  Shift.findByIdAndRemove(req.params.shiftId, req.body, function (err, results) {
    if (err){
      return res.status(404).json({ status: false, message: 'Shift record not found.' });
    } else{
      return res.status(200).json({ status: true, user : results });
    }
  });
});

module.exports = router;