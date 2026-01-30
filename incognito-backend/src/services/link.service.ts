import { db } from '../config/firebase';
import { PublicLink } from '../types';
import { generatePublicId } from '../utils/generatePublicId';

const PUBLIC_LINKS_COLLECTION = 'publicLinks';
const USERS_COLLECTION = 'users';

export class LinkService {
  /**
   * Get user's active public link
   * ✅ ENHANCED: Better error handling and logging
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
    
    // ✅ VERIFY: Check if public link document actually exists
    const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).get();
    
    if (!linkDoc.exists) {
      console.error(`❌ Public link document missing for publicId: ${publicId}`);
      console.error(`   This indicates a data inconsistency for user: ${uid}`);
      return null;
    }
    
    const linkData = linkDoc.data();
    
    if (!linkData?.isActive) {
      console.log(`❌ Public link is inactive: ${publicId}`);
      return null;
    }
    
    console.log(`✅ Found valid public link: ${publicId}`);
    
    return {
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: linkData.createdAt || userData.createdAt || new Date(),
    };
  }

  /**
   * Regenerate user's public link
   * ✅ OPTIMIZED: Deletes old links instead of deactivating
   */
  static async regenerateLink(uid: string): Promise<PublicLink> {
    console.log(`\n🔄 Starting regenerateLink for uid: ${uid}`);
    
    const batch = db.batch();
    
    // ✅ DELETE ALL old links instead of deactivating
    const oldLinkSnapshot = await db
      .collection(PUBLIC_LINKS_COLLECTION)
      .where('ownerUid', '==', uid)
      .get();

    console.log(`🗑️ Found ${oldLinkSnapshot.size} existing link(s) to DELETE`);
    
    oldLinkSnapshot.docs.forEach(doc => {
      console.log(`   - Deleting: ${doc.id}`);
      batch.delete(doc.ref);
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
   * ✅ ENHANCED: Better logging
   */
  static async validateLink(publicId: string): Promise<boolean> {
    try {
      const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).get();
      
      if (!linkDoc.exists) {
        console.log(`❌ Link validation failed: Document not found for ${publicId}`);
        return false;
      }

      const linkData = linkDoc.data() as PublicLink;
      const isValid = linkData.isActive === true;
      
      console.log(`${isValid ? '✅' : '❌'} Link validation for ${publicId}: ${isValid ? 'VALID' : 'INACTIVE'}`);
      
      return isValid;
    } catch (error) {
      console.error(`❌ Link validation error for ${publicId}:`, error);
      return false;
    }
  }
}