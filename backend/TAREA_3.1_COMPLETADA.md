# ✅ Tarea 3.1: Repositorios PostgreSQL - COMPLETADA

**Fecha:** 2024
**Duración estimada:** 6h | **Duración real:** ~3h
**Fase:** FASE 3 - Capa de Infraestructura

## 📋 Descripción

Implementación de los repositorios PostgreSQL que concretan las interfaces del dominio. Cada repositorio gestiona la persistencia de una entidad específica utilizando el pool de conexiones existente.

## ✨ Implementaciones Realizadas

### 1. UsuarioRepositoryPg (289 líneas)

**Archivo:** `src/infrastructure/repositories/UsuarioRepositoryPg.js`

**Características:**

- ✅ Constructor con validación de pool
- ✅ Método privado `_mapToEntity(row)` para mapeo DB → Entidad
- ✅ 11 métodos implementados según interfaz IUsuarioRepository
- ✅ Soporte para soft delete (activo = false) y hard delete
- ✅ Filtros dinámicos: rol, activo
- ✅ Consultas parametrizadas ($1, $2, ...) para prevención SQL injection
- ✅ Paginación estándar con {data, total, page, totalPages}

**Métodos implementados:**

1. `findById(id)` - Buscar por ID
2. `findByEmail(email)` - Buscar por email (soporta Email VO y string)
3. `findAll(filters)` - Listar con filtros opcionales
4. `findPaginated(page, limit, filters)` - Lista paginada
5. `create(usuario)` - Crear nuevo usuario
6. `update(id, usuario)` - Actualizar usuario
7. `delete(id)` - Soft delete (activo = false)
8. `hardDelete(id)` - Eliminación física
9. `existsByEmail(email, excludeId)` - Verificar existencia email
10. `count(filters)` - Contar con filtros
11. `findByRol(rol)` - Buscar por rol
12. `findActive()` - Listar usuarios activos

**Mapeo DB → Entidad:**

- `id` → `id`
- `email` → `email`
- `password` → `password`
- `nombre` → `nombre`
- `rol` → `rol`
- `activo` → `activo`
- `created_at` → `createdAt`

### 2. JugadorRepositoryPg (310 líneas)

**Archivo:** `src/infrastructure/repositories/JugadorRepositoryPg.js`

**Características:**

- ✅ Gestión de campos opcionales (telefono, fechaNacimiento, fotoUrl, alias, posicionId)
- ✅ Orden especial: `numero_dorsal ASC NULLS LAST` para jugadores sin dorsal
- ✅ Verificación de unicidad para usuarioId y numeroDorsal
- ✅ 12 métodos implementados según IJugadorRepository
- ✅ Hard delete (no soft delete para jugadores)

**Métodos implementados:**

1. `findById(id)` - Buscar por ID
2. `findByUsuarioId(usuarioId)` - Buscar por usuario asociado
3. `findAll(filters)` - Listar con filtros (posicion, numeroDorsal, posicionId)
4. `findPaginated(page, limit, filters)` - Lista paginada
5. `findByNumeroDorsal(numeroDorsal)` - Buscar por dorsal
6. `findByPosicion(posicion)` - Buscar por posición
7. `create(jugador)` - Crear jugador
8. `update(id, jugador)` - Actualizar jugador
9. `delete(id)` - Eliminación física
10. `existsByUsuarioId(usuarioId, excludeId)` - Verificar usuario asignado
11. `existsByNumeroDorsal(numeroDorsal, excludeId)` - Verificar dorsal único
12. `count(filters)` - Contar con filtros

**Mapeo DB → Entidad:**

- `id` → `id`
- `usuario_id` → `usuarioId`
- `numero_dorsal` → `numeroDorsal`
- `posicion` → `posicion`
- `telefono` → `telefono`
- `fecha_nacimiento` → `fechaNacimiento`
- `foto_url` → `fotoUrl`
- `alias` → `alias`
- `posicion_id` → `posicionId`
- `created_at` → `createdAt`

### 3. PartidoRepositoryPg (271 líneas)

**Archivo:** `src/infrastructure/repositories/PartidoRepositoryPg.js`

**Características:**

- ✅ Consultas temporales: findUpcoming(), getNext()
- ✅ Filtro por rango de fechas en paginación
- ✅ Búsqueda ILIKE para rival (case-insensitive, parcial)
- ✅ Gestión de campos TIMESTAMPTZ con timezone Europe/Madrid
- ✅ 10 métodos implementados según IPartidoRepository

