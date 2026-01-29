import { Router } from 'express';
import { LinkController } from '../controllers/link.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require authentication)
router.get('/my-link', authenticateUser, LinkController.getMyLink);
router.post('/regenerate', authenticateUser, LinkController.regenerateLink);

// Public route (no authentication)
router.get('/validate/:publicId', LinkController.validateLink);

export default router;