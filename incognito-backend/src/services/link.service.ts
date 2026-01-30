import { db } from '../config/firebase';
import { PublicLink } from '../types';
import { generatePublicId } from '../utils/generatePublicId';
import { env } from '../config/env';

const PUBLIC_LINKS_COLLECTION = 'publicLinks';
const USERS_COLLECTION = 'users';

export class LinkService {
  /**
   * ✅ SIMPLIFIED: Read directly from user document (single query)
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
    
    // ✅ Return link data (we trust user document)
    return {
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: userData.linkUpdatedAt || userData.createdAt || new Date(),
    };
  }

  /**
   * ✅ ATOMIC: Regenerate updates user doc + publicLinks collection in ONE batch
   */
  static async regenerateLink(uid: string): Promise<PublicLink> {
    console.log(`\n🔄 Starting regenerateLink for uid: ${uid}`);
    
    const batch = db.batch();
    
    // ✅ STEP 1: Deactivate ALL old links
    const oldLinkSnapshot = await db
      .collection(PUBLIC_LINKS_COLLECTION)
      .where('ownerUid', '==', uid)
      .get();

    console.log(`📋 Found ${oldLinkSnapshot.size} existing link(s) to deactivate`);
    
    oldLinkSnapshot.docs.forEach(doc => {
      console.log(`   - Deactivating: ${doc.id}`);
      batch.update(doc.ref, { isActive: false });
    });

    // ✅ STEP 2: Create new link
    const newPublicId = generatePublicId();
    const fullLink = `${env.frontendUrl}/u/${newPublicId}`;
    
    console.log(`📝 Generated new link: ${fullLink}`); // ✅ ADD THIS
    
    const newLink: PublicLink = {
      publicId: newPublicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    };

    const newLinkRef = db.collection(PUBLIC_LINKS_COLLECTION).doc(newPublicId);
    batch.set(newLinkRef, newLink);
    console.log(`✨ Creating new publicLinks doc: ${newPublicId}`);

    // ✅ STEP 3: Update user document (CRITICAL!)
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();
    
    console.log(`📄 User doc exists: ${userDoc.exists}`); // ✅ ADD THIS
    
    if (userDoc.exists) {
      const updateData = { 
        publicId: newPublicId,
        publicLink: fullLink, // ✅ Store full link
        linkUpdatedAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log(`📝 Updating user document with:`, updateData); // ✅ ADD THIS
      batch.update(userRef, updateData);
    } else {
      const newUserData = {
        uid,
        publicId: newPublicId,
        publicLink: fullLink,
        linkUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log(`📝 Creating new user document with:`, newUserData); // ✅ ADD THIS
      batch.set(userRef, newUserData);
    }

    // ✅ STEP 4: Commit atomically
    console.log(`💾 Committing batch write...`);
    
    try {
      await batch.commit();
      console.log(`✅ Batch committed successfully! New link: ${newPublicId}`);
      console.log(`✅ User document should now have publicLink: ${fullLink}\n`);
    } catch (error) {
      console.error(`❌ Batch commit FAILED:`, error); // ✅ ADD THIS
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