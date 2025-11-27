import express from "express";
import { listarPosiciones } from "../controllers/posicionController.js";

const router = express.Router();

router.get("/", listarPosiciones);

export default router;
