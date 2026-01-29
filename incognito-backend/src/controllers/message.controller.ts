import { Response } from 'express';
import { AuthRequest } from '../types';
import { MessageService } from '../services/message.service';
import { UserService } from '../services/user.service';

export class MessageController {
  /**
   * POST /api/messages/send/:publicId
   * Send anonymous message (no auth required)
   */
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;
      const { content } = req.body;
  
      console.log('📨 Sending message to publicId:', publicId); // DEBUG
      console.log('📝 Message content:', content); // DEBUG
  
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
      console.log('🔍 Looking up receiver...'); // DEBUG
      const receiver = await UserService.getUserByPublicId(publicId);
      console.log('👤 Receiver found:', receiver); // DEBUG
  
      if (!receiver) {
        console.log('❌ Receiver not found'); // DEBUG
        res.status(404).json({
          error: 'Not Found',
          message: 'Invalid or inactive link',
        });
        return;
      }
  
      if (!receiver.uid) {
        console.error('❌ Receiver missing uid:', receiver); // DEBUG
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Invalid user data',
        });
        return;
      }
  
      // Create message
      console.log('💾 Creating message for uid:', receiver.uid); // DEBUG
      const message = await MessageService.createMessage(receiver.uid, trimmedContent);
      console.log('✅ Message created:', message.id); // DEBUG
  
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: {
          id: message.id,
          createdAt: message.createdAt,
        },
      });
    } catch (error) {
      console.error('❌ Send message error:', error);
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
      console.error('Get inbox error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve messages',
      });
    }
  }

  /**
   * PATCH /api/messages/:messageId/read
   * Mark message as read
   */
  static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;
      const { messageId } = req.params;

      const success = await MessageService.markAsRead(messageId, uid);

      if (!success) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Message not found or unauthorized',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Message marked as read',
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to mark message as read',
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
      console.error('Delete message error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete message',
      });
    }
  }
}