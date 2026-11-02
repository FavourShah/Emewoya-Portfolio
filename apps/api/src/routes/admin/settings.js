import express from 'express';
import { z } from 'zod';
import { pool } from '../../db.js';
import { validate } from '../../middleware/validate.js';
import { bumpCacheVersion } from '../../lib/cache.js';

export const settingsRouter = express.Router();

const updateSettingsSchema = z.object({
  fullName: z.string().min(1),
  headline: z.string().min(1),
  subheadline: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  timezone: z.string().default('Africa/Lagos'),
  statement: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  photoPublicId: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  twitterUrl: z.string().nullable().optional(),
  instagramUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
});

settingsRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
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
        github_url AS "githubUrl",
        updated_at AS "updatedAt"
       FROM site_settings
       WHERE id = 1`
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    next(error);
  }
});

settingsRouter.put('/', validate(updateSettingsSchema), async (req, res, next) => {
  const {
    fullName,
    headline,
    subheadline,
    location,
    timezone,
    statement,
    bio,
    photoPublicId,
    email,
    linkedinUrl,
    twitterUrl,
    instagramUrl,
    githubUrl,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO site_settings (
        id, full_name, headline, subheadline, location, timezone,
        statement, bio, photo_public_id, email, linkedin_url, twitter_url, instagram_url, github_url
      ) VALUES (
        1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        headline = EXCLUDED.headline,
        subheadline = EXCLUDED.subheadline,
        location = EXCLUDED.location,
        timezone = EXCLUDED.timezone,
        statement = EXCLUDED.statement,
        bio = EXCLUDED.bio,
        photo_public_id = EXCLUDED.photo_public_id,
        email = EXCLUDED.email,
        linkedin_url = EXCLUDED.linkedin_url,
        twitter_url = EXCLUDED.twitter_url,
        instagram_url = EXCLUDED.instagram_url,
        github_url = EXCLUDED.github_url,
        updated_at = NOW()
      RETURNING
        id,
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
        github_url AS "githubUrl",
        updated_at AS "updatedAt"`,
      [
        fullName,
        headline,
        subheadline || null,
        location || null,
        timezone || 'Africa/Lagos',
        statement || null,
        bio || null,
        photoPublicId || null,
        email || null,
        linkedinUrl || null,
        twitterUrl || null,
        instagramUrl || null,
        githubUrl || null,
      ]
    );

    bumpCacheVersion();
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});
