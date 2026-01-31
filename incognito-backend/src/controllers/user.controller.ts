import { Response } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';
import { db } from '../config/firebase';

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

  /**
   * ✅ NEW: PATCH /api/user/profile-photo
   * Update user's profile photo
   */
  static async updateProfilePhoto(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;
      const { profilePhoto } = req.body;

      // Validate profilePhoto
      const validPhotos = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4'];
      if (!profilePhoto || !validPhotos.includes(profilePhoto)) {
        res.status(400).json({
          success: false,
          error: 'Invalid profile photo ID',
        });
        return;
      }

      // Update in Firestore
      await db.collection('users').doc(uid).update({
        profilePhoto,
        updatedAt: new Date(),
      });

      console.log(`✅ Updated profile photo for user ${uid} to ${profilePhoto}`);

      res.status(200).json({
        success: true,
        data: { profilePhoto },
        message: 'Profile photo updated successfully',
      });
    } catch (error) {
      console.error('Update profile photo error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile photo',
      });
    }
  }

  /**
   * ✅ NEW: PATCH /api/user/username
   * Update user's display name
   */
  static async updateUsername(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;
      const { username } = req.body;

      // Validate username
      if (!username || typeof username !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Username is required',
        });
        return;
      }

      const trimmedUsername = username.trim();

      if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
        res.status(400).json({
          success: false,
          error: 'Username must be between 3 and 20 characters',
        });
        return;
      }

      // Only allow alphanumeric and underscores
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        res.status(400).json({
          success: false,
          error: 'Username can only contain letters, numbers, and underscores',
        });
        return;
      }

      // Update in Firestore
      await db.collection('users').doc(uid).update({
        displayName: trimmedUsername,
        customUsername: trimmedUsername,
        updatedAt: new Date(),
      });

      console.log(`✅ Updated username for user ${uid} to ${trimmedUsername}`);

      res.status(200).json({
        success: true,
        data: { username: trimmedUsername },
        message: 'Username updated successfully',
      });
    } catch (error) {
      console.error('Update username error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update username',
      });
    }
  }
}