**Métodos implementados:**

1. `findById(id)` - Buscar por ID
2. `findAll(filters)` - Listar con filtros (tipo, esLocal, rival)
3. `findPaginated(page, limit, filters)` - Lista paginada con fechas
4. `create(partido)` - Crear partido
5. `update(id, partido)` - Actualizar partido
6. `delete(id)` - Eliminación física
7. `findUpcoming(limit)` - Partidos futuros (fecha_hora > NOW())
8. `getNext()` - Próximo partido (LIMIT 1)
9. `findByDateRange(fechaInicio, fechaFin)` - Por rango fechas
10. `count(filters)` - Contar con filtros

**Consultas temporales especiales:**

```sql
-- Próximos partidos
WHERE fecha_hora > NOW() ORDER BY fecha_hora ASC

-- Búsqueda por rival (case-insensitive)
WHERE rival ILIKE '%term%'
```

**Mapeo DB → Entidad:**

- `id` → `id`
- `fecha_hora` → `fechaHora`
- `rival` → `rival`
- `lugar` → `lugar`
- `tipo` → `tipo`
- `es_local` → `esLocal`
- `resultado` → `resultado`
- `observaciones` → `observaciones`
- `creado_por` → `creadoPor`
- `created_at` → `createdAt`

### 4. EntrenamientoRepositoryPg (293 líneas)

**Archivo:** `src/infrastructure/repositories/EntrenamientoRepositoryPg.js`

**Características:**

- ✅ Consultas temporales avanzadas: findToday(), findThisWeek()
- ✅ Filtros por lugar, duracionMinutos
- ✅ Gestión TIMESTAMPTZ con timezone
- ✅ 12 métodos implementados según IEntrenamientoRepository

**Métodos implementados:**

1. `findById(id)` - Buscar por ID
2. `findAll(filters)` - Listar con filtros (lugar, fechaDesde, fechaHasta)
3. `findPaginated(page, limit, filters)` - Lista paginada
4. `create(entrenamiento)` - Crear entrenamiento
5. `update(id, entrenamiento)` - Actualizar entrenamiento
6. `delete(id)` - Eliminación física
7. `findUpcoming(limit)` - Entrenamientos futuros
8. `getNext()` - Próximo entrenamiento
9. `findToday()` - Entrenamientos de hoy
10. `findThisWeek()` - Entrenamientos de esta semana
11. `findByDateRange(fechaInicio, fechaFin)` - Por rango fechas
12. `findByLugar(lugar)` - Por lugar (ILIKE)
13. `count(filters)` - Contar con filtros

**Consultas temporales especiales:**

```sql
-- Entrenamientos de hoy (con timezone)
WHERE DATE(fecha_hora AT TIME ZONE 'Europe/Madrid') = CURRENT_DATE

-- Entrenamientos de esta semana
WHERE fecha_hora >= DATE_TRUNC('week', CURRENT_DATE)
  AND fecha_hora < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
```

**Mapeo DB → Entidad:**

- `id` → `id`
- `fecha_hora` → `fechaHora`
- `lugar` → `lugar`
- `descripcion` → `descripcion`
- `duracion_minutos` → `duracionMinutos`
- `creado_por` → `creadoPor`
- `created_at` → `createdAt`

### 5. AsistenciaRepositoryPg (380 líneas)

**Archivo:** `src/infrastructure/repositories/AsistenciaRepositoryPg.js`

**Características:**

- ✅ **Lógica de doble tabla**: gestiona `asistencias_partidos` y `asistencias_entrenamientos`
- ✅ Discriminación automática según partidoId/entrenamientoId
- ✅ Agregaciones complejas con COUNT FILTER para estadísticas
- ✅ Métodos que consultan ambas tablas y unifican resultados
- ✅ 12 métodos implementados según IAsistenciaRepository

**Métodos implementados:**

1. `registrar(asistenciaData)` - Registrar asistencia (detecta tabla automáticamente)
2. `actualizar(id, actualizaciones)` - Actualizar (busca en ambas tablas)
3. `findById(id)` - Buscar por ID (busca en ambas tablas)
4. `findByJugadorYEvento(jugadorId, partidoId, entrenamientoId)` - Buscar específica
5. `findByPartidoId(partidoId)` - Todas las asistencias de un partido
6. `findByEntrenamientoId(entrenamientoId)` - Todas las asistencias de un entrenamiento
7. `findByJugadorId(jugadorId, opciones)` - Todas de un jugador (unifica ambas tablas)
8. `getEstadisticasByJugador(jugadorId, opciones)` - Estadísticas agregadas de jugador
9. `getEstadisticasByEvento(partidoId, entrenamientoId)` - Estadísticas de evento
10. `delete(id)` - Eliminar (intenta ambas tablas)
11. `registrarMasivo(asistencias)` - Registro masivo
12. `existe(jugadorId, partidoId, entrenamientoId)` - Verificar existencia

