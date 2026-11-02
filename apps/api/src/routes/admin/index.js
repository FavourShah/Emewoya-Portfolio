import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { settingsRouter } from './settings.js';
import { rolesRouter } from './roles.js';
import { mapNodesRouter } from './mapNodes.js';
import { journeyRouter } from './journey.js';
import { certGroupsRouter } from './certGroups.js';
import { certificationsRouter } from './certifications.js';
import { projectsRouter } from './projects.js';
import { linkedinPostsRouter } from './linkedinPosts.js';
import { uploadsRouter } from './uploads.js';
import { scrapeRouter } from './scrape.js';

export const adminRouter = express.Router();

// Guard all admin routes with authentication
adminRouter.use(requireAuth);

adminRouter.use('/settings', settingsRouter);
adminRouter.use('/roles', rolesRouter);
adminRouter.use('/map-nodes', mapNodesRouter);
adminRouter.use('/journey', journeyRouter);
adminRouter.use('/cert-groups', certGroupsRouter);
adminRouter.use('/certifications', certificationsRouter);
adminRouter.use('/projects', projectsRouter);
adminRouter.use('/linkedin-posts', linkedinPostsRouter);
adminRouter.use('/uploads', uploadsRouter);
adminRouter.use('/scrape', scrapeRouter);

