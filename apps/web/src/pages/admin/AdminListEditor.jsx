import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { apiRequest } from '../../utils/apiRequest.js';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Generic reusable list editor for simple table resources.
 * Handles: load, add, edit (inline), delete, drag-to-reorder.
 */
export default function AdminListEditor({
  title,
  endpoint,       // e.g. '/api/admin/roles'
  fields,         // Array<{ key, label, type?, options?, required? }>
  defaultRow,     // object with default values for a new row
  itemLabel,      // function(item) => string for delete confirmation
}) {
  const { accessToken } = useAuthStore();
  const showToast = useToast();

  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState(defaultRow);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest(endpoint, { token: accessToken });
      setItems(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, accessToken]);

  useEffect(() => { load(); }, [load]);

  // --- CRUD ---
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await apiRequest(endpoint, { token: accessToken, method: 'POST', body: newForm });
      showToast('Item added!');
      setAddingNew(false);
      setNewForm(defaultRow);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = async (e, id) => {
    e.preventDefault();
    try {
      await apiRequest(`${endpoint}/${id}`, { token: accessToken, method: 'PUT', body: editForm });
      showToast('Saved!');
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await apiRequest(`${endpoint}/${id}`, { token: accessToken, method: 'DELETE' });
      showToast('Deleted.');
      load();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- Drag to reorder ---
  const handleDragStart = (idx) => setDraggingIdx(idx);
  const handleDragOver = (e, overIdx) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === overIdx) return;
    const reordered = [...items];
    const [moved] = reordered.splice(draggingIdx, 1);
    reordered.splice(overIdx, 0, moved);
    setItems(reordered);
    setDraggingIdx(overIdx);
  };
  const handleDragEnd = async () => {
    setDraggingIdx(null);
    try {
      await apiRequest(`${endpoint}/reorder`, {
        token: accessToken,
        method: 'POST',
        body: { ids: items.map((i) => i.id) },
      });
    } catch (err) {
      showToast('Reorder failed: ' + err.message, 'error');
      load();
    }
  };

  const renderField = (field, value, onChange, prefix = 'input') => {
    const base = 'w-full rounded-lg border border-line bg-cell px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition';
    const fieldId = `${prefix}-${field.key}`;
    if (field.type === 'select') {
      return (
        <select id={fieldId} name={field.key} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={base}>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          id={fieldId}
          name={field.key}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={`${base} resize-y`}
          required={field.required}
        />
      );
    }
    if (field.type === 'checkbox') {
      return (
        <label htmlFor={fieldId} className="flex items-center gap-2 cursor-pointer">
          <input
            id={fieldId}
            name={field.key}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="accent-accent w-4 h-4"
          />
          <span className="text-xs text-muted">Published</span>
        </label>
      );
    }
    return (
      <input
        id={fieldId}
        name={field.key}
        type={field.type || 'text'}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={base}
        required={field.required}
      />
    );
  };

  const renderRow = (item, idx) => {
    const isEditing = editingId === item.id;
    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleDragStart(idx)}
        onDragOver={(e) => handleDragOver(e, idx)}
        onDragEnd={handleDragEnd}
        className={`rounded-2xl border border-line bg-surface p-4 cursor-grab active:cursor-grabbing transition ${
          draggingIdx === idx ? 'opacity-50 scale-[0.98]' : ''
        }`}
      >
        {isEditing ? (
          <form onSubmit={(e) => handleEdit(e, item.id)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">
                    {field.label}
                  </label>
                  {renderField(field, editForm[field.key], (v) =>
                    setEditForm((prev) => ({ ...prev, [field.key]: v })),
                    `edit-${item.id}`
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button type="button" onClick={() => setEditingId(null)} className="text-xs text-muted hover:text-ink px-3 py-1.5 rounded-lg border border-line">Cancel</button>
              <button type="submit" className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90">Save</button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <span className="text-muted mt-0.5 text-sm select-none" aria-hidden>⠿</span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink truncate">
                  {item[fields[0]?.key] || '—'}
                </div>
                {fields[1] && (
                  <div className="text-xs text-muted mt-0.5 truncate">
                    {item[fields[1]?.key]}
                  </div>
                )}
                {item.published === false && (
                  <span className="inline-block mt-1 font-mono text-[10px] bg-line text-muted rounded px-1.5 py-0.5">
                    unpublished
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { setEditingId(item.id); setEditForm({ ...item }); }}
                className="text-xs text-muted hover:text-accent px-3 py-1.5 rounded-lg border border-line hover:border-accent transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id, itemLabel(item))}
                className="text-xs text-muted hover:text-red-600 px-3 py-1.5 rounded-lg border border-line hover:border-red-300 transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {!addingNew && (
          <button
            onClick={() => { setAddingNew(true); setNewForm(defaultRow); }}
            className="text-sm bg-accent text-white font-semibold rounded-xl px-4 py-2 hover:bg-accent/90 transition"
          >
            + Add
          </button>
        )}
      </div>

      {/* Add-new form */}
      {addingNew && (
        <form onSubmit={handleAdd} className="rounded-2xl border-2 border-accent bg-surface p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="font-mono text-[10px] text-muted uppercase tracking-wider block mb-1">
                  {field.label}
                </label>
                {renderField(field, newForm[field.key], (v) =>
                  setNewForm((prev) => ({ ...prev, [field.key]: v })),
                  'new'
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <button type="button" onClick={() => setAddingNew(false)} className="text-xs text-muted hover:text-ink px-3 py-1.5 rounded-lg border border-line">Cancel</button>
            <button type="submit" className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent/90">Add item</button>
          </div>
        </form>
      )}

      {loading && <div className="font-mono text-xs text-muted animate-pulse">Loading…</div>}

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => renderRow(item, idx))}
        {!loading && items.length === 0 && (
          <div className="text-sm text-muted font-mono py-8 text-center border border-dashed border-line rounded-2xl">
            No items yet. Click "+ Add" to create one.
          </div>
        )}
      </div>
    </div>
  );
}

