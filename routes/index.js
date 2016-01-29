var express = require("express");
var router = new express.Router();
var Config = require("../config");
var config=new Config();
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, uploadFile, callback) {
    callback(null, "../public/uploadImages");
  },
  filename: function (req, uploadFile, callback) {
    callback(null, uploadFile.fieldname +"-" + Date.now() + config.fileType(uploadFile.mimetype) );
  }
});
var uploadToDisk=multer({ storage: storage});

var cpUpload = uploadToDisk.fields([
  { name: "files", maxCount: 3, maxSize:"4MB"}]);

var crypto= require("crypto"),
    User=require("../models/user.js"),
    Post=require("../models/post.js"),
    Comment=require("../models/comment.js");

function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash("error", "未登录!"); 
      res.redirect("/login");
    }
    next();
  }
function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash("error", "已登录!"); 
      res.redirect("back");
    }
    next();
  }

function getNewUsers(req,res,next){
  var number = 5;
  User.getNew(number, function(err,usersSet){
  if(err){ usersSet=[];}
  req.usersSet=usersSet;
  next();
  });
}
function getTopPosts(req,res,next){
  var number = 5;
  Post.getTop(number, function(err,postTop){
  if(err){  postTop=[];}
  req.postsSet=postTop;
  next();
  });
}
function renderIndex(req,res){
  res.render("index",{
  user:req.session.user,
  users:req.usersSet,
  posts:req.postsSet
  });
}
router.get("/", getNewUsers, getTopPosts, renderIndex);

/* GET home page. */
router.get("/all", function (req, res) {
  //判断是否是第一页，并把请求的页数转换成 number 类型
  var currentPage = parseInt(req.query.p) || 1;
  //查询并返回第 page 页的 10 篇文章  
Post.getSome(null, currentPage, function (err, postsSet, total) {
    if (err) {
      postsSet = [];
    }
    
    res.render("all", {
      posts: postsSet,
      page: currentPage,
      isFirstPage: (currentPage - 1) === 0,
      isLastPage: ((currentPage - 1) * config.pageSize() + postsSet.length) === total,
      totalPage: Math.ceil(total/config.pageSize() ),
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});


router.get("/reg",checkNotLogin);
router.get("/reg", function(req, res){
  res.render("reg",{
    title: "registration",
    user: req.session.user,
    sucess:req.flash("success").toString(),
    error:req.flash("error").toString()
  });
});

router.post("/reg",checkNotLogin);
router.post("/reg", function (req, res) {
      var username = req.body.username,
      password = req.body.password,
      passwordRe = req.body["password_c"];
//  检验用户两次输入的密码是否一致
  if (passwordRe !== password) {
    req.flash("error", "两次输入的密码不一致!"); 
    return res.redirect("/reg");//返回注册页
  }
//  生成密码的 md5 值
      var passwordMD5 = crypto.createHash("md5").update(req.body.password).digest("hex");
      var emailMD5 = crypto.createHash("md5").update(req.body.email.toLowerCase()).digest("hex");
      var userAvatar = "http://www.gravatar.com/avatar/" + emailMD5 + "?s=48";
  var newUser = new User({
      name: username,
      password: passwordMD5,
      email: req.body.email,
      avatar: userAvatar
  });
//  检查用户名是否已经存在 
  User.get(newUser.name, function (err, user) {
    if (err) {
      req.flash("error", err);
      return res.redirect("/");
    }
    if (user) {
      req.flash("error", "用户已存在!");
      return res.redirect("/reg");//返回注册页
    }
//    如果不存在则新增用户
    newUser.save(function (err) {

      if (err) {
        req.flash("error", err);
        return res.redirect("/reg");//注册失败返回主册页
      }

      req.session.user = newUser; //用户信息存入 session
      req.flash("success", "注册成功!");
      res.redirect("/");//注册成功后返回主页
    });
  });
});


router.get("/login", checkNotLogin);
router.get("/login", function(req, res){
    res.render("login", {
        title: "登录",
        user: req.session.user,
        success: req.flash("success").toString(),
        error: req.flash("error").toString()});
});
router.post("/login",checkNotLogin);
router.post("/login", function(req, res){
//  生成密码的 md5 值
  var md5 = crypto.createHash("md5"),
      password = md5.update(req.body.password).digest("hex");
//  检查用户是否存在
  User.get(req.body.name, function (err, user) {
    if (!user) {
      req.flash("error", "用户不存在!"); 
      return res.redirect("/login");//用户不存在则跳转到登录页
    }
//    检查密码是否一致
    if (user.password !== password) {
      req.flash("error", "密码错误!"); 
      return res.redirect("/login");//密码错误则跳转到登录页
    }
//    用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash("success", "登陆成功!");
    res.redirect("/");//登陆成功后跳转到主页
  });
});
router.get("/post",checkLogin);
router.get("/post", function(req, res){
    res.render("post", {
      title: "发表",
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
});
router.post("/post",checkLogin);
router.post("/post", cpUpload , function(req, res){

var currentUser = req.session.user,
      tags = [req.body.tag1, req.body.tag2, req.body.tag3],
      images = [req.files],
      post = new Post(currentUser.name, currentUser.avatar,  req.body.title, tags, req.body.article, images);
  post.save(function (err) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("/post");
    }
    req.flash("success", "发布成功!");
    res.redirect("/");//发表成功跳转到主页
  });

});

router.get("/logout",checkLogin);
router.get("/logout", function(req, res){
  req.session.user = null;
  req.flash("success", "登出成功!");
  res.redirect("/");//登出成功后跳转到主页
});

router.get("/search/:keyword",function(req,res){
  Post.search(req.params.keyword, function(err,postsSet){
  res.render("searchRes",{
    posts:postsSet
    });
  });
});


router.get("/search", function (req, res) {
  Post.search(req.query.keyword, function (err, postsSet) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("/");
    }
    res.render("search", {
      title: "SEARCH:" + req.query.keyword,
      posts: postsSet,
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});


router.get("/u/:name", function (req, res) {
  var currentPage = parseInt(req.query.p) || 1;
//  检查用户是否存在
  User.get(req.params.name, function (err, user) {
    if (!user) {
      req.flash("error", "用户不存在!"); 
      return res.redirect("/");//用户不存在则跳转到主页
    }
  //  查询并返回该用户的所有文章
        Post.getSome(user.name, currentPage, function (err, postsSet, total) {
      if (err) {
        req.flash("error", err); 
        return res.redirect("/");
      } 
      res.render("user", {
        title: user.name,
        posts: postsSet,
        page: currentPage,
        isFirstPage: (currentPage - 1) === 0,
        isLastPage: ((currentPage - 1) * config.pageSize() + postsSet.length) === total,
        totalPage: Math.ceil(total/config.pageSize() ),
        user: req.session.user,
        success: req.flash("success").toString(),
        error: req.flash("error").toString()
      });
    });
  }); 
});

router.get("/p/:_id", function (req, res) {
  Post.getOne(req.params._id, function (err, postOne) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("/");
    }
    res.render("article", {
      post:postOne,
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});

router.get("/edit/:_id", checkLogin);
router.get("/edit/:_id", function (req, res) {
  Post.edit(req.params._id, function (err, post) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("back");
    }
    res.render("edit", {
      title: "编辑",
      post: post,
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});

router.post("/edit/:_id", checkLogin);
router.post("/edit/:_id", function (req, res) {
  Post.update(req.params._id, req.body.title, req.body.article, function (err) {
    var url = encodeURI("/p/" + req.params._id);
    if (err) {
      req.flash("error", err); 
      return res.redirect(url);//出错！返回文章页
    }
    req.flash("success", "修改成功!");
    res.redirect(url);//成功！返回文章页
  });
});

router.get("/remove/:_id", checkLogin);
router.get("/remove/:_id", function (req, res) {
  Post.remove(req.params._id, function (err) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("back");
    }
    req.flash("success", "删除成功!");
    res.redirect("/");
  });
});

router.post("/p/:_id", function (req, res) {
  var date = new Date(),
      timeNow = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
             date.getHours() + ":" + (date.getMinutes() < config.pageSize() ? "0" + date.getMinutes() : date.getMinutes());
  var emailMD5= crypto.createHash("md5").update(req.body.email.toLowerCase()).digest("hex"),
      userAvatar="http://www.gravatar.com/avatar/" + emailMD5 + "?s=48";

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
      req.flash("error", err); 
      return res.redirect("back");
    }
    req.flash("success", "留言成功!");
    res.redirect("back");
  });
});

router.get("/archive", function (req, res) {
  Post.getArchive(function (err, posts) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("/");
    }
    res.render("archive", {
      title: "存档",
      posts: posts,
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});

router.get("/tags", function (req, res) {
  Post.getTags(function (err, posts) {
    if (err) {
      req.flash("error", err); 
      return res.redirect("/");
    }
    res.render("tags", {
      title: "标签",
      posts: posts,
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});



router.get("/tags/:tag", function (req, res) {
  Post.getTag(req.params.tag, function (err, posts) {
    if (err) {
      req.flash("error",err); 
      return res.redirect("/");
    }
    res.render("tag", {
      title: "TAG:" + req.params.tag,
      posts: posts,
      user: req.session.user,
      success: req.flash("success").toString(),
      error: req.flash("error").toString()
    });
  });
});

router.use(function(req, res){
  res.render("404");
});

module.exports = router;
