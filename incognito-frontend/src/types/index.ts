export interface User {
  uid: string;
  email: string;
  displayName?: string;
  publicId: string;
  inboxEnabled: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isArchived: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}