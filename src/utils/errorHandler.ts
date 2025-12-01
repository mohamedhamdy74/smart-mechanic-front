export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status = 500, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    };
  }

  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;
    return {
      message: data?.message || error.message || 'Server error',
      status,
      code: data?.code,
      details: data,
    };
  }

  if (error.request) {
    // Network error
    return {
      message: 'Network error - please check your connection',
      status: 0,
      code: 'NETWORK_ERROR',
    };
  }

  // Other errors
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500,
    code: 'UNKNOWN_ERROR',
  };
};

export const isNetworkError = (error: ApiError): boolean => {
  return error.status === 0 || error.code === 'NETWORK_ERROR';
};

export const isAuthError = (error: ApiError): boolean => {
  return error.status === 401;
};

export const isPermissionError = (error: ApiError): boolean => {
  return error.status === 403;
};

export const isValidationError = (error: ApiError): boolean => {
  return error.status === 400;
};

export const isServerError = (error: ApiError): boolean => {
  return error.status >= 500;
};

// Toast notification helpers
export const getErrorToastConfig = (error: ApiError) => {
  let title = 'Error';
  let description = error.message;

  if (isNetworkError(error)) {
    title = 'Connection Error';
    description = 'Please check your internet connection and try again.';
  } else if (isAuthError(error)) {
    title = 'Authentication Error';
    description = 'Please log in again.';
  } else if (isPermissionError(error)) {
    title = 'Permission Denied';
    description = 'You do not have permission to perform this action.';
  } else if (isValidationError(error)) {
    title = 'Validation Error';
    description = error.message;
  } else if (isServerError(error)) {
    title = 'Server Error';
    description = 'Something went wrong on our end. Please try again later.';
  }

  return { title, description };
};