import { useState, useEffect } from "react";

/**
 * Hook para monitorear que siempre haya 5 jugadores en pista durante el partido
 * @param {object} jugadoresAsignados - Objeto con los jugadores asignados por posición
 * @param {string} estadoPartido - Estado actual del partido
 * @returns {object} Estado de la alerta
 */
export const usePartidoMonitor = (jugadoresAsignados, estadoPartido) => {
  const [alertaJugadoresFaltantes, setAlertaJugadoresFaltantes] =
    useState(false);

  useEffect(() => {
    // Solo monitorear durante primera_parte y segunda_parte
    if (
      estadoPartido !== "primera_parte" &&
      estadoPartido !== "segunda_parte"
    ) {
      setAlertaJugadoresFaltantes(false);
      return;
    }

    // Contar jugadores en pista
    const numJugadores = Object.keys(jugadoresAsignados).length;

    // Si hay menos de 5 jugadores, iniciar timeout de 10 segundos
    if (numJugadores < 5) {
      const timeout = setTimeout(() => {
        const numJugadoresActual = Object.keys(jugadoresAsignados).length;
        if (numJugadoresActual < 5) {
          setAlertaJugadoresFaltantes(true);
        }
      }, 10000); // 10 segundos

      return () => clearTimeout(timeout);
    } else {
      // Si hay 5 o más jugadores, desactivar alerta
      setAlertaJugadoresFaltantes(false);
    }
  }, [jugadoresAsignados, estadoPartido]);

  /**
   * Cierra manualmente la alerta
   */
  const cerrarAlerta = () => {
    setAlertaJugadoresFaltantes(false);
  };

  return {
    alertaJugadoresFaltantes,
    cerrarAlerta,
  };
};
