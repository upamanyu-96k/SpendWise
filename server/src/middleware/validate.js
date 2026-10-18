import { AppError } from './errors.js';

// validate(schema, 'body' | 'query') replaces the request part with the parsed, typed result
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(new AppError(400, details[0]?.message || 'Invalid input', details));
  }
  // req.query is a getter in some Express versions, so stash parsed data separately
  req.valid = { ...(req.valid || {}), [source]: result.data };
  next();
};
