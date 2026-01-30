import { db } from '../config/firebase';
import { Message } from '../types';

export class MessageService {
  /**
   * Create a new message
   */
  static async createMessage(receiverUid: string, content: string): Promise<Message> {
    const messageRef = db.collection('messages').doc();
    const now = new Date();

    const message: Message = {
      id: messageRef.id,
      receiverUid,
      content,
      createdAt: now,
      isRead: false,
    };

    await messageRef.set({
      receiverUid,
      content,
      createdAt: now,
      isRead: false,
    });

    return message;
  }

  /**
   * Get all messages for a user - CONVERT TIMESTAMPS TO ISO STRINGS
   */
  static async getMessagesByUser(uid: string): Promise<any[]> {
    const snapshot = await db
      .collection('messages')
      .where('receiverUid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Convert Firestore Timestamp to ISO string
      let createdAtISO: string;
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        // Firestore Timestamp object
        createdAtISO = data.createdAt.toDate().toISOString();
      } else if (data.createdAt instanceof Date) {
        // Already a Date object
        createdAtISO = data.createdAt.toISOString();
      } else if (typeof data.createdAt === 'string') {
        // Already a string
        createdAtISO = data.createdAt;
      } else {
        // Fallback to current time
        createdAtISO = new Date().toISOString();
      }
      
      return {
        id: doc.id,
        receiverUid: data.receiverUid,
        content: data.content,
        createdAt: createdAtISO,
        isRead: data.isRead,
      };
    });
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(uid: string): Promise<number> {
    const snapshot = await db
      .collection('messages')
      .where('receiverUid', '==', uid)
      .where('isRead', '==', false)
      .get();

    return snapshot.size;
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string, uid: string): Promise<boolean> {
    const messageRef = db.collection('messages').doc(messageId);
    const doc = await messageRef.get();

    if (!doc.exists || doc.data()?.receiverUid !== uid) {
      return false;
    }

    await messageRef.update({ isRead: true });
    return true;
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, uid: string): Promise<boolean> {
    const messageRef = db.collection('messages').doc(messageId);
    const doc = await messageRef.get();

    if (!doc.exists || doc.data()?.receiverUid !== uid) {
      return false;
    }

    await messageRef.delete();
    return true;
  }

  /**
   * Get a specific message
   */
  static async getMessageById(messageId: string): Promise<Message | null> {
    const doc = await db.collection('messages').doc(messageId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    
    // Convert timestamp to Date
    let createdAt: Date;
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAt = data.createdAt.toDate();
    } else if (data.createdAt instanceof Date) {
      createdAt = data.createdAt;
    } else {
      createdAt = new Date();
    }
    
    return {
      id: doc.id,
      receiverUid: data.receiverUid,
      content: data.content,
      createdAt,
      isRead: data.isRead,
    };
  }
}