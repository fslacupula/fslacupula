#!/usr/bin/env node

/**
 * CLI para ejecutar seeds de datos
 *
 * Uso:
 *   npm run seed              - Ejecuta seeds de desarrollo
 *   npm run seed production   - Ejecuta seeds de producción
 */

import pool, { closePool } from "../config/database.js";
import { seed as developmentSeed } from "./seeds/development.js";
import { seed as productionDataSeed } from "./seeds/production-data.js";

const environment = process.argv[2] || "production";

async function main() {
  console.log(`\n🌱 Ejecutando seeds para: ${environment}\n`);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (environment === "development") {
      await developmentSeed(client);
    } else if (environment === "production") {
      await productionDataSeed(client);
    } else {
      throw new Error(`Environment no reconocido: ${environment}`);
    }

    await client.query("COMMIT");
    console.log("\n✅ Seeds ejecutados correctamente");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\n❌ Error ejecutando seeds:", error.message);
    throw error;
  } finally {
    client.release();
    await closePool();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
