const request = require('supertest');
const app = require('../index');

afterAll((done) => {
    server.close(done);
  });

describe('GET /api/notes', () => {
  test('should return all notes', async () => {
    const response = await request(app).get('/api/notes');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(3);
  });
});

describe('POST /api/notes', () => {
  test('should create a new note', async () => {
    const newNote = { content: 'Test note', important: true };
    const response = await request(app)
      .post('/api/notes')
      .send(newNote)
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe('Test note');
  });

  test('should return 400 if content is missing', async () => {
    const newNote = { important: true };
    const response = await request(app)
      .post('/api/notes')
      .send(newNote)
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('content missing');
  });
});

describe('GET /api/notes/:id', () => {
  test('should return a note by ID', async () => {
    const response = await request(app).get('/api/notes/1');
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe('HTML is easy');
  });

  test('should return 404 if note not found', async () => {
    const response = await request(app).get('/api/notes/999');
    expect(response.statusCode).toBe(404);
  });
});

describe('DELETE /api/notes/:id', () => {
  test('should delete a note by ID', async () => {
    const response = await request(app).delete('/api/notes/1');
    expect(response.statusCode).toBe(204);
  });
});
