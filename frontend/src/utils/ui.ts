/**
 * Helpers de UI compartidos
 * Utilidades para estilos y clases CSS
 */

/**
 * Obtiene las clases CSS para badges de estado de asistencia
 */
export function getEstadoBadge(estado: string): string {
  const colores: Record<string, string> = {
    confirmado: "bg-green-100 text-green-800",
    no_asiste: "bg-red-100 text-red-800",
    pendiente: "bg-yellow-100 text-yellow-800",
  };
  return colores[estado] || colores.pendiente;
}

/**
 * Obtiene el texto legible para un estado de asistencia
 */
export function getEstadoTexto(estado: string): string {
  const textos: Record<string, string> = {
    confirmado: "Confirmado",
    no_asiste: "No asiste",
    pendiente: "Pendiente",
  };
  return textos[estado] || "Pendiente";
}

/**
 * Obtiene el icono para un estado de asistencia
 */
export function getEstadoIcono(estado: string): string {
  const iconos: Record<string, string> = {
    confirmado: "✓",
    no_asiste: "✗",
    pendiente: "⏳",
  };
  return iconos[estado] || "⏳";
}