**Lógica de doble tabla:**

```javascript
// Determinar tabla según evento
const esPartido = partidoId !== undefined && partidoId !== null;
const tabla = esPartido ? "asistencias_partidos" : "asistencias_entrenamientos";
const campoEvento = esPartido ? "partido_id" : "entrenamiento_id";
```

**Estadísticas agregadas:**

```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE estado = 'confirmado') as confirmados,
  COUNT(*) FILTER (WHERE estado = 'ausente') as ausentes,
  COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes
FROM asistencias_partidos
WHERE partido_id = $1
```

**Mapeo DB → Objeto:**

- `id` → `id`
- `jugador_id` → `jugadorId`
- `partido_id` → `partidoId` (si es partido)
- `entrenamiento_id` → `entrenamientoId` (si es entrenamiento)
- `estado` → `estado`
- `motivo_ausencia_id` → `motivoAusenciaId`
- `comentario` → `comentario`
- `fecha_respuesta` → `fechaRespuesta`
- `tipoEvento` → "partido" o "entrenamiento" (calculado)

### 6. Index de Repositorios

**Archivo:** `src/infrastructure/repositories/index.js`

Exporta todos los repositorios desde un punto centralizado:

```javascript
export { UsuarioRepositoryPg } from "./UsuarioRepositoryPg.js";
export { JugadorRepositoryPg } from "./JugadorRepositoryPg.js";
export { PartidoRepositoryPg } from "./PartidoRepositoryPg.js";
export { EntrenamientoRepositoryPg } from "./EntrenamientoRepositoryPg.js";
export { AsistenciaRepositoryPg } from "./AsistenciaRepositoryPg.js";
```

## 🏗️ Patrones de Implementación

### 1. Estructura de Constructor

```javascript
constructor(pool) {
  if (!pool) {
    throw new Error("pool de base de datos es requerido");
  }
  this.pool = pool;
}
```

### 2. Mapeo de Entidades

```javascript
_mapToEntity(row) {
  if (!row) return null;

  return Entity.fromDatabase({
    // snake_case DB → camelCase Entity
    id: row.id,
    campoEjemplo: row.campo_ejemplo,
    createdAt: row.created_at
  });
}
```

### 3. Consultas Parametrizadas

```javascript
const query = "SELECT * FROM usuarios WHERE email = $1 AND activo = $2";
const params = [email, true];
const result = await this.pool.query(query, params);
```

### 4. Construcción Dinámica de Filtros

```javascript
let query = "SELECT * FROM tabla WHERE 1=1";
const params = [];
let paramCount = 1;

if (filters.campo !== undefined) {
  query += ` AND campo = $${paramCount}`;
  params.push(filters.campo);
  paramCount++;
}
```

### 5. Paginación Estándar

```javascript
const offset = (page - 1) * limit;
query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
params.push(limit, offset);

// Retorno estándar
return {
  data: mappedEntities,
  total: parseInt(countResult.rows[0].count),
  page,
  totalPages: Math.ceil(total / limit),
};
```

### 6. Gestión de NULL

```javascript
// En INSERT/UPDATE
params = [
  obj.campo,
  obj.campoOpcional || null, // NULL explícito si no existe
  obj.campoRequerido,
];
```

### 7. RETURNING para Retorno Inmediato

```javascript
const query = `
  INSERT INTO tabla (campo1, campo2)
  VALUES ($1, $2)
  RETURNING *
`;
const result = await this.pool.query(query, params);
return this._mapToEntity(result.rows[0]);
```

## 📊 Estadísticas del Código

| Repositorio               | Líneas    | Métodos | Características Especiales             |
| ------------------------- | --------- | ------- | -------------------------------------- |
| UsuarioRepositoryPg       | 289       | 11      | Soft + Hard delete, filtros rol/activo |
| JugadorRepositoryPg       | 310       | 12      | NULLS LAST, verificación unicidad      |
| PartidoRepositoryPg       | 271       | 10      | Consultas temporales, ILIKE rival      |
| EntrenamientoRepositoryPg | 293       | 12      | findToday, findThisWeek, timezone      |
| AsistenciaRepositoryPg    | 380       | 12      | Doble tabla, estadísticas agregadas    |
| index.js                  | 10        | -       | Exportación centralizada               |
| **TOTAL**                 | **1,553** | **57**  | **5 repositorios completos**           |

