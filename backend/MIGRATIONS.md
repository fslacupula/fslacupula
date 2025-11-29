# 🗄️ Sistema de Migraciones - FutbolClub

## 📋 Descripción

Sistema de migraciones de base de datos versionadas para PostgreSQL, con soporte para rollback, tracking de estado y ejecución transaccional.

## 🚀 Comandos Rápidos

```bash
# Ejecutar todas las migraciones pendientes
npm run migrate:up

# Mostrar estado de migraciones
npm run migrate:status

# Revertir última migración
npm run migrate:down

# Resetear base de datos (⚠️ peligroso)
npm run migrate:reset

# Crear nueva migración
npm run migrate:create "nombre_descriptivo"

# Ejecutar seeds de desarrollo
npm run seed:dev

# Setup completo (migraciones + seeds)
npm run db:setup

# Reset completo (reset + migraciones + seeds)
npm run db:reset
```

## 📁 Estructura de Archivos

```
backend/database/
├── MigrationManager.js          # Gestor principal de migraciones
├── migrate.js                   # CLI para migraciones
├── seed.js                      # CLI para seeds
├── schema.sql                   # Schema legacy (referencia)
├── migrations/                  # Directorio de migraciones
│   ├── 20241130000001_create_usuarios_table.js
│   ├── 20241130000002_create_posiciones_table.js
│   ├── 20241130000003_create_jugadores_table.js
│   ├── 20241130000004_create_motivos_ausencia_table.js
│   ├── 20241130000005_create_entrenamientos_table.js
│   ├── 20241130000006_create_partidos_table.js
│   └── 20241130000007_create_asistencias_tables.js
└── seeds/                       # Directorio de seeds
    └── development.js           # Seeds para desarrollo
```

## 🔧 Uso Detallado

### Ejecutar Migraciones

**Migrar hacia adelante (aplicar cambios):**

```bash
npm run migrate:up
```

Ejecuta todas las migraciones pendientes en orden. Cada migración:

- Se ejecuta dentro de una transacción
- Si falla, hace rollback automático
- Se registra en `schema_migrations` al completarse

**Salida:**

```
📋 Migraciones pendientes: 3

🔄 Ejecutando migración: 20241130000001_create_usuarios_table
✅ Migración completada en 45ms

🔄 Ejecutando migración: 20241130000002_create_posiciones_table
✅ Migración completada en 32ms

🔄 Ejecutando migración: 20241130000003_create_jugadores_table
✅ Migración completada en 28ms

✅ Todas las migraciones ejecutadas correctamente
```

### Ver Estado

**Mostrar estado de todas las migraciones:**

```bash
npm run migrate:status
```

**Salida:**

```
📊 Estado de Migraciones:

Version          | Estado     | Nombre
----------------------------------------------------------------------
20241130000001 | ✅ Ejecutada | create_usuarios_table
20241130000002 | ✅ Ejecutada | create_posiciones_table
20241130000003 | ⏳ Pendiente | create_jugadores_table
20241130000004 | ⏳ Pendiente | create_motivos_ausencia_table

Total: 7 migraciones
Ejecutadas: 2
Pendientes: 5
```

### Revertir Migraciones

**Revertir la última migración:**

```bash
npm run migrate:down
```

Revierte solo la última migración ejecutada. Útil para:

- Corregir errores en migraciones recientes
- Desarrollo iterativo
- Testing de migraciones

**Resetear todas las migraciones (⚠️ PELIGROSO):**

```bash
npm run migrate:reset
```

Revierte TODAS las migraciones en orden inverso. Destruye todos los datos.

**Uso típico:**

```bash
# Resetear y volver a aplicar (útil en desarrollo)
npm run db:reset
```

### Crear Nueva Migración

**Generar archivo de migración:**

```bash
npm run migrate:create "add_email_verification_to_usuarios"
```

Crea archivo: `20241130120530_add_email_verification_to_usuarios.js`

**Template generado:**

```javascript
/**
 * Migración: add_email_verification_to_usuarios
 * Creada: 2024-11-30T12:05:30.000Z
 */

/**
 * Aplica la migración
 * @param {import('pg').PoolClient} client
 */
export async function up(client) {
  // Escribe aquí el código SQL para aplicar la migración
  await client.query(`
    -- Tu SQL aquí
  `);
}

/**
 * Revierte la migración
 * @param {import('pg').PoolClient} client
 */
export async function down(client) {
  // Escribe aquí el código SQL para revertir la migración
  await client.query(`
    -- Tu SQL de rollback aquí
  `);
}
```

### Seeds de Datos

**Ejecutar seeds de desarrollo:**

```bash
npm run seed:dev
```

Inserta datos de prueba:

- 1 Admin
- 1 Gestor
- 8 Jugadores con perfiles completos
- 7 Entrenamientos
- 3 Partidos
- Asistencias de muestra

**Credenciales creadas:**

```
Admin:   admin@futbolclub.com / Admin123!
Gestor:  gestor@futbolclub.com / Gestor123!
Jugador: jugador1@futbolclub.com / Jugador123!
```

## 📝 Estructura de una Migración

