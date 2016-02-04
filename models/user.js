
var crypto = require('crypto');
var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	name: String,
	password: String,
        email: String,
        regTimestamp:String,
        avatar: String
}, {
  collection: 'users' 
});

var UserModel = mongoose.model('User', userSchema);

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.avatar = user.avatar;
}

User.prototype.save = function(callback) {
   var md5 = crypto.createHash('md5'),
   emailMD5 = md5.update(this.email.toLowerCase()).digest('hex'),
   userAvatar = 'http://www.gravatar.com/avatar/' + emailMD5 ;
   var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      avatar: userAvatar,
      regTimestamp: Date.now()
   };
    var newUser = new UserModel(user);
       newUser.save(function (err, user) {
    if (err) {
         return callback(err);
      }
       callback(null, user);
  });
};

User.get = function(username, callback) {
  UserModel.findOne({name: username}, function (err, user) {
  if (err) {
    return callback(err); 
  }
  callback(null, user);
  });
};

User.update = function(loginName, useremail, newPassword, callback) {
  UserModel.update({
        'name': loginName
      }, {
        $set: {
    email: useremail,
    password: newPassword
    }
      }, function (err){if(err){return callback(err);}
    UserModel.findOne({'name': loginName}, function (err, user) {
      if (err) {return callback(err);}
      callback(null, user);
    });
  });
};

User.getNew = function(number, callback){
  UserModel.find({})
  .limit(number)
  .sort({regTimestamp:-1})
  .exec(function(err, docs){
   if(err){ return callback(err);}
   callback(null, docs);
  });
};

module.exports = User;
