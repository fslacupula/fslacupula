/**
 * Contenedor de Inyección de Dependencias
 * Centraliza la creación e inyección de todas las dependencias del sistema
 */

// Repositories
import { UsuarioRepositoryPg } from "../repositories/UsuarioRepositoryPg.js";
import { JugadorRepositoryPg } from "../repositories/JugadorRepositoryPg.js";
import { PartidoRepositoryPg } from "../repositories/PartidoRepositoryPg.js";
import { EntrenamientoRepositoryPg } from "../repositories/EntrenamientoRepositoryPg.js";
import { AsistenciaRepositoryPg } from "../repositories/AsistenciaRepositoryPg.js";
import { PosicionRepositoryPostgres } from "../persistence/postgres/PosicionRepositoryPostgres.js";
import { MotivoAusenciaRepositoryPostgres } from "../persistence/postgres/MotivoAusenciaRepositoryPostgres.js";

// Database pool
import { pool } from "../../../config/database.js";

// External Services
import { HashService } from "../services/HashService.js";
import { TokenService } from "../services/TokenService.js";
import { DateTimeService } from "../services/DateTimeService.js";

// Use Cases - Usuario
import { CrearUsuarioUseCase } from "../../application/useCases/usuario/CrearUsuarioUseCase.js";
import { LoginUsuarioUseCase } from "../../application/useCases/usuario/LoginUsuarioUseCase.js";
import { ObtenerUsuarioPorIdUseCase } from "../../application/useCases/usuario/ObtenerUsuarioPorIdUseCase.js";
import { ActualizarUsuarioUseCase } from "../../application/useCases/usuario/ActualizarUsuarioUseCase.js";
import { ListarUsuariosUseCase } from "../../application/useCases/usuario/ListarUsuariosUseCase.js";

// Use Cases - Jugador
import { CrearPerfilJugadorUseCase } from "../../application/useCases/jugador/CrearPerfilJugadorUseCase.js";
import { ListarJugadoresUseCase } from "../../application/useCases/jugador/ListarJugadoresUseCase.js";
import { ObtenerJugadorPorIdUseCase } from "../../application/useCases/jugador/ObtenerJugadorPorIdUseCase.js";
import { ActualizarPerfilJugadorUseCase } from "../../application/useCases/jugador/ActualizarPerfilJugadorUseCase.js";

// Use Cases - Partido
import { CrearPartidoUseCase } from "../../application/useCases/partido/CrearPartidoUseCase.js";
import { ListarPartidosUseCase } from "../../application/useCases/partido/ListarPartidosUseCase.js";
import { ObtenerPartidoPorIdUseCase } from "../../application/useCases/partido/ObtenerPartidoPorIdUseCase.js";
import { ActualizarPartidoUseCase } from "../../application/useCases/partido/ActualizarPartidoUseCase.js";
import { EliminarPartidoUseCase } from "../../application/useCases/partido/EliminarPartidoUseCase.js";
import { RegistrarResultadoUseCase } from "../../application/useCases/partido/RegistrarResultadoUseCase.js";
import { ObtenerProximosPartidosUseCase } from "../../application/useCases/partido/ObtenerProximosPartidosUseCase.js";

// Use Cases - Entrenamiento
import { CrearEntrenamientoUseCase } from "../../application/useCases/entrenamiento/CrearEntrenamientoUseCase.js";
import { ListarEntrenamientosUseCase } from "../../application/useCases/entrenamiento/ListarEntrenamientosUseCase.js";
import { ObtenerEntrenamientoPorIdUseCase } from "../../application/useCases/entrenamiento/ObtenerEntrenamientoPorIdUseCase.js";
import { ActualizarEntrenamientoUseCase } from "../../application/useCases/entrenamiento/ActualizarEntrenamientoUseCase.js";
import { EliminarEntrenamientoUseCase } from "../../application/useCases/entrenamiento/EliminarEntrenamientoUseCase.js";

