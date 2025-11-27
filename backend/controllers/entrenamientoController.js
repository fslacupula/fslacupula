import {
  Entrenamiento,
  AsistenciaEntrenamiento,
  Usuario,
  pool,
} from "../models/index.js";

// Helper para convertir fecha_hora a fecha y hora separados para el frontend
// Usa estándares de Intl.DateTimeFormat para manejo robusto de fechas
const formatearFechaHora = (item) => {
  if (item && item.fecha_hora) {
    const fecha = new Date(item.fecha_hora);

    // Validar que la fecha sea válida
    if (isNaN(fecha.getTime())) {
      console.error("Fecha inválida:", item.fecha_hora);
      return item;
    }

    // Enviar fecha_hora completo como ISO string para que el cliente lo convierta
    item.fecha = item.fecha_hora;

    // Extraer hora en formato local usando Intl.DateTimeFormat para consistencia
    // Formato 24h con timezone Europe/Madrid explícito
    item.hora = fecha.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Europe/Madrid",
    });
  }
  return item;
};

export const crearEntrenamiento = async (req, res) => {
  try {
    const { fecha, hora, ubicacion, descripcion, duracionMinutos } = req.body;

    if (!fecha || !hora || !ubicacion) {
      return res
        .status(400)
        .json({ error: "Fecha, hora y ubicación son requeridos" });
    }

    const entrenamiento = await Entrenamiento.crear(
      fecha,
      hora,
      ubicacion,
      descripcion,
      duracionMinutos || 90,
      req.user.id
    );

    // Crear asistencias pendientes para todos los jugadores
    const jugadores = await Usuario.listarJugadores();
    for (const jugador of jugadores) {
      await AsistenciaEntrenamiento.registrar(
        entrenamiento.id,
        jugador.id,
        "pendiente"
      );
    }

    res
      .status(201)
      .json({ message: "Entrenamiento creado exitosamente", entrenamiento });
  } catch (error) {
    console.error("Error al crear entrenamiento:", error);
    res.status(500).json({ error: "Error al crear entrenamiento" });
  }
};

export const listarEntrenamientos = async (req, res) => {
  try {
    const { fechaDesde, fechaHasta } = req.query;
    const entrenamientos = await Entrenamiento.listar({
      fechaDesde,
      fechaHasta,
    });

    // Añadir asistencias a cada entrenamiento y formatear fecha_hora
    for (const entrenamiento of entrenamientos) {
      formatearFechaHora(entrenamiento);
      const asistencias = await AsistenciaEntrenamiento.listarPorEntrenamiento(
        entrenamiento.id
      );
      entrenamiento.asistencias = asistencias;
    }

    res.json({ entrenamientos });
  } catch (error) {
    console.error("Error al listar entrenamientos:", error);
    res.status(500).json({ error: "Error al listar entrenamientos" });
  }
};

export const obtenerEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const entrenamiento = await Entrenamiento.buscarPorId(id);

    if (!entrenamiento) {
      return res.status(404).json({ error: "Entrenamiento no encontrado" });
    }

    formatearFechaHora(entrenamiento);
    const asistencias = await AsistenciaEntrenamiento.listarPorEntrenamiento(
      id
    );

    entrenamiento.asistencias = asistencias;
    res.json({ entrenamiento });
  } catch (error) {
    console.error("Error al obtener entrenamiento:", error);
    res.status(500).json({ error: "Error al obtener entrenamiento" });
  }
};

export const actualizarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora, ubicacion, descripcion, duracionMinutos } = req.body;

    const entrenamiento = await Entrenamiento.buscarPorId(id);
    if (!entrenamiento) {
      return res.status(404).json({ error: "Entrenamiento no encontrado" });
    }

    const actualizado = await Entrenamiento.actualizar(id, {
      fecha,
      hora,
      ubicacion,
      descripcion,
      duracionMinutos,
    });

    res.json({
      message: "Entrenamiento actualizado",
      entrenamiento: actualizado,
    });
  } catch (error) {
    console.error("Error al actualizar entrenamiento:", error);
    res.status(500).json({ error: "Error al actualizar entrenamiento" });
  }
};

export const eliminarEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;

    const entrenamiento = await Entrenamiento.buscarPorId(id);
    if (!entrenamiento) {
      return res.status(404).json({ error: "Entrenamiento no encontrado" });
    }

    await Entrenamiento.eliminar(id);
    res.json({ message: "Entrenamiento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar entrenamiento:", error);
    res.status(500).json({ error: "Error al eliminar entrenamiento" });
  }
};

export const registrarAsistenciaEntrenamiento = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivoAusenciaId, comentario } = req.body;
    const jugadorId = req.user.id;

    console.log("Registrando asistencia:", {
      entrenamientoId: id,
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

    const asistencia = await AsistenciaEntrenamiento.registrar(
      id,
      jugadorId,
      estado,
      motivoAusenciaId,
      comentario
    );

    console.log("Asistencia registrada en BD:", asistencia);
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

    console.log("Gestor actualizando asistencia:", {
      entrenamientoId: id,
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

    const asistencia = await AsistenciaEntrenamiento.registrar(
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

export const misEntrenamientos = async (req, res) => {
  try {
    const jugadorId = req.user.id;

    // Primero, crear asistencias pendientes para entrenamientos sin asistencia registrada
    // Usamos un query directo con ON CONFLICT DO NOTHING para no sobrescribir
    const entrenamientos = await Entrenamiento.listar({});
    for (const ent of entrenamientos) {
      try {
        await pool.query(
          `INSERT INTO asistencias_entrenamientos (entrenamiento_id, jugador_id, estado) 
           VALUES ($1, $2, 'pendiente') 
           ON CONFLICT (entrenamiento_id, jugador_id) DO NOTHING`,
          [ent.id, jugadorId]
        );
      } catch (error) {
        // Ignorar errores
      }
    }

    const asistencias = await AsistenciaEntrenamiento.listarPorJugador(
      jugadorId
    );
    res.json({ entrenamientos: asistencias });
  } catch (error) {
    console.error("Error al obtener entrenamientos del jugador:", error);
    res.status(500).json({ error: "Error al obtener entrenamientos" });
  }
};
