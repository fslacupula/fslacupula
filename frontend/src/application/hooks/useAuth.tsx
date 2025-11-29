import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Usuario } from "@domain";
import api from "../../services/api";

/**
 * Contexto de autenticación
 */
interface AuthContextData {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string) => Promise<void>;
  logout: () => void;
  updateUsuario: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

/**
 * Provider de autenticación
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay token al montar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.auth.profile();
      const usuarioDTO = response.data.usuario;
      setUsuario(Usuario.fromDTO(usuarioDTO));
    } catch (error) {
      console.error("Error verificando token:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem("token", response.data.token);
      setUsuario(Usuario.fromDTO(response.data.usuario));
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, nombre: string) => {
    try {
      await api.auth.register({ email, password, nombre });
      // register devuelve AuthResponse, no tiene token directamente
      // En este caso, necesitamos hacer login después del registro
      await login(email, password);
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  const updateUsuario = (nuevoUsuario: Usuario) => {
    setUsuario(nuevoUsuario);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: !!usuario,
        login,
        register,
        logout,
        updateUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * @returns Datos y métodos de autenticación
 * @throws Error si se usa fuera del AuthProvider
 */
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}

/**
 * Hook para obtener solo el usuario (sin métodos)
 */
export function useUsuario(): Usuario | null {
  const { usuario } = useAuth();
  return usuario;
}

/**
 * Hook para verificar si el usuario es gestor
 */
export function useEsGestor(): boolean {
  const { usuario } = useAuth();
  return usuario?.esGestor() ?? false;
}

/**
 * Hook para verificar si el usuario es jugador
 */
export function useEsJugador(): boolean {
  const { usuario } = useAuth();
  return usuario?.esJugador() ?? false;
}
