import React from 'react';
import AdminListEditor from './AdminListEditor.jsx';

export default function AdminRoles() {
  return (
    <AdminListEditor
      title="Roles I Fit"
      endpoint="/api/admin/roles"
      fields={[
        { key: 'label', label: 'Label (e.g. IT SUPPORT)', required: true },
        { key: 'title', label: 'Title', required: true },
        { key: 'evidence', label: 'Evidence (one line)', type: 'textarea', required: true },
        {
          key: 'published',
          label: 'Published',
          type: 'checkbox',
        },
      ]}
      defaultRow={{ label: '', title: '', evidence: '', sortOrder: 0, published: true }}
      itemLabel={(item) => item.label || item.title}
    />
  );
}

