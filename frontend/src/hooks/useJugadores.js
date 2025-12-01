import { useState } from "react";
import { esJugadorVisitante, esStaff } from "../utils/partidoUtils";

/**
 * Hook para gestionar jugadores, staff y posiciones en pista
 * @param {string} partidoId - ID del partido actual
 * @returns {object} Estado y funciones de gestión de jugadores
 */
export const useJugadores = (partidoId) => {
  // Jugadores asignados por posición (1-5)
  const [jugadoresAsignados, setJugadoresAsignados] = useState({});

  // Listas de jugadores y staff
  const [jugadores, setJugadores] = useState([]);
  const [staff, setStaff] = useState([]);

  // Dorsales de jugadores visitantes
  const [dorsalesVisitantes, setDorsalesVisitantes] = useState({});

  // Jugadores visitantes activos (bolas verdes)
  const [jugadoresVisitantesActivos, setJugadoresVisitantesActivos] = useState(
    []
  );

  // Estado del drag & drop
  const [elementoArrastrado, setElementoArrastrado] = useState(null);

  /**
   * Maneja el inicio del arrastre de un jugador/staff
   */
  const handleDragStart = (e, item) => {
    setElementoArrastrado(item);
    e.dataTransfer.effectAllowed = "move";
  };

  /**
   * Maneja el drop sobre una posición
   */
  const handleDrop = (
    posicion,
    onRegistrarAccion,
    onRegistrarEntrada,
    tiempoCronometro
  ) => {
    if (!elementoArrastrado) return;

    const jugadorId = elementoArrastrado.id;
    const jugadorAnterior = jugadoresAsignados[posicion];

    // Si hay un jugador en la posición, registrar su salida
    if (jugadorAnterior && onRegistrarAccion) {
      onRegistrarAccion("salida", jugadorAnterior, posicion, tiempoCronometro);
    }

    // Asignar nuevo jugador
    setJugadoresAsignados((prev) => ({
      ...prev,
      [posicion]: jugadorId,
    }));

    // Registrar entrada del nuevo jugador
    if (onRegistrarEntrada) {
      onRegistrarEntrada(jugadorId);
    }

    // Registrar acción de entrada
    if (onRegistrarAccion) {
      onRegistrarAccion("entrada", jugadorId, posicion, tiempoCronometro);
    }

    setElementoArrastrado(null);
  };

  /**
   * Maneja el click en una posición para quitar jugador
   */
  const handlePosicionClick = (
    posicion,
    onRegistrarAccion,
    tiempoCronometro
  ) => {
    const jugadorId = jugadoresAsignados[posicion];

    if (jugadorId && onRegistrarAccion) {
      // Registrar salida
      onRegistrarAccion("salida", jugadorId, posicion, tiempoCronometro);
    }

    // Quitar jugador de la posición
    setJugadoresAsignados((prev) => {
      const nuevo = { ...prev };
      delete nuevo[posicion];
      return nuevo;
    });
  };

  /**
   * Asigna un jugador a una posición específica
   */
  const asignarJugadorAPosicion = (
    jugadorId,
    posicion,
    onRegistrarAccion,
    onRegistrarEntrada,
    tiempoCronometro
  ) => {
    const jugadorAnterior = jugadoresAsignados[posicion];

    // Si hay un jugador en la posición, registrar su salida
    if (jugadorAnterior && onRegistrarAccion) {
      onRegistrarAccion("salida", jugadorAnterior, posicion, tiempoCronometro);
    }

    // Asignar nuevo jugador
    setJugadoresAsignados((prev) => ({
      ...prev,
      [posicion]: jugadorId,
    }));

    // Registrar entrada
    if (onRegistrarEntrada) {
      onRegistrarEntrada(jugadorId);
    }

    // Registrar acción
    if (onRegistrarAccion) {
      onRegistrarAccion("entrada", jugadorId, posicion, tiempoCronometro);
    }
  };

  /**
   * Obtiene información de un jugador por su ID
   */
  const obtenerJugador = (jugadorId) => {
    if (!jugadorId) return null;

    if (esStaff(jugadorId)) {
      return staff.find((s) => s.id === jugadorId);
    }

    if (esJugadorVisitante(jugadorId)) {
      // Jugador visitante temporal
      const dorsal = dorsalesVisitantes[jugadorId] || "?";
      return {
        id: jugadorId,
        nombre: `Visitante #${dorsal}`,
        dorsal: dorsal,
        esVisitante: true,
      };
    }

    return jugadores.find((j) => j.id === jugadorId);
  };

  /**
   * Obtiene el dorsal de un jugador
   */
  const obtenerDorsal = (jugadorId) => {
    const jugador = obtenerJugador(jugadorId);
    return jugador?.dorsal || "?";
  };

  /**
   * Obtiene el nombre de un jugador
   */
  const obtenerNombre = (jugadorId) => {
    const jugador = obtenerJugador(jugadorId);
    return jugador?.nombre || "Desconocido";
  };

  /**
   * Añade o actualiza el dorsal de un jugador visitante
   */
  const actualizarDorsalVisitante = (jugadorId, dorsal) => {
    setDorsalesVisitantes((prev) => ({
      ...prev,
      [jugadorId]: dorsal,
    }));
  };

  /**
   * Activa/desactiva un jugador visitante (bola verde)
   */
  const toggleJugadorVisitanteActivo = (jugadorId) => {
    setJugadoresVisitantesActivos((prev) => {
      if (prev.includes(jugadorId)) {
        return prev.filter((id) => id !== jugadorId);
      } else {
        return [...prev, jugadorId];
      }
    });
  };

  /**
   * Verifica si un jugador visitante está activo
   */
  const esJugadorVisitanteActivo = (jugadorId) => {
    return jugadoresVisitantesActivos.includes(jugadorId);
  };

  /**
   * Reinicia el estado de jugadores
   */
  const reiniciarEstado = () => {
    setJugadoresAsignados({});
    setDorsalesVisitantes({});
    setJugadoresVisitantesActivos([]);
    setElementoArrastrado(null);
  };

  return {
    // Estados
    jugadoresAsignados,
    jugadores,
    staff,
    dorsalesVisitantes,
    jugadoresVisitantesActivos,
    elementoArrastrado,

    // Setters
    setJugadoresAsignados,
    setJugadores,
    setStaff,
    setDorsalesVisitantes,
    setJugadoresVisitantesActivos,

    // Funciones de drag & drop
    handleDragStart,
    handleDrop,
    handlePosicionClick,
    asignarJugadorAPosicion,

    // Funciones de consulta
    obtenerJugador,
    obtenerDorsal,
    obtenerNombre,

    // Funciones de jugadores visitantes
    actualizarDorsalVisitante,
    toggleJugadorVisitanteActivo,
    esJugadorVisitanteActivo,

    // Funciones de utilidad
    reiniciarEstado,
  };
};
