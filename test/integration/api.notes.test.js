import request from 'supertest';
import { expect } from 'chai';
import app from '../../index.js';

describe('Notes API', () => {
  it('GET /api/notes returns JSON and 200 OK', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).to.equal(200);
    expect(res.headers['content-type']).to.include('application/json');
    expect(res.body).to.be.an('array');
  });

  it('GET /api/notes/:id returns correct note or 404', async () => {
    const res = await request(app).get('/api/notes/1');
    if (res.status === 200) {
      expect(res.body).to.have.property('id', 1);
    } else {
      expect(res.status).to.equal(404);
    }
  });

  it('POST /api/notes adds a new note', async () => {
    const newNote = { content: 'Test note', important: true };
    const res = await request(app).post('/api/notes').send(newNote);
    expect(res.status).to.equal(200);
    expect(res.body).to.include({ content: 'Test note', important: true });
    expect(res.body).to.have.property('id');
  });

  it('POST /api/notes fails with 400 if content missing', async () => {
    const res = await request(app).post('/api/notes').send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'content missing');
  });

  it('DELETE /api/notes/:id deletes a note', async () => {
    // Insert first
    const postRes = await request(app).post('/api/notes').send({ content: 'To delete' });
    const id = postRes.body.id;

    const deleteRes = await request(app).delete(`/api/notes/${id}`);
    expect(deleteRes.status).to.equal(204);
  });
});
