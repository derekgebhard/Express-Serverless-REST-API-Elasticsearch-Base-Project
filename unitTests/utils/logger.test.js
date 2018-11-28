/**
 * logger.test.js: Unit Tests for Logger Utility
 */


let logFunc; let
  logger;

function getStandardRequestObject() {
  return {
    url: '/?name=JohnSmith',
    originalUrl: '/?name=JohnSmith',
    method: 'GET',
    query: {
      name: 'JohnSmith',
    },
    params: {},
    headers: {
      'user-agent': 'curl/7.54.0',
      accept: '*/*',
      'content-type': 'application/json',
      'content-length': '35',
      'x-request-id': 'offlineContext_requestId_29154871984876585',
    },
    body: '{ test: "foo" }',
    ip: '127.0.0.1',
  };
}

function getStandardResponseObject() {
  return {
    statusCode: 404,
    headers: {
      'x-powered-by': 'Express',
      'content-type': 'application/json; charset=utf-8',
      'content-length': '44',
      etag: 'W/"2c-6j52MGvOK5TME3IxUM373cvEOuo"',
    },
    getHeaders() { return this.headers; },
    body: '{statusCode: 404, message: "API not found"}',
    end: jest.fn(),
  };
}

beforeEach(() => {
  // Setup each test with New Winston Instance to Test Log Output
  jest.resetModules();

  // Mock Winston Module to be used by Logger Utility
  jest.mock('winston');
  const winston = require('winston');
  // Automock required setup functions to bootstrap Logger
  winston.format.timestamp = jest.fn();
  winston.format.json = jest.fn();
  winston.format.combine = jest.fn();
  winston.transports.Console = jest.fn();

  // this is the Winston Log Message function we use to test behavior of utiltiy
  logFunc = jest.fn();
  winston.createLogger = jest.fn().mockReturnValue({
    log: logFunc,
  });
  // Utility to be tested
  logger = require('../../src/utils/logger');
});

