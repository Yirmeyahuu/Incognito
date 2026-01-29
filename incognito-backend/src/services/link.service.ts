import { db } from '../config/firebase';
import { PublicLink } from '../types';
import { generatePublicId } from '../utils/generatePublicId';

const PUBLIC_LINKS_COLLECTION = 'publicLinks';

export class LinkService {
  /**
   * Get user's public link
   */
  static async getUserLink(uid: string): Promise<PublicLink | null> {
    const snapshot = await db
      .collection(PUBLIC_LINKS_COLLECTION)
      .where('ownerUid', '==', uid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as PublicLink;
  }

  /**
   * Regenerate user's public link (creates new one, deactivates old)
   */
  static async regenerateLink(uid: string): Promise<PublicLink> {
    // Deactivate old link
    const oldLinkSnapshot = await db
      .collection(PUBLIC_LINKS_COLLECTION)
      .where('ownerUid', '==', uid)
      .get();

    const batch = db.batch();
    oldLinkSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });

    // Create new link
    const newPublicId = generatePublicId();
    const newLink: PublicLink = {
      publicId: newPublicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    };

    const newLinkRef = db.collection(PUBLIC_LINKS_COLLECTION).doc(newPublicId);
    batch.set(newLinkRef, newLink);

    await batch.commit();
    return newLink;
  }

  /**
   * Validate if public link exists and is active
   */
  static async validateLink(publicId: string): Promise<boolean> {
    const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).get();
    
    if (!linkDoc.exists) {
      return false;
    }

    const linkData = linkDoc.data() as PublicLink;
    return linkData.isActive === true;
  }
}