/**
 * Formatea una fecha ISO a formato español con hora
 */
export const formatearFecha = (fechaISO: string): string => {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Convierte segundos a formato de minutos (e.g., "45'")
 */
export const formatearTiempo = (
  segundos: number | null | undefined
): string => {
  const minutos = Math.floor((segundos || 0) / 60);
  return `${minutos}'`;
};

/**
 * Retorna el emoji correspondiente a cada tipo de acción
 */
export const obtenerIconoAccion = (accion: string): string => {
  switch (accion) {
    case "gol":
      return "⚽";
    case "asistencia":
      return "👟";
    case "amarilla":
      return "🟨";
    case "roja":
      return "🟥";
    case "falta":
      return "🚫";
    case "parada":
      return "🧤";
    case "tiempo_muerto":
      return "⏸️";
    default:
      return "•";
  }
};

/**
 * Cuenta tarjetas del historial por equipo y tipo
 */
export const contarTarjetasHistorial = (
  historial: HistorialAccion[],
  equipo: "local" | "visitante",
  tipoTarjeta: "amarilla" | "roja"
): number => {
  return historial.filter(
    (accion) => accion.equipo === equipo && accion.accion === tipoTarjeta
  ).length;
};

// Interfaces para tipos
export interface HistorialAccion {
  id?: number;
  accion: string;
  equipo: "local" | "visitante";
  jugador_id?: number;
  dorsal?: number;
  jugador_nombre?: string;
  minuto?: number;
  minuto_partido?: number;
  periodo?: number;
  timestamp?: string;
}