describe('Test Middleware Cases for Logger.js Utility', () => {
  test('httpLogger Function - General', () => {
    const req = getStandardRequestObject();
    const res = getStandardResponseObject();
    const next = jest.fn();
    logger.httpLogger(req, res, next);

    // Test Request Logging
    expect(next.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('info');
    expect(logFunc.mock.calls[0][0].message).toBe('HTTP Request');
    expect(logFunc.mock.calls[0][0].requestId).toBe(req.uniqueId);
    expect(logFunc.mock.calls[0][0].data.url).toBe(req.url);
    expect(logFunc.mock.calls[0][0].data.originalUrl).toBe(req.originalUrl);
    expect(logFunc.mock.calls[0][0].data.method).toBe(req.method);
    expect(logFunc.mock.calls[0][0].data.query).toBe(req.query);
    expect(logFunc.mock.calls[0][0].data.params).toBe(req.params);
    expect(logFunc.mock.calls[0][0].data.headers).toBe(req.headers);
    expect(logFunc.mock.calls[0][0].data.ip).toBe(req.ip);
    expect(logFunc.mock.calls[0][0].data.body).toBe(req.body);

    // Test Async Response Logging
    res.end(res.body);
    expect(res.end.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls.length).toBe(2);
    expect(logFunc.mock.calls[1][0].level).toBe('info');
    expect(logFunc.mock.calls[1][0].message).toBe('HTTP Response');
    expect(logFunc.mock.calls[1][0].requestId).toBe(req.uniqueId);
    expect(logFunc.mock.calls[1][0].data.statusCode).toBe(res.statusCode);
    expect(logFunc.mock.calls[1][0].data.headers).toBe(res.headers);
    expect(logFunc.mock.calls[1][0].data.body).toBe(res.body);
  });

  test('httpLogger Function - Undefined properties on request and response object', () => {
    const req = { method: 'POST' };
    const res = { end: jest.fn(), getHeaders: () => {} };
    const next = jest.fn();
    logger.httpLogger(req, res, next);

    // Test Request Logging
    expect(next.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('info');
    expect(logFunc.mock.calls[0][0].message).toBe('HTTP Request');
    expect(logFunc.mock.calls[0][0].requestId).toBe(req.uniqueId);
    expect(logFunc.mock.calls[0][0].data.method).toBe(req.method);
    expect(logFunc.mock.calls[0][0].data.url).not.toBeDefined();
    expect(logFunc.mock.calls[0][0].data.originalUrl).not.toBeDefined();

    // Test Async Response Logging
    res.end(res.body);
    expect(res.end.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls.length).toBe(2);
    expect(logFunc.mock.calls[1][0].level).toBe('info');
    expect(logFunc.mock.calls[1][0].message).toBe('HTTP Response');
    expect(logFunc.mock.calls[1][0].requestId).toBe(req.uniqueId);
    expect(logFunc.mock.calls[1][0].data.statusCode).not.toBeDefined();
    expect(logFunc.mock.calls[1][0].data.headers).not.toBeDefined();
    expect(logFunc.mock.calls[1][0].data.body).not.toBeDefined();
  });

  test('errorLogger Function - General', () => {
    const req = getStandardRequestObject();
    req.uniqueId = '32ea8ea0c194681d65b7345734b06dbf';
    const res = getStandardResponseObject();
    const next = jest.fn();
    const err = { stack: 'test stack message' };
    logger.errorLogger(err, req, res, next);

    // Test Request Logging
    expect(next.mock.calls.length).toBe(1);
    expect(next.mock.calls[0][0]).toBe(err);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('error');
    expect(logFunc.mock.calls[0][0].message).toBe('Unhandled Exception');
    expect(logFunc.mock.calls[0][0].requestId).toBe(req.uniqueId);
    expect(logFunc.mock.calls[0][0].data.stack).toBe(err.stack);
  });
});

describe('Test Logging Function Cases for Logger.js Utility', () => {
  test('log Function - Working with all params', () => {
    const level = 'error';
    const message = 'This is a log message';
    const metadata = {
      name: 'John',
      score: 434,
    };
    const req = getStandardRequestObject();
    req.uniqueId = '32ea8ea0c194681d65b7345734b06dbf';
    logger.log(level, message, metadata, req);

    // Check Logging
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe(level);
    expect(logFunc.mock.calls[0][0].message).toBe(message);
    expect(logFunc.mock.calls[0][0].data).toBe(metadata);
    expect(logFunc.mock.calls[0][0].requestId).toBe(req.uniqueId);
  });

  test('log Function - Working with missing req param', () => {
    const level = 'error';
    const message = 'This is a log message';
    const metadata = {
      name: 'John',
      score: 434,
    };
    logger.log(level, message, metadata);

    // Check Logging
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe(level);
    expect(logFunc.mock.calls[0][0].message).toBe(message);
    expect(logFunc.mock.calls[0][0].data).toBe(metadata);
    expect(logFunc.mock.calls[0][0].requestId).toBe('');
  });

  test('log Function - Working with missing metadata and req param', () => {
    const level = 'error';
    const message = 'This is a log message';
    logger.log(level, message);

    // Check Logging
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe(level);
    expect(logFunc.mock.calls[0][0].message).toBe(message);
    expect(logFunc.mock.calls[0][0].data).not.toBeDefined();
    expect(logFunc.mock.calls[0][0].requestId).toBe('');
  });

  test('log Function - Working with missing metadata param', () => {
    const level = 'error';
    const message = 'This is a log message';
    const req = getStandardRequestObject();
    req.uniqueId = '32ea8ea0c194681d65b7345734b06dbf';
    logger.log(level, message, null, req);

    // Check Logging
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe(level);
    expect(logFunc.mock.calls[0][0].message).toBe(message);
    expect(logFunc.mock.calls[0][0].data).toBeNull();
    expect(logFunc.mock.calls[0][0].requestId).toBe(req.uniqueId);
  });

  test('log Function - Invalid Level', () => {
    const level = 'fakeLevel';
    const message = 'This is a log message';

    expect(() => {
      logger.log(level, message);
    }).toThrow();
  });

  test('log Function - Invalid Message', () => {
    const level = 'error';
    const message = {};

    expect(() => {
      logger.log(level, message);
    }).toThrow();
  });

  test('log Function - Invalid Metadata', () => {
    const level = 'error';
    const message = 'This is a log message';
    const metadata = 343;

    expect(() => {
      logger.log(level, message, metadata);
    }).toThrow();
  });

  test('error Function - General', () => {
    const message = 'This is a log message';
    logger.error(message);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('error');
    expect(logFunc.mock.calls[0][0].message).toBe(message);
  });

  test('warn Function - General', () => {
    const message = 'This is a log message';
    logger.warn(message);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('warn');
    expect(logFunc.mock.calls[0][0].message).toBe(message);
  });

  test('info Function - General', () => {
    const message = 'This is a log message';
    logger.info(message);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('info');
    expect(logFunc.mock.calls[0][0].message).toBe(message);
  });

  test('verbose Function - General', () => {
    const message = 'This is a log message';
    logger.verbose(message);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('verbose');
    expect(logFunc.mock.calls[0][0].message).toBe(message);
  });

  test('debug Function - General', () => {
    const message = 'This is a log message';
    logger.debug(message);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('debug');
    expect(logFunc.mock.calls[0][0].message).toBe(message);
  });

  test('silly Function - General', () => {
    const message = 'This is a log message';
    logger.silly(message);
    expect(logFunc.mock.calls.length).toBe(1);
    expect(logFunc.mock.calls[0][0].level).toBe('silly');
    expect(logFunc.mock.calls[0][0].message).toBe(message);
  });
});
