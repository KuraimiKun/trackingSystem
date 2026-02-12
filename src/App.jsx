import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import TrackingPage from './pages/customer/TrackingPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import ShipmentsListPage from './pages/admin/ShipmentsListPage';
import NewShipmentPage from './pages/admin/NewShipmentPage';
import ShipmentDetailPage from './pages/admin/ShipmentDetailPage';
import EditShipmentPage from './pages/admin/EditShipmentPage';
import UsersPage from './pages/admin/UsersPage';
import RoutesPage from './pages/admin/RoutesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<TrackingPage />} />
          
          {/* Admin Login */}
          <Route 
            path="/admin/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Shipments */}
            <Route path="shipments" element={<ShipmentsListPage />} />
            <Route path="shipments/new" element={<NewShipmentPage />} />
            <Route path="shipments/:id" element={<ShipmentDetailPage />} />
            <Route path="shipments/:id/edit" element={<EditShipmentPage />} />
            
            {/* Routes Management */}
            <Route path="routes" element={<RoutesPage />} />
            
            {/* Users - Admin Only */}
            <Route 
              path="users" 
              element={
                <AdminRoute>
                  <UsersPage />
                </AdminRoute>
              } 
            />
          </Route>

          {/* 404 - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
