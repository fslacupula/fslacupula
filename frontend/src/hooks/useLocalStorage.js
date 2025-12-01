import { useEffect } from "react";

/**
 * Hook para gestionar la persistencia del partido en localStorage
 * Consolida todos los useEffect de auto-guardado en un único hook
 * @param {string} partidoId - ID del partido actual
 * @param {object} estado - Objeto con todo el estado del partido a guardar
 * @returns {object} Funciones de carga y limpieza
 */
export const useLocalStorage = (partidoId, estado) => {
  const {
    jugadoresAsignados,
    dorsalesVisitantes,
    jugadoresVisitantesActivos,
    estadoPartido,
    periodoActual,
    golesLocal,
    golesVisitante,
    faltasLocalPrimera,
    faltasLocalSegunda,
    faltasVisitantePrimera,
    faltasVisitanteSegunda,
    tiemposMuertosLocal,
    tiemposMuertosVisitante,
    cronometroActivo,
    tiempoCronometro,
    timestampInicioCronometro,
    tiempoCronometroAcumulado,
    contadoresJugadores,
    tiemposEntrada,
    tiemposSalida,
    estadisticas,
    historialAcciones,
  } = estado;

  // Guardar jugadores asignados
  useEffect(() => {
    if (partidoId && jugadoresAsignados) {
      localStorage.setItem(
        `jugadoresAsignados_partido_${partidoId}`,
        JSON.stringify(jugadoresAsignados)
      );
    }
  }, [jugadoresAsignados, partidoId]);

  // Guardar dorsales visitantes
  useEffect(() => {
    if (partidoId && dorsalesVisitantes) {
      localStorage.setItem(
        `dorsalesVisitantes_partido_${partidoId}`,
        JSON.stringify(dorsalesVisitantes)
      );
    }
  }, [dorsalesVisitantes, partidoId]);

  // Guardar jugadores visitantes activos
  useEffect(() => {
    if (partidoId && jugadoresVisitantesActivos) {
      localStorage.setItem(
        `jugadoresVisitantesActivos_partido_${partidoId}`,
        JSON.stringify(jugadoresVisitantesActivos)
      );
    }
  }, [jugadoresVisitantesActivos, partidoId]);

  // Guardar estado del partido
  useEffect(() => {
    if (partidoId && estadoPartido) {
      localStorage.setItem(`estadoPartido_partido_${partidoId}`, estadoPartido);
    }
  }, [estadoPartido, partidoId]);

  // Guardar período actual
  useEffect(() => {
    if (partidoId && periodoActual) {
      localStorage.setItem(
        `periodoActual_partido_${partidoId}`,
        periodoActual.toString()
      );
    }
  }, [periodoActual, partidoId]);

  // Guardar goles y faltas
  useEffect(() => {
    if (partidoId) {
      const datos = {
        golesLocal,
        golesVisitante,
        faltasLocalPrimera,
        faltasLocalSegunda,
        faltasVisitantePrimera,
        faltasVisitanteSegunda,
      };
      localStorage.setItem(
        `marcador_partido_${partidoId}`,
        JSON.stringify(datos)
      );
    }
  }, [
    golesLocal,
    golesVisitante,
    faltasLocalPrimera,
    faltasLocalSegunda,
    faltasVisitantePrimera,
    faltasVisitanteSegunda,
    partidoId,
  ]);

  // Guardar tiempos muertos
  useEffect(() => {
    if (partidoId) {
      const datos = {
        local: tiemposMuertosLocal,
        visitante: tiemposMuertosVisitante,
      };
      localStorage.setItem(
        `tiemposMuertos_partido_${partidoId}`,
        JSON.stringify(datos)
      );
    }
  }, [tiemposMuertosLocal, tiemposMuertosVisitante, partidoId]);

  // Guardar cronómetro
  useEffect(() => {
    if (partidoId) {
      const datos = {
        cronometroActivo,
        tiempoCronometro,
        timestampInicioCronometro,
        tiempoCronometroAcumulado,
      };
      localStorage.setItem(
        `cronometro_partido_${partidoId}`,
        JSON.stringify(datos)
      );
    }
  }, [
    cronometroActivo,
    tiempoCronometro,
    timestampInicioCronometro,
    tiempoCronometroAcumulado,
    partidoId,
  ]);

  // Guardar tiempos de entrada y salida
  useEffect(() => {
    if (partidoId) {
      localStorage.setItem(
        `tiemposEntrada_partido_${partidoId}`,
        JSON.stringify(tiemposEntrada)
      );
    }
  }, [tiemposEntrada, partidoId]);

  useEffect(() => {
    if (partidoId) {
      localStorage.setItem(
        `tiemposSalida_partido_${partidoId}`,
        JSON.stringify(tiemposSalida)
      );
    }
  }, [tiemposSalida, partidoId]);

  // Guardar historial de acciones
  useEffect(() => {
    if (partidoId && historialAcciones) {
      localStorage.setItem(
        `historialAcciones_partido_${partidoId}`,
        JSON.stringify(historialAcciones)
      );
    }
  }, [historialAcciones, partidoId]);

  /**
   * Verifica si existen datos guardados en localStorage
   */
  const verificarDatosLocalStorage = () => {
    if (!partidoId) return false;

    return (
      localStorage.getItem(`estadoPartido_partido_${partidoId}`) !== null ||
      localStorage.getItem(`jugadoresAsignados_partido_${partidoId}`) !== null
    );
  };

  /**
   * Carga todos los datos desde localStorage
   */
  const cargarDesdeLocalStorage = (setters) => {
    if (!partidoId) return false;

    try {
      // Cargar jugadores asignados
      const jugadoresGuardados = localStorage.getItem(
        `jugadoresAsignados_partido_${partidoId}`
      );
      if (jugadoresGuardados) {
        setters.setJugadoresAsignados(JSON.parse(jugadoresGuardados));
      }

      // Cargar dorsales visitantes
      const dorsalesGuardados = localStorage.getItem(
        `dorsalesVisitantes_partido_${partidoId}`
      );
      if (dorsalesGuardados) {
        setters.setDorsalesVisitantes(JSON.parse(dorsalesGuardados));
      }

      // Cargar jugadores visitantes activos
      const visitantesActivosGuardados = localStorage.getItem(
        `jugadoresVisitantesActivos_partido_${partidoId}`
      );
      if (visitantesActivosGuardados) {
        setters.setJugadoresVisitantesActivos(
          JSON.parse(visitantesActivosGuardados)
        );
      } else {
        setters.setJugadoresVisitantesActivos([]);
      }

      // Cargar estado del partido
      const estadoGuardado = localStorage.getItem(
        `estadoPartido_partido_${partidoId}`
      );
      if (estadoGuardado) {
        setters.setEstadoPartido(estadoGuardado);
      }

      // Cargar período actual
      const periodoGuardado = localStorage.getItem(
        `periodoActual_partido_${partidoId}`
      );
      if (periodoGuardado) {
        setters.setPeriodoActual(parseInt(periodoGuardado));
      }

      // Cargar marcador
      const marcadorGuardado = localStorage.getItem(
        `marcador_partido_${partidoId}`
      );
      if (marcadorGuardado) {
        const marcador = JSON.parse(marcadorGuardado);
        setters.setGolesLocal(marcador.golesLocal || 0);
        setters.setGolesVisitante(marcador.golesVisitante || 0);
        setters.setFaltasLocalPrimera(marcador.faltasLocalPrimera || 0);
        setters.setFaltasLocalSegunda(marcador.faltasLocalSegunda || 0);
        setters.setFaltasVisitantePrimera(marcador.faltasVisitantePrimera || 0);
        setters.setFaltasVisitanteSegunda(marcador.faltasVisitanteSegunda || 0);
      }

      // Cargar tiempos muertos
      const tiemposMuertosGuardados = localStorage.getItem(
        `tiemposMuertos_partido_${partidoId}`
      );
      if (tiemposMuertosGuardados) {
        const tiemposMuertos = JSON.parse(tiemposMuertosGuardados);
        setters.setTiemposMuertosLocal(
          tiemposMuertos.local || { primera: false, segunda: false }
        );
        setters.setTiemposMuertosVisitante(
          tiemposMuertos.visitante || { primera: false, segunda: false }
        );
      }

      // Cargar cronómetro
      const cronometroGuardado = localStorage.getItem(
        `cronometro_partido_${partidoId}`
      );
      if (cronometroGuardado) {
        const cronometro = JSON.parse(cronometroGuardado);
        setters.setCronometroActivo(cronometro.cronometroActivo || false);
        setters.setTiempoCronometro(cronometro.tiempoCronometro || 0);
        setters.setTimestampInicioCronometro(
          cronometro.timestampInicioCronometro || null
        );
        setters.setTiempoCronometroAcumulado(
          cronometro.tiempoCronometroAcumulado || 0
        );
      }

      // Cargar tiempos de entrada y salida
      const tiemposEntradaGuardados = localStorage.getItem(
        `tiemposEntrada_partido_${partidoId}`
      );
      if (tiemposEntradaGuardados) {
        setters.setTiemposEntrada(JSON.parse(tiemposEntradaGuardados));
      }

      const tiemposSalidaGuardados = localStorage.getItem(
        `tiemposSalida_partido_${partidoId}`
      );
      if (tiemposSalidaGuardados) {
        setters.setTiemposSalida(JSON.parse(tiemposSalidaGuardados));
      }

      // Cargar historial de acciones
      const historialGuardado = localStorage.getItem(
        `historialAcciones_partido_${partidoId}`
      );
      if (historialGuardado) {
        setters.setHistorialAcciones(JSON.parse(historialGuardado));
      }

      return true;
    } catch (error) {
      console.error("Error cargando datos de localStorage:", error);
      return false;
    }
  };

  /**
   * Limpia todos los datos del partido del localStorage
   */
  const limpiarLocalStoragePartido = () => {
    if (!partidoId) return;

    const keys = [
      "jugadoresAsignados",
      "dorsalesVisitantes",
      "jugadoresVisitantesActivos",
      "estadoPartido",
      "periodoActual",
      "marcador",
      "tiemposMuertos",
      "cronometro",
      "tiemposEntrada",
      "tiemposSalida",
      "historialAcciones",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(`${key}_partido_${partidoId}`);
    });
  };

  return {
    verificarDatosLocalStorage,
    cargarDesdeLocalStorage,
    limpiarLocalStoragePartido,
  };
};
