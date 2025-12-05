import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { UsuarioDTO, EntrenamientoDTO, PartidoDTO } from "../domain";

// Tipos de respuesta de la API
export interface LoginResponse {
  token: string;
  usuario: UsuarioDTO;
}

export interface AuthResponse {
  usuario: UsuarioDTO;
}

export interface EntrenamientosResponse {
  entrenamientos: EntrenamientoDTO[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface EntrenamientoResponse {
  entrenamiento: EntrenamientoDTO;
}

export interface PartidosResponse {
  partidos: PartidoDTO[];
  total?: number;
  page?: number;
  totalPages?: number;
}

export interface PartidoResponse {
  partido: PartidoDTO;
}

export interface PosicionDTO {
  id: number;
  nombre: string;
  abreviatura: string;
}

export interface PosicionesResponse {
  posiciones: PosicionDTO[];
}

export interface MotivoAusenciaDTO {
  id: number;
  motivo: string;
  descripcion?: string;
}

export interface MotivosResponse {
  motivos: MotivoAusenciaDTO[];
}

export interface JugadorDTO {
  id: number;
  usuario_id: number;
  nombre: string;
  email: string;
  alias?: string;
  numero_dorsal?: number;
  posicion?: string;
  posicion_id?: number;
  telefono?: string;
  activo: boolean;
  color?: string;
  abreviatura?: string;
}

export interface JugadoresResponse {
  jugadores: JugadorDTO[];
}

// Configuración del cliente Axios
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// Interceptor para agregar el token JWT automáticamente
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Módulo de autenticación
export const auth = {
  register: (data: { email: string; nombre: string; password: string }) =>
    api.post<AuthResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>("/auth/login", data),

  profile: () => api.get<AuthResponse>("/auth/profile"),

  registrarJugador: (data: {
    nombre: string;
    email: string;
    password: string;
    datosJugador?: {
      numeroDorsal?: number;
      posicionId?: number;
      alias?: string;
    };
  }) => api.post<{ jugador: JugadorDTO }>("/auth/registrar-jugador", data),

  listarJugadores: () => api.get<JugadoresResponse>("/auth/jugadores"),

  cambiarEstadoJugador: (id: number, activo: boolean) =>
    api.patch(`/auth/jugadores/${id}/estado`, { activo }),
};

// Módulo de entrenamientos
export const entrenamientos = {
  listar: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }) => api.get<EntrenamientosResponse>("/entrenamientos", { params }),

  misEntrenamientos: (params?: { fechaDesde?: string; fechaHasta?: string }) =>
    api.get<EntrenamientosResponse>("/entrenamientos/mis-entrenamientos", {
      params,
    }),

  obtener: (id: number) =>
    api.get<EntrenamientoResponse>(`/entrenamientos/${id}`),

  crear: (data: {
    fecha: string;
    hora: string;
    ubicacion: string;
    descripcion?: string;
    duracion_minutos?: number;
  }) => api.post<EntrenamientoResponse>("/entrenamientos", data),

  actualizar: (
    id: number,
    data: {
      fecha?: string;
      hora?: string;
      ubicacion?: string;
      descripcion?: string;
      duracion_minutos?: number;
    }
  ) => api.put<EntrenamientoResponse>(`/entrenamientos/${id}`, data),

  eliminar: (id: number) => api.delete(`/entrenamientos/${id}`),

  registrarAsistencia: (
    id: number,
    data: {
      estado: string;
      motivoAusenciaId?: number;
      comentario?: string;
    }
  ) => api.post(`/entrenamientos/${id}/asistencia`, data),

  actualizarAsistenciaGestor: (
    id: number,
    jugadorId: number,
    data: {
      estado: string;
      motivoAusenciaId?: number;
      comentario?: string;
    }
  ) => api.put(`/entrenamientos/${id}/asistencia/${jugadorId}`, data),
};

// Módulo de partidos
export const partidos = {
  listar: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    limit?: number;
  }) => api.get<PartidosResponse>("/partidos", { params }),

  misPartidos: (params?: { fechaDesde?: string; fechaHasta?: string }) =>
    api.get<PartidosResponse>("/partidos/mis-partidos", { params }),

  obtener: (id: number) => api.get<PartidoResponse>(`/partidos/${id}`),

  crear: (data: {
    fecha: string;
    hora: string;
    ubicacion: string;
    rival: string;
    tipo: string;
    es_local: boolean;
    resultado?: string;
  }) => api.post<PartidoResponse>("/partidos", data),

  actualizar: (
    id: number,
    data: {
      fecha?: string;
      hora?: string;
      ubicacion?: string;
      rival?: string;
      tipo?: string;
      es_local?: boolean;
      resultado?: string;
    }
  ) => api.put<PartidoResponse>(`/partidos/${id}`, data),

  eliminar: (id: number) => api.delete(`/partidos/${id}`),

  registrarAsistencia: (
    id: number,
    data: {
      estado: string;
      motivoAusenciaId?: number;
      comentario?: string;
    }
  ) => api.post(`/partidos/${id}/asistencia`, data),

  actualizarAsistenciaGestor: (
    id: number,
    jugadorId: number,
    data: {
      estado: string;
      motivoAusenciaId?: number;
      comentario?: string;
    }
  ) => api.put(`/partidos/${id}/asistencia/${jugadorId}`, data),

  finalizarPartido: (id: number, data: any) =>
    api.post(`/partidos/${id}/finalizar`, data),

  obtenerEstadisticas: (id: number) => api.get(`/partidos/${id}/estadisticas`),
};

// Módulo de motivos de ausencia
export const motivos = {
  listar: () => api.get<MotivosResponse>("/motivos"),
};

// Módulo de posiciones
export const posiciones = {
  listar: () => api.get<PosicionesResponse>("/posiciones"),
};

// Objeto API completo con todos los módulos
const apiClient = {
  auth,
  entrenamientos,
  partidos,
  motivos,
  posiciones,
  client: api, // Cliente Axios raw para casos especiales
};

export default apiClient;
