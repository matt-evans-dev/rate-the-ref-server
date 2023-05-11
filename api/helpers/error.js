const bugsnagClient = require('../../utils/bugsnag');

class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }
}

const handleError = (err, res) => {
  console.log('handleError', err.message);
  let { statusCode, message } = err;
  statusCode = !statusCode ? 500 : statusCode;
  if (statusCode !== 401) {
    bugsnagClient.notify(err);
  }
  switch (statusCode) {
    case 400:
      message =
        Array.isArray(err.message) && err.message[0] ? err.message[0].message : 'Validation Error';
      break;
    case 401:
      message = 'You are not authorized';
      break;
    case 500:
      message = 'Something went wrong';
      break;
    default:
      break;
  }
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};

const handleAdminError = (err, res) => {
  let { statusCode } = err;
  const { message } = err;
  statusCode = !statusCode ? 500 : statusCode;
  if (statusCode !== 401) {
    bugsnagClient.notify(err);
  }
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: Array.isArray(message) && message[0] ? message[0].message : message
  });
};

module.exports = {
  ErrorHandler,
  handleError,
  handleAdminError
};
