import express from 'express';
import { z } from 'zod';
import { signUpload } from '../../lib/cloudinary.js';
import { validate } from '../../middleware/validate.js';

export const uploadsRouter = express.Router();

const uploadSignSchema = z.object({
  folder: z.string().default('portfolio/projects'),
});

uploadsRouter.post('/sign', validate(uploadSignSchema), (req, res) => {
  const { folder } = req.body;
  const signatureData = signUpload(folder);
  res.json(signatureData);
});

