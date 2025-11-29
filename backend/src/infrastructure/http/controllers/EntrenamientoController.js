/**
 * Controller de Entrenamientos
 */

import { ValidationError } from "../../../domain/errors/ValidationError.js";

// Helper para convertir entrenamientos al formato esperado por el frontend
function formatEntrenamientoForFrontend(entrenamiento) {
  // Convertir a objeto plano si es una instancia de clase
  const entrenamientoPlano = entrenamiento.toObject
    ? entrenamiento.toObject()
    : entrenamiento;

  const fechaHora = new Date(entrenamientoPlano.fechaHora);
  const fecha = fechaHora.toISOString().split("T")[0]; // YYYY-MM-DD
  const hora = fechaHora.toTimeString().slice(0, 5); // HH:MM

  return {
    ...entrenamientoPlano,
    fecha,
    hora,
    ubicacion: entrenamientoPlano.lugar, // alias para el frontend
  };
}

export class EntrenamientoController {
  constructor(container) {
    this.crearEntrenamientoUseCase = container.getUseCase(
      "crearEntrenamientoUseCase"
    );
    this.listarEntrenamientosUseCase = container.getUseCase(
      "listarEntrenamientosUseCase"
    );
    this.obtenerEntrenamientoPorIdUseCase = container.getUseCase(
      "obtenerEntrenamientoPorIdUseCase"
    );
    this.actualizarEntrenamientoUseCase = container.getUseCase(
      "actualizarEntrenamientoUseCase"
    );
    this.eliminarEntrenamientoUseCase = container.getUseCase(
      "eliminarEntrenamientoUseCase"
    );
    this.obtenerAsistenciasPorEventoUseCase = container.getUseCase(
      "obtenerAsistenciasPorEventoUseCase"
    );
    this.registrarAsistenciaUseCase = container.getUseCase(
      "registrarAsistenciaUseCase"
    );
    this.actualizarEstadoAsistenciaUseCase = container.getUseCase(
      "actualizarEstadoAsistenciaUseCase"
    );
    this.listarJugadoresUseCase = container.getUseCase(
      "listarJugadoresUseCase"
    );
  }

  async crearEntrenamiento(req, res, next) {
    try {
      const { fecha, hora, lugar, descripcion, duracionMinutos } = req.body;

      if (!fecha || !hora || !lugar) {
        throw new ValidationError("Fecha, hora y lugar son requeridos");
      }

      const entrenamiento = await this.crearEntrenamientoUseCase.execute({
        fecha,
        hora,
        lugar,
        descripcion,
        duracionMinutos: duracionMinutos || 90,
        creadoPor: req.user.id,
      });

      // Crear asistencias pendientes
      const jugadores = await this.listarJugadoresUseCase.execute();
      for (const jugador of jugadores) {
        await this.registrarAsistenciaUseCase.execute({
          eventoId: entrenamiento.id,
          jugadorId: jugador.usuarioId,
          tipoEvento: "entrenamiento",
          estado: "pendiente",
        });
      }

      res
        .status(201)
        .json({ message: "Entrenamiento creado exitosamente", entrenamiento });
    } catch (error) {
      next(error);
    }
  }

  async listarEntrenamientos(req, res, next) {
    try {
      const { fechaDesde, fechaHasta, page, limit } = req.query;

      // Si se piden paginados
      if (page || limit) {
        const resultado = await this.listarEntrenamientosUseCase.execute({
          page: page ? parseInt(page) : 1,
          limit: limit ? parseInt(limit) : 10,
          fechaDesde,
          fechaHasta,
        });

        // Añadir asistencias a cada entrenamiento
        for (const entrenamiento of resultado.data) {
          const asistencias =
            await this.obtenerAsistenciasPorEventoUseCase.execute({
              entrenamientoId: entrenamiento.id,
            });
          entrenamiento.asistencias = asistencias;
        }

        res.json({
          entrenamientos: resultado.data,
          paginacion: {
            total: resultado.total,
            page: resultado.page,
            totalPages: resultado.totalPages,
          },
        });
      } else {
        // Sin paginación, usar executeAll
        const entrenamientos =
          await this.listarEntrenamientosUseCase.executeAll({
            fechaDesde,
            fechaHasta,
          });

        for (const entrenamiento of entrenamientos) {
          const asistencias =
            await this.obtenerAsistenciasPorEventoUseCase.execute({
              entrenamientoId: entrenamiento.id,
            });
          entrenamiento.asistencias = asistencias;
        }

        // Formatear entrenamientos para el frontend
        const entrenamientosFormateados = entrenamientos.map(
          formatEntrenamientoForFrontend
        );

        res.json({ entrenamientos: entrenamientosFormateados });
      }
    } catch (error) {
      next(error);
    }
  }

