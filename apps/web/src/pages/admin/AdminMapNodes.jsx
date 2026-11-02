import React from 'react';
import AdminListEditor from './AdminListEditor.jsx';

export default function AdminMapNodes() {
  return (
    <AdminListEditor
      title="Network Map Nodes"
      endpoint="/api/admin/map-nodes"
      fields={[
        { key: 'label', label: 'Label', required: true },
        {
          key: 'side',
          label: 'Side',
          type: 'select',
          options: [
            { value: 'left', label: 'Left (infrastructure / cloud)' },
            { value: 'right', label: 'Right (build / analyse)' },
          ],
          required: true,
        },
        { key: 'published', label: 'Published', type: 'checkbox' },
      ]}
      defaultRow={{ label: '', side: 'left', sortOrder: 0, published: true }}
      itemLabel={(item) => `${item.label} (${item.side})`}
    />
  );
}

