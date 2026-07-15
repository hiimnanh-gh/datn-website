import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

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

// ── Provider Portal ───────────────────────────────────────
import ProviderLayout     from './features/provider/ProviderLayout';
import ProviderDashboard  from './features/provider/pages/admin/ProviderDashboard';
import FleetManagement    from './features/provider/pages/admin/FleetManagement';
import DriverAccounts     from './features/provider/pages/admin/DriverAccounts';
import CommissionSettlement from './features/provider/pages/admin/CommissionSettlement';

// ── Driver Portal ─────────────────────────────────────────
import DriverLayout       from './features/driver/DriverLayout';
import DriverMission      from './features/driver/pages/DriverMission';

// ── Root redirect based on auth state + role ─────────────
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'PROVIDER') return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === 'DISPATCHER') return <Navigate to="/dispatcher/hub" replace />;
  if (user?.role === 'DRIVER') return <Navigate to="/driver/mission" replace />;

  return <Navigate to="/login" replace />;
};

// ── App ───────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        <Route path="/login" element={<Login />} />

        {/* Admin Portal Routes */}
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

        {/* Dispatcher Portal Routes */}
        <Route path="/dispatcher" element={<DispatcherLayout />}>
          <Route index          element={<Navigate to="hub" replace />} />
          <Route path="hub"     element={<DispatchHub />} />
          <Route path="radar"   element={<LiveRadar />} />
        </Route>

        {/* Provider Portal Routes */}
        <Route path="/provider" element={<ProviderLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ProviderDashboard />} />
          <Route path="fleet" element={<FleetManagement />} />
          <Route path="drivers" element={<DriverAccounts />} />
          <Route path="commission" element={<CommissionSettlement />} />
        </Route>

        {/* Driver Portal Routes */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<Navigate to="mission" replace />} />
          <Route path="mission" element={<DriverMission />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
