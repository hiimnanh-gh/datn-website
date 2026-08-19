import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// ── Auth feature ──────────────────────────────────────────
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';

// ── Core Operational Features ─────────────────────────────
import EmergencyIntakeDispatch from './features/dispatcher/EmergencyIntakeDispatch/EmergencyIntakeDispatch';
import DispatchResources from './features/dispatcher/DispatchResources/DispatchResources';
import DispatchMap from './features/dispatcher/DispatchMap/DispatchMap';

// ── Admin feature pages ───────────────────────────────────
import AdminLayout from './features/admin/AdminLayout';
import OperationsOverview from './features/admin/pages/OperationsOverview/OperationsOverview';
import DispatchHistory from './features/admin/pages/DispatchHistory/DispatchHistory';
import UserManagement from './features/admin/pages/UserManagement/UserManagement';
import ProviderManagement from './features/admin/pages/ProviderManagement/ProviderManagement';
import HospitalManagement from './features/admin/pages/HospitalManagement/HospitalManagement';
import OperationZoneManagement from './features/admin/pages/OperationZoneManagement/OperationZoneManagement';
import ServiceTypeManagement from './features/admin/pages/ServiceTypeManagement/ServiceTypeManagement';
import FileStorageManagement from './features/admin/pages/FileStorageManagement/FileStorageManagement';
import Profile from './features/admin/pages/Profile/Profile';

// ── Dispatcher Layout ────────────────────────────────────
import DispatcherLayout from './features/dispatcher/DispatcherLayout';

// ── Provider Portal ───────────────────────────────────────
import ProviderLayout from './features/provider/ProviderLayout';
import ProviderDashboard from './features/provider/pages/admin/ProviderDashboard';
import FleetManagement from './features/provider/pages/admin/FleetManagement';

// ── Root redirect based on auth state + role ─────────────
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRole = user?.role?.toUpperCase() || '';
  if (userRole.includes('PROVIDER')) return <Navigate to="/provider/fleet" replace />;
  if (userRole === 'ADMIN') return <Navigate to="/admin/dispatch-requests" replace />;
  if (userRole === 'DISPATCHER') return <Navigate to="/dispatcher/dispatch-requests" replace />;

  return <Navigate to="/login" replace />;
};

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dispatch-requests" replace />} />
          
          {/* Main Dispatch Flow */}
          <Route path="dispatch-requests" element={<EmergencyIntakeDispatch />} />
          <Route path="dispatch" element={<Navigate to="/admin/dispatch-requests" replace />} />

          {/* Resources & Map */}
          <Route path="dispatch-resources" element={<DispatchResources />} />
          <Route path="tracking" element={<Navigate to="/admin/dispatch-resources" replace />} />
          <Route path="dispatch-map" element={<DispatchMap />} />

          {/* History & Stats */}
          <Route path="incidents" element={<DispatchHistory />} />
          <Route path="dashboard" element={<OperationsOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="providers" element={<ProviderManagement />} />
          <Route path="hospitals" element={<HospitalManagement />} />
          <Route path="operation-zones" element={<OperationZoneManagement />} />
          <Route path="service-types" element={<ServiceTypeManagement />} />
          <Route path="files" element={<FileStorageManagement />} />
          <Route path="profile" element={<Profile />} />

          {/* Legacy route fallbacks */}
          <Route path="*" element={<Navigate to="dispatch-requests" replace />} />
        </Route>

        {/* Dispatcher Portal Routes */}
        <Route path="/dispatcher" element={<DispatcherLayout />}>
          <Route index element={<Navigate to="dispatch-requests" replace />} />
          
          {/* Unified Dispatcher Routes */}
          <Route path="dispatch-requests" element={<EmergencyIntakeDispatch />} />
          <Route path="hub" element={<Navigate to="/dispatcher/dispatch-requests" replace />} />
          <Route path="dispatch-resources" element={<DispatchResources />} />
          <Route path="dispatch-map" element={<DispatchMap />} />
          <Route path="radar" element={<Navigate to="/dispatcher/dispatch-map" replace />} />
          <Route path="profile" element={<Profile />} />

          <Route path="*" element={<Navigate to="dispatch-requests" replace />} />
        </Route>

        {/* Provider Portal Routes */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route index element={<Navigate to="fleet" replace />} />
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="fleet" element={<FleetManagement />} />
          <Route path="profile" element={<Profile />} />
          <Route path="drivers" element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="commission" element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="*" element={<Navigate to="fleet" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
