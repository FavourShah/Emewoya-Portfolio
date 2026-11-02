import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const journeyRouter = express.Router();

const journeySchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  body: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// GET /api/admin/journey
journeyRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, label, title, body, sort_order AS "sortOrder", published
       FROM journey_steps
       ORDER BY sort_order ASC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/journey
journeyRouter.post('/', validate(journeySchema), async (req, res, next) => {
  const { label, title, body, sortOrder, published } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO journey_steps (label, title, body, sort_order, published)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, label, title, body, sort_order AS "sortOrder", published`,
      [label, title, body || null, sortOrder, published]
    );
    bumpCacheVersion();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/journey/:id
journeyRouter.put('/:id', validate(journeySchema), async (req, res, next) => {
  const { id } = req.params;
  const { label, title, body, sortOrder, published } = req.body;
  try {
    const result = await pool.query(
      `UPDATE journey_steps
       SET label = $1, title = $2, body = $3, sort_order = $4, published = $5
       WHERE id = $6
       RETURNING id, label, title, body, sort_order AS "sortOrder", published`,
      [label, title, body || null, sortOrder, published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journey step not found' });
    }

    bumpCacheVersion();
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/journey/:id
journeyRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM journey_steps WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journey step not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/journey/reorder
journeyRouter.post('/reorder', validate(reorderSchema), async (req, res, next) => {
  const { ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < ids.length; index++) {
      await client.query('UPDATE journey_steps SET sort_order = $1 WHERE id = $2', [index + 1, ids[index]]);
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

