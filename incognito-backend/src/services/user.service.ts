import { db } from '../config/firebase';
import { User } from '../types';
import { generatePublicId } from '../utils/generatePublicId';
import { env } from '../config/env';

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
      return { uid, ...userDoc.data() } as User;
    }

    // Create new user with unique public ID
    const publicId = generatePublicId();
    const newUser: User = {
      uid,
      email,
      publicId,
      createdAt: new Date(),
    };

    // Create user document
    await userRef.set(newUser);

    // Create public link document
    await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).set({
      publicId,
      ownerUid: uid,
      isActive: true,
      createdAt: new Date(),
    });

    return newUser;
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
      
      return { 
        uid: userDoc.id, 
        ...userDoc.data() 
      } as User;
    } catch (error) {
      if (env.nodeEnv === 'development') {
        console.error('Error fetching user by UID:', error);
      }
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
        if (env.nodeEnv === 'development') {
          console.error('Invalid link data: missing ownerUid');
        }
        return null;
      }

      const user = await this.getUserByUid(linkData.ownerUid);
      return user;
    } catch (error) {
      if (env.nodeEnv === 'development') {
        console.error('Error fetching user by public ID:', error);
      }
      return null;
    }
  }
}