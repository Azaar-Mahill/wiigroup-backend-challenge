const notFound = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error]', err.stack);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : (err.error || 'Error'),
    message
  });
};

module.exports = { notFound, errorHandler };
