import { Posicion } from "../models/index.js";

export const listarPosiciones = async (req, res) => {
  try {
    const posiciones = await Posicion.listar();
    res.json({ posiciones });
  } catch (error) {
    console.error("Error al listar posiciones:", error);
    res.status(500).json({ error: "Error al obtener posiciones" });
  }
};
