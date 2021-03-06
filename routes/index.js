/*jslint node: true */
'use strict';
var express = require('express');
var db = require('../models/db');
var router = new express.Router();
var config = require('../config');
var mkdirp = require('mkdirp');
var multer = require('multer');
var nodemailer = require('nodemailer');
var passport=require('passport');
var colors = require('colors');
// upload files
/*
var storage = multer.diskStorage({
  destination: function(req, uploadFile, callback) {
    callback(null, 'public/uploadImages');
  },
  filename: function(req, uploadFile, callback) {
    callback(null, uploadFile.fieldname + '-' + Date.now() + fileType(uploadFile.mimetype));
  }
});
*/

var storage = multer.diskStorage({
  destination: function(req, uploadFile, callback) {
    var date= new Date();
    var timeNow = date.getFullYear() + '_' + ('0' + (date.getMonth() + 1)).slice(-2) + '_' + ('0' + date.getDate()).slice(-2);
    var dir = 'public/uploadImages/'+ timeNow +'/';
    mkdirp(dir, err => callback(err, dir))
  },
  filename: function(req, uploadFile, callback) {
    callback(null, uploadFile.fieldname + '-' + Date.now() + fileType(uploadFile.mimetype));
  }
});

var uploadToDisk = multer({
  storage: storage
});

var cpUpload = uploadToDisk.fields([{
  name: 'files',
  maxCount: 3,
  maxSize: '4MB'
}]);

var crypto = require('crypto'),
  User = require('../models/user.js'),
  Post = require('../models/post.js'),
  Comment = require('../models/comment.js');


function fileType(mime) {
    switch (mime) {
      case 'image/png':
        return '.png';
      case 'image/jpeg':
        return '.jpg';
    }
}

//auth check
function checkSignin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Not signed in');
    return res.redirect('/newuser');
  }
  next();
}

function checkNotSignin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Already signed in');
    return res.redirect('back');
  }
  next();
}


function genAvatar(emailAddress){
  var emailMD5 = crypto.createHash('md5').update(emailAddress.toLowerCase()).digest('hex');
  var userAvatar = 'http://www.gravatar.com/avatar/' + emailMD5 + '?s=';
  return userAvatar;
}

//  index router and sub functions

function getNewUsers(req, res, next) {
  var number = 5;
  User.getNew(number, function(err, usersSet) {
    if (err) {
      usersSet = [];
    }
    req.usersSet = usersSet;
    next();
  });
}

function getTopPosts(req, res, next) {
  var number = 5;
  Post.getTop(number, function(err, postTop) {
    if (err) {
      postTop = [];
    }
    req.postsSet = postTop;
    next();
  });
}

function renderIndex(req, res) {
  res.render('index', {
    user: req.session.user,
    users: req.usersSet,
    posts: req.postsSet,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
}
function logIP(req , res, next){
    var date = new Date(),
    timeNow = date.getFullYear() + '-' +  ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' +
    date.getHours() + ':' + (date.getMinutes() < config.pageSize ? '0' + date.getMinutes() : date.getMinutes());

    console.log(colors.green("[NEW REQ]" +timeNow) +" x-real-ip=>" + req.headers['x-real-ip'] + " / x-forwarded-for=>" + req.headers['x-forwarded-for']);
 
  next();
}
router.all('*', logIP);
router.get('/', getNewUsers, getTopPosts, renderIndex);




router.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read'] 
}));
router.get( '/auth/google/callback', 
      passport.authenticate( 'google', { 
        session:false,  // because using express session
        failureRedirect: '/newuser',
        successFlash:'Welcome'
      }),function(req,res){
         //check if user has been signed in
          User.getOAuth(req.user.id, function(err, user) { 
            if (err) {
              req.flash('error', err);
              return res.redirect('/');
            }
            if (user) {
              req.session.user=user;
              req.flash('success', 'Welcome');
              // save new info
              return res.redirect('/');
            }
            req.session.tempOAuthUser = req.user;
            return res.redirect('/oauthSetUsername');
          });
});


router.get('/oauthSetUsername',function(req,res){
  res.render('oauthSetUsername',{
    tempUser:req.session.tempOAuthUser
  });
});
router.post('/oauthSetUsername', checkNotSignin);
router.post('/oauthSetUsername', function(req, res) {
  var username = req.body.signinName;
  var avatar = req.session.tempOAuthUser.photos[0].value;
  var newUser = new User({
    name: username,
    email: req.body.useremail,
    avatar: avatar.substring(0, avatar.length - 2),  // cut origin avatar size
    oauth: true,
    oauthProvider: 'google',
    oauthID: req.session.tempOAuthUser.id
  });
  User.get(newUser.name, function(err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', 'Username exists.');
      return res.redirect('/oauthSetUsername');
    }
    newUser.save(function(err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/oauthSetUsername');
      }
      req.session.user = newUser;
      req.flash('success', 'Signed up');
      res.redirect('/');
    });
  });
});


router.get('/all', function(req, res) {
  var currentPage = parseInt(req.query.p) || 1; // judge first page
  Post.getSome(null, currentPage, function(err, postsSet, total) {
    if (err) {
      postsSet = [];
    }
    res.render('all', {
      posts: postsSet,
      page: currentPage,
      isFirstPage: (currentPage - 1) === 0,
      isLastPage: ((currentPage - 1) * config.pageSize + postsSet.length) === total,
      totalPage: Math.ceil(total / config.pageSize),
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//edit  profile
router.get('/userAccount', checkSignin);
router.get('/userAccount', function(req, res) {
  User.get(req.session.user.name, function(err, user) {

    res.render('userAccount', {
      user: user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });

  });
});


router.post('/userAccount', checkSignin);
router.post('/userAccount', function(req, res) {
  if(req.session.user.oauth===false){
    var newPassword = null;
    var password = crypto.createHash('md5').update(req.body.signinPassword).digest('hex');
    if (!req.body.newPassword) {
      newPassword = password;
    } else {
      newPassword = crypto.createHash('md5').update(req.body.newPassword).digest('hex');
    }
    var avatar=genAvatar(req.body.useremail);
    User.get(req.session.user.name, function(err, user) {
      if (user.password !== password) {
        req.flash('error', 'Wrong combination.');
        return res.redirect('/userAccount');
      } else {
        User.update(req.body.signinName, req.body.useremail, avatar, newPassword, function(err, user) {
          req.flash('success', 'Saved.');
          req.session.user = user;
          res.render('userAccount', {
            user: user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
          });
        });
      }
    });
  }

  if(req.session.user.oauth===true){

    User.getOAuth(req.session.user.oauthID, function(err, user) {
      User.updateOAuth(req.session.user.oauthID, req.body.useremail , function(err, user){
          req.flash('success', 'Saved.');
          req.session.user = user;
          res.render('userAccount', {
            user: user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
          });
      });
    });
  }
});

router.get('/newuser', checkNotSignin);
router.get('/newuser', function(req, res) {
  res.render('newuser', {
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/signup', checkNotSignin);
router.post('/signup', function(req, res) {
  var username = req.body.username;
  var passwordMD5 = crypto.createHash('md5').update(req.body.password).digest('hex');
  var newUser = new User({
    name: username,
    password: passwordMD5,
    email: req.body.email,
    avatar: genAvatar(req.body.email),
    oauth: false
  });

  User.get(newUser.name, function(err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', 'Username exists.');
      return res.redirect('/newuser');
    }
    newUser.save(function(err) {

      if (err) {
        req.flash('error', err);
        return res.redirect('/newuser');
      }

      req.session.user = newUser;
      req.flash('success', 'Signed up');
      res.redirect('/');
    });
  });
});

router.post('/signin', function(req, res) {
  var password = crypto.createHash('md5').update(req.body.signinPassword).digest('hex');
  User.get(req.body.signinName, function(err, user) {
    if (!user) {
      req.flash('error', 'User does not exist.');
      return res.redirect('/newuser');
    }
    if (user.password !== password) {
      req.flash('error', 'Wrong password.');
      return res.redirect('/newuser');
    }

    req.session.user = user;
    req.flash('success', 'Welcome!');
    res.redirect('/');
  });
});

router.get('/post', checkSignin);
router.get('/post', function(req, res) {
  res.render('post', {
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});
router.post('/post', checkSignin);
router.post('/post', cpUpload, function(req, res) {
  var tags = [];
  if (req.body.postTag1 || req.body.postTag2 || req.body.postTag3) {
    tags = [req.body.postTag1, req.body.postTag2, req.body.postTag3];
  }
  var currentUser = req.session.user,
    images = [req.files],
    post = new Post(currentUser.name, currentUser.avatar, req.body.postTitle, tags, req.body.postArticle, images);
  post.save(function(err, callback) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/post');
    }
    req.flash('success', 'Post successed.');
    res.redirect('/p/' + callback._id);
  });

});

router.get('/signout', checkSignin);
router.get('/signout', function(req, res) {
  req.session.user = null;
  req.flash('success', 'Signed out');
  req.logout();
  res.redirect('/');
});

router.get('/search/:keyword', function(req, res) {
  Post.search(req.params.keyword, function(err, postsSet) {
    res.json(postsSet); //angular response
  });
});


router.get('/search', function(req, res) {
  Post.search(req.query.keyword, function(err, postsSet) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('search', {
      keyword: req.query.keyword,
      posts: postsSet,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});


router.get('/u/:name', function(req, res) {
  var currentPage = parseInt(req.query.p) || 1;
  User.get(req.params.name, function(err, user) {
    if (!user) {
      req.flash('error', 'Username not exists.');
      return res.redirect('/');
    }
    Post.getSome(user.name, currentPage, function(err, postsSet, total) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      res.render('userArticles', {
        title: user.name,
        posts: postsSet,
        page: currentPage,
        isFirstPage: (currentPage - 1) === 0,
        isLastPage: ((currentPage - 1) * config.pageSize + postsSet.length) === total,
        totalPage: Math.ceil(total / config.pageSize),
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
});

router.get('/p/:_id', function(req, res) {
  Post.getOne(req.params._id, function(err, postOne) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('article', {
      post: postOne,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/edit/:_id', checkSignin);
router.get('/edit/:_id', function(req, res) {
  Post.edit(req.params._id, function(err, post) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    res.render('edit', {
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});



router.post('/edit/:_id', checkSignin);
router.post('/edit/:_id', function(req, res) {
  var tags = [req.body.postTag1, req.body.postTag2, req.body.postTag3];
  Post.update(req.params._id, req.body.postTitle, tags, req.body.postArticle, function(err) {
    var url = encodeURI('/p/' + req.params._id);
    if (err) {
      req.flash('error', err);
      return res.redirect(url);
    }
    req.flash('success', 'Saved.');
    res.redirect(url);
  });
});

router.get('/remove/:_id', checkSignin);
router.get('/remove/:_id', function(req, res) {
  Post.remove(req.params._id, function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', 'Deleted.');
    res.redirect('/');
  });
});
router.post('/p/:_id', function(req, res) {
  var date = new Date(),
    timeNow = date.getFullYear() + '-' +  ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + ' ' +
    date.getHours() + ':' + (date.getMinutes() < config.pageSize ? '0' + date.getMinutes() : date.getMinutes());
  var comment = {
    name: req.body.name,
    avatar: req.session.user.avatar,
    email: req.body.email,
    website: req.body.website,
    time: timeNow,
    content: req.body.content
  };
  var newComment = new Comment(req.params._id, comment);
  newComment.save(function(err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('back');
    }
    req.flash('success', 'Comment posted.');
    res.redirect('back');
  });
});

router.get('/getComment/:_id', function(req, res) {
  Post.getComment(req.params._id, function(err, post) {
    if (err) {
      req.flash('error', err);
    }
    res.send(post); //angular response
  });
});

router.get('/archive', function(req, res) {
  Post.getArchive(function(err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('archive', {
      title: 'Archive',
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/tags', function(req, res) {
  Post.getTags(function(err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('tags', {
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});



router.get('/tags/:tag', function(req, res) {
  Post.getTag(req.params.tag, function(err, posts) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    res.render('tag', {
      currentTag: req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.post('/sendEmail', function(req, res) {
  // create reusable transporter object using the default SMTP transport 
  //smtps://username:password@smtp.gmail.com
  var transporter = nodemailer.createTransport('smtps://franklioxygentest@gmail.com:franklioxygen@smtp.gmail.com');
  // setup e-mail data with unicode symbols 
  var mailOptions = {
    from: req.body.emailName + ' <' + req.body.emailAddress + '>', // sender address 
    to: 'franklioxygentest@gmail.com', // list of receiver, recever,recever,recever
    subject: 'Hello', // Subject line 
    text: 'Name:' + req.body.emailName + ' Email:' + req.body.emailAddress + ' Content:' + req.body.emailContent // plaintext body 

  };
  // send mail with defined transport object 
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
    console.log('Message sent: ' + info.response);
  });
});

router.get('/chat',function(req,res){
  res.render('chat',{
    user: req.session.user
 });
});


router.use(function(req, res) {
  res.render('404');
});



module.exports = router;