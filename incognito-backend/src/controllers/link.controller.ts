import { Response } from 'express';
import { AuthRequest } from '../types';
import { UserService } from '../services/user.service';
import { LinkService } from '../services/link.service';

export class LinkController {
  /**
   * GET /api/links/my-link
   * Get authenticated user's public link
   */
  static async getMyLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;

      // Get or create user (creates link automatically)
      const user = await UserService.getOrCreateUser(uid);

      res.status(200).json({
        success: true,
        data: {
          publicId: user.publicId,
          link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/send/${user.publicId}`,
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
   * POST /api/links/regenerate
   * Regenerate user's public link
   */
  static async regenerateLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uid = req.user!.uid;

      const newLink = await LinkService.regenerateLink(uid);

      res.status(200).json({
        success: true,
        data: {
          publicId: newLink.publicId,
          link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/send/${newLink.publicId}`,
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
   * Validate if a public link is valid (no auth required)
   */
  static async validateLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { publicId } = req.params;

      const isValid = await LinkService.validateLink(publicId);

      res.status(200).json({
        success: true,
        data: {
          isValid,
        },
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