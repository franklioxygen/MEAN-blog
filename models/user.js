
var crypto = require("crypto");
var mongoose = require("mongoose");
var userSchema = new mongoose.Schema({
	name: String,
	password: String,
        email: String,
        avatar: String
}, {
  collection: "users" 
});

var userModel = mongoose.model("User", userSchema);

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.avatar = user.avatar;
};

User.prototype.save = function(callback) {
   var md5 = crypto.createHash("md5"),
   emailMD5 = md5.update(this.email.toLowerCase()).digest("hex"),
   userAvatar = "http://www.gravatar.com/avatar/" + emailMD5 + "?s=48";
   var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      avatar: userAvatar
   };
    var newUser = new userModel(user);
       newUser.save(function (err, user) {
    if (err) {
         return callback(err);
      }
       callback(null, user);
  });
};

User.get = function(username, callback) {
  userModel.findOne({name: username}, function (err, user) {
  if (err) {
    return callback(err); 
  }
  callback(null, user);
  });
};

module.exports = User;
