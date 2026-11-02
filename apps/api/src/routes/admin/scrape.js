import express from 'express';
import { requireAuth } from '../../middleware/auth.js';

export const scrapeRouter = express.Router();

/**
 * POST /api/admin/scrape/og
 * Body: { url: string }
 * Returns: { title, description, image, siteName }
 *
 * Fetches OG / meta tags from a public URL server-side (avoids CORS).
 * Works for public LinkedIn posts, blog posts, etc.
 * LinkedIn may block unauthenticated crawlers — we try a browser-like UA.
 */
scrapeRouter.post('/og', requireAuth, async (req, res) => {
  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  // Validate it looks like a URL
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(parsed.href, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({
        error: `Remote server returned ${response.status}. LinkedIn often blocks unauthenticated requests — paste the excerpt manually.`,
      });
    }

    const html = await response.text();

    // Parse OG tags with regex (no extra dependencies)
    const getMeta = (property) => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
        new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
      ];
      for (const re of patterns) {
        const m = html.match(re);
        if (m) return decodeHtmlEntities(m[1].trim());
      }
      return null;
    };

    const title =
      getMeta('og:title') ||
      getMeta('twitter:title') ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim() ||
      null;

    const description =
      getMeta('og:description') ||
      getMeta('twitter:description') ||
      getMeta('description') ||
      null;

    const image =
      getMeta('og:image') ||
      getMeta('twitter:image') ||
      null;

    const siteName = getMeta('og:site_name') || null;

    // Truncate description to 280 chars for the excerpt field
    const excerpt = description
      ? description.length > 280
        ? description.slice(0, 277) + '…'
        : description
      : null;

    console.log('[scrape/og]', parsed.hostname, { title, excerpt: excerpt?.slice(0, 60), image: !!image });

    res.json({ title, description, excerpt, image, siteName });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timed out (8s). The site may be blocking automated requests.' });
    }
    console.error('[scrape/og] error:', err.message);
    res.status(502).json({ error: 'Failed to fetch URL: ' + err.message });
  }
});

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

