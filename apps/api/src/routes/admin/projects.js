import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const projectsRouter = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const projectSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  tagLine: z.string().nullable().optional(),
  problem: z.string().nullable().optional(),
  solves: z.string().nullable().optional(),
  stackBrief: z.string().nullable().optional(),
  demoUrl: z.string().nullable().optional(),
  repoUrl: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'teaser']).default('draft'),
  sortOrder: z.number().int().optional().default(0),
  tags: z.array(z.string()).optional().default([]),
});

const mediaSchema = z.object({
  publicId: z.string().min(1),
  altText: z.string().min(1),
  sortOrder: z.number().int().optional().default(0),
});

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()),
});

// GET /api/admin/projects
projectsRouter.get('/', async (req, res, next) => {
  try {
    const projectsRes = await pool.query(
      `SELECT
        id,
        slug,
        title,
        tag_line AS "tagLine",
        problem,
        solves,
        stack_brief AS "stackBrief",
        demo_url AS "demoUrl",
        repo_url AS "repoUrl",
        status,
        sort_order AS "sortOrder",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM projects
       ORDER BY sort_order ASC, created_at DESC`
    );

    const mediaRes = await pool.query(
      `SELECT id, project_id AS "projectId", public_id AS "publicId", alt_text AS "altText", sort_order AS "sortOrder"
       FROM project_media
       ORDER BY sort_order ASC`
    );

    const tagsRes = await pool.query(
      `SELECT id, project_id AS "projectId", name
       FROM tech_tags`
    );

    const fullProjects = projectsRes.rows.map((p) => ({
      ...p,
      media: mediaRes.rows.filter((m) => m.projectId === p.id),
      tags: tagsRes.rows.filter((t) => t.projectId === p.id).map((t) => t.name),
    }));

    res.json(fullProjects);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/projects/:id
projectsRouter.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const pRes = await pool.query(
      `SELECT
        id,
        slug,
        title,
        tag_line AS "tagLine",
        problem,
        solves,
        stack_brief AS "stackBrief",
        demo_url AS "demoUrl",
        repo_url AS "repoUrl",
        status,
        sort_order AS "sortOrder",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
       FROM projects
       WHERE id = $1`,
      [id]
    );

    if (pRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const mediaRes = await pool.query(
      `SELECT id, project_id AS "projectId", public_id AS "publicId", alt_text AS "altText", sort_order AS "sortOrder"
       FROM project_media
       WHERE project_id = $1
       ORDER BY sort_order ASC`,
      [id]
    );

    const tagsRes = await pool.query(
      `SELECT name FROM tech_tags WHERE project_id = $1`,
      [id]
    );

    res.json({
      ...pRes.rows[0],
      media: mediaRes.rows,
      tags: tagsRes.rows.map((t) => t.name),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/projects
projectsRouter.post('/', validate(projectSchema), async (req, res, next) => {
  const {
    title,
    slug: rawSlug,
    tagLine,
    problem,
    solves,
    stackBrief,
    demoUrl,
    repoUrl,
    status,
    sortOrder,
    tags,
  } = req.body;

  const slug = rawSlug && rawSlug.trim() ? slugify(rawSlug) : slugify(title);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pRes = await client.query(
      `INSERT INTO projects (slug, title, tag_line, problem, solves, stack_brief, demo_url, repo_url, status, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING
        id, slug, title, tag_line AS "tagLine", problem, solves, stack_brief AS "stackBrief",
        demo_url AS "demoUrl", repo_url AS "repoUrl", status, sort_order AS "sortOrder",
        created_at AS "createdAt", updated_at AS "updatedAt"`,
      [slug, title, tagLine || null, problem || null, solves || null, stackBrief || null, demoUrl || null, repoUrl || null, status, sortOrder]
    );
    const project = pRes.rows[0];

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await client.query(
          `INSERT INTO tech_tags (project_id, name) VALUES ($1, $2)`,
          [project.id, tag]
        );
      }
    }

    await client.query('COMMIT');
    bumpCacheVersion();
    res.status(201).json({ ...project, media: [], tags: tags || [] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// PUT /api/admin/projects/:id
projectsRouter.put('/:id', validate(projectSchema), async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    slug: rawSlug,
    tagLine,
    problem,
    solves,
    stackBrief,
    demoUrl,
    repoUrl,
    status,
    sortOrder,
    tags,
  } = req.body;

  const slug = rawSlug && rawSlug.trim() ? slugify(rawSlug) : slugify(title);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pRes = await client.query(
      `UPDATE projects
       SET slug = $1, title = $2, tag_line = $3, problem = $4, solves = $5,
           stack_brief = $6, demo_url = $7, repo_url = $8, status = $9, sort_order = $10
       WHERE id = $11
       RETURNING
        id, slug, title, tag_line AS "tagLine", problem, solves, stack_brief AS "stackBrief",
        demo_url AS "demoUrl", repo_url AS "repoUrl", status, sort_order AS "sortOrder",
        created_at AS "createdAt", updated_at AS "updatedAt"`,
      [slug, title, tagLine || null, problem || null, solves || null, stackBrief || null, demoUrl || null, repoUrl || null, status, sortOrder, id]
    );

    if (pRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = pRes.rows[0];

    if (tags !== undefined) {
      await client.query('DELETE FROM tech_tags WHERE project_id = $1', [id]);
      for (const tag of tags) {
        await client.query(
          `INSERT INTO tech_tags (project_id, name) VALUES ($1, $2)`,
          [id, tag]
        );
      }
    }

    await client.query('COMMIT');
    bumpCacheVersion();

    const mediaRes = await pool.query(
      `SELECT id, public_id AS "publicId", alt_text AS "altText", sort_order AS "sortOrder"
       FROM project_media
       WHERE project_id = $1
       ORDER BY sort_order ASC`,
      [id]
    );

    res.json({ ...project, media: mediaRes.rows, tags: tags || [] });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// DELETE /api/admin/projects/:id
projectsRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, id });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/projects/reorder
projectsRouter.post('/reorder', validate(reorderSchema), async (req, res, next) => {
  const { ids } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 0; index < ids.length; index++) {
      await client.query('UPDATE projects SET sort_order = $1 WHERE id = $2', [index + 1, ids[index]]);
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

// POST /api/admin/projects/:id/media
projectsRouter.post('/:id/media', validate(mediaSchema), async (req, res, next) => {
  const { id } = req.params;
  const { publicId, altText, sortOrder } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO project_media (project_id, public_id, alt_text, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, project_id AS "projectId", public_id AS "publicId", alt_text AS "altText", sort_order AS "sortOrder"`,
      [id, publicId, altText, sortOrder]
    );
    bumpCacheVersion();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/projects/:id/media/:mediaId
projectsRouter.delete('/:id/media/:mediaId', async (req, res, next) => {
  const { id, mediaId } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM project_media WHERE id = $1 AND project_id = $2 RETURNING id',
      [mediaId, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Media not found' });
    }
    bumpCacheVersion();
    res.json({ success: true, mediaId });
  } catch (error) {
    next(error);
  }
});

