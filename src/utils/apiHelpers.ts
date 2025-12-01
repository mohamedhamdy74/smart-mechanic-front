import { api } from '@/lib/api';

// Generic API response handler
export const handleApiResponse = async <T>(
  apiCall: () => Promise<any>,
  successMessage?: string,
  errorMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> => {
  try {
    const response = await apiCall();
    if (successMessage) {
      console.log(successMessage);
    }
    return { success: true, data: response.data };
  } catch (error: any) {
    const message = errorMessage || error.response?.data?.message || 'An error occurred';
    console.error('API Error:', error);
    return { success: false, error: message };
  }
};

// Format date for display
export const formatDate = (date: string | Date, locale: string = 'ar-EG'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};

// Format time for display
export const formatTime = (time: string): string => {
  return time;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'ج.م'): string => {
  return `${amount} ${currency}`;
};

// Calculate rating stars
export const getRatingStars = (rating: number): number[] => {
  return Array.from({ length: 5 }, (_, i) => i < Math.floor(rating) ? 1 : 0);
};

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Egyptian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+20|0)?1[0-2,5]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Check if file is image
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Sleep function for delays
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Get status color
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500',
    accepted: 'bg-blue-500',
    rejected: 'bg-red-500',
    in_progress: 'bg-orange-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500',
  };
  return colors[status] || 'bg-gray-500';
};

// Get status text color
export const getStatusTextColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-yellow-600',
    accepted: 'text-blue-600',
    rejected: 'text-red-600',
    in_progress: 'text-orange-600',
    completed: 'text-green-600',
    cancelled: 'text-gray-600',
  };
  return colors[status] || 'text-gray-600';
};

// Calculate time ago
export const timeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = [
    { label: 'سنة', seconds: 31536000 },
    { label: 'شهر', seconds: 2592000 },
    { label: 'أسبوع', seconds: 604800 },
    { label: 'يوم', seconds: 86400 },
    { label: 'ساعة', seconds: 3600 },
    { label: 'دقيقة', seconds: 60 },
    { label: 'ثانية', seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `منذ ${count} ${interval.label}${count > 1 ? '' : ''}`;
    }
  }

  return 'الآن';
};