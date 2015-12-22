var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// configuration
var config = require('./config');

// middlewares
var mongoose = require('mongoose');
var expressValidator = require('express-validator');

var app = express();

// configuration for middlewares
require('./middlewares/mongoose')(mongoose);
// Mongoose Models
require('./models/game');
require('./models/user');
require('./models/moment');
require('./models/achievement');
var validatorOpt = require('./middlewares/express-validator').options;
// error handler middlewares
var errorHandlers = require('./middlewares/error-handlers');

// utils
var ErrorThrower = require('./utils/ErrorThrower');

// routers
var users = require('./routes/users');
var games = require('./routes/games');
var moments = require('./routes/moments');
var tokens = require('./routes/tokens');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator(validatorOpt));

app.use('/users', users);
app.use('/games', games);
app.use('/moments', moments);
app.use('/tokens', tokens);

app.get('/', function(req, res, next) {
  res.render('layout');
});

app.get('/views/:viewName', function(req, res, next) {
  res.render(req.params.viewName);
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(new ErrorThrower('Not Found', 404));
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(errorHandlers.finalHandler);
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
