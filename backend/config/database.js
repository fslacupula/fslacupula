import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pg;

// Evitar conversión automática de fechas a objetos Date
// Esto mantiene las fechas como strings 'YYYY-MM-DD'
types.setTypeParser(1082, (val) => val); // DATE type

// Configuración para Railway (usa DATABASE_URL) o desarrollo local
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pool = new Pool(poolConfig);

// Configurar zona horaria al conectar
pool.on("connect", async (client) => {
  try {
    await client.query("SET timezone = 'Europe/Madrid'");
    console.log("✅ Conectado a PostgreSQL (Europe/Madrid)");
  } catch (err) {
    console.error("❌ Error configurando timezone:", err);
  }
});

pool.on("error", (err) => {
  console.error("❌ Error en la conexión a PostgreSQL:", err);
});

export default pool;
