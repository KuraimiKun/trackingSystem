import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData
            });
            setUserRole(userData.role);
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email
            });
            setUserRole('staff');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      let message = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.code === 'auth/user-not-found') {
        message = 'البريد الإلكتروني غير مسجل';
      } else if (error.code === 'auth/wrong-password') {
        message = 'كلمة المرور غير صحيحة';
      } else if (error.code === 'auth/invalid-email') {
        message = 'البريد الإلكتروني غير صالح';
      }
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'حدث خطأ أثناء تسجيل الخروج' };
    }
  };

  const isAdmin = () => userRole === 'admin';
  const isStaff = () => userRole === 'staff' || userRole === 'admin';

  const value = {
    user,
    userRole,
    loading,
    login,
    logout,
    isAdmin,
    isStaff
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
