const mongoose = require("mongoose");
const { camelCase } = require('lodash');

/**
 * Sends a JSON response with optional status code, message, data, and meta information.
 * @param {object} res - Express response object.
 * @param {number} [statusCode=200] - HTTP status code (default: 200).
 * @param {string} [messageBase=''] - Base message to send in the response (default: '').
 * @param {object|array|null} [data=null] - Data to send in the response body (default: null).
 * @param {object} [meta] - Additional metadata to include in the response (optional).
 */
const sendResponse = (res, statusCode = 200, messageBase = "", data = null, meta) => {
  // Prepare the response object
  const response = {};

  // Determine the action based on the request method
  let action;
  switch (res.req.method) {
    case "POST":
      action = "create";
      break;
    case "PUT":
    case "PATCH":
      action = "update";
      break;
    case "DELETE":
      action = "delete";
      break;
    default:
      action = "fetch";
  }

  // Check if statusCode is in the 2xx range for success messages
  if (statusCode >= 200 && statusCode < 300 && messageBase) {
    let message = "";

    switch (action) {
      case "fetch":
        if (data && data.length > 0) {
          if (meta && meta.currentPage && meta.currentPage > 1) {
            message = `${messageBase}, more records loaded`;
          } else {
            message = `${messageBase} fetched successfully`;
          }
        } else {
          message = `No ${messageBase.toLowerCase()} found`;
        }
        break;
      case "create":
        message = `${messageBase} created successfully`;
        break;
      case "update":
        message = `${messageBase} updated successfully`;
        break;
      case "delete":
        message = `${messageBase} deleted successfully`;
        break;
      default:
        message = `${messageBase} processed successfully`;
    }

    // Include message in the response
    if (message) {
      response.message = message;
    }
  } else if (messageBase) {
    response.message = messageBase;
  }

  // Include data in the response if provided
  if (data !== undefined && data !== null) {
    response.data = data;
  }

  // Include meta information if provided
  if (meta) {
    response.meta = meta;
  }

  // Send the response with the appropriate status code
  res.status(statusCode).json(response);
};

// Helper function to parse pagination parameters
const parsePaginationParams = (req) => {
  let { page = 1, limit = 10 } = req.query;

  // Parse page and limit as integers and ensure they are valid
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  return { page, limit };
};

// Helper function to generate meta information
const generateMeta = (page, limit, total) => {
  return {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    limit: limit,
  };
};

// Helper function to validate an array of MongoDB ObjectIds with detailed error messages
const validateObjectIdsArr = (res, ids, fieldNames, errorMessage = "Invalid request data") => {
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const fieldName = fieldNames[i];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, `${errorMessage}: Invalid ObjectId for field '${fieldName}'`);
      return false;
    }
  }
  return true;
};

// Helper function to convert underscores to spaces
const convertUnderscoresToSpaces = (str) => {
  return str.replace(/_/g, ' ');
};

// Generic validation function
const validateParams = (req, res, options = {}) => {
  const {
    queryParams = [],
    pathParams = [],
    formFields = [],
    rawData = [],
    objectIdFields = [],
  } = options;

  // Validate query parameters
  for (const param of queryParams) {
    if (req.query[param]) {
      req.query[camelCase(param)] = convertUnderscoresToSpaces(req.query[param]);
    } else {
      sendResponse(res, 400, `Missing query parameter: '${param}'`);
      return false;
    }
  }

  // Validate path parameters
  for (const param of pathParams) {
    if (req.params[param]) {
      req.params[camelCase(param)] = convertUnderscoresToSpaces(req.params[param]);
    } else {
      sendResponse(res, 400, `Missing path parameter: '${param}'`);
      return false;
    }
  }

  // Validate form fields
  for (const param of formFields) {
    if (req.body[param]) {
      req.body[camelCase(param)] = convertUnderscoresToSpaces(req.body[param]);
    } else {
      sendResponse(res, 400, `Missing form field: '${param}'`);
      return false;
    }
  }

  // Validate raw data
  for (const param of rawData) {
    if (req.body[param]) {
      req.body[camelCase(param)] = convertUnderscoresToSpaces(req.body[param]);
    } else {
      sendResponse(res, 400, `Missing raw data field: '${param}'`);
      return false;
    }
  }

  // Validate MongoDB ObjectId fields
  if (objectIdFields.length > 0) {
    const objectIdsToValidate = objectIdFields.map((field) => req.body[field]).filter(Boolean);
    if (!validateObjectIdsArr(res, objectIdsToValidate, objectIdFields)) {
      return false;
    }
  }

  return true;
};

// Example usage
const exampleMiddleware = (req, res, next) => {
  const validationOptions = {
    queryParams: ['some_query_param'],
    pathParams: ['some_path_param'],
    formFields: ['title', 'description', 'image'],
    objectIdFields: ['userId', 'postId']
  };

  if (!validateParams(req, res, validationOptions)) {
    return; // Invalid request data response already sent by validateParams
  }

  next();
};

module.exports = {
  sendResponse,
  parsePaginationParams,
  generateMeta,
  validateObjectIdsArr,
  validateParams,
  exampleMiddleware,
};
