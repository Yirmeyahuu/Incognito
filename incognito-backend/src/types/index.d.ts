import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
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
  isRead: boolean;
  createdAt: Date;
}

export interface User {
  uid: string;
  email?: string;
  publicId?: string;
  createdAt: Date;
}