import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { apiRequest } from '../../utils/apiRequest.js';
import { useToast } from '../../context/ToastContext.jsx';

const STATUS_OPTIONS = [
  { value: 'passed', label: 'PASSED' },
  { value: 'in_progress', label: 'IN PROGRESS' },
  { value: 'planned', label: 'PLANNED' },
];

export default function AdminCertifications() {
  const { accessToken } = useAuthStore();
  const showToast = useToast();

  const [groups, setGroups] = useState([]);
  const [certs, setCerts] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', subtitle: '', sortOrder: 0 });
  const [addingGroup, setAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupForm, setEditGroupForm] = useState({});
  const [newCert, setNewCert] = useState({});
  const [addingCertForGroup, setAddingCertForGroup] = useState(null);
  const [editingCertId, setEditingCertId] = useState(null);
  const [editCertForm, setEditCertForm] = useState({});

  const load = useCallback(async () => {
    const [g, c] = await Promise.all([
      apiRequest('/api/admin/cert-groups', { token: accessToken }),
      apiRequest('/api/admin/certifications', { token: accessToken }),
    ]);
    setGroups(g || []);
    setCerts(c || []);
  }, [accessToken]);

  useEffect(() => { load(); }, [load]);

  const saveGroup = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/cert-groups', { token: accessToken, method: 'POST', body: newGroup });
      showToast('Group added!'); setAddingGroup(false); setNewGroup({ name: '', subtitle: '', sortOrder: 0 }); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const updateGroup = async (e, id) => {
    e.preventDefault();
    try {
      await apiRequest(`/api/admin/cert-groups/${id}`, { token: accessToken, method: 'PUT', body: editGroupForm });
      showToast('Group saved!'); setEditingGroupId(null); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const deleteGroup = async (id, name) => {
    if (!window.confirm(`Delete group "${name}" and all its certifications?`)) return;
    try {
      await apiRequest(`/api/admin/cert-groups/${id}`, { token: accessToken, method: 'DELETE' });
      showToast('Group deleted.'); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const saveCert = async (e, groupId) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/certifications', { token: accessToken, method: 'POST', body: { ...newCert, groupId } });
      showToast('Certification added!'); setAddingCertForGroup(null); setNewCert({}); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const updateCert = async (e, id) => {
    e.preventDefault();
    try {
      await apiRequest(`/api/admin/certifications/${id}`, { token: accessToken, method: 'PUT', body: editCertForm });
      showToast('Saved!'); setEditingCertId(null); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const deleteCert = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await apiRequest(`/api/admin/certifications/${id}`, { token: accessToken, method: 'DELETE' });
      showToast('Deleted.'); load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const inputCls = 'w-full rounded-lg border border-line bg-cell px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent transition';

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-ink">Certifications</h2>
        {!addingGroup && (
          <button onClick={() => setAddingGroup(true)} className="text-sm bg-accent text-white font-semibold rounded-xl px-4 py-2 hover:bg-accent/90 transition">
            + Add group
          </button>
        )}
      </div>

      {addingGroup && (
        <form onSubmit={saveGroup} className="rounded-2xl border-2 border-accent bg-surface p-4 mb-4 flex flex-col gap-3">
          <input placeholder="Group name (e.g. Microsoft)" value={newGroup.name} onChange={e => setNewGroup(p => ({...p, name: e.target.value}))} className={inputCls} required />
          <input placeholder="Subtitle (e.g. Azure, Microsoft 365 and IT support)" value={newGroup.subtitle} onChange={e => setNewGroup(p => ({...p, subtitle: e.target.value}))} className={inputCls} />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setAddingGroup(false)} className="text-xs text-muted px-3 py-1.5 rounded-lg border border-line">Cancel</button>
            <button type="submit" className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg">Add group</button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-6">
        {groups.map((group) => {
          const groupCerts = certs.filter(c => c.groupId === group.id);
          const isEditing = editingGroupId === group.id;
          return (
            <div key={group.id} className="bg-surface rounded-2xl border border-line p-5">
              {isEditing ? (
                <form onSubmit={(e) => updateGroup(e, group.id)} className="flex flex-col gap-2 mb-3">
                  <input value={editGroupForm.name || ''} onChange={e => setEditGroupForm(p => ({...p, name: e.target.value}))} className={inputCls} required placeholder="Group name" />
                  <input value={editGroupForm.subtitle || ''} onChange={e => setEditGroupForm(p => ({...p, subtitle: e.target.value}))} className={inputCls} placeholder="Subtitle" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setEditingGroupId(null)} className="text-xs text-muted px-3 py-1.5 rounded-lg border border-line">Cancel</button>
                    <button type="submit" className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg">Save group</button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-bold text-ink">{group.name}</div>
                    <div className="text-xs text-muted mt-0.5">{group.subtitle}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingGroupId(group.id); setEditGroupForm({...group}); }} className="text-xs text-muted hover:text-accent px-2 py-1 rounded border border-line hover:border-accent">Edit group</button>
                    <button onClick={() => deleteGroup(group.id, group.name)} className="text-xs text-muted hover:text-red-600 px-2 py-1 rounded border border-line hover:border-red-300">Delete</button>
                  </div>
                </div>
              )}

              {/* Certs list */}
              <div className="flex flex-col gap-2">
                {groupCerts.map((cert) =>
                  editingCertId === cert.id ? (
                    <form key={cert.id} onSubmit={(e) => updateCert(e, cert.id)} className="flex flex-col gap-2 bg-cell rounded-xl p-3">
                      <input value={editCertForm.title || ''} onChange={e => setEditCertForm(p => ({...p, title: e.target.value}))} className={inputCls} placeholder="Title" required />
                      <div className="flex gap-2">
                        <select value={editCertForm.status || 'in_progress'} onChange={e => setEditCertForm(p => ({...p, status: e.target.value}))} className={inputCls}>
                          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
                          <input type="checkbox" checked={!!editCertForm.published} onChange={e => setEditCertForm(p => ({...p, published: e.target.checked}))} className="accent-accent" />
                          Published
                        </label>
                      </div>
                      <input value={editCertForm.credentialUrl || ''} onChange={e => setEditCertForm(p => ({...p, credentialUrl: e.target.value}))} className={inputCls} placeholder="Credential URL (optional)" type="url" />
                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setEditingCertId(null)} className="text-xs text-muted px-3 py-1 rounded border border-line">Cancel</button>
                        <button type="submit" className="text-xs bg-accent text-white px-3 py-1 rounded">Save</button>
                      </div>
                    </form>
                  ) : (
                    <div key={cert.id} className="flex items-center justify-between bg-cell rounded-xl px-3 py-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-ink truncate block">{cert.title}</span>
                        <span className={`font-mono text-[10px] rounded-full px-2 py-0.5 mt-0.5 inline-block ${
                          cert.status === 'passed' ? 'bg-accent text-white' : 'border border-accent-soft text-accent-soft'
                        }`}>
                          {cert.status === 'in_progress' ? 'IN PROGRESS' : cert.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditingCertId(cert.id); setEditCertForm({...cert}); }} className="text-xs text-muted hover:text-accent px-2 py-1 rounded border border-line hover:border-accent">Edit</button>
                        <button onClick={() => deleteCert(cert.id, cert.title)} className="text-xs text-muted hover:text-red-600 px-2 py-1 rounded border border-line hover:border-red-300">×</button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Add cert form */}
              {addingCertForGroup === group.id ? (
                <form onSubmit={(e) => saveCert(e, group.id)} className="mt-3 flex flex-col gap-2 bg-cell rounded-xl p-3">
                  <input value={newCert.title || ''} onChange={e => setNewCert(p => ({...p, title: e.target.value}))} className={inputCls} placeholder="Certification title" required />
                  <div className="flex gap-2">
                    <select value={newCert.status || 'in_progress'} onChange={e => setNewCert(p => ({...p, status: e.target.value}))} className={inputCls}>
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <label className="flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
                      <input type="checkbox" checked={newCert.published !== false} onChange={e => setNewCert(p => ({...p, published: e.target.checked}))} className="accent-accent" />
                      Published
                    </label>
                  </div>
                  <input value={newCert.credentialUrl || ''} onChange={e => setNewCert(p => ({...p, credentialUrl: e.target.value}))} className={inputCls} placeholder="Credential URL (optional)" type="url" />
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setAddingCertForGroup(null)} className="text-xs text-muted px-3 py-1 rounded border border-line">Cancel</button>
                    <button type="submit" className="text-xs bg-accent text-white px-3 py-1 rounded">Add certification</button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => { setAddingCertForGroup(group.id); setNewCert({ status: 'in_progress', published: true }); }}
                  className="mt-3 text-xs text-accent hover:underline font-mono uppercase tracking-wider"
                >
                  + Add certification
                </button>
              )}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="text-sm text-muted font-mono py-8 text-center border border-dashed border-line rounded-2xl">
            No certification groups yet.
          </div>
        )}
      </div>
    </div>
  );
}

