const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
var connection = require('./../config');
var config = {
    "secret": "some-secret-shit-goes-here",
    "refreshTokenSecret": "some-secret-refresh-token-shit",
    "port": 3000,
    "tokenLife": "2 days",
    "refreshTokenLife": 86400
};
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');

//const User = mongoose.model('User');

module.exports.register = (req, res, next) => { 
   
    var today = new Date();
    var encryptedString = cryptr.encrypt(req.body.password);
    var users=[
        req.body.fullName,
        req.body.email,
        encryptedString,
        today,
        today
    ];
    var sql = "INSERT INTO users (first_name, email, password,created_at, updated_at) VALUES (?,?,?,?,?)";
    connection.query(sql, users, function (error, results, fields) {
      if (error) {
        res.json({
            status:false,
            message:'there are some error with query'
        })
      }else{
          res.json({
            status:true,
            data:results,
            message:'User registered sucessfully'
        })
      }
    });
}

module.exports.adduser = (req, res, next) => {
  var today = new Date();
  var encryptedString = cryptr.encrypt(req.body.password);
  var roles = req.body.roles.join();
  var users=[
      req.body.firstName,
      req.body.lastName,
      roles,
      req.body.email,
      encryptedString,
      today,
      today
  ];
  var sql = "INSERT INTO users (first_name,last_name,role, email, password,created_at, updated_at) VALUES (?,?,?,?,?,?,?)";
  connection.query(sql, users, function (error, results, fields) {
    if (error) {
      res.json({
          status:false,
          message:'there are some error with query'
      })
    }else{
        res.json({
          status:true,
          data:results,
          message:'User registered sucessfully'
      })
    }
  });
}

module.exports.authenticate = (req, res, next) => { console.log('authenticate');
    var email=req.body.email;
    var password=req.body.password;
   
   
    connection.query('SELECT * FROM users WHERE email = ?',[email], function (error, results, fields) {
      if (error) {
          res.json({
            status:false,
            message:'there are some error with query'
            })
      }else{
       
        if(results.length >0){
         decryptedString = cryptr.decrypt(results[0].password);
            if(password==decryptedString){
                const token = jwt.sign({user_id:results[0].user_id}, config.secret)
                res.json({
                    status:true,
                    token:token,
                    message:'successfully authenticated'
                })
            }else{
                res.json({
                  status:false,
                  message:"Email and password does not match"
                 });
            }
          
        }
        else{
          res.json({
              status:false,    
            message:"Email does not exits"
          });
        }
      }
    });

}

module.exports.userProfile = (req, res, next) =>{    

    var sql =  "SELECT * FROM users where user_id=" +  req.user_id;
    connection.query(sql, function (error, results, fields) {
      if (error) {
        return res.status(404).json({ status: false, message: 'User record not found.' });
      }else{
            return res.status(200).json({ status: true, user : results[0] });
       
      }
    });
}

module.exports.getuserbyid = (req, res, next) =>{    
  let id = req.params.userId;
  var sql =  "SELECT * FROM users where user_id=" +  id;
  connection.query(sql, function (error, results, fields) {
    if (error) {
      return res.status(404).json({ status: false, message: 'User record not found.' });
    }else{
          return res.status(200).json({ status: true, user : results[0] });
     
    }
  });
}
module.exports.updateuser = (req, res, next) =>{   console.log('hellll') 
  let id = req.params.userId;
  var roles = req.body.roles.join();
  var users=[
      req.body.firstName,
      req.body.lastName,
      roles,
      req.body.email,
      id
  ];
  
  var sql = "update users set first_name = ?,last_name=?,role=?, email=? where user_id=?";
  connection.query(sql,users, function (error, results, fields) {
    if (error) {
      console.log(error)
      return res.status(404).json({ status: false, message: 'User record not updated.' });
    }else{
          return res.status(200).json({ status: true, user : results,message:'User updated successfully' });
     
    }
  });
}
module.exports.alluser = (req, res, next) =>{    

  var sql =  "SELECT * FROM users";
  connection.query(sql, function (error, results, fields) {
    if (error) {
      return res.status(404).json({ status: false, message: 'User record not found.' });
    }else{
          return res.status(200).json({ status: true, user : results });
     
    }
  });
}

module.exports.deleteuser = (req, res, next) =>{    

  connection.query('DELETE FROM `users` WHERE `user_id`=?', [ req.params.userId], function (error, results, fields) {
    if (error) {
      return res.status(404).json({ status: false, message: 'User record not found.' });
    }else{
          return res.status(200).json({ status: true, user : results });
     
    }
  });
}