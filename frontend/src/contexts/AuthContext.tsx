import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth } from "../services/api";

// Tipos
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "gestor" | "jugador";
  activo?: boolean;
  alias?: string;
  numero_dorsal?: number;
  posicion?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usuario: Usuario) => void;
  logout: () => void;
  updateUsuario: (usuario: Usuario) => void;
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(
      "🔍 [AuthContext] Verificando token:",
      token ? "existe" : "no existe"
    );

    // Timeout de seguridad: si después de 10 segundos no hay respuesta, desbloquear
    const timeoutId = setTimeout(() => {
      console.error("⏱️ [AuthContext] Timeout: La petición tardó demasiado");
      setIsLoading(false);
    }, 10000);

    if (token) {
      console.log("🔄 [AuthContext] Llamando a /auth/profile...");
      auth
        .profile()
        .then((response) => {
          console.log("✅ [AuthContext] Perfil obtenido:", response.data);
          setUsuario(response.data.usuario);
        })
        .catch((error) => {
          console.error(
            "❌ [AuthContext] Error obteniendo perfil:",
            error.response?.data || error.message
          );
          localStorage.removeItem("token");
          setUsuario(null);
        })
        .finally(() => {
          console.log(
            "🏁 [AuthContext] Finalizando carga, setIsLoading(false)"
          );
          clearTimeout(timeoutId);
          setIsLoading(false);
        });
    } else {
      console.log("⏩ [AuthContext] No hay token, setIsLoading(false)");
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  const login = (user: Usuario) => {
    setUsuario(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
  };

  const updateUsuario = (user: Usuario) => {
    setUsuario(user);
  };

  const value: AuthContextType = {
    usuario,
    isLoading,
    isAuthenticated: !!usuario,
    login,
    logout,
    updateUsuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
}
