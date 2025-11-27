import express from "express";
import {
  register,
  login,
  getProfile,
  registrarJugadorPorGestor,
  listarJugadores,
  cambiarEstadoJugador,
} from "../controllers/authController.js";
import { authenticateToken, esGestor } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);
router.post(
  "/registrar-jugador",
  authenticateToken,
  esGestor,
  registrarJugadorPorGestor
);
router.get("/jugadores", authenticateToken, esGestor, listarJugadores);
router.patch(
  "/jugadores/:id/estado",
  authenticateToken,
  esGestor,
  cambiarEstadoJugador
);

export default router;
