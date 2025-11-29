// Barrel export para todos los hooks
export {
  AuthProvider,
  useAuth,
  useUsuario,
  useEsGestor,
  useEsJugador,
} from "./useAuth";

export {
  useEventos,
  useEntrenamientos,
  usePartidos,
  type FiltrosEventos,
} from "./useEventos";

export {
  useAsistencias,
  useMiAsistencia,
  useAsistenciasGestor,
  type RegistrarAsistenciaParams,
} from "./useAsistencias";
