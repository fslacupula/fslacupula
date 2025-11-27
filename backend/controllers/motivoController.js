import { MotivoAusencia } from "../models/index.js";

export const listarMotivos = async (req, res) => {
  try {
    const motivos = await MotivoAusencia.listar();
    res.json({ motivos });
  } catch (error) {
    console.error("Error al listar motivos:", error);
    res.status(500).json({ error: "Error al listar motivos de ausencia" });
  }
};