## 🔧 Configuración de Base de Datos

**Pool existente:** `config/database.js`

- ✅ Configuración Railway con DATABASE_URL
- ✅ Fallback a configuración local
- ✅ Timezone: 'Europe/Madrid'
- ✅ Error handling: pool.on('error')
- ✅ Logs de conexión

**Esquema de tablas:**

- `usuarios` (7 columnas)
- `jugadores` (10 columnas + FK usuario_id, posicion_id)
- `partidos` (10 columnas + FK creado_por)
- `entrenamientos` (6 columnas + FK creado_por)
- `asistencias_partidos` (7 columnas + FK partido_id, jugador_id, motivo_ausencia_id)
- `asistencias_entrenamientos` (7 columnas + FK entrenamiento_id, jugador_id, motivo_ausencia_id)

## ✅ Validaciones Realizadas

- ✅ Constructor valida pool en todos los repositorios
- ✅ Mapeo snake_case → camelCase consistente
- ✅ Consultas parametrizadas (prevención SQL injection)
- ✅ Gestión de NULL explícita para campos opcionales
- ✅ RETURNING \* en INSERT/UPDATE/DELETE
- ✅ Paginación con estructura estándar
- ✅ Filtros dinámicos con paramCount tracking
- ✅ COUNT FILTER para estadísticas PostgreSQL
- ✅ Timezone awareness en consultas temporales
- ✅ ILIKE para búsquedas case-insensitive

## 🎯 Próximos Pasos

### Inmediato: Tarea 3.2 - Servicios Externos (4h)

1. **HashService** - Gestión de hashing con bcrypt

   - `hash(password)` - Hashear contraseña
   - `compare(password, hash)` - Verificar contraseña

2. **TokenService** - Gestión JWT

   - `generate(payload)` - Generar token
   - `verify(token)` - Verificar validez
   - `decode(token)` - Decodificar sin verificar

3. **DateTimeService** - Manipulación de fechas
   - `now()` - Fecha actual
   - `format(date, format)` - Formatear fecha
   - `parse(string, format)` - Parsear string
   - `addDays(date, days)` - Sumar días
   - `startOfDay(date)` - Inicio del día
   - `endOfDay(date)` - Fin del día

### Futuro: Resto de FASE 3

- Tarea 3.3: Pool Configuration Optimization (2h)
- Tarea 3.4: Database Migrations (6h)
- Tarea 3.5: Adapt Controllers (6h)
- Tarea 3.6: Dependency Injection (2h)

## 📝 Notas Técnicas

1. **Doble tabla en Asistencia**: La implementación de AsistenciaRepositoryPg es la más compleja debido a la gestión simultánea de `asistencias_partidos` y `asistencias_entrenamientos`. Los métodos detectan automáticamente la tabla correcta basándose en `partidoId` o `entrenamientoId`.

2. **Timezone awareness**: Los métodos `findToday()` y `findThisWeek()` en EntrenamientoRepositoryPg usan `AT TIME ZONE 'Europe/Madrid'` para consultas correctas respetando la zona horaria del pool.

3. **NULLS LAST**: JugadorRepositoryPg usa `ORDER BY numero_dorsal ASC NULLS LAST` para que jugadores sin dorsal asignado aparezcan al final del listado.

4. **COUNT FILTER**: AsistenciaRepositoryPg usa la sintaxis `COUNT(*) FILTER (WHERE estado = 'confirmado')` para agregaciones eficientes en una sola consulta.

5. **ILIKE vs LIKE**: Se usa ILIKE para búsquedas case-insensitive en PostgreSQL (rival, lugar).

6. **Soft vs Hard Delete**: Solo UsuarioRepositoryPg implementa soft delete (activo = false). El resto usa eliminación física directa.

## 🎉 Conclusión

Tarea 3.1 completada exitosamente. Los 5 repositorios PostgreSQL están implementados siguiendo las interfaces del dominio, con patrones consistentes de mapeo, filtrado, paginación y gestión de errores. La capa de infraestructura puede ahora persistir todas las entidades del dominio en PostgreSQL.

**Progreso FASE 3:** 1/6 tareas (16.7%)
**Progreso General:** 11/26 tareas (42.3%)
