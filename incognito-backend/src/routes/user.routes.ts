import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require authentication)
router.get('/profile', authenticateUser, UserController.getProfile);

// ✅ NEW: Profile update endpoints
router.patch('/profile-photo', authenticateUser, UserController.updateProfilePhoto);
router.patch('/username', authenticateUser, UserController.updateUsername);

export default router;