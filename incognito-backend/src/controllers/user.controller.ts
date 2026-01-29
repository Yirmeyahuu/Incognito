import { Response } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';

export class UserController {
  /**
   * GET /api/user/profile
   * Get authenticated user's profile
   */
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;

      const user = await UserService.getOrCreateUser(uid);

      res.status(200).json({
        success: true,
        data: {
          uid: user.uid,
          publicId: user.publicId,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve profile',
      });
    }
  }
}