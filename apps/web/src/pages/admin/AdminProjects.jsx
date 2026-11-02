import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../utils/apiRequest.js';
import { useToast } from '../../context/ToastContext.jsx';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft – hidden' },
  { value: 'published', label: 'Published – full card' },
  { value: 'teaser', label: 'Teaser – unnamed placeholder' },
];

const BLANK = {
  title: '', slug: '', tagLine: '', problem: '', solves: '',
  stackBrief: '', demoUrl: '', repoUrl: '', status: 'draft',
  sortOrder: 0, tags: [],
};

function slugify(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
}

function normalizeUrl(val) {
  if (!val) return val;
  const trimmed = val.trim();
  if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function AdminProjects() {
  const showToast = useToast();

  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null); // project being edited in detail view
  const [form, setForm] = useState(BLANK);
  const [isCreating, setIsCreating] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newMediaPublicId, setNewMediaPublicId] = useState('');
  const [newMediaAlt, setNewMediaAlt] = useState('');
  const [isAddingMedia, setIsAddingMedia] = useState(false);

  const load = useCallback(async () => {
    const data = await apiRequest('/api/admin/projects');
    setProjects(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openProject = (project) => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setSelected(project);
    setForm({ ...project, tags: project.tags || [] });
    setTagsInput((project.tags || []).join(', '));
    setIsDirty(false);
    setIsCreating(false);
  };

  const openNew = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setSelected(null);
    setForm(BLANK);
    setTagsInput('');
    setIsDirty(false);
    setIsCreating(true);
  };

  const handleBackToList = () => {
    if (isDirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    setSelected(null);
    setIsCreating(false);
    setIsDirty(false);
  };

  const set = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // Auto-generate slug from title unless slug was manually set
      if (key === 'title' && !prev._slugManual) {
        next.slug = slugify(value);
      }
      if (key === 'slug') next._slugManual = true;
      return next;
    });
    setIsDirty(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const body = {
      ...form,
      demoUrl: normalizeUrl(form.demoUrl) || null,
      repoUrl: normalizeUrl(form.repoUrl) || null,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (isCreating) {
        const created = await apiRequest('/api/admin/projects', { method: 'POST', body });
        showToast('Project created!');
        setIsCreating(false);
        setSelected(created);
      } else {
        const updated = await apiRequest(`/api/admin/projects/${selected.id}`, { method: 'PUT', body });
        showToast('Project saved!');
        setSelected(updated);
        setForm({ ...updated, tags: updated.tags || [] });
        setTagsInput((updated.tags || []).join(', '));
      }
      setIsDirty(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm(`Delete "${selected.title}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`/api/admin/projects/${selected.id}`, { method: 'DELETE' });
      showToast('Project deleted.');
      setSelected(null);
      setIsCreating(false);
      setIsDirty(false);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!selected || !window.confirm('Remove this screenshot?')) return;
    try {
      await apiRequest(`/api/admin/projects/${selected.id}/media/${mediaId}`, { method: 'DELETE' });
      showToast('Screenshot removed.');
      const updated = await apiRequest(`/api/admin/projects/${selected.id}`);
      setSelected(updated);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddMedia = async (e) => {
    e?.preventDefault();
    if (!selected || !newMediaPublicId.trim()) return;
    setIsAddingMedia(true);
    try {
      await apiRequest(`/api/admin/projects/${selected.id}/media`, {
        method: 'POST',
        body: {
          publicId: newMediaPublicId.trim(),
          altText: newMediaAlt.trim() || `${selected.title} screenshot`,
          sortOrder: (selected.media?.length || 0) + 1,
        },
      });
      showToast('Screenshot added!');
      setNewMediaPublicId('');
      setNewMediaAlt('');
      const updated = await apiRequest(`/api/admin/projects/${selected.id}`);
      setSelected(updated);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsAddingMedia(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-line bg-cell px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition';
  const textareaCls = `${inputCls} resize-y`;

  const statusBadge = (status) => {
    const map = { draft: 'bg-line text-muted', published: 'bg-accent text-white', teaser: 'bg-amber-100 text-amber-700' };
    return <span className={`font-mono text-[10px] rounded px-1.5 py-0.5 ${map[status] || ''}`}>{status}</span>;
  };

  const isEditingOrCreating = isCreating || selected !== null;

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
      {/* Project list: on mobile, hidden if editing or creating */}
      <div className={`${isEditingOrCreating ? 'hidden md:flex' : 'flex'} w-full md:w-60 shrink-0 flex-col gap-2`}>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-ink">Projects</span>
          <button
            onClick={openNew}
            className="text-xs bg-accent text-white font-semibold rounded-lg px-3 py-1.5 hover:bg-accent/90 transition shadow-sm"
          >
            + New
          </button>
        </div>

        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => openProject(p)}
            className={`w-full text-left rounded-xl px-3.5 py-3 border transition ${
              (selected?.id === p.id && !isCreating) ? 'border-accent bg-accent/5' : 'border-line bg-surface hover:border-accent/40'
            }`}
          >
            <div className="text-sm font-medium text-ink truncate">{p.title}</div>
            <div className="mt-1">{statusBadge(p.status)}</div>
          </button>
        ))}

        {projects.length === 0 && (
          <div className="text-xs text-muted font-mono text-center py-6 border border-dashed border-line rounded-xl">
            No projects yet. Click "+ New" to add one.
          </div>
        )}
      </div>

      {/* Detail / Editor view */}
      <div className={`${isEditingOrCreating ? 'block' : 'hidden md:block'} flex-1 min-w-0`}>
        {isEditingOrCreating ? (
          <form onSubmit={handleSave} className="bg-surface rounded-2xl border border-line p-4 sm:p-6 flex flex-col gap-4 max-w-2xl">
            {/* Mobile back button */}
            <button
              type="button"
              onClick={handleBackToList}
              className="md:hidden self-start font-mono text-xs text-accent font-semibold flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-cell border border-line mb-1"
            >
              ← Back to all projects
            </button>

            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="font-bold text-ink text-lg">{isCreating ? 'New Project' : 'Edit Project'}</h2>
              {!isCreating && (
                <button type="button" onClick={handleDelete} className="text-xs text-red-500 hover:underline">
                  Delete project
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} required />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Slug</label>
                <input value={form.slug} onChange={e => set('slug', e.target.value)} className={inputCls} placeholder="auto-generated" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <p className="font-mono text-[10px] text-muted mt-1">
                  Teaser: shows as "Next case study" – title never reaches public API.
                </p>
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Tag line</label>
                <input value={form.tagLine || ''} onChange={e => set('tagLine', e.target.value)} className={inputCls} placeholder="e.g. PERN · JWT · RBAC" />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Problem</label>
                <textarea value={form.problem || ''} onChange={e => set('problem', e.target.value)} rows={3} className={textareaCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">What it solves</label>
                <textarea value={form.solves || ''} onChange={e => set('solves', e.target.value)} rows={3} className={textareaCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Built with & why</label>
                <textarea value={form.stackBrief || ''} onChange={e => set('stackBrief', e.target.value)} rows={3} className={textareaCls} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Demo URL</label>
                <input
                  type="text"
                  inputMode="url"
                  value={form.demoUrl || ''}
                  onChange={e => set('demoUrl', e.target.value)}
                  onBlur={e => set('demoUrl', normalizeUrl(e.target.value))}
                  className={inputCls}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Repo URL</label>
                <input
                  type="text"
                  inputMode="url"
                  value={form.repoUrl || ''}
                  onChange={e => set('repoUrl', e.target.value)}
                  onBlur={e => set('repoUrl', normalizeUrl(e.target.value))}
                  className={inputCls}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">Tech tags (comma-separated)</label>
                <input value={tagsInput} onChange={e => { setTagsInput(e.target.value); setIsDirty(true); }} className={inputCls} placeholder="React, Node, Express, PostgreSQL" />
              </div>
            </div>

            {/* Screenshots Management */}
            {!isCreating && selected && (
              <div className="border-t border-line pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-mono text-[10px] text-muted uppercase tracking-wider block">
                    Screenshots (Cloudinary)
                  </label>
                  <span className="font-mono text-[10px] text-muted">
                    {selected.media?.length || 0} attached (up to 3 shown on site)
                  </span>
                </div>

                {/* List of existing screenshots */}
                {selected.media && selected.media.length > 0 && (
                  <div className="flex flex-col gap-2 mb-3">
                    {selected.media.map(m => {
                      const isReal = m.publicId && !m.publicId.startsWith('placeholder-');
                      const thumbSrc = isReal
                        ? (m.publicId.startsWith('http')
                            ? m.publicId
                            : `https://res.cloudinary.com/dxochwmxk/image/upload/f_auto,q_auto,w_100/${m.publicId}`)
                        : null;

                      return (
                        <div key={m.id} className="flex items-center gap-3 bg-cell rounded-xl p-2.5 border border-line">
                          {thumbSrc ? (
                            <img src={thumbSrc} alt={m.altText} className="w-12 h-8 rounded object-cover border border-line shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
                          ) : (
                            <div className="w-12 h-8 rounded bg-line flex items-center justify-center font-mono text-[9px] text-muted shrink-0">
                              No img
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-ink truncate">{m.altText || 'Screenshot'}</div>
                            <div className="text-[11px] text-muted font-mono truncate">{m.publicId}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMedia(m.id)}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 transition shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add new screenshot form */}
                <div className="bg-cell/60 rounded-xl p-3 border border-dashed border-line">
                  <div className="font-mono text-[10px] text-muted uppercase mb-2">Add a screenshot</div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={newMediaPublicId}
                      onChange={e => setNewMediaPublicId(e.target.value)}
                      placeholder="Public ID (e.g. leave-app-1) or full Cloudinary URL"
                      className={`${inputCls} flex-1 text-xs`}
                    />
                    <input
                      value={newMediaAlt}
                      onChange={e => setNewMediaAlt(e.target.value)}
                      placeholder="Alt text / Caption"
                      className={`${inputCls} sm:w-44 text-xs`}
                    />
                    <button
                      type="button"
                      onClick={handleAddMedia}
                      disabled={!newMediaPublicId.trim() || isAddingMedia}
                      className="bg-accent text-white font-semibold text-xs rounded-xl px-4 py-2 hover:bg-accent/90 disabled:opacity-50 transition whitespace-nowrap"
                    >
                      {isAddingMedia ? 'Adding…' : '+ Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-3 pt-2">
              {isDirty && <span className="text-xs text-amber-600 font-mono">Unsaved changes</span>}
              <button
                type="submit"
                disabled={isSaving}
                className="bg-accent text-white font-semibold rounded-xl py-2.5 px-6 text-sm hover:bg-accent/90 disabled:opacity-60 transition shadow-sm"
              >
                {isSaving ? 'Saving…' : isCreating ? 'Create project' : 'Save project'}
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center h-48 border border-dashed border-line rounded-2xl text-muted text-sm font-mono p-6 text-center">
            Select a project from the list on the left or click "+ New" to add one.
          </div>
        )}
      </div>
    </div>
  );
}
