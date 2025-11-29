import express from "express";
import { partidoController } from "../controllers-instance.js";
import { authenticateToken, esGestor } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

// Rutas de partidos
router.post("/", esGestor, partidoController.crearPartido);
router.get("/", partidoController.listarPartidos);
router.get("/proximos", partidoController.obtenerProximos);
router.get("/:id", partidoController.obtenerPartido);
router.put("/:id", esGestor, partidoController.actualizarPartido);
router.delete("/:id", esGestor, partidoController.eliminarPartido);
router.put("/:id/resultado", esGestor, partidoController.registrarResultado);

// Registro de asistencia
router.post("/:id/asistencia", partidoController.registrarAsistencia);
router.put(
  "/:id/asistencia/:jugadorId",
  partidoController.actualizarAsistencia
);

// Finalizar partido con estadísticas
router.post("/:id/finalizar", esGestor, partidoController.finalizarPartido);

export default router;
