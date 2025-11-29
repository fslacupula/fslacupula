/**
 * Instancias singleton de los controllers
 * Se crean una sola vez y se exportan para ser usadas en las rutas
 */

import { getContainer } from "./src/infrastructure/di/DependencyContainer.js";
import {
  createAuthController,
  createPartidoController,
  createEntrenamientoController,
  createPosicionController,
  createMotivoController,
} from "./src/infrastructure/http/controllers/index.js";

// Inicializar el contenedor de dependencias
const container = getContainer();

// Crear instancias de los controllers
export const authController = createAuthController(container);
export const partidoController = createPartidoController(container);
export const entrenamientoController = createEntrenamientoController(container);
export const posicionController = createPosicionController(container);
export const motivoController = createMotivoController(container);
