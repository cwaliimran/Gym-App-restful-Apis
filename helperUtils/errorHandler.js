const { AppError } = require('./errors');
const { sendResponse } = require('./responseUtil');

const sendError = (err, req, res) => {
  const { statusCode, message } = err;
  sendResponse(res, statusCode, message);
};

const errorHandler = (err, req, res, next) => {
  if (err.isOperational) {
    sendError(err, req, res);
  } else {
    console.error('ERROR 💥', err);
    sendResponse(res, 500, 'An unexpected error occurred');
  }
};

module.exports = errorHandler;
