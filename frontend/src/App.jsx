// Actualización para App.jsx - Agregar importación y ruta para LandingPage
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";

// Layouts
import DashboardLayout from "./components/layouts/DashboardLayout";
import AdminLayout from "./components/layouts/AdminLayout";

// Pages
import LandingPage from "./pages/LandingPage"; // Nueva importación
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import ClientList from "./pages/clients/ClientList";
import ClientDetail from "./pages/clients/ClientDetail";
import AddClient from "./pages/clients/AddClient";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersList from "./pages/admin/UsersList";
import UserDetail from "./pages/admin/UserDetail";
import ClientsList from "./pages/admin/ClientsList";

// Rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Rutas protegidas para administradores
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el usuario es administrador
  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Landing page como página principal */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas públicas */}
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

        {/* Rutas protegidas (usuarios normales) */}
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

        {/* Rutas de administrador */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <UsersList />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <AdminRoute>
              <AdminLayout>
                <UserDetail />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <AdminRoute>
              <AdminLayout>
                <ClientsList />
              </AdminLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/clients/:clientId"
          element={
            <AdminRoute>
              <AdminLayout>
                <ClientDetail />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