### Anatomía de una Migración

```javascript
/**
 * Migración: Nombre descriptivo
 * Creada: Fecha ISO
 */

/**
 * Función up: Aplica los cambios
 * @param {import('pg').PoolClient} client - Cliente PostgreSQL con transacción activa
 */
export async function up(client) {
  await client.query(`
    CREATE TABLE ejemplo (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_ejemplo_nombre ON ejemplo(nombre);

    COMMENT ON TABLE ejemplo IS 'Tabla de ejemplo';
  `);
}

/**
 * Función down: Revierte los cambios
 * @param {import('pg').PoolClient} client - Cliente PostgreSQL con transacción activa
 */
export async function down(client) {
  await client.query(`
    DROP TABLE IF EXISTS ejemplo CASCADE;
  `);
}
```

### Best Practices

#### ✅ DO (Hacer)

1. **Usar transacciones:** Ya están implementadas automáticamente
2. **Incluir índices:** Crear índices necesarios en la misma migración
3. **Agregar comentarios:** Documentar tablas y columnas importantes
4. **Idempotencia en down:** Usar `IF EXISTS` para seguridad
5. **Constraints:** Definir constraints apropiados (CHECK, UNIQUE, FK)

```javascript
export async function up(client) {
  await client.query(`
    CREATE TABLE usuarios (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      rol VARCHAR(20) CHECK (rol IN ('admin', 'gestor', 'jugador'))
    );

    CREATE INDEX idx_usuarios_email ON usuarios(email);
    COMMENT ON TABLE usuarios IS 'Usuarios del sistema';
  `);
}
```

#### ❌ DON'T (No hacer)

1. **No modificar migraciones ya ejecutadas:** Crear nueva migración
2. **No usar datos hardcodeados:** Usar seeds para datos
3. **No depender de orden de ejecución fuera del versionado**
4. **No usar `DROP TABLE` sin `IF EXISTS` en down**
5. **No hacer consultas SELECT en migraciones** (usar seeds)

### Tipos de Migraciones Comunes

#### 1. Crear Tabla

```javascript
export async function up(client) {
  await client.query(`
    CREATE TABLE tabla_nueva (
      id SERIAL PRIMARY KEY,
      campo VARCHAR(100) NOT NULL
    );
  `);
}

export async function down(client) {
  await client.query(`DROP TABLE IF EXISTS tabla_nueva CASCADE`);
}
```

#### 2. Agregar Columna

```javascript
export async function up(client) {
  await client.query(`
    ALTER TABLE usuarios 
    ADD COLUMN telefono VARCHAR(20);
  `);
}

export async function down(client) {
  await client.query(`
    ALTER TABLE usuarios 
    DROP COLUMN IF EXISTS telefono;
  `);
}
```

#### 3. Crear Índice

```javascript
export async function up(client) {
  await client.query(`
    CREATE INDEX idx_partidos_fecha ON partidos(fecha_hora);
  `);
}

export async function down(client) {
  await client.query(`
    DROP INDEX IF EXISTS idx_partidos_fecha;
  `);
}
```

#### 4. Agregar Constraint

```javascript
export async function up(client) {
  await client.query(`
    ALTER TABLE jugadores 
    ADD CONSTRAINT check_dorsal_positive 
    CHECK (numero_dorsal > 0);
  `);
}

export async function down(client) {
  await client.query(`
    ALTER TABLE jugadores 
    DROP CONSTRAINT IF EXISTS check_dorsal_positive;
  `);
}
```

#### 5. Migración de Datos

```javascript
export async function up(client) {
  // Agregar columna nueva
  await client.query(
    `ALTER TABLE usuarios ADD COLUMN nombre_completo VARCHAR(200)`
  );

  // Migrar datos existentes
  await client.query(`
    UPDATE usuarios 
    SET nombre_completo = nombre 
    WHERE nombre_completo IS NULL
  `);

  // Hacer NOT NULL después de migrar
  await client.query(
    `ALTER TABLE usuarios ALTER COLUMN nombre_completo SET NOT NULL`
  );
}

export async function down(client) {
  await client.query(
    `ALTER TABLE usuarios DROP COLUMN IF EXISTS nombre_completo`
  );
}
```

## 🔒 Tabla de Control

El sistema crea automáticamente una tabla `schema_migrations`:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time INTEGER,
  checksum VARCHAR(64)
);
```

**Campos:**

- `version`: Timestamp único de la migración (ej: 20241130000001)
- `name`: Nombre descriptivo
- `executed_at`: Cuándo se ejecutó
- `execution_time`: Tiempo de ejecución en ms
- `checksum`: Hash del contenido (futuro)

## 🏗️ Migraciones Iniciales

El sistema incluye 7 migraciones iniciales que replican el schema completo:

1. **20241130000001** - Tabla `usuarios`
2. **20241130000002** - Tabla `posiciones` + datos iniciales
3. **20241130000003** - Tabla `jugadores`
4. **20241130000004** - Tabla `motivos_ausencia` + datos iniciales
5. **20241130000005** - Tabla `entrenamientos`
6. **20241130000006** - Tabla `partidos`
7. **20241130000007** - Tablas `asistencias_partidos` y `asistencias_entrenamientos`

## 🚀 Workflows Comunes

### Setup Inicial (Primera vez)

```bash
# 1. Ejecutar migraciones
npm run migrate:up

