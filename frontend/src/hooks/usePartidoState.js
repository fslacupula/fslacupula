import { useState, useEffect } from "react";

/**
 * Hook para gestionar el estado global del partido
 * @param {string} partidoId - ID del partido actual
 * @returns {object} Estado y funciones del partido
 */
export const usePartidoState = (partidoId) => {
  // Estados del flujo del partido
  const [estadoPartido, setEstadoPartido] = useState("configuracion");
  const [periodoActual, setPeriodoActual] = useState(1);

  // Goles
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);

  // Faltas por período
  const [faltasLocalPrimera, setFaltasLocalPrimera] = useState(0);
  const [faltasLocalSegunda, setFaltasLocalSegunda] = useState(0);
  const [faltasVisitantePrimera, setFaltasVisitantePrimera] = useState(0);
  const [faltasVisitanteSegunda, setFaltasVisitanteSegunda] = useState(0);

  // Faltas mostradas en el marcador (según período actual)
  const [faltasLocal, setFaltasLocal] = useState(0);
  const [faltasVisitante, setFaltasVisitante] = useState(0);

  // Tiempos muertos
  const [tiemposMuertosLocal, setTiemposMuertosLocal] = useState({
    primera: false,
    segunda: false,
  });
  const [tiemposMuertosVisitante, setTiemposMuertosVisitante] = useState({
    primera: false,
    segunda: false,
  });

  // Contador de tiempo muerto
  const [contadorTiempoMuerto, setContadorTiempoMuerto] = useState(null);
  const [tiempoMuertoActivo, setTiempoMuertoActivo] = useState(false);

  // Actualizar faltas del marcador según el período actual
  useEffect(() => {
    if (periodoActual === 1) {
      setFaltasLocal(faltasLocalPrimera);
      setFaltasVisitante(faltasVisitantePrimera);
    } else if (periodoActual === 2) {
      setFaltasLocal(faltasLocalSegunda);
      setFaltasVisitante(faltasVisitanteSegunda);
    }
  }, [
    faltasLocalPrimera,
    faltasLocalSegunda,
    faltasVisitantePrimera,
    faltasVisitanteSegunda,
    periodoActual,
  ]);

  // Contador de tiempo muerto (1 minuto)
  useEffect(() => {
    if (tiempoMuertoActivo && contadorTiempoMuerto) {
      const intervalo = setInterval(() => {
        const ahora = Date.now();
        const tiempoTranscurrido =
          (ahora - contadorTiempoMuerto.timestampInicio) / 1000;
        const segundosRestantes = Math.max(
          0,
          60 - Math.floor(tiempoTranscurrido)
        );

        if (segundosRestantes <= 0) {
          setTiempoMuertoActivo(false);
          setContadorTiempoMuerto(null);
        }
      }, 100);

      return () => clearInterval(intervalo);
    }
  }, [tiempoMuertoActivo, contadorTiempoMuerto]);

  // Reiniciar estado del partido
  const reiniciarEstado = () => {
    setEstadoPartido("configuracion");
    setPeriodoActual(1);
    setGolesLocal(0);
    setGolesVisitante(0);
    setFaltasLocalPrimera(0);
    setFaltasLocalSegunda(0);
    setFaltasVisitantePrimera(0);
    setFaltasVisitanteSegunda(0);
    setTiemposMuertosLocal({ primera: false, segunda: false });
    setTiemposMuertosVisitante({ primera: false, segunda: false });
  };

  // Registrar tiempo muerto
  const registrarTiempoMuerto = (equipo) => {
    const parte = periodoActual === 1 ? "primera" : "segunda";

    if (equipo === "local") {
      setTiemposMuertosLocal((prev) => ({ ...prev, [parte]: true }));
    } else {
      setTiemposMuertosVisitante((prev) => ({ ...prev, [parte]: true }));
    }

    setTiempoMuertoActivo(true);
    setContadorTiempoMuerto({
      segundosRestantes: 60,
      timestampInicio: Date.now(),
    });
  };

  return {
    // Estados
    estadoPartido,
    periodoActual,
    golesLocal,
    golesVisitante,
    faltasLocal,
    faltasVisitante,
    faltasLocalPrimera,
    faltasLocalSegunda,
    faltasVisitantePrimera,
    faltasVisitanteSegunda,
    tiemposMuertosLocal,
    tiemposMuertosVisitante,
    contadorTiempoMuerto,
    tiempoMuertoActivo,

    // Setters
    setEstadoPartido,
    setPeriodoActual,
    setGolesLocal,
    setGolesVisitante,
    setFaltasLocalPrimera,
    setFaltasLocalSegunda,
    setFaltasVisitantePrimera,
    setFaltasVisitanteSegunda,
    setTiemposMuertosLocal,
    setTiemposMuertosVisitante,
    setTiempoMuertoActivo,
    setContadorTiempoMuerto,

    // Funciones
    reiniciarEstado,
    registrarTiempoMuerto,
  };
};
