import express from "express";
import {
  crearEntrenamiento,
  listarEntrenamientos,
  obtenerEntrenamiento,
  actualizarEntrenamiento,
  eliminarEntrenamiento,
  registrarAsistenciaEntrenamiento,
  actualizarAsistenciaGestor,
  misEntrenamientos,
} from "../controllers/entrenamientoController.js";
import { authenticateToken, esGestor } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

// Rutas de entrenamientos
router.post("/", esGestor, crearEntrenamiento);
router.get("/", listarEntrenamientos);
router.get("/mis-entrenamientos", misEntrenamientos);
router.get("/:id", obtenerEntrenamiento);
router.put("/:id", esGestor, actualizarEntrenamiento);
router.delete("/:id", esGestor, eliminarEntrenamiento);

// Registro de asistencia
router.post("/:id/asistencia", registrarAsistenciaEntrenamiento);

// Gestor actualiza asistencia de cualquier jugador
router.put("/:id/asistencia/:jugadorId", esGestor, actualizarAsistenciaGestor);

export default router;
