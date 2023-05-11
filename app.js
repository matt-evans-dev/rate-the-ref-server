require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { UI } = require('bull-board');
const EventEmitter = require('events');

EventEmitter.defaultMaxListeners = 20;
const bugsnagClient = require('./utils/bugsnag');
const userRouter = require('./api/routes/userRouter');
const adminRouter = require('./api/routes/adminRouter');

const app = express();

const middleware = bugsnagClient.getPlugin('express');

app.use(middleware.requestHandler);
app.use(middleware.errorHandler);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/admin/queues', UI);
app.use('/', userRouter);
app.use('/admin', adminRouter);

module.exports = app;
