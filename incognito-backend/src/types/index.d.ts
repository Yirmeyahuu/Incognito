import { Request } from 'express';

export interface User {
  uid: string;
  publicId: string;
  createdAt: Date;
}

export interface PublicLink {
  publicId: string;
  ownerUid: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  receiverUid: string;
  content: string;
  createdAt: Date;
  isRead: boolean;
}

// Request types for Express
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}