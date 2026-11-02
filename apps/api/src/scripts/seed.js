import { pool } from '../db.js';
import { logger } from '../lib/logger.js';

async function seed() {
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL is not set. Please set it in .env before seeding.');
    process.exit(1);
  }

  const client = await pool.connect();
  logger.info('Connected to PostgreSQL for database seeding...');

  try {
    await client.query('BEGIN');

    // 1. Site Settings (id = 1)
    logger.info('Seeding site_settings...');
    await client.query(
      `INSERT INTO site_settings (
        id, full_name, headline, subheadline, location, timezone,
        statement, bio, photo_public_id, email, linkedin_url, github_url, twitter_url
      ) VALUES (
        1,
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        headline = EXCLUDED.headline,
        subheadline = EXCLUDED.subheadline,
        location = EXCLUDED.location,
        timezone = EXCLUDED.timezone,
        statement = EXCLUDED.statement,
        bio = EXCLUDED.bio,
        email = EXCLUDED.email,
        linkedin_url = EXCLUDED.linkedin_url,
        github_url = EXCLUDED.github_url,
        twitter_url = EXCLUDED.twitter_url,
        updated_at = NOW();`,
      [
        'Favour Ezechi-Oriaku',
        'Keeps systems up. Builds the ones that aren’t yet.',
        'IT support, cloud, web development and business analysis. One map, and every node is something I’ve worked with or studied.',
        'Lagos, Nigeria',
        'Africa/Lagos',
        'I don’t just look at what is broken. I look at what can be built to make things work better.',
        'I’m Favour. I trained as an electrical and electronics engineer, spent time in broadcast and radio transmission, and now support users by day and build full-stack apps the rest of the time.',
        null, // [PHOTO FROM LINKEDIN] to be uploaded in CMS
        '[EMAIL]',
        '[LINKEDIN]',
        '[GITHUB]',
        '[X / TWITTER]',
      ]
    );

    // 2. Roles
    logger.info('Seeding roles...');
    await client.query('DELETE FROM roles');
    const rolesData = [
      {
        label: 'IT SUPPORT',
        title: 'Keeps people working',
        evidence: '40+ users at Hilal Takaful Insurance. Active Directory, Microsoft 365, Sophos, remote support.',
        sort_order: 1,
      },
      {
        label: 'CLOUD',
        title: 'Azure and Microsoft 365',
        evidence: 'AZ-900 passed, MS-102 in progress. Identity, administration and automation basics.',
        sort_order: 2,
      },
      {
        label: 'WEB DEVELOPMENT',
        title: 'Full-stack web development',
        evidence: 'React front ends, Express APIs, MongoDB and PostgreSQL, JWT auth and role-based access.',
        sort_order: 3,
      },
      {
        label: 'BUSINESS ANALYSIS',
        title: 'Problem to solution',
        evidence: 'Understands the operational gap first, then turns it into a practical tool. Payroll and leave workflows.',
        sort_order: 4,
      },
    ];

    for (const r of rolesData) {
      await client.query(
        `INSERT INTO roles (label, title, evidence, sort_order, published)
         VALUES ($1, $2, $3, $4, true)`,
        [r.label, r.title, r.evidence, r.sort_order]
      );
    }

    // 3. Map Nodes
    logger.info('Seeding map_nodes...');
    await client.query('DELETE FROM map_nodes');
    const mapNodesData = [
      // Left (infrastructure and cloud)
      { label: 'Active Directory', side: 'left', sort_order: 1 },
      { label: 'Microsoft 365', side: 'left', sort_order: 2 },
      { label: 'Sophos', side: 'left', sort_order: 3 },
      { label: 'Starlink · LAN/WAN', side: 'left', sort_order: 4 },
      { label: 'Azure', side: 'left', sort_order: 5 },
      // Right (build and analyse)
      { label: 'React', side: 'right', sort_order: 1 },
      { label: 'Node · Express', side: 'right', sort_order: 2 },
      { label: 'MongoDB · PostgreSQL', side: 'right', sort_order: 3 },
      { label: 'JWT · RBAC', side: 'right', sort_order: 4 },
      { label: 'Process improvement', side: 'right', sort_order: 5 },
    ];

    for (const m of mapNodesData) {
      await client.query(
        `INSERT INTO map_nodes (label, side, sort_order, published)
         VALUES ($1, $2, $3, true)`,
        [m.label, m.side, m.sort_order]
      );
    }

    // 4. Journey Steps
    logger.info('Seeding journey_steps...');
    await client.query('DELETE FROM journey_steps');
    const journeyData = [
      {
        label: 'FOUNDATION',
        title: 'B.Eng. Electrical & Electronics',
        body: 'Second Class Upper · MOUAU Umudike. Broadcast and radio transmission work.',
        sort_order: 1,
      },
      {
        label: 'EXPERIENCE',
        title: 'IT Support & Operations',
        body: 'Helpdesk for 40+ users at Hilal Takaful Insurance. Before that, IT Manager at Ryan Hotel & Suites.',
        sort_order: 2,
      },
      {
        label: 'BUILDING',
        title: 'Full-stack applications',
        body: 'MongoDB and PostgreSQL, JWT auth, role-based access and REST APIs, built around real operational problems.',
        sort_order: 3,
      },
      {
        label: 'GROWING',
        title: 'Cloud & identity',
        body: 'Azure, Microsoft 365 administration, Terraform basics. Philosophy off the clock.',
        sort_order: 4,
      },
    ];

    for (const j of journeyData) {
      await client.query(
        `INSERT INTO journey_steps (label, title, body, sort_order, published)
         VALUES ($1, $2, $3, $4, true)`,
        [j.label, j.title, j.body, j.sort_order]
      );
    }

    // 5. Cert Groups & Certifications
    logger.info('Seeding cert_groups and certifications...');
    await client.query('DELETE FROM cert_groups'); // cascades to certifications
    const certGroupsData = [
      {
        name: 'Microsoft',
        subtitle: 'Azure, Microsoft 365 and IT support',
        sort_order: 1,
        items: [
          { title: 'AZ-900 · Azure Fundamentals', status: 'passed', sort_order: 1 },
          { title: 'MS-102 · Microsoft 365 Administrator', status: 'in_progress', sort_order: 2 },
          { title: 'Microsoft IT Support Specialist Professional Certificate', status: 'in_progress', sort_order: 3 },
        ],
      },
      {
        name: 'Google',
        subtitle: 'IT support fundamentals',
        sort_order: 2,
        items: [
          { title: 'Google IT Support Professional Certificate', status: 'in_progress', sort_order: 1 },
          { title: 'Next up · [NEXT CERT]', status: 'planned', sort_order: 2 },
        ],
      },
    ];

    for (const group of certGroupsData) {
      const gRes = await client.query(
        `INSERT INTO cert_groups (name, subtitle, sort_order)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [group.name, group.subtitle, group.sort_order]
      );
      const groupId = gRes.rows[0].id;

      for (const item of group.items) {
        await client.query(
          `INSERT INTO certifications (group_id, title, status, sort_order, published)
           VALUES ($1, $2, $3, $4, true)`,
          [groupId, item.title, item.status, item.sort_order]
        );
      }
    }

    // 6. Projects & Project Media & Tech Tags
    logger.info('Seeding projects, media, and tech tags...');
    await client.query('DELETE FROM projects'); // cascades to project_media and tech_tags

    const projectsData = [
      {
        slug: 'payroll-management-system',
        title: 'Payroll Management System',
        tag_line: 'MERN · JWT · RBAC',
        problem: '[CONFIRM] Payroll done by hand is slow to calculate, and records and payslips end up scattered.',
        solves: 'Employee records, salary runs and payslip generation in one workflow, with access limited by role.',
        stack_brief:
          'React, Node, Express and MongoDB keep it one language end to end. JWT and role-based access mean admins and staff only see what they should. PDF generation produces the payslips.',
        status: 'published',
        sort_order: 1,
        tags: ['React', 'Node', 'Express', 'MongoDB', 'JWT', 'RBAC', 'PDF'],
        media: [
          { public_id: 'placeholder-payroll-1', alt_text: '[SCREENSHOT 1]', sort_order: 1 },
          { public_id: 'placeholder-payroll-2', alt_text: '[SCREENSHOT 2]', sort_order: 2 },
          { public_id: 'placeholder-payroll-3', alt_text: '[SCREENSHOT 3]', sort_order: 3 },
        ],
      },
      {
        slug: 'leave-management-system',
        title: 'Leave Management System',
        tag_line: 'PERN Stack (PostgreSQL · Express · React · Node.js) · JWT · RBAC',
        problem: 'Leave requests, balance tracking, and approvals were previously handled through paper forms and disconnected chat messages. Employees lacked visibility into remaining allowances, managers approved without seeing team overlap, and HR faced error-prone end-of-year reconciliations.',
        solves: 'A centralized, self-service leave portal providing real-time balance calculations, date-range collision detection, and automated automated approval workflows. Employees submit with live balance feedback, managers approve with departmental calendar context, and HR maintains full audit history.',
        stack_brief: 'React (Vite) on the frontend for an intuitive, zero-latency dashboard. Node.js & Express REST API with PostgreSQL for relational integrity, schema migrations, and transactional leave booking concurrency. Hand-rolled JWT with HTTP-only refresh tokens and role-based access control (Employee, Approver, HR Admin) ensuring sensitive records remain strictly partitioned.',
        status: 'published',
        sort_order: 2,
        tags: ['React', 'Node', 'Express', 'PostgreSQL', 'JWT', 'RBAC'],
        media: [
          { public_id: 'placeholder-leave-1', alt_text: '[SCREENSHOT 1]', sort_order: 1 },
          { public_id: 'placeholder-leave-2', alt_text: '[SCREENSHOT 2]', sort_order: 2 },
          { public_id: 'placeholder-leave-3', alt_text: '[SCREENSHOT 3]', sort_order: 3 },
        ],
      },
      // Teaser rows (unnamed "Next case study" lines, status = 'teaser')
      {
        slug: 'teaser-1',
        title: 'Teaser 1',
        tag_line: null,
        problem: null,
        solves: null,
        stack_brief: null,
        status: 'teaser',
        sort_order: 3,
        tags: [],
        media: [],
      },
      {
        slug: 'teaser-2',
        title: 'Teaser 2',
        tag_line: null,
        problem: null,
        solves: null,
        stack_brief: null,
        status: 'teaser',
        sort_order: 4,
        tags: [],
        media: [],
      },
      {
        slug: 'teaser-3',
        title: 'Teaser 3',
        tag_line: null,
        problem: null,
        solves: null,
        stack_brief: null,
        status: 'teaser',
        sort_order: 5,
        tags: [],
        media: [],
      },
    ];

    for (const p of projectsData) {
      const pRes = await client.query(
        `INSERT INTO projects (slug, title, tag_line, problem, solves, stack_brief, status, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [p.slug, p.title, p.tag_line, p.problem, p.solves, p.stack_brief, p.status, p.sort_order]
      );
      const projectId = pRes.rows[0].id;

      for (const m of p.media) {
        await client.query(
          `INSERT INTO project_media (project_id, public_id, alt_text, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [projectId, m.public_id, m.alt_text, m.sort_order]
        );
      }

      for (const tag of p.tags) {
        await client.query(
          `INSERT INTO tech_tags (project_id, name)
           VALUES ($1, $2)`,
          [projectId, tag]
        );
      }
    }

    // 7. Latest LinkedIn Post
    logger.info('Seeding linkedin_posts...');
    await client.query('DELETE FROM linkedin_posts');
    await client.query(
      `INSERT INTO linkedin_posts (post_url, excerpt, posted_on, published)
       VALUES ($1, $2, $3, true)`,
      ['[LINKEDIN POST URL]', '[LATEST POST EXCERPT]', '2026-11-01']
    );

    await client.query('COMMIT');
    logger.info('Database seeded successfully without modifying admin_users.');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error(error, 'Error during database seeding, transaction rolled back.');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));

