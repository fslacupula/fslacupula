import { Partido, AsistenciaPartido, Usuario, pool } from "../models/index.js";

export const crearPartido = async (req, res) => {
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
      return res
        .status(400)
        .json({ error: "Fecha, hora, rival y ubicación son requeridos" });
    }

    const partido = await Partido.crear(
      {
        fecha,
        hora,
        rival,
        ubicacion,
        tipo,
        esLocal,
        resultado,
        observaciones,
      },
      req.user.id
    );

    // Crear asistencias pendientes para todos los jugadores
    const jugadores = await Usuario.listarJugadores();
    for (const jugador of jugadores) {
      await AsistenciaPartido.registrar(partido.id, jugador.id, "pendiente");
    }

    res.status(201).json({ message: "Partido creado exitosamente", partido });
  } catch (error) {
    console.error("Error al crear partido:", error);
    res.status(500).json({ error: "Error al crear partido" });
  }
};

export const listarPartidos = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const partidos = await Partido.listar({ fechaDesde, fechaHasta });

    // Añadir asistencias a cada partido
    for (const partido of partidos) {
      const asistencias = await AsistenciaPartido.listarPorPartido(partido.id);
      partido.asistencias = asistencias;
    }

    res.json({ partidos });
  } catch (error) {
    console.error("Error al listar partidos:", error);
    res.status(500).json({ error: "Error al listar partidos" });
  }
};

export const obtenerPartido = async (req, res) => {
  try {
    const { id } = req.params;
    const partido = await Partido.buscarPorId(id);

    if (!partido) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    const asistencias = await AsistenciaPartido.listarPorPartido(id);

    partido.asistencias = asistencias;
    res.json({ partido });
  } catch (error) {
    console.error("Error al obtener partido:", error);
    res.status(500).json({ error: "Error al obtener partido" });
  }
};

export const actualizarPartido = async (req, res) => {
  try {
    const { id } = req.params;
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

    const partido = await Partido.buscarPorId(id);
    if (!partido) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    const actualizado = await Partido.actualizar(id, {
      fecha,
      hora,
      rival,
      ubicacion,
      tipo,
      esLocal,
      resultado,
      observaciones,
    });

    res.json({ message: "Partido actualizado", partido: actualizado });
  } catch (error) {
    console.error("Error al actualizar partido:", error);
    res.status(500).json({ error: "Error al actualizar partido" });
  }
};

export const eliminarPartido = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await Partido.buscarPorId(id);
    if (!partido) {
      return res.status(404).json({ error: "Partido no encontrado" });
    }

    await Partido.eliminar(id);
    res.json({ message: "Partido eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar partido:", error);
    res.status(500).json({ error: "Error al eliminar partido" });
  }
};

export const registrarAsistenciaPartido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivoAusenciaId, comentario } = req.body;
    const jugadorId = req.user.id;

    console.log("Registrando asistencia partido:", {
      partidoId: id,
      jugadorId,
      estado,
      motivoAusenciaId,
      comentario,
      body: req.body,
    });

    if (!["confirmado", "no_asiste", "pendiente"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    if (estado === "no_asiste" && !motivoAusenciaId) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un motivo de ausencia" });
    }

    const asistencia = await AsistenciaPartido.registrar(
      id,
      jugadorId,
      estado,
      motivoAusenciaId,
      comentario
    );

    console.log("Asistencia partido registrada en BD:", asistencia);
    res.json({ message: "Asistencia registrada", asistencia });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({ error: "Error al registrar asistencia" });
  }
};

export const actualizarAsistenciaGestor = async (req, res) => {
  try {
    const { id, jugadorId } = req.params;
    const { estado, motivoAusenciaId, comentario } = req.body;

    // Verificar que el usuario sea gestor
    if (req.user.rol !== "gestor") {
      return res.status(403).json({ error: "No autorizado" });
    }

    console.log("Gestor actualizando asistencia partido:", {
      partidoId: id,
      jugadorId,
      estado,
      motivoAusenciaId,
      comentario,
    });

    if (!["confirmado", "no_asiste", "pendiente"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    if (estado === "no_asiste" && !motivoAusenciaId) {
      return res
        .status(400)
        .json({ error: "Debe proporcionar un motivo de ausencia" });
    }

    const asistencia = await AsistenciaPartido.registrar(
      id,
      jugadorId,
      estado,
      motivoAusenciaId,
      comentario
    );

    res.json({ message: "Asistencia actualizada", asistencia });
  } catch (error) {
    console.error("Error al actualizar asistencia:", error);
    res.status(500).json({ error: "Error al actualizar asistencia" });
  }
};

export const misPartidos = async (req, res) => {
  try {
    const jugadorId = req.user.id;

    // Primero, crear asistencias pendientes para partidos sin asistencia registrada
    // Usamos ON CONFLICT DO NOTHING para no sobrescribir asistencias existentes
    const partidos = await Partido.listar({});
    for (const partido of partidos) {
      try {
        await pool.query(
          `INSERT INTO asistencias_partidos (partido_id, jugador_id, estado) 
           VALUES ($1, $2, 'pendiente') 
           ON CONFLICT (partido_id, jugador_id) DO NOTHING`,
          [partido.id, jugadorId]
        );
      } catch (error) {
        // Ignorar errores
      }
    }

    const asistencias = await AsistenciaPartido.listarPorJugador(jugadorId);
    res.json({ partidos: asistencias });
  } catch (error) {
    console.error("Error al obtener partidos del jugador:", error);
    res.status(500).json({ error: "Error al obtener partidos" });
  }
};
