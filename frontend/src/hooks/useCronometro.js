import { useState, useEffect } from "react";

/**
 * Hook para gestionar el cronómetro del partido y los tiempos individuales
 * @returns {object} Estado y funciones del cronómetro
 */
export const useCronometro = () => {
  // Cronómetro principal
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [tiempoCronometro, setTiempoCronometro] = useState(0);
  const [timestampInicioCronometro, setTimestampInicioCronometro] =
    useState(null);
  const [tiempoCronometroAcumulado, setTiempoCronometroAcumulado] = useState(0);

  // Contadores individuales de jugadores
  const [contadoresJugadores, setContadoresJugadores] = useState({});
  const [tiemposEntrada, setTiemposEntrada] = useState({});
  const [tiemposSalida, setTiemposSalida] = useState({});

  // Actualizar cronómetro principal cada 100ms
  useEffect(() => {
    if (cronometroActivo && timestampInicioCronometro) {
      const intervalo = setInterval(() => {
        const ahora = Date.now();
        const tiempoTranscurrido = (ahora - timestampInicioCronometro) / 1000;
        setTiempoCronometro(tiempoCronometroAcumulado + tiempoTranscurrido);
      }, 100);

      return () => clearInterval(intervalo);
    }
  }, [cronometroActivo, timestampInicioCronometro, tiempoCronometroAcumulado]);

  // Actualizar contadores individuales de jugadores cada 100ms
  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = Date.now();
      setContadoresJugadores((prevContadores) => {
        const nuevosContadores = { ...prevContadores };

        Object.keys(tiemposEntrada).forEach((jugadorId) => {
          const entrada = tiemposEntrada[jugadorId];
          const salida = tiemposSalida[jugadorId];

          let tiempoTotal = nuevosContadores[jugadorId]?.acumulado || 0;

          if (entrada && !salida) {
            // Jugador activo en pista
            const tiempoActual = (ahora - entrada.timestamp) / 1000;
            tiempoTotal = entrada.acumulado + tiempoActual;
          } else if (salida) {
            // Jugador fuera de pista
            tiempoTotal = salida.acumulado;
          }

          nuevosContadores[jugadorId] = {
            tiempo: tiempoTotal,
            activo: entrada && !salida,
            acumulado: salida ? salida.acumulado : entrada?.acumulado || 0,
          };
        });

        return nuevosContadores;
      });
    }, 100);

    return () => clearInterval(intervalo);
  }, [tiemposEntrada, tiemposSalida]);

  // Iniciar cronómetro
  const iniciarCronometro = () => {
    if (!cronometroActivo) {
      setCronometroActivo(true);
      setTimestampInicioCronometro(Date.now());
    }
  };

  // Pausar cronómetro
  const pausarCronometro = () => {
    if (cronometroActivo && timestampInicioCronometro) {
      const ahora = Date.now();
      const tiempoTranscurrido = (ahora - timestampInicioCronometro) / 1000;
      setTiempoCronometroAcumulado(
        tiempoCronometroAcumulado + tiempoTranscurrido
      );
      setCronometroActivo(false);
      setTimestampInicioCronometro(null);
    }
  };

  // Reiniciar cronómetro
  const reiniciarCronometro = () => {
    setCronometroActivo(false);
    setTiempoCronometro(0);
    setTimestampInicioCronometro(null);
    setTiempoCronometroAcumulado(0);
    setContadoresJugadores({});
    setTiemposEntrada({});
    setTiemposSalida({});
  };

  // Registrar entrada de jugador
  const registrarEntrada = (jugadorId) => {
    const ahora = Date.now();
    const acumuladoAnterior = contadoresJugadores[jugadorId]?.acumulado || 0;

    setTiemposEntrada((prev) => ({
      ...prev,
      [jugadorId]: {
        timestamp: ahora,
        acumulado: acumuladoAnterior,
      },
    }));

    // Eliminar salida si existe
    setTiemposSalida((prev) => {
      const nuevosSalida = { ...prev };
      delete nuevosSalida[jugadorId];
      return nuevosSalida;
    });
  };

  // Registrar salida de jugador
  const registrarSalida = (jugadorId) => {
    const ahora = Date.now();
    const entrada = tiemposEntrada[jugadorId];

    if (entrada) {
      const tiempoActual = (ahora - entrada.timestamp) / 1000;
      const tiempoTotal = entrada.acumulado + tiempoActual;

      setTiemposSalida((prev) => ({
        ...prev,
        [jugadorId]: {
          timestamp: ahora,
          acumulado: tiempoTotal,
        },
      }));
    }
  };

  // Obtener tiempo total de un jugador
  const obtenerTiempoJugador = (jugadorId) => {
    return contadoresJugadores[jugadorId]?.tiempo || 0;
  };

  // Verificar si un jugador está activo
  const esJugadorActivo = (jugadorId) => {
    return contadoresJugadores[jugadorId]?.activo || false;
  };

  return {
    // Estados del cronómetro
    cronometroActivo,
    tiempoCronometro,
    timestampInicioCronometro,
    tiempoCronometroAcumulado,

    // Estados de jugadores
    contadoresJugadores,
    tiemposEntrada,
    tiemposSalida,

    // Setters
    setCronometroActivo,
    setTiempoCronometro,
    setTimestampInicioCronometro,
    setTiempoCronometroAcumulado,
    setContadoresJugadores,
    setTiemposEntrada,
    setTiemposSalida,

    // Funciones del cronómetro
    iniciarCronometro,
    pausarCronometro,
    reiniciarCronometro,

    // Funciones de jugadores
    registrarEntrada,
    registrarSalida,
    obtenerTiempoJugador,
    esJugadorActivo,
  };
};
