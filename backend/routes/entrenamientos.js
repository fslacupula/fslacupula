import express from "express";
import { entrenamientoController } from "../controllers-instance.js";
import { authenticateToken, esGestor } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

// Rutas de entrenamientos
router.post("/", esGestor, entrenamientoController.crearEntrenamiento);
router.get("/", entrenamientoController.listarEntrenamientos);
router.get("/:id", entrenamientoController.obtenerEntrenamiento);
router.put("/:id", esGestor, entrenamientoController.actualizarEntrenamiento);
router.delete("/:id", esGestor, entrenamientoController.eliminarEntrenamiento);

// Registro de asistencia
router.post("/:id/asistencia", entrenamientoController.registrarAsistencia);
router.put(
  "/:id/asistencia/:jugadorId",
  entrenamientoController.actualizarAsistencia
);

export default router;
