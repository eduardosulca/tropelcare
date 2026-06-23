import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import TropelsPage from '../pages/TropelsPage';
import SignalsPage from '../pages/SignalsPage';
import SignalDetailPage from '../pages/SignalDetailPage';
import SectorStoryPage from '../pages/SectorStoryPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-white">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/tropels" element={<PrivateRoute><TropelsPage /></PrivateRoute>} />
        <Route path="/signals" element={<PrivateRoute><SignalsPage /></PrivateRoute>} />
        <Route path="/signals/:id" element={<PrivateRoute><SignalDetailPage /></PrivateRoute>} />
        <Route path="/sectors/:id/story" element={<PrivateRoute><SectorStoryPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}