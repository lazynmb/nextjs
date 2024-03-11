const supertest = require('supertest');
const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let server, request;

beforeAll((done) => {
  app.prepare().then(() => {
    server = http.createServer((req, res) => handle(req, res));
    server.listen(0, () => {
      const { port } = server.address();
      request = supertest(`http://localhost:${port}`);
      done();
    });
  });
});

afterAll((done) => {
  server.close(done);
});

describe('GET /api/getDataForMonth', () => {
  it('should return data for the specified month', async () => {
    const month = '2024-02';
    const response = await request.get(`/api/getDataForMonth?month=${month}`);

    expect(response.statusCode).toBe(200);
    // Załóżmy, że oczekujemy konkretnej struktury odpowiedzi, dostosuj asercje do twojego przypadku
    expect(response.body).toHaveProperty('data');
    // np. expect(response.body.data).toEqual(očekiwaneDane);
  });
});
