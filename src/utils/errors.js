/**
 * errors.js: Utility singleton for handling all http responses
 *              for errors and issues.
 */


// Error Strings
const internalErrorMsg = 'Internal Server Error';
const invalidRouteMsg = 'API not found';
const invalidArgsMsg = 'Invalid Arguments';
const defaultErrorMsg = 'An Error occurred';

/**
 * Setup to expose.
 * @type {Object}
 */
const errors = module.exports;

/* private-functions - Exposed via _ for unit testing */
// Helper function defining error response format
errors._getErrorResponse = function _getErrorResponse(statusCode, message) {
  return {
    statusCode,
    message: message || defaultErrorMsg,
  };
};
/* end-private-functions */

/**
 * Middleware for Express to handle uncaught errors. Include in chain after any
 * custom error handling/logging.
 * @example
 *   app.use(errors.errorHandler);
 */
errors.errorHandler = function (err, req, res, next) {
  return errors.sendErrorResponse(res, 500, internalErrorMsg);
};

/**
 * Middleware for Express to handle invalid routes. Include in chain after all
 * other route handlers.
 * @example
 *   app.use(errors.invalidRoute);
 */
errors.invalidRoute = function (req, res, next) {
  return errors.sendErrorResponse(res, 404, invalidRouteMsg);
};

/**
 * A default function to filter the properties of the res object.
 * @param {Object} res - the HTTP express response obj
 * @param {number} statusCode - the http response code (must be 4XX or 5XX)
 * @param {string} message - the error message
 * @return {*}
 */
errors.sendErrorResponse = function (res, statusCode, message) {
  if (statusCode && (statusCode < 400 || statusCode >= 600)) {
    throw new Error('HTTP status code be related to error: 4XX, 5XX');
  }
  if (message && typeof message !== 'string') {
    throw new Error('Message must be of type string');
  }
  res.status(statusCode).json(this._getErrorResponse(statusCode, message));
};

/**
 * A default function to filter the properties of the res object.
 * @param {Object} res - the HTTP express response obj
 * @param {string} message - the error message detailing issue with arguments
 * @return {*}
 */
errors.sendInvalidArgsResponse = function (res, message) {
  const responseMsg = message || invalidArgsMsg;
  errors.sendErrorResponse(res, 400, responseMsg);
};
Object.freeze(errors);
