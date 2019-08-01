var createError = require('http-errors');
var express = require('express');
var async = require('async');
var mongoose = require('mongoose');
var MongoDB = 'mongodb+srv://brandtall:reMNLAkLtpnXK85@cluster0-qu2ol.mongodb.net/inventoryApp?retryWrites=true&w=majority'
mongoose.connect(MongoDB, { useNewUrlParser: true });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var helmet = require('helmet');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var catalogRouter = require('./routes/catalog');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
