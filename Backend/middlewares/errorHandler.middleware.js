const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

const createBadRequestError = (message = 'Bad Request') => createError(message, 400);
const createUnauthorizedError = (message = 'Unauthorized') => createError(message, 401);
const createForbiddenError = (message = 'Forbidden') => createError(message, 403);
const createNotFoundError = (message = 'Resource Not Found') => createError(message, 404);
const createConflictError = (message = 'Conflict') => createError(message, 409);
const createValidationError = (message = 'Validation Error') => createError(message, 422);

const notFoundHandler = (req, res, next) => {
  const error = createNotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    userAgent: req.get('user-agent'),
  });

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    statusCode = 409;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  }

  if (err.name === 'CastError') {
    message = `Invalid ${err.path}: ${err.value}`;
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token. Please log in again';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired. Please log in again';
    statusCode = 401;
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Max size exceeded';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Unexpected file field';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded';
    } else {
      message = `File upload error: ${err.message}`;
    }
    statusCode = 400;
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    message = 'Invalid JSON in request body';
    statusCode = 400;
  }

  if (err.message && err.message.includes('CORS policy')) {
    statusCode = 403;
    message = 'CORS policy: Access denied';
  }

  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    message = 'Database connection error. Please try again later';
    statusCode = 503;
  }

  if (err.status === 429 || err.statusCode === 429) {
    message = 'Too many requests. Please try again later';
    statusCode = 429;
  }

  if (err.name === 'CloudinaryError' || (err.error && err.error.message)) {
    message = 'File upload service error. Please try again';
    statusCode = 500;
  }

  if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    message = 'Request timeout. Please try again';
    statusCode = 408;
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      errorType: err.name,
      errorCode: err.code
    })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export {
  createError,
  createBadRequestError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createValidationError,
  notFoundHandler,
  errorHandler,
  asyncHandler
};

export default errorHandler;
