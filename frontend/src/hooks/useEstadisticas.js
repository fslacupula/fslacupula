import { useState, useEffect } from "react";

/**
 * Hook para gestionar estadísticas del partido y acciones registradas
 * @returns {object} Estado y funciones de estadísticas
 */
export const useEstadisticas = () => {
  // Estadísticas acumuladas
  const [estadisticas, setEstadisticas] = useState({});

  // Historial de acciones
  const [historialAcciones, setHistorialAcciones] = useState([]);

  // Estados visuales (flashes y animaciones)
  const [flashGol, setFlashGol] = useState(false);
  const [flashFalta, setFlashFalta] = useState(false);
  const [mostrarTarjeta, setMostrarTarjeta] = useState(null);

  // Efecto para flash de gol
  useEffect(() => {
    if (flashGol) {
      const timeout = setTimeout(() => setFlashGol(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [flashGol]);

  // Efecto para flash de falta
  useEffect(() => {
    if (flashFalta) {
      const timeout = setTimeout(() => setFlashFalta(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [flashFalta]);

  // Efecto para ocultar tarjeta
  useEffect(() => {
    if (mostrarTarjeta) {
      const timeout = setTimeout(() => setMostrarTarjeta(null), 2000);
      return () => clearTimeout(timeout);
    }
  }, [mostrarTarjeta]);

  /**
   * Registra una nueva acción en el historial
   */
  const registrarAccion = (tipo, jugadorId, datos, tiempoCronometro) => {
    const nuevaAccion = {
      id: Date.now(),
      tipo,
      jugadorId,
      timestamp: Date.now(),
      tiempoCronometro: tiempoCronometro || 0,
      ...datos,
    };

    setHistorialAcciones((prev) => [nuevaAccion, ...prev]);

    // Actualizar estadísticas
    if (tipo !== "entrada" && tipo !== "salida") {
      setEstadisticas((prev) => {
        const estadisticasJugador = prev[jugadorId] || {
          goles: 0,
          faltas: 0,
          amarillas: 0,
          rojas: 0,
        };

        const nuevasEstadisticas = { ...estadisticasJugador };

        if (tipo === "gol") {
          nuevasEstadisticas.goles = (estadisticasJugador.goles || 0) + 1;
          setFlashGol(true);
        } else if (tipo === "falta") {
          nuevasEstadisticas.faltas = (estadisticasJugador.faltas || 0) + 1;
          setFlashFalta(true);
        } else if (tipo === "amarilla") {
          nuevasEstadisticas.amarillas =
            (estadisticasJugador.amarillas || 0) + 1;
          setMostrarTarjeta({ tipo: "amarilla", jugadorId });
        } else if (tipo === "roja") {
          nuevasEstadisticas.rojas = (estadisticasJugador.rojas || 0) + 1;
          setMostrarTarjeta({ tipo: "roja", jugadorId });
        }

        return {
          ...prev,
          [jugadorId]: nuevasEstadisticas,
        };
      });
    }

    return nuevaAccion;
  };

  /**
   * Deshace la última acción del historial
   */
  const deshacerAccion = () => {
    if (historialAcciones.length === 0) return null;

    const [ultimaAccion, ...restoAcciones] = historialAcciones;
    setHistorialAcciones(restoAcciones);

    // Revertir estadísticas
    if (
      ultimaAccion.tipo !== "entrada" &&
      ultimaAccion.tipo !== "salida" &&
      ultimaAccion.tipo !== "tiempo_muerto"
    ) {
      setEstadisticas((prev) => {
        const estadisticasJugador = prev[ultimaAccion.jugadorId];
        if (!estadisticasJugador) return prev;

        const nuevasEstadisticas = { ...estadisticasJugador };

        if (ultimaAccion.tipo === "gol") {
          nuevasEstadisticas.goles = Math.max(
            0,
            (estadisticasJugador.goles || 0) - 1
          );
        } else if (ultimaAccion.tipo === "falta") {
          nuevasEstadisticas.faltas = Math.max(
            0,
            (estadisticasJugador.faltas || 0) - 1
          );
        } else if (ultimaAccion.tipo === "amarilla") {
          nuevasEstadisticas.amarillas = Math.max(
            0,
            (estadisticasJugador.amarillas || 0) - 1
          );
        } else if (ultimaAccion.tipo === "roja") {
          nuevasEstadisticas.rojas = Math.max(
            0,
            (estadisticasJugador.rojas || 0) - 1
          );
        }

        return {
          ...prev,
          [ultimaAccion.jugadorId]: nuevasEstadisticas,
        };
      });
    }

    return ultimaAccion;
  };

  /**
   * Obtiene estadísticas de un jugador específico
   */
  const obtenerEstadisticasJugador = (jugadorId) => {
    return (
      estadisticas[jugadorId] || {
        goles: 0,
        faltas: 0,
        amarillas: 0,
        rojas: 0,
      }
    );
  };

  /**
   * Obtiene el historial de acciones de un jugador
   */
  const obtenerHistorialJugador = (jugadorId) => {
    return historialAcciones.filter((accion) => accion.jugadorId === jugadorId);
  };

  /**
   * Filtra el historial por tipo de acción
   */
  const filtrarHistorialPorTipo = (tipo) => {
    return historialAcciones.filter((accion) => accion.tipo === tipo);
  };

  /**
   * Obtiene el número total de acciones
   */
  const contarAcciones = () => {
    return historialAcciones.length;
  };

  /**
   * Limpia el historial y estadísticas
   */
  const reiniciarEstado = () => {
    setEstadisticas({});
    setHistorialAcciones([]);
    setFlashGol(false);
    setFlashFalta(false);
    setMostrarTarjeta(null);
  };

  return {
    // Estados
    estadisticas,
    historialAcciones,
    flashGol,
    flashFalta,
    mostrarTarjeta,

    // Setters
    setEstadisticas,
    setHistorialAcciones,
    setFlashGol,
    setFlashFalta,
    setMostrarTarjeta,

    // Funciones principales
    registrarAccion,
    deshacerAccion,

    // Funciones de consulta
    obtenerEstadisticasJugador,
    obtenerHistorialJugador,
    filtrarHistorialPorTipo,
    contarAcciones,

    // Funciones de utilidad
    reiniciarEstado,
  };
};
