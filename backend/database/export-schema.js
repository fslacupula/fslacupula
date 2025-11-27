import pkg from "pg";
const { Client } = pkg;

const client = new Client({
  host: "localhost",
  port: 5433,
  database: "futbolclub",
  user: "postgres",
  password: "futbol123",
});

async function exportSchema() {
  try {
    await client.connect();
    console.log("Conectado a la base de datos local\n");

    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log("=== TABLAS ENCONTRADAS ===");
    tablesResult.rows.forEach((row) => console.log(`- ${row.table_name}`));
    console.log("\n=== GENERANDO SCHEMA COMPLETO ===\n");

    let fullSchema = "-- Schema completo de FutbolClub\n";
    fullSchema += "-- Generado: " + new Date().toISOString() + "\n\n";
    fullSchema += "-- Eliminar tablas si existen\n";

    for (const table of tablesResult.rows) {
      fullSchema += `DROP TABLE IF EXISTS ${table.table_name} CASCADE;\n`;
    }

    fullSchema += "\n-- Crear tablas\n\n";

    // Para cada tabla, obtener su definición completa
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;

      // Obtener columnas
      const columnsResult = await client.query(
        `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `,
        [tableName]
      );

      fullSchema += `CREATE TABLE ${tableName} (\n`;

      const columnDefs = columnsResult.rows.map((col) => {
        let def = `  ${col.column_name} `;

        // Tipo de dato
        if (col.data_type === "character varying") {
          def += `VARCHAR(${col.character_maximum_length})`;
        } else if (col.data_type === "timestamp without time zone") {
          def += "TIMESTAMP";
        } else {
          def += col.data_type.toUpperCase();
        }

        // NOT NULL
        if (col.is_nullable === "NO") {
          def += " NOT NULL";
        }

        // DEFAULT
        if (col.column_default) {
          def += ` DEFAULT ${col.column_default}`;
        }

        return def;
      });

      fullSchema += columnDefs.join(",\n");

      // Obtener PRIMARY KEY
      const pkResult = await client.query(
        `
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
      `,
        [tableName]
      );

      if (pkResult.rows.length > 0) {
        const pkColumns = pkResult.rows.map((r) => r.attname).join(", ");
        fullSchema += `,\n  PRIMARY KEY (${pkColumns})`;
      }

      fullSchema += "\n);\n\n";

      // Obtener FOREIGN KEYS
      const fkResult = await client.query(
        `
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1
      `,
        [tableName]
      );

      for (const fk of fkResult.rows) {
        fullSchema += `ALTER TABLE ${tableName}\n`;
        fullSchema += `  ADD CONSTRAINT ${fk.constraint_name}\n`;
        fullSchema += `  FOREIGN KEY (${fk.column_name})\n`;
        fullSchema += `  REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name})\n`;
        fullSchema += `  ON DELETE CASCADE;\n\n`;
      }

      // Obtener UNIQUE constraints
      const uniqueResult = await client.query(
        `
        SELECT
          tc.constraint_name,
          kcu.column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'UNIQUE' AND tc.table_name = $1
          AND tc.constraint_name NOT LIKE '%pkey'
      `,
        [tableName]
      );

      for (const unique of uniqueResult.rows) {
        fullSchema += `ALTER TABLE ${tableName}\n`;
        fullSchema += `  ADD CONSTRAINT ${unique.constraint_name}\n`;
        fullSchema += `  UNIQUE (${unique.column_name});\n\n`;
      }
    }

    // Guardar el schema
    const fs = await import("fs");
    fs.writeFileSync("database/schema-complete.sql", fullSchema);
    console.log(
      "✓ Schema completo guardado en: database/schema-complete.sql\n"
    );

    // Ahora exportar los datos
    console.log("=== EXPORTANDO DATOS ===\n");
    let dataScript = "-- Datos de FutbolClub\n";
    dataScript += "-- Generado: " + new Date().toISOString() + "\n\n";

    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      const dataResult = await client.query(`SELECT * FROM ${tableName}`);

      if (dataResult.rows.length > 0) {
        dataScript += `-- Datos de ${tableName}\n`;

        for (const row of dataResult.rows) {
          const columns = Object.keys(row);
          const values = columns.map((col) => {
            const val = row[col];
            if (val === null) return "NULL";
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
            return val;
          });

          dataScript += `INSERT INTO ${tableName} (${columns.join(
            ", "
          )}) VALUES (${values.join(", ")});\n`;
        }

        dataScript += "\n";
      }
    }

    fs.writeFileSync("database/data-export.sql", dataScript);
    console.log("✓ Datos guardados en: database/data-export.sql\n");

    await client.end();
    console.log("✓ Proceso completado exitosamente");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

exportSchema();
