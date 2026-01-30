import { Response } from 'express';
import { AuthRequest } from '../types';
import { LinkService } from '../services/link.service';
import { db } from '../config/firebase';

export class LinkController {
  /**
   * ✅ GET /api/links/my-link - Return only publicId
   */
  static async getMyLink(req: AuthRequest, res: Response): Promise<void> {
    console.log('🎯 getMyLink endpoint called');
    try {
      const uid = req.user!.uid;
      console.log(`   User UID: ${uid}`);

      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'User document not found. Please try regenerating your link.',
        });
        return;
      }

      const userData = userDoc.data();
      
      if (!userData || !userData.publicId) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to retrieve link. Please try regenerating your link.',
        });
        return;
      }

      // ✅ Return only publicId - let frontend construct full URL
      res.status(200).json({
        success: true,
        data: {
          publicId: userData.publicId,
        },
      });
    } catch (error) {
      console.error('Get link error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve link',
      });
    }
  }

  /**
   * ✅ POST /api/links/regenerate - Return only publicId
   */
  static async regenerateLink(req: AuthRequest, res: Response): Promise<void> {
    console.log('🎯 regenerateLink endpoint called');
    try {
      const uid = req.user!.uid;
      console.log(`   User UID: ${uid}`);

      const newLink = await LinkService.regenerateLink(uid);

      // ✅ Return only publicId - let frontend construct full URL
      res.status(200).json({
        success: true,
        data: {
          publicId: newLink.publicId,
        },
        message: 'Link regenerated successfully',
      });
    } catch (error) {
      console.error('Regenerate link error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to regenerate link',
      });
    }
  }

  /**
   * GET /api/links/validate/:publicId
   */
  static async validateLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;
      const isValid = await LinkService.validateLink(publicId);

      res.status(200).json({
        success: true,
        data: { isValid },
      });
    } catch (error) {
      console.error('Validate link error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to validate link',
      });
    }
  }
}