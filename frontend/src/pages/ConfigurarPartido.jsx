import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PistaFutsal from "../components/PistaFutsal";
import Marcador from "../components/Marcador";
import { partidos, auth } from "../services/api";
import { useAuthContext } from "@contexts";
import { usePartidoState } from "../hooks/usePartidoState";
import { useJugadores } from "../hooks/useJugadores";
import { useCronometro } from "../hooks/useCronometro";
import { useEstadisticas } from "../hooks/useEstadisticas";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usePartidoMonitor } from "../hooks/usePartidoMonitor";
import { formatearTiempo } from "../utils/partidoUtils";
import { PanelJugadoresLocales } from "../components/ConfigurarPartido/PanelJugadoresLocales";
import PanelJugadoresVisitantes from "../components/ConfigurarPartido/PanelJugadoresVisitantes";
import AnimacionTarjeta from "../components/ConfigurarPartido/AnimacionTarjeta";
import BotonesAccion from "../components/ConfigurarPartido/BotonesAccion";
import TablaMinutosJugados from "../components/ConfigurarPartido/TablaMinutosJugados";
import ModalConfirmacionCountdown from "../components/ConfigurarPartido/modales/ModalConfirmacionCountdown";
import ModalAlertaJugadoresFaltantes from "../components/ConfigurarPartido/modales/ModalAlertaJugadoresFaltantes";
import VisorLocalStorage from "../components/ConfigurarPartido/modales/VisorLocalStorage";
import ModalAlertaGeneral from "../components/ConfigurarPartido/modales/ModalAlertaGeneral";
import ModalesPartido from "../components/ConfigurarPartido/modales/ModalesPartido";
import DialogosPartido from "../components/ConfigurarPartido/modales/DialogosPartido";
import BotonesUtilidades from "../components/ConfigurarPartido/BotonesUtilidades";

function ConfigurarPartido() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const { partidoId: partidoIdParam } = useParams();

  // Estado local del componente
  const [partidoId, setPartidoId] = useState(null);
  const [partidoInfo, setPartidoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordenColumna, setOrdenColumna] = useState("minutos");
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [accionActiva, setAccionActiva] = useState(null); // null | "amarilla" | "roja" | "gol" | "falta"
  const [posicionSeleccionada, setPosicionSeleccionada] = useState(null); // null | "portero" | "cierre" | "alaSuperior" | "alaInferior" | "pivote"
  const [editandoDorsal, setEditandoDorsal] = useState(null);

  // Custom hooks
  const partidoState = usePartidoState(partidoId);
  const jugadoresHook = useJugadores(partidoId);
  const cronometroHook = useCronometro();
  const estadisticasHook = useEstadisticas();

  // Destructuring de los hooks
  const {
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
    registrarTiempoMuerto,
  } = partidoState;

  const {
    jugadoresAsignados,
    jugadores,
    staff,
    dorsalesVisitantes,
    jugadoresVisitantesActivos,
    elementoArrastrado,
    setJugadoresAsignados,
    setJugadores,
    setStaff,
    setDorsalesVisitantes,
    setJugadoresVisitantesActivos,
    handleDragStart,
    handleDrop,
    handlePosicionClick,
    asignarJugadorAPosicion,
    obtenerJugador,
    obtenerDorsal,
    obtenerNombre,
    actualizarDorsalVisitante,
    toggleJugadorVisitanteActivo,
    esJugadorVisitanteActivo,
  } = jugadoresHook;

  const {
    cronometroActivo,
    tiempoCronometro,
    timestampInicioCronometro,
    tiempoCronometroAcumulado,
    contadoresJugadores,
    tiemposEntrada,
    tiemposSalida,
    setCronometroActivo,
    setTiempoCronometro,
    setTimestampInicioCronometro,
    setTiempoCronometroAcumulado,
    setContadoresJugadores,
    setTiemposEntrada,
    setTiemposSalida,
    iniciarCronometro,
    pausarCronometro,
    reiniciarCronometro,
    registrarEntrada,
    registrarSalida,
    obtenerTiempoJugador,
    esJugadorActivo,
  } = cronometroHook;

  const {
    estadisticas,
    historialAcciones,
    flashGol,
    flashFalta,
    mostrarTarjeta,
    setEstadisticas,
    setHistorialAcciones,
    setFlashGol,
    setFlashFalta,
    setMostrarTarjeta,
    registrarAccion,
    deshacerAccion,
    obtenerEstadisticasJugador,
    obtenerHistorialJugador,
    filtrarHistorialPorTipo,
    contarAcciones,
  } = estadisticasHook;

  // Hook de monitoreo de jugadores
  const { alertaJugadoresFaltantes, cerrarAlerta } = usePartidoMonitor(
    jugadoresAsignados,
    estadoPartido
  );

  // Hook de localStorage
  const localStorageHook = useLocalStorage(partidoId, {
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
  });

  const {
    verificarDatosLocalStorage,
    cargarDesdeLocalStorage,
    limpiarLocalStoragePartido,
  } = localStorageHook;

  // Estados para confirmaciones
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(null); // { tipo: string, data: any, timestamp: number }
  const [tiempoRestanteConfirmacion, setTiempoRestanteConfirmacion] =
    useState(0);

  // Estados para diálogos de control de datos
  const [mostrarDialogoLocalStorage, setMostrarDialogoLocalStorage] =
    useState(false);
  const [mostrarDialogoResetPartido, setMostrarDialogoResetPartido] =
    useState(false);
  const [mostrarVisorLocalStorage, setMostrarVisorLocalStorage] =
    useState(false);
  const [datosLocalStoragePartido, setDatosLocalStoragePartido] =
    useState(null);
  const [mostrarDialogoIniciarPartido, setMostrarDialogoIniciarPartido] =
    useState(false);
  const [
    mostrarDialogoValidacionJugadores,
    setMostrarDialogoValidacionJugadores,
  ] = useState(false);
  const [jugadoresEnPistaCount, setJugadoresEnPistaCount] = useState(0);

  // Estados para modales de confirmación y alertas
  const [modalTiempoMuerto, setModalTiempoMuerto] = useState({
    visible: false,
    equipo: null,
  });
  const [modalFinalizarPrimera, setModalFinalizarPrimera] = useState(false);
  const [modalIniciarSegunda, setModalIniciarSegunda] = useState(false);
  const [modalFinalizarPartido, setModalFinalizarPartido] = useState(false);
  const [modalFinalizarExcepcional, setModalFinalizarExcepcional] = useState({
    visible: false,
    motivo: "",
  });
  const [modalAlerta, setModalAlerta] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    tipo: "info",
  }); // tipo: info, success, error
  const [modalVolverDashboard, setModalVolverDashboard] = useState(false);

  // Temporizador para desmarcar acción activa después de 10 segundos
  useEffect(() => {
    if (accionActiva) {
      const timer = setTimeout(() => {
        setAccionActiva(null);
      }, 10000); // 10 segundos

      return () => clearTimeout(timer);
    }
  }, [accionActiva]);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Contador para confirmaciones temporales (5 segundos)
  useEffect(() => {
    if (confirmacionPendiente) {
      const tiempoInicio = confirmacionPendiente.timestamp;
      const interval = setInterval(() => {
        const tiempoTranscurrido = Date.now() - tiempoInicio;
        const restante = Math.max(0, 5000 - tiempoTranscurrido);
        setTiempoRestanteConfirmacion(Math.ceil(restante / 1000));

        if (restante <= 0) {
          // Cancelar confirmación
          setConfirmacionPendiente(null);
          setTiempoRestanteConfirmacion(0);
        }
      }, 100);

      return () => clearInterval(interval);
    } else {
      setTiempoRestanteConfirmacion(0);
    }
  }, [confirmacionPendiente]);

  // Forzar re-render cada segundo para actualizar tiempos de descanso
  const [actualizacionTiempo, setActualizacionTiempo] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      setActualizacionTiempo(Date.now());
    }, 1000); // Cada segundo
    return () => clearInterval(interval);
  }, []);

  // ===== FUNCIONES DE UTILIDAD ===== //

  // handleDragStart viene del hook useJugadores

  const handleDropLocal = (jugador, posicion) => {
    // Esta es una versión wrapper para mantener compatibilidad con código legacy
    const esVisitante =
      jugador.id &&
      (jugador.id.toString().startsWith("visitante-") ||
        jugador.id.toString().includes("-visitante-"));
    if (esVisitante) {
      console.log("Jugadores visitantes no pueden ponerse en pista");
      return;
    }

    const esStaff = jugador.id && jugador.id.toString().startsWith("staff-");
    if (esStaff) {
      console.log(
        "El staff (Entrenador, Delegado, Auxiliar) no puede ponerse en pista"
      );
      return;
    }

    // Asignar directamente usando el setter del hook
    setJugadoresAsignados((prev) => {
      const nuevo = { ...prev };
      // Eliminar al jugador de cualquier posición anterior
      Object.keys(nuevo).forEach((pos) => {
        if (nuevo[pos] && nuevo[pos].id === jugador.id) {
          delete nuevo[pos];
        }
      });
      // Asignarlo a la nueva posición
      nuevo[posicion] = jugador;
      return nuevo;
    });

    // Registrar entrada si el cronómetro está activo
    if (cronometroActivo && jugador.id) {
      registrarEntrada(jugador.id);
    }
  };

  const isJugadorAsignado = (jugadorId) => {
    return Object.values(jugadoresAsignados).some(
      (j) => j && j.id === jugadorId
    );
  };

  // Función para quitar jugador de pista (drop fuera de zona)
  const handleDropFueraPista = (e) => {
    e.preventDefault();
    const jugadorData = e.dataTransfer.getData("jugador");
    if (jugadorData) {
      const jugador = JSON.parse(jugadorData);

      // Buscar si el jugador está en alguna posición
      const posicionActual = Object.entries(jugadoresAsignados).find(
        ([pos, jug]) => jug && jug.id === jugador.id
      );

      if (posicionActual) {
        const [posicion] = posicionActual;

        // Desactivar el contador del jugador y acumular tiempo si está activo
        if (cronometroActivo) {
          const ahora = Date.now();
          setContadoresJugadores((prev) => {
            const nuevoContador = { ...prev };

            if (nuevoContador[jugador.id] && nuevoContador[jugador.id].activo) {
              const tiempoSesion =
                (ahora - nuevoContador[jugador.id].timestampInicio) / 1000;
              nuevoContador[jugador.id].tiempoAcumulado += tiempoSesion;
              nuevoContador[jugador.id].activo = false;
              nuevoContador[jugador.id].timestampInicio = null;
            }

            return nuevoContador;
          });
        }

        // Remover jugador de la posición
        setJugadoresAsignados((prev) => {
          const nuevo = { ...prev };
          delete nuevo[posicion];
          return nuevo;
        });

        // Registrar tiempo de salida
        setTiemposSalida((prev) => ({
          ...prev,
          [jugador.id]: Date.now(),
        }));
      }
    }
  };

  const handleDragOverFueraPista = (e) => {
    e.preventDefault();
  };

  // Función para remover jugador de una posición específica
  const handlePosicionClickLocal = (posicion) => {
    const jugadorEnPosicion = jugadoresAsignados[posicion];
    if (jugadorEnPosicion) {
      // Remover jugador de la posición usando el setter del hook
      setJugadoresAsignados((prev) => {
        const nuevo = { ...prev };
        delete nuevo[posicion];
        return nuevo;
      });

      // Registrar salida usando el hook de cronómetro
      if (jugadorEnPosicion.id && cronometroActivo) {
        registrarSalida(jugadorEnPosicion.id);
      }
    }
  };

  // Ejecutar acción sobre un jugador (usado por drag&drop y por modo click)
  const ejecutarAccion = (jugador, tipoAccion) => {
    if (!jugador || !tipoAccion) return;
    registrarAccionLegacy(jugador, tipoAccion);
    // Desactivar modo de selección después de aplicar la acción
    setAccionActiva(null);
  };

  // Asignar jugador a posición desde modo click
  const asignarJugadorAPosicionLocal = (jugador, posicion) => {
    if (!jugador || !posicion) return;
    handleDropLocal(jugador, posicion);
    // Desactivar modo de selección de posición
    setPosicionSeleccionada(null);
  };

  // Función para manejar la selección de posición con exclusión mutua
  const handlePosicionSeleccionar = (posicion) => {
    setAccionActiva(null); // Limpiar acción activa
    setPosicionSeleccionada(posicion);
  };

  const handleAccionDrop = (e, accion) => {
    e.preventDefault();
    const jugadorData = e.dataTransfer.getData("jugador");
    if (jugadorData) {
      const jugador = JSON.parse(jugadorData);
      ejecutarAccion(jugador, accion);
    }
  };

  const registrarAccionLegacy = (jugador, accion) => {
    const esVisitante =
      jugador.id &&
      (jugador.id.toString().startsWith("visitante-") ||
        jugador.id.toString().includes("-visitante-"));

    // Calcular tiempo actual del cronómetro (incluye tiempo acumulado + tiempo actual si está activo)
    const tiempoActualCronometro =
      cronometroActivo && timestampInicioCronometro
        ? tiempoCronometro + (Date.now() - timestampInicioCronometro) / 1000
        : tiempoCronometro;

    const minutoPartido = Math.floor(tiempoActualCronometro / 60);

    const nuevaAccion = {
      id: Date.now(),
      jugadorId: jugador.id,
      jugadorNombre: jugador.nombre || `Dorsal ${jugador.numero_dorsal}`,
      dorsal: jugador.numero_dorsal,
      accion,
      timestamp: new Date().toISOString(),
      minuto_partido: minutoPartido,
      equipo: esVisitante ? "visitante" : "local",
      periodo: periodoActual, // Añadir el período en el que ocurrió la acción
    };

    console.log(
      `🎯 Registrando ${accion} en minuto ${minutoPartido} (cronómetro: ${Math.floor(
        tiempoActualCronometro
      )}s, activo: ${cronometroActivo})`,
      nuevaAccion
    );

    setHistorialAcciones((prev) => [...prev, nuevaAccion]);

    setEstadisticas((prev) => ({
      ...prev,
      [jugador.id]: {
        ...prev[jugador.id],
        goles: (prev[jugador.id]?.goles || 0) + (accion === "gol" ? 1 : 0),
        asistencias:
          (prev[jugador.id]?.asistencias || 0) +
          (accion === "asistencia" ? 1 : 0),
        paradas:
          (prev[jugador.id]?.paradas || 0) + (accion === "parada" ? 1 : 0),
        faltas: (prev[jugador.id]?.faltas || 0) + (accion === "falta" ? 1 : 0),
        amarillas:
          (prev[jugador.id]?.amarillas || 0) + (accion === "amarilla" ? 1 : 0),
        rojas: (prev[jugador.id]?.rojas || 0) + (accion === "roja" ? 1 : 0),
      },
    }));

    // Incrementar goles según el equipo
    if (accion === "gol") {
      if (esVisitante) {
        setGolesVisitante((prev) => prev + 1);
      } else {
        setGolesLocal((prev) => prev + 1);
      }
    }

    // Incrementar faltas según el equipo (máximo 5) y período actual
    if (accion === "falta") {
      if (esVisitante) {
        if (periodoActual === 1) {
          setFaltasVisitantePrimera((prev) => {
            const nuevasFaltas = Math.min(5, prev + 1);
            // Mostrar animación cuando se llega a 5 faltas
            if (nuevasFaltas === 5 && prev === 4) {
              setMostrarTarjeta({
                visible: true,
                tipo: "5faltas",
                dorsal: null,
                equipo: "visitante",
              });
            }
            return nuevasFaltas;
          });
        } else {
          setFaltasVisitanteSegunda((prev) => {
            const nuevasFaltas = Math.min(5, prev + 1);
            // Mostrar animación cuando se llega a 5 faltas
            if (nuevasFaltas === 5 && prev === 4) {
              setMostrarTarjeta({
                visible: true,
                tipo: "5faltas",
                dorsal: null,
                equipo: "visitante",
              });
            }
            return nuevasFaltas;
          });
        }
      } else {
        if (periodoActual === 1) {
          setFaltasLocalPrimera((prev) => {
            const nuevasFaltas = Math.min(5, prev + 1);
            // Mostrar animación cuando se llega a 5 faltas
            if (nuevasFaltas === 5 && prev === 4) {
              setMostrarTarjeta({
                visible: true,
                tipo: "5faltas",
                dorsal: null,
                equipo: "local",
              });
            }
            return nuevasFaltas;
          });
        } else {
          setFaltasLocalSegunda((prev) => {
            const nuevasFaltas = Math.min(5, prev + 1);
            // Mostrar animación cuando se llega a 5 faltas
            if (nuevasFaltas === 5 && prev === 4) {
              setMostrarTarjeta({
                visible: true,
                tipo: "5faltas",
                dorsal: null,
                equipo: "local",
              });
            }
            return nuevasFaltas;
          });
        }
      }
    }

    // Disparar efecto visual de confirmación
    setFlashEffect({
      type: accion,
      jugadorId: jugador.id,
      timestamp: Date.now(),
      equipo: esVisitante ? "visitante" : "local",
    });

    // Mostrar animación espectacular para goles, amarillas y rojas
    if (accion === "gol" || accion === "amarilla" || accion === "roja") {
      setMostrarTarjeta({
        visible: true,
        tipo: accion,
        dorsal: jugador.numero_dorsal,
      });
    }

    console.log(
      `Acción registrada: ${accion} para ${
        jugador.nombre || jugador.numero_dorsal
      }`
    );
  };

  // Función para registrar tiempo muerto
  const registrarTiempoMuertoLegacy = (equipo) => {
    if (estadoPartido === "configuracion" || estadoPartido === "finalizado") {
      return;
    }

    const parte = periodoActual === 1 ? "primera" : "segunda";

    // Verificar si ya se usó el tiempo muerto en esta parte
    if (equipo === "local") {
      if (tiemposMuertosLocal[parte]) {
        setModalAlerta({
          visible: true,
          titulo: "Tiempo Muerto No Disponible",
          mensaje: `El equipo local ya utilizó su tiempo muerto en la ${
            parte === "primera" ? "1ª" : "2ª"
          } parte.`,
          tipo: "error",
        });
        return;
      }
    } else {
      if (tiemposMuertosVisitante[parte]) {
        setModalAlerta({
          visible: true,
          titulo: "Tiempo Muerto No Disponible",
          mensaje: `El equipo visitante ya utilizó su tiempo muerto en la ${
            parte === "primera" ? "1ª" : "2ª"
          } parte.`,
          tipo: "error",
        });
        return;
      }
    }

    // Mostrar modal de confirmación
    setModalTiempoMuerto({ visible: true, equipo });
  };

  // Función para confirmar el tiempo muerto desde el modal
  const confirmarTiempoMuerto = () => {
    const equipo = modalTiempoMuerto.equipo;
    setModalTiempoMuerto({ visible: false, equipo: null });

    const parte = periodoActual === 1 ? "primera" : "segunda";

    // Calcular minuto actual
    const tiempoActualCronometro =
      cronometroActivo && timestampInicioCronometro
        ? tiempoCronometro + (Date.now() - timestampInicioCronometro) / 1000
        : tiempoCronometro;
    const minutoPartido = Math.floor(tiempoActualCronometro / 60);

    // Registrar en historial
    const nuevaAccion = {
      id: Date.now(),
      jugadorId: null,
      jugadorNombre:
        equipo === "local" ? "LA CÚPULA" : partidoInfo?.rival || "VISITANTE",
      dorsal: null,
      accion: "tiempo_muerto",
      timestamp: new Date().toISOString(),
      minuto_partido: minutoPartido,
      equipo: equipo,
      periodo: periodoActual,
    };

    setHistorialAcciones((prev) => [...prev, nuevaAccion]);

    // Marcar como usado
    if (equipo === "local") {
      setTiemposMuertosLocal((prev) => ({ ...prev, [parte]: true }));
    } else {
      setTiemposMuertosVisitante((prev) => ({ ...prev, [parte]: true }));
    }

    // Iniciar contador de tiempo muerto (1 minuto)
    setTiempoMuertoActivo(true);
    setContadorTiempoMuerto({
      segundosRestantes: 60,
      timestampInicio: Date.now(),
    });

    console.log(
      `⏸️ Tiempo muerto registrado para ${equipo} en minuto ${minutoPartido}`
    );
  };

  const deshacer = () => {
    if (historialAcciones.length === 0) return;

    const ultimaAccion = historialAcciones[historialAcciones.length - 1];
    setHistorialAcciones((prev) => prev.slice(0, -1));

    setEstadisticas((prev) => {
      const stats = { ...prev };
      const jugadorId = ultimaAccion.jugadorId;
      const accion = ultimaAccion.accion;

      if (stats[jugadorId]) {
        stats[jugadorId] = {
          ...stats[jugadorId],
          goles: Math.max(
            0,
            (stats[jugadorId].goles || 0) - (accion === "gol" ? 1 : 0)
          ),
          asistencias: Math.max(
            0,
            (stats[jugadorId].asistencias || 0) -
              (accion === "asistencia" ? 1 : 0)
          ),
          paradas: Math.max(
            0,
            (stats[jugadorId].paradas || 0) - (accion === "parada" ? 1 : 0)
          ),
          faltas: Math.max(
            0,
            (stats[jugadorId].faltas || 0) - (accion === "falta" ? 1 : 0)
          ),
          amarillas: Math.max(
            0,
            (stats[jugadorId].amarillas || 0) - (accion === "amarilla" ? 1 : 0)
          ),
          rojas: Math.max(
            0,
            (stats[jugadorId].rojas || 0) - (accion === "roja" ? 1 : 0)
          ),
        };
      }

      return stats;
    });

    // Decrementar goles según el equipo
    if (ultimaAccion.accion === "gol") {
      if (ultimaAccion.equipo === "visitante") {
        setGolesVisitante((prev) => Math.max(0, prev - 1));
      } else {
        setGolesLocal((prev) => Math.max(0, prev - 1));
      }
    }

    // Decrementar faltas según el equipo y período
    if (ultimaAccion.accion === "falta") {
      const periodoFalta = ultimaAccion.periodo || 1; // Default al período 1 si no existe

      if (ultimaAccion.equipo === "visitante") {
        if (periodoFalta === 1) {
          setFaltasVisitantePrimera((prev) => Math.max(0, prev - 1));
        } else {
          setFaltasVisitanteSegunda((prev) => Math.max(0, prev - 1));
        }
      } else {
        if (periodoFalta === 1) {
          setFaltasLocalPrimera((prev) => Math.max(0, prev - 1));
        } else {
          setFaltasLocalSegunda((prev) => Math.max(0, prev - 1));
        }
      }
    }

    // Deshacer tiempo muerto
    if (ultimaAccion.accion === "tiempo_muerto") {
      const periodoTM = ultimaAccion.periodo || 1;
      const parte = periodoTM === 1 ? "primera" : "segunda";

      if (ultimaAccion.equipo === "local") {
        setTiemposMuertosLocal((prev) => ({ ...prev, [parte]: false }));
      } else {
        setTiemposMuertosVisitante((prev) => ({ ...prev, [parte]: false }));
      }
    }

    console.log("Acción deshecha:", ultimaAccion);
  };

  const actualizarDorsalVisitanteLegacy = (numeroOriginal, nuevoValor) => {
    if (!partidoId) {
      console.warn("No hay partidoId disponible para guardar dorsales");
      return;
    }

    const nuevoDorsal = nuevoValor.trim();
    const nuevosDorsales = { ...dorsalesVisitantes };

    if (nuevoDorsal === "" || nuevoDorsal === numeroOriginal.toString()) {
      // Si está vacío o es el número original, eliminar la personalización
      delete nuevosDorsales[numeroOriginal];
    } else {
      // Guardar el nuevo dorsal
      nuevosDorsales[numeroOriginal] = nuevoDorsal;
    }

    setDorsalesVisitantes(nuevosDorsales);
    const claveLocalStorage = `dorsalesVisitantes_partido_${partidoId}`;
    localStorage.setItem(claveLocalStorage, JSON.stringify(nuevosDorsales));
    setEditandoDorsal(null);
  };

  const obtenerDorsalVisitante = (numero) => {
    return dorsalesVisitantes[numero] || numero;
  };

  const limpiarDorsalesVisitantes = () => {
    if (!partidoId) {
      console.warn("No hay partidoId disponible");
      return;
    }

    setDorsalesVisitantes({});
    const claveLocalStorage = `dorsalesVisitantes_partido_${partidoId}`;
    localStorage.removeItem(claveLocalStorage);
  };

  const toggleJugadorVisitante = (numero) => {
    if (estadoPartido !== "configuracion") return;
    setJugadoresVisitantesActivos((prev) => ({
      ...prev,
      [numero]: !prev[numero],
    }));
  };

  const crearNuevoPartido = () => {
    // Generar nuevo ID de partido
    const nuevoPartidoId = `partido_${Date.now()}`;
    localStorage.setItem("partidoActualId", nuevoPartidoId);
    setPartidoId(nuevoPartidoId);

    // Limpiar estado del partido anterior
    setDorsalesVisitantes({});
    setJugadoresAsignados({});
    setEstadisticas({});
    setHistorialAcciones([]);
    setGolesLocal(0);
    setGolesVisitante(0);
    setFaltasLocal(0);
    setFaltasVisitante(0);
    setCronometroActivo(false);
    setTiemposEntrada({});
    setJugadoresVisitantesActivos(
      Object.fromEntries([...Array(12)].map((_, i) => [i + 1, true]))
    );

    console.log("Nuevo partido creado:", nuevoPartidoId);

    // Recargar la página para limpiar completamente el estado
    window.location.reload();
  };

  const cambiarOrden = (columna) => {
    if (ordenColumna === columna) {
      setOrdenAscendente(!ordenAscendente);
    } else {
      setOrdenColumna(columna);
      setOrdenAscendente(false);
    }
  };

  const obtenerJugadoresOrdenados = () => {
    const jugadoresConStats = jugadores.map((jugador) => ({
      ...jugador,
      stats: estadisticas[jugador.id] || {
        goles: 0,
        faltas: 0,
        amarillas: 0,
        rojas: 0,
        minutos: 0,
      },
    }));

    return jugadoresConStats.sort((a, b) => {
      let valorA, valorB;

      switch (ordenColumna) {
        case "dorsal":
          valorA = a.numero_dorsal;
          valorB = b.numero_dorsal;
          break;
        case "alias":
          valorA = (a.alias || a.nombre).toLowerCase();
          valorB = (b.alias || b.nombre).toLowerCase();
          break;
        case "minutos":
          valorA = a.stats.minutos || 0;
          valorB = b.stats.minutos || 0;
          break;
        case "goles":
          valorA = a.stats.goles || 0;
          valorB = b.stats.goles || 0;
          break;
        case "faltas":
          valorA = a.stats.faltas || 0;
          valorB = b.stats.faltas || 0;
          break;
        case "amarillas":
          valorA = a.stats.amarillas || 0;
          valorB = b.stats.amarillas || 0;
          break;
        case "rojas":
          valorA = a.stats.rojas || 0;
          valorB = b.stats.rojas || 0;
          break;
        default:
          valorA = a.stats.minutos || 0;
          valorB = b.stats.minutos || 0;
      }

      if (ordenAscendente) {
        return valorA > valorB ? 1 : valorA < valorB ? -1 : 0;
      } else {
        return valorA < valorB ? 1 : valorA > valorB ? -1 : 0;
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const cargarDatos = async () => {
    try {
      // Usar el partidoId de la URL si existe, sino generar uno temporal
      let idPartidoActual;
      if (partidoIdParam) {
        // Viene de la URL (partido real de BD)
        idPartidoActual = partidoIdParam;

        // 1. Verificar si hay datos en localStorage para este partido específico
        const datosLocalStorage =
          verificarDatosLocalStorageLegacy(idPartidoActual);

        if (datosLocalStorage) {
          // Hay datos en localStorage, preguntar si quiere cargarlos
          setDatosLocalStoragePartido(datosLocalStorage);
          setPartidoId(idPartidoActual);
          setMostrarDialogoLocalStorage(true);
          setLoading(false);
          return; // Esperar decisión del usuario
        }

        // 2. Si no hay datos en localStorage, verificar si el partido ya tiene datos guardados en BD
        const partidoTieneDatos = await verificarPartidoEnBD(idPartidoActual);

        if (partidoTieneDatos) {
          // El partido ya tiene datos en BD, preguntar si quiere resetear
          setPartidoId(idPartidoActual);
          setMostrarDialogoResetPartido(true);
          setLoading(false);
          return; // Esperar decisión del usuario
        }

        // 3. Si no hay datos ni en localStorage ni en BD, cargar normalmente
        await cargarDatosPartido(idPartidoActual);
      } else {
        // Modo libre sin partido específico (mantener funcionalidad actual)
        idPartidoActual = localStorage.getItem("partidoActualId");
        if (!idPartidoActual) {
          idPartidoActual = `partido_${Date.now()}`;
          localStorage.setItem("partidoActualId", idPartidoActual);
        }

        await cargarDatosPartido(idPartidoActual);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      setLoading(false);
    }
  };

  // Función para verificar si hay datos en localStorage para un partido específico
  const verificarDatosLocalStorageLegacy = (idPartido) => {
    try {
      const claves = [
        `jugadoresAsignados_partido_${idPartido}`,
        `estadisticas_partido_${idPartido}`,
        `historialAcciones_partido_${idPartido}`,
        `cronometro_partido_${idPartido}`,
        `estadoPartido_partido_${idPartido}`,
        `tiemposMuertosLocal_partido_${idPartido}`,
        `tiemposMuertosVisitante_partido_${idPartido}`,
        `jugadoresVisitantesActivos_partido_${idPartido}`,
        `tiemposEntrada_partido_${idPartido}`,
        `tiemposSalida_partido_${idPartido}`,
      ];

      const datosEncontrados = {};
      let hayDatos = false;

      claves.forEach((clave) => {
        const valor = localStorage.getItem(clave);
        if (valor) {
          try {
            datosEncontrados[clave] = JSON.parse(valor);
            hayDatos = true;
          } catch (e) {
            datosEncontrados[clave] = valor;
          }
        }
      });

      return hayDatos ? datosEncontrados : null;
    } catch (error) {
      console.error("Error verificando localStorage:", error);
      return null;
    }
  };

  // Función para verificar si el partido ya tiene datos en BD
  const verificarPartidoEnBD = async (idPartido) => {
    try {
      const response = await partidos.obtenerEstadisticas(idPartido);
      // Si obtiene estadísticas sin error, significa que el partido ya fue finalizado/tiene datos
      return response.data ? true : false;
    } catch (error) {
      // Si da error 404, significa que no tiene estadísticas aún
      if (error.response?.status === 404) {
        return false;
      }
      console.error("Error verificando partido en BD:", error);
      return false;
    }
  };

  // Función para cargar datos del partido (separada para reutilizar)
  const cargarDatosPartido = async (
    idPartidoActual,
    reiniciarEstado = true
  ) => {
    try {
      // Reiniciar todos los estados al cargar un partido sin datos guardados
      // Solo si reiniciarEstado es true (por defecto)
      if (reiniciarEstado) {
        setJugadoresAsignados({});
        setEstadisticas({});
        setHistorialAcciones([]);
        setTiempoCronometro(0);
        setContadoresJugadores({});
        setEstadoPartido("configuracion");
        setPeriodoActual(1);
        setGolesLocal(0);
        setGolesVisitante(0);
        setFaltasLocalPrimera(0);
        setFaltasLocalSegunda(0);
        setFaltasVisitantePrimera(0);
        setFaltasVisitanteSegunda(0);
        setDorsalesVisitantes({});
        setTiemposEntrada({});
        setTiemposSalida({});
        setTiemposMuertosLocal({ primera: false, segunda: false });
        setTiemposMuertosVisitante({ primera: false, segunda: false });
        setJugadoresVisitantesActivos(
          Object.fromEntries([...Array(12)].map((_, i) => [i + 1, true]))
        );
        setCronometroActivo(false);
        setTimestampInicioCronometro(null);
      }

      if (partidoIdParam) {
        // Viene de la URL (partido real de BD)
        idPartidoActual = partidoIdParam;

        // Cargar información del partido
        const responsePartido = await partidos.obtener(partidoIdParam);
        const partido = responsePartido.data.partido || responsePartido.data;

        console.log(
          "📊 [ConfigurarPartido] Respuesta completa del backend:",
          responsePartido.data
        );
        console.log("📊 [ConfigurarPartido] Partido cargado:", partido);
        console.log("👥 [ConfigurarPartido] Asistencias:", partido.asistencias);
        console.log(
          "🔢 [ConfigurarPartido] Cantidad de asistencias:",
          partido.asistencias?.length
        );

        setPartidoInfo(partido);

        // Cargar solo jugadores/staff confirmados para este partido
        const asistentes = partido.asistencias || [];

        // DEBUG: Ver estructura de la primera asistencia
        if (asistentes.length > 0) {
          console.log(
            "🔍 [ConfigurarPartido] Estructura de primera asistencia:",
            asistentes[0]
          );
          console.log(
            "🔍 [ConfigurarPartido] Claves disponibles:",
            Object.keys(asistentes[0])
          );
        }

        // Filtrar jugadores confirmados con dorsal
        const jugadoresConfirmados = asistentes
          .filter(
            (a) =>
              a.estado === "confirmado" &&
              a.dorsal !== null &&
              a.dorsal !== undefined &&
              a.posicion !== "Staff" &&
              a.posicion !== "Extra"
          )
          .map((a) => ({
            id: a.jugador_id,
            nombre: a.jugador_nombre,
            numero_dorsal: a.dorsal,
            posicion: a.posicion,
            abreviatura: a.abreviatura,
            color: a.color,
            alias: a.alias,
            email: a.jugador_email,
          }))
          .sort((a, b) => a.numero_dorsal - b.numero_dorsal);

        console.log(
          "⚽ Jugadores confirmados filtrados:",
          jugadoresConfirmados
        );

        // Filtrar staff confirmado
        const staffConfirmado = asistentes
          .filter((a) => a.estado === "confirmado" && a.posicion === "Staff")
          .map((a) => ({
            id: a.jugador_id,
            nombre: a.jugador_nombre,
            posicion: a.posicion,
            abreviatura: a.abreviatura,
            color: a.color,
            alias: a.alias,
          }));

        console.log("👔 Staff confirmado:", staffConfirmado);

        const staffOrganizado = {
          ENT: staffConfirmado.filter((s) => s.nombre.includes("Entrenador")),
          DEL: staffConfirmado.filter((s) => s.nombre.includes("Delegado")),
          AUX: staffConfirmado.filter((s) => s.nombre.includes("Auxiliar")),
          MAT: staffConfirmado.filter((s) => s.nombre.includes("Material")),
        };

        setJugadores(jugadoresConfirmados);
        setStaff(staffOrganizado);
      } else {
        // Modo libre sin partido específico (mantener funcionalidad actual)
        idPartidoActual = localStorage.getItem("partidoActualId");
        if (!idPartidoActual) {
          idPartidoActual = `partido_${Date.now()}`;
          localStorage.setItem("partidoActualId", idPartidoActual);
        }

        // Cargar todos los jugadores como antes
        const response = await auth.listarJugadores();
        const usuarios = Array.isArray(response.data)
          ? response.data
          : response.data.jugadores || [];

        const jugadoresConDorsal = usuarios
          .filter(
            (u) => u.numeroDorsal !== null && u.numeroDorsal !== undefined
          )
          .map((u) => ({
            id: u.usuarioId || u.id,
            nombre: u.nombre,
            numero_dorsal: u.numeroDorsal,
            posicion: u.posicion,
            abreviatura: u.abreviatura,
            color: u.color,
            alias: u.alias,
            email: u.email,
          }))
          .sort((a, b) => a.numero_dorsal - b.numero_dorsal);

        const staffUsuarios = usuarios.filter(
          (u) => u.posicion === "Staff" || u.abreviatura === "S"
        );

        const staffOrganizado = {
          ENT: staffUsuarios.filter((s) => s.nombre.includes("Entrenador")),
          DEL: staffUsuarios.filter((s) => s.nombre.includes("Delegado")),
          AUX: staffUsuarios.filter((s) => s.nombre.includes("Auxiliar")),
          MAT: staffUsuarios.filter((s) => s.nombre.includes("Material")),
        };

        setJugadores(jugadoresConDorsal);
        setStaff(staffOrganizado);
      }

      setPartidoId(idPartidoActual);
    } catch (error) {
      console.error("Error cargando datos del partido:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar datos desde localStorage
  const cargarDesdeLocalStorageLegacy = () => {
    if (!datosLocalStoragePartido) return;

    try {
      // Cargar jugadores asignados
      if (datosLocalStoragePartido[`jugadoresAsignados_partido_${partidoId}`]) {
        setJugadoresAsignados(
          datosLocalStoragePartido[`jugadoresAsignados_partido_${partidoId}`]
        );
      }

      // Cargar estadísticas
      if (datosLocalStoragePartido[`estadisticas_partido_${partidoId}`]) {
        setEstadisticas(
          datosLocalStoragePartido[`estadisticas_partido_${partidoId}`]
        );
      }

      // Cargar historial de acciones
      if (datosLocalStoragePartido[`historialAcciones_partido_${partidoId}`]) {
        setHistorialAcciones(
          datosLocalStoragePartido[`historialAcciones_partido_${partidoId}`]
        );
      }

      // Cargar estado del cronómetro
      if (datosLocalStoragePartido[`cronometro_partido_${partidoId}`]) {
        const cronometroData =
          datosLocalStoragePartido[`cronometro_partido_${partidoId}`];
        setTiempoCronometro(cronometroData.tiempoCronometro || 0);
        setContadoresJugadores(cronometroData.contadoresJugadores || {});
      }

      // Cargar estado del partido
      if (datosLocalStoragePartido[`estadoPartido_partido_${partidoId}`]) {
        const estadoData =
          datosLocalStoragePartido[`estadoPartido_partido_${partidoId}`];
        setEstadoPartido(estadoData.estadoPartido || "configuracion");
        setPeriodoActual(estadoData.periodoActual || 1);
        setGolesLocal(estadoData.golesLocal || 0);
        setGolesVisitante(estadoData.golesVisitante || 0);
        setFaltasLocalPrimera(estadoData.faltasLocalPrimera || 0);
        setFaltasLocalSegunda(estadoData.faltasLocalSegunda || 0);
        setFaltasVisitantePrimera(estadoData.faltasVisitantePrimera || 0);
        setFaltasVisitanteSegunda(estadoData.faltasVisitanteSegunda || 0);
      }

      // Cargar tiempos muertos
      if (
        datosLocalStoragePartido[`tiemposMuertosLocal_partido_${partidoId}`]
      ) {
        setTiemposMuertosLocal(
          datosLocalStoragePartido[`tiemposMuertosLocal_partido_${partidoId}`]
        );
      }
      if (
        datosLocalStoragePartido[`tiemposMuertosVisitante_partido_${partidoId}`]
      ) {
        setTiemposMuertosVisitante(
          datosLocalStoragePartido[
            `tiemposMuertosVisitante_partido_${partidoId}`
          ]
        );
      }

      // Cargar jugadores visitantes activos
      if (
        datosLocalStoragePartido[
          `jugadoresVisitantesActivos_partido_${partidoId}`
        ]
      ) {
        setJugadoresVisitantesActivos(
          datosLocalStoragePartido[
            `jugadoresVisitantesActivos_partido_${partidoId}`
          ]
        );
      }

      // Cargar tiempos de entrada
      if (datosLocalStoragePartido[`tiemposEntrada_partido_${partidoId}`]) {
        setTiemposEntrada(
          datosLocalStoragePartido[`tiemposEntrada_partido_${partidoId}`]
        );
      }

      // Cargar tiempos de salida
      if (datosLocalStoragePartido[`tiemposSalida_partido_${partidoId}`]) {
        setTiemposSalida(
          datosLocalStoragePartido[`tiemposSalida_partido_${partidoId}`]
        );
      }

      setMostrarDialogoLocalStorage(false);

      // Cargar datos del partido sin reiniciar estado (ya cargamos desde localStorage)
      cargarDatosPartido(partidoId, false);

      setModalAlerta({
        visible: true,
        titulo: "Datos Cargados",
        mensaje: "Datos cargados correctamente desde localStorage",
        tipo: "success",
      });
    } catch (error) {
      console.error("Error cargando desde localStorage:", error);
      setModalAlerta({
        visible: true,
        titulo: "Error al Cargar",
        mensaje: "Error al cargar datos. Se iniciará un partido nuevo.",
        tipo: "error",
      });
      limpiarLocalStoragePartidoLegacy();
      cargarDatosPartido(partidoId);
    }
  };

  // Función para limpiar localStorage de un partido específico
  const limpiarLocalStoragePartidoLegacy = () => {
    if (!partidoId) return;

    const claves = [
      `jugadoresAsignados_partido_${partidoId}`,
      `estadisticas_partido_${partidoId}`,
      `historialAcciones_partido_${partidoId}`,
      `cronometro_partido_${partidoId}`,
      `estadoPartido_partido_${partidoId}`,
      `dorsalesVisitantes_partido_${partidoId}`,
      `tiemposEntrada_partido_${partidoId}`,
      `tiemposSalida_partido_${partidoId}`,
      `tiemposMuertosLocal_partido_${partidoId}`,
      `tiemposMuertosVisitante_partido_${partidoId}`,
      `jugadoresVisitantesActivos_partido_${partidoId}`,
    ];

    claves.forEach((clave) => {
      localStorage.removeItem(clave);
    });

    console.log(`🗑️ localStorage limpiado para partido ${partidoId}`);
  };

  // Función para resetear partido (limpiar BD si es necesario)
  const resetearPartido = async () => {
    try {
      limpiarLocalStoragePartidoLegacy();
      setMostrarDialogoResetPartido(false);

      // Recargar la página para limpiar completamente el estado
      window.location.reload();
    } catch (error) {
      console.error("Error reseteando partido:", error);
      setModalAlerta({
        visible: true,
        titulo: "Error",
        mensaje: "Error al resetear el partido",
        tipo: "error",
      });
    }
  };

  // Función para mostrar todos los datos de localStorage del partido actual
  const mostrarDatosLocalStorage = () => {
    if (!partidoId) {
      setModalAlerta({
        visible: true,
        titulo: "Sin Partido Activo",
        mensaje: "No hay un partido activo",
        tipo: "error",
      });
      return;
    }

    const datos = verificarDatosLocalStorageLegacy(partidoId);
    setDatosLocalStoragePartido(datos);
    setMostrarVisorLocalStorage(true);
  };

  // Función para iniciar el partido (después de configurar titulares)
  const iniciarPartido = () => {
    const jugadoresEnPista = Object.keys(jugadoresAsignados).length;
    if (jugadoresEnPista !== 5) {
      setJugadoresEnPistaCount(jugadoresEnPista);
      setMostrarDialogoValidacionJugadores(true);
      return;
    }

    // Validar dorsales visitantes modificados
    const jugadoresActivosCount = Object.values(
      jugadoresVisitantesActivos
    ).filter(Boolean).length;
    const dorsalesModificadosCount = Object.keys(dorsalesVisitantes).length;

    if (dorsalesModificadosCount < jugadoresActivosCount) {
      // Mostrar alerta si faltan dorsales por modificar
      setModalAlerta({
        visible: true,
        titulo: "Dorsales Visitantes Incompletos",
        mensaje: `Se han modificado ${dorsalesModificadosCount} jugadores de un total de ${jugadoresActivosCount} activos. ¿Deseas continuar de todos modos?`,
        tipo: "warning",
        onConfirm: () => {
          setModalAlerta({ visible: false });
          setMostrarDialogoIniciarPartido(true);
        },
        onCancel: () => {
          setModalAlerta({ visible: false });
        },
      });
      return;
    }

    // Mostrar modal de confirmación
    setMostrarDialogoIniciarPartido(true);
  };

  // Función para finalizar primera parte
  const finalizarPrimeraParte = () => {
    setModalFinalizarPrimera(true);
  };

  // Confirmar finalización de primera parte
  const confirmarFinalizarPrimera = () => {
    setModalFinalizarPrimera(false);
    setEstadoPartido("descanso");
    setCronometroActivo(false);
    // Resetear tiempos muertos para la segunda parte
    setTiemposMuertosLocal({
      primera: tiemposMuertosLocal.primera,
      segunda: false,
    });
    setTiemposMuertosVisitante({
      primera: tiemposMuertosVisitante.primera,
      segunda: false,
    });
    // Las faltas del primer período ya están guardadas en faltasLocalPrimera y faltasVisitantePrimera
  };

  // Función para iniciar segunda parte
  const iniciarSegundaParte = () => {
    setModalIniciarSegunda(true);
  };

  // Confirmar inicio de segunda parte
  const confirmarIniciarSegunda = () => {
    setModalIniciarSegunda(false);
    setEstadoPartido("segunda_parte");
    setPeriodoActual(2);
    setTiempoCronometro(0);
    setTimestampInicioCronometro(Date.now());
    setCronometroActivo(true);
  };

  // Función para finalizar partido desde el Marcador (segunda parte)
  const finalizarPartidoDesdeSegundaParte = () => {
    handleFinalizarPartido();
  };

  // Función para finalizar partido excepcional (con motivo)
  const finalizarPartidoExcepcional = () => {
    setModalFinalizarExcepcional({ visible: true, motivo: "" });
  };

  // Confirmar finalización excepcional con motivo
  const confirmarFinalizarExcepcional = () => {
    const motivo = modalFinalizarExcepcional.motivo;

    if (!motivo || motivo.trim() === "") {
      setModalAlerta({
        visible: true,
        titulo: "Motivo Requerido",
        mensaje:
          "Debe proporcionar un motivo para finalizar el partido de forma excepcional.",
        tipo: "error",
      });
      return;
    }

    setModalFinalizarExcepcional({ visible: false, motivo: "" });

    // Registrar el motivo en el historial
    const accionMotivo = {
      id: Date.now(),
      tipo: "observacion",
      descripcion: `FINALIZACIÓN EXCEPCIONAL: ${motivo.trim()}`,
      timestamp: Date.now(),
      minuto: Math.floor(tiempoCronometro / 60),
      periodo: periodoActual,
    };

    setHistorialAcciones((prev) => [...prev, accionMotivo]);

    // Continuar con la finalización normal
    handleFinalizarPartido();
  };

  // Funciones de confirmación temporal (5 segundos)
  const solicitarConfirmacion = (tipo, data) => {
    setConfirmacionPendiente({
      tipo,
      data,
      timestamp: Date.now(),
    });
  };

  const confirmarAccion = () => {
    if (!confirmacionPendiente) return;

    const { tipo, data } = confirmacionPendiente;

    switch (tipo) {
      case "toggle_cronometro":
        setCronometroActivo(data.nuevoEstado);
        break;
      case "incrementar_gol_local":
        setGolesLocal((prev) => prev + 1);
        break;
      case "decrementar_gol_local":
        setGolesLocal((prev) => Math.max(0, prev - 1));
        break;
      case "incrementar_gol_visitante":
        setGolesVisitante((prev) => prev + 1);
        break;
      case "decrementar_gol_visitante":
        setGolesVisitante((prev) => Math.max(0, prev - 1));
        break;
      case "resetear_cronometro":
        if (estadoPartido !== "configuracion") {
          setTiempoCronometro(0);
          setTimestampInicioCronometro(null);
          setTiemposEntrada({});
          setTiemposSalida({});
          setCronometroActivo(false);
        }
        break;
    }

    setConfirmacionPendiente(null);
    setTiempoRestanteConfirmacion(0);
  };

  const cancelarConfirmacion = () => {
    setConfirmacionPendiente(null);
    setTiempoRestanteConfirmacion(0);
  };

  // Funciones wrapper para incrementar/decrementar goles con confirmación
  const handleIncrementarGolLocal = () => {
    if (estadoPartido === "configuracion") return;
    solicitarConfirmacion("incrementar_gol_local", {});
  };

  const handleDecrementarGolLocal = () => {
    if (estadoPartido === "configuracion" || golesLocal === 0) return;
    solicitarConfirmacion("decrementar_gol_local", {});
  };

  const handleIncrementarGolVisitante = () => {
    if (estadoPartido === "configuracion") return;
    solicitarConfirmacion("incrementar_gol_visitante", {});
  };

  const handleDecrementarGolVisitante = () => {
    if (estadoPartido === "configuracion" || golesVisitante === 0) return;
    solicitarConfirmacion("decrementar_gol_visitante", {});
  };

  // Modificar la función de toggle cronómetro para usar confirmación
  const handleToggleCronometro = () => {
    if (estadoPartido === "configuracion") {
      return; // No permitir en estado de configuración
    }

    solicitarConfirmacion("toggle_cronometro", {
      nuevoEstado: !cronometroActivo,
    });
  };

  // Función para preparar y enviar todas las estadísticas al finalizar el partido
  const handleFinalizarPartido = async () => {
    if (!partidoId) {
      setModalAlerta({
        visible: true,
        titulo: "Sin Partido Activo",
        mensaje: "No hay un partido activo para finalizar",
        tipo: "error",
      });
      return;
    }

    // Validar que haya datos mínimos - mostrar modal si no hay datos
    if (
      historialAcciones.length === 0 &&
      golesLocal === 0 &&
      golesVisitante === 0
    ) {
      setModalFinalizarPartido(true);
      return;
    }

    // Si hay datos, finalizar directamente
    await ejecutarFinalizacionPartido();
  };

  // Función que ejecuta la finalización del partido
  const ejecutarFinalizacionPartido = async () => {
    try {
      // 1. Preparar estadísticas generales del partido
      const estadisticasPartido = {
        golesLocal,
        golesVisitante,
        faltasLocal: faltasLocalPrimera + faltasLocalSegunda,
        faltasVisitante: faltasVisitantePrimera + faltasVisitanteSegunda,
        faltasLocalPrimera,
        faltasLocalSegunda,
        faltasVisitantePrimera,
        faltasVisitanteSegunda,
        dorsalesVisitantes: Array.from(dorsalesVisitantes),
        duracionMinutos: Math.floor(tiempoCronometro / 60), // Convertir segundos a minutos
      };

      // 2. Preparar estadísticas de jugadores
      const estadisticasJugadores = jugadores.map((jugador) => {
        const stats = estadisticas[jugador.id] || {};
        const minutosJugados = Math.floor(stats.minutos || 0); // Convertir a entero (segundos)

        return {
          jugadorId: jugador.usuario_id || jugador.id,
          posicion: jugador.posicion || null,
          minutosJugados, // Enviar en segundos como entero
          goles: stats.goles || 0,
          asistencias: stats.asistencias || 0,
          tarjetasAmarillas: stats.amarillas || 0,
          tarjetasRojas: stats.rojas || 0,
          paradas: stats.paradas || 0,
          golesRecibidos: stats.goles_recibidos || 0,
        };
      });

      // 3. Preparar staff (con tarjetas si las tienen)
      const staffConTarjetas = [
        {
          nombre: "Entrenador",
          tipo: "entrenador",
          equipo: "local",
          tarjetasAmarillas: estadisticas["staff-E"]?.amarillas || 0,
          tarjetasRojas: estadisticas["staff-E"]?.rojas || 0,
        },
        {
          nombre: "Delegado",
          tipo: "delegado",
          equipo: "local",
          tarjetasAmarillas: estadisticas["staff-D"]?.amarillas || 0,
          tarjetasRojas: estadisticas["staff-D"]?.rojas || 0,
        },
        {
          nombre: "Ayudante",
          tipo: "ayudante",
          equipo: "local",
          tarjetasAmarillas: estadisticas["staff-A"]?.amarillas || 0,
          tarjetasRojas: estadisticas["staff-A"]?.rojas || 0,
        },
        {
          nombre: "Entrenador Visitante",
          tipo: "entrenador",
          equipo: "visitante",
          tarjetasAmarillas: estadisticas["staff-visitante-E"]?.amarillas || 0,
          tarjetasRojas: estadisticas["staff-visitante-E"]?.rojas || 0,
        },
        {
          nombre: "Delegado Visitante",
          tipo: "delegado",
          equipo: "visitante",
          tarjetasAmarillas: estadisticas["staff-visitante-D"]?.amarillas || 0,
          tarjetasRojas: estadisticas["staff-visitante-D"]?.rojas || 0,
        },
        {
          nombre: "Ayudante Visitante",
          tipo: "ayudante",
          equipo: "visitante",
          tarjetasAmarillas: estadisticas["staff-visitante-A"]?.amarillas || 0,
          tarjetasRojas: estadisticas["staff-visitante-A"]?.rojas || 0,
        },
      ]; // Enviar todo el staff, con o sin tarjetas

      // 4. Preparar historial de acciones con orden
      const historialConOrden = historialAcciones.map((accion, index) => ({
        ...accion,
        ordenAccion: index + 1,
      }));

      // 5. Preparar tiempos de juego
      const tiemposJuego = jugadores
        .filter((jugador) => estadisticas[jugador.id]?.minutos > 0)
        .map((jugador) => {
          const stats = estadisticas[jugador.id] || {};
          return {
            jugadorId: jugador.usuario_id || jugador.id,
            minutoEntrada: 0, // Se puede calcular del historial si es necesario
            minutoSalida: null,
            posicion: jugador.posicion || null,
            duracionSegundos: Math.floor(stats.minutos || 0), // Enviar en segundos como entero
          };
        });

      // 6. Preparar el payload completo
      const payload = {
        estadisticas: estadisticasPartido,
        jugadores: estadisticasJugadores,
        staff: staffConTarjetas,
        historialAcciones: historialConOrden,
        tiemposJuego,
      };

      console.log("📊 Enviando datos para finalizar partido:", payload);
      console.log(
        "📋 Historial con minutos:",
        historialConOrden.map((a) => ({
          accion: a.accion,
          minuto_partido: a.minuto_partido,
          jugador: a.jugadorNombre,
          orden: a.ordenAccion,
        }))
      );

      // 7. Enviar al backend
      const response = await partidos.finalizarPartido(partidoId, payload);

      console.log("✅ Respuesta del servidor:", response.data);

      // 8. Limpiar localStorage
      localStorage.removeItem("estadisticasPartido");
      localStorage.removeItem("historialAcciones");
      localStorage.removeItem("tiemposEntrada");

      // 9. Mostrar mensaje de éxito
      setModalAlerta({
        visible: true,
        titulo: "Partido Finalizado",
        mensaje: `¡Partido finalizado exitosamente!\n\nResultado: ${golesLocal} - ${golesVisitante}\n\nLas estadísticas se han guardado correctamente.`,
        tipo: "success",
      });

      // 10. Redirigir al dashboard después de cerrar el modal
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("❌ Error al finalizar partido:", error);
      setModalAlerta({
        visible: true,
        titulo: "Error al Finalizar",
        mensaje: `Error al finalizar el partido: ${
          error.response?.data?.error || error.message
        }`,
        tipo: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Marcador */}
        <Marcador
          equipoLocal="FS CÚPULA-CUESTA"
          equipoVisitante={partidoInfo?.rival || "VISITANTE"}
          onDeshacer={deshacer}
          deshabilitarDeshacer={historialAcciones.length === 0}
          golesLocal={golesLocal}
          golesVisitante={golesVisitante}
          faltasLocal={faltasLocal}
          faltasVisitante={faltasVisitante}
          onIncrementarGolLocal={handleIncrementarGolLocal}
          onDecrementarGolLocal={handleDecrementarGolLocal}
          onIncrementarGolVisitante={handleIncrementarGolVisitante}
          onDecrementarGolVisitante={handleDecrementarGolVisitante}
          onCronometroChange={handleToggleCronometro}
          cronometroActivo={cronometroActivo}
          tiempoCronometro={tiempoCronometro}
          timestampInicioCronometro={timestampInicioCronometro}
          estadoPartido={estadoPartido}
          flashEffect={flashEffect}
          jugadoresLocal={jugadores}
          jugadoresAsignados={jugadoresAsignados}
          estadisticas={estadisticas}
          onIniciarPartido={iniciarPartido}
          onFinalizarPrimeraParte={finalizarPrimeraParte}
          onIniciarSegundaParte={iniciarSegundaParte}
          onFinalizarPartido={finalizarPartidoDesdeSegundaParte}
          onTiempoMuertoLocal={() => registrarTiempoMuertoLegacy("local")}
          onTiempoMuertoVisitante={() =>
            registrarTiempoMuertoLegacy("visitante")
          }
          tiemposMuertosLocal={tiemposMuertosLocal}
          tiemposMuertosVisitante={tiemposMuertosVisitante}
          periodoActual={periodoActual}
          tiempoMuertoActivo={tiempoMuertoActivo}
          contadorTiempoMuerto={contadorTiempoMuerto}
        />

        {/* Animación de Tarjeta/Gol Espectacular */}
        <AnimacionTarjeta mostrarTarjeta={mostrarTarjeta} />

        {/* Contenedor principal con pista y jugadores */}
        <div className="bg-white rounded-lg shadow-md p-6 relative">
          <div className="flex gap-4 items-start">
            {/* Jugadores Locales - Usando Componente */}
            <PanelJugadoresLocales
              jugadores={jugadores}
              isJugadorAsignado={isJugadorAsignado}
              estadisticas={estadisticas}
              accionActiva={accionActiva}
              posicionSeleccionada={posicionSeleccionada}
              flashEffect={{ jugadorId: null, type: null }}
              handleDragStart={handleDragStart}
              handleDropFueraPista={handleDropFueraPista}
              handleDragOverFueraPista={handleDragOverFueraPista}
              ejecutarAccion={ejecutarAccion}
              asignarJugadorAPosicionLocal={asignarJugadorAPosicionLocal}
            />

            {/* Pista de Fútbol Sala - Centro */}
            <div className="flex-1 flex flex-col gap-4">
              <PistaFutsal
                jugadores={[]}
                jugadoresAsignados={jugadoresAsignados}
                onDrop={handleDrop}
                onJugadorDragStart={handleDragStart}
                estadisticas={estadisticas}
                onPosicionClick={handlePosicionClick}
                posicionSeleccionada={posicionSeleccionada}
                onPosicionSeleccionar={handlePosicionSeleccionar}
                accionActiva={accionActiva}
                onJugadorClick={(jugador) => {
                  if (accionActiva) {
                    ejecutarAccion(jugador, accionActiva);
                  }
                }}
              />

              {/* Botones de acción debajo de la pista */}
              <BotonesAccion
                deshacer={deshacer}
                historialAcciones={historialAcciones}
                estadoPartido={estadoPartido}
                handleDragOver={handleDragOver}
                handleAccionDrop={handleAccionDrop}
                setPosicionSeleccionada={setPosicionSeleccionada}
                setAccionActiva={setAccionActiva}
                accionActiva={accionActiva}
              />
            </div>

            {/* Jugadores Visitantes - Derecha (3 columnas) */}
            <PanelJugadoresVisitantes
              handleDropFueraPista={handleDropFueraPista}
              handleDragOverFueraPista={handleDragOverFueraPista}
              estadisticas={estadisticas}
              accionActiva={accionActiva}
              handleDragStart={handleDragStart}
              ejecutarAccion={ejecutarAccion}
              editandoDorsal={editandoDorsal}
              setEditandoDorsal={setEditandoDorsal}
              obtenerDorsalVisitante={obtenerDorsalVisitante}
              jugadoresVisitantesActivos={jugadoresVisitantesActivos}
              estadoPartido={estadoPartido}
              toggleJugadorVisitante={toggleJugadorVisitante}
              dorsalesVisitantes={dorsalesVisitantes}
              actualizarDorsalVisitanteLegacy={actualizarDorsalVisitanteLegacy}
            />
          </div>
        </div>

        {/* Lista de jugadores con minutos jugados */}
        <TablaMinutosJugados
          jugadores={jugadores}
          estadisticas={estadisticas}
          isJugadorAsignado={isJugadorAsignado}
        />

        {/* Botones de Utilidades */}
        <BotonesUtilidades
          partidoId={partidoId}
          partidoInfo={partidoInfo}
          finalizarPartidoExcepcional={finalizarPartidoExcepcional}
          mostrarDatosLocalStorage={mostrarDatosLocalStorage}
          setModalVolverDashboard={setModalVolverDashboard}
          navigate={navigate}
        />

        {/* Modal de confirmación con countdown de 5 segundos */}
        <ModalConfirmacionCountdown
          confirmacionPendiente={confirmacionPendiente}
          tiempoRestanteConfirmacion={tiempoRestanteConfirmacion}
          cancelarConfirmacion={cancelarConfirmacion}
          confirmarAccion={confirmarAccion}
        />

        {/* Diálogos de inicialización y validación */}
        <DialogosPartido
          mostrarDialogoValidacionJugadores={mostrarDialogoValidacionJugadores}
          setMostrarDialogoValidacionJugadores={
            setMostrarDialogoValidacionJugadores
          }
          jugadoresEnPistaCount={jugadoresEnPistaCount}
          mostrarDialogoIniciarPartido={mostrarDialogoIniciarPartido}
          setMostrarDialogoIniciarPartido={setMostrarDialogoIniciarPartido}
          setEstadoPartido={setEstadoPartido}
          setPeriodoActual={setPeriodoActual}
          setCronometroActivo={setCronometroActivo}
          mostrarDialogoLocalStorage={mostrarDialogoLocalStorage}
          setMostrarDialogoLocalStorage={setMostrarDialogoLocalStorage}
          cargarDesdeLocalStorage={cargarDesdeLocalStorage}
          limpiarLocalStoragePartidoLegacy={limpiarLocalStoragePartidoLegacy}
          partidoIdParam={partidoIdParam}
          mostrarDialogoResetPartido={mostrarDialogoResetPartido}
          setMostrarDialogoResetPartido={setMostrarDialogoResetPartido}
          resetearPartido={resetearPartido}
          navigate={navigate}
        />

        {/* Visor de datos de localStorage */}
        <VisorLocalStorage
          visible={mostrarVisorLocalStorage}
          partidoId={partidoId}
          datosLocalStoragePartido={datosLocalStoragePartido}
          onClose={() => setMostrarVisorLocalStorage(false)}
          onCopiar={() => {
            navigator.clipboard.writeText(
              JSON.stringify(datosLocalStoragePartido, null, 2)
            );
            setModalAlerta({
              visible: true,
              titulo: "Copiado",
              mensaje: "Datos copiados al portapapeles",
              tipo: "success",
            });
          }}
        />

        {/* Modal: ALERTA JUGADORES FALTANTES (grande y llamativo) */}
        <ModalAlertaJugadoresFaltantes
          visible={alertaJugadoresFaltantes}
          onClose={() => setAlertaJugadoresFaltantes(false)}
        />

        {/* Modal: Alerta General (success, error, info, warning) */}
        <ModalAlertaGeneral
          modalAlerta={modalAlerta}
          setModalAlerta={setModalAlerta}
        />

        {/* Modales de Gestión del Partido */}
        <ModalesPartido
          modalTiempoMuerto={modalTiempoMuerto}
          setModalTiempoMuerto={setModalTiempoMuerto}
          confirmarTiempoMuerto={confirmarTiempoMuerto}
          periodoActual={periodoActual}
          partidoInfo={partidoInfo}
          modalFinalizarPrimera={modalFinalizarPrimera}
          setModalFinalizarPrimera={setModalFinalizarPrimera}
          confirmarFinalizarPrimera={confirmarFinalizarPrimera}
          golesLocal={golesLocal}
          golesVisitante={golesVisitante}
          faltasLocal={faltasLocal}
          faltasVisitante={faltasVisitante}
          modalIniciarSegunda={modalIniciarSegunda}
          setModalIniciarSegunda={setModalIniciarSegunda}
          confirmarIniciarSegunda={confirmarIniciarSegunda}
          modalFinalizarPartido={modalFinalizarPartido}
          setModalFinalizarPartido={setModalFinalizarPartido}
          ejecutarFinalizacionPartido={ejecutarFinalizacionPartido}
          modalFinalizarExcepcional={modalFinalizarExcepcional}
          setModalFinalizarExcepcional={setModalFinalizarExcepcional}
          confirmarFinalizarExcepcional={confirmarFinalizarExcepcional}
          modalVolverDashboard={modalVolverDashboard}
          setModalVolverDashboard={setModalVolverDashboard}
          navigate={navigate}
        />
      </div>
    </div>
  );
}

export default ConfigurarPartido;
