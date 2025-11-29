import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// PostgreSQL devolverá TIMESTAMPTZ como objetos Date en JavaScript
// que se convertirán automáticamente a la zona horaria local del cliente

// Configuración optimizada para Railway (usa DATABASE_URL) o desarrollo local
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      // Configuración de pool optimizada para producción
      max: parseInt(process.env.DB_POOL_MAX) || 20, // Máximo de conexiones
      min: parseInt(process.env.DB_POOL_MIN) || 2, // Mínimo de conexiones activas
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000, // 30s timeout para conexiones inactivas
      connectionTimeoutMillis:
        parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000, // 10s timeout para nuevas conexiones
      allowExitOnIdle: false, // Mantener el proceso activo aunque las conexiones estén inactivas
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "futbolclub_db",
      // Configuración de pool para desarrollo
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 1,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 10000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT) || 5000,
      allowExitOnIdle: false,
    };

const pool = new Pool(poolConfig);

// Contador de intentos de reconexión
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS =
  parseInt(process.env.DB_MAX_RECONNECT_ATTEMPTS) || 5;
const RECONNECT_INTERVAL = parseInt(process.env.DB_RECONNECT_INTERVAL) || 5000; // 5 segundos

// Configurar zona horaria al conectar
pool.on("connect", async (client) => {
  try {
    await client.query("SET timezone = 'Europe/Madrid'");
    console.log("✅ Conectado a PostgreSQL (Europe/Madrid)");
    reconnectAttempts = 0; // Resetear contador en conexión exitosa
  } catch (err) {
    console.error("❌ Error configurando timezone:", err);
  }
});

// Manejo mejorado de errores con reintentos
pool.on("error", async (err, client) => {
  console.error("❌ Error en el pool de PostgreSQL:", err.message);

  // Errores que requieren reintentar la conexión
  const shouldReconnect = [
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "connection terminated unexpectedly",
  ].some(
    (errorType) => err.message.includes(errorType) || err.code === errorType
  );

  if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    console.log(
      `🔄 Intentando reconectar (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
    );

    setTimeout(async () => {
      try {
        await pool.query("SELECT 1"); // Test de conexión
        console.log("✅ Reconexión exitosa");
        reconnectAttempts = 0;
      } catch (error) {
        console.error("❌ Fallo en reconexión:", error.message);
      }
    }, RECONNECT_INTERVAL);
  } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error(
      "❌ Máximo de intentos de reconexión alcanzado. Revisa la conexión a la base de datos."
    );
  }
});

// Event cuando se adquiere un cliente del pool
pool.on("acquire", (client) => {
  const activeConnections = pool.totalCount;
  const idleConnections = pool.idleCount;
  const waitingRequests = pool.waitingCount;

  if (process.env.NODE_ENV === "development") {
    console.log(
      `📊 Pool stats - Activas: ${activeConnections}, Inactivas: ${idleConnections}, Esperando: ${waitingRequests}`
    );
  }
});

// Event cuando se libera un cliente
pool.on("remove", (client) => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔌 Cliente removido del pool");
  }
});

/**
 * Verifica el estado de salud de la conexión a la base de datos
 * @returns {Promise<Object>} Estado de la conexión
 */
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    const result = await pool.query(
      "SELECT NOW() as current_time, version() as version"
    );
    const responseTime = Date.now() - start;

    return {
      status: "healthy",
      message: "Conexión a base de datos OK",
      responseTime: `${responseTime}ms`,
      timestamp: result.rows[0].current_time,
      version:
        result.rows[0].version.split(" ")[0] +
        " " +
        result.rows[0].version.split(" ")[1],
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "Error conectando a base de datos",
      error: error.message,
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      },
    };
  }
}

/**
 * Cierra gracefully todas las conexiones del pool
 * @returns {Promise<void>}
 */
export async function closePool() {
  try {
    await pool.end();
    console.log("✅ Pool de conexiones cerrado correctamente");
  } catch (error) {
    console.error("❌ Error cerrando pool de conexiones:", error);
    throw error;
  }
}

/**
 * Obtiene estadísticas del pool de conexiones
 * @returns {Object} Estadísticas del pool
 */
export function getPoolStats() {
  return {
    totalConnections: pool.totalCount,
    idleConnections: pool.idleCount,
    waitingRequests: pool.waitingCount,
    maxConnections: poolConfig.max || (process.env.DATABASE_URL ? 20 : 10),
    minConnections: poolConfig.min || (process.env.DATABASE_URL ? 2 : 1),
  };
}

export { pool };
export default pool;
