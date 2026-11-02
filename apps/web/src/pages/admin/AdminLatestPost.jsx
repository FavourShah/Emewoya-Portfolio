import { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../utils/apiRequest.js';
import { useToast } from '../../context/ToastContext.jsx';

const EXCERPT_MAX = 280;

export default function AdminLatestPost() {
  const showToast = useToast();
  const [form, setForm] = useState({
    postUrl: '',
    excerpt: '',
    postedOn: '',
    imagePublicId: '',
    published: false,
  });
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const originalRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiRequest('/api/admin/linkedin-posts');
        const post = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (post) {
          const snapshot = {
            postUrl: post.postUrl ?? post.post_url ?? '',
            excerpt: post.excerpt ?? '',
            postedOn: post.postedOn
              ? String(post.postedOn).slice(0, 10)
              : post.posted_on
              ? String(post.posted_on).slice(0, 10)
              : '',
            imagePublicId: post.imagePublicId ?? post.image_public_id ?? '',
            published: !!post.published,
          };
          setForm(snapshot);
          setSaved(snapshot);
          originalRef.current = post.id;
        }
      } catch (err) {
        showToast('Failed to load post: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isDirty =
    saved === null ||
    Object.keys(form).some((k) => form[k] !== saved[k]);

  useEffect(() => {
    const handler = (e) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // --- Fetch OG data from URL ---
  async function handleFetch() {
    if (!form.postUrl) {
      showToast('Enter a URL first', 'error');
      return;
    }
    setFetching(true);
    try {
      const result = await apiRequest('/api/admin/scrape/og', {
        method: 'POST',
        body: { url: form.postUrl },
      });

      let updated = false;

      if (result.excerpt && !form.excerpt) {
        set('excerpt', result.excerpt);
        updated = true;
      }

      if (result.image) {
        // Image is an external URL — store it for reference, notify user
        showToast(
          result.excerpt
            ? 'Excerpt pre-filled! Note: LinkedIn image requires upload to Cloudinary — see URL below.'
            : 'Fetched! LinkedIn blocked the excerpt — paste it manually.',
          result.excerpt ? 'success' : 'error'
        );
        // Store the OG image URL in imagePublicId field temporarily so admin can see it
        if (!form.imagePublicId) {
          set('imagePublicId', result.image);
        }
      } else if (updated) {
        showToast('Excerpt pre-filled from link!', 'success');
      } else {
        showToast(
          'LinkedIn blocked the preview. Paste the excerpt manually.',
          'error'
        );
      }
    } catch (err) {
      showToast('Fetch failed: ' + err.message, 'error');
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    console.log('[AdminLatestPost] Save clicked, form state:', form);
    try {
      const payload = {
        postUrl: form.postUrl,
        excerpt: form.excerpt,
        postedOn: form.postedOn || null,
        imagePublicId: form.imagePublicId || null,
        published: form.published,
      };

      console.log('[AdminLatestPost] Sending payload:', payload);
      console.log('[AdminLatestPost] Existing post id:', originalRef.current);

      if (originalRef.current) {
        await apiRequest(`/api/admin/linkedin-posts/${originalRef.current}`, {
          method: 'PUT',
          body: payload,
        });
      } else {
        const created = await apiRequest('/api/admin/linkedin-posts', {
          method: 'POST',
          body: payload,
        });
        console.log('[AdminLatestPost] Created:', created);
        originalRef.current = created.id;
      }

      setSaved({ ...form });
      showToast('Post saved', 'success');
      console.log('[AdminLatestPost] Save successful');
    } catch (err) {
      console.error('[AdminLatestPost] Save error:', err.message, 'status:', err.status);
      showToast('Save failed: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-xl font-semibold text-ink">Latest LinkedIn Post</h1>
        {isDirty && (
          <span className="text-xs text-accent font-medium">Unsaved changes</span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Post URL + Fetch button */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Post URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.postUrl}
              onChange={(e) => set('postUrl', e.target.value)}
              placeholder="https://www.linkedin.com/posts/..."
              className="flex-1 min-w-0 border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleFetch}
              disabled={fetching || !form.postUrl}
              className="shrink-0 px-4 py-2 bg-cell border border-line text-ink text-sm font-medium rounded-lg hover:bg-line disabled:opacity-50 transition whitespace-nowrap"
            >
              {fetching ? 'Fetching…' : '✦ Auto-fill'}
            </button>
          </div>
          <p className="text-xs text-muted mt-1.5">
            Paste your LinkedIn post URL, then click <strong>Auto-fill</strong> to pre-populate the excerpt.
            LinkedIn may block the request — if so, paste the excerpt manually.
          </p>
        </div>

        {/* Excerpt */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-ink">Excerpt</label>
            <span
              className={`text-xs ${
                form.excerpt.length > EXCERPT_MAX
                  ? 'text-red-500 font-semibold'
                  : 'text-muted'
              }`}
            >
              {form.excerpt.length}/{EXCERPT_MAX}
            </span>
          </div>
          <textarea
            rows={4}
            value={form.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            placeholder="A short excerpt from the post…"
            className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
          {form.excerpt.length > EXCERPT_MAX && (
            <p className="text-xs text-red-500 mt-1">
              Excerpt exceeds {EXCERPT_MAX} characters
            </p>
          )}
        </div>

        {/* Posted On */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Posted On
          </label>
          <input
            type="date"
            value={form.postedOn}
            onChange={(e) => set('postedOn', e.target.value)}
            className="border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Image Public ID */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">
            Image Public ID{' '}
            <span className="font-normal text-muted">(Cloudinary public ID or leave blank)</span>
          </label>
          <input
            type="text"
            value={form.imagePublicId}
            onChange={(e) => set('imagePublicId', e.target.value)}
            placeholder="e.g. portfolio/linkedin-post-cover"
            className="w-full border border-line rounded-lg px-3 py-2 text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-muted mt-1">
            Auto-fill may paste a LinkedIn CDN URL here. Replace it with a Cloudinary public ID after uploading the image.
          </p>
        </div>

        {/* Published */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set('published', e.target.checked)}
            className="w-4 h-4 accent-accent"
          />
          <span className="text-sm text-ink font-medium">Published</span>
          <span className="text-xs text-muted">
            (visible on public site when checked)
          </span>
        </label>

        {/* Save */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || form.excerpt.length > EXCERPT_MAX}
            className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
