const request = require('supertest');
const { expect } = require('chai');
const app = require('../../index');

describe('Notes API', () => {
  it('GET /api/notes should return an array', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('POST /api/notes should create a new note', async () => {
    const newNote = { content: 'A test note', important: true };
    const res = await request(app).post('/api/notes').send(newNote);
    expect(res.status).to.equal(200);
    expect(res.body).to.include({ content: 'A test note', important: true });
    expect(res.body).to.have.property('id');
  });

  it('POST /api/notes without content should return 400', async () => {
    const res = await request(app).post('/api/notes').send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'content missing');
  });

  it('GET /api/notes/:id should return a note or 404', async () => {
    const res = await request(app).get('/api/notes/1');
    if (res.status === 200) {
      expect(res.body).to.have.property('id', 1);
    } else {
      expect(res.status).to.equal(404);
    }
  });

  it('DELETE /api/notes/:id should delete a note', async () => {
    // Create a note first
    const postRes = await request(app).post('/api/notes').send({ content: 'Note to delete' });
    const idToDelete = postRes.body.id;

    const deleteRes = await request(app).delete(`/api/notes/${idToDelete}`);
    expect(deleteRes.status).to.equal(204);
  });
});
