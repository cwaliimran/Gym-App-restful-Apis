const mongoose = require("mongoose");
/**
 * Sends a JSON response with optional status code, message, data, and meta information.
 * @param {object} res - Express response object.
 * @param {number} [statusCode=200] - HTTP status code (default: 200).
 * @param {string} [message=''] - Message to send in the response (default: '').
 * @param {object|array|null} [data=null] - Data to send in the response body (default: null).
 * @param {object} [meta] - Additional metadata to include in the response (optional).
 */
const sendResponse = (res, statusCode, messageBase = "", data = null, meta) => {
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

  // If statusCode is not provided, get it from res object
  if (!statusCode) {
    statusCode = res.statusCode || 200; // Default to 200 if res.statusCode is not set
  }

  // Construct dynamic message based on data and action
  if (messageBase) {
  let message = "";

    switch (action) {
      case "fetch":
        if (data && data.length > 0) {
          if (meta.currentPage && meta.currentPage > 1) {
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

// Helper function to validate an array of MongoDB ObjectIds
const validateObjectIds = (res, ids, errorMessage = "Invalid request data") => {
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      sendResponse(res, 400, `${errorMessage}`);
      return false;
    }
  }
  return true;
};


module.exports = {
  sendResponse,
  parsePaginationParams,
  generateMeta,
  validateObjectIds,
};
