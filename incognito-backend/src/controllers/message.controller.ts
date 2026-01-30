import { Response } from 'express';
import { AuthRequest } from '../types';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';
import { env } from '../config/env';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export class MessageController {
  /**
   * POST /api/messages/send/:publicId
   * Send anonymous message (no auth required)
   */
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;
      const { content } = req.body;

      // Validate input
      if (!content || typeof content !== 'string') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Message content is required',
        });
        return;
      }

      const trimmedContent = content.trim();

      if (trimmedContent.length === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Message cannot be empty',
        });
        return;
      }

      if (trimmedContent.length > 500) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Message too long (max 500 characters)',
        });
        return;
      }

      // Get receiver by public ID
      const receiver = await UserService.getUserByPublicId(publicId);

      if (!receiver) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Invalid or inactive link',
        });
        return;
      }

      if (!receiver.uid) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Invalid user data',
        });
        return;
      }

      // Create message
      const message = await MessageService.createMessage(receiver.uid, trimmedContent);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: message.id,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      if (env.nodeEnv === 'development') {
        console.error('Send message error:', error);
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send message',
      });
    }
  }

  /**
   * GET /api/messages/inbox
   * Get authenticated user's inbox
   */
  static async getInbox(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;

      const messages = await MessageService.getMessagesByUser(uid);
      const unreadCount = await MessageService.getUnreadCount(uid);

      res.status(200).json({
        success: true,
        data: {
          messages,
          unreadCount,
          total: messages.length,
        },
      });
    } catch (error) {
      if (env.nodeEnv === 'development') {
        console.error('Get inbox error:', error);
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve messages',
      });
    }
  }

  /**
   * PATCH /api/messages/:messageId/read
   * Mark a single message as read
   */
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ 
          success: false, 
          error: 'Unauthorized' 
        });
        return;
      }

      const messageRef = db.collection('messages').doc(messageId);
      const messageDoc = await messageRef.get();

      if (!messageDoc.exists) {
        res.status(404).json({ 
          success: false, 
          error: 'Message not found' 
        });
        return;
      }

      const messageData = messageDoc.data();

      // Verify message belongs to user
      if (messageData?.receiverUid !== uid) {
        res.status(403).json({ 
          success: false, 
          error: 'Access denied' 
        });
        return;
      }

      // Update read status
      await messageRef.update({
        isRead: true,
        readAt: FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
        data: { success: true },
      });
    } catch (error: any) {
      if (env.nodeEnv === 'development') {
        console.error('Mark as read error:', error);
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark message as read',
      });
    }
  }

  /**
   * PATCH /api/messages/mark-all-read
   * Mark all messages as read
   */
  static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({ 
          success: false, 
          error: 'Unauthorized' 
        });
        return;
      }

      // Get all unread messages for this user
      const messagesSnapshot = await db
        .collection('messages')
        .where('receiverUid', '==', uid)
        .where('isRead', '==', false)
        .get();

      if (messagesSnapshot.empty) {
        res.status(200).json({
          success: true,
          data: { count: 0, message: 'No unread messages' },
        });
        return;
      }

      // Batch update all messages
      const batch = db.batch();
      messagesSnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      res.status(200).json({
        success: true,
        data: { 
          count: messagesSnapshot.size, 
          message: 'All messages marked as read' 
        },
      });
    } catch (error: any) {
      if (env.nodeEnv === 'development') {
        console.error('Error marking all messages as read:', error);
      }
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark all messages as read',
      });
    }
  }

  /**
   * DELETE /api/messages/:messageId
   * Delete a message
   */
  static async deleteMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;
      const { messageId } = req.params;

      const success = await MessageService.deleteMessage(messageId, uid);

      if (!success) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Message not found or unauthorized',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      if (env.nodeEnv === 'development') {
        console.error('Delete message error:', error);
      }
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete message',
      });
    }
  }
}