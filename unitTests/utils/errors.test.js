/**
 * errors.test.js: Unit Tests for Errors Utility
 */


const errors = require('../../src/utils/errors');

function getResponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Test Cases for Errors.js Utility', () => {
  test('_getErrorResponse Function - General', () => {
    const returnVal = errors._getErrorResponse(400, 'test message');
    expect(returnVal.statusCode).toBe(400);
    expect(returnVal.message).toBe('test message');
  });

  test('errorHandler Function - General', () => {
    const res = getResponseMock();
    errors.errorHandler(null, null, res, null);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(500);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message.toLowerCase()).toMatch(/error/);
  });

  test('invalidRoute Function - General', () => {
    const res = getResponseMock();
    errors.invalidRoute(null, res, null);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(404);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message.toLowerCase()).toMatch(/not found/);
  });

  test('sendErrorResponse Function - With 400 Status and Message', () => {
    const res = getResponseMock();
    errors.sendErrorResponse(res, 400, 'test message');
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message).toBe('test message');
  });

  test('sendErrorResponse Function - With 503 Status and Message', () => {
    const res = getResponseMock();
    errors.sendErrorResponse(res, 503, 'test message');
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(503);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message).toBe('test message');
  });

  test('sendErrorResponse Function - With Invalid Status', () => {
    const res = getResponseMock();
    expect(() => {
      errors.sendErrorResponse(res, 200, 'test message');
    }).toThrow();
  });

  test('sendErrorResponse Function - With Invalid MSG', () => {
    const res = getResponseMock();
    expect(() => {
      errors.sendErrorResponse(res, 400, {});
    }).toThrow();
  });

  test('sendErrorResponse Function - With No MSG', () => {
    const res = getResponseMock();
    errors.sendErrorResponse(res, 400);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message).toBe('An Error occurred');
  });

  test('sendInvalidArgsResponse Function - With MSG', () => {
    const res = getResponseMock();
    errors.sendInvalidArgsResponse(res, 'Missing required name field');
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message).toBe('Missing required name field');
  });

  test('sendInvalidArgsResponse Function - With No MSG', () => {
    const res = getResponseMock();
    errors.sendInvalidArgsResponse(res);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message).toBe('Invalid Arguments');
  });
});
