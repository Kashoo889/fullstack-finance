/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // MySQL connection errors
  if (err.code === 'ECONNRESET' || 
      err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ETIMEDOUT' ||
      err.message?.includes('Access denied') ||
      err.message?.includes('Connection lost')) {
    error = { 
      message: 'Database connection error. Please try again.', 
      statusCode: 503 
    };
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Duplicate entry. This record already exists.';
    error = { message, statusCode: 400 };
  }

  // MySQL connection limit exceeded
  if (err.code === 'ER_CON_COUNT_ERROR') {
    error = { 
      message: 'Too many database connections. Please try again in a moment.', 
      statusCode: 503 
    };
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async handler wrapper to catch errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

