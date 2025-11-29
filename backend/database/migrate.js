#!/usr/bin/env node

/**
 * CLI para gestionar migraciones de base de datos
 *
 * Uso:
 *   npm run migrate up              - Ejecuta todas las migraciones pendientes
 *   npm run migrate down            - Revierte la última migración
 *   npm run migrate status          - Muestra el estado de las migraciones
 *   npm run migrate reset           - Revierte todas las migraciones
 *   npm run migrate create <nombre> - Crea un nuevo archivo de migración
 */

import { MigrationManager } from "./MigrationManager.js";
import { closePool } from "../config/database.js";

const manager = new MigrationManager();

// Obtener el comando de los argumentos
const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  try {
    switch (command) {
      case "up":
        await manager.up();
        break;

      case "down":
        await manager.down();
        break;

      case "status":
        await manager.status();
        break;

      case "reset":
        console.log("⚠️  ¿Estás seguro? Esto revertirá TODAS las migraciones.");
        console.log(
          "⚠️  Presiona Ctrl+C para cancelar o Enter para continuar..."
        );

        // Esperar confirmación
        await new Promise((resolve) => {
          process.stdin.once("data", resolve);
        });

        await manager.reset();
        break;

      case "create":
        if (args.length === 0) {
          console.error(
            "❌ Error: Debes proporcionar un nombre para la migración"
          );
          console.log("Uso: npm run migrate create <nombre>");
          process.exit(1);
        }
        manager.createMigration(args.join(" "));
        break;

      default:
        console.log(`
🗄️  Gestor de Migraciones - FutbolClub

Comandos disponibles:

  up              Ejecuta todas las migraciones pendientes
  down            Revierte la última migración ejecutada
  status          Muestra el estado de todas las migraciones
  reset           Revierte todas las migraciones (⚠️ peligroso)
  create <nombre> Crea un nuevo archivo de migración

Ejemplos:

  npm run migrate up
  npm run migrate down
  npm run migrate status
  npm run migrate create "add_campo_a_usuarios"

Notas:

  - Las migraciones se ejecutan en orden cronológico
  - Cada migración se ejecuta dentro de una transacción
  - Si una migración falla, se hace rollback automático
  - El estado se guarda en la tabla 'schema_migrations'
        `);
    }

    await closePool();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
    await closePool();
    process.exit(1);
  }
}

main();
