import { db } from '../config/firebase';
import { User } from '../types';
import { generatePublicId } from '../utils/generatePublicId';

const USERS_COLLECTION = 'users';
const PUBLIC_LINKS_COLLECTION = 'publicLinks';

export class UserService {
  /**
   * Get or create user with public link
   * ✅ FIXED: Handles both backend-first and frontend-first user creation
   */
  static async getOrCreateUser(uid: string, email?: string): Promise<User> {
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data() as User;
      
      // ✅ Check if publicLinks document exists
      if (userData.publicId) {
        const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(userData.publicId).get();
        
        if (!linkDoc.exists) {
          // ✅ Frontend created user doc but backend never created publicLinks doc
          console.warn(`⚠️ User ${uid} has publicId but missing publicLinks doc, creating...`);
          
          await db.collection(PUBLIC_LINKS_COLLECTION).doc(userData.publicId).set({
            publicId: userData.publicId,
            ownerUid: uid,
            isActive: true,
            createdAt: new Date(),
          });
          
          console.log(`✅ Created missing publicLinks doc for user ${uid}: ${userData.publicId}`);
        }
        
        return { ...userData, uid } as User;
      } else {
        // ✅ Old user without publicId - create one
        console.warn(`⚠️ User ${uid} missing publicId, creating...`);
        const newPublicId = await this.createPublicLinkForUser(uid);
        
        await userRef.update({ 
          publicId: newPublicId,
          updatedAt: new Date()
        });
        
        userData.publicId = newPublicId;
        return { ...userData, uid } as User;
      }
    }

    // ✅ FIRST-TIME USER (backend-first creation)
    console.log(`🆕 Creating first-time user ${uid} with atomic batch write...`);
    
    const publicId = generatePublicId();
    const batch = db.batch();
    
    const newUser: User = {
      uid,
      email,
      publicId,
      createdAt: new Date(),
    };

    // Create user document
    batch.set(userRef, newUser);

    // Create public link document atomically
    const linkRef = db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId);
    batch.set(linkRef, {
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    });

    // ✅ Commit both writes atomically
    try {
      await batch.commit();
      console.log(`✅ Successfully created first-time user ${uid} with publicId: ${publicId}`);
    } catch (error) {
      console.error(`❌ Failed to create user ${uid}:`, error);
      throw new Error('Failed to create user account');
    }

    return newUser;
  }

  /**
   * Create a new public link for a user
   */
  private static async createPublicLinkForUser(uid: string): Promise<string> {
    const publicId = generatePublicId();

    try {
      await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).set({
        publicId,
        ownerUid: uid,
        isActive: true,
        createdAt: new Date(),
      });

      console.log(`✅ Created public link for user ${uid}: ${publicId}`);
      return publicId;
    } catch (error) {
      console.error(`❌ Failed to create public link for user ${uid}:`, error);
      throw new Error('Failed to create public link');
    }
  }

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

  static async getUserByPublicId(publicId: string): Promise<User | null> {
    try {
      const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).get();
      
      if (!linkDoc.exists) {
        console.log(`❌ Public link not found: ${publicId}`);
        return null;
      }

      const linkData = linkDoc.data();
      
      if (!linkData?.isActive) {
        console.log(`❌ Public link is inactive: ${publicId}`);
        return null;
      }

      if (!linkData.ownerUid) {
        console.error('Invalid link data: missing ownerUid');
        return null;
      }

      const user = await this.getUserByUid(linkData.ownerUid);
      
      if (!user) {
        console.error(`❌ User not found for ownerUid: ${linkData.ownerUid}`);
        return null;
      }
      
      console.log(`✅ Found user for publicId ${publicId}: ${user.uid}`);
      return user;
    } catch (error) {
      console.error('Error fetching user by public ID:', error);
      return null;
    }
  }
}