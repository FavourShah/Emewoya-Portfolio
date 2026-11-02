import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../utils/apiRequest.js';
import { useToast } from '../../context/ToastContext.jsx';

const TIMEZONES = Intl.supportedValuesOf('timeZone');

function normalizeUrl(val, defaultHost = '') {
  if (!val) return val;
  let trimmed = val.trim();
  if (!trimmed || trimmed.startsWith('[') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('@') && defaultHost) {
    trimmed = `${defaultHost}${trimmed.slice(1)}`;
  }
  return `https://${trimmed}`;
}

// Components defined outside so they maintain identity and NEVER lose focus on keystroke re-renders
function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-xs text-muted mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ id, value, onChange, ...props }) {
  return (
    <input
      id={id}
      value={value ?? ''}
      onChange={onChange}
      className="w-full rounded-xl border border-line bg-cell px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition"
      {...props}
    />
  );
}

function Textarea({ id, value, onChange, rows = 3, ...props }) {
  return (
    <textarea
      id={id}
      value={value ?? ''}
      onChange={onChange}
      rows={rows}
      className="w-full rounded-xl border border-line bg-cell px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition resize-y"
      {...props}
    />
  );
}

export default function AdminSettings() {
  const showToast = useToast();

  const [form, setForm] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiRequest('/api/admin/settings')
      .then((data) => setForm(data || {}))
      .catch((err) => showToast(err.message, 'error'));
  }, []);

  useEffect(() => {
    if (!form) return;
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        fullName: form.fullName || '',
        headline: form.headline || '',
        subheadline: form.subheadline || null,
        location: form.location || null,
        timezone: form.timezone || 'Africa/Lagos',
        statement: form.statement || null,
        bio: form.bio || null,
        photoPublicId: form.photoPublicId || null,
        email: form.email || null,
        linkedinUrl: normalizeUrl(form.linkedinUrl) || null,
        twitterUrl: normalizeUrl(form.twitterUrl) || null,
        instagramUrl: normalizeUrl(form.instagramUrl, 'instagram.com/') || null,
        githubUrl: normalizeUrl(form.githubUrl, 'github.com/') || null,
      };

      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: payload,
      });
      setIsDirty(false);
      showToast('Settings saved successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!form) {
    return <div className="font-mono text-xs text-muted animate-pulse">Loading settings…</div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold text-ink mb-6">Settings</h2>

      <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-line p-6 flex flex-col gap-5">

        <Field label="Full Name" id="fullName">
          <Input id="fullName" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
        </Field>

        <Field label="Headline" id="headline">
          <Input id="headline" value={form.headline} onChange={(e) => set('headline', e.target.value)} required />
        </Field>

        <Field label="Subheadline" id="subheadline">
          <Textarea id="subheadline" value={form.subheadline} onChange={(e) => set('subheadline', e.target.value)} />
        </Field>

        <Field label="Location" id="location">
          <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Lagos, Nigeria" />
        </Field>

        <Field label="Timezone" id="timezone">
          <select
            id="timezone"
            value={form.timezone || 'Africa/Lagos'}
            onChange={(e) => set('timezone', e.target.value)}
            className="w-full rounded-xl border border-line bg-cell px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </Field>

        <Field label="Statement (Roles section)" id="statement">
          <Textarea id="statement" value={form.statement} onChange={(e) => set('statement', e.target.value)} rows={2} />
        </Field>

        <Field label="Bio (Journey section)" id="bio">
          <Textarea id="bio" value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} />
        </Field>

        <Field label="Photo (Cloudinary public_id or Image URL)" id="photoPublicId">
          <Input
            id="photoPublicId"
            value={form.photoPublicId}
            onChange={(e) => set('photoPublicId', e.target.value)}
            placeholder="e.g. Favour.jpg or full Cloudinary URL"
          />
          <p className="font-mono text-[11px] text-muted mt-1.5">
            Paste either the Cloudinary Public ID (e.g. <code>Favour</code>) or the full image URL.
          </p>
          {form.photoPublicId && !form.photoPublicId.startsWith('[') && (
            <div className="mt-3 flex items-center gap-3 bg-cell p-2.5 rounded-xl border border-line">
              <img
                src={form.photoPublicId.startsWith('http') ? form.photoPublicId : `https://res.cloudinary.com/dxochwmxk/image/upload/f_auto,q_auto,w_120/${form.photoPublicId}`}
                alt="Photo preview"
                className="w-12 h-14 rounded-lg object-cover border border-line"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-xs text-muted font-mono">Photo preview active</span>
            </div>
          )}
        </Field>

        <div className="border-t border-line pt-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Contact & Social Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" id="email">
              <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="[EMAIL]" />
            </Field>
            <Field label="LinkedIn URL" id="linkedinUrl">
              <Input
                id="linkedinUrl"
                type="text"
                inputMode="url"
                value={form.linkedinUrl}
                onChange={(e) => set('linkedinUrl', e.target.value)}
                onBlur={(e) => set('linkedinUrl', normalizeUrl(e.target.value))}
                placeholder="https://linkedin.com/in/... or www.linkedin.com/..."
              />
            </Field>
            <Field label="X / Twitter URL" id="twitterUrl">
              <Input
                id="twitterUrl"
                type="text"
                inputMode="url"
                value={form.twitterUrl}
                onChange={(e) => set('twitterUrl', e.target.value)}
                onBlur={(e) => set('twitterUrl', normalizeUrl(e.target.value))}
                placeholder="https://x.com/... or x.com/..."
              />
            </Field>
            <Field label="Instagram URL" id="instagramUrl">
              <Input
                id="instagramUrl"
                type="text"
                inputMode="url"
                value={form.instagramUrl}
                onChange={(e) => set('instagramUrl', e.target.value)}
                onBlur={(e) => set('instagramUrl', normalizeUrl(e.target.value, 'instagram.com/'))}
                placeholder="https://instagram.com/... or @handle"
              />
            </Field>
            <Field label="GitHub URL" id="githubUrl">
              <Input
                id="githubUrl"
                type="text"
                inputMode="url"
                value={form.githubUrl}
                onChange={(e) => set('githubUrl', e.target.value)}
                onBlur={(e) => set('githubUrl', normalizeUrl(e.target.value, 'github.com/'))}
                placeholder="https://github.com/... or github.com/..."
              />
            </Field>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-accent text-white font-semibold rounded-xl py-2.5 px-6 text-sm hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-60 transition"
          >
            {isSaving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
