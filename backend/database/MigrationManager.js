import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @class MigrationManager
 * @description Gestor de migraciones de base de datos con versionado
 */
export class MigrationManager {
  constructor(migrationsDir = null) {
    this.migrationsDir = migrationsDir || path.join(__dirname, "migrations");
    this.pool = pool;
  }

  /**
   * Inicializa la tabla de control de migraciones
   */
  async init() {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time INTEGER,
        checksum VARCHAR(64)
      );

      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version 
      ON schema_migrations(version);
    `;

    try {
      await this.pool.query(query);
      console.log("✅ Tabla schema_migrations inicializada");
    } catch (error) {
      console.error("❌ Error inicializando schema_migrations:", error.message);
      throw error;
    }
  }

  /**
   * Obtiene todas las migraciones disponibles
   */
  getMigrationFiles() {
    if (!fs.existsSync(this.migrationsDir)) {
      fs.mkdirSync(this.migrationsDir, { recursive: true });
      return [];
    }

    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((file) => file.endsWith(".js"))
      .sort();

    return files.map((file) => {
      const version = file.split("_")[0];
      const name = file.replace(".js", "").substring(version.length + 1);
      return { version, name, filename: file };
    });
  }

  /**
   * Obtiene las migraciones ya ejecutadas
   */
  async getExecutedMigrations() {
    try {
      const result = await this.pool.query(
        "SELECT version, name, executed_at FROM schema_migrations ORDER BY version"
      );
      return result.rows;
    } catch (error) {
      // Si la tabla no existe aún, retornar array vacío
      if (error.code === "42P01") {
        return [];
      }
      throw error;
    }
  }

  /**
   * Obtiene las migraciones pendientes de ejecutar
   */
  async getPendingMigrations() {
    const allMigrations = this.getMigrationFiles();
    const executedMigrations = await this.getExecutedMigrations();
    const executedVersions = new Set(executedMigrations.map((m) => m.version));

    return allMigrations.filter((m) => !executedVersions.has(m.version));
  }

  /**
   * Ejecuta una migración específica
   */
  async executeMigration(migration) {
    const migrationPath = path.join(this.migrationsDir, migration.filename);

    console.log(
      `\n🔄 Ejecutando migración: ${migration.version}_${migration.name}`
    );

    const startTime = Date.now();
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Importar y ejecutar la migración
      const migrationModule = await import(`file://${migrationPath}`);

      if (!migrationModule.up || typeof migrationModule.up !== "function") {
        throw new Error(
          `La migración ${migration.filename} no tiene función up()`
        );
      }

      await migrationModule.up(client);

      // Registrar migración ejecutada
      const executionTime = Date.now() - startTime;
      await client.query(
        `INSERT INTO schema_migrations (version, name, execution_time) 
         VALUES ($1, $2, $3)`,
        [migration.version, migration.name, executionTime]
      );

      await client.query("COMMIT");

      console.log(`✅ Migración completada en ${executionTime}ms`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(
        `❌ Error ejecutando migración ${migration.filename}:`,
        error.message
      );
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Ejecuta todas las migraciones pendientes
   */
  async up() {
    await this.init();

    const pending = await this.getPendingMigrations();

    if (pending.length === 0) {
      console.log("✅ No hay migraciones pendientes");
      return;
    }

    console.log(`\n📋 Migraciones pendientes: ${pending.length}`);

    for (const migration of pending) {
      await this.executeMigration(migration);
    }

    console.log("\n✅ Todas las migraciones ejecutadas correctamente");
  }

  /**
   * Revierte la última migración ejecutada
   */
  async down() {
    const executed = await this.getExecutedMigrations();

    if (executed.length === 0) {
      console.log("⚠️ No hay migraciones para revertir");
      return;
    }

    const lastMigration = executed[executed.length - 1];
    const migrationFile = this.getMigrationFiles().find(
      (m) => m.version === lastMigration.version
    );

    if (!migrationFile) {
      throw new Error(
        `No se encontró el archivo de migración para ${lastMigration.version}`
      );
    }

    const migrationPath = path.join(this.migrationsDir, migrationFile.filename);

    console.log(
      `\n🔄 Revirtiendo migración: ${lastMigration.version}_${lastMigration.name}`
    );

    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Importar y ejecutar down
      const migrationModule = await import(`file://${migrationPath}`);

      if (!migrationModule.down || typeof migrationModule.down !== "function") {
        throw new Error(
          `La migración ${migrationFile.filename} no tiene función down()`
        );
      }

      await migrationModule.down(client);

      // Eliminar registro de migración
      await client.query("DELETE FROM schema_migrations WHERE version = $1", [
        lastMigration.version,
      ]);

      await client.query("COMMIT");

      console.log("✅ Migración revertida correctamente");
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error revirtiendo migración:", error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Muestra el estado de las migraciones
   */
  async status() {
    await this.init();

    const allMigrations = this.getMigrationFiles();
    const executed = await this.getExecutedMigrations();
    const executedVersions = new Set(executed.map((m) => m.version));

    console.log("\n📊 Estado de Migraciones:\n");
    console.log("Version          | Estado     | Nombre");
    console.log("-".repeat(70));

    for (const migration of allMigrations) {
      const isExecuted = executedVersions.has(migration.version);
      const status = isExecuted ? "✅ Ejecutada" : "⏳ Pendiente";
      console.log(`${migration.version} | ${status} | ${migration.name}`);
    }

    console.log("\n");
    console.log(`Total: ${allMigrations.length} migraciones`);
    console.log(`Ejecutadas: ${executed.length}`);
    console.log(`Pendientes: ${allMigrations.length - executed.length}`);
  }

  /**
   * Revierte todas las migraciones
   */
  async reset() {
    console.log("⚠️ ADVERTENCIA: Esto revertirá TODAS las migraciones");

    const executed = await this.getExecutedMigrations();

    for (let i = executed.length - 1; i >= 0; i--) {
      await this.down();
    }

    console.log("✅ Todas las migraciones revertidas");
  }

  /**
   * Crea un nuevo archivo de migración
   */
  createMigration(name) {
    if (!name) {
      throw new Error("El nombre de la migración es requerido");
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\..+/, "")
      .replace("T", "");

    const filename = `${timestamp}_${name
      .toLowerCase()
      .replace(/\s+/g, "_")}.js`;
    const filepath = path.join(this.migrationsDir, filename);

    const template = `/**
 * Migración: ${name}
 * Creada: ${new Date().toISOString()}
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  // Escribe aquí el código SQL para aplicar la migración
  await client.query(\`
    -- Tu SQL aquí
  \`);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  // Escribe aquí el código SQL para revertir la migración
  await client.query(\`
    -- Tu SQL de rollback aquí
  \`);
}
`;

    fs.mkdirSync(this.migrationsDir, { recursive: true });
    fs.writeFileSync(filepath, template);

    console.log(`✅ Migración creada: ${filename}`);
    return filepath;
  }
}

export default MigrationManager;