// Use Cases - Asistencia
import { RegistrarAsistenciaUseCase } from "../../application/useCases/asistencia/RegistrarAsistenciaUseCase.js";
import { ActualizarEstadoAsistenciaUseCase } from "../../application/useCases/asistencia/ActualizarEstadoAsistenciaUseCase.js";
import { ObtenerAsistenciasPorEventoUseCase } from "../../application/useCases/asistencia/ObtenerAsistenciasPorEventoUseCase.js";
import { ObtenerEstadisticasAsistenciaUseCase } from "../../application/useCases/asistencia/ObtenerEstadisticasAsistenciaUseCase.js";

// Use Cases - Posicion y Motivo
import { ListarPosicionesUseCase } from "../../application/useCases/posicion/ListarPosicionesUseCase.js";
import { ListarMotivosAusenciaUseCase } from "../../application/useCases/motivo/ListarMotivosAusenciaUseCase.js";

/**
 * Contenedor de dependencias singleton
 */
export class DependencyContainer {
  constructor() {
    this.repositories = {};
    this.services = {};
    this.useCases = {};
    this._initialize();
  }

  /**
   * Inicializa todas las dependencias
   * @private
   */
  _initialize() {
    // 1. Inicializar Servicios Externos
    this.services.hashService = new HashService();
    this.services.tokenService = new TokenService();
    this.services.dateTimeService = new DateTimeService();

    // 2. Inicializar Repositorios
    this.repositories.usuarioRepository = new UsuarioRepositoryPg(pool);
    this.repositories.jugadorRepository = new JugadorRepositoryPg(pool);
    this.repositories.partidoRepository = new PartidoRepositoryPg(pool);
    this.repositories.entrenamientoRepository = new EntrenamientoRepositoryPg(
      pool
    );
    this.repositories.asistenciaRepository = new AsistenciaRepositoryPg(pool);
    this.repositories.posicionRepository = new PosicionRepositoryPostgres();
    this.repositories.motivoAusenciaRepository =
      new MotivoAusenciaRepositoryPostgres();

    // 3. Inicializar Use Cases - Usuario
    this.useCases.crearUsuarioUseCase = new CrearUsuarioUseCase(
      this.repositories.usuarioRepository,
      this.services.hashService
    );

    this.useCases.loginUsuarioUseCase = new LoginUsuarioUseCase(
      this.repositories.usuarioRepository,
      this.services.hashService,
      this.services.tokenService
    );

    this.useCases.obtenerUsuarioPorIdUseCase = new ObtenerUsuarioPorIdUseCase(
      this.repositories.usuarioRepository
    );

    this.useCases.actualizarUsuarioUseCase = new ActualizarUsuarioUseCase(
      this.repositories.usuarioRepository
    );

    this.useCases.listarUsuariosUseCase = new ListarUsuariosUseCase(
      this.repositories.usuarioRepository
    );

    // 4. Inicializar Use Cases - Jugador
    this.useCases.crearPerfilJugadorUseCase = new CrearPerfilJugadorUseCase(
      this.repositories.jugadorRepository,
      this.repositories.usuarioRepository
    );

    this.useCases.listarJugadoresUseCase = new ListarJugadoresUseCase(
      this.repositories.jugadorRepository
    );

    this.useCases.obtenerJugadorPorIdUseCase = new ObtenerJugadorPorIdUseCase(
      this.repositories.jugadorRepository
    );

    this.useCases.actualizarPerfilJugadorUseCase =
      new ActualizarPerfilJugadorUseCase(this.repositories.jugadorRepository);

    // Alias para compatibilidad
    this.useCases.crearJugadorUseCase = this.useCases.crearPerfilJugadorUseCase;

    // 5. Inicializar Use Cases - Partido
    this.useCases.crearPartidoUseCase = new CrearPartidoUseCase(
      this.repositories.partidoRepository,
      this.services.dateTimeService
    );

    this.useCases.listarPartidosUseCase = new ListarPartidosUseCase(
      this.repositories.partidoRepository
    );

    this.useCases.obtenerPartidoPorIdUseCase = new ObtenerPartidoPorIdUseCase(
      this.repositories.partidoRepository
    );

    this.useCases.actualizarPartidoUseCase = new ActualizarPartidoUseCase(
      this.repositories.partidoRepository,
      this.services.dateTimeService
    );

    this.useCases.eliminarPartidoUseCase = new EliminarPartidoUseCase(
      this.repositories.partidoRepository
    );

    this.useCases.registrarResultadoUseCase = new RegistrarResultadoUseCase(
      this.repositories.partidoRepository
    );

    this.useCases.obtenerProximosPartidosUseCase =
      new ObtenerProximosPartidosUseCase(
        this.repositories.partidoRepository,
        this.services.dateTimeService
      );

    // 6. Inicializar Use Cases - Entrenamiento
    this.useCases.crearEntrenamientoUseCase = new CrearEntrenamientoUseCase(
      this.repositories.entrenamientoRepository,
      this.services.dateTimeService
    );

    this.useCases.listarEntrenamientosUseCase = new ListarEntrenamientosUseCase(
      this.repositories.entrenamientoRepository
    );

    this.useCases.obtenerEntrenamientoPorIdUseCase =
      new ObtenerEntrenamientoPorIdUseCase(
        this.repositories.entrenamientoRepository
      );

    this.useCases.actualizarEntrenamientoUseCase =
      new ActualizarEntrenamientoUseCase(
        this.repositories.entrenamientoRepository,
        this.services.dateTimeService
      );

    this.useCases.eliminarEntrenamientoUseCase =
      new EliminarEntrenamientoUseCase(
        this.repositories.entrenamientoRepository
      );

    // 7. Inicializar Use Cases - Asistencia
    this.useCases.registrarAsistenciaUseCase = new RegistrarAsistenciaUseCase(
      this.repositories.asistenciaRepository,
      this.repositories.jugadorRepository
    );

    this.useCases.actualizarEstadoAsistenciaUseCase =
      new ActualizarEstadoAsistenciaUseCase(
        this.repositories.asistenciaRepository
      );

    this.useCases.obtenerAsistenciasPorEventoUseCase =
      new ObtenerAsistenciasPorEventoUseCase(
        this.repositories.asistenciaRepository
      );

    this.useCases.obtenerEstadisticasAsistenciaUseCase =
      new ObtenerEstadisticasAsistenciaUseCase(
        this.repositories.asistenciaRepository,
        this.repositories.jugadorRepository
      );

    // 8. Inicializar Use Cases - Posicion y Motivo
    this.useCases.listarPosicionesUseCase = new ListarPosicionesUseCase(
      this.repositories.posicionRepository
    );

    this.useCases.listarMotivosAusenciaUseCase =
      new ListarMotivosAusenciaUseCase(
        this.repositories.motivoAusenciaRepository
      );
  }

