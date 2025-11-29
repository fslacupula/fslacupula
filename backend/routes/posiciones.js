import express from "express";
import { posicionController } from "../controllers-instance.js";

const router = express.Router();

router.get("/", posicionController.listarPosiciones);

export default router;
