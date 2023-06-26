require('babel-register');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var issueRouter = require('./routes/issue');
var commentRouter = require('./routes/comment');
var categorysRouter = require('./routes/IssueCategorys');
var DocCategoryRouter = require('./routes/DocCategory');
var docRouter = require('./routes/doc');
var favoriteRouter = require('./routes/favorite');
var mongoose = require('./API/Mongoose');
var fileUpload = require('express-fileupload');
var filesRouter = require('./routes/file')
var app = express();

const cors = require('cors');


app.use(express.json());

// 或者，仅允许特定来源的请求
app.use(cors({
  origin: 'http://localhost:5173', // 允许的请求源
  methods: ['GET', 'POST'], // 允许的请求方法
}));



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/issue',issueRouter);
app.use('/comment',commentRouter);
app.use('/categorys',categorysRouter);
app.use('/DocCategory',DocCategoryRouter);
app.use('/doc',docRouter);
app.use('/favorite',favoriteRouter);

//文件功能板块
app.use(fileUpload());
app.use('/files', filesRouter)

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
