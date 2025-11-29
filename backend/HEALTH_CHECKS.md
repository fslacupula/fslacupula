# 🏥 Sistema de Health Checks - FutbolClub

## 📋 Descripción

Sistema completo de monitoreo de salud para la aplicación FutbolClub, incluyendo verificación de estado de la base de datos, pool de conexiones y recursos del sistema.

## 🔗 Endpoints Disponibles

### 1. Health Check General

```
GET /health
```

Verifica el estado general de la aplicación.

**Respuesta exitosa (200):**

```json
{
  "status": "UP",
  "timestamp": "2024-11-29T23:45:00.000Z",
  "uptime": "15m 30s",
  "memory": {
    "rss": "150MB",
    "heapTotal": "80MB",
    "heapUsed": "60MB"
  },
  "database": {
    "status": "healthy",
    "message": "Conexión a base de datos OK",
    "responseTime": "15ms",
    "timestamp": "2024-11-29T23:45:00.000Z",
    "version": "PostgreSQL 14.5",
    "pool": {
      "total": 3,
      "idle": 2,
      "waiting": 0
    }
  },
  "environment": "production"
}
```

**Respuesta con error (503):**

```json
{
  "status": "DOWN",
  "timestamp": "2024-11-29T23:45:00.000Z",
  "database": {
    "status": "unhealthy",
    "message": "Error conectando a base de datos",
    "error": "connection refused"
  }
}
```

### 2. Database Health Check

```
GET /health/db
```

Verifica solo el estado de la base de datos.

**Respuesta exitosa (200):**

```json
{
  "status": "healthy",
  "message": "Conexión a base de datos OK",
  "responseTime": "12ms",
  "timestamp": "2024-11-29T23:45:00.000Z",
  "version": "PostgreSQL 14.5",
  "pool": {
    "total": 3,
    "idle": 2,
    "waiting": 0
  }
}
```

### 3. Pool Statistics

```
GET /health/pool
```

Obtiene estadísticas detalladas del pool de conexiones.

**Respuesta (200):**

```json
{
  "status": "OK",
  "timestamp": "2024-11-29T23:45:00.000Z",
  "pool": {
    "totalConnections": 5,
    "idleConnections": 3,
    "waitingRequests": 0,
    "maxConnections": 20,
    "minConnections": 2
  }
}
```

### 4. Readiness Probe

```
GET /health/ready
```

Verifica si la aplicación está lista para recibir tráfico (útil para Kubernetes).

**Respuesta lista (200):**

```json
{
  "status": "READY",
  "timestamp": "2024-11-29T23:45:00.000Z"
}
```

**Respuesta no lista (503):**

```json
{
  "status": "NOT_READY",
  "timestamp": "2024-11-29T23:45:00.000Z",
  "reason": "Database not available"
}
```

### 5. Liveness Probe

```
GET /health/live
```

Verifica si la aplicación está viva (útil para Kubernetes).

**Respuesta (200):**

```json
{
  "status": "ALIVE",
  "timestamp": "2024-11-29T23:45:00.000Z",
  "uptime": "930s"
}
```

## 🔧 Configuración del Pool

El pool de conexiones se configura mediante variables de entorno:

```bash
# Configuración de pool (valores por defecto)
DB_POOL_MAX=20              # Máximo de conexiones
DB_POOL_MIN=2               # Mínimo de conexiones activas
DB_IDLE_TIMEOUT=30000       # Timeout para conexiones inactivas (ms)
DB_CONNECT_TIMEOUT=10000    # Timeout para nuevas conexiones (ms)

# Reconexión automática
DB_MAX_RECONNECT_ATTEMPTS=5 # Intentos de reconexión
DB_RECONNECT_INTERVAL=5000  # Intervalo entre reintentos (ms)
```

### Valores Recomendados

**Desarrollo:**

- `DB_POOL_MAX=10`
- `DB_POOL_MIN=1`
- `DB_IDLE_TIMEOUT=10000`
- `DB_CONNECT_TIMEOUT=5000`

**Producción:**

- `DB_POOL_MAX=20`
- `DB_POOL_MIN=2`
- `DB_IDLE_TIMEOUT=30000`
- `DB_CONNECT_TIMEOUT=10000`

## 📊 Estadísticas del Pool

El sistema registra automáticamente estadísticas en modo desarrollo:

```
📊 Pool stats - Activas: 5, Inactivas: 3, Esperando: 0
```

**Métricas:**

- **Activas:** Conexiones en uso actualmente
- **Inactivas:** Conexiones disponibles en el pool
- **Esperando:** Solicitudes esperando una conexión

## 🔄 Sistema de Reconexión

El pool implementa reconexión automática ante errores:

1. **Errores que activan reconexión:**

   - `ECONNREFUSED` - Conexión rechazada
   - `ETIMEDOUT` - Timeout de conexión
   - `ENOTFOUND` - Host no encontrado
   - `connection terminated unexpectedly` - Conexión terminada

