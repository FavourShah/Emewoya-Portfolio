export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err.errors) {
        console.error('[validate] Zod validation failed. Raw body:', req.body);
        console.error('[validate] Issues:', err.errors);
        return res.status(400).json({
          error: 'Validation failed',
          issues: err.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };
}

