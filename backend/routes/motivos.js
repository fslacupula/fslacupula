import express from "express";
import { motivoController } from "../controllers-instance.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, motivoController.listarMotivos);

export default router;