  /**
   * Obtiene un repositorio por nombre
   * @param {string} name - Nombre del repositorio
   * @returns {Object} Repositorio
   */
  getRepository(name) {
    const repository = this.repositories[name];
    if (!repository) {
      throw new Error(`Repository ${name} not found`);
    }
    return repository;
  }

  /**
   * Obtiene un servicio por nombre
   * @param {string} name - Nombre del servicio
   * @returns {Object} Servicio
   */
  getService(name) {
    const service = this.services[name];
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service;
  }

  /**
   * Obtiene un caso de uso por nombre
   * @param {string} name - Nombre del caso de uso
   * @returns {Object} Caso de uso
   */
  getUseCase(name) {
    const useCase = this.useCases[name];
    if (!useCase) {
      throw new Error(`Use case ${name} not found`);
    }
    return useCase;
  }

  /**
   * Obtiene todos los casos de uso
   * @returns {Object} Todos los casos de uso
   */
  getAllUseCases() {
    return this.useCases;
  }

  /**
   * Obtiene todos los servicios
   * @returns {Object} Todos los servicios
   */
  getAllServices() {
    return this.services;
  }

  /**
   * Obtiene todos los repositorios
   * @returns {Object} Todos los repositorios
   */
  getAllRepositories() {
    return this.repositories;
  }
}

// Exportar instancia singleton
let containerInstance = null;

export function getContainer() {
  if (!containerInstance) {
    containerInstance = new DependencyContainer();
  }
  return containerInstance;
}
