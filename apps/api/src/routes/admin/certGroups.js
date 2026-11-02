import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const certGroupsRouter = express.Router();

const certGroupSchema = z.object({
  name: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
});

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// GET /api/admin/cert-groups
certGroupsRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, subtitle, sort_order AS "sortOrder"
       FROM cert_groups
       ORDER BY sort_order ASC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/cert-groups
certGroupsRouter.post('/', validate(certGroupSchema), async (req, res, next) => {
  const { name, subtitle, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO cert_groups (name, subtitle, sort_order)
       VALUES ($1, $2, $3)
       RETURNING id, name, subtitle, sort_order AS "sortOrder"`,
      [name, subtitle || null, sortOrder]
    );
    bumpCacheVersion();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/cert-groups/:id
certGroupsRouter.put('/:id', validate(certGroupSchema), async (req, res, next) => {
  const { id } = req.params;
  const { name, subtitle, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cert_groups
       SET name = $1, subtitle = $2, sort_order = $3
       WHERE id = $4
       RETURNING id, name, subtitle, sort_order AS "sortOrder"`,
      [name, subtitle || null, sortOrder, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification group not found' });
    }

    bumpCacheVersion();
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/cert-groups/:id
certGroupsRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cert_groups WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certification group not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/cert-groups/reorder
certGroupsRouter.post('/reorder', validate(reorderSchema), async (req, res, next) => {
  const { ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < ids.length; index++) {
      await client.query('UPDATE cert_groups SET sort_order = $1 WHERE id = $2', [index + 1, ids[index]]);
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

