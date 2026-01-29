import { User } from '../types';

/**
 * User model - represents authenticated users
 * No database operations yet - just type definitions
 */
export class UserModel implements User {
  uid: string;
  email?: string;
  publicId?: string;
  createdAt: Date;

  constructor(data: User) {
    this.uid = data.uid;
    this.email = data.email;
    this.publicId = data.publicId;
    this.createdAt = data.createdAt;
  }

  // TODO: Add database operations in next step
}