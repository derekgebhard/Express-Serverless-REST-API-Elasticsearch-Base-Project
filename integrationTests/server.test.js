/**
 * server.test.js: Integration tests calling rest endpoints
 */
const request = require('supertest');

const path = process.env.SERVER_PATH;

describe('Testing the root path', () => {
  test('Test GET Succeeds', async (done) => {
    const response = await request(path).get('/?name=John');
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body.message).toBe('Hello John!');
    done();
  });

  test('Test GET Invalid Route', async (done) => {
    const response = await request(path).get('/test');
    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body.message).toBe('API not found');
    done();
  });

  test('Test GET Invalid Parameter', async (done) => {
    const response = await request(path).get('/');
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body.message).toMatch(/name is required/);
    done();
  });
});
