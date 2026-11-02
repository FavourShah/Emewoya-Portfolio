import { pool } from '../db.js';
import { bumpCacheVersion } from '../lib/cache.js';

async function updateLeaveProject() {
  const query = `
    UPDATE projects
    SET
      tag_line = $1,
      problem = $2,
      solves = $3,
      stack_brief = $4
    WHERE slug = 'leave-management-system'
    RETURNING id, title, slug, tag_line, stack_brief;
  `;

  const values = [
    'PERN Stack (PostgreSQL · Express · React · Node.js) · JWT · RBAC',
    'Leave requests, balance tracking, and approvals were previously handled through paper forms and disconnected chat messages. Employees lacked visibility into remaining allowances, managers approved without seeing team overlap, and HR faced error-prone end-of-year reconciliations.',
    'A centralized, self-service leave portal providing real-time balance calculations, date-range collision detection, and automated approval workflows. Employees submit with live balance feedback, managers approve with departmental calendar context, and HR maintains full audit history.',
    'React (Vite) on the frontend for an intuitive, zero-latency dashboard. Node.js & Express REST API with PostgreSQL for relational integrity, schema migrations, and transactional leave booking concurrency. Hand-rolled JWT with HTTP-only refresh tokens and role-based access control (Employee, Approver, HR Admin) ensuring sensitive records remain strictly partitioned.',
  ];

  const res = await pool.query(query, values);
  bumpCacheVersion();
  console.log('Successfully updated leave management project with PostgreSQL:', res.rows[0]);
  process.exit(0);
}

updateLeaveProject().catch((err) => {
  console.error('Error updating leave project:', err);
  process.exit(1);
});
