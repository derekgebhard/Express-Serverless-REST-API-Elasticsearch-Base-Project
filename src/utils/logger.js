/**
 * logger.js: Utility for handling all server logging and logging config
 */


const winston = require('winston');
const crypto = require('crypto');

const logLevels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
const defaultLevel = process.env.LOG_LEVEL || 'debug';

// Service wide log settings. Logs to console are captured by Cloudwatch automatically
const winstonLogger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      level: defaultLevel,
    }),
  ],
});

/**
 * Setup to expose.
 * @type {Object}
 */
const logger = module.exports;

/* private-functions - Exposed via _ for unit testing */
// Helper functions determining what we log from Request and Response objects
logger._getReqLogData = function (req) {
  return {
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method,
    query: req.query,
    params: req.params,
    headers: req.headers,
    body: this._getBodyStr(req.body, req.headers),
    ip: req.ip,
    startTime: req._startTime,
  };
};

logger._getResLogData = function (req, res, body) {
  return {
    statusCode: res.statusCode,
    headers: res.getHeaders(),
    body: this._getBodyStr(body, res.getHeaders()),
    responseTime: (new Date()) - req._startTime,
  };
};

logger._getBodyStr = function (body, headers) {
  const stringBody = body && body.toString();
  let jsonStr;
  if (headers && headers['content-type'] && headers['content-type'].indexOf('json') >= 0) {
    try {
      jsonStr = JSON.parse(body);
    } catch (e) {
      jsonStr = undefined;
    }
  }
  return jsonStr || stringBody;
};

/* end-private-functions */

/**
 * Middleware for Express to log uncaught errors.
 * Include in chain before custom error handling.
 * @example
 *   app.use(logger.errorLogger);
 */
logger.errorLogger = function (err, req, res, next) {
  logger.error('Unhandled Exception', { stack: err.stack }, req);
  next(err);
};

/**
 * Middleware for Express to log uncaught http req/res.
 * Include in chian before routes handling request.
 * @example
 *   app.use(logger.httpLogger);
 */
logger.httpLogger = function (req, res, next) {
  req._startTime = (new Date());
  // Construct a random request Id using crypto instead of taking dependency on external UUID.
  // Suspect this is good enough given we are just doing this for logs.
  req.uniqueId = crypto.randomBytes(16).toString('hex');
  logger.info('HTTP Request', logger._getReqLogData(req), req);
  // Hook into when the response is complete to log response
  const { end } = res;
  res.end = (chunk, encoding) => {
    res.responseTime = (new Date()) - req._startTime;
    res.end = end;
    res.end(chunk, encoding);
    logger.info('HTTP Response', logger._getResLogData(req, res, chunk), req);
  };
  next();
};

/**
 * Add a new message to the logs
 * @param {string} level - the HTTP express response obj
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.log = function (level, message, metadata, req) {
  if (!logLevels.includes(level)) {
    throw new Error('Invalid log level supplied');
  }
  let requestId = '';
  if (req && req.uniqueId) {
    requestId = req.uniqueId;
  }
  if (!message || typeof message !== 'string') {
    throw new Error('Message must be of type string');
  }
  if (metadata && typeof metadata !== 'object') {
    throw new Error('metadata must be object to serialize to JSON');
  }
  winstonLogger.log({
    level,
    requestId,
    message,
    data: metadata,
  });
};

/**
 * Add a new error message to the logs
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.error = function (message, metadata, req) {
  logger.log('error', message, metadata, req);
};

/**
 * Add a new warn message to the logs
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.warn = function (message, metadata, req) {
  logger.log('warn', message, metadata, req);
};

/**
 * Add a new info message to the logs
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.info = function (message, metadata, req) {
  logger.log('info', message, metadata, req);
};

/**
 * Add a new verbose message to the logs
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.verbose = function (message, metadata, req) {
  logger.log('verbose', message, metadata, req);
};

/**
 * Add a new debug message to the logs
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.debug = function (message, metadata, req) {
  logger.log('debug', message, metadata, req);
};

/**
 * Add a new silly message to the logs
 * @param {string} message - the log message
 * @param {Object} [metadata] - data to log in form of JSON object
 * @param {Object} [req] - the express http req object
 */
logger.silly = function (message, metadata, req) {
  logger.log('silly', message, metadata, req);
};
Object.freeze(logger);
