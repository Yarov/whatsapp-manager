import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  DevicePhoneMobileIcon,
  UserGroupIcon,
  BellIcon,
  Bars3Icon,
  XMarkIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

// Navegación principal actualizada
const navigation = [
  { name: "Mi Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Clientes", href: "/clients", icon: DevicePhoneMobileIcon },
  {
    name: "API Explorer",
    href: "/dashboard/api-explorer",
    icon: CodeBracketIcon,
  }, // Ruta actualizada
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cierra el sidebar cuando cambia la ruta en dispositivos móviles
  useEffect(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Primera letra del nombre de usuario para el avatar
  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)} // Cierra al hacer clic en el overlay
      />

      {/* Sidebar para móvil */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transition duration-300 transform bg-blue-800 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Botón de cierre para móvil */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                W
              </div>
              <span className="ml-2 text-white font-semibold">
                WtX
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Enlaces de navegación */}
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {isAdmin && isAdmin() && (
              <Link
                to="/admin/dashboard"
                className="flex items-center px-4 py-2 text-white hover:bg-blue-700 rounded-md"
              >
                <UserGroupIcon className="w-6 h-6 mr-3" />
                <span>Administración</span>
              </Link>
            )}

            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  location.pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      location.pathname.startsWith(item.href))
                    ? "bg-blue-700 text-white"
                    : "text-white hover:bg-blue-700",
                  "flex items-center px-4 py-2 rounded-md"
                )}
              >
                <item.icon className="w-6 h-6 mr-3" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Perfil de usuario */}
          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-white font-medium">
                  {userInitial}
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                {isAdmin && isAdmin() && (
                  <p className="text-xs text-indigo-200">Administrador</p>
                )}
                <button
                  onClick={handleLogout}
                  className="text-xs text-indigo-200 hover:text-white"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Barra superior */}
        <div className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-gray-200">
          {/* Título de la página y botón de menú móvil */}
          <div className="flex items-center">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 mr-2 text-gray-500 rounded-md lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-700"
            >
              <span className="sr-only">Abrir menú</span>
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {location.pathname === "/dashboard"
                ? "Dashboard"
                : location.pathname.startsWith("/clients")
                ? "Clientes"
                : location.pathname.includes("/api-explorer")
                ? "API Explorer"
                : location.pathname.startsWith("/admin")
                ? "Dashboard Administrador"
                : "WtX"}
            </h1>
          </div>

          {/* Enlaces y notificaciones */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              title="Notificaciones"
            >
              <BellIcon className="w-6 h-6" />
            </button>
            {isAdmin &&
              isAdmin() &&
              !location.pathname.startsWith("/admin") && (
                <Link
                  to="/admin/dashboard"
                  className="hidden sm:inline-block text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  Vista administrador
                </Link>
              )}
          </div>
        </div>

        {/* Contenido de la página con scroll */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
