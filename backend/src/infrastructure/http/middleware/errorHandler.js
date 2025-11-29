/**
 * Middleware centralizado de manejo de errores
 * Convierte los errores del dominio en respuestas HTTP apropiadas
 */

import { ValidationError } from "../../../domain/errors/ValidationError.js";
import { DomainError } from "../../../domain/errors/DomainError.js";

/**
 * Mapea errores del dominio a códigos HTTP
 */
const errorStatusMap = {
  [ValidationError.name]: 400,
  [DomainError.name]: 400,
};

/**
 * Middleware de manejo de errores
 * Debe ser el último middleware en la cadena
 */
export function errorHandler(err, req, res, next) {
  // Log del error (en producción usar un logger apropiado)
  console.error("Error capturado:", {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Obtener status code según el tipo de error
  const statusCode = errorStatusMap[err.constructor.name] || 500;

  // Respuesta de error
  const response = {
    error: err.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && {
      type: err.constructor.name,
      stack: err.stack,
    }),
  };

  res.status(statusCode).json(response);
}

/**
 * Middleware para rutas no encontradas
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.path,
    method: req.method,
  });
}
