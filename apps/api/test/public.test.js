import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Public Site Payload (/api/public/site)', () => {
  it('returns complete site data with caching headers', async () => {
    const res = await request(app).get('/api/public/site');
    expect(res.status).toBe(200);

    // Headers
    expect(res.headers['cache-control']).toContain('public, max-age=60');
    expect(res.headers.etag).toBeDefined();

    const body = res.body;

    // Structure checks
    expect(body).toHaveProperty('settings');
    expect(body).toHaveProperty('roles');
    expect(body).toHaveProperty('mapNodes');
    expect(body).toHaveProperty('journey');
    expect(body).toHaveProperty('certGroups');
    expect(body).toHaveProperty('projects');
    expect(body).toHaveProperty('teaserCount');
    expect(body).toHaveProperty('latestPost');

    // Settings
    expect(body.settings.fullName).toBe('Favour Ezechi-Oriaku');
    expect(body.settings.timezone).toBe('Africa/Lagos');

    // Roles and order
    expect(Array.isArray(body.roles)).toBe(true);
    expect(body.roles.length).toBeGreaterThan(0);

    // CRITICAL: Teaser titles and slugs must never be returned
    expect(body.teaserCount).toBe(3);
    for (const project of body.projects) {
      expect(project.slug).not.toMatch(/^teaser/);
      expect(project.title).not.toMatch(/^teaser/i);
    }

    // Test ETag 304
    const cachedRes = await request(app)
      .get('/api/public/site')
      .set('If-None-Match', res.headers.etag);

    expect(cachedRes.status).toBe(304);
  });
});

