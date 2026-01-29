import { db } from '../config/firebase';
import { Message } from '../types';

const MESSAGES_COLLECTION = 'messages';

export class MessageService {
  /**
   * Create a new anonymous message
   */
  static async createMessage(receiverUid: string, content: string): Promise<Message> {
    const messageRef = db.collection(MESSAGES_COLLECTION).doc();
    
    const newMessage: Message = {
      id: messageRef.id,
      receiverUid,
      content: content.trim(),
      createdAt: new Date(),
      isRead: false,
    };

    await messageRef.set(newMessage);
    return newMessage;
  }

  /**
   * Get all messages for a user (inbox)
   */
  static async getMessagesByUser(uid: string): Promise<Message[]> {
    const snapshot = await db
      .collection(MESSAGES_COLLECTION)
      .where('receiverUid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as Message);
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string, uid: string): Promise<boolean> {
    const messageRef = db.collection(MESSAGES_COLLECTION).doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return false;
    }

    const message = messageDoc.data() as Message;
    
    // Verify the message belongs to the user
    if (message.receiverUid !== uid) {
      return false;
    }

    await messageRef.update({ isRead: true });
    return true;
  }

  /**
   * Delete a message
   */
  static async deleteMessage(messageId: string, uid: string): Promise<boolean> {
    const messageRef = db.collection(MESSAGES_COLLECTION).doc(messageId);
    const messageDoc = await messageRef.get();

    if (!messageDoc.exists) {
      return false;
    }

    const message = messageDoc.data() as Message;
    
    // Verify the message belongs to the user
    if (message.receiverUid !== uid) {
      return false;
    }

    await messageRef.delete();
    return true;
  }

  /**
   * Get unread message count
   */
  static async getUnreadCount(uid: string): Promise<number> {
    const snapshot = await db
      .collection(MESSAGES_COLLECTION)
      .where('receiverUid', '==', uid)
      .where('isRead', '==', false)
      .get();

    return snapshot.size;
  }
}