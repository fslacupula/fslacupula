import express from "express";
import { authController } from "../controllers-instance.js";
import { authenticateToken, esGestor } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authenticateToken, authController.getProfile);
router.post(
  "/registrar-jugador",
  authenticateToken,
  esGestor,
  authController.registrarJugadorPorGestor
);
router.get(
  "/jugadores",
  authenticateToken,
  esGestor,
  authController.listarJugadores
);
router.patch(
  "/jugadores/:id/estado",
  authenticateToken,
  esGestor,
  authController.cambiarEstadoJugador
);

export default router;
