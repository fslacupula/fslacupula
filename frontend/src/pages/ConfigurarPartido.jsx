import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PistaFutsal from "../components/PistaFutsal";
import Marcador from "../components/Marcador";
import { partidos, auth } from "../services/api";
import { useAuthContext } from "@contexts";

function ConfigurarPartido() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const { partidoId: partidoIdParam } = useParams();
  const [jugadores, setJugadores] = useState([]);
  const [staff, setStaff] = useState({ ENT: [], DEL: [], AUX: [], MAT: [] });
  const [loading, setLoading] = useState(true);
  const [jugadoresAsignados, setJugadoresAsignados] = useState({});
  const [estadisticas, setEstadisticas] = useState({});
  const [historialAcciones, setHistorialAcciones] = useState([]);
  const [ordenColumna, setOrdenColumna] = useState("minutos");
  const [ordenAscendente, setOrdenAscendente] = useState(false);
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [faltasLocal, setFaltasLocal] = useState(0);
  const [faltasVisitante, setFaltasVisitante] = useState(0);
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [tiempoCronometro, setTiempoCronometro] = useState(0); // Tiempo acumulado del cronómetro en segundos
  const [timestampInicioCronometro, setTimestampInicioCronometro] =
    useState(null); // Timestamp de cuando se activó el cronómetro

  // Contadores independientes por jugador
  const [contadoresJugadores, setContadoresJugadores] = useState({}); // { jugadorId: { tiempoAcumulado: segundos, activo: boolean, timestampInicio: timestamp } }

  const [tiemposEntrada, setTiemposEntrada] = useState({}); // {jugadorId: timestampEnSegundos}
  const [tiemposSalida, setTiemposSalida] = useState({}); // {jugadorId: timestampEnSegundos de última salida}
  const [flashEffect, setFlashEffect] = useState({
    type: null,
    jugadorId: null,
    timestamp: null,
  });
  const [mostrarTarjeta, setMostrarTarjeta] = useState({
    visible: false,
    tipo: null, // "amarilla", "roja", o "gol"
    dorsal: null,
  });
  const [dorsalesVisitantes, setDorsalesVisitantes] = useState({});
  const [editandoDorsal, setEditandoDorsal] = useState(null);
  const [jugadoresVisitantesActivos, setJugadoresVisitantesActivos] = useState(
    Object.fromEntries([...Array(12)].map((_, i) => [i + 1, true]))
  );
  const [partidoId, setPartidoId] = useState(null);
  const [partidoInfo, setPartidoInfo] = useState(null);
  const [accionActiva, setAccionActiva] = useState(null); // null | "amarilla" | "roja" | "gol" | "falta"
  const [posicionSeleccionada, setPosicionSeleccionada] = useState(null); // null | "portero" | "cierre" | "alaSuperior" | "alaInferior" | "pivote"

  // Temporizador para desmarcar acción activa después de 10 segundos
  useEffect(() => {
    if (accionActiva) {
      const timer = setTimeout(() => {
        setAccionActiva(null);
      }, 10000); // 10 segundos

      return () => clearTimeout(timer);
    }
  }, [accionActiva]);

  // Estados para el flujo del partido
  const [estadoPartido, setEstadoPartido] = useState("configuracion"); // "configuracion" | "primera_parte" | "descanso" | "segunda_parte" | "finalizado"
  const [periodoActual, setPeriodoActual] = useState(1); // 1 o 2
  const [faltasLocalPrimera, setFaltasLocalPrimera] = useState(0);
  const [faltasLocalSegunda, setFaltasLocalSegunda] = useState(0);
  const [faltasVisitantePrimera, setFaltasVisitantePrimera] = useState(0);
  const [faltasVisitanteSegunda, setFaltasVisitanteSegunda] = useState(0);

  // Estados para tiempos muertos (1 por equipo por parte)
  const [tiemposMuertosLocal, setTiemposMuertosLocal] = useState({
    primera: false,
    segunda: false,
  });
  const [tiemposMuertosVisitante, setTiemposMuertosVisitante] = useState({
    primera: false,
    segunda: false,
  });

  // Estados para contador de tiempo muerto (1 minuto)
  const [contadorTiempoMuerto, setContadorTiempoMuerto] = useState(null); // null o { segundosRestantes: 60, timestampInicio: timestamp }
  const [tiempoMuertoActivo, setTiempoMuertoActivo] = useState(false);

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
  const [modalConfirmarAccion, setModalConfirmarAccion] = useState({
    visible: false,
    accion: null,
  });
  const [finalizandoPartido, setFinalizandoPartido] = useState(false);

  // Estado para monitoreo de jugadores en pista
  const [alertaJugadoresFaltantes, setAlertaJugadoresFaltantes] =
    useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Actualizar faltas totales cuando cambian las faltas por período
  useEffect(() => {
    // Mostrar solo las faltas del período actual en el marcador
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

  // Cargar dorsales visitantes cuando tengamos el partidoId
  useEffect(() => {
    if (partidoId) {
      const claveLocalStorage = `dorsalesVisitantes_partido_${partidoId}`;
      const dorsalesGuardados = localStorage.getItem(claveLocalStorage);
      if (dorsalesGuardados) {
        setDorsalesVisitantes(JSON.parse(dorsalesGuardados));
      }
    }
  }, [partidoId]);

  // Cargar jugadores visitantes activos cuando tengamos el partidoId
  useEffect(() => {
    if (partidoId) {
      const claveLocalStorage = `jugadoresVisitantesActivos_partido_${partidoId}`;
      const jugadoresGuardados = localStorage.getItem(claveLocalStorage);
      if (jugadoresGuardados) {
        setJugadoresVisitantesActivos(JSON.parse(jugadoresGuardados));
      } else {
        // Si no hay datos guardados, reiniciar todos a activos
        setJugadoresVisitantesActivos(
          Object.fromEntries([...Array(12)].map((_, i) => [i + 1, true]))
        );
      }
    }
  }, [partidoId]);

  // Guardar tiempos muertos en localStorage
  useEffect(() => {
    if (partidoId) {
      localStorage.setItem(
        `tiemposMuertosLocal_partido_${partidoId}`,
        JSON.stringify(tiemposMuertosLocal)
      );
      localStorage.setItem(
        `tiemposMuertosVisitante_partido_${partidoId}`,
        JSON.stringify(tiemposMuertosVisitante)
      );
    }
  }, [partidoId, tiemposMuertosLocal, tiemposMuertosVisitante]);

  // Guardar tiempos muertos en localStorage
  useEffect(() => {
    if (partidoId) {
      localStorage.setItem(
        `tiemposMuertosLocal_partido_${partidoId}`,
        JSON.stringify(tiemposMuertosLocal)
      );
      localStorage.setItem(
        `tiemposMuertosVisitante_partido_${partidoId}`,
        JSON.stringify(tiemposMuertosVisitante)
      );
    }
  }, [partidoId, tiemposMuertosLocal, tiemposMuertosVisitante]);

  // Guardar jugadores asignados en localStorage
  useEffect(() => {
    if (partidoId && Object.keys(jugadoresAsignados).length > 0) {
      localStorage.setItem(
        `jugadoresAsignados_partido_${partidoId}`,
        JSON.stringify(jugadoresAsignados)
      );
    }
  }, [partidoId, jugadoresAsignados]);

  // Guardar estadísticas en localStorage
  useEffect(() => {
    if (partidoId && Object.keys(estadisticas).length > 0) {
      localStorage.setItem(
        `estadisticas_partido_${partidoId}`,
        JSON.stringify(estadisticas)
      );
    }
  }, [partidoId, estadisticas]);

  // Guardar jugadores visitantes activos en localStorage
  useEffect(() => {
    if (partidoId) {
      localStorage.setItem(
        `jugadoresVisitantesActivos_partido_${partidoId}`,
        JSON.stringify(jugadoresVisitantesActivos)
      );
    }
  }, [partidoId, jugadoresVisitantesActivos]);

  // Guardar historial de acciones en localStorage
  useEffect(() => {
    if (partidoId && historialAcciones.length > 0) {
      localStorage.setItem(
        `historialAcciones_partido_${partidoId}`,
        JSON.stringify(historialAcciones)
      );
    }
  }, [partidoId, historialAcciones]);

  // Guardar cronómetro en localStorage
  useEffect(() => {
    if (partidoId) {
      const cronometroData = {
        tiempoCronometro,
        contadoresJugadores,
      };
      localStorage.setItem(
        `cronometro_partido_${partidoId}`,
        JSON.stringify(cronometroData)
      );
    }
  }, [partidoId, tiempoCronometro, contadoresJugadores]);

  // Guardar tiempos de entrada en localStorage
  useEffect(() => {
    if (partidoId && Object.keys(tiemposEntrada).length > 0) {
      localStorage.setItem(
        `tiemposEntrada_partido_${partidoId}`,
        JSON.stringify(tiemposEntrada)
      );
    }
  }, [partidoId, tiemposEntrada]);

  // Guardar tiempos de salida en localStorage
  useEffect(() => {
    if (partidoId && Object.keys(tiemposSalida).length > 0) {
      localStorage.setItem(
        `tiemposSalida_partido_${partidoId}`,
        JSON.stringify(tiemposSalida)
      );
    }
  }, [partidoId, tiemposSalida]);

  // Guardar estado del partido en localStorage
  useEffect(() => {
    if (partidoId) {
      const estadoData = {
        estadoPartido,
        periodoActual,
        golesLocal,
        golesVisitante,
        faltasLocalPrimera,
        faltasLocalSegunda,
        faltasVisitantePrimera,
        faltasVisitanteSegunda,
      };
      localStorage.setItem(
        `estadoPartido_partido_${partidoId}`,
        JSON.stringify(estadoData)
      );
    }
  }, [
    partidoId,
    estadoPartido,
    periodoActual,
    golesLocal,
    golesVisitante,
    faltasLocalPrimera,
    faltasLocalSegunda,
    faltasVisitantePrimera,
    faltasVisitanteSegunda,
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
          // Terminar tiempo muerto
          setTiempoMuertoActivo(false);
          setContadorTiempoMuerto(null);
        }
      }, 100); // Actualizar cada 100ms para mayor precisión

      return () => clearInterval(intervalo);
    }
  }, [tiempoMuertoActivo, contadorTiempoMuerto]);

  // Limpiar efecto de flash después de la animación
  useEffect(() => {
    if (flashEffect.timestamp) {
      const timeout = setTimeout(() => {
        setFlashEffect({ type: null, jugadorId: null, timestamp: null });
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [flashEffect.timestamp]);

  // Limpiar animación de tarjeta después de 2 segundos
  useEffect(() => {
    if (mostrarTarjeta.visible) {
      const timeout = setTimeout(() => {
        setMostrarTarjeta({ visible: false, tipo: null, dorsal: null });
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [mostrarTarjeta.visible]);

  // Gestionar el inicio/pausa del cronómetro
  useEffect(() => {
    if (cronometroActivo) {
      // Cuando se ACTIVA el cronómetro
      const ahora = Date.now();
      setTimestampInicioCronometro(ahora);

      // Activar contadores para jugadores que están en pista en este momento
      setContadoresJugadores((prev) => {
        const nuevos = { ...prev };

        Object.values(jugadoresAsignados).forEach((jugador) => {
          if (jugador && jugador.id) {
            if (!nuevos[jugador.id]) {
              nuevos[jugador.id] = {
                tiempoAcumulado: 0,
                activo: false,
                timestampInicio: null,
              };
            }
            // Solo activar si no estaba ya activo (para evitar resetear el timestamp)
            if (!nuevos[jugador.id].activo) {
              nuevos[jugador.id].activo = true;
              nuevos[jugador.id].timestampInicio = ahora;
            }
          }
        });

        return nuevos;
      });
    } else {
      // Cuando se PAUSA el cronómetro
      if (timestampInicioCronometro) {
        const tiempoTranscurrido =
          (Date.now() - timestampInicioCronometro) / 1000;
        setTiempoCronometro((prev) => prev + tiempoTranscurrido);
        setTimestampInicioCronometro(null);

        // Pausar todos los contadores y acumular su tiempo
        const ahora = Date.now();
        setContadoresJugadores((prev) => {
          const nuevos = { ...prev };

          Object.keys(nuevos).forEach((jugadorId) => {
            if (nuevos[jugadorId].activo && nuevos[jugadorId].timestampInicio) {
              const tiempoSesion =
                (ahora - nuevos[jugadorId].timestampInicio) / 1000;
              nuevos[jugadorId].tiempoAcumulado += tiempoSesion;
              nuevos[jugadorId].activo = false;
              nuevos[jugadorId].timestampInicio = null;
            }
          });

          return nuevos;
        });
      }
    }
  }, [cronometroActivo]); // Eliminado jugadoresAsignados de las dependencias

  // Gestionar pausa/reanudación de contadores durante tiempo muerto
  useEffect(() => {
    if (cronometroActivo) {
      const ahora = Date.now();

      if (tiempoMuertoActivo) {
        // PAUSAR contadores de jugadores al iniciar tiempo muerto
        console.log("⏸️ Pausando contadores de jugadores por tiempo muerto");
        setContadoresJugadores((prev) => {
          const nuevos = { ...prev };

          Object.keys(nuevos).forEach((jugadorId) => {
            if (nuevos[jugadorId].activo && nuevos[jugadorId].timestampInicio) {
              const tiempoSesion =
                (ahora - nuevos[jugadorId].timestampInicio) / 1000;
              nuevos[jugadorId].tiempoAcumulado += tiempoSesion;
              nuevos[jugadorId].activo = false;
              nuevos[jugadorId].timestampInicio = null;
            }
          });

          return nuevos;
        });
      } else {
        // REANUDAR contadores de jugadores al terminar tiempo muerto
        console.log("▶️ Reanudando contadores de jugadores tras tiempo muerto");
        setContadoresJugadores((prev) => {
          const nuevos = { ...prev };

          Object.values(jugadoresAsignados).forEach((jugador) => {
            if (jugador && jugador.id && nuevos[jugador.id]) {
              // Solo reactivar si el jugador está en pista
              if (!nuevos[jugador.id].activo) {
                nuevos[jugador.id].activo = true;
                nuevos[jugador.id].timestampInicio = ahora;
              }
            }
          });

          return nuevos;
        });
      }
    }
  }, [tiempoMuertoActivo, cronometroActivo, jugadoresAsignados]);

  // Monitoreo de jugadores en pista cada 10 segundos (solo durante el partido)
  useEffect(() => {
    // Resetear alerta cuando cambian los jugadores asignados
    setAlertaJugadoresFaltantes(false);

    if (
      estadoPartido === "primera_parte" ||
      estadoPartido === "segunda_parte"
    ) {
      console.log(
        "🔄 Reiniciando monitoreo de jugadores en pista (comprobación en 10s)"
      );

      // Hacer la comprobación después de 10 segundos
      const timeout = setTimeout(() => {
        const cantidadJugadores = Object.keys(jugadoresAsignados).length;

        console.log(`🔍 Comprobación pista: ${cantidadJugadores}/5 jugadores`);
        console.log("📋 jugadoresAsignados:", jugadoresAsignados);

        if (cantidadJugadores < 5) {
          // Faltan jugadores después de 10 segundos
          console.log(
            "⚠️ ALERTA: Faltan jugadores en pista después de 10 segundos"
          );
          setAlertaJugadoresFaltantes(true);
        } else {
          console.log("✅ TODO OK: 5 jugadores en pista");
        }
      }, 10000); // Comprobación única después de 10 segundos

      return () => {
        console.log("🛑 Cancelando comprobación de jugadores");
        clearTimeout(timeout);
      };
    } else {
      // Si no está en partido, resetear
      setAlertaJugadoresFaltantes(false);
    }
  }, [estadoPartido, jugadoresAsignados]);

  // Intervalo para actualizar estadísticas de jugadores con contadores activos
  useEffect(() => {
    let intervalo;
    if (cronometroActivo) {
      intervalo = setInterval(() => {
        const ahora = Date.now();

        setEstadisticas((prev) => {
          const nuevasStats = { ...prev };

          Object.entries(contadoresJugadores).forEach(
            ([jugadorId, contador]) => {
              if (contador.activo && contador.timestampInicio) {
                const tiempoSesionActual =
                  (ahora - contador.timestampInicio) / 1000;
                const tiempoTotal =
                  contador.tiempoAcumulado + tiempoSesionActual;

                if (!nuevasStats[jugadorId]) {
                  nuevasStats[jugadorId] = {
                    goles: 0,
                    asistencias: 0,
                    paradas: 0,
                    faltas: 0,
                    amarillas: 0,
                    rojas: 0,
                    minutos: 0,
                    minutosAcumulados: 0,
                  };
                }

                nuevasStats[jugadorId].minutos = tiempoTotal;
                nuevasStats[jugadorId].minutosAcumulados = tiempoTotal;
              }
            }
          );

          return nuevasStats;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [cronometroActivo, contadoresJugadores, tiempoMuertoActivo]);

  // Función helper para formatear segundos a mm:ss
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${String(mins).padStart(2, "0")}:${String(segs).padStart(2, "0")}`;
  };

  const handleDragStart = (e, jugador) => {
    e.dataTransfer.setData("jugador", JSON.stringify(jugador));
    e.dataTransfer.effectAllowed = "move";
    // Hacer que solo el elemento arrastrado tenga opacidad, no los demás
    e.target.style.opacity = "0.5";
  };

  const handleDrop = (jugador, posicion) => {
    // Prevenir que jugadores visitantes se pongan en pista
    const esVisitante =
      jugador.id &&
      (jugador.id.toString().startsWith("visitante-") ||
        jugador.id.toString().includes("-visitante-"));
    if (esVisitante) {
      console.log("Jugadores visitantes no pueden ponerse en pista");
      return;
    }

    // Prevenir que el staff (E, D, A) se ponga en pista
    const esStaff = jugador.id && jugador.id.toString().startsWith("staff-");
    if (esStaff) {
      console.log(
        "El staff (Entrenador, Delegado, Auxiliar) no puede ponerse en pista"
      );
      return;
    }

    setJugadoresAsignados((prev) => {
      // Guardar el jugador que será reemplazado en esa posición (si existe)
      const jugadorReemplazado = prev[posicion];

      // Desactivar contador del jugador reemplazado si el cronómetro está activo
      if (jugadorReemplazado && cronometroActivo) {
        const ahora = Date.now();
        setContadoresJugadores((contadores) => {
          const nuevoContador = { ...contadores };

          if (
            nuevoContador[jugadorReemplazado.id] &&
            nuevoContador[jugadorReemplazado.id].activo
          ) {
            const tiempoSesion =
              (ahora - nuevoContador[jugadorReemplazado.id].timestampInicio) /
              1000;
            nuevoContador[jugadorReemplazado.id].tiempoAcumulado +=
              tiempoSesion;
            nuevoContador[jugadorReemplazado.id].activo = false;
            nuevoContador[jugadorReemplazado.id].timestampInicio = null;
          }

          return nuevoContador;
        });
      }

      // Primero, eliminar al jugador de cualquier posición anterior
      const nuevo = { ...prev };
      Object.keys(nuevo).forEach((pos) => {
        if (nuevo[pos] && nuevo[pos].id === jugador.id) {
          delete nuevo[pos];
        }
      });

      // Luego, asignarlo a la nueva posición
      nuevo[posicion] = jugador;
      return nuevo;
    });

    // Activar contador del jugador si el cronómetro está activo
    if (cronometroActivo) {
      const ahora = Date.now();
      setContadoresJugadores((prev) => {
        const nuevoContador = { ...prev };

        if (!nuevoContador[jugador.id]) {
          nuevoContador[jugador.id] = {
            tiempoAcumulado: 0,
            activo: false,
            timestampInicio: null,
          };
        }

        // Activar su contador
        nuevoContador[jugador.id].activo = true;
        nuevoContador[jugador.id].timestampInicio = ahora;

        return nuevoContador;
      });
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
  const handlePosicionClick = (posicion) => {
    const jugadorEnPosicion = jugadoresAsignados[posicion];
    if (jugadorEnPosicion) {
      // Remover jugador de la posición
      setJugadoresAsignados((prev) => {
        const nuevo = { ...prev };
        delete nuevo[posicion];
        return nuevo;
      });

      // Verificar si el jugador sigue en alguna otra posición
      const sigueEnPista = Object.entries(jugadoresAsignados).some(
        ([pos, jug]) =>
          pos !== posicion && jug && jug.id === jugadorEnPosicion.id
      );

      // Si ya no está en ninguna posición, desactivar contador y registrar salida
      if (!sigueEnPista) {
        // Desactivar el contador del jugador si está activo
        if (cronometroActivo) {
          const ahora = Date.now();
          setContadoresJugadores((prev) => {
            const nuevoContador = { ...prev };

            if (
              nuevoContador[jugadorEnPosicion.id] &&
              nuevoContador[jugadorEnPosicion.id].activo
            ) {
              const tiempoSesion =
                (ahora - nuevoContador[jugadorEnPosicion.id].timestampInicio) /
                1000;
              nuevoContador[jugadorEnPosicion.id].tiempoAcumulado +=
                tiempoSesion;
              nuevoContador[jugadorEnPosicion.id].activo = false;
              nuevoContador[jugadorEnPosicion.id].timestampInicio = null;
            }

            return nuevoContador;
          });
        }

        setTiemposSalida((prev) => ({
          ...prev,
          [jugadorEnPosicion.id]: Date.now(),
        }));
      }
    }
  };

  // Ejecutar acción sobre un jugador (usado por drag&drop y por modo click)
  const ejecutarAccion = (jugador, tipoAccion) => {
    if (!jugador || !tipoAccion) return;
    registrarAccion(jugador, tipoAccion);
    // Desactivar modo de selección después de aplicar la acción
    setAccionActiva(null);
  };

  // Asignar jugador a posición desde modo click
  const asignarJugadorAPosicion = (jugador, posicion) => {
    if (!jugador || !posicion) return;
    handleDrop(jugador, posicion);
    // Desactivar modo de selección de posición
    setPosicionSeleccionada(null);
  };

  // Función para manejar la selección de posición con exclusión mutua
  const handlePosicionSeleccionar = (posicion) => {
    setAccionActiva(null); // Limpiar acción activa
    setPosicionSeleccionada(posicion);
  };

  // Validar si se puede activar una acción según el estado del partido
  const validarEstadoParaAccion = (accion) => {
    const estadosInactivos = ["configuracion", "descanso", "finalizado"];

    if (estadosInactivos.includes(estadoPartido)) {
      setModalConfirmarAccion({ visible: true, accion });
      return false;
    }

    if (tiempoMuertoActivo) {
      setModalConfirmarAccion({ visible: true, accion });
      return false;
    }

    return true;
  };

  // Confirmar acción fuera de tiempo de juego
  const confirmarAccionFueraDeTiempo = () => {
    const accion = modalConfirmarAccion.accion;
    setModalConfirmarAccion({ visible: false, accion: null });
    setPosicionSeleccionada(null);
    setAccionActiva(accionActiva === accion ? null : accion);
  };

  const handleAccionDrop = (e, accion) => {
    e.preventDefault();
    const jugadorData = e.dataTransfer.getData("jugador");
    if (jugadorData) {
      const jugador = JSON.parse(jugadorData);
      ejecutarAccion(jugador, accion);
    }
  };

  const registrarAccion = (jugador, accion) => {
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
            const nuevasFaltas = prev + 1;
            // Determinar tipo de animación según el número de faltas
            let tipoAnimacion = "falta";
            if (nuevasFaltas === 5) {
              tipoAnimacion = "5faltas";
            } else if (nuevasFaltas > 5) {
              tipoAnimacion = "doblepenalty";
            }
            // Mostrar animación para cualquier falta
            setMostrarTarjeta({
              visible: true,
              tipo: tipoAnimacion,
              dorsal: jugador.numero_dorsal,
              equipo: "visitante",
              numeroFaltas: nuevasFaltas,
            });
            return nuevasFaltas;
          });
        } else {
          setFaltasVisitanteSegunda((prev) => {
            const nuevasFaltas = prev + 1;
            // Determinar tipo de animación según el número de faltas
            let tipoAnimacion = "falta";
            if (nuevasFaltas === 5) {
              tipoAnimacion = "5faltas";
            } else if (nuevasFaltas > 5) {
              tipoAnimacion = "doblepenalty";
            }
            // Mostrar animación para cualquier falta
            setMostrarTarjeta({
              visible: true,
              tipo: tipoAnimacion,
              dorsal: jugador.numero_dorsal,
              equipo: "visitante",
              numeroFaltas: nuevasFaltas,
            });
            return nuevasFaltas;
          });
        }
      } else {
        if (periodoActual === 1) {
          setFaltasLocalPrimera((prev) => {
            const nuevasFaltas = prev + 1;
            // Determinar tipo de animación según el número de faltas
            let tipoAnimacion = "falta";
            if (nuevasFaltas === 5) {
              tipoAnimacion = "5faltas";
            } else if (nuevasFaltas > 5) {
              tipoAnimacion = "doblepenalty";
            }
            // Mostrar animación para cualquier falta
            setMostrarTarjeta({
              visible: true,
              tipo: tipoAnimacion,
              dorsal: jugador.numero_dorsal,
              equipo: "local",
              numeroFaltas: nuevasFaltas,
            });
            return nuevasFaltas;
          });
        } else {
          setFaltasLocalSegunda((prev) => {
            const nuevasFaltas = prev + 1;
            // Determinar tipo de animación según el número de faltas
            let tipoAnimacion = "falta";
            if (nuevasFaltas === 5) {
              tipoAnimacion = "5faltas";
            } else if (nuevasFaltas > 5) {
              tipoAnimacion = "doblepenalty";
            }
            // Mostrar animación para cualquier falta
            setMostrarTarjeta({
              visible: true,
              tipo: tipoAnimacion,
              dorsal: jugador.numero_dorsal,
              equipo: "local",
              numeroFaltas: nuevasFaltas,
            });
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
  const registrarTiempoMuerto = (equipo) => {
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

  const actualizarDorsalVisitante = (numeroOriginal, nuevoValor) => {
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
        const datosLocalStorage = verificarDatosLocalStorage(idPartidoActual);

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
  const verificarDatosLocalStorage = (idPartido) => {
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

        // DEBUG: Mostrar TODOS los asistentes del staff para verificar
        const posicionesStaff = ["Entrenador", "Auxiliar", "Delegado", "Staff"];
        const todosStaff = asistentes.filter((a) =>
          posicionesStaff.includes(a.posicion)
        );
        console.log(
          "👔 [DEBUG] TODOS los miembros del staff en asistencias:",
          todosStaff
        );
        console.log(
          "👔 [DEBUG] Estados de staff:",
          todosStaff.map((s) => ({
            nombre: s.jugador_nombre,
            estado: s.estado,
            posicion: s.posicion,
            abreviatura: s.abreviatura,
          }))
        );

        // Cargar todo el staff (confirmados y no confirmados)
        const todoStaff = asistentes
          .filter((a) => posicionesStaff.includes(a.posicion))
          .map((a) => ({
            id: a.jugador_id,
            nombre: a.jugador_nombre,
            posicion: a.posicion,
            abreviatura: a.abreviatura,
            color: a.color,
            alias: a.alias,
            estado: a.estado, // Importante: mantener el estado
            confirmado: a.estado === "confirmado",
          }));

        console.log(
          "👔 Todo el staff (confirmados y no confirmados):",
          todoStaff
        );

        // Organizar staff por posición usando abreviatura
        const staffOrganizado = {
          ENT: todoStaff.filter((s) => s.posicion === "Entrenador"),
          DEL: todoStaff.filter((s) => s.posicion === "Delegado"),
          AUX: todoStaff.filter((s) => s.posicion === "Auxiliar"),
          MAT: todoStaff.filter((s) => s.posicion === "Material"),
          STAFF: todoStaff.filter((s) => s.posicion === "Staff"), // Legacy
        };

        console.log("🗂️ Staff organizado por rol:", staffOrganizado);

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
  const cargarDesdeLocalStorage = () => {
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
      limpiarLocalStoragePartido();
      cargarDatosPartido(partidoId);
    }
  };

  // Función para limpiar localStorage de un partido específico
  const limpiarLocalStoragePartido = () => {
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
      limpiarLocalStoragePartido();
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

    const datos = verificarDatosLocalStorage(partidoId);
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
    if (finalizandoPartido) {
      console.log(
        "⚠️ Ya se está finalizando el partido, ignorando click adicional"
      );
      return;
    }

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
    setFinalizandoPartido(true);
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

      // 4. Preparar historial de acciones con orden y período
      const historialConOrden = historialAcciones.map((accion, index) => ({
        ...accion,
        ordenAccion: index + 1,
        periodo: accion.periodo || 1, // Asegurar que siempre tenga período
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
      setFinalizandoPartido(false); // Resetear para permitir reintentar
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
          finalizandoPartido={finalizandoPartido}
          onTiempoMuertoLocal={() => registrarTiempoMuerto("local")}
          onTiempoMuertoVisitante={() => registrarTiempoMuerto("visitante")}
          tiemposMuertosLocal={tiemposMuertosLocal}
          tiemposMuertosVisitante={tiemposMuertosVisitante}
          periodoActual={periodoActual}
          tiempoMuertoActivo={tiempoMuertoActivo}
          contadorTiempoMuerto={contadorTiempoMuerto}
        />

        {/* Animación de Tarjeta/Gol Espectacular */}
        {mostrarTarjeta.visible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative animate-slideUp">
              {/* Mano sosteniendo la tarjeta o balón */}
              <div className="relative">
                {mostrarTarjeta.tipo === "falta" ? (
                  /* Animación simple de número de falta estilo paleta */
                  <div className="flex flex-col items-center gap-4 animate-slideUp">
                    {/* Número de falta estilo paleta simple */}
                    <div className="relative">
                      {/* Paleta/mango blanco */}
                      <div className="flex flex-col items-center">
                        {/* Parte superior redondeada con el número */}
                        <div className="bg-white rounded-t-3xl rounded-b-lg shadow-2xl border-4 border-gray-300 w-64 h-80 flex items-center justify-center">
                          <span className="text-[200px] font-black text-gray-900 leading-none">
                            {mostrarTarjeta.numeroFaltas}
                          </span>
                        </div>
                        {/* Mango */}
                        <div className="w-20 h-24 bg-gradient-to-b from-gray-200 to-gray-300 rounded-b-3xl shadow-lg border-4 border-t-0 border-gray-300"></div>
                      </div>
                    </div>
                  </div>
                ) : mostrarTarjeta.tipo === "5faltas" ? (
                  /* Mano con 5 dedos para indicar 5 faltas */
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="text-6xl font-bold text-red-600 drop-shadow-lg animate-bounce">
                      ¡5 FALTAS!
                    </div>

                    {/* Mano con 5 dedos extendidos */}
                    <div className="relative w-64 h-80 animate-wiggle">
                      {/* Palma de la mano */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-48 bg-gradient-to-b from-amber-500 to-amber-600 rounded-t-full rounded-b-3xl shadow-2xl border-4 border-amber-700"></div>

                      {/* Los 5 dedos */}
                      {/* Pulgar (izquierda, más bajo) */}
                      <div className="absolute bottom-32 left-2 w-10 h-24 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-xl transform -rotate-45 border-4 border-amber-700">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          1
                        </div>
                      </div>

                      {/* Índice */}
                      <div className="absolute bottom-48 left-8 w-9 h-32 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl transform -rotate-12 border-4 border-amber-700">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          2
                        </div>
                      </div>

                      {/* Medio (el más largo) */}
                      <div className="absolute bottom-48 left-1/2 -translate-x-1/2 w-9 h-36 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl border-4 border-amber-700">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          3
                        </div>
                      </div>

                      {/* Anular */}
                      <div className="absolute bottom-48 right-8 w-9 h-32 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl transform rotate-12 border-4 border-amber-700">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          4
                        </div>
                      </div>

                      {/* Meñique (derecha, más corto) */}
                      <div className="absolute bottom-44 right-2 w-8 h-28 bg-gradient-to-t from-amber-500 to-amber-600 rounded-full shadow-xl transform rotate-20 border-4 border-amber-700">
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          5
                        </div>
                      </div>
                    </div>

                    <div className="text-4xl font-bold text-white drop-shadow-lg mt-4 bg-red-600 px-8 py-4 rounded-lg shadow-2xl">
                      {mostrarTarjeta.equipo === "visitante"
                        ? "VISITANTE"
                        : "LOCAL"}
                    </div>
                  </div>
                ) : mostrarTarjeta.tipo === "doblepenalty" ? (
                  /* Animación para DOBLE PENALTY (más de 5 faltas) */
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                    {/* Dos balones con punto de penalty */}
                    <div className="flex gap-8 animate-bounce">
                      {/* Primer balón */}
                      <div className="relative w-24 h-24">
                        <div className="w-full h-full bg-white rounded-full shadow-2xl border-4 border-gray-800 flex items-center justify-center">
                          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                        </div>
                      </div>
                      {/* Segundo balón */}
                      <div className="relative w-24 h-24">
                        <div className="w-full h-full bg-white rounded-full shadow-2xl border-4 border-gray-800 flex items-center justify-center">
                          <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                        </div>
                      </div>
                    </div>

                    {/* Texto DOBLE PENALTY */}
                    <div className="text-6xl font-bold text-red-600 drop-shadow-lg animate-wiggle">
                      ¡DOBLE PENALTY!
                    </div>

                    {/* Contador de faltas */}
                    <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-10 py-5 rounded-2xl shadow-2xl border-4 border-red-700">
                      <div className="text-2xl font-bold text-center">
                        {mostrarTarjeta.equipo === "visitante"
                          ? "VISITANTE"
                          : "LOCAL"}
                      </div>
                      <div className="text-7xl font-black text-center mt-2 drop-shadow-lg">
                        {mostrarTarjeta.numeroFaltas}
                      </div>
                      <div className="text-xl font-semibold text-center mt-1">
                        FALTAS ACUMULADAS
                      </div>
                    </div>
                  </div>
                ) : mostrarTarjeta.tipo === "gol" ? (
                  /* Animación de GOL con jugador chutando */
                  <div className="flex flex-col items-center gap-6 animate-pulse">
                    {/* Texto GOOOOOL!!! */}
                    <div className="text-8xl font-black text-green-600 drop-shadow-2xl animate-bounce">
                      ¡GOOOOOL!
                    </div>

                    {/* Escena: Jugador chutando el balón */}
                    <div className="relative w-80 h-64 animate-slideUp">
                      {/* Balón en movimiento */}
                      <div className="absolute top-10 right-20 w-20 h-20 animate-bounce-custom">
                        <div className="w-full h-full bg-white rounded-full shadow-2xl border-4 border-gray-800 flex items-center justify-center">
                          {/* Patrón simple del balón */}
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-800 rounded-sm transform rotate-45"></div>
                            <div className="absolute bottom-2 left-2 w-5 h-5 bg-gray-800 rounded-sm transform rotate-45"></div>
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-gray-800 rounded-sm transform rotate-45"></div>
                          </div>
                        </div>
                      </div>

                      {/* Jugador chutando (figura de palitos mejorada) */}
                      <div className="absolute bottom-0 left-10 animate-wiggle">
                        {/* Cabeza */}
                        <div className="w-12 h-12 bg-amber-600 rounded-full border-4 border-amber-800 mx-auto"></div>

                        {/* Cuerpo */}
                        <div className="w-16 h-24 bg-green-600 rounded-lg border-4 border-green-800 mx-auto mt-1 relative">
                          {/* Número del dorsal */}
                          <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">
                            {mostrarTarjeta.dorsal}
                          </div>
                        </div>

                        {/* Brazos */}
                        <div className="absolute top-14 -left-2 w-16 h-4 bg-amber-600 rounded-full transform -rotate-45 border-2 border-amber-800"></div>
                        <div className="absolute top-14 -right-2 w-16 h-4 bg-amber-600 rounded-full transform rotate-12 border-2 border-amber-800"></div>

                        {/* Pierna izquierda (extendida chutando) */}
                        <div className="absolute bottom-0 left-2 w-6 h-20 bg-green-700 rounded-lg transform rotate-45 origin-top border-2 border-green-900"></div>

                        {/* Pierna derecha (apoyo) */}
                        <div className="absolute bottom-0 right-2 w-6 h-16 bg-green-700 rounded-lg border-2 border-green-900"></div>
                      </div>

                      {/* Efecto de movimiento */}
                      <div className="absolute top-20 right-10 text-4xl animate-ping opacity-50">
                        💨
                      </div>
                    </div>

                    {/* Dorsal destacado */}
                    <div className="bg-green-600 text-white px-12 py-6 rounded-2xl shadow-2xl border-4 border-green-800">
                      <div className="text-sm font-semibold mb-1 text-center">
                        ANOTÓ
                      </div>
                      <div className="text-7xl font-black text-center">
                        {mostrarTarjeta.dorsal}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tarjeta amarilla o roja */
                  <div
                    className={`w-40 h-56 ${
                      mostrarTarjeta.tipo === "amarilla"
                        ? "bg-yellow-400"
                        : "bg-red-600"
                    } rounded-lg shadow-2xl flex items-center justify-center transform rotate-12 animate-wiggle`}
                  >
                    <div className="text-8xl font-bold text-white drop-shadow-lg">
                      {mostrarTarjeta.dorsal}
                    </div>
                  </div>
                )}

                {/* Mano (brazo y mano simplificada) - Solo para tarjetas */}
                {mostrarTarjeta.tipo !== "gol" && (
                  <div className="absolute -bottom-32 left-1/2 -translate-x-1/2">
                    {/* Brazo */}
                    <div className="w-16 h-40 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full transform origin-top"></div>
                    {/* Muñeca */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-8 bg-amber-700 rounded-full"></div>
                    {/* Mano */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                      <div className="w-20 h-16 bg-amber-600 rounded-full"></div>
                      {/* Dedos */}
                      <div className="absolute top-0 left-2 w-3 h-12 bg-amber-600 rounded-full transform -rotate-12"></div>
                      <div className="absolute top-0 left-6 w-3 h-14 bg-amber-600 rounded-full transform rotate-0"></div>
                      <div className="absolute top-0 left-10 w-3 h-13 bg-amber-600 rounded-full transform rotate-0"></div>
                      <div className="absolute top-0 right-2 w-3 h-11 bg-amber-600 rounded-full transform rotate-12"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contenedor principal con pista y jugadores */}
        <div className="bg-white rounded-lg shadow-md p-6 relative">
          <div className="flex gap-4 items-start">
            {/* Jugadores Locales - Izquierda (2 columnas) */}
            <div
              className="flex-shrink-0 flex flex-col items-center"
              onDrop={handleDropFueraPista}
              onDragOver={handleDragOverFueraPista}
            >
              {/* Bolas de Staff Técnico encima de jugadores - 1 fila */}
              <div className="flex justify-center gap-2 mb-3">
                {/* Renderizar dinámicamente el staff confirmado por categoría en orden: Entrenador, Delegado, Auxiliar */}
                {[...staff.ENT, ...staff.DEL, ...staff.AUX].map((miembro) => {
                  const estaConfirmado = miembro.confirmado;
                  const estaDeshabilitado = !estaConfirmado;
                  return (
                    <div
                      key={miembro.id}
                      draggable={estaConfirmado}
                      onDragStart={(e) => {
                        if (estaConfirmado) {
                          handleDragStart(e, {
                            id: `staff-${miembro.id}`,
                            nombre: miembro.nombre,
                            numero_dorsal: miembro.abreviatura || "S",
                          });
                        }
                      }}
                      onDragEnd={(e) => {
                        if (estaConfirmado) {
                          e.target.style.opacity = "1";
                        }
                      }}
                      onClick={() => {
                        if (estaConfirmado && accionActiva) {
                          ejecutarAccion(
                            {
                              id: `staff-${miembro.id}`,
                              nombre: miembro.nombre,
                              numero_dorsal: miembro.abreviatura || "S",
                            },
                            accionActiva
                          );
                        }
                      }}
                      className={`relative w-14 h-14 rounded-full ${
                        estaDeshabilitado
                          ? "bg-gray-400 border-2 border-gray-500 opacity-50 cursor-not-allowed"
                          : "bg-amber-600 border-2 border-amber-800 hover:scale-110 transition-transform"
                      } flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden ${
                        estaConfirmado && accionActiva
                          ? "cursor-pointer hover:ring-4 hover:ring-amber-300"
                          : estaConfirmado
                          ? "cursor-grab active:cursor-grabbing"
                          : ""
                      }`}
                      title={
                        estaDeshabilitado
                          ? `${miembro.nombre} (${miembro.posicion}) - No confirmado`
                          : accionActiva
                          ? `Click para aplicar ${accionActiva}`
                          : `${miembro.nombre} (${miembro.posicion}) - Arrastra para asignar tarjeta`
                      }
                    >
                      {estadisticas[`staff-${miembro.id}`]?.rojas > 0 ? (
                        <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                          {miembro.abreviatura || "S"}
                        </div>
                      ) : estadisticas[`staff-${miembro.id}`]?.amarillas > 0 ? (
                        <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                          {miembro.abreviatura || "S"}
                        </div>
                      ) : (
                        miembro.abreviatura || "S"
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                {/* Columna 1: Primer tercio de jugadores */}
                <div className="flex flex-col items-center gap-2">
                  {jugadores
                    .filter((j) => !isJugadorAsignado(j.id))
                    .sort((a, b) => {
                      // Primero los que no tienen dorsal (null)
                      if (a.numero_dorsal === null && b.numero_dorsal !== null)
                        return -1;
                      if (a.numero_dorsal !== null && b.numero_dorsal === null)
                        return 1;
                      // Si ambos no tienen dorsal, mantener orden original
                      if (a.numero_dorsal === null && b.numero_dorsal === null)
                        return 0;
                      // Si ambos tienen dorsal, ordenar por número
                      return a.numero_dorsal - b.numero_dorsal;
                    })
                    .slice(
                      0,
                      Math.ceil(
                        jugadores.filter((j) => !isJugadorAsignado(j.id))
                          .length / 3
                      )
                    )
                    .map((jugador) => {
                      const asignado = isJugadorAsignado(jugador.id);
                      const stats = estadisticas[jugador.id];
                      const tieneAmarilla = stats?.amarillas > 0;
                      const tieneRoja = stats?.rojas > 0;
                      const numGoles = stats?.goles || 0;

                      // Calcular porcentaje de esfuerzo (50 minutos = 3000 segundos)
                      const segundosJugados = stats?.minutos || 0;
                      const TOTAL_PARTIDO = 3000; // 50 minutos en segundos
                      const porcentajeEsfuerzo = Math.min(
                        (segundosJugados / TOTAL_PARTIDO) * 100,
                        100
                      );

                      // Posiciones para los balones alrededor del círculo
                      const posicionesBalones = [
                        { className: "top-0 right-0" }, // Esquina superior derecha
                        { className: "top-0 left-0" }, // Esquina superior izquierda
                        { className: "bottom-0 right-0" }, // Esquina inferior derecha
                        { className: "bottom-0 left-0" }, // Esquina inferior izquierda
                      ];

                      // Detectar si este jugador debe animarse
                      const debeAnimarse =
                        flashEffect.jugadorId === jugador.id &&
                        (flashEffect.type === "amarilla" ||
                          flashEffect.type === "roja");

                      return (
                        <div
                          key={jugador.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, jugador)}
                          onDragEnd={(e) => {
                            e.target.style.opacity = "1";
                          }}
                          onClick={() => {
                            if (accionActiva) {
                              ejecutarAccion(jugador, accionActiva);
                            } else if (posicionSeleccionada) {
                              asignarJugadorAPosicion(
                                jugador,
                                posicionSeleccionada
                              );
                            }
                          }}
                          className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold shadow-lg transition-all duration-300 overflow-hidden ${
                            asignado
                              ? "border-gray-500 opacity-50 cursor-grab"
                              : accionActiva
                              ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-blue-300"
                              : posicionSeleccionada
                              ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-green-300"
                              : "border-blue-700 cursor-grab hover:scale-110 active:cursor-grabbing"
                          } ${debeAnimarse ? "scale-125" : ""}`}
                          style={{
                            background: asignado
                              ? "#9ca3af"
                              : `linear-gradient(to bottom, #cbd5e1 ${porcentajeEsfuerzo}%, #3b82f6 ${porcentajeEsfuerzo}%)`,
                          }}
                          title={
                            accionActiva
                              ? `Click para aplicar ${accionActiva}`
                              : posicionSeleccionada
                              ? `Click para asignar a ${posicionSeleccionada}`
                              : "Arrastra a la pista o a zona de acciones"
                          }
                        >
                          <div className="flex flex-col items-center">
                            {tieneRoja ? (
                              <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                {jugador.numero_dorsal}
                              </div>
                            ) : tieneAmarilla ? (
                              <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                                {jugador.numero_dorsal}
                              </div>
                            ) : (
                              <span className="text-white text-lg">
                                {jugador.numero_dorsal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {/* Columna 2: Segundo tercio de jugadores */}
                <div className="flex flex-col items-center gap-2">
                  {jugadores
                    .filter((j) => !isJugadorAsignado(j.id))
                    .sort((a, b) => {
                      // Primero los que no tienen dorsal (null)
                      if (a.numero_dorsal === null && b.numero_dorsal !== null)
                        return -1;
                      if (a.numero_dorsal !== null && b.numero_dorsal === null)
                        return 1;
                      // Si ambos no tienen dorsal, mantener orden original
                      if (a.numero_dorsal === null && b.numero_dorsal === null)
                        return 0;
                      // Si ambos tienen dorsal, ordenar por número
                      return a.numero_dorsal - b.numero_dorsal;
                    })
                    .slice(
                      Math.ceil(
                        jugadores.filter((j) => !isJugadorAsignado(j.id))
                          .length / 3
                      ),
                      Math.ceil(
                        (jugadores.filter((j) => !isJugadorAsignado(j.id))
                          .length *
                          2) /
                          3
                      )
                    )
                    .map((jugador) => {
                      const asignado = isJugadorAsignado(jugador.id);
                      const stats = estadisticas[jugador.id];
                      const tieneAmarilla = stats?.amarillas > 0;
                      const tieneRoja = stats?.rojas > 0;
                      const numGoles = stats?.goles || 0;

                      // Calcular porcentaje de esfuerzo (50 minutos = 3000 segundos)
                      const segundosJugados = stats?.minutos || 0;
                      const TOTAL_PARTIDO = 3000; // 50 minutos en segundos
                      const porcentajeEsfuerzo = Math.min(
                        (segundosJugados / TOTAL_PARTIDO) * 100,
                        100
                      );

                      // Posiciones para los balones alrededor del círculo
                      const posicionesBalones = [
                        { className: "top-0 right-0" }, // Esquina superior derecha
                        { className: "top-0 left-0" }, // Esquina superior izquierda
                        { className: "bottom-0 right-0" }, // Esquina inferior derecha
                        { className: "bottom-0 left-0" }, // Esquina inferior izquierda
                      ];

                      // Detectar si este jugador debe animarse
                      const debeAnimarse =
                        flashEffect.jugadorId === jugador.id &&
                        (flashEffect.type === "amarilla" ||
                          flashEffect.type === "roja");

                      return (
                        <div
                          key={jugador.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, jugador)}
                          onDragEnd={(e) => {
                            e.target.style.opacity = "1";
                          }}
                          onClick={() => {
                            if (accionActiva) {
                              ejecutarAccion(jugador, accionActiva);
                            } else if (posicionSeleccionada) {
                              asignarJugadorAPosicion(
                                jugador,
                                posicionSeleccionada
                              );
                            }
                          }}
                          className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold shadow-lg transition-all duration-300 overflow-hidden ${
                            asignado
                              ? "border-gray-500 opacity-50 cursor-grab"
                              : accionActiva
                              ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-blue-300"
                              : posicionSeleccionada
                              ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-green-300"
                              : "border-blue-700 cursor-grab hover:scale-110 active:cursor-grabbing"
                          } ${debeAnimarse ? "scale-125" : ""}`}
                          style={{
                            background: asignado
                              ? "#9ca3af"
                              : `linear-gradient(to bottom, #cbd5e1 ${porcentajeEsfuerzo}%, #3b82f6 ${porcentajeEsfuerzo}%)`,
                          }}
                          title={
                            accionActiva
                              ? `Click para aplicar ${accionActiva}`
                              : posicionSeleccionada
                              ? `Click para asignar a ${posicionSeleccionada}`
                              : "Arrastra a la pista o a zona de acciones"
                          }
                        >
                          <div className="flex flex-col items-center">
                            {tieneRoja ? (
                              <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                {jugador.numero_dorsal}
                              </div>
                            ) : tieneAmarilla ? (
                              <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                                {jugador.numero_dorsal}
                              </div>
                            ) : (
                              <span className="text-white text-lg">
                                {jugador.numero_dorsal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {/* Columna 3: Tercer tercio de jugadores */}
                <div className="flex flex-col items-center gap-2">
                  {jugadores
                    .filter((j) => !isJugadorAsignado(j.id))
                    .sort((a, b) => {
                      // Primero los que no tienen dorsal (null)
                      if (a.numero_dorsal === null && b.numero_dorsal !== null)
                        return -1;
                      if (a.numero_dorsal !== null && b.numero_dorsal === null)
                        return 1;
                      // Si ambos no tienen dorsal, mantener orden original
                      if (a.numero_dorsal === null && b.numero_dorsal === null)
                        return 0;
                      // Si ambos tienen dorsal, ordenar por número
                      return a.numero_dorsal - b.numero_dorsal;
                    })
                    .slice(
                      Math.ceil(
                        (jugadores.filter((j) => !isJugadorAsignado(j.id))
                          .length *
                          2) /
                          3
                      )
                    )
                    .map((jugador) => {
                      const asignado = isJugadorAsignado(jugador.id);
                      const stats = estadisticas[jugador.id];
                      const tieneAmarilla = stats?.amarillas > 0;
                      const tieneRoja = stats?.rojas > 0;
                      const numGoles = stats?.goles || 0;

                      // Calcular porcentaje de esfuerzo (50 minutos = 3000 segundos)
                      const segundosJugados = stats?.minutos || 0;
                      const TOTAL_PARTIDO = 3000; // 50 minutos en segundos
                      const porcentajeEsfuerzo = Math.min(
                        (segundosJugados / TOTAL_PARTIDO) * 100,
                        100
                      );

                      // Posiciones para los balones alrededor del círculo
                      const posicionesBalones = [
                        { className: "top-0 right-0" }, // Esquina superior derecha
                        { className: "top-0 left-0" }, // Esquina superior izquierda
                        { className: "bottom-0 right-0" }, // Esquina inferior derecha
                        { className: "bottom-0 left-0" }, // Esquina inferior izquierda
                      ];

                      // Detectar si este jugador debe animarse
                      const debeAnimarse =
                        flashEffect.jugadorId === jugador.id &&
                        (flashEffect.type === "amarilla" ||
                          flashEffect.type === "roja");

                      return (
                        <div
                          key={jugador.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, jugador)}
                          onDragEnd={(e) => {
                            e.target.style.opacity = "1";
                          }}
                          onClick={() => {
                            if (accionActiva) {
                              ejecutarAccion(jugador, accionActiva);
                            } else if (posicionSeleccionada) {
                              asignarJugadorAPosicion(
                                jugador,
                                posicionSeleccionada
                              );
                            }
                          }}
                          className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold shadow-lg transition-all duration-300 overflow-hidden ${
                            asignado
                              ? "border-gray-500 opacity-50 cursor-grab"
                              : accionActiva
                              ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-blue-300"
                              : posicionSeleccionada
                              ? "border-blue-700 cursor-pointer hover:scale-125 hover:ring-4 hover:ring-green-300"
                              : "border-blue-700 cursor-grab hover:scale-110 active:cursor-grabbing"
                          } ${debeAnimarse ? "scale-125" : ""}`}
                          style={{
                            background: asignado
                              ? "#9ca3af"
                              : `linear-gradient(to bottom, #cbd5e1 ${porcentajeEsfuerzo}%, #3b82f6 ${porcentajeEsfuerzo}%)`,
                          }}
                          title={
                            accionActiva
                              ? `Click para aplicar ${accionActiva}`
                              : posicionSeleccionada
                              ? `Click para asignar a ${posicionSeleccionada}`
                              : "Arrastra a la pista o a zona de acciones"
                          }
                        >
                          <div className="flex flex-col items-center">
                            {tieneRoja ? (
                              <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                                {jugador.numero_dorsal}
                              </div>
                            ) : tieneAmarilla ? (
                              <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                                {jugador.numero_dorsal}
                              </div>
                            ) : (
                              <span className="text-white text-lg">
                                {jugador.numero_dorsal}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

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
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={deshacer}
                  disabled={
                    historialAcciones.length === 0 ||
                    estadoPartido === "configuracion"
                  }
                  className="w-24 h-[74px] bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center cursor-pointer border-2 border-transparent hover:border-white"
                >
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </button>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleAccionDrop(e, "gol")}
                  onClick={() => {
                    if (accionActiva === "gol") {
                      setAccionActiva(null);
                    } else {
                      if (validarEstadoParaAccion("gol")) {
                        setPosicionSeleccionada(null);
                        setAccionActiva("gol");
                      }
                    }
                  }}
                  className={`w-24 h-[74px] bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "gol"
                      ? "ring-4 ring-green-300 scale-125 border-white shadow-2xl"
                      : "border-transparent hover:border-white hover:scale-105"
                  } ${
                    accionActiva === "gol"
                      ? "animate-[pulse_0.8s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    animation:
                      accionActiva === "gol"
                        ? "pulse 0.8s ease-in-out infinite"
                        : "none",
                  }}
                  title={
                    accionActiva === "gol"
                      ? "Click en un jugador para anotar gol"
                      : "Click para activar o arrastra jugador aquí"
                  }
                >
                  <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none">
                    <circle
                      cx="25"
                      cy="25"
                      r="23"
                      fill="white"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-xs font-bold">GOL</span>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleAccionDrop(e, "falta")}
                  onClick={() => {
                    if (accionActiva === "falta") {
                      setAccionActiva(null);
                    } else {
                      if (validarEstadoParaAccion("falta")) {
                        setPosicionSeleccionada(null);
                        setAccionActiva("falta");
                      }
                    }
                  }}
                  className={`w-24 h-[74px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "falta"
                      ? "ring-4 ring-orange-300 scale-125 border-white shadow-2xl"
                      : "border-transparent hover:border-white hover:scale-105"
                  } ${
                    accionActiva === "falta"
                      ? "animate-[pulse_0.8s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    animation:
                      accionActiva === "falta"
                        ? "pulse 0.8s ease-in-out infinite"
                        : "none",
                  }}
                  title={
                    accionActiva === "falta"
                      ? "Click en un jugador para anotar falta"
                      : "Click para activar o arrastra jugador aquí"
                  }
                >
                  <svg
                    className="w-10 h-10"
                    viewBox="0 0 50 50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  >
                    <line x1="10" y1="10" x2="40" y2="40" />
                    <line x1="40" y1="10" x2="10" y2="40" />
                  </svg>
                  <span className="text-xs font-bold">FALTA</span>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleAccionDrop(e, "amarilla")}
                  onClick={() => {
                    if (accionActiva === "amarilla") {
                      setAccionActiva(null);
                    } else {
                      if (validarEstadoParaAccion("amarilla")) {
                        setPosicionSeleccionada(null);
                        setAccionActiva("amarilla");
                      }
                    }
                  }}
                  className={`w-24 h-[74px] bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "amarilla"
                      ? "ring-4 ring-yellow-300 scale-125 border-gray-800 shadow-2xl"
                      : "border-transparent hover:border-gray-800 hover:scale-105"
                  } ${
                    accionActiva === "amarilla"
                      ? "animate-[pulse_0.8s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    animation:
                      accionActiva === "amarilla"
                        ? "pulse 0.8s ease-in-out infinite"
                        : "none",
                  }}
                  title={
                    accionActiva === "amarilla"
                      ? "Click en un jugador para tarjeta amarilla"
                      : "Click para activar o arrastra jugador aquí"
                  }
                >
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="6"
                      y="4"
                      width="12"
                      height="16"
                      rx="2"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleAccionDrop(e, "roja")}
                  onClick={() => {
                    if (accionActiva === "roja") {
                      setAccionActiva(null);
                    } else {
                      if (validarEstadoParaAccion("roja")) {
                        setPosicionSeleccionada(null);
                        setAccionActiva("roja");
                      }
                    }
                  }}
                  className={`w-24 h-[74px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "roja"
                      ? "ring-4 ring-red-300 scale-125 border-white shadow-2xl"
                      : "border-transparent hover:border-white hover:scale-105"
                  } ${
                    accionActiva === "roja"
                      ? "animate-[pulse_0.8s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    animation:
                      accionActiva === "roja"
                        ? "pulse 0.8s ease-in-out infinite"
                        : "none",
                  }}
                  title={
                    accionActiva === "roja"
                      ? "Click en un jugador para tarjeta roja"
                      : "Click para activar o arrastra jugador aquí"
                  }
                >
                  <svg
                    className="w-10 h-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="6"
                      y="4"
                      width="12"
                      height="16"
                      rx="2"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Jugadores Visitantes - Derecha (3 columnas) */}
            <div
              className="flex-shrink-0 flex flex-col items-center"
              onDrop={handleDropFueraPista}
              onDragOver={handleDragOverFueraPista}
            >
              {/* Bolas de Staff Técnico visitante encima de jugadores - 1 fila */}
              <div className="flex justify-center gap-2 mb-3">
                {/* Entrenador */}
                <div
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, {
                      id: "staff-visitante-E",
                      nombre: "Entrenador Visitante",
                      numero_dorsal: "E",
                    })
                  }
                  onDragEnd={(e) => {
                    e.target.style.opacity = "1";
                  }}
                  onClick={() => {
                    if (accionActiva) {
                      ejecutarAccion(
                        {
                          id: "staff-visitante-E",
                          nombre: "Entrenador Visitante",
                          numero_dorsal: "E",
                        },
                        accionActiva
                      );
                    }
                  }}
                  className={`relative w-14 h-14 rounded-full bg-amber-600 border-2 border-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform overflow-hidden ${
                    accionActiva
                      ? "cursor-pointer hover:ring-4 hover:ring-amber-300"
                      : "cursor-grab active:cursor-grabbing"
                  }`}
                  title={
                    accionActiva
                      ? `Click para aplicar ${accionActiva}`
                      : "Entrenador Visitante - Arrastra para asignar tarjeta"
                  }
                >
                  {estadisticas["staff-visitante-E"]?.rojas > 0 ? (
                    <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      E
                    </div>
                  ) : estadisticas["staff-visitante-E"]?.amarillas > 0 ? (
                    <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                      E
                    </div>
                  ) : (
                    "E"
                  )}
                </div>
                {/* Delegado */}
                <div
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, {
                      id: "staff-visitante-D",
                      nombre: "Delegado Visitante",
                      numero_dorsal: "D",
                    })
                  }
                  onDragEnd={(e) => {
                    e.target.style.opacity = "1";
                  }}
                  onClick={() => {
                    if (accionActiva) {
                      ejecutarAccion(
                        {
                          id: "staff-visitante-D",
                          nombre: "Delegado Visitante",
                          numero_dorsal: "D",
                        },
                        accionActiva
                      );
                    }
                  }}
                  className={`relative w-14 h-14 rounded-full bg-amber-600 border-2 border-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform overflow-hidden ${
                    accionActiva
                      ? "cursor-pointer hover:ring-4 hover:ring-amber-300"
                      : "cursor-grab active:cursor-grabbing"
                  }`}
                  title={
                    accionActiva
                      ? `Click para aplicar ${accionActiva}`
                      : "Delegado Visitante - Arrastra para asignar tarjeta"
                  }
                >
                  {estadisticas["staff-visitante-D"]?.rojas > 0 ? (
                    <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      D
                    </div>
                  ) : estadisticas["staff-visitante-D"]?.amarillas > 0 ? (
                    <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                      D
                    </div>
                  ) : (
                    "D"
                  )}
                </div>
                {/* Auxiliar */}
                <div
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, {
                      id: "staff-visitante-A",
                      nombre: "Auxiliar Visitante",
                      numero_dorsal: "A",
                    })
                  }
                  onDragEnd={(e) => {
                    e.target.style.opacity = "1";
                  }}
                  onClick={() => {
                    if (accionActiva) {
                      ejecutarAccion(
                        {
                          id: "staff-visitante-A",
                          nombre: "Auxiliar Visitante",
                          numero_dorsal: "A",
                        },
                        accionActiva
                      );
                    }
                  }}
                  className={`relative w-14 h-14 rounded-full bg-amber-600 border-2 border-amber-800 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-110 transition-transform overflow-hidden ${
                    accionActiva
                      ? "cursor-pointer hover:ring-4 hover:ring-amber-300"
                      : "cursor-grab active:cursor-grabbing"
                  }`}
                  title={
                    accionActiva
                      ? `Click para aplicar ${accionActiva}`
                      : "Auxiliar Visitante - Arrastra para asignar tarjeta"
                  }
                >
                  {estadisticas["staff-visitante-A"]?.rojas > 0 ? (
                    <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      A
                    </div>
                  ) : estadisticas["staff-visitante-A"]?.amarillas > 0 ? (
                    <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                      A
                    </div>
                  ) : (
                    "A"
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {/* Columna 1: números 1-4 */}
                <div className="flex flex-col items-center gap-2">
                  {[1, 2, 3, 4].map((numero) => {
                    const dorsalMostrado = obtenerDorsalVisitante(numero);
                    const jugadorId = `visitante-${numero}`;
                    const stats = estadisticas[jugadorId];
                    const tieneAmarilla = stats?.amarillas > 0;
                    const tieneRoja = stats?.rojas > 0;
                    const estaActivo = jugadoresVisitantesActivos[numero];
                    const dorsalPersonalizado =
                      dorsalesVisitantes[numero] !== undefined;

                    // Ocultar jugadores desactivados después de iniciar partido
                    if (!estaActivo && estadoPartido !== "configuracion") {
                      return null;
                    }

                    return (
                      <div
                        key={numero}
                        draggable={editandoDorsal !== numero && estaActivo}
                        onDragStart={(e) => {
                          if (editandoDorsal !== numero && estaActivo) {
                            handleDragStart(e, {
                              id: jugadorId,
                              nombre: `Visitante ${dorsalMostrado}`,
                              numero_dorsal: dorsalMostrado,
                            });
                          }
                        }}
                        onDragEnd={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        onClick={() => {
                          if (
                            accionActiva &&
                            editandoDorsal !== numero &&
                            estaActivo
                          ) {
                            ejecutarAccion(
                              {
                                id: jugadorId,
                                nombre: `Visitante ${dorsalMostrado}`,
                                numero_dorsal: dorsalMostrado,
                              },
                              accionActiva
                            );
                          } else if (!accionActiva && estaActivo) {
                            setEditandoDorsal(numero);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-base shadow-lg transition-transform overflow-visible ${
                          !estaActivo
                            ? "bg-gray-400 border-gray-500 opacity-50"
                            : dorsalPersonalizado
                            ? "bg-gray-200 border-gray-400 text-gray-700"
                            : "bg-white border-gray-400 text-gray-700"
                        } ${
                          editandoDorsal === numero
                            ? "border-blue-500"
                            : accionActiva && estaActivo
                            ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                            : estaActivo
                            ? "hover:scale-110 hover:border-blue-500"
                            : ""
                        }`}
                        style={{
                          cursor:
                            editandoDorsal === numero
                              ? "text"
                              : accionActiva && estaActivo
                              ? "pointer"
                              : estaActivo
                              ? "grab"
                              : "not-allowed",
                        }}
                        title={
                          !estaActivo
                            ? "Jugador desactivado"
                            : editandoDorsal === numero
                            ? `Editando dorsal ${numero}`
                            : accionActiva
                            ? `Click para aplicar ${accionActiva}`
                            : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
                        }
                      >
                        {/* Botón X/✓ para desactivar/activar jugador - solo en configuración */}
                        {estadoPartido === "configuracion" &&
                          editandoDorsal !== numero && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleJugadorVisitante(numero);
                              }}
                              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 transition-colors ${
                                estaActivo
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                              title={
                                estaActivo
                                  ? "Desactivar jugador"
                                  : "Activar jugador"
                              }
                            >
                              {estaActivo ? "×" : "✓"}
                            </button>
                          )}
                        {editandoDorsal === numero ? (
                          <input
                            type="text"
                            defaultValue={dorsalMostrado}
                            onBlur={(e) =>
                              actualizarDorsalVisitante(numero, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                actualizarDorsalVisitante(
                                  numero,
                                  e.target.value
                                );
                              }
                              if (e.key === "Escape") {
                                setEditandoDorsal(null);
                              }
                            }}
                            autoFocus
                            className="w-12 h-12 text-center rounded-full border-2 border-blue-500 text-gray-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength="3"
                          />
                        ) : tieneRoja ? (
                          <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                            {dorsalMostrado}
                          </div>
                        ) : tieneAmarilla ? (
                          <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                            {dorsalMostrado}
                          </div>
                        ) : (
                          dorsalMostrado
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Columna 2: números 5-8 */}
                <div className="flex flex-col items-center gap-2">
                  {[5, 6, 7, 8].map((numero) => {
                    const dorsalMostrado = obtenerDorsalVisitante(numero);
                    const jugadorId = `visitante-${numero}`;
                    const stats = estadisticas[jugadorId];
                    const tieneAmarilla = stats?.amarillas > 0;
                    const tieneRoja = stats?.rojas > 0;
                    const estaActivo = jugadoresVisitantesActivos[numero];
                    const dorsalPersonalizado =
                      dorsalesVisitantes[numero] !== undefined;

                    // Ocultar jugadores desactivados después de iniciar partido
                    if (!estaActivo && estadoPartido !== "configuracion") {
                      return null;
                    }

                    return (
                      <div
                        key={numero}
                        draggable={editandoDorsal !== numero && estaActivo}
                        onDragStart={(e) => {
                          if (editandoDorsal !== numero && estaActivo) {
                            handleDragStart(e, {
                              id: jugadorId,
                              nombre: `Visitante ${dorsalMostrado}`,
                              numero_dorsal: dorsalMostrado,
                            });
                          }
                        }}
                        onDragEnd={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        onClick={() => {
                          if (
                            accionActiva &&
                            editandoDorsal !== numero &&
                            estaActivo
                          ) {
                            ejecutarAccion(
                              {
                                id: jugadorId,
                                nombre: `Visitante ${dorsalMostrado}`,
                                numero_dorsal: dorsalMostrado,
                              },
                              accionActiva
                            );
                          } else if (!accionActiva && estaActivo) {
                            setEditandoDorsal(numero);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-base shadow-lg transition-transform overflow-visible ${
                          !estaActivo
                            ? "bg-gray-400 border-gray-500 opacity-50"
                            : dorsalPersonalizado
                            ? "bg-gray-200 border-gray-400 text-gray-700"
                            : "bg-white border-gray-400 text-gray-700"
                        } ${
                          editandoDorsal === numero
                            ? "border-blue-500"
                            : accionActiva && estaActivo
                            ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                            : estaActivo
                            ? "hover:scale-110 hover:border-blue-500"
                            : ""
                        }`}
                        style={{
                          cursor:
                            editandoDorsal === numero
                              ? "text"
                              : accionActiva && estaActivo
                              ? "pointer"
                              : estaActivo
                              ? "grab"
                              : "not-allowed",
                        }}
                        title={
                          !estaActivo
                            ? "Jugador desactivado"
                            : editandoDorsal === numero
                            ? `Editando dorsal ${numero}`
                            : accionActiva
                            ? `Click para aplicar ${accionActiva}`
                            : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
                        }
                      >
                        {/* Botón X/✓ para desactivar/activar jugador - solo en configuración */}
                        {estadoPartido === "configuracion" &&
                          editandoDorsal !== numero && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleJugadorVisitante(numero);
                              }}
                              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 transition-colors ${
                                estaActivo
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                              title={
                                estaActivo
                                  ? "Desactivar jugador"
                                  : "Activar jugador"
                              }
                            >
                              {estaActivo ? "×" : "✓"}
                            </button>
                          )}
                        {editandoDorsal === numero ? (
                          <input
                            type="text"
                            defaultValue={dorsalMostrado}
                            onBlur={(e) =>
                              actualizarDorsalVisitante(numero, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                actualizarDorsalVisitante(
                                  numero,
                                  e.target.value
                                );
                              }
                              if (e.key === "Escape") {
                                setEditandoDorsal(null);
                              }
                            }}
                            autoFocus
                            className="w-12 h-12 text-center rounded-full border-2 border-blue-500 text-gray-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength="3"
                          />
                        ) : tieneRoja ? (
                          <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                            {dorsalMostrado}
                          </div>
                        ) : tieneAmarilla ? (
                          <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                            {dorsalMostrado}
                          </div>
                        ) : (
                          dorsalMostrado
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Columna 3: números 9-12 */}
                <div className="flex flex-col items-center gap-2">
                  {[9, 10, 11, 12].map((numero) => {
                    const dorsalMostrado = obtenerDorsalVisitante(numero);
                    const jugadorId = `visitante-${numero}`;
                    const stats = estadisticas[jugadorId];
                    const tieneAmarilla = stats?.amarillas > 0;
                    const tieneRoja = stats?.rojas > 0;
                    const estaActivo = jugadoresVisitantesActivos[numero];
                    const dorsalPersonalizado =
                      dorsalesVisitantes[numero] !== undefined;

                    // Ocultar jugadores desactivados después de iniciar partido
                    if (!estaActivo && estadoPartido !== "configuracion") {
                      return null;
                    }

                    return (
                      <div
                        key={numero}
                        draggable={editandoDorsal !== numero && estaActivo}
                        onDragStart={(e) => {
                          if (editandoDorsal !== numero && estaActivo) {
                            handleDragStart(e, {
                              id: jugadorId,
                              nombre: `Visitante ${dorsalMostrado}`,
                              numero_dorsal: dorsalMostrado,
                            });
                          }
                        }}
                        onDragEnd={(e) => {
                          e.target.style.opacity = "1";
                        }}
                        onClick={() => {
                          if (
                            accionActiva &&
                            editandoDorsal !== numero &&
                            estaActivo
                          ) {
                            ejecutarAccion(
                              {
                                id: jugadorId,
                                nombre: `Visitante ${dorsalMostrado}`,
                                numero_dorsal: dorsalMostrado,
                              },
                              accionActiva
                            );
                          } else if (!accionActiva && estaActivo) {
                            setEditandoDorsal(numero);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-base shadow-lg transition-transform overflow-visible ${
                          !estaActivo
                            ? "bg-gray-400 border-gray-500 opacity-50"
                            : dorsalPersonalizado
                            ? "bg-gray-200 border-gray-400 text-gray-700"
                            : "bg-white border-gray-400 text-gray-700"
                        } ${
                          editandoDorsal === numero
                            ? "border-blue-500"
                            : accionActiva && estaActivo
                            ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                            : estaActivo
                            ? "hover:scale-110 hover:border-blue-500"
                            : ""
                        }`}
                        style={{
                          cursor:
                            editandoDorsal === numero
                              ? "text"
                              : accionActiva && estaActivo
                              ? "pointer"
                              : estaActivo
                              ? "grab"
                              : "not-allowed",
                        }}
                        title={
                          !estaActivo
                            ? "Jugador desactivado"
                            : editandoDorsal === numero
                            ? `Editando dorsal ${numero}`
                            : accionActiva
                            ? `Click para aplicar ${accionActiva}`
                            : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
                        }
                      >
                        {/* Botón X/✓ para desactivar/activar jugador - solo en configuración */}
                        {estadoPartido === "configuracion" &&
                          editandoDorsal !== numero && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleJugadorVisitante(numero);
                              }}
                              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 transition-colors ${
                                estaActivo
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : "bg-green-500 hover:bg-green-600 text-white"
                              }`}
                              title={
                                estaActivo
                                  ? "Desactivar jugador"
                                  : "Activar jugador"
                              }
                            >
                              {estaActivo ? "×" : "✓"}
                            </button>
                          )}
                        {editandoDorsal === numero ? (
                          <input
                            type="text"
                            defaultValue={dorsalMostrado}
                            onBlur={(e) =>
                              actualizarDorsalVisitante(numero, e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                actualizarDorsalVisitante(
                                  numero,
                                  e.target.value
                                );
                              }
                              if (e.key === "Escape") {
                                setEditandoDorsal(null);
                              }
                            }}
                            autoFocus
                            className="w-12 h-12 text-center rounded-full border-2 border-blue-500 text-gray-700 font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength="3"
                          />
                        ) : tieneRoja ? (
                          <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                            {dorsalMostrado}
                          </div>
                        ) : tieneAmarilla ? (
                          <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                            {dorsalMostrado}
                          </div>
                        ) : (
                          dorsalMostrado
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de jugadores con minutos jugados */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-700 mb-3">
            Minutos Jugados
          </h3>
          <div className="grid grid-cols-6 gap-2">
            {jugadores
              .sort((a, b) => {
                const minutosA = estadisticas[a.id]?.minutos || 0;
                const minutosB = estadisticas[b.id]?.minutos || 0;
                return minutosB - minutosA; // Mayor a menor
              })
              .map((jugador) => {
                const stats = estadisticas[jugador.id];
                const segundos = stats?.minutos || 0;
                const tiempoFormateado = formatearTiempo(segundos);
                const enPista = isJugadorAsignado(jugador.id);
                const tieneAmarilla = stats?.amarillas > 0;
                const tieneRoja = stats?.rojas > 0;
                const numGoles = stats?.goles || 0;

                return (
                  <div
                    key={jugador.id}
                    className={`flex items-stretch p-2 rounded-lg border-2 gap-2 ${
                      enPista
                        ? "bg-green-50 border-green-500"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    {/* Columna 1: Dorsal/Alias y Minutos */}
                    <div className="flex flex-col justify-between flex-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-blue-600 text-base">
                          {jugador.numero_dorsal}
                        </span>
                        <span className="text-gray-700 text-xs truncate max-w-[45px]">
                          {jugador.alias || jugador.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="font-bold text-gray-800 text-base font-mono">
                          {tiempoFormateado}
                        </span>
                      </div>
                    </div>

                    {/* Columna 2: Balón con goles (ocupa alto completo) */}
                    {numGoles > 0 && (
                      <div className="flex items-center justify-center">
                        <div className="relative w-8 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-800 relative z-10">
                            {numGoles}
                          </span>
                          {/* Patrón de balón simplificado */}
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 20 20"
                          >
                            <circle
                              cx="10"
                              cy="10"
                              r="9"
                              fill="none"
                              stroke="#000"
                              strokeWidth="0.5"
                            />
                            <path
                              d="M10 2 L11 6 L10 10 L9 6 Z"
                              fill="#000"
                              fillOpacity="0.15"
                            />
                            <path
                              d="M18 10 L14 11 L10 10 L14 9 Z"
                              fill="#000"
                              fillOpacity="0.15"
                            />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Columna 3: Tarjetas (amarilla arriba, roja abajo) */}
                    <div className="flex flex-col justify-between">
                      <div className="h-1/2 flex items-start">
                        {tieneAmarilla && (
                          <div className="w-4 h-5 bg-yellow-400 rounded-sm border border-yellow-600"></div>
                        )}
                      </div>
                      <div className="h-1/2 flex items-end">
                        {tieneRoja && (
                          <div className="w-4 h-5 bg-red-500 rounded-sm border border-red-700"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Card de Botones de Acción */}
        {partidoId && partidoInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex flex-wrap gap-3 justify-start items-center">
              {/* Botón Finalizar Excepcional - Rojo */}
              <button
                onClick={finalizarPartidoExcepcional}
                disabled={finalizandoPartido}
                className={`px-6 py-3 font-bold rounded-lg shadow-md transition-all flex items-center gap-2 ${
                  finalizandoPartido
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-red-600 hover:bg-red-700 text-white hover:scale-105"
                }`}
                title="Finalizar partido de forma excepcional (requiere motivo)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Finalizar Partido (Excepcional)
              </button>

              {/* Botón Ver Datos */}
              <button
                onClick={mostrarDatosLocalStorage}
                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
                title="Ver datos guardados en localStorage"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Ver Datos
              </button>

              {/* Botón Volver */}
              <button
                onClick={() => setModalVolverDashboard(true)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
                title="Volver al dashboard"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver
              </button>
            </div>
          </div>
        )}

        {/* Navegación para usuarios sin partido */}
        {!partidoId && (
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2 mb-4"
            title="Volver al dashboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver
          </button>
        )}

        {/* Modal de confirmación con countdown de 5 segundos */}
        {confirmacionPendiente && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slideUp">
              <div className="text-center">
                <div className="mb-4">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Confirmar acción
                </h3>

                <p className="text-gray-600 mb-6">
                  {confirmacionPendiente.tipo === "toggle_cronometro" &&
                    (confirmacionPendiente.data.nuevoEstado
                      ? "¿Iniciar cronómetro?"
                      : "¿Detener cronómetro?")}
                  {confirmacionPendiente.tipo === "incrementar_gol_local" &&
                    "¿Añadir gol al equipo local?"}
                  {confirmacionPendiente.tipo === "decrementar_gol_local" &&
                    "¿Eliminar gol al equipo local?"}
                  {confirmacionPendiente.tipo === "incrementar_gol_visitante" &&
                    "¿Añadir gol al equipo visitante?"}
                  {confirmacionPendiente.tipo === "decrementar_gol_visitante" &&
                    "¿Eliminar gol al equipo visitante?"}
                  {confirmacionPendiente.tipo === "resetear_cronometro" &&
                    "¿Resetear el cronómetro a 0?"}
                </p>

                {/* Countdown visual */}
                <div className="mb-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <svg className="transform -rotate-90 w-20 h-20">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={226.19}
                        strokeDashoffset={
                          226.19 * (1 - tiempoRestanteConfirmacion / 5)
                        }
                        strokeLinecap="round"
                        className="transition-all duration-100"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.ceil(tiempoRestanteConfirmacion)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Se cancelará automáticamente
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={cancelarConfirmacion}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarAccion}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Diálogo: Cargar datos desde localStorage */}
        {/* Diálogo: Validación de Jugadores */}
        {mostrarDialogoValidacionJugadores && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  ⚠️ Configuración Incompleta
                </h3>
              </div>
              <p className="text-gray-700 text-center mb-4">
                Debes colocar{" "}
                <strong className="text-red-600">
                  exactamente 5 jugadores
                </strong>{" "}
                en la pista para iniciar el partido.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-800 font-medium">
                    Jugadores en pista:
                  </span>
                  <span className="text-2xl font-bold text-red-600">
                    {jugadoresEnPistaCount} / 5
                  </span>
                </div>
                <p className="text-xs text-red-700 mt-2">
                  {jugadoresEnPistaCount < 5
                    ? `Faltan ${5 - jugadoresEnPistaCount} jugador${
                        5 - jugadoresEnPistaCount !== 1 ? "es" : ""
                      }`
                    : `Sobran ${jugadoresEnPistaCount - 5} jugador${
                        jugadoresEnPistaCount - 5 !== 1 ? "es" : ""
                      }`}
                </p>
              </div>
              <button
                onClick={() => setMostrarDialogoValidacionJugadores(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        {/* Diálogo: Iniciar Partido */}
        {mostrarDialogoIniciarPartido && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  ¿Iniciar Partido?
                </h3>
              </div>
              <p className="text-gray-600 text-center mb-6">
                Una vez iniciado, se activará el cronómetro y podrás registrar
                acciones durante el partido.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Asegúrate de tener configurados todos
                  los jugadores antes de comenzar.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarDialogoIniciarPartido(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setMostrarDialogoIniciarPartido(false);
                    setEstadoPartido("primera_parte");
                    setPeriodoActual(1);
                    setCronometroActivo(true);
                  }}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Iniciar Partido
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarDialogoLocalStorage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4 text-blue-600">
                Datos Encontrados en Caché
              </h3>
              <p className="text-gray-700 mb-6">
                Se han encontrado datos guardados localmente para este partido.
                ¿Deseas cargar estos datos y continuar donde lo dejaste?
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Si eliges "No", se iniciarán datos
                  nuevos y los datos guardados se borrarán.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Primero limpiar localStorage
                    limpiarLocalStoragePartido();
                    // Cerrar el diálogo
                    setMostrarDialogoLocalStorage(false);
                    // Generar un nuevo ID de partido para evitar conflictos
                    const nuevoPartidoId =
                      partidoIdParam || `partido_${Date.now()}`;
                    if (!partidoIdParam) {
                      localStorage.setItem("partidoActualId", nuevoPartidoId);
                    }
                    // Recargar página para empezar limpio
                    window.location.reload();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  No, Empezar Nuevo
                </button>
                <button
                  onClick={cargarDesdeLocalStorage}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sí, Cargar Datos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Diálogo: Resetear partido con datos en BD */}
        {mostrarDialogoResetPartido && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4 text-red-600">
                ⚠️ Partido Ya Finalizado
              </h3>
              <p className="text-gray-700 mb-6">
                Este partido ya tiene datos guardados en la base de datos (fue
                finalizado anteriormente). ¿Deseas resetear el partido y empezar
                de nuevo?
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Esta acción no borrará los datos
                  de la BD, pero permitirá configurar un nuevo partido con este
                  ID.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setMostrarDialogoResetPartido(false);
                    navigate("/dashboard");
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={resetearPartido}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sí, Resetear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visor de datos de localStorage */}
        {mostrarVisorLocalStorage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-blue-600">
                  Datos en LocalStorage - Partido {partidoId}
                </h3>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {datosLocalStoragePartido ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(datosLocalStoragePartido, null, 2)}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No hay datos guardados para este partido
                  </p>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
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
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  disabled={!datosLocalStoragePartido}
                >
                  Copiar al Portapapeles
                </button>
                <button
                  onClick={() => setMostrarVisorLocalStorage(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Tiempo Muerto */}
        {modalTiempoMuerto.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <span className="text-4xl">⏸️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  ¿Solicitar Tiempo Muerto?
                </h3>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Equipo:</strong>{" "}
                    {modalTiempoMuerto.equipo === "local"
                      ? "LA CÚPULA"
                      : partidoInfo?.rival || "VISITANTE"}
                  </p>
                  <p>
                    <strong>Parte:</strong> {periodoActual === 1 ? "1ª" : "2ª"}
                  </p>
                  <p>
                    <strong>Duración:</strong> 1 minuto
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mb-6">
                El cronómetro del partido continuará corriendo durante el tiempo
                muerto.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setModalTiempoMuerto({ visible: false, equipo: null })
                  }
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarTiempoMuerto}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Finalizar Primera Parte */}
        {modalFinalizarPrimera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <span className="text-4xl">🏁</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  ¿Finalizar Primera Parte?
                </h3>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Resultado parcial:</strong> {golesLocal} -{" "}
                    {golesVisitante}
                  </p>
                  <p>
                    <strong>Faltas:</strong> {faltasLocal} - {faltasVisitante}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mb-6">
                Se resetearán las faltas del primer período y podrás iniciar la
                segunda parte cuando estés listo.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalFinalizarPrimera(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarFinalizarPrimera}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Finalizar 1ª Parte
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Iniciar Segunda Parte */}
        {modalIniciarSegunda && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  ¿Iniciar Segunda Parte?
                </h3>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Resultado:</strong> {golesLocal} - {golesVisitante}
                  </p>
                  <p>
                    <strong>Faltas acumuladas:</strong> {faltasLocal} -{" "}
                    {faltasVisitante}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center mb-6">
                Se reactivará el cronómetro y comenzará el segundo período del
                partido.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalIniciarSegunda(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarIniciarSegunda}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Iniciar 2ª Parte
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Finalizar Partido (sin estadísticas) */}
        {modalFinalizarPartido && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Partido sin Estadísticas
                </h3>
              </div>
              <p className="text-gray-600 text-center mb-6">
                No hay acciones registradas. ¿Estás seguro de que quieres
                finalizar el partido sin estadísticas?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalFinalizarPartido(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setModalFinalizarPartido(false);
                    ejecutarFinalizacionPartido();
                  }}
                  className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Finalizar Igualmente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Finalizar Excepcional (con motivo) */}
        {modalFinalizarExcepcional.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Finalización Excepcional
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                ¿Por qué estás finalizando el partido de forma excepcional?
              </p>
              <textarea
                value={modalFinalizarExcepcional.motivo}
                onChange={(e) =>
                  setModalFinalizarExcepcional({
                    ...modalFinalizarExcepcional,
                    motivo: e.target.value,
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                rows="4"
                placeholder="Escribe el motivo de la finalización excepcional..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setModalFinalizarExcepcional({ visible: false, motivo: "" })
                  }
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarFinalizarExcepcional}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Finalizar Partido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: ALERTA JUGADORES FALTANTES (grande y llamativo) */}
        {alertaJugadoresFaltantes && (
          <div className="fixed inset-0 bg-red-600 bg-opacity-95 flex items-center justify-center z-[60] p-4 animate-pulse">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-12 border-8 border-red-600">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-6 animate-bounce">
                  <svg
                    className="w-20 h-20 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-6xl font-black text-red-600 mb-6 uppercase tracking-wider">
                  ¡CUIDADOOOOOO!
                </h3>
                <p className="text-4xl font-bold text-gray-800 mb-8">
                  TE FALTAN JUGADORES EN PISTA
                </p>
                <div className="bg-red-50 border-4 border-red-300 rounded-xl p-6 mb-8">
                  <p className="text-2xl font-semibold text-red-800">
                    ⚠️ Debes tener 5 jugadores en pista en todo momento
                  </p>
                </div>
                <button
                  onClick={() => setAlertaJugadoresFaltantes(false)}
                  className="px-12 py-6 bg-red-600 text-white text-2xl font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                >
                  ¡ENTENDIDO!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Alerta General (success, error, info, warning) */}
        {modalAlerta.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    modalAlerta.tipo === "success"
                      ? "bg-green-100"
                      : modalAlerta.tipo === "error"
                      ? "bg-red-100"
                      : modalAlerta.tipo === "warning"
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  }`}
                >
                  {modalAlerta.tipo === "success" && (
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {modalAlerta.tipo === "error" && (
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  {modalAlerta.tipo === "warning" && (
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  )}
                  {modalAlerta.tipo === "info" && (
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {modalAlerta.titulo}
                </h3>
              </div>
              <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
                {modalAlerta.mensaje}
              </p>
              {modalAlerta.tipo === "warning" &&
              (modalAlerta.onConfirm || modalAlerta.onCancel) ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (modalAlerta.onCancel) modalAlerta.onCancel();
                      setModalAlerta({
                        visible: false,
                        titulo: "",
                        mensaje: "",
                        tipo: "info",
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (modalAlerta.onConfirm) modalAlerta.onConfirm();
                      setModalAlerta({
                        visible: false,
                        titulo: "",
                        mensaje: "",
                        tipo: "info",
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                  >
                    Continuar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (modalAlerta.onConfirm) modalAlerta.onConfirm();
                    setModalAlerta({
                      visible: false,
                      titulo: "",
                      mensaje: "",
                      tipo: "info",
                    });
                  }}
                  className={`w-full px-4 py-3 rounded-lg hover:opacity-90 transition-colors font-medium text-white ${
                    modalAlerta.tipo === "success"
                      ? "bg-green-600"
                      : modalAlerta.tipo === "error"
                      ? "bg-red-600"
                      : "bg-blue-600"
                  }`}
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal: Confirmación de Acción Fuera de Tiempo de Juego */}
        {modalConfirmarAccion.visible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Acción Fuera de Tiempo
                </h3>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>Advertencia:</strong> El partido{" "}
                  {estadoPartido === "configuracion"
                    ? "aún no ha comenzado"
                    : estadoPartido === "descanso"
                    ? "está en descanso"
                    : estadoPartido === "finalizado"
                    ? "ha finalizado"
                    : tiempoMuertoActivo
                    ? "está en tiempo muerto"
                    : "no está en tiempo de juego activo"}
                  .
                </p>
              </div>
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que deseas registrar esta acción (
                {modalConfirmarAccion.accion === "gol"
                  ? "GOL"
                  : modalConfirmarAccion.accion === "falta"
                  ? "FALTA"
                  : modalConfirmarAccion.accion === "amarilla"
                  ? "TARJETA AMARILLA"
                  : modalConfirmarAccion.accion === "roja"
                  ? "TARJETA ROJA"
                  : ""}
                ) en este momento?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setModalConfirmarAccion({ visible: false, accion: null })
                  }
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAccionFueraDeTiempo}
                  className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Sí, Registrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmación Volver al Dashboard */}
        {modalVolverDashboard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  ¿Volver al Dashboard?
                </h3>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Si vuelves al dashboard sin
                  finalizar el partido, los datos se mantendrán guardados en el
                  navegador y podrás continuar más tarde.
                </p>
              </div>
              <p className="text-gray-600 text-center mb-6">
                Todos los datos del partido están guardados localmente. Puedes
                regresar en cualquier momento para continuar donde lo dejaste.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalVolverDashboard(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setModalVolverDashboard(false);
                    navigate("/dashboard");
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sí, Volver
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigurarPartido;
