import { RootState } from '@/store/store';

class ApiClient {
  private baseURL: string;
  private getState: () => RootState;

  constructor(baseURL: string, getState: () => RootState) {
    this.baseURL = baseURL;
    this.getState = getState;
  }

  private getAuthToken(): string | null {
    return this.getState().auth.accessToken;
  }

  private async refreshTokenIfNeeded(): Promise<boolean> {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      // Check if token is expired by making a test request
      const response = await fetch(`${this.baseURL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshToken = this.getState().auth.refreshToken;
        if (refreshToken) {
          const refreshResponse = await fetch(`${this.baseURL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            // Update token in localStorage and Redux store
            localStorage.setItem('accessToken', data.accessToken);
            // Note: Redux store update should be handled by the auth slice
            return true;
          }
        }
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.refreshTokenIfNeeded();

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const token = this.getAuthToken();
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    await this.refreshTokenIfNeeded();

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    await this.refreshTokenIfNeeded();

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    await this.refreshTokenIfNeeded();

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    await this.refreshTokenIfNeeded();

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    return this.handleResponse<T>(response);
  }

  async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    await this.refreshTokenIfNeeded();

    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    // For non-JSON responses (like PDFs), return the response object
    return response as any;
  }
}

// Export a function to create the API client with Redux store access
export const createApiClient = (getState: () => RootState) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return new ApiClient(baseURL, getState);
};

export default ApiClient;