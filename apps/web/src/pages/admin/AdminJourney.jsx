import React from 'react';
import AdminListEditor from './AdminListEditor.jsx';

export default function AdminJourney() {
  return (
    <AdminListEditor
      title="Journey"
      endpoint="/api/admin/journey"
      fields={[
        { key: 'label', label: 'Label (e.g. FOUNDATION)', required: true },
        { key: 'title', label: 'Title', required: true },
        { key: 'body', label: 'Body text', type: 'textarea' },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
      defaultRow={{ label: '', title: '', body: '', sortOrder: 0, published: true }}
      itemLabel={(item) => item.label || item.title}
    />
  );
}

