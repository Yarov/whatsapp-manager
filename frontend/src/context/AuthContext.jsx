// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Verificar autenticación al cargar
  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Verificar que el token no esté expirado
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expirado
          logout();
          setLoading(false);
          return;
        }

        // Guardar el ID del usuario para comprobar en los componentes de administrador
        localStorage.setItem("userId", decoded.id);

        // Configurar token en Axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Obtener perfil del usuario
        const response = await axios.get("/api/auth/profile");
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error al verificar token:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Función para iniciar sesión
  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Guardar token en localStorage
      localStorage.setItem("token", token);

      // Guardar ID del usuario para comprobar en los componentes de administrador
      localStorage.setItem("userId", user.id);

      // Configurar token en Axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  // Función para registrarse
  const register = async (name, email, password) => {
    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const { token, user } = response.data;

      // Guardar token en localStorage
      localStorage.setItem("token", token);

      // Guardar ID del usuario para comprobar en los componentes de administrador
      localStorage.setItem("userId", user.id);

      // Configurar token en Axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Error al registrarse:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Error al registrarse",
      };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Verificar si el usuario es administrador
  const isAdmin = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
