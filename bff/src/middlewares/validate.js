export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: 'Validation Failed',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    });
  }
};