2. **Proceso de reconexión:**

   - Detecta error recuperable
   - Espera `DB_RECONNECT_INTERVAL` (5 segundos por defecto)
   - Intenta reconectar hasta `DB_MAX_RECONNECT_ATTEMPTS` (5 veces)
   - Registra cada intento en consola
   - Resetea contador al reconectar exitosamente

3. **Logs de reconexión:**

```
❌ Error en el pool de PostgreSQL: connection refused
🔄 Intentando reconectar (1/5)...
✅ Reconexión exitosa
```

## 🏗️ Eventos del Pool

El pool emite eventos que son monitoreados:

### `connect`

Se dispara al establecer nueva conexión:

```javascript
pool.on("connect", async (client) => {
  await client.query("SET timezone = 'Europe/Madrid'");
  console.log("✅ Conectado a PostgreSQL");
});
```

### `error`

Se dispara ante errores de conexión:

```javascript
pool.on("error", async (err, client) => {
  console.error("❌ Error en el pool:", err.message);
  // Sistema de reconexión automática
});
```

### `acquire`

Se dispara al adquirir cliente del pool:

```javascript
pool.on("acquire", (client) => {
  // Registra estadísticas en desarrollo
});
```

### `remove`

Se dispara al remover cliente del pool:

```javascript
pool.on("remove", (client) => {
  console.log("🔌 Cliente removido del pool");
});
```

## 🛠️ Funciones Utilitarias

### `checkDatabaseHealth()`

Verifica estado de conexión a la base de datos.

```javascript
import { checkDatabaseHealth } from "./config/database.js";

const health = await checkDatabaseHealth();
console.log(health);
// { status: "healthy", responseTime: "15ms", ... }
```

### `getPoolStats()`

Obtiene estadísticas del pool.

```javascript
import { getPoolStats } from "./config/database.js";

const stats = getPoolStats();
console.log(stats);
// { totalConnections: 5, idleConnections: 3, ... }
```

### `closePool()`

Cierra gracefully el pool de conexiones.

```javascript
import { closePool } from "./config/database.js";

await closePool();
// ✅ Pool de conexiones cerrado correctamente
```

## 🐳 Integración con Docker/Kubernetes

### Kubernetes Probes

**Liveness Probe:**

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

**Readiness Probe:**

```yaml
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

### Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health/live || exit 1
```

## 📈 Monitoreo y Alertas

### Métricas Clave

1. **Response Time:** Tiempo de respuesta de queries (<50ms ideal)
2. **Pool Utilization:** % de conexiones en uso (<80% ideal)
3. **Waiting Requests:** Solicitudes esperando conexión (0 ideal)
4. **Error Rate:** Tasa de errores de conexión (<1% ideal)

### Alertas Recomendadas

- ⚠️ Warning: Pool utilization > 80%
- 🚨 Critical: Database unhealthy por > 1 minuto
- ⚠️ Warning: Waiting requests > 0 por > 30 segundos
- 🚨 Critical: Response time > 1000ms

## 🧪 Testing del Sistema

### Test Manual

```bash
# Health check general
curl http://localhost:3001/health

# Database health
curl http://localhost:3001/health/db

# Pool statistics
curl http://localhost:3001/health/pool

# Readiness
curl http://localhost:3001/health/ready

# Liveness
curl http://localhost:3001/health/live
```

### Test de Carga

```bash
# Usando Apache Bench
ab -n 1000 -c 10 http://localhost:3001/health/db

# Usando wrk
wrk -t4 -c100 -d30s http://localhost:3001/health/db
```

## 🔒 Seguridad

### Consideraciones

1. **No exponer en producción sin autenticación** si contiene información sensible
2. Limitar acceso a endpoints de estadísticas en producción
3. No incluir contraseñas o secrets en respuestas de health check
4. Usar HTTPS en producción

### Alternativa Segura

```javascript
// Solo exponer health básico públicamente
router.get("/health/public", (req, res) => {
  res.json({ status: "UP" });
});

// Requerir autenticación para detalles
router.get("/health/detailed", authenticateAdmin, async (req, res) => {
  // Retorna información completa
});
```

## 📝 Best Practices

1. ✅ **Usar timeouts apropiados** para evitar bloqueos
2. ✅ **Monitorear pool utilization** continuamente
3. ✅ **Configurar reconexión automática** para resiliencia
4. ✅ **Registrar métricas** para análisis histórico
5. ✅ **Implementar circuit breaker** si hay problemas recurrentes
6. ✅ **Usar diferentes pools** para read/write si es necesario
7. ✅ **Cerrar pool gracefully** en shutdown

## 🚀 Próximos Pasos

- [ ] Integrar con sistema de métricas (Prometheus)
- [ ] Agregar dashboard de monitoreo (Grafana)
- [ ] Implementar circuit breaker para protección
- [ ] Agregar logs estructurados (Winston/Pino)
- [ ] Configurar alertas automáticas (PagerDuty/Slack)

---

**Nota:** Este sistema está diseñado para ser compatible con Kubernetes, Docker y despliegues tradicionales.
