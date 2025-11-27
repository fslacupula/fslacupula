import express from "express";
import { listarMotivos } from "../controllers/motivoController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, listarMotivos);

export default router;
