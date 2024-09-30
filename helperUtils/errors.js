class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class BadRequestError extends AppError {
    constructor(message) {
      super(message || 'Bad Request', 400);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message) {
      super(message || 'Not Found', 404);
    }
  }
  
  class InternalServerError extends AppError {
    constructor(message) {
      super(message || 'Internal Server Error', 500);
    }
  }
  
  module.exports = {
    AppError,
    BadRequestError,
    NotFoundError,
    InternalServerError,
  };
  