# 2. Insertar datos de prueba
npm run seed:dev

# O todo en uno:
npm run db:setup
```

### Desarrollo Diario

```bash
# Ver estado antes de empezar
npm run migrate:status

# Si hay migraciones pendientes
npm run migrate:up

# Trabajar...

# Si necesitas revertir tu última migración
npm run migrate:down

# Fix y volver a ejecutar
npm run migrate:up
```

### Crear Nueva Feature con Cambios en DB

```bash
# 1. Crear migración
npm run migrate:create "add_stats_to_jugadores"

# 2. Editar archivo generado
#    backend/database/migrations/XXXXXXXXX_add_stats_to_jugadores.js

# 3. Ejecutar migración
npm run migrate:up

# 4. Si algo falla, revertir
npm run migrate:down

# 5. Fix y reintentar
npm run migrate:up
```

### Reset Completo (Desarrollo)

```bash
# Reset + Migraciones + Seeds
npm run db:reset

# Equivalente a:
# npm run migrate:reset
# npm run migrate:up
# npm run seed:dev
```

## 🐳 Integración con Docker/CI/CD

### Dockerfile

```dockerfile
# Copiar migraciones
COPY backend/database /app/backend/database

# Script de inicio que ejecuta migraciones
CMD ["sh", "-c", "npm run migrate:up && npm start"]
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
steps:
  - name: Run migrations
    run: npm run migrate:up
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}

  - name: Deploy application
    run: npm start
```

### Railway/Heroku

En el dashboard, agregar comando de build:

```bash
npm install && npm run migrate:up
```

## ⚠️ Consideraciones de Producción

### 1. Backups Antes de Migrar

```bash
# Backup manual
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Ejecutar migración
npm run migrate:up

# Si falla, restaurar
psql $DATABASE_URL < backup_XXXXXXXX_XXXXXX.sql
```

### 2. Migraciones de Datos Pesados

Para migraciones que modifican muchos datos:

```javascript
export async function up(client) {
  // Procesar en lotes para no bloquear
  const BATCH_SIZE = 1000;
  let offset = 0;

  while (true) {
    const result = await client.query(`
      UPDATE usuarios 
      SET nombre_completo = CONCAT(nombre, ' ', apellido)
      WHERE nombre_completo IS NULL
      LIMIT ${BATCH_SIZE}
    `);

    if (result.rowCount === 0) break;
    offset += BATCH_SIZE;

    console.log(`Procesados ${offset} registros...`);
  }
}
```

### 3. Migraciones sin Downtime

Para cambios que requieren zero-downtime:

**Fase 1:** Agregar columna nullable

```javascript
export async function up(client) {
  await client.query(
    `ALTER TABLE usuarios ADD COLUMN email_nuevo VARCHAR(255)`
  );
}
```

**Fase 2:** Migrar datos (después del deploy)

```javascript
export async function up(client) {
  await client.query(
    `UPDATE usuarios SET email_nuevo = email WHERE email_nuevo IS NULL`
  );
}
```

**Fase 3:** Hacer NOT NULL y renombrar

```javascript
export async function up(client) {
  await client.query(
    `ALTER TABLE usuarios ALTER COLUMN email_nuevo SET NOT NULL`
  );
  await client.query(`ALTER TABLE usuarios RENAME COLUMN email TO email_old`);
  await client.query(`ALTER TABLE usuarios RENAME COLUMN email_nuevo TO email`);
}
```

## 📊 Troubleshooting

### Problema: Migración falla a medias

**Síntoma:** Error durante ejecución, tabla parcialmente creada

**Solución:**

```bash
# Las transacciones deben haber hecho rollback automático
# Verificar estado
npm run migrate:status

# Si aparece como ejecutada pero falló, eliminar registro manualmente
psql $DATABASE_URL
DELETE FROM schema_migrations WHERE version = 'XXXXXXXXX';
```

### Problema: Migraciones fuera de orden

**Síntoma:** Nueva migración ejecutada antes que pendiente antigua

**Solución:**

- El sistema ejecuta en orden alfabético de versión
- Renombrar archivo si es necesario
- Usar timestamps correctos al crear

### Problema: No puede revertir migración

**Síntoma:** `down()` falla

**Solución:**

```bash
# Verificar dependencias
# Revisar que down() sea exactamente inverso de up()
# Eliminar registro manualmente si es necesario
psql $DATABASE_URL
DELETE FROM schema_migrations WHERE version = 'XXXXXXXXX';
```

## 🎯 Próximas Mejoras

- [ ] Checksums para detectar cambios en migraciones
- [ ] Dry-run mode (mostrar SQL sin ejecutar)
- [ ] Parallel migrations para independientes
- [ ] Rollback points (snapshots)
- [ ] Migrations con TypeScript
- [ ] Integración con ORMs (TypeORM, Prisma)

---

**Sistema diseñado para ser simple, seguro y profesional** 🚀
