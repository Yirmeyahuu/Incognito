import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticateUser } from '../middleware/auth.middleware';
import { messageLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Public route (no authentication) - send anonymous message
router.post('/send/:publicId', messageLimiter, MessageController.sendMessage);

// Protected routes (require authentication)
router.get('/inbox', authenticateUser, MessageController.getInbox);
router.patch('/:messageId/read', authenticateUser, MessageController.markAsRead);
router.patch('/mark-all-read', authenticateUser, MessageController.markAllAsRead); // ✅ NEW
router.delete('/:messageId', authenticateUser, MessageController.deleteMessage);

export default router;