import { useState, useCallback } from "react";
import { Asistencia, EstadoAsistencia } from "@domain";
import api from "../../services/api";
import { useAuth } from "./useAuth";

/**
 * Datos para registrar asistencia
 */
export interface RegistrarAsistenciaParams {
  eventoId: number;
  tipoEvento: "entrenamiento" | "partido";
  estado: "confirmado" | "ausente" | "pendiente";
  motivoAusenciaId?: number;
  comentario?: string;
}

/**
 * Hook para gestionar asistencias
 * Proporciona funciones para registrar y actualizar asistencias
 */
export function useAsistencias() {
  const { usuario } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== REGISTRAR/ACTUALIZAR ====================

  const registrar = useCallback(
    async (params: RegistrarAsistenciaParams): Promise<Asistencia> => {
      if (!usuario) {
        throw new Error("Debes estar autenticado para registrar asistencia");
      }

      // Validación: ausente requiere motivo
      if (
        params.estado === EstadoAsistencia.AUSENTE &&
        !params.motivoAusenciaId
      ) {
        throw new Error("Debes seleccionar un motivo de ausencia");
      }

      setIsLoading(true);
      setError(null);

      try {
        const endpointMethod =
          params.tipoEvento === "entrenamiento"
            ? api.entrenamientos.registrarAsistencia
            : api.partidos.registrarAsistencia;

        await endpointMethod(params.eventoId, {
          estado: params.estado,
          motivoAusenciaId: params.motivoAusenciaId,
          comentario: params.comentario,
        });

        return Asistencia.fromDTO({
          jugador_id: usuario.id,
          evento_id: params.eventoId,
          tipo_evento: params.tipoEvento,
          estado: params.estado,
          motivo_ausencia_id: params.motivoAusenciaId,
          comentario: params.comentario,
        });
      } catch (err) {
        const errorMsg = "Error al registrar asistencia";
        console.error(errorMsg, err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [usuario]
  );

  // ==================== CONFIRMAR ====================

  const confirmar = useCallback(
    async (
      eventoId: number,
      tipoEvento: "entrenamiento" | "partido",
      comentario?: string
    ): Promise<Asistencia> => {
      return await registrar({
        eventoId,
        tipoEvento,
        estado: EstadoAsistencia.CONFIRMADO,
        comentario,
      });
    },
    [registrar]
  );

  // ==================== DECLINAR ====================

  const declinar = useCallback(
    async (
      eventoId: number,
      tipoEvento: "entrenamiento" | "partido",
      motivoAusenciaId: number,
      comentario?: string
    ): Promise<Asistencia> => {
      if (!motivoAusenciaId) {
        throw new Error("Debes seleccionar un motivo de ausencia");
      }

      return await registrar({
        eventoId,
        tipoEvento,
        estado: EstadoAsistencia.AUSENTE,
        motivoAusenciaId,
        comentario,
      });
    },
    [registrar]
  );

  // ==================== MARCAR PENDIENTE ====================

  const marcarPendiente = useCallback(
    async (
      eventoId: number,
      tipoEvento: "entrenamiento" | "partido"
    ): Promise<Asistencia> => {
      return await registrar({
        eventoId,
        tipoEvento,
        estado: EstadoAsistencia.PENDIENTE,
      });
    },
    [registrar]
  );

  // ==================== ACTUALIZAR (GESTOR) ====================

  const actualizarComoGestor = useCallback(
    async (
      jugadorId: number,
      eventoId: number,
      tipoEvento: "entrenamiento" | "partido",
      estado: "confirmado" | "ausente" | "pendiente",
      motivoAusenciaId?: number,
      comentario?: string
    ): Promise<Asistencia> => {
      setIsLoading(true);
      setError(null);

      try {
        // Para gestor, usamos el endpoint de actualización de partido o entrenamiento
        if (tipoEvento === "entrenamiento") {
          await api.entrenamientos.actualizarAsistenciaGestor(
            eventoId,
            jugadorId,
            { estado, motivoAusenciaId, comentario }
          );
        } else {
          await api.partidos.actualizarAsistenciaGestor(eventoId, jugadorId, {
            estado,
            motivoAusenciaId,
            comentario,
          });
        }

        return Asistencia.fromDTO({
          jugador_id: jugadorId,
          evento_id: eventoId,
          tipo_evento: tipoEvento,
          estado,
          motivo_ausencia_id: motivoAusenciaId,
          comentario,
        });
      } catch (err) {
        const errorMsg = "Error al actualizar asistencia";
        console.error(errorMsg, err);
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    // Estado
    isLoading,
    error,

    // Métodos para jugador
    registrar,
    confirmar,
    declinar,
    marcarPendiente,

    // Métodos para gestor
    actualizarComoGestor,
  };
}

/**
 * Hook simplificado para que un jugador gestione SU asistencia
 */
export function useMiAsistencia() {
  const { confirmar, declinar, marcarPendiente, isLoading, error } =
    useAsistencias();

  return {
    confirmar,
    declinar,
    marcarPendiente,
    isLoading,
    error,
  };
}

/**
 * Hook para que un gestor gestione asistencias de TODOS los jugadores
 */
export function useAsistenciasGestor() {
  const { actualizarComoGestor, isLoading, error } = useAsistencias();

  return {
    actualizar: actualizarComoGestor,
    isLoading,
    error,
  };
}
