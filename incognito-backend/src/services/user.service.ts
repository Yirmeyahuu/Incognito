import { db } from '../config/firebase';
import { User } from '../types';
import { generatePublicId } from '../utils/generatePublicId';

const USERS_COLLECTION = 'users';
const PUBLIC_LINKS_COLLECTION = 'publicLinks';

export class UserService {
  /**
   * Get or create user with public link
   */
  static async getOrCreateUser(uid: string, email?: string): Promise<User> {
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data() as User;
      
      // ✅ Verify active link exists
      const activeLinkSnapshot = await db
        .collection(PUBLIC_LINKS_COLLECTION)
        .where('ownerUid', '==', uid)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      
      if (!activeLinkSnapshot.empty) {
        const activePublicId = activeLinkSnapshot.docs[0].data().publicId;
        
        // ✅ Update user doc if publicId doesn't match
        if (userData.publicId !== activePublicId) {
          console.warn(`⚠️ User ${uid} has mismatched publicId, syncing...`);
          
          await userRef.update({ 
            publicId: activePublicId,
            updatedAt: new Date()
          });
          
          userData.publicId = activePublicId;
        }
      } else {
        // Create new link if none exists
        console.warn(`⚠️ No active link found for user ${uid}, creating new one...`);
        const newPublicId = await this.createPublicLinkForUser(uid);
        
        await userRef.update({ 
          publicId: newPublicId,
          updatedAt: new Date()
        });
        
        userData.publicId = newPublicId;
      }
      
      return { ...userData, uid } as User;
    }

    // ✅ Create new user with publicId only
    const publicId = generatePublicId();
    
    const newUser: User = {
      uid,
      email,
      publicId,
      createdAt: new Date(),
    };

    await userRef.set(newUser);

    // Create public link document
    await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).set({
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    });

    console.log(`✅ Created new user ${uid} with publicId: ${publicId}`);
    return newUser;
  }

  /**
   * Create a new public link for a user
   */
  private static async createPublicLinkForUser(uid: string): Promise<string> {
    const publicId = generatePublicId();

    await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).set({
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    });

    console.log(`✅ Created public link for user ${uid}: ${publicId}`);
    return publicId;
  }

  /**
   * Get user by UID
   */
  static async getUserByUid(uid: string): Promise<User | null> {
    try {
      const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }
      
      const userData = userDoc.data();
      return { 
        ...userData,
        uid: userDoc.id
      } as User;
    } catch (error) {
      console.error('Error fetching user by UID:', error);
      return null;
    }
  }

  /**
   * Get user by public ID
   */
  static async getUserByPublicId(publicId: string): Promise<User | null> {
    try {
      const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).get();
      
      if (!linkDoc.exists) {
        return null;
      }

      const linkData = linkDoc.data();
      
      if (!linkData?.isActive) {
        return null;
      }

      if (!linkData.ownerUid) {
        console.error('Invalid link data: missing ownerUid');
        return null;
      }

      const user = await this.getUserByUid(linkData.ownerUid);
      return user;
    } catch (error) {
      console.error('Error fetching user by public ID:', error);
      return null;
    }
  }
}