class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details = null) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', details = null) {
    super(401, message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details = null) {
    super(403, message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found', details = null) {
    super(404, message, details);
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal Server Error', details = null) {
    super(500, message, details);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service Unavailable', details = null) {
    super(503, message, details);
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        throw new BadRequestError(data.message || 'Invalid request', data.details);
      case 401:
        throw new UnauthorizedError(data.message || 'Authentication required');
      case 403:
        throw new ForbiddenError(data.message || 'Access denied');
      case 404:
        throw new NotFoundError(data.message || 'Resource not found');
      case 500:
        throw new InternalServerError(data.message || 'Internal server error');
      case 503:
        throw new ServiceUnavailableError(data.message || 'Service unavailable');
      default:
        throw new ApiError(status, data.message || 'An error occurred');
    }
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from the server. Please check your connection.');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(error.message || 'An error occurred while setting up the request');
  }
};

export const errorHandler = (error, req, res) => {
  console.error('Error:', error);
  
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      success: false,
      message: error.message,
      ...(error.details && { details: error.details })
    });
  }
  
  // Default to 500 server error
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message, stack: error.stack })
  });
};
