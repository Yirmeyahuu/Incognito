import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
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
  createdAt: string | { _seconds: number; _nanoseconds: number };
  isRead: boolean;
}

const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  return token;
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // ✅ Preserve error code from backend
      const error: any = new Error(data.message || data.error || 'Request failed');
      error.code = data.code; // e.g., 'LINK_DISABLED'
      throw error;
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error: any) {
    console.error(`❌ API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      code: error.code, // ✅ Pass error code to caller
    };
  }
};

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

export const userApi = {
  getProfile: async (): Promise<ApiResponse<BackendUser>> => {
    return authenticatedRequest<BackendUser>('/user/profile');
  },
};

export const linkApi = {
  getMyLink: async (): Promise<ApiResponse<BackendPublicLink>> => {
    return authenticatedRequest<BackendPublicLink>('/links/my-link');
  },

  regenerateLink: async (): Promise<ApiResponse<BackendPublicLink>> => {
    return authenticatedRequest<BackendPublicLink>('/links/regenerate', {
      method: 'POST',
    });
  },

  validateLink: async (publicId: string): Promise<ApiResponse<{ isValid: boolean; ownerUid?: string }>> => {
    return apiRequest<{ isValid: boolean; ownerUid?: string }>(`/links/validate/${publicId}`);
  },

  // ✅ NEW: Toggle link active/inactive status
  toggleLinkStatus: async (isActive: boolean): Promise<ApiResponse<{ success: boolean; isActive: boolean }>> => {
    return authenticatedRequest<{ success: boolean; isActive: boolean }>('/links/toggle-status', {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};

export const messageApi = {
  sendMessage: async (publicId: string, content: string): Promise<ApiResponse<BackendMessage>> => {
    return apiRequest<BackendMessage>(`/messages/send/${publicId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  getInbox: async (): Promise<ApiResponse<BackendMessage[]>> => {
    return authenticatedRequest<BackendMessage[]>('/messages/inbox');
  },

  markAsRead: async (messageId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return authenticatedRequest<{ success: boolean }>(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  },

  markAllAsRead: async (): Promise<ApiResponse<{ count: number; message: string }>> => {
    return authenticatedRequest<{ count: number; message: string }>('/messages/mark-all-read', {
      method: 'PATCH',
    });
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return authenticatedRequest<{ success: boolean }>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },
};

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

export const api = {
  user: userApi,
  link: linkApi,
  message: messageApi,
  healthCheck,
};

export default api;