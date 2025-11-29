import express from "express";
import { checkDatabaseHealth, getPoolStats } from "../config/database.js";

const router = express.Router();

/**
 * GET /health
 * Verifica el estado de salud de la aplicación y la base de datos
 */
router.get("/", async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const health = {
      status: dbHealth.status === "healthy" ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
      database: dbHealth,
      environment: process.env.NODE_ENV || "development",
    };

    const statusCode = dbHealth.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: "DOWN",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/db
 * Verifica solo el estado de la base de datos
 */
router.get("/db", async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const statusCode = dbHealth.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(dbHealth);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      message: "Error verificando estado de base de datos",
      error: error.message,
    });
  }
});

/**
 * GET /health/pool
 * Obtiene estadísticas del pool de conexiones
 */
router.get("/pool", (req, res) => {
  try {
    const stats = getPoolStats();
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      pool: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Error obteniendo estadísticas del pool",
      error: error.message,
    });
  }
});

/**
 * GET /health/ready
 * Verifica si la aplicación está lista para recibir tráfico
 */
router.get("/ready", async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();

    if (dbHealth.status === "healthy") {
      res.status(200).json({
        status: "READY",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "NOT_READY",
        timestamp: new Date().toISOString(),
        reason: "Database not available",
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "NOT_READY",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

/**
 * GET /health/live
 * Verifica si la aplicación está viva (liveness probe)
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "ALIVE",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

export default router;
