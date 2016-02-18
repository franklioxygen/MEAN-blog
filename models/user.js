/*jslint node: true */
'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  email: String,
  regTimestamp: String,
  avatar: String,
  oauth: Boolean,
  oauthProvider: String,
  oauthID: String
}, {
  collection: 'users'
});

var UserModel = mongoose.model('User', userSchema);

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.avatar = user.avatar;
  this.oauth = user.oauth;
  this.oauthProvider = user.oauthProvider;
  this.oauthID = user.oauthID;
}

User.prototype.save = function(callback) {

  if(this.oauth===false){
    var md5 = crypto.createHash('md5'),
      emailMD5 = md5.update(this.email.toLowerCase()).digest('hex'),
      userAvatar = 'http://www.gravatar.com/avatar/' + emailMD5+ '?s=';
    var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      avatar: userAvatar,
      regTimestamp: Date.now(),
      oauth: false
    };
  }
  if(this.oauth===true){
    var user = {
      name: this.name,
      email: this.email,
      avatar: this.avatar,
      regTimestamp: Date.now(),
      oauth: true,
      oauthProvider: this.oauthProvider,
      oauthID:this.oauthID
    };
  }
  var newUser = new UserModel(user);
  newUser.save(function(err, user) {
    if (err) {
      return callback(err);
    }

    callback(null, user);
  });
};

User.get = function(username, callback) {
  UserModel.findOne({
    name: username
  }, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

User.getOAuth = function(id, callback) {
  UserModel.findOne({
    oauthID: id
  }, function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

User.update = function(loginName, userEmail, userAvatar, newPassword, callback) {
  UserModel.update({
    'name': loginName
  }, {
    $set: {
      email: userEmail,
      avatar: userAvatar,
      password: newPassword
    }
  }, function(err) {
    if (err) {
      return callback(err);
    }
    UserModel.findOne({
      'name': loginName
    }, function(err, user) {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    });
  });
};
User.updateOAuth = function(oauthID,userEmail, callback) {
  UserModel.update({
    'oauthID': oauthID
  }, {
    $set: {
      email: userEmail,
    }
  }, function(err) {
    if (err) {
      return callback(err);
    }
    UserModel.findOne({
      'oauthID': oauthID
    }, function(err, user) {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    });
  });
};


User.getNew = function(number, callback) {
  UserModel.find({})
    .limit(number)
    .sort({
      regTimestamp: -1
    })
    .exec(function(err, docs) {
      if (err) {
        return callback(err);
      }
      callback(null, docs);
    });
};

module.exports = User;