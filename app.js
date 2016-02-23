var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketIO    = require( "socket.io" );
var session = require('express-session');
var passport = require('passport');
var SQLiteStore = require('connect-sqlite3')(session);
var sessionStore = new SQLiteStore;
var passportSocketIo = require("passport.socketio");

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.io = socketIO();

var sessionMiddleware = session({
  store: sessionStore,
  key:'chat.sid',
  secret: 'chat',
  resave:true,
  saveUninitialized:true,
  cookie: { maxAge: 1000*60*20 }});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

app.use(sessionMiddleware);
/*app.io.use(function(socket, next) {

  sessionMiddleware(socket.request, socket.request.res, next);
});*/

app.io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'chat.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       'chat',    // the session_secret to parse the cookie
  store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

function onAuthorizeSuccess(data, accept){
  console.log('****** successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept){
 /* if(error)
    throw new Error(message);*/
  console.log('******** failed connection to socket.io:', message);

  if(error)
    accept(new Error(message));

}

app.use(passport.initialize());
app.use(passport.session());

require('./passport')();

app.use('/', routes(app.io));
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
