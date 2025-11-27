import express from "express";
import {
  crearPartido,
  listarPartidos,
  obtenerPartido,
  actualizarPartido,
  eliminarPartido,
  registrarAsistenciaPartido,
  actualizarAsistenciaGestor,
  misPartidos,
} from "../controllers/partidoController.js";
import { authenticateToken, esGestor } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

// Rutas de partidos
router.post("/", esGestor, crearPartido);
router.get("/", listarPartidos);
router.get("/mis-partidos", misPartidos);
router.get("/:id", obtenerPartido);
router.put("/:id", esGestor, actualizarPartido);
router.delete("/:id", esGestor, eliminarPartido);

// Registro de asistencia
router.post("/:id/asistencia", registrarAsistenciaPartido);

// Gestor actualiza asistencia de cualquier jugador
router.put("/:id/asistencia/:jugadorId", esGestor, actualizarAsistenciaGestor);

export default router;
