import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updatePassword,
  deleteUser as deleteAuthUser
} from 'firebase/auth';
import { db, auth } from '../config/firebase';

const USERS_COLLECTION = 'users';

// Create a new user (admin only)
export const createUser = async (userData) => {
  try {
    // Create auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const uid = userCredential.user.uid;
    
    // Create user document in Firestore
    await setDoc(doc(db, USERS_COLLECTION, uid), {
      email: userData.email,
      name: userData.name,
      role: userData.role || 'staff',
      phone: userData.phone || '',
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, uid };
  } catch (error) {
    console.error('Error creating user:', error);
    let message = 'حدث خطأ أثناء إنشاء المستخدم';
    if (error.code === 'auth/email-already-in-use') {
      message = 'البريد الإلكتروني مستخدم بالفعل';
    } else if (error.code === 'auth/weak-password') {
      message = 'كلمة المرور ضعيفة جداً';
    }
    return { success: false, error: message };
  }
};

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب المستخدمين' };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (!docSnap.exists()) {
      return { success: false, error: 'المستخدم غير موجود' };
    }
    
    return { 
      success: true, 
      user: { id: docSnap.id, ...docSnap.data() } 
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب بيانات المستخدم' };
  }
};

// Update user
export const updateUser = async (userId, updates) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث المستخدم' };
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    
    // Note: Deleting from Auth requires admin SDK or the user to be signed in
    // This is a limitation of client-side Firebase
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف المستخدم' };
  }
};

// Toggle user active status
export const toggleUserStatus = async (userId, active) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      active,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling user status:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث حالة المستخدم' };
  }
};

// Get staff users only
export const getStaffUsers = async () => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role', '==', 'staff')
    );
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, users };
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب الموظفين' };
  }
};
