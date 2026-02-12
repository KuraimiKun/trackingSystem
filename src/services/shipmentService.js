import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../config/firebase';

const SHIPMENTS_COLLECTION = 'shipments';

// Generate unique tracking number
export const generateTrackingNumber = () => {
  const prefix = 'SHP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Create a new shipment
export const createShipment = async (shipmentData, userId) => {
  try {
    const trackingNumber = generateTrackingNumber();
    const shipment = {
      ...shipmentData,
      trackingNumber,
      status: 'received',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      statusHistory: [{
        status: 'received',
        timestamp: new Date().toISOString(),
        note: 'تم إنشاء الشحنة',
        updatedBy: userId
      }]
    };
    
    const docRef = await addDoc(collection(db, SHIPMENTS_COLLECTION), shipment);
    return { success: true, id: docRef.id, trackingNumber };
  } catch (error) {
    console.error('Error creating shipment:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء الشحنة' };
  }
};

// Get shipment by tracking number (for customers)
export const getShipmentByTracking = async (trackingNumber) => {
  try {
    const q = query(
      collection(db, SHIPMENTS_COLLECTION),
      where('trackingNumber', '==', trackingNumber.toUpperCase().trim())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'لم يتم العثور على الشحنة' };
    }
    
    const doc = querySnapshot.docs[0];
    return { 
      success: true, 
      shipment: { id: doc.id, ...doc.data() } 
    };
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return { success: false, error: 'حدث خطأ أثناء البحث' };
  }
};

// Get shipment by reference number
export const getShipmentByReference = async (referenceNumber) => {
  try {
    const q = query(
      collection(db, SHIPMENTS_COLLECTION),
      where('referenceNumber', '==', referenceNumber.trim())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'لم يتم العثور على الشحنة' };
    }
    
    const doc = querySnapshot.docs[0];
    return { 
      success: true, 
      shipment: { id: doc.id, ...doc.data() } 
    };
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return { success: false, error: 'حدث خطأ أثناء البحث' };
  }
};

// Get all shipments (for admin/staff)
export const getAllShipments = async () => {
  try {
    const q = query(
      collection(db, SHIPMENTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const shipments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, shipments };
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب الشحنات' };
  }
};

// Get shipment by ID
export const getShipmentById = async (shipmentId) => {
  try {
    const docRef = doc(db, SHIPMENTS_COLLECTION, shipmentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, error: 'لم يتم العثور على الشحنة' };
    }
    
    return { 
      success: true, 
      shipment: { id: docSnap.id, ...docSnap.data() } 
    };
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب الشحنة' };
  }
};

// Update shipment status
export const updateShipmentStatus = async (shipmentId, newStatus, note, userId) => {
  try {
    const docRef = doc(db, SHIPMENTS_COLLECTION, shipmentId);
    
    const statusUpdate = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || '',
      updatedBy: userId
    };
    
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      statusHistory: arrayUnion(statusUpdate)
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث حالة الشحنة' };
  }
};

// Update shipment details
export const updateShipment = async (shipmentId, updates) => {
  try {
    const docRef = doc(db, SHIPMENTS_COLLECTION, shipmentId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating shipment:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث الشحنة' };
  }
};

// Delete shipment (admin only)
export const deleteShipment = async (shipmentId) => {
  try {
    await deleteDoc(doc(db, SHIPMENTS_COLLECTION, shipmentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف الشحنة' };
  }
};

// Add transit point to shipment
export const addTransitPoint = async (shipmentId, transitPoint, userId) => {
  try {
    const docRef = doc(db, SHIPMENTS_COLLECTION, shipmentId);
    
    const point = {
      ...transitPoint,
      timestamp: new Date().toISOString(),
      addedBy: userId
    };
    
    await updateDoc(docRef, {
      transitPoints: arrayUnion(point),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding transit point:', error);
    return { success: false, error: 'حدث خطأ أثناء إضافة نقطة العبور' };
  }
};

// Search shipments
export const searchShipments = async (searchTerm) => {
  try {
    // Search by tracking number
    let result = await getShipmentByTracking(searchTerm);
    if (result.success) {
      return { success: true, shipments: [result.shipment] };
    }
    
    // Search by reference number
    result = await getShipmentByReference(searchTerm);
    if (result.success) {
      return { success: true, shipments: [result.shipment] };
    }
    
    return { success: false, error: 'لم يتم العثور على نتائج' };
  } catch (error) {
    console.error('Error searching shipments:', error);
    return { success: false, error: 'حدث خطأ أثناء البحث' };
  }
};

// Update shipment current waypoint index
export const updateShipmentWaypoint = async (shipmentId, newWaypointIndex, userId) => {
  try {
    const docRef = doc(db, SHIPMENTS_COLLECTION, shipmentId);
    
    await updateDoc(docRef, {
      currentWaypointIndex: newWaypointIndex,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating shipment waypoint:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث موقع الشحنة' };
  }
};
