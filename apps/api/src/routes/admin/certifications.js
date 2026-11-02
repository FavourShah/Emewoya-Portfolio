import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const certificationsRouter = express.Router();

const certSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().min(1),
  status: z.enum(['passed', 'in_progress', 'planned']).default('in_progress'),
  credentialUrl: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// GET /api/admin/certifications
certificationsRouter.get('/', async (req, res, next) => {
  const { groupId } = req.query;
  try {
    let queryText = `
      SELECT
        c.id,
        c.group_id AS "groupId",
        g.name AS "groupName",
        c.title,
        c.status,
        c.credential_url AS "credentialUrl",
        c.sort_order AS "sortOrder",
        c.published
      FROM certifications c
      LEFT JOIN cert_groups g ON g.id = c.group_id
    `;
    const params = [];
    if (groupId) {
      queryText += ' WHERE c.group_id = $1';
      params.push(groupId);
    }
    queryText += ' ORDER BY c.sort_order ASC, c.title ASC';

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/certifications
certificationsRouter.post('/', validate(certSchema), async (req, res, next) => {
  const { groupId, title, status, credentialUrl, sortOrder, published } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO certifications (group_id, title, status, credential_url, sort_order, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING
        id,
        group_id AS "groupId",
        title,
        status,
        credential_url AS "credentialUrl",
        sort_order AS "sortOrder",
        published`,
      [groupId, title, status, credentialUrl || null, sortOrder, published]
    );
    bumpCacheVersion();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/certifications/:id
certificationsRouter.put('/:id', validate(certSchema), async (req, res, next) => {
  const { id } = req.params;
  const { groupId, title, status, credentialUrl, sortOrder, published } = req.body;
  try {
    const result = await pool.query(
      `UPDATE certifications
       SET group_id = $1, title = $2, status = $3, credential_url = $4, sort_order = $5, published = $6
       WHERE id = $7
       RETURNING
        id,
        group_id AS "groupId",
        title,
        status,
        credential_url AS "credentialUrl",
        sort_order AS "sortOrder",
        published`,
      [groupId, title, status, credentialUrl || null, sortOrder, published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }

    bumpCacheVersion();
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/certifications/:id
certificationsRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM certifications WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/certifications/reorder
certificationsRouter.post('/reorder', validate(reorderSchema), async (req, res, next) => {
  const { ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < ids.length; index++) {
      await client.query('UPDATE certifications SET sort_order = $1 WHERE id = $2', [index + 1, ids[index]]);
    }
    await client.query('COMMIT');
    bumpCacheVersion();
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

