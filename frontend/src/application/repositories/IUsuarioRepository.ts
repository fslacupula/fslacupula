import { Usuario } from "@domain";

/**
 * Interfaz del repositorio de usuarios
 * Define las operaciones que deben implementarse para gestionar usuarios
 */
export interface IUsuarioRepository {
  /**
   * Obtiene el usuario autenticado actualmente
   * @returns Promise con el usuario o null si no hay sesión
   */
  obtenerUsuarioActual(): Promise<Usuario | null>;

  /**
   * Obtiene todos los jugadores activos
   * @returns Promise con array de usuarios con rol jugador
   */
  obtenerJugadores(): Promise<Usuario[]>;

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Promise con el usuario o null si no existe
   */
  obtenerPorId(id: number): Promise<Usuario | null>;

  /**
   * Actualiza los datos de un usuario
   * @param id ID del usuario
   * @param datos Datos parciales a actualizar
   * @returns Promise con el usuario actualizado
   */
  actualizar(id: number, datos: Partial<Usuario>): Promise<Usuario>;
}
