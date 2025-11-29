import { Entrenamiento, Partido } from "@domain";

/**
 * Filtros para buscar eventos
 */
export interface FiltrosEvento {
  fechaDesde?: string; // YYYY-MM-DD
  fechaHasta?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
}

/**
 * Datos para crear un entrenamiento
 */
export interface CrearEntrenamientoDTO {
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  ubicacion: string;
  descripcion?: string;
  duracionMinutos?: number;
}

/**
 * Datos para crear un partido
 */
export interface CrearPartidoDTO {
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  ubicacion: string;
  rival: string;
  tipo: "amistoso" | "liga" | "copa" | "torneo";
  esLocal: boolean;
}

/**
 * Interfaz del repositorio de eventos (entrenamientos y partidos)
 * Define las operaciones CRUD para ambos tipos de eventos
 */
export interface IEventoRepository {
  // ==================== ENTRENAMIENTOS ====================

  /**
   * Lista entrenamientos con filtros opcionales
   * @param filtros Criterios de búsqueda
   * @returns Promise con array de entrenamientos
   */
  listarEntrenamientos(filtros?: FiltrosEvento): Promise<Entrenamiento[]>;

  /**
   * Obtiene un entrenamiento por su ID
   * @param id ID del entrenamiento
   * @returns Promise con el entrenamiento o null si no existe
   */
  obtenerEntrenamiento(id: number): Promise<Entrenamiento | null>;

  /**
   * Crea un nuevo entrenamiento
   * @param datos Datos del entrenamiento
   * @returns Promise con el entrenamiento creado
   */
  crearEntrenamiento(datos: CrearEntrenamientoDTO): Promise<Entrenamiento>;

  /**
   * Actualiza un entrenamiento existente
   * @param id ID del entrenamiento
   * @param datos Datos a actualizar
   * @returns Promise con el entrenamiento actualizado
   */
  actualizarEntrenamiento(
    id: number,
    datos: Partial<CrearEntrenamientoDTO>
  ): Promise<Entrenamiento>;

  /**
   * Elimina un entrenamiento
   * @param id ID del entrenamiento
   * @returns Promise que se resuelve cuando se elimina
   */
  eliminarEntrenamiento(id: number): Promise<void>;

  // ==================== PARTIDOS ====================

  /**
   * Lista partidos con filtros opcionales
   * @param filtros Criterios de búsqueda
   * @returns Promise con array de partidos
   */
  listarPartidos(filtros?: FiltrosEvento): Promise<Partido[]>;

  /**
   * Obtiene un partido por su ID
   * @param id ID del partido
   * @returns Promise con el partido o null si no existe
   */
  obtenerPartido(id: number): Promise<Partido | null>;

  /**
   * Crea un nuevo partido
   * @param datos Datos del partido
   * @returns Promise con el partido creado
   */
  crearPartido(datos: CrearPartidoDTO): Promise<Partido>;

  /**
   * Actualiza un partido existente
   * @param id ID del partido
   * @param datos Datos a actualizar
   * @returns Promise con el partido actualizado
   */
  actualizarPartido(
    id: number,
    datos: Partial<CrearPartidoDTO>
  ): Promise<Partido>;

  /**
   * Actualiza el resultado de un partido
   * @param id ID del partido
   * @param resultado Resultado en formato "X-Y"
   * @returns Promise con el partido actualizado
   */
  actualizarResultado(id: number, resultado: string): Promise<Partido>;

  /**
   * Elimina un partido
   * @param id ID del partido
   * @returns Promise que se resuelve cuando se elimina
   */
  eliminarPartido(id: number): Promise<void>;
}
