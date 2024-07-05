/**
 * Sends a JSON response with optional status code, message, data, and meta information.
 * @param {object} res - Express response object.
 * @param {number} [statusCode=200] - HTTP status code (default: 200).
 * @param {string} [message=''] - Message to send in the response (default: '').
 * @param {object|array|null} [data=null] - Data to send in the response body (default: null).
 * @param {object} [meta] - Additional metadata to include in the response (optional).
 */
const sendResponse = (res, statusCode = 200, message = '', data = null, meta) => {
    // Prepare the response object
    const response = {};
  
    // Include message in the response if provided
    if (message !== '') {
      response.message = message;
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
  
  module.exports = sendResponse;
  