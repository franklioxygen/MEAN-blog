
var crypto = require('crypto');
var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/blog');

var ObjectID = require('mongodb').ObjectID;
var Config = require('../config');
var config = new Config();

var postSchema = new mongoose.Schema({
	name: String,
	avatar: String,
	dates: Array,
	timestamp: String,
	title: String,
	tags: Array,
	post: String,
	comments: Array,
	pv: Number
},{
	collection: 'posts'

});

var postModel = mongoose.model('Post', postSchema);

function Post(name, avatar, title, tags, post) {
  this.name = name;
  this.avatar = avatar;
  this.title = title;
  this.tags = tags;
  this.post = post;
}

Post.prototype.save = function(callback){	
  var dateNow = new Date();
  var dates = {
      date: dateNow,
      year : dateNow.getFullYear(),
      month : dateNow.getFullYear() + "-" + (dateNow.getMonth() + 1),
      day : dateNow.getFullYear() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getDate(),
      time : dateNow.getFullYear() + "-" + (dateNow.getMonth() + 1) + "-" + dateNow.getDate() + " " + dateNow.getHours() + ":" + (dateNow.getMinutes() < config.pageSize() ? '0' + dateNow.getMinutes() : dateNow.getMinutes())
};
  var post = {
	  name: this.name,
	  avatar: this.avatar,
	  dates: dates,
	  timestamp: Date.now(),
	  title: this.title,
	  tags: this.tags,
	  post: this.post,
          pv: 0 
  };
  var newPost = new postModel(post);
  newPost.save(function(err,post){
  if(err){return callback(err);}
  callback(null,post);
  });
}

Post.getSome = function(name, page, callback){
  var query = {};
  if(name){
  query.name = name;
  }

  postModel.count(query, function (err, total){
    postModel.find(query,{ })
    .skip((page-1)*config.pageSize())
    .limit(config.pageSize())
    .sort({timestamp:-1})
    .exec(function (err, docs){
     if(err){
	     console.log(err);
	     return callback(err);
     }
     callback(null, docs, total);
    });
  });
};
//获取一篇文章
Post.getOne = function(_id, callback){
  postModel.findOne({
    '_id': new ObjectID(_id)
  },function(err,doc){
  if(err){ return callback(err);}
  if(doc){
    postModel.update(
       { '_id': _id}
      ,{$inc: { pv:1 }}
      ,function (err){
        if(err){ return callback(err);}
      });
    callback(null,doc);
    }
  }
)};

Post.edit = function(_id, callback) {
  postModel.findOne({
    '_id' : new ObjectID(_id)
  }, function(err,doc){
    if(err) {return callback(err);}
      callback(null,doc);
  });
};


// 更新一篇文章及其相关信息
Post.update = function(_id, title,  post, callback) {
  postModel.update({
        '_id': new ObjectID(_id)
      }, {
        $set: {
		title: title,
		post: post
		}
      }, function (err){
	  if(err){return callback(err);}
        callback(null);
  });
};

//删除一篇文章
Post.remove = function(_id, callback) {
  postModel.remove({
        '_id': new ObjectID(_id)
      },  function (err){
	  if (err) {return callback(err);}
        callback(null);
  });
};

//返回所有文章存档信息
Post.getArchive = function(callback) {
  postModel.find({})
    .sort({timestamp: -1})
    .exec(function (err, docs) {
    if (err) {return callback(err);}
      callback(null, docs);
    });
};

//返回所有标签
Post.getTags = function(callback) {
  postModel.distinct("tags", function (err, docs) {
    if (err) {return callback(err);}
    callback(null, docs);
  });
};

//返回含有特定标签的所有文章
Post.getTag = function(tag, callback) {
      postModel.find({
        "tags": tag
      }).sort({
        timestamp: -1
      }).exec(function (err, docs) {
        if (err) {return callback(err);}
        callback(null, docs);
  });
};

//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
      var pattern = new RegExp(keyword, "i");
      postModel.find({
        "title": pattern
      }).sort({
        timestamp: -1
      }).exec(function (err, docs) {
        if (err) {return callback(err);}
        callback(null, docs);
  });
};

module.exports = Post;
