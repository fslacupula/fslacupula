/**
 * Controller de Autenticación y Usuarios
 * Adaptador HTTP que delega toda la lógica a los use cases
 */

import { ValidationError } from "../../../domain/errors/ValidationError.js";

export class AuthController {
  constructor(container) {
    this.crearUsuarioUseCase = container.getUseCase("crearUsuarioUseCase");
    this.loginUsuarioUseCase = container.getUseCase("loginUsuarioUseCase");
    this.obtenerUsuarioPorIdUseCase = container.getUseCase(
      "obtenerUsuarioPorIdUseCase"
    );
    this.actualizarUsuarioUseCase = container.getUseCase(
      "actualizarUsuarioUseCase"
    );
    this.listarUsuariosUseCase = container.getUseCase("listarUsuariosUseCase");
    this.crearJugadorUseCase = container.getUseCase("crearJugadorUseCase");
    this.listarJugadoresUseCase = container.getUseCase(
      "listarJugadoresUseCase"
    );
    this.registrarAsistenciaUseCase = container.getUseCase(
      "registrarAsistenciaUseCase"
    );
    this.listarPartidosUseCase = container.getUseCase("listarPartidosUseCase");
    this.listarEntrenamientosUseCase = container.getUseCase(
      "listarEntrenamientosUseCase"
    );
  }

  /**
   * POST /auth/register
   * Registra un nuevo usuario
   */
  async register(req, res, next) {
    try {
      const { email, password, nombre, rol, datosJugador } = req.body;

      // Validación básica
      if (!email || !password || !nombre) {
        throw new ValidationError("Email, contraseña y nombre son requeridos");
      }

      if (rol && !["jugador", "gestor", "admin"].includes(rol)) {
        throw new ValidationError("Rol inválido");
      }

      // Crear usuario
      const nuevoUsuario = await this.crearUsuarioUseCase.execute({
        email,
        password,
        nombre,
        rol: rol || "jugador",
      });

      // Si es jugador y hay datos adicionales, crear perfil de jugador
      let jugador = null;
      if (nuevoUsuario.rol === "jugador" && datosJugador) {
        jugador = await this.crearJugadorUseCase.execute({
          usuarioId: nuevoUsuario.id,
          ...datosJugador,
        });
      }

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        token: nuevoUsuario.token,
        usuario: {
          id: nuevoUsuario.id,
          email: nuevoUsuario.email,
          nombre: nuevoUsuario.nombre,
          rol: nuevoUsuario.rol,
          jugador: jugador || undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Inicia sesión
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError("Email y contraseña son requeridos");
      }

      const resultado = await this.loginUsuarioUseCase.execute({
        email,
        password,
      });

      res.json({
        message: "Login exitoso",
        token: resultado.token,
        usuario: {
          id: resultado.usuario.id,
          email: resultado.usuario.email,
          nombre: resultado.usuario.nombre,
          rol: resultado.usuario.rol,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/profile
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile(req, res, next) {
    try {
      const usuario = await this.obtenerUsuarioPorIdUseCase.execute(
        req.user.id
      );

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          activo: usuario.activo,
          datosJugador: usuario.jugador || undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/jugadores (solo gestor)
   * Registra un nuevo jugador
   */
  async registrarJugadorPorGestor(req, res, next) {
    try {
      // Verificar que el usuario sea gestor
      if (req.user.rol !== "gestor") {
        return res.status(403).json({ error: "No autorizado" });
      }

      const { email, password, nombre, datosJugador } = req.body;

      if (!email || !password || !nombre) {
        throw new ValidationError("Email, contraseña y nombre son requeridos");
      }

      // Crear usuario
      const nuevoUsuario = await this.crearUsuarioUseCase.execute({
        email,
        password,
        nombre,
        rol: "jugador",
      });

      // Crear perfil de jugador
      let jugador = null;
      if (datosJugador) {
        jugador = await this.crearJugadorUseCase.execute({
          usuarioId: nuevoUsuario.id,
          ...datosJugador,
        });
      }

      // Registrar asistencias pendientes para eventos futuros
      try {
        const fechaHoy = new Date().toISOString().split("T")[0];

        // Obtener entrenamientos futuros
        const entrenamientos = await this.listarEntrenamientosUseCase.execute({
          fechaDesde: fechaHoy,
        });

        // Registrar asistencias pendientes para entrenamientos
        for (const entrenamiento of entrenamientos) {
          await this.registrarAsistenciaUseCase.execute({
            eventoId: entrenamiento.id,
            jugadorId: nuevoUsuario.id,
            tipoEvento: "entrenamiento",
            estado: "pendiente",
          });
        }

        // Obtener partidos futuros
        const partidos = await this.listarPartidosUseCase.execute({
          fechaDesde: fechaHoy,
        });

        // Registrar asistencias pendientes para partidos
        for (const partido of partidos) {
          await this.registrarAsistenciaUseCase.execute({
            eventoId: partido.id,
            jugadorId: nuevoUsuario.id,
            tipoEvento: "partido",
            estado: "pendiente",
          });
        }

        console.log(
          `Jugador ${nuevoUsuario.nombre} registrado con ${entrenamientos.length} entrenamientos y ${partidos.length} partidos asignados`
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
          jugador: jugador || undefined,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/jugadores (solo gestor)
   * Lista todos los jugadores
   */
  async listarJugadores(req, res, next) {
    try {
      console.log("🔍 [listarJugadores] req.user:", req.user);

      // Verificar que el usuario sea gestor
      if (!req.user) {
        return res.status(401).json({ error: "Usuario no autenticado" });
      }

      if (req.user.rol !== "gestor") {
        return res.status(403).json({ error: "No autorizado" });
      }

      const resultado = await this.listarJugadoresUseCase.execute();
      console.log("📋 [listarJugadores] Resultado:", resultado);

      res.json(resultado);
    } catch (error) {
      console.error("❌ [listarJugadores] Error:", error);
      next(error);
    }
  }

  /**
   * PATCH /auth/jugadores/:id/estado (solo gestor)
   * Cambia el estado de un jugador
   */
  async cambiarEstadoJugador(req, res, next) {
    try {
      // Verificar que el usuario sea gestor
      if (req.user.rol !== "gestor") {
        return res.status(403).json({ error: "No autorizado" });
      }

      const { id } = req.params;
      const { activo } = req.body;

      if (typeof activo !== "boolean") {
        throw new ValidationError("El estado activo debe ser booleano");
      }

      await this.actualizarUsuarioUseCase.execute(id, { activo });

      res.json({ message: "Estado del jugador actualizado correctamente" });
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Factory para crear instancia del controller con dependencias inyectadas
 */
export function createAuthController(container) {
  const controller = new AuthController(container);

  return {
    register: (req, res, next) => controller.register(req, res, next),
    login: (req, res, next) => controller.login(req, res, next),
    getProfile: (req, res, next) => controller.getProfile(req, res, next),
    registrarJugadorPorGestor: (req, res, next) =>
      controller.registrarJugadorPorGestor(req, res, next),
    listarJugadores: (req, res, next) =>
      controller.listarJugadores(req, res, next),
    cambiarEstadoJugador: (req, res, next) =>
      controller.cambiarEstadoJugador(req, res, next),
  };
}
