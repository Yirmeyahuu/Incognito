import { db } from '../config/firebase';
import { PublicLink } from '../types';
import { generatePublicId } from '../utils/generatePublicId';

const PUBLIC_LINKS_COLLECTION = 'publicLinks';
const USERS_COLLECTION = 'users';

export class LinkService {
  /**
   * Get user's active public link
   */
  static async getUserLink(uid: string): Promise<PublicLink | null> {
    console.log(`🔍 getUserLink called for uid: ${uid}`);
    
    const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
    
    if (!userDoc.exists) {
      console.log(`❌ User document not found for uid: ${uid}`);
      return null;
    }
    
    const userData = userDoc.data();
    const publicId = userData?.publicId;
    
    if (!publicId) {
      console.log(`❌ No publicId in user document for uid: ${uid}`);
      return null;
    }
    
    console.log(`✅ Found publicId in user doc: ${publicId}`);
    
    return {
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: userData.createdAt || new Date(),
    };
  }

  /**
   * Regenerate user's public link
   */
  static async regenerateLink(uid: string): Promise<PublicLink> {
    console.log(`\n🔄 Starting regenerateLink for uid: ${uid}`);
    
    const batch = db.batch();
    
    // Deactivate ALL old links
    const oldLinkSnapshot = await db
      .collection(PUBLIC_LINKS_COLLECTION)
      .where('ownerUid', '==', uid)
      .get();

    console.log(`📋 Found ${oldLinkSnapshot.size} existing link(s) to deactivate`);
    
    oldLinkSnapshot.docs.forEach(doc => {
      console.log(`   - Deactivating: ${doc.id}`);
      batch.update(doc.ref, { isActive: false });
    });

    // Create new link
    const newPublicId = generatePublicId();
    
    console.log(`📝 Generated new publicId: ${newPublicId}`);
    
    const newLink: PublicLink = {
      publicId: newPublicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    };

    const newLinkRef = db.collection(PUBLIC_LINKS_COLLECTION).doc(newPublicId);
    batch.set(newLinkRef, newLink);
    console.log(`✨ Creating new publicLinks doc: ${newPublicId}`);

    // Update user document with new publicId ONLY
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();
    
    console.log(`📄 User doc exists: ${userDoc.exists}`);
    
    if (userDoc.exists) {
      batch.update(userRef, { 
        publicId: newPublicId,
        updatedAt: new Date()
      });
      console.log(`📝 Updating user document with publicId: ${newPublicId}`);
    } else {
      batch.set(userRef, {
        uid,
        publicId: newPublicId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`📝 Creating new user document with publicId: ${newPublicId}`);
    }

    // Commit atomically
    console.log(`💾 Committing batch write...`);
    
    try {
      await batch.commit();
      console.log(`✅ Batch committed successfully! New publicId: ${newPublicId}\n`);
    } catch (error) {
      console.error(`❌ Batch commit FAILED:`, error);
      throw error;
    }
    
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