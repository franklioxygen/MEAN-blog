var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'index' });
});

router.get('/reg', function(req, res){
  res.render('reg',{ title: 'registration'});
});
router.post('/reg', function(req, res){
});

router.get('/login', function(req, res){
  res.render('login',{ title: 'login'});
});
router.post('/login', function(req, res){
});

router.get('/post', function(req, res){
  res.render('post',{ title: 'post'});
});
router.post('', function(req, res){
});

router.get('/logout', function(req, res){
  res.render('logout',{ title: 'logout'});
});

module.exports = router;
