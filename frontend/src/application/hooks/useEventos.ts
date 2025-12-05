import { useState, useEffect, useCallback } from "react";
import { Entrenamiento, Partido } from "@domain";
import api from "../../services/api";

/**
 * Filtros para eventos
 */
export interface FiltrosEventos {
  fechaDesde?: string;
  fechaHasta?: string;
}

/**
 * Estado del hook de eventos
 */
interface EventosState {
  entrenamientos: Entrenamiento[];
  partidos: Partido[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para gestionar eventos (entrenamientos y partidos)
 * Proporciona funciones para listar, crear, actualizar y eliminar eventos
 * Incluye caché automático y revalidación
 */
export function useEventos(filtros?: FiltrosEventos) {
  const [state, setState] = useState<EventosState>({
    entrenamientos: [],
    partidos: [],
    isLoading: true,
    error: null,
  });

  // ==================== LISTAR ====================

  const cargarEventos = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [entrenamientosRes, partidosRes] = await Promise.all([
        api.entrenamientos.listar(filtros),
        api.partidos.listar(filtros),
      ]);

      const entrenamientos = entrenamientosRes.data.entrenamientos.map(
        (dto: any) => Entrenamiento.fromDTO(dto)
      );
      const partidos = partidosRes.data.partidos.map((dto: any) =>
        Partido.fromDTO(dto)
      );

      setState({
        entrenamientos,
        partidos,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error cargando eventos:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Error al cargar eventos",
      }));
    }
  }, [filtros?.fechaDesde, filtros?.fechaHasta]);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // ==================== CREAR ====================

  const crearEntrenamiento = async (datos: {
    fecha: string;
    hora: string;
    ubicacion: string;
    descripcion?: string;
    duracionMinutos?: number;
  }): Promise<Entrenamiento> => {
    try {
      const response = await api.entrenamientos.crear({
        fecha: datos.fecha,
        hora: datos.hora,
        ubicacion: datos.ubicacion,
        descripcion: datos.descripcion,
        duracion_minutos: datos.duracionMinutos,
      });
      const nuevoEntrenamiento = Entrenamiento.fromDTO(
        response.data.entrenamiento
      );

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        entrenamientos: [...prev.entrenamientos, nuevoEntrenamiento],
      }));

      return nuevoEntrenamiento;
    } catch (error) {
      console.error("Error creando entrenamiento:", error);
      throw error;
    }
  };

  const crearPartido = async (datos: {
    fecha: string;
    hora: string;
    ubicacion: string;
    rival: string;
    tipo: "amistoso" | "liga" | "copa" | "torneo";
    esLocal: boolean;
  }): Promise<Partido> => {
    try {
      const response = await api.partidos.crear({
        fecha: datos.fecha,
        hora: datos.hora,
        ubicacion: datos.ubicacion,
        rival: datos.rival,
        tipo: datos.tipo,
        esLocal: datos.esLocal,
      });
      const nuevoPartido = Partido.fromDTO(response.data.partido);

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        partidos: [...prev.partidos, nuevoPartido],
      }));

      return nuevoPartido;
    } catch (error) {
      console.error("Error creando partido:", error);
      throw error;
    }
  };

  // ==================== ACTUALIZAR ====================

  const actualizarEntrenamiento = async (
    id: number,
    datos: Partial<{
      fecha: string;
      hora: string;
      ubicacion: string;
      descripcion: string;
      duracionMinutos: number;
    }>
  ): Promise<Entrenamiento> => {
    try {
      const response = await api.entrenamientos.actualizar(id, {
        fecha: datos.fecha,
        hora: datos.hora,
        ubicacion: datos.ubicacion,
        descripcion: datos.descripcion,
        duracion_minutos: datos.duracionMinutos,
      });
      const entrenamientoActualizado = Entrenamiento.fromDTO(
        response.data.entrenamiento
      );

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        entrenamientos: prev.entrenamientos.map((e) =>
          e.id === id ? entrenamientoActualizado : e
        ),
      }));

      return entrenamientoActualizado;
    } catch (error) {
      console.error("Error actualizando entrenamiento:", error);
      throw error;
    }
  };

  const actualizarPartido = async (
    id: number,
    datos: Partial<{
      fecha: string;
      hora: string;
      ubicacion: string;
      rival: string;
      tipo: "amistoso" | "liga" | "copa" | "torneo";
      esLocal: boolean;
    }>
  ): Promise<Partido> => {
    try {
      const response = await api.partidos.actualizar(id, {
        fecha: datos.fecha,
        hora: datos.hora,
        ubicacion: datos.ubicacion,
        rival: datos.rival,
        tipo: datos.tipo,
        esLocal: datos.esLocal,
      });
      const partidoActualizado = Partido.fromDTO(response.data.partido);

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        partidos: prev.partidos.map((p) =>
          p.id === id ? partidoActualizado : p
        ),
      }));

      return partidoActualizado;
    } catch (error) {
      console.error("Error actualizando partido:", error);
      throw error;
    }
  };

  const actualizarResultado = async (
    id: number,
    resultado: string
  ): Promise<Partido> => {
    try {
      const response = await api.partidos.actualizar(id, { resultado });
      const partidoActualizado = Partido.fromDTO(response.data.partido);

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        partidos: prev.partidos.map((p) =>
          p.id === id ? partidoActualizado : p
        ),
      }));

      return partidoActualizado;
    } catch (error) {
      console.error("Error actualizando resultado:", error);
      throw error;
    }
  };

  // ==================== ELIMINAR ====================

  const eliminarEntrenamiento = async (id: number): Promise<void> => {
    try {
      await api.entrenamientos.eliminar(id);

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        entrenamientos: prev.entrenamientos.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error("Error eliminando entrenamiento:", error);
      throw error;
    }
  };

  const eliminarPartido = async (id: number): Promise<void> => {
    try {
      await api.partidos.eliminar(id);

      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        partidos: prev.partidos.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error("Error eliminando partido:", error);
      throw error;
    }
  };

  // ==================== OBTENER DETALLE ====================

  const obtenerEntrenamiento = async (
    id: number
  ): Promise<Entrenamiento | null> => {
    try {
      const response = await api.entrenamientos.obtener(id);
      return Entrenamiento.fromDTO(response.data.entrenamiento);
    } catch (error) {
      console.error("Error obteniendo entrenamiento:", error);
      return null;
    }
  };

  const obtenerPartido = async (id: number): Promise<Partido | null> => {
    try {
      const response = await api.partidos.obtener(id);
      return Partido.fromDTO(response.data.partido);
    } catch (error) {
      console.error("Error obteniendo partido:", error);
      return null;
    }
  };

  // ==================== HELPERS ====================

  const recargar = () => {
    cargarEventos();
  };

  return {
    // Estado
    entrenamientos: state.entrenamientos,
    partidos: state.partidos,
    isLoading: state.isLoading,
    error: state.error,

    // Métodos CRUD
    crearEntrenamiento,
    crearPartido,
    actualizarEntrenamiento,
    actualizarPartido,
    actualizarResultado,
    eliminarEntrenamiento,
    eliminarPartido,
    obtenerEntrenamiento,
    obtenerPartido,

    // Utilidades
    recargar,
  };
}

/**
 * Hook para obtener solo entrenamientos
 */
export function useEntrenamientos(filtros?: FiltrosEventos) {
  const {
    entrenamientos,
    isLoading,
    error,
    crearEntrenamiento,
    actualizarEntrenamiento,
    eliminarEntrenamiento,
    obtenerEntrenamiento,
    recargar,
  } = useEventos(filtros);

  return {
    entrenamientos,
    isLoading,
    error,
    crear: crearEntrenamiento,
    actualizar: actualizarEntrenamiento,
    eliminar: eliminarEntrenamiento,
    obtener: obtenerEntrenamiento,
    recargar,
  };
}

/**
 * Hook para obtener solo partidos
 */
export function usePartidos(filtros?: FiltrosEventos) {
  const {
    partidos,
    isLoading,
    error,
    crearPartido,
    actualizarPartido,
    actualizarResultado,
    eliminarPartido,
    obtenerPartido,
    recargar,
  } = useEventos(filtros);

  return {
    partidos,
    isLoading,
    error,
    crear: crearPartido,
    actualizar: actualizarPartido,
    actualizarResultado,
    eliminar: eliminarPartido,
    obtener: obtenerPartido,
    recargar,
  };
}