  async obtenerEntrenamiento(req, res, next) {
    try {
      const { id } = req.params;
      const entrenamiento = await this.obtenerEntrenamientoPorIdUseCase.execute(
        id
      );

      if (!entrenamiento) {
        return res.status(404).json({ error: "Entrenamiento no encontrado" });
      }

      const asistencias = await this.obtenerAsistenciasPorEventoUseCase.execute(
        {
          entrenamientoId: id,
        }
      );
      entrenamiento.asistencias = asistencias;

      // Formatear para el frontend
      const entrenamientoFormateado =
        formatEntrenamientoForFrontend(entrenamiento);

      res.json({ entrenamiento: entrenamientoFormateado });
    } catch (error) {
      next(error);
    }
  }

  async actualizarEntrenamiento(req, res, next) {
    try {
      if (req.user.rol !== "gestor") {
        return res
          .status(403)
          .json({ error: "Solo gestores pueden actualizar entrenamientos" });
      }

      const { id } = req.params;
      const entrenamiento = await this.actualizarEntrenamientoUseCase.execute(
        id,
        req.body
      );

      res.json({
        message: "Entrenamiento actualizado correctamente",
        entrenamiento,
      });
    } catch (error) {
      next(error);
    }
  }

  async eliminarEntrenamiento(req, res, next) {
    try {
      if (req.user.rol !== "gestor") {
        return res
          .status(403)
          .json({ error: "Solo gestores pueden eliminar entrenamientos" });
      }

      const { id } = req.params;
      await this.eliminarEntrenamientoUseCase.execute(id);

      res.json({ message: "Entrenamiento eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  }

  async registrarAsistencia(req, res, next) {
    try {
      const { id } = req.params;
      const { estado, motivoAusenciaId, comentario } = req.body;

      await this.registrarAsistenciaUseCase.execute({
        eventoId: id,
        jugadorId: req.user.id,
        tipoEvento: "entrenamiento",
        estado,
        motivoAusenciaId,
        comentario,
      });

      res.json({ message: "Asistencia registrada correctamente" });
    } catch (error) {
      next(error);
    }
  }

  async actualizarAsistencia(req, res, next) {
    try {
      const { entrenamientoId, jugadorId } = req.params;
      const { estado, motivoAusenciaId, comentario } = req.body;

      if (req.user.rol !== "gestor" && req.user.id !== parseInt(jugadorId)) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await this.actualizarEstadoAsistenciaUseCase.execute({
        eventoId: entrenamientoId,
        jugadorId,
        tipoEvento: "entrenamiento",
        estado,
        motivoAusenciaId,
        comentario,
      });

      res.json({ message: "Asistencia actualizada correctamente" });
    } catch (error) {
      next(error);
    }
  }
}

export function createEntrenamientoController(container) {
  const controller = new EntrenamientoController(container);

  return {
    crearEntrenamiento: (req, res, next) =>
      controller.crearEntrenamiento(req, res, next),
    listarEntrenamientos: (req, res, next) =>
      controller.listarEntrenamientos(req, res, next),
    obtenerEntrenamiento: (req, res, next) =>
      controller.obtenerEntrenamiento(req, res, next),
    actualizarEntrenamiento: (req, res, next) =>
      controller.actualizarEntrenamiento(req, res, next),
    eliminarEntrenamiento: (req, res, next) =>
      controller.eliminarEntrenamiento(req, res, next),
    registrarAsistencia: (req, res, next) =>
      controller.registrarAsistencia(req, res, next),
    actualizarAsistencia: (req, res, next) =>
      controller.actualizarAsistencia(req, res, next),
  };
}
