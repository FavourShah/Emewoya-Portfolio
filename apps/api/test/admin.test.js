import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { generateAccessToken } from '../src/lib/tokens.js';

describe('Admin Routes & Auth Protection', () => {
  const fakeAdminToken = generateAccessToken({
    id: '00000000-0000-0000-0000-000000000001',
    role: 'admin',
  });

  describe('Unauthenticated requests are rejected', () => {
    it('GET /api/admin/roles returns 401 without token', async () => {
      const res = await request(app).get('/api/admin/roles');
      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Unauthorized');
    });

    it('GET /api/admin/settings returns 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', 'Bearer invalid_garbage_token');
      expect(res.status).toBe(401);
    });

    it('POST /api/admin/uploads/sign returns 401 without token', async () => {
      const res = await request(app).post('/api/admin/uploads/sign').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('Authenticated requests succeed', () => {
    it('GET /api/admin/roles returns roles list with valid token', async () => {
      const res = await request(app)
        .get('/api/admin/roles')
        .set('Authorization', `Bearer ${fakeAdminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET /api/admin/settings returns settings with valid token', async () => {
      const res = await request(app)
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${fakeAdminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('fullName');
    });

    it('POST /api/admin/uploads/sign returns signed params with valid token', async () => {
      const res = await request(app)
        .post('/api/admin/uploads/sign')
        .set('Authorization', `Bearer ${fakeAdminToken}`)
        .send({ folder: 'portfolio/projects' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('signature');
      expect(res.body.folder).toBe('portfolio/projects');
    });
  });

  describe('Login failure and rate limiting behavior', () => {
    it('POST /api/auth/login returns 401 on wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'wrongpassword123' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });
});

