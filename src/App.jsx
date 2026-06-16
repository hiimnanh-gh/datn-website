import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';
import useHospitalAuthStore from './store/useHospitalAuthStore';
import useProviderAuthStore from './store/useProviderAuthStore';

// ── Auth feature ──────────────────────────────────────────
import Login from './features/auth/Login';

// ── Admin feature ─────────────────────────────────────────
import AdminLayout      from './features/admin/AdminLayout';
import Dashboard        from './features/admin/pages/Dashboard/Dashboard';
import LiveDispatch     from './features/admin/pages/LiveDispatch/LiveDispatch';
import UnitTracking     from './features/admin/pages/UnitTracking/UnitTracking';
import IncidentLogs     from './features/admin/pages/IncidentLogs/IncidentLogs';
import Personnel        from './features/admin/pages/Personnel/Personnel';
import Analytics        from './features/admin/pages/Analytics/Analytics';
import Settings         from './features/admin/pages/Settings/Settings';
import Support          from './features/admin/pages/Support/Support';

// ── Dispatcher feature ────────────────────────────────────
import DispatcherLayout from './features/dispatcher/DispatcherLayout';
import DispatchHub      from './features/dispatcher/DispatchHub/DispatchHub';
import LiveRadar        from './features/dispatcher/LiveRadar/LiveRadar';

// ── Hospital Portal ───────────────────────────────────────
import HospitalLayout   from './features/hospital/HospitalLayout';
import AdminDashboard   from './features/hospital/pages/admin/AdminDashboard';
import HospitalProfile  from './features/hospital/pages/admin/HospitalProfile';
import StaffManagement  from './features/hospital/pages/admin/StaffManagement';
import HospitalLiveRadar from './features/hospital/pages/staff/LiveRadar';
import BedController    from './features/hospital/pages/staff/BedController';
import HandoverLogs     from './features/hospital/pages/staff/HandoverLogs';

// ── Provider Portal ───────────────────────────────────────
import ProviderLayout     from './features/provider/ProviderLayout';
import ProviderDashboard  from './features/provider/pages/admin/ProviderDashboard';
import FleetManagement    from './features/provider/pages/admin/FleetManagement';
import Marketing          from './features/provider/pages/admin/Marketing';
import MissionControl     from './features/provider/pages/staff/MissionControl';

// ── Root redirect based on auth state + role ─────────────
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'DISPATCHER') return <Navigate to="/dispatcher/hub" replace />;

  return <Navigate to="/login" replace />;
};

const HospitalRoleRedirect = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useHospitalAuthStore();
  
  if (!isAuthenticated) {
    return <Outlet />;
  }

  if (allowedRoles.includes(user?.role)) {
    return <Outlet />;
  }

  if (user?.role === 'HOSPITAL_ADMIN') return <Navigate to="/hospital/admin/dashboard" replace />;
  if (user?.role === 'HOSPITAL_STAFF') return <Navigate to="/hospital/staff/radar" replace />;
  
  return <Navigate to="/hospital" replace />;
};

const ProviderRoleRedirect = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useProviderAuthStore();
  
  if (!isAuthenticated) {
    return <Outlet />;
  }

  if (allowedRoles.includes(user?.role)) {
    return <Outlet />;
  }

  if (user?.role === 'PROVIDER_ADMIN') return <Navigate to="/provider/admin/dashboard" replace />;
  if (user?.role === 'PROVIDER_STAFF') return <Navigate to="/provider/staff/mission-control" replace />;
  
  return <Navigate to="/provider" replace />;
};

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index                  element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="dispatch"        element={<LiveDispatch />} />
          <Route path="tracking"        element={<UnitTracking />} />
          <Route path="incidents"       element={<IncidentLogs />} />
          <Route path="personnel"       element={<Personnel />} />
          <Route path="analytics"       element={<Analytics />} />
          <Route path="settings"        element={<Settings />} />
          <Route path="support"         element={<Support />} />
        </Route>

        <Route path="/dispatcher" element={<DispatcherLayout />}>
          <Route index          element={<Navigate to="hub" replace />} />
          <Route path="hub"     element={<DispatchHub />} />
          <Route path="radar"   element={<LiveRadar />} />
        </Route>

        {/* Hospital Portal Routes */}
        <Route path="/hospital" element={<HospitalLayout />}>
          <Route index element={
            <HospitalRoleRedirect allowedRoles={['HOSPITAL_ADMIN', 'HOSPITAL_STAFF']} />
          } />

          {/* Hospital Admin Routes */}
          <Route element={<HospitalRoleRedirect allowedRoles={['HOSPITAL_ADMIN']} />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/profile" element={<HospitalProfile />} />
            <Route path="admin/staff" element={<StaffManagement />} />
          </Route>

          {/* Hospital Staff Routes */}
          <Route element={<HospitalRoleRedirect allowedRoles={['HOSPITAL_STAFF']} />}>
            <Route path="staff/radar" element={<HospitalLiveRadar />} />
            <Route path="staff/beds" element={<BedController />} />
            <Route path="staff/logs" element={<HandoverLogs />} />
          </Route>
        </Route>

        {/* Provider Portal Routes */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route index element={
            <ProviderRoleRedirect allowedRoles={['PROVIDER_ADMIN', 'PROVIDER_STAFF']} />
          } />

          {/* Provider Admin Routes */}
          <Route element={<ProviderRoleRedirect allowedRoles={['PROVIDER_ADMIN']} />}>
            <Route path="admin/dashboard" element={<ProviderDashboard />} />
            <Route path="admin/fleet" element={<FleetManagement />} />
            <Route path="admin/marketing" element={<Marketing />} />
          </Route>

          {/* Provider Staff Routes */}
          <Route element={<ProviderRoleRedirect allowedRoles={['PROVIDER_STAFF']} />}>
            <Route path="staff/mission-control" element={<MissionControl />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
