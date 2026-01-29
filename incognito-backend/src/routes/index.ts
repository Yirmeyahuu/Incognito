import { Router } from 'express';
import linkRoutes from './link.routes';
import messageRoutes from './message.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/links', linkRoutes);
router.use('/messages', messageRoutes);
router.use('/user', userRoutes);

export default router;