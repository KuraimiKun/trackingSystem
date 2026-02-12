import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const ROUTES_COLLECTION = 'routes';

// Create a new route
export const createRoute = async (routeData, userId) => {
  try {
    const route = {
      name: routeData.name,
      description: routeData.description || '',
      waypoints: routeData.waypoints || [],
      estimatedDays: routeData.estimatedDays || 0,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId
    };
    
    const docRef = await addDoc(collection(db, ROUTES_COLLECTION), route);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating route:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء المسار' };
  }
};

// Get all routes
export const getAllRoutes = async () => {
  try {
    const q = query(
      collection(db, ROUTES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const routes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, routes };
  } catch (error) {
    console.error('Error fetching routes:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب المسارات' };
  }
};

// Get active routes only
export const getActiveRoutes = async () => {
  try {
    const q = query(
      collection(db, ROUTES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const routes = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(route => route.active);
    
    return { success: true, routes };
  } catch (error) {
    console.error('Error fetching routes:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب المسارات' };
  }
};

// Get route by ID
export const getRouteById = async (routeId) => {
  try {
    const docRef = doc(db, ROUTES_COLLECTION, routeId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'المسار غير موجود' };
    }
    
    return { 
      success: true, 
      route: { id: docSnap.id, ...docSnap.data() } 
    };
  } catch (error) {
    console.error('Error fetching route:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب المسار' };
  }
};

// Update route
export const updateRoute = async (routeId, updates) => {
  try {
    const docRef = doc(db, ROUTES_COLLECTION, routeId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating route:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث المسار' };
  }
};

// Delete route
export const deleteRoute = async (routeId) => {
  try {
    await deleteDoc(doc(db, ROUTES_COLLECTION, routeId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting route:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف المسار' };
  }
};

// Toggle route active status
export const toggleRouteStatus = async (routeId, active) => {
  try {
    await updateDoc(doc(db, ROUTES_COLLECTION, routeId), {
      active,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling route status:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث حالة المسار' };
  }
};
