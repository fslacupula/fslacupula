/**
 * Controller de Partidos
 * Adaptador HTTP que delega toda la lógica a los use cases
 */

import { ValidationError } from "../../../domain/errors/ValidationError.js";

// Helper para convertir partidos al formato esperado por el frontend
function formatPartidoForFrontend(partido) {
  // Convertir a objeto plano si es una instancia de clase
  const partidoPlano = partido.toObject ? partido.toObject() : partido;

  const fechaHora = new Date(partidoPlano.fechaHora);
  const fecha = fechaHora.toISOString().split("T")[0]; // YYYY-MM-DD
  const hora = fechaHora.toTimeString().slice(0, 5); // HH:MM

  return {
    ...partidoPlano,
    fecha,
    hora,
    ubicacion: partidoPlano.lugar, // alias para el frontend
    asistencias: partido.asistencias, // Preservar asistencias explícitamente
  };
}

export class PartidoController {
  constructor(container) {
    this.crearPartidoUseCase = container.getUseCase("crearPartidoUseCase");
    this.listarPartidosUseCase = container.getUseCase("listarPartidosUseCase");
    this.obtenerPartidoPorIdUseCase = container.getUseCase(
      "obtenerPartidoPorIdUseCase"
    );
    this.actualizarPartidoUseCase = container.getUseCase(
      "actualizarPartidoUseCase"
    );
    this.eliminarPartidoUseCase = container.getUseCase(
      "eliminarPartidoUseCase"
    );
    this.registrarResultadoUseCase = container.getUseCase(
      "registrarResultadoUseCase"
    );
    this.obtenerProximosPartidosUseCase = container.getUseCase(
      "obtenerProximosPartidosUseCase"
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
    this.pool = container.getPool(); // Para transacciones en finalizarPartido
  }

  /**
   * POST /partidos
   */
  async crearPartido(req, res, next) {
    try {
      const {
        fecha,
        hora,
        rival,
        ubicacion,
        tipo,
        esLocal,
        resultado,
        observaciones,
      } = req.body;

      if (!fecha || !hora || !rival || !ubicacion) {
        throw new ValidationError(
          "Fecha, hora, rival y ubicación son requeridos"
        );
      }

      const partido = await this.crearPartidoUseCase.execute({
        fecha,
        hora,
        rival,
        ubicacion,
        tipo: tipo || "amistoso",
        esLocal: esLocal ?? true,
        resultado,
        observaciones,
        creadoPor: req.user.id,
      });

      // Crear asistencias pendientes para todos los jugadores
      const jugadores = await this.listarJugadoresUseCase.execute();
      for (const jugador of jugadores) {
        await this.registrarAsistenciaUseCase.execute({
          eventoId: partido.id,
          jugadorId: jugador.usuarioId,
          tipoEvento: "partido",
          estado: "pendiente",
        });
      }

      res.status(201).json({ message: "Partido creado exitosamente", partido });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /partidos
   */
  async listarPartidos(req, res, next) {
    try {
      const { fechaDesde, fechaHasta } = req.query;
      const partidos = await this.listarPartidosUseCase.execute({
        fechaDesde,
        fechaHasta,
      });

      // Añadir asistencias a cada partido
      for (const partido of partidos) {
        const asistencias =
          await this.obtenerAsistenciasPorEventoUseCase.execute({
            partidoId: partido.id,
          });
        partido.asistencias = asistencias;
      }

      // Formatear partidos para el frontend
      const partidosFormateados = partidos.map(formatPartidoForFrontend);

      res.json({ partidos: partidosFormateados });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /partidos/proximos
   */
  async obtenerProximos(req, res, next) {
    try {
      const { limit } = req.query;
      const partidos = await this.obtenerProximosPartidosUseCase.execute(
        limit ? parseInt(limit) : undefined
      );

      res.json({ partidos });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /partidos/:id
   */
  async obtenerPartido(req, res, next) {
    try {
      const { id } = req.params;
      const partido = await this.obtenerPartidoPorIdUseCase.execute(id);

      if (!partido) {
        return res.status(404).json({ error: "Partido no encontrado" });
      }

      // Las asistencias ya vienen con datos completos del jugador desde findByIdWithPlayerData
      // No necesitamos sobrescribirlas
      console.log("🔍 Partido con asistencias:", partido);
      console.log("🔍 Total asistencias:", partido.asistencias?.length);
      if (partido.asistencias && partido.asistencias.length > 0) {
        console.log(
          "🔍 Primera asistencia (claves):",
          Object.keys(partido.asistencias[0])
        );
      }

      // Formatear para el frontend
      const partidoFormateado = formatPartidoForFrontend(partido);

      console.log("📦 Partido formateado:", partidoFormateado);
      console.log(
        "📦 Asistencias en partido formateado:",
        partidoFormateado.asistencias
      );

      res.json({ partido: partidoFormateado });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /partidos/:id
   */
  async actualizarPartido(req, res, next) {
    try {
      if (req.user.rol !== "gestor") {
        return res
          .status(403)
          .json({ error: "Solo gestores pueden actualizar partidos" });
      }

      const { id } = req.params;
      const partido = await this.actualizarPartidoUseCase.execute(id, req.body);

      res.json({ message: "Partido actualizado correctamente", partido });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /partidos/:id
   */
  async eliminarPartido(req, res, next) {
    try {
      if (req.user.rol !== "gestor") {
        return res
          .status(403)
          .json({ error: "Solo gestores pueden eliminar partidos" });
      }

      const { id } = req.params;
      await this.eliminarPartidoUseCase.execute(id);

      res.json({ message: "Partido eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /partidos/:id/resultado
   */
  async registrarResultado(req, res, next) {
    try {
      if (req.user.rol !== "gestor") {
        return res
          .status(403)
          .json({ error: "Solo gestores pueden registrar resultados" });
      }

      const { id } = req.params;
      const { resultado } = req.body;

      if (!resultado) {
        throw new ValidationError("Resultado es requerido");
      }

      await this.registrarResultadoUseCase.execute(id, resultado);

      res.json({ message: "Resultado registrado correctamente" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /partidos/:id/asistencias
   */
  async registrarAsistencia(req, res, next) {
    try {
      const { id } = req.params;
      const { estado, motivoAusenciaId, comentario } = req.body;

      await this.registrarAsistenciaUseCase.execute({
        eventoId: id,
        jugadorId: req.user.id,
        tipoEvento: "partido",
        estado,
        motivoAusenciaId,
        comentario,
      });

      res.json({ message: "Asistencia registrada correctamente" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /partidos/:partidoId/asistencias/:jugadorId
   */
  async actualizarAsistencia(req, res, next) {
    try {
      const { partidoId, jugadorId } = req.params;
      const { estado, motivoAusenciaId, comentario } = req.body;

      // Solo gestores o el propio jugador pueden actualizar
      if (req.user.rol !== "gestor" && req.user.id !== parseInt(jugadorId)) {
        return res.status(403).json({ error: "No autorizado" });
      }

      await this.actualizarEstadoAsistenciaUseCase.execute({
        eventoId: partidoId,
        jugadorId,
        tipoEvento: "partido",
        estado,
        motivoAusenciaId,
        comentario,
      });

      res.json({ message: "Asistencia actualizada correctamente" });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /partidos/:id/finalizar
   * Finaliza un partido guardando todas las estadísticas en la base de datos
   */
  async finalizarPartido(req, res, next) {
    const client = await this.pool.connect();

    try {
      if (req.user.rol !== "gestor") {
        return res
          .status(403)
          .json({ error: "Solo gestores pueden finalizar partidos" });
      }

      const { id } = req.params;
      const {
        estadisticas, // golesLocal, golesVisitante, faltasLocal, faltasVisitante, dorsalesVisitantes
        jugadores, // estadísticas individuales de cada jugador
        staff, // tarjetas a staff
        historialAcciones, // goles, tarjetas, cambios
        tiemposJuego, // entradas/salidas de jugadores
      } = req.body;

      console.log("📊 Datos recibidos para finalizar partido:", {
        partidoId: id,
        estadisticas,
        totalJugadores: jugadores?.length,
        totalStaff: staff?.length,
        totalAcciones: historialAcciones?.length,
        totalTiempos: tiemposJuego?.length,
      });

      // Iniciar transacción
      await client.query("BEGIN");

      // 1. Actualizar estado del partido a "finalizado"
      await client.query("UPDATE partidos SET estado = $1 WHERE id = $2", [
        "finalizado",
        id,
      ]);

      // 2. Insertar estadísticas del partido
      const resultEstadisticas = await client.query(
        `INSERT INTO estadisticas_partidos (
          partido_id, goles_local, goles_visitante, 
          faltas_local, faltas_visitante, dorsales_visitantes,
          duracion_minutos, fecha_registro
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id`,
        [
          id,
          estadisticas.golesLocal || 0,
          estadisticas.golesVisitante || 0,
          estadisticas.faltasLocal || 0,
          estadisticas.faltasVisitante || 0,
          JSON.stringify(estadisticas.dorsalesVisitantes || []),
          estadisticas.duracionMinutos || 90,
        ]
      );

      const estadisticasId = resultEstadisticas.rows[0].id;

      // 3. Insertar estadísticas de jugadores
      if (jugadores && jugadores.length > 0) {
        for (const jugador of jugadores) {
          await client.query(
            `INSERT INTO estadisticas_jugadores_partido (
              estadisticas_partido_id, jugador_id, posicion,
              minutos_jugados, goles, asistencias, tarjetas_amarillas,
              tarjetas_rojas, paradas, goles_recibidos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              estadisticasId,
              jugador.jugadorId,
              jugador.posicion || null,
              jugador.minutosJugados || 0,
              jugador.goles || 0,
              jugador.asistencias || 0,
              jugador.tarjetasAmarillas || 0,
              jugador.tarjetasRojas || 0,
              jugador.paradas || 0,
              jugador.golesRecibidos || 0,
            ]
          );
        }
      }

      // 4. Insertar staff (si hay tarjetas a staff)
      if (staff && staff.length > 0) {
        for (const miembro of staff) {
          await client.query(
            `INSERT INTO staff_partido (
              estadisticas_partido_id, nombre, tipo_staff,
              tarjetas_amarillas, tarjetas_rojas
            ) VALUES ($1, $2, $3, $4, $5)`,
            [
              estadisticasId,
              miembro.nombre,
              miembro.tipo || "entrenador",
              miembro.tarjetasAmarillas || 0,
              miembro.tarjetasRojas || 0,
            ]
          );
        }
      }

      // 5. Insertar historial de acciones
      if (historialAcciones && historialAcciones.length > 0) {
        for (const accion of historialAcciones) {
          await client.query(
            `INSERT INTO historial_acciones_partido (
              estadisticas_partido_id, minuto, accion, equipo,
              jugador_id, jugador_nombre, dorsal, detalles, orden_accion
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              estadisticasId,
              accion.minuto,
              accion.accion,
              accion.equipo,
              accion.jugadorId || null,
              accion.jugadorNombre || null,
              accion.dorsal || null,
              accion.detalles || null,
              accion.ordenAccion,
            ]
          );
        }
      }

      // 6. Insertar tiempos de juego
      if (tiemposJuego && tiemposJuego.length > 0) {
        for (const tiempo of tiemposJuego) {
          await client.query(
            `INSERT INTO tiempos_juego_partido (
              estadisticas_partido_id, jugador_id, 
              minuto_entrada, minuto_salida, posicion, duracion_minutos
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              estadisticasId,
              tiempo.jugadorId,
              tiempo.minutoEntrada || 0,
              tiempo.minutoSalida || null,
              tiempo.posicion || null,
              tiempo.duracionMinutos || 0,
            ]
          );
        }
      }

      // Commit de la transacción
      await client.query("COMMIT");

      console.log("✅ Partido finalizado exitosamente:", {
        partidoId: id,
        estadisticasId,
      });

      res.json({
        message: "Partido finalizado y estadísticas guardadas correctamente",
        estadisticasId,
        partidoId: id,
      });
    } catch (error) {
      // Rollback en caso de error
      await client.query("ROLLBACK");
      console.error("❌ Error al finalizar partido:", error);
      next(error);
    } finally {
      client.release();
    }
  }
}

export function createPartidoController(container) {
  const controller = new PartidoController(container);

  return {
    crearPartido: (req, res, next) => controller.crearPartido(req, res, next),
    listarPartidos: (req, res, next) =>
      controller.listarPartidos(req, res, next),
    obtenerProximos: (req, res, next) =>
      controller.obtenerProximos(req, res, next),
    obtenerPartido: (req, res, next) =>
      controller.obtenerPartido(req, res, next),
    actualizarPartido: (req, res, next) =>
      controller.actualizarPartido(req, res, next),
    eliminarPartido: (req, res, next) =>
      controller.eliminarPartido(req, res, next),
    registrarResultado: (req, res, next) =>
      controller.registrarResultado(req, res, next),
    registrarAsistencia: (req, res, next) =>
      controller.registrarAsistencia(req, res, next),
    actualizarAsistencia: (req, res, next) =>
      controller.actualizarAsistencia(req, res, next),
    finalizarPartido: (req, res, next) =>
      controller.finalizarPartido(req, res, next),
  };
}
