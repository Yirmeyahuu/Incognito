import { Response } from 'express';
import { AuthRequest } from '../types';
import { LinkService } from '../services/link.service';
import { db } from '../config/firebase';

export class LinkController {
  /**
   * ✅ GET /api/links/my-link - Read from user document
   */
  static async getMyLink(req: AuthRequest, res: Response): Promise<void> {
    console.log('🎯 getMyLink endpoint called');
    try {
      const uid = req.user!.uid;
      console.log(`   User UID: ${uid}`);

      // ✅ Read directly from user document (fastest)
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'User document not found. Please try regenerating your link.',
        });
        return;
      }

      const userData = userDoc.data();
      
      // ✅ Add null check
      if (!userData || !userData.publicId) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to retrieve link. Please try regenerating your link.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          publicId: userData.publicId,
          publicLink: userData.publicLink, // ✅ Return full link
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
   * ✅ POST /api/links/regenerate - Returns new link immediately
   */
  static async regenerateLink(req: AuthRequest, res: Response): Promise<void> {
    console.log('🎯 regenerateLink endpoint called');
    try {
      const uid = req.user!.uid;
      console.log(`   User UID: ${uid}`);

      const newLink = await LinkService.regenerateLink(uid);
      
      // ✅ Read fresh user document to get full link
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();

      // ✅ Add null check
      if (!userData || !userData.publicLink) {
        // Fallback: construct link from publicId
        const fullLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/u/${newLink.publicId}`;
        res.status(200).json({
          success: true,
          data: {
            publicId: newLink.publicId,
            publicLink: fullLink,
          },
          message: 'Link regenerated successfully',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          publicId: newLink.publicId,
          publicLink: userData.publicLink, // ✅ Return full link
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