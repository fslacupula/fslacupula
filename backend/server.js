import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import entrenamientoRoutes from "./routes/entrenamientos.js";
import partidoRoutes from "./routes/partidos.js";
import motivoRoutes from "./routes/motivos.js";
import posicionRoutes from "./routes/posiciones.js";
import {
  errorHandler,
  notFoundHandler,
} from "./src/infrastructure/http/middleware/errorHandler.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/entrenamientos", entrenamientoRoutes);
app.use("/api/partidos", partidoRoutes);
app.use("/api/motivos", motivoRoutes);
app.use("/api/posiciones", posicionRoutes);

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  // Health check para desarrollo
  app.get("/", (req, res) => {
    res.json({ message: "API Fútbol Club funcionando ✅⚽" });
  });
}

// Manejadores de errores (deben ir AL FINAL, después de todas las rutas)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
