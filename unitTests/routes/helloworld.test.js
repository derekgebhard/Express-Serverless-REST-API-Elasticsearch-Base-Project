/**
 * helloworld.test.js: Unit Tests for helloworld routes
 */

const helloworldRoutes = require('../../src/routes/helloworld');

function getResponseMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('Test Cases for helloworld routes', () => {
  test('Check No Name Supplied', () => {
    const req = {
      ip: '216.3.128.12',
      query: {},
    };
    const res = getResponseMock();
    helloworldRoutes.getHello(req, res);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].statusCode).toBe(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/name is required/);
  });

  test('Check When Name is Empty', () => {
    const req = {
      ip: '216.3.128.12',
      query: {
        name: undefined,
      },
    };
    const res = getResponseMock();
    helloworldRoutes.getHello(req, res);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].statusCode).toBe(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/name is required/);
  });

  test('Check When Name is Too Long', () => {
    const req = {
      ip: '216.3.128.12',
      query: {
        name: 'TooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooTooooooooooooooooLong',
      },
    };
    const res = getResponseMock();
    helloworldRoutes.getHello(req, res);
    expect(res.status.mock.calls.length).toBe(1);
    expect(res.status.mock.calls[0][0]).toBe(400);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].statusCode).toBe(400);
    expect(res.json.mock.calls[0][0].message).toMatch(/name is required/);
  });

  test('Check When Name is Supplied', () => {
    const req = {
      ip: '216.3.128.12',
      query: {
        name: 'John',
      },
    };
    const res = getResponseMock();
    helloworldRoutes.getHello(req, res);
    expect(res.json.mock.calls.length).toBe(1);
    expect(res.json.mock.calls[0][0].message).toBe('Hello John!');
  });

  test('Test Warmup request handling', () => {
    const req = {
    };
    const res = getResponseMock();
    helloworldRoutes.getHello(req, res);
    expect(res.send.mock.calls.length).toBe(1);
    expect(res.send.mock.calls[0][0]).not.toBeDefined();
  });
});
