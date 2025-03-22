// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layouts
import DashboardLayout from './components/layouts/DashboardLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import ClientList from './pages/clients/ClientList';
import ClientDetail from './pages/clients/ClientDetail';
import AddClient from './pages/clients/AddClient';
import NotFound from './pages/NotFound';

// Rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Rutas para usuarios no autenticados
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClientList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/add"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddClient />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ClientDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;