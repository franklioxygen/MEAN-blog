/*jslint node: true */
'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
//var users = require('./routes/users');
var compression = require('compression');
var flash = require('connect-flash');
var async = require('async');
var config = require('./config');
var Authkeys = require('./authKeys');

var app = express();


//google OAuth2
var passport = require('passport');
var googleStrategy = require('passport-google-oauth20').Strategy;
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use(new googleStrategy({
    clientID: Authkeys.googleAuth.clientID,
    clientSecret: Authkeys.googleAuth.clientSecret,
    callbackURL: Authkeys.googleAuth.callbackURL,
    passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function() {
      return done(null, profile);
    });
  }
));



if (config.logger === 1) {
  var fs = require('fs');
  var accessLog = fs.createWriteStream('access.log', {
    flags: 'a'
  });
  var errorLog = fs.createWriteStream('error.log', {
    flags: 'a'
  });

  app.use(logger({
    stream: accessLog
  }));
  app.use(function(err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
  });
}


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

function parallel(middlewares) {
  return function(req, res, next) {
    async.each(middlewares, function(mw, cb) {
      mw(req, res, cb);
    }, next);
  };
}

var options = [{
  etag: true
}];

app.use(parallel([
  compression(), //gzip compress
  logger('dev'),

  favicon(path.join(__dirname, 'public/images', 'favicon.ico')),
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: false
  }),
  cookieParser(),
  express.static(path.join(__dirname, 'public'), options),
  session({
    secret: config.dbSecret,
    key: config.dbCookieKey, //cookie name
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * config.dbCookieDays
    }, //30 days
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: config.dbURI // *updated
    })
  }),
  function(req, res, next) {
    res.locals.session = req.session;
    next();
  },
  passport.initialize(),
  passport.session(),
  flash()
]));


/*

app.use(flash());
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: '.dbSecret,
  key: config.dbCookieKey,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * config.dbCookieDays},//30 days
  resave: true,
  saveUninitialized:true,
  store: new MongoStore({
    url: config.dbURI // *updated
  })
}));

app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});
*/

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
/*
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/

// error handlers



// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;