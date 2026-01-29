import { db } from '../config/firebase';
import { User } from '../types';
import { generatePublicId } from '../utils/generatePublicId';

const USERS_COLLECTION = 'users';
const PUBLIC_LINKS_COLLECTION = 'publicLinks';

export class UserService {
  /**
   * Get or create user with public link
   */
  static async getOrCreateUser(uid: string): Promise<User> {
    const userRef = db.collection(USERS_COLLECTION).doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return { uid, ...userDoc.data() } as User; // ADD uid explicitly
    }

    // Create new user with unique public ID
    const publicId = generatePublicId();
    const newUser: User = {
      uid,
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
    const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    // Make sure to include the uid from the document ID
    return { 
      uid: userDoc.id, 
      ...userDoc.data() 
    } as User;
  }

  /**
   * Get user by public ID
   */
  static async getUserByPublicId(publicId: string): Promise<User | null> {
    try {
      console.log('Looking up public ID:', publicId); // DEBUG
      
      // Get the public link document
      const linkDoc = await db.collection(PUBLIC_LINKS_COLLECTION).doc(publicId).get();
      
      if (!linkDoc.exists) {
        console.log('Public link not found:', publicId); // DEBUG
        return null;
      }

      const linkData = linkDoc.data();
      console.log('Link data:', linkData); // DEBUG
      
      if (!linkData?.isActive) {
        console.log('Link is not active'); // DEBUG
        return null;
      }

      if (!linkData.ownerUid) {
        console.error('Link data missing ownerUid:', linkData); // DEBUG
        return null;
      }

      // Get the user by UID
      const user = await this.getUserByUid(linkData.ownerUid);
      console.log('Found user:', user); // DEBUG
      
      return user;
    } catch (error) {
      console.error('Error in getUserByPublicId:', error);
      return null;
    }
  }
}