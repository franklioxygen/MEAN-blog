/*jslint node: true */
'use strict';
var config = require('../config');
var mongoose = require('mongoose');
var db = require('./db');
var fs = require('fs');
var postSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  dates: Array,
  timestamp: String,
  title: String,
  tags: Array,
  article: String,
  comments: Array,
  pv: Number,
  images: Array
}, {
  collection: 'posts'

});

var PostModel = mongoose.model('Post', postSchema);

function Post(name, avatar, title, tags, article, images) {
  this.name = name;
  this.avatar = avatar;
  this.title = title;
  this.tags = tags;
  this.article = article;
  this.images = images;
}

Post.prototype.save = function(callback) {
  var dateNow = new Date();
  var dateSet = {
    date: dateNow,
    year: dateNow.getFullYear(),
    month: dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1),
    day: dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate(),
    time: dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate() + ' ' + dateNow.getHours() + ':' + (dateNow.getMinutes() < config.pageSize ? '0' + dateNow.getMinutes() : dateNow.getMinutes())
  };
  var post = {
    name: this.name,
    avatar: this.avatar,
    dates: dateSet,
    timestamp: Date.now(),
    title: this.title,
    tags: this.tags,
    article: this.article,
    pv: 0,
    images: this.images
  };
  var newPost = new PostModel(post);
  newPost.save(function(err, post) {
    if (err) {
      return callback(err);
    }
    callback(null, post);
  });
};

Post.getSome = function(name, page, callback) {
  var query = {};
  if (name) {
    query.name = name;
  }

  PostModel.count(query, function(err, total) {
    PostModel.find(query, {})
      .skip((page - 1) * config.pageSize)
      .limit(config.pageSize)
      .sort({
        timestamp: -1
      })
      .exec(function(err, docs) {
        if (err) {
          return callback(err);
        }
        callback(null, docs, total);
      });
  });
};

Post.getOne = function(postId, callback) {
  PostModel.findOne({
    '_id': postId
  }, function(err, doc) {
    if (err) {
      return callback(err);
    }
    if (doc) {
      PostModel.update({
        '_id': postId
      }, {
        $inc: {
          pv: 1
        }
      }, function(err) {
        if (err) {
          return callback(err);
        }
      });
      callback(null, doc);
    }
  });
};

Post.getTop = function(number, callback) {
  PostModel.find({})
    .limit(number)
    .sort({
      pv: -1
    })
    .exec(function(err, docs) {
      if (err) {
        return callback(err);
      }
      callback(null, docs);
    });
};

Post.edit = function(postId, callback) {
  PostModel.findOne({
    '_id': postId
  }, function(err, doc) {
    if (err) {
      return callback(err);
    }
    callback(null, doc);
  });
};

Post.update = function(postId, postTitle, postTags, postArticle, callback) {
  PostModel.update({
    '_id': postId
  }, {
    $set: {
      title: postTitle,
      tags: postTags,
      article: postArticle
    }
  }, function(err) {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
};

Post.remove = function(postId, callback) {
  PostModel.findOne({
    '_id': postId
  }, function(err, doc) {
    if (err) {
      return callback(err);
    }
    if (doc.images[0]) {
      for (var i = 0, l = doc.images[0].files.length; i < l; i++) {
        fs.unlink(doc.images[0].files[i].path);
      }
    }

    PostModel.remove({
      '_id': postId
    }, function(err) {
      if (err) {
        return callback(err);
      }
      callback(null);
    });
  });
};


Post.getArchive = function(callback) {
  PostModel.find({})
    .sort({
      timestamp: -1
    })
    .exec(function(err, docs) {
      if (err) {
        return callback(err);
      }
      callback(null, docs);
    });
};

Post.getTags = function(callback) {
  PostModel.distinct('tags', function(err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null, docs);
  });
};

Post.getTag = function(tag, callback) {
  PostModel.find({
    'tags': tag
  }).sort({
    timestamp: -1
  }).exec(function(err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null, docs);
  });
};

Post.search = function(keyword, callback) {
  var pattern = new RegExp(keyword, 'i');
  PostModel.find({
    'title': pattern
  }).sort({
    timestamp: -1
  }).exec(function(err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null, docs);
  });
};

Post.getComment = function(_id, callback) {
  PostModel.find({
    '_id': _id
  }).exec(function(err, docs) {
    if (err) {
      return callback(err);
    }
    callback(null, docs);
  });
};

module.exports = Post;