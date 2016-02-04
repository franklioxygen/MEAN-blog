var express = require('express');
var router = new express.Router();
var Config = require('../config');
var config=new Config();
var multer = require('multer');
var bodyParser = require('body-parser');

// upload files
var storage = multer.diskStorage({
  destination: function (req, uploadFile, callback) {
    callback(null, 'public/uploadImages');
  },
  filename: function (req, uploadFile, callback) {
    callback(null, uploadFile.fieldname +'-' + Date.now() + config.fileType(uploadFile.mimetype) );
  }
});
var uploadToDisk=multer({ storage: storage});

var cpUpload = uploadToDisk.fields([
  { name: 'files', maxCount: 3, maxSize:'4MB'}]);

var crypto= require('crypto'),
    User=require('../models/user.js'),
    Post=require('../models/post.js'),
    Comment=require('../models/comment.js');

//auth check
function checkSignin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', 'Not signed in'); 
      res.redirect('/signin');
    }
    next();
  }
function checkNotSignin(req, res, next) {
    if (req.session.user) {
      req.flash('error', 'Already signed in'); 
      res.redirect('back');
    }
    next();
  }

//  index router and sub functions

function getNewUsers(req,res,next){
  var number = 5;
  User.getNew(number, function (err,usersSet){
  if(err){ usersSet=[];}
  req.usersSet=usersSet;
  next();
  });
}
function getTopPosts(req,res,next){
  var number = 5;
  Post.getTop(number, function (err,postTop){
  if(err){  postTop=[];}
  req.postsSet=postTop;
  next();
  });
}
function renderIndex(req,res){
  res.render('index',{
  user:req.session.user,
  users:req.usersSet,
  posts:req.postsSet,
  success: req.flash('success').toString(),
  error: req.flash('error').toString()
  });
}
router.get('/', getNewUsers, getTopPosts, renderIndex);

router.get('/all', function (req, res) {
  var currentPage = parseInt(req.query.p) || 1;   // judge first page
Post.getSome(null, currentPage, function (err, postsSet, total) {
    if (err) {
      postsSet = [];
    }
    res.render('all', {
      posts: postsSet,
      page: currentPage,
      isFirstPage: (currentPage - 1) === 0,
      isLastPage: ((currentPage - 1) * config.pageSize() + postsSet.length) === total,
      totalPage: Math.ceil(total/config.pageSize() ),
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

//edit  profile
router.get('/userAccount',checkSignin); 
router.get('/userAccount',function(req,res){
  User.get(req.session.user.name, function (err, user) {
    res.render('userAccount',{
    user: user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
    })

  }); 
;
});


function verifyPassword(req, res, next) {
  var password = crypto.createHash('md5').update(req.body.signinPassword).digest('hex');
  User.get(req.session.user.name, function(err, user) {
      if (user.password !== password) {
        req.flash('error', 'Wrong combination.'); 
        res.redirect('/userAccount');
      }
    req.user=user;
    next();
    });  
  }

router.post('/userAccount',checkSignin);
router.post('/userAccount', function (req, res){

  var password = crypto.createHash('md5').update(req.body.signinPassword).digest('hex');
  if(!req.body.newPassword){
    var newPassword= password
  }
  else{
    var newPassword= crypto.createHash('md5').update(req.body.newPassword).digest('hex');
  }
  User.get(req.session.user.name, function (err, user) {
      if (user.password !== password) {
        req.flash('error', 'Wrong combination.'); 
        return res.redirect('/userAccount');
      }
    else{

        User.update(req.body.signinName, req.body.useremail, newPassword, function (err, user){
            req.flash('success', 'Saved.');
            res.render('userAccount',{
            user: user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
            });
        });
      }
  });
});

router.get('/newuser',checkNotSignin);
router.get('/newuser',function (req,res){
  res.render('newuser',{
  success: req.flash('success').toString(),
  error: req.flash('error').toString()
  });
});

router.post('/reg',checkNotSignin);
router.post('/reg', function (req, res) {
      var username = req.body.username;
      var passwordMD5 = crypto.createHash('md5').update(req.body.password).digest('hex');
      var emailMD5 = crypto.createHash('md5').update(req.body.email.toLowerCase()).digest('hex');
      var userAvatar = 'http://www.gravatar.com/avatar/' + emailMD5;
  var newUser = new User({
      name: username,
      password: passwordMD5,
      email: req.body.email,
      avatar: userAvatar
  });
//  检查用户名是否已经存在 
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', '用户已存在!');
      return res.redirect('/newuser');//返回注册页
    }
//    如果不存在则新增用户
    newUser.save(function (err) {

      if (err) {
        req.flash('error', err);
        return res.redirect('/newuser');//注册失败返回主册页
      }

      req.session.user = newUser; //用户信息存入 session
      req.flash('success', '注册成功!');
      res.redirect('/');//注册成功后返回主页
    });
  });
});


router.post('/signin', function(req, res){
//  生成密码的 md5 值
  var password = crypto.createHash('md5').update(req.body.signinPassword).digest('hex');
//  检查用户是否存在
  User.get(req.body.signinName, function (err, user) {
    if (!user) {
        req.flash('error', 'User does not exist.'); 
        return res.redirect('/newuser');
      }
    if (user.password !== password) {
        req.flash('error', 'Wrong password.'); 
        return res.redirect('/newuser');
    }
//    用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/');//登陆成功后跳转到主页
  });
});

router.get('/post',checkSignin);
router.get('/post', function(req, res){
    res.render('post', {
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
});
router.post('/post',checkSignin);
router.post('/post', cpUpload , function (req, res){

  var currentUser = req.session.user,
      tags = [req.body.postTag1, req.body.postTag2, req.body.postTag3],
      images = [req.files],
      post = new Post(currentUser.name, currentUser.avatar,  req.body.postTitle, tags, req.body.postArticle, images);
  post.save(function (err, callback) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/post');
    }
    req.flash('success', '发布成功!');
    res.redirect('/p/'+callback._id);
  });

});

router.get('/logout',checkSignin);
router.get('/logout', function (req, res){
  req.session.user = null;
  req.flash('success', '登出成功!');
  res.redirect('/');//登出成功后跳转到主页
});

router.get('/search/:keyword',function (req,res){
  Post.search(req.params.keyword, function (err,postsSet){
  res.render('_resSearch',{
    posts:postsSet
    });
  });
});


router.get('/search', function (req, res) {
  Post.search(req.query.keyword, function (err, postsSet) {
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


router.get('/u/:name', function (req, res) {
  var currentPage = parseInt(req.query.p) || 1;
//  检查用户是否存在
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/');//用户不存在则跳转到主页
    }
  //  查询并返回该用户的所有文章
        Post.getSome(user.name, currentPage, function (err, postsSet, total) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      } 
      res.render('userArticles', {
        title: user.name,
        posts: postsSet,
        page: currentPage,
        isFirstPage: (currentPage - 1) === 0,
        isLastPage: ((currentPage - 1) * config.pageSize() + postsSet.length) === total,
        totalPage: Math.ceil(total/config.pageSize() ),
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  }); 
});

router.get('/p/:_id', function (req, res) {
  Post.getOne(req.params._id, function (err, postOne) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('article', {
      post:postOne,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

router.get('/edit/:_id', checkSignin);
router.get('/edit/:_id', function (req, res) {
  Post.edit(req.params._id, function (err, post) {
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
router.post('/edit/:_id', function (req, res) {
  var tags = [req.body.postTag1, req.body.postTag2, req.body.postTag3];
  Post.update(req.params._id, req.body.postTitle, tags, req.body.postArticle, function (err) {
    var url = encodeURI('/p/' + req.params._id);
    if (err) {
      req.flash('error', err); 
      return res.redirect(url);//出错！返回文章页
    }
    req.flash('success', '修改成功!');
    res.redirect(url);//成功！返回文章页
  });
});

router.get('/remove/:_id', checkSignin);
router.get('/remove/:_id', function (req, res) {
  Post.remove(req.params._id, function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
    req.flash('success', '删除成功!');
    res.redirect('/');
  });
});
router.post('/p/:_id', function (req, res) {
  var date = new Date(),
      timeNow = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + 
             date.getHours() + ':' + (date.getMinutes() < config.pageSize() ? '0' + date.getMinutes() : date.getMinutes());
  var emailMD5= crypto.createHash('md5').update(req.body.email.toLowerCase()).digest('hex'),
      userAvatar='http://www.gravatar.com/avatar/' + emailMD5;

  var comment = {
      name: req.body.name,
      avatar: userAvatar,
      email: req.body.email,
      website: req.body.website,
      time: timeNow,
      content: req.body.content
  };
  var newComment = new Comment(req.params._id, comment);
  newComment.save(function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('back');
    }
    req.flash('success', '留言成功!');
    res.redirect('back');
  });
});

router.get('/getComment/:_id',function (req,res){
  Post.getComment(req.params._id,function (err,post){
    if(err){req.flash('error',err);}
    res.render('_resComment',{
    postCom:post
    });
  });
});

router.get('/archive', function (req, res) {
  Post.getArchive(function (err, posts) {
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

router.get('/tags', function (req, res) {
  Post.getTags(function (err, posts) {
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



router.get('/tags/:tag', function (req, res) {
  Post.getTag(req.params.tag, function (err, posts) {
    if (err) {
      req.flash('error',err); 
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

router.use(function(req, res){
  res.render('404');
});

module.exports = router;
