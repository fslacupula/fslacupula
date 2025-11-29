import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  profile: () => api.get("/auth/profile"),
  registrarJugador: (data) => api.post("/auth/registrar-jugador", data),
  listarJugadores: () => api.get("/auth/jugadores"),
  cambiarEstadoJugador: (id, activo) =>
    api.patch(`/auth/jugadores/${id}/estado`, { activo }),
};

export const entrenamientos = {
  listar: () => api.get("/entrenamientos"),
  misEntrenamientos: () => api.get("/entrenamientos/mis-entrenamientos"),
  obtener: (id) => api.get(`/entrenamientos/${id}`),
  crear: (data) => api.post("/entrenamientos", data),
  actualizar: (id, data) => api.put(`/entrenamientos/${id}`, data),
  eliminar: (id) => api.delete(`/entrenamientos/${id}`),
  registrarAsistencia: (id, data) =>
    api.post(`/entrenamientos/${id}/asistencia`, data),
  actualizarAsistenciaGestor: (id, jugadorId, data) =>
    api.put(`/entrenamientos/${id}/asistencia/${jugadorId}`, data),
};

export const partidos = {
  listar: () => api.get("/partidos"),
  misPartidos: () => api.get("/partidos/mis-partidos"),
  obtener: (id) => api.get(`/partidos/${id}`),
  crear: (data) => api.post("/partidos", data),
  actualizar: (id, data) => api.put(`/partidos/${id}`, data),
  eliminar: (id) => api.delete(`/partidos/${id}`),
  registrarAsistencia: (id, data) =>
    api.post(`/partidos/${id}/asistencia`, data),
  actualizarAsistenciaGestor: (id, jugadorId, data) =>
    api.put(`/partidos/${id}/asistencia/${jugadorId}`, data),
  finalizarPartido: (id, data) => api.post(`/partidos/${id}/finalizar`, data),
};

export const motivos = {
  listar: () => api.get("/motivos"),
};

export const posiciones = {
  listar: () => api.get("/posiciones"),
};

export default api;
