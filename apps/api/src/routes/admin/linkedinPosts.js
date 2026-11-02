import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const linkedinPostsRouter = express.Router();

const postSchema = z.object({
  postUrl: z.string().min(1),
  excerpt: z.string().min(1).max(280),
  postedOn: z.string().nullable().optional(), // ISO date YYYY-MM-DD, optional
  imagePublicId: z.string().nullable().optional(),
  published: z.boolean().optional().default(true),
});

// GET /api/admin/linkedin-posts
linkedinPostsRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        post_url AS "postUrl",
        excerpt,
        posted_on AS "postedOn",
        image_public_id AS "imagePublicId",
        published,
        created_at AS "createdAt"
       FROM linkedin_posts
       ORDER BY posted_on DESC, created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/linkedin-posts
linkedinPostsRouter.post('/', validate(postSchema), async (req, res, next) => {
  const { postUrl, excerpt, postedOn, imagePublicId, published } = req.body;
  console.log('[linkedin-posts POST] body received:', req.body);
  try {
    const result = await pool.query(
      `INSERT INTO linkedin_posts (post_url, excerpt, posted_on, image_public_id, published)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
        id,
        post_url AS "postUrl",
        excerpt,
        posted_on AS "postedOn",
        image_public_id AS "imagePublicId",
        published,
        created_at AS "createdAt"`,
      [postUrl, excerpt, postedOn, imagePublicId || null, published]
    );
    bumpCacheVersion();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/linkedin-posts/:id
linkedinPostsRouter.put('/:id', validate(postSchema), async (req, res, next) => {
  const { id } = req.params;
  const { postUrl, excerpt, postedOn, imagePublicId, published } = req.body;
  try {
    const result = await pool.query(
      `UPDATE linkedin_posts
       SET post_url = $1, excerpt = $2, posted_on = $3, image_public_id = $4, published = $5
       WHERE id = $6
       RETURNING
        id,
        post_url AS "postUrl",
        excerpt,
        posted_on AS "postedOn",
        image_public_id AS "imagePublicId",
        published,
        created_at AS "createdAt"`,
      [postUrl, excerpt, postedOn, imagePublicId || null, published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    bumpCacheVersion();
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/linkedin-posts/:id
linkedinPostsRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM linkedin_posts WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

