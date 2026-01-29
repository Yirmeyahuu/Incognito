import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/**
 * API Response types matching backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BackendUser {
  uid: string;
  publicId: string;
  createdAt: string;
}

export interface BackendPublicLink {
  publicId: string;
  ownerUid: string;
  isActive: boolean;
  createdAt: string;
}

export interface BackendMessage {
  id: string;
  receiverUid: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Get Firebase ID token for authentication
 */
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
};

/**
 * Generic API request handler with error handling
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error: any) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Authenticated API request handler
 */
const authenticatedRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const token = await getAuthToken();
    
    return await apiRequest<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
};

/**
 * User API endpoints
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse<BackendUser>> => {
    return authenticatedRequest<BackendUser>('/user/profile');
  },
};

/**
 * Link API endpoints
 */
export const linkApi = {
  /**
   * Get user's public link
   */
  getMyLink: async (): Promise<ApiResponse<BackendPublicLink>> => {
    return authenticatedRequest<BackendPublicLink>('/links/my-link');
  },

  /**
   * Regenerate user's public link
   */
  regenerateLink: async (): Promise<ApiResponse<BackendPublicLink>> => {
    return authenticatedRequest<BackendPublicLink>('/links/regenerate', {
      method: 'POST',
    });
  },

  /**
   * Validate if a public link exists and is active
   */
  validateLink: async (publicId: string): Promise<ApiResponse<{ isValid: boolean; ownerUid?: string }>> => {
    return apiRequest<{ isValid: boolean; ownerUid?: string }>(`/links/validate/${publicId}`);
  },
};

/**
 * Message API endpoints
 */
export const messageApi = {
  /**
   * Send anonymous message to a user
   */
  sendMessage: async (publicId: string, content: string): Promise<ApiResponse<BackendMessage>> => {
    return apiRequest<BackendMessage>(`/messages/send/${publicId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Get user's inbox messages
   */
  getInbox: async (): Promise<ApiResponse<BackendMessage[]>> => {
    return authenticatedRequest<BackendMessage[]>('/messages/inbox');
  },

  /**
   * Mark message as read
   */
  markAsRead: async (messageId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return authenticatedRequest<{ success: boolean }>(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Delete message
   */
  deleteMessage: async (messageId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return authenticatedRequest<{ success: boolean }>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<ApiResponse<{ status: string; timestamp: string; environment: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const data = await response.json();
    return {
      success: response.ok,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Health check failed',
    };
  }
};

// Export all API methods
export const api = {
  user: userApi,
  link: linkApi,
  message: messageApi,
  healthCheck,
};

export default api;