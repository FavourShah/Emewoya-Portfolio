import express from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';
import { getCacheVersion } from '../lib/cache.js';

export const publicRouter = express.Router();

publicRouter.get('/site', async (req, res, next) => {
  try {
    // 1. Settings
    const settingsRes = await pool.query(
      `SELECT
        full_name AS "fullName",
        headline,
        subheadline,
        location,
        timezone,
        statement,
        bio,
        photo_public_id AS "photoPublicId",
        email,
        linkedin_url AS "linkedinUrl",
        twitter_url AS "twitterUrl",
        instagram_url AS "instagramUrl",
        github_url AS "githubUrl"
       FROM site_settings
       WHERE id = 1`
    );
    const settings = settingsRes.rows[0] || {
      fullName: '',
      headline: '',
      subheadline: '',
      location: '',
      timezone: 'Africa/Lagos',
      statement: '',
      bio: '',
      photoPublicId: null,
      email: '',
      linkedinUrl: '',
      twitterUrl: '',
      instagramUrl: '',
      githubUrl: '',
    };

    // 2. Roles (published only, ordered by sort_order)
    const rolesRes = await pool.query(
      `SELECT id, label, title, evidence, sort_order AS "sortOrder"
       FROM roles
       WHERE published = true
       ORDER BY sort_order ASC`
    );

    // 3. Map Nodes (published only, ordered by sort_order)
    const mapNodesRes = await pool.query(
      `SELECT id, label, side, sort_order AS "sortOrder"
       FROM map_nodes
       WHERE published = true
       ORDER BY sort_order ASC`
    );

    // 4. Journey Steps (published only, ordered by sort_order)
    const journeyRes = await pool.query(
      `SELECT id, label, title, body, sort_order AS "sortOrder"
       FROM journey_steps
       WHERE published = true
       ORDER BY sort_order ASC`
    );

    // 5. Cert Groups & Certifications (published only)
    const certGroupsRes = await pool.query(
      `SELECT id, name, subtitle, sort_order AS "sortOrder"
       FROM cert_groups
       ORDER BY sort_order ASC`
    );

    const certsRes = await pool.query(
      `SELECT id, group_id AS "groupId", title, status, credential_url AS "credentialUrl", sort_order AS "sortOrder"
       FROM certifications
       WHERE published = true
       ORDER BY sort_order ASC`
    );

    const certGroups = certGroupsRes.rows.map((group) => ({
      id: group.id,
      name: group.name,
      subtitle: group.subtitle,
      items: certsRes.rows
        .filter((c) => c.groupId === group.id)
        .map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          credentialUrl: c.credentialUrl,
        })),
    }));

    // 6. Projects (published only - teasers are counted separately, drafts excluded)
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
        sort_order AS "sortOrder"
       FROM projects
       WHERE status = 'published'
       ORDER BY sort_order ASC`
    );

    // Project media
    const mediaRes = await pool.query(
      `SELECT id, project_id AS "projectId", public_id AS "publicId", alt_text AS "alt", sort_order AS "sortOrder"
       FROM project_media
       ORDER BY sort_order ASC`
    );

    // Project tech tags
    const tagsRes = await pool.query(
      `SELECT id, project_id AS "projectId", name
       FROM tech_tags`
    );

    const projects = projectsRes.rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      tagLine: p.tagLine,
      problem: p.problem,
      solves: p.solves,
      stackBrief: p.stackBrief,
      demoUrl: p.demoUrl,
      repoUrl: p.repoUrl,
      media: mediaRes.rows
        .filter((m) => m.projectId === p.id)
        .map((m) => ({ publicId: m.publicId, alt: m.alt })),
      tags: tagsRes.rows
        .filter((t) => t.projectId === p.id)
        .map((t) => t.name),
    }));

    // Count teaser projects (Teasers contribute ONLY to count, no fields leaked)
    const teaserRes = await pool.query(
      `SELECT count(*)::int AS count
       FROM projects
       WHERE status = 'teaser'`
    );
    const teaserCount = teaserRes.rows[0]?.count || 0;

    // 7. Latest LinkedIn Post (newest published)
    const postRes = await pool.query(
      `SELECT post_url AS "url", excerpt, posted_on AS "postedOn"
       FROM linkedin_posts
       WHERE published = true
       ORDER BY posted_on DESC, created_at DESC
       LIMIT 1`
    );
    const latestPost = postRes.rows[0]
      ? {
          url: postRes.rows[0].url,
          excerpt: postRes.rows[0].excerpt,
          postedOn: postRes.rows[0].postedOn ? new Date(postRes.rows[0].postedOn).toISOString().split('T')[0] : '',
        }
      : null;

    const payload = {
      settings,
      roles: rolesRes.rows,
      mapNodes: mapNodesRes.rows,
      journey: journeyRes.rows,
      certGroups,
      projects,
      teaserCount,
      latestPost,
    };

    // Generate ETag based on payload and cacheVersion
    const version = getCacheVersion();
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify(payload) + `_v${version}`)
      .digest('hex');
    const etag = `W/"${hash}"`;

    res.set({
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      ETag: etag,
    });

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

