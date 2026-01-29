import { Message } from '../types';

/**
 * Message model - represents anonymous messages
 * No sender information stored - fully anonymous
 * No database operations yet - just type definitions
 */
export class MessageModel implements Message {
  id: string;
  receiverUid: string;
  content: string;
  createdAt: Date;
  isRead: boolean;

  constructor(data: Message) {
    this.id = data.id;
    this.receiverUid = data.receiverUid;
    this.content = data.content;
    this.createdAt = data.createdAt;
    this.isRead = data.isRead;
  }

  // TODO: Add database operations in next step
}