import { PublicLink } from '../types';

/**
 * PublicLink model - represents user's anonymous messaging link
 * No database operations yet - just type definitions
 */
export class PublicLinkModel implements PublicLink {
  publicId: string;
  ownerUid: string;
  isActive: boolean;
  createdAt: Date;

  constructor(data: PublicLink) {
    this.publicId = data.publicId;
    this.ownerUid = data.ownerUid;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
  }

  // TODO: Add database operations in next step
}