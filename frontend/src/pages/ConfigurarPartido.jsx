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
  const [partidoId, setPartidoId] = useState(null);
  const [partidoInfo, setPartidoInfo] = useState(null);
  const [accionActiva, setAccionActiva] = useState(null); // null | "amarilla" | "roja" | "gol" | "falta"
  const [posicionSeleccionada, setPosicionSeleccionada] = useState(null); // null | "portero" | "cierre" | "alaSuperior" | "alaInferior" | "pivote"

  // Estados para el flujo del partido
  const [estadoPartido, setEstadoPartido] = useState("configuracion"); // "configuracion" | "primera_parte" | "descanso" | "segunda_parte" | "finalizado"
  const [periodoActual, setPeriodoActual] = useState(1); // 1 o 2
  const [faltasLocalPrimera, setFaltasLocalPrimera] = useState(0);
  const [faltasLocalSegunda, setFaltasLocalSegunda] = useState(0);
  const [faltasVisitantePrimera, setFaltasVisitantePrimera] = useState(0);
  const [faltasVisitanteSegunda, setFaltasVisitanteSegunda] = useState(0);

  // Estados para confirmaciones
  const [confirmacionPendiente, setConfirmacionPendiente] = useState(null); // { tipo: string, data: any, timestamp: number }
  const [tiempoRestanteConfirmacion, setTiempoRestanteConfirmacion] =
    useState(0);

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
  }, [cronometroActivo, contadoresJugadores]);

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

    console.log("Nuevo partido creado:", nuevoPartidoId);
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
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar el partido (después de configurar titulares)
  const iniciarPartido = () => {
    const jugadoresEnPista = Object.keys(jugadoresAsignados).length;
    if (jugadoresEnPista !== 5) {
      alert(
        `Debes colocar exactamente 5 jugadores en la pista para iniciar el partido.\n\nActualmente hay ${jugadoresEnPista} jugadores en la pista.`
      );
      return;
    }

    const confirmar = confirm(
      "¿Iniciar partido?\n\nUna vez iniciado, se activará el cronómetro y podrás registrar acciones."
    );

    if (!confirmar) return;

    setEstadoPartido("primera_parte");
    setPeriodoActual(1);

    // Activar cronómetro - el useEffect se encargará de establecer tiemposEntrada para jugadores en pista
    setCronometroActivo(true);
  };

  // Función para finalizar primera parte
  const finalizarPrimeraParte = () => {
    const confirmar = confirm(
      `¿Finalizar primera parte?\n\nResultado parcial: ${golesLocal} - ${golesVisitante}\n\nSe resetearán las faltas del primer período.`
    );

    if (!confirmar) return;

    setEstadoPartido("descanso");
    setCronometroActivo(false);
    // Las faltas del primer período ya están guardadas en faltasLocalPrimera y faltasVisitantePrimera
  };

  // Función para iniciar segunda parte
  const iniciarSegundaParte = () => {
    const confirmar = confirm(
      "¿Iniciar segunda parte?\n\nSe reactivará el cronómetro."
    );

    if (!confirmar) return;

    setEstadoPartido("segunda_parte");
    setPeriodoActual(2);
    setTiempoCronometro(0);
    setTimestampInicioCronometro(Date.now());
    setCronometroActivo(true);
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
      alert("No hay un partido activo para finalizar");
      return;
    }

    // Validar que haya datos mínimos
    if (
      historialAcciones.length === 0 &&
      golesLocal === 0 &&
      golesVisitante === 0
    ) {
      const confirmar = confirm(
        "No hay acciones registradas. ¿Estás seguro de que quieres finalizar el partido sin estadísticas?"
      );
      if (!confirmar) return;
    }

    const confirmarFinal = confirm(
      `¿Finalizar partido?\n\nResultado: ${golesLocal} - ${golesVisitante}\n` +
        `Faltas: ${faltasLocal} - ${faltasVisitante}\n` +
        `Acciones registradas: ${historialAcciones.length}\n\n` +
        `Una vez finalizado, no podrás modificar las estadísticas.`
    );

    if (!confirmarFinal) return;

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
      alert(
        `¡Partido finalizado exitosamente!\n\nResultado: ${golesLocal} - ${golesVisitante}\n\nLas estadísticas se han guardado correctamente.`
      );

      // 10. Redirigir al dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Error al finalizar partido:", error);
      alert(
        `Error al finalizar el partido: ${
          error.response?.data?.error || error.message
        }`
      );
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
          equipoLocal="LA CÚPULA LOS CUESTA"
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
        />

        {/* Animación de Tarjeta/Gol Espectacular */}
        {mostrarTarjeta.visible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="relative animate-slideUp">
              {/* Mano sosteniendo la tarjeta o balón */}
              <div className="relative">
                {mostrarTarjeta.tipo === "5faltas" ? (
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
                ) : mostrarTarjeta.tipo === "gol" ? (
                  /* Balón de fútbol grande para gol */
                  <div className="w-56 h-56 animate-bounce-custom">
                    <div className="relative w-full h-full bg-white rounded-full shadow-2xl border-4 border-gray-800 flex items-center justify-center">
                      {/* Patrón del balón */}
                      <svg className="w-full h-full" viewBox="0 0 200 200">
                        <circle
                          cx="100"
                          cy="100"
                          r="95"
                          fill="white"
                          stroke="#000"
                          strokeWidth="3"
                        />
                        {/* Pentágonos negros del balón */}
                        <path
                          d="M100 20 L120 40 L110 65 L90 65 L80 40 Z"
                          fill="#000"
                        />
                        <path
                          d="M180 100 L170 125 L145 135 L130 115 L145 90 Z"
                          fill="#000"
                        />
                        <path
                          d="M100 180 L80 160 L90 135 L110 135 L120 160 Z"
                          fill="#000"
                        />
                        <path
                          d="M20 100 L30 75 L55 65 L70 85 L55 110 Z"
                          fill="#000"
                        />
                        <path
                          d="M145 40 L165 50 L170 75 L150 85 L130 70 Z"
                          fill="#000"
                        />
                        <path
                          d="M55 40 L75 30 L95 35 L90 60 L65 60 Z"
                          fill="#000"
                        />
                      </svg>
                      {/* Dorsal en el centro del balón */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-7xl font-bold text-green-600 drop-shadow-lg bg-white/90 rounded-full w-28 h-28 flex items-center justify-center border-4 border-green-600">
                          {mostrarTarjeta.dorsal}
                        </div>
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
                {/* Entrenador */}
                <div
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, {
                      id: "staff-E",
                      nombre: "Entrenador",
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
                          id: "staff-E",
                          nombre: "Entrenador",
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
                      : "Entrenador - Arrastra para asignar tarjeta"
                  }
                >
                  {estadisticas["staff-E"]?.rojas > 0 ? (
                    <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      E
                    </div>
                  ) : estadisticas["staff-E"]?.amarillas > 0 ? (
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
                      id: "staff-D",
                      nombre: "Delegado",
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
                          id: "staff-D",
                          nombre: "Delegado",
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
                      : "Delegado - Arrastra para asignar tarjeta"
                  }
                >
                  {estadisticas["staff-D"]?.rojas > 0 ? (
                    <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      D
                    </div>
                  ) : estadisticas["staff-D"]?.amarillas > 0 ? (
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
                      id: "staff-A",
                      nombre: "Auxiliar",
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
                          id: "staff-A",
                          nombre: "Auxiliar",
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
                      : "Auxiliar - Arrastra para asignar tarjeta"
                  }
                >
                  {estadisticas["staff-A"]?.rojas > 0 ? (
                    <div className="w-6 h-9 bg-red-500 rounded flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      A
                    </div>
                  ) : estadisticas["staff-A"]?.amarillas > 0 ? (
                    <div className="w-6 h-9 bg-yellow-400 rounded flex items-center justify-center text-gray-800 text-sm font-bold shadow-inner">
                      A
                    </div>
                  ) : (
                    "A"
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {/* Columna 1: Primer tercio de jugadores */}
                <div className="flex flex-col items-center gap-2">
                  {jugadores
                    .filter((j) => !isJugadorAsignado(j.id))
                    .sort((a, b) => {
                      const minutosA = estadisticas[a.id]?.minutos || 0;
                      const minutosB = estadisticas[b.id]?.minutos || 0;
                      return minutosA - minutosB; // Menor a mayor
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
                      const minutosA = estadisticas[a.id]?.minutos || 0;
                      const minutosB = estadisticas[b.id]?.minutos || 0;
                      return minutosA - minutosB; // Menor a mayor
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
                      const minutosA = estadisticas[a.id]?.minutos || 0;
                      const minutosB = estadisticas[b.id]?.minutos || 0;
                      return minutosA - minutosB; // Menor a mayor
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
                    setPosicionSeleccionada(null);
                    setAccionActiva(accionActiva === "gol" ? null : "gol");
                  }}
                  className={`w-24 h-[74px] bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "gol"
                      ? "ring-4 ring-green-300 scale-110 animate-pulse border-white"
                      : "border-transparent hover:border-white"
                  }`}
                  title={
                    accionActiva === "gol"
                      ? "Click en un jugador para anotar gol"
                      : "Click para activar o arrastra jugador aquí"
                  }
                >
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleAccionDrop(e, "falta")}
                  onClick={() => {
                    setPosicionSeleccionada(null);
                    setAccionActiva(accionActiva === "falta" ? null : "falta");
                  }}
                  className={`w-24 h-[74px] bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "falta"
                      ? "ring-4 ring-orange-300 scale-110 animate-pulse border-white"
                      : "border-transparent hover:border-white"
                  }`}
                  title={
                    accionActiva === "falta"
                      ? "Click en un jugador para anotar falta"
                      : "Click para activar o arrastra jugador aquí"
                  }
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleAccionDrop(e, "amarilla")}
                  onClick={() => {
                    setPosicionSeleccionada(null);
                    setAccionActiva(
                      accionActiva === "amarilla" ? null : "amarilla"
                    );
                  }}
                  className={`w-24 h-[74px] bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold rounded-lg shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "amarilla"
                      ? "ring-4 ring-yellow-300 scale-110 animate-pulse border-gray-800"
                      : "border-transparent hover:border-gray-800"
                  }`}
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
                    setPosicionSeleccionada(null);
                    setAccionActiva(accionActiva === "roja" ? null : "roja");
                  }}
                  className={`w-24 h-[74px] bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 ${
                    accionActiva === "roja"
                      ? "ring-4 ring-red-300 scale-110 animate-pulse border-white"
                      : "border-transparent hover:border-white"
                  }`}
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

                    return (
                      <div
                        key={numero}
                        draggable={editandoDorsal !== numero}
                        onDragStart={(e) => {
                          if (editandoDorsal !== numero) {
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
                          if (accionActiva && editandoDorsal !== numero) {
                            ejecutarAccion(
                              {
                                id: jugadorId,
                                nombre: `Visitante ${dorsalMostrado}`,
                                numero_dorsal: dorsalMostrado,
                              },
                              accionActiva
                            );
                          } else if (!accionActiva) {
                            setEditandoDorsal(numero);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center text-gray-700 font-bold text-base shadow-lg transition-transform overflow-hidden ${
                          editandoDorsal === numero
                            ? "border-blue-500"
                            : accionActiva
                            ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                            : "hover:scale-110 hover:border-blue-500"
                        }`}
                        style={{
                          cursor:
                            editandoDorsal === numero
                              ? "text"
                              : accionActiva
                              ? "pointer"
                              : "grab",
                        }}
                        title={
                          editandoDorsal === numero
                            ? `Editando dorsal ${numero}`
                            : accionActiva
                            ? `Click para aplicar ${accionActiva}`
                            : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
                        }
                      >
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

                    return (
                      <div
                        key={numero}
                        draggable={editandoDorsal !== numero}
                        onDragStart={(e) => {
                          if (editandoDorsal !== numero) {
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
                          if (accionActiva && editandoDorsal !== numero) {
                            ejecutarAccion(
                              {
                                id: jugadorId,
                                nombre: `Visitante ${dorsalMostrado}`,
                                numero_dorsal: dorsalMostrado,
                              },
                              accionActiva
                            );
                          } else if (!accionActiva) {
                            setEditandoDorsal(numero);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center text-gray-700 font-bold text-base shadow-lg transition-transform overflow-hidden ${
                          editandoDorsal === numero
                            ? "border-blue-500"
                            : accionActiva
                            ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                            : "hover:scale-110 hover:border-blue-500"
                        }`}
                        style={{
                          cursor:
                            editandoDorsal === numero
                              ? "text"
                              : accionActiva
                              ? "pointer"
                              : "grab",
                        }}
                        title={
                          editandoDorsal === numero
                            ? `Editando dorsal ${numero}`
                            : accionActiva
                            ? `Click para aplicar ${accionActiva}`
                            : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
                        }
                      >
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

                    return (
                      <div
                        key={numero}
                        draggable={editandoDorsal !== numero}
                        onDragStart={(e) => {
                          if (editandoDorsal !== numero) {
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
                          if (accionActiva && editandoDorsal !== numero) {
                            ejecutarAccion(
                              {
                                id: jugadorId,
                                nombre: `Visitante ${dorsalMostrado}`,
                                numero_dorsal: dorsalMostrado,
                              },
                              accionActiva
                            );
                          } else if (!accionActiva) {
                            setEditandoDorsal(numero);
                          }
                        }}
                        className={`relative w-14 h-14 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center text-gray-700 font-bold text-base shadow-lg transition-transform overflow-hidden ${
                          editandoDorsal === numero
                            ? "border-blue-500"
                            : accionActiva
                            ? "cursor-pointer hover:scale-125 hover:ring-4 hover:ring-orange-300 hover:border-orange-500"
                            : "hover:scale-110 hover:border-blue-500"
                        }`}
                        style={{
                          cursor:
                            editandoDorsal === numero
                              ? "text"
                              : accionActiva
                              ? "pointer"
                              : "grab",
                        }}
                        title={
                          editandoDorsal === numero
                            ? `Editando dorsal ${numero}`
                            : accionActiva
                            ? `Click para aplicar ${accionActiva}`
                            : `Visitante ${dorsalMostrado} - Click para editar, arrastra para tarjeta/falta`
                        }
                      >
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

        {/* Información del Partido */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {partidoInfo ? (
              <>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Partido:</span>
                  <span className="ml-2 text-blue-600 font-medium capitalize">
                    {partidoInfo.tipo || "Partido"} -{" "}
                    {new Date(partidoInfo.fecha_hora).toLocaleDateString(
                      "es-ES"
                    )}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Rival:</span>
                  <span className="ml-2 text-gray-800">
                    {partidoInfo.rival || "No especificado"}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">
                    Jugadores confirmados:
                  </span>
                  <span className="ml-2 text-green-600 font-bold">
                    {jugadores.length}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                <span className="font-semibold">ID Partido:</span>
                <span className="ml-2 font-mono text-blue-600">
                  {partidoId || "Cargando..."}
                </span>
                <span className="ml-3 text-xs text-gray-500">(Modo libre)</span>
              </div>
            )}
          </div>
          {!partidoInfo && (
            <button
              onClick={crearNuevoPartido}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
              title="Crear un nuevo partido"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Partido
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-2"
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

        {/* Botones de Control de Flujo del Partido */}
        {partidoId && partidoInfo && (
          <div className="mb-4 space-y-3">
            {/* Botón INICIAR PARTIDO - Solo visible en estado "configuracion" */}
            {estadoPartido === "configuracion" && (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">
                      ¿Iniciar Partido?
                    </h3>
                    <p className="text-sm opacity-90">
                      Coloca exactamente 5 jugadores en la pista antes de
                      iniciar.
                    </p>
                    <p className="text-xs mt-2 opacity-75">
                      Jugadores en pista:{" "}
                      {Object.keys(jugadoresAsignados).length} / 5
                    </p>
                  </div>
                  <button
                    onClick={iniciarPartido}
                    disabled={Object.keys(jugadoresAsignados).length !== 5}
                    className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    title="Iniciar el partido y activar el cronómetro"
                  >
                    <svg
                      className="w-6 h-6"
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
                    INICIAR PARTIDO
                  </button>
                </div>
              </div>
            )}

            {/* Botón FINALIZAR PRIMERA PARTE - Solo visible en estado "primera_parte" */}
            {estadoPartido === "primera_parte" && (
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">
                      ¿Finalizar Primera Parte?
                    </h3>
                    <p className="text-sm opacity-90">
                      Se detendrá el cronómetro y se resetearán las faltas.
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="font-semibold">
                          Resultado parcial:
                        </span>{" "}
                        {golesLocal} - {golesVisitante}
                      </p>
                      <p>
                        <span className="font-semibold">Faltas 1ª parte:</span>{" "}
                        {faltasLocalPrimera} - {faltasVisitantePrimera}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={finalizarPrimeraParte}
                    className="px-8 py-4 bg-white hover:bg-gray-100 text-orange-600 font-bold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-3 text-lg"
                    title="Finalizar la primera parte"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Finalizar Primera Parte
                  </button>
                </div>
              </div>
            )}

            {/* Botón INICIAR SEGUNDA PARTE - Solo visible en estado "descanso" */}
            {estadoPartido === "descanso" && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2">
                      ¿Iniciar Segunda Parte?
                    </h3>
                    <p className="text-sm opacity-90">
                      Se reactivará el cronómetro y comenzará el segundo
                      período.
                    </p>
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="font-semibold">Resultado:</span>{" "}
                        {golesLocal} - {golesVisitante}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Faltas acumuladas:
                        </span>{" "}
                        {faltasLocal} - {faltasVisitante}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={iniciarSegundaParte}
                    className="px-8 py-4 bg-white hover:bg-gray-100 text-purple-600 font-bold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-3 text-lg"
                    title="Iniciar la segunda parte"
                  >
                    <svg
                      className="w-6 h-6"
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
                    Iniciar Segunda Parte
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón Finalizar Partido - Solo visible si hay un partido activo */}
        {partidoId && partidoInfo && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">¿Finalizar Partido?</h3>
                <p className="text-sm opacity-90">
                  Al finalizar, se guardarán todas las estadísticas en la base
                  de datos.
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">Resultado:</span>{" "}
                    {golesLocal} - {golesVisitante}
                  </p>
                  <p>
                    <span className="font-semibold">Faltas:</span> {faltasLocal}{" "}
                    - {faltasVisitante}
                  </p>
                  <p>
                    <span className="font-semibold">Acciones registradas:</span>{" "}
                    {historialAcciones.length}
                  </p>
                  <p>
                    <span className="font-semibold">
                      Jugadores participantes:
                    </span>{" "}
                    {Object.keys(tiemposEntrada).length}
                  </p>
                </div>
              </div>
              <button
                onClick={handleFinalizarPartido}
                className="px-8 py-4 bg-white hover:bg-gray-100 text-green-600 font-bold rounded-lg shadow-md transition-all hover:scale-105 flex items-center gap-3 text-lg"
                title="Guardar todas las estadísticas y finalizar el partido"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Finalizar Partido
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
}

export default ConfigurarPartido;
