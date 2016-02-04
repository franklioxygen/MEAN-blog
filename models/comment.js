var mongoose = require('mongoose');
var postSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  dates: Array,
  timestammp: String,
  title: String,
  tags: Array,
  post: String,
  comments: Array,
  pv: Number
}, {
  collection: 'posts'
});

var postModel = mongoose.model('comPost', postSchema);


function Comment(_id, comment) {
  this._id = _id;
  this.comment = comment;
}

module.exports = Comment;

Comment.prototype.save = function(callback) {
  var postId = this._id,
    comment = this.comment;

  postModel.update({
    '_id': postId
  }, {
    $push: {
      'comments': comment
    }
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });

};