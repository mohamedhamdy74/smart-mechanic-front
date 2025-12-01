// Error handling utilities
import React from 'react';

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

// Parse API error response
export const parseApiError = (error: any): AppError => {
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;
    return {
      message: data?.message || 'حدث خطأ في الخادم',
      code: data?.code,
      statusCode: status,
      details: data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'لا يمكن الاتصال بالخادم. تحقق من اتصال الإنترنت',
      code: 'NETWORK_ERROR',
      details: error.request,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'حدث خطأ غير متوقع',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }
};

// Handle async operation errors
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  fallbackMessage: string = 'حدث خطأ أثناء العملية'
): Promise<{ success: boolean; data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const appError = parseApiError(error);
    console.error('Async operation failed:', appError);
    return { success: false, error: appError };
  }
};

// Show user-friendly error message
export const getErrorMessage = (error: AppError): string => {
  switch (error.code) {
    case 'NETWORK_ERROR':
      return 'تحقق من اتصال الإنترنت وحاول مرة أخرى';
    case 'UNAUTHORIZED':
      return 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
    case 'FORBIDDEN':
      return 'ليس لديك صلاحية للوصول إلى هذا المحتوى';
    case 'NOT_FOUND':
      return 'المحتوى المطلوب غير موجود';
    case 'VALIDATION_ERROR':
      return 'البيانات المدخلة غير صحيحة';
    case 'DUPLICATE_ERROR':
      return 'البيانات موجودة مسبقاً';
    default:
      return error.message || 'حدث خطأ غير متوقع';
  }
};

// Log error for debugging
export const logError = (error: AppError, context?: string) => {
  const logData = {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    context,
    timestamp: new Date().toISOString(),
    details: error.details,
  };

  console.error('Application Error:', logData);

  // In production, you might want to send this to an error reporting service
  // like Sentry, LogRocket, etc.
};

// Retry mechanism for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
};

// Check if error is retryable
export const isRetryableError = (error: AppError): boolean => {
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT'];
  const retryableStatusCodes = [500, 502, 503, 504];

  return (
    retryableCodes.includes(error.code || '') ||
    (error.statusCode && retryableStatusCodes.includes(error.statusCode))
  );
};

// Global error boundary helper
export const createErrorBoundary = (fallbackUI: React.ComponentType<{ error: Error }>) => {
  return class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      logError(
        {
          message: error.message,
          code: 'REACT_ERROR',
          details: { error, errorInfo },
        },
        'React Error Boundary'
      );
    }

    render() {
      if (this.state.hasError && this.state.error) {
        return React.createElement(fallbackUI, { error: this.state.error });
      }

      return this.props.children;
    }
  };
};