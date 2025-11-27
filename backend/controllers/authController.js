import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  Usuario,
  Jugador,
  Entrenamiento,
  Partido,
  AsistenciaEntrenamiento,
  AsistenciaPartido,
  Posicion,
} from "../models/index.js";

export const register = async (req, res) => {
  try {
    const { email, password, nombre, rol, datosJugador } = req.body;

    if (!email || !password || !nombre) {
      return res
        .status(400)
        .json({ error: "Email, contraseña y nombre son requeridos" });
    }

    if (rol && !["jugador", "gestor"].includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.crear(
      email,
      hashedPassword,
      nombre,
      rol || "jugador"
    );

    // Si es jugador, crear registro adicional con datos del jugador
    if (nuevoUsuario.rol === "jugador" && datosJugador) {
      await Jugador.crear(nuevoUsuario.id, datosJugador);
    }

    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son requeridos" });
    }

    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (!usuario.activo) {
      return res.status(401).json({ error: "Usuario inactivo" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.user.id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    let datosCompletos = { ...usuario };

    if (usuario.rol === "jugador") {
      const jugador = await Jugador.buscarPorUsuarioId(usuario.id);
      datosCompletos.datosJugador = jugador;
    }

    delete datosCompletos.password;
    res.json({ usuario: datosCompletos });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

export const registrarJugadorPorGestor = async (req, res) => {
  try {
    // Verificar que el usuario sea gestor
    if (req.user.rol !== "gestor") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { email, password, nombre, datosJugador } = req.body;

    if (!email || !password || !nombre) {
      return res
        .status(400)
        .json({ error: "Email, contraseña y nombre son requeridos" });
    }

    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await Usuario.crear(
      email,
      hashedPassword,
      nombre,
      "jugador"
    );

    // Crear registro adicional con datos del jugador
    if (datosJugador) {
      await Jugador.crear(nuevoUsuario.id, datosJugador);
    }

    // Registrar asistencias pendientes para entrenamientos y partidos desde hoy en adelante
    const fechaHoy = new Date().toISOString().split("T")[0];

    try {
      // Obtener entrenamientos desde hoy en adelante
      const entrenamientosFuturos = await Entrenamiento.listar({
        fechaDesde: fechaHoy,
      });

      // Registrar asistencias pendientes para entrenamientos
      for (const entrenamiento of entrenamientosFuturos) {
        await AsistenciaEntrenamiento.registrar(
          entrenamiento.id,
          nuevoUsuario.id,
          "pendiente"
        );
      }

      // Obtener partidos desde hoy en adelante
      const partidosFuturos = await Partido.listar({
        fechaDesde: fechaHoy,
      });

      // Registrar asistencias pendientes para partidos
      for (const partido of partidosFuturos) {
        await AsistenciaPartido.registrar(
          partido.id,
          nuevoUsuario.id,
          "pendiente"
        );
      }

      console.log(
        `Jugador ${nuevoUsuario.nombre} registrado con ${entrenamientosFuturos.length} entrenamientos y ${partidosFuturos.length} partidos asignados`
      );
    } catch (error) {
      console.error("Error al asignar eventos al jugador:", error);
      // No falla el registro completo si esto falla
    }

    res.status(201).json({
      message: "Jugador registrado exitosamente",
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error("Error al registrar jugador:", error);
    res.status(500).json({ error: "Error al registrar jugador" });
  }
};

export const listarJugadores = async (req, res) => {
  try {
    // Verificar que el usuario sea gestor
    if (req.user.rol !== "gestor") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const jugadores = await Usuario.listarJugadores();
    res.json({ jugadores });
  } catch (error) {
    console.error("Error al listar jugadores:", error);
    res.status(500).json({ error: "Error al listar jugadores" });
  }
};

export const cambiarEstadoJugador = async (req, res) => {
  try {
    // Verificar que el usuario sea gestor
    if (req.user.rol !== "gestor") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== "boolean") {
      return res
        .status(400)
        .json({ error: "El estado activo debe ser booleano" });
    }

    await Usuario.cambiarEstado(id, activo);
    res.json({ message: "Estado del jugador actualizado correctamente" });
  } catch (error) {
    console.error("Error al cambiar estado del jugador:", error);
    res.status(500).json({ error: "Error al cambiar estado del jugador" });
  }
};
