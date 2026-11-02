import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const mapNodesRouter = express.Router();

const mapNodeSchema = z.object({
  label: z.string().min(1),
  side: z.enum(['left', 'right']),
  sortOrder: z.number().int().optional().default(0),
  published: z.boolean().optional().default(true),
});

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// GET /api/admin/map-nodes
mapNodesRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, label, side, sort_order AS "sortOrder", published
       FROM map_nodes
       ORDER BY side ASC, sort_order ASC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/map-nodes
mapNodesRouter.post('/', validate(mapNodeSchema), async (req, res, next) => {
  const { label, side, sortOrder, published } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO map_nodes (label, side, sort_order, published)
       VALUES ($1, $2, $3, $4)
       RETURNING id, label, side, sort_order AS "sortOrder", published`,
      [label, side, sortOrder, published]
    );
    bumpCacheVersion();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/map-nodes/:id
mapNodesRouter.put('/:id', validate(mapNodeSchema), async (req, res, next) => {
  const { id } = req.params;
  const { label, side, sortOrder, published } = req.body;
  try {
    const result = await pool.query(
      `UPDATE map_nodes
       SET label = $1, side = $2, sort_order = $3, published = $4
       WHERE id = $5
       RETURNING id, label, side, sort_order AS "sortOrder", published`,
      [label, side, sortOrder, published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Map node not found' });
    }

    bumpCacheVersion();
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/map-nodes/:id
mapNodesRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM map_nodes WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Map node not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/map-nodes/reorder
mapNodesRouter.post('/reorder', validate(reorderSchema), async (req, res, next) => {
  const { ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < ids.length; index++) {
      await client.query('UPDATE map_nodes SET sort_order = $1 WHERE id = $2', [index + 1, ids[index]]);
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

