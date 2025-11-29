# ✅ Tarea 3.2: Servicios Externos - COMPLETADA

**Fecha:** Noviembre 2024
**Duración estimada:** 4h | **Duración real:** ~2h
**Fase:** FASE 3 - Capa de Infraestructura

## 📋 Descripción

Implementación de servicios externos que encapsulan lógica de infraestructura no relacionada directamente con persistencia de datos. Estos servicios proporcionan funcionalidad transversal para hashing, tokens JWT y manipulación de fechas.

## ✨ Servicios Implementados

### 1. HashService (94 líneas)

**Archivo:** `src/infrastructure/services/HashService.js`

**Propósito:** Gestión segura de hashing de contraseñas usando bcrypt.

**Dependencias:**

- `bcrypt` - Librería para hashing con salt automático

**Configuración:**

- Salt rounds: 10 (configurable)
- Algoritmo: bcrypt (Blowfish cipher)

**Métodos implementados:**

#### `hash(password)`

Hashea una contraseña en texto plano.

```javascript
const hashedPassword = await hashService.hash("miPassword123");
// "$2b$10$XYZ..."
```

**Características:**

- ✅ Validación de password (string no vacío)
- ✅ Salt automático por bcrypt
- ✅ Manejo de errores descriptivos
- ✅ Async/await para operaciones no bloqueantes

#### `compare(password, hash)`

Compara una contraseña con su hash.

```javascript
const isValid = await hashService.compare("miPassword123", hashedPassword);
// true o false
```

**Características:**

- ✅ Validación de parámetros
- ✅ Comparación segura (constant-time)
- ✅ Retorno booleano

#### `isValidHash(hash)`

Verifica si un string es un hash bcrypt válido.

```javascript
const esValido = hashService.isValidHash("$2b$10$...");
// true
```

**Características:**

- ✅ Regex para validar formato bcrypt
- ✅ Soporta variantes: $2a$, $2b$, $2y$
- ✅ Verificación de longitud (60 caracteres)

#### Métodos de configuración:

- `getSaltRounds()` - Obtiene salt rounds configuradas
- `setSaltRounds(rounds)` - Configura rounds (4-31, solo testing)

**Seguridad:**

- ✅ Salt único por password
- ✅ Algoritmo resistente a rainbow tables
- ✅ Costo computacional adaptativo
- ✅ No almacena passwords en texto plano

---

### 2. TokenService (220 líneas)

**Archivo:** `src/infrastructure/services/TokenService.js`

**Propósito:** Gestión completa de JSON Web Tokens (JWT) para autenticación y autorización.

**Dependencias:**

- `jsonwebtoken` - Librería estándar JWT

**Configuración por defecto:**

```javascript
{
  expiresIn: "24h",
  issuer: "futbol-club-app",
  audience: "futbol-club-users"
}
```

**Secret Key:**

- Prioridad: `constructor(secretKey)` > `process.env.JWT_SECRET` > "secret-key-default"
- ⚠️ Warning si usa clave por defecto

**Métodos implementados:**

#### `generate(payload, customOptions)`

Genera un nuevo token JWT.

```javascript
const token = tokenService.generate(
  { userId: 123, rol: "gestor" },
  { expiresIn: "1h" }
);
```

**Características:**

- ✅ Validación de payload (objeto no array)
- ✅ Bloquea campos reservados (iat, exp, iss, aud, sub, jti)
- ✅ Merge de opciones personalizadas con defaults
- ✅ Manejo de errores descriptivos

#### `verify(token, customOptions)`

Verifica y decodifica un token.

```javascript
const payload = tokenService.verify(token);
// { userId: 123, rol: "gestor", iat: ..., exp: ... }
```

**Características:**

- ✅ Verificación de firma
- ✅ Validación de expiración
- ✅ Validación de issuer/audience
- ✅ Errores específicos: TokenExpiredError, JsonWebTokenError, NotBeforeError

#### `decode(token)`

Decodifica sin verificar firma (⚠️ NO usar para autenticación).

```javascript
const payload = tokenService.decode(token);
// { userId: 123, rol: "gestor", ... } sin verificar firma
```

**Uso:** Inspección de tokens, debugging, extracción de metadata.

#### `decodeComplete(token)`

Decodifica con información completa (header + payload + signature).

```javascript
const decoded = tokenService.decodeComplete(token);
// { header: {...}, payload: {...}, signature: "..." }
```

#### `isExpired(token)`

Verifica si un token ha expirado.

```javascript
const expirado = tokenService.isExpired(token);
// true o false
```

**Características:**

- ✅ No requiere verificación de firma
- ✅ Compara exp con timestamp actual

#### `getTimeToExpire(token)`

Obtiene segundos restantes de validez.

```javascript
const segundos = tokenService.getTimeToExpire(token);
// 3600 (1 hora)
```

**Uso:** UI para mostrar tiempo restante, renovación proactiva.

#### `refresh(token, customOptions)`

Refresca un token generando uno nuevo con el mismo payload.

```javascript
const nuevoToken = tokenService.refresh(tokenAntiguo);
```

**Características:**

- ✅ Verifica token actual
- ✅ Extrae payload limpio (sin iat, exp, iss, aud)
- ✅ Genera nuevo token con nueva expiración

#### Métodos de conveniencia:

**`generateShortLived(payload, expiresIn='15m')`**
Token de corta duración para operaciones sensibles.

```javascript
const tokenSensible = tokenService.generateShortLived({
  userId: 123,
  action: "reset-password",
});
```

**`generateLongLived(payload, expiresIn='30d')`**
Token de larga duración para "remember me".

```javascript
const tokenRememberMe = tokenService.generateLongLived({ userId: 123 }, "30d");
```

#### Métodos de configuración:

- `setSecretKey(newSecretKey)` - Configura nueva secret (solo testing)
- `getDefaultOptions()` - Obtiene opciones por defecto

**Seguridad:**

- ✅ Firma HMAC SHA256
- ✅ Verificación de integridad
- ✅ Expiración automática
- ✅ Validación de issuer/audience (previene token replay)

---

### 3. DateTimeService (450 líneas)

**Archivo:** `src/infrastructure/services/DateTimeService.js`

**Propósito:** Manipulación completa de fechas y horas, centraliza lógica temporal de la aplicación.

**Configuración:**

- Timezone por defecto: "Europe/Madrid"
- Locale por defecto: "es-ES"

**Métodos implementados:**

#### Métodos básicos:

**`now()`**
Obtiene fecha/hora actual.

```javascript
const ahora = dateTimeService.now();
```

**`format(date, format='yyyy-MM-dd HH:mm:ss')`**
Formatea fecha según patrón.

```javascript
const formatted = dateTimeService.format(new Date(), "dd/MM/yyyy HH:mm");
// "29/11/2024 15:30"
```

**Tokens soportados:**

- `yyyy` - Año completo (2024)
- `yy` - Año corto (24)
- `MM` - Mes con padding (01-12)
- `M` - Mes sin padding (1-12)
- `dd` - Día con padding (01-31)
- `d` - Día sin padding (1-31)
- `HH` - Horas con padding (00-23)
- `H` - Horas sin padding (0-23)
- `mm` - Minutos con padding (00-59)
- `m` - Minutos sin padding (0-59)
- `ss` - Segundos con padding (00-59)
- `s` - Segundos sin padding (0-59)
- `SSS` - Milisegundos (000-999)

**`parse(dateString)`**
Parsea string a Date.

```javascript
const fecha = dateTimeService.parse("2024-11-29");
```

#### Métodos de suma/resta:

**`addDays(date, days)`**

```javascript
const manana = dateTimeService.addDays(new Date(), 1);
const ayer = dateTimeService.addDays(new Date(), -1);
```

**`addHours(date, hours)`**
**`addMinutes(date, minutes)`**
**`addMonths(date, months)`**
**`addYears(date, years)`**

#### Métodos de inicio/fin:

**`startOfDay(date)`**
Inicio del día (00:00:00.000).

```javascript
const inicioHoy = dateTimeService.startOfDay(new Date());
// 2024-11-29 00:00:00.000
```

**`endOfDay(date)`**
Fin del día (23:59:59.999).

```javascript
const finHoy = dateTimeService.endOfDay(new Date());
// 2024-11-29 23:59:59.999
```

**`startOfWeek(date)`**
Inicio de semana (lunes 00:00:00.000).

```javascript
const inicioSemana = dateTimeService.startOfWeek(new Date());
```

**`endOfWeek(date)`**
Fin de semana (domingo 23:59:59.999).

**`startOfMonth(date)`**
Inicio de mes (día 1 a las 00:00:00.000).

**`endOfMonth(date)`**
Fin de mes (último día 23:59:59.999).

#### Métodos de diferencia:

**`diffInDays(date1, date2)`**
Diferencia en días.

```javascript
const dias = dateTimeService.diffInDays(fecha1, fecha2);
// 7
```

**`diffInHours(date1, date2)`**
**`diffInMinutes(date1, date2)`**

#### Métodos de verificación:

**`isToday(date)`**
Verifica si es hoy.

```javascript
const esHoy = dateTimeService.isToday(new Date());
// true
```

**`isPast(date)`**
Verifica si es pasada.

**`isFuture(date)`**
Verifica si es futura.

**`isBetween(date, start, end)`**
Verifica si está en rango.

```javascript
const enRango = dateTimeService.isBetween(fecha, inicioMes, finMes);
```

**`isSameDay(date1, date2)`**
Verifica si son el mismo día.

#### Métodos de formato especial:

**`getDayName(date, locale='es-ES')`**
Nombre del día.

```javascript
const dia = dateTimeService.getDayName(new Date());
// "viernes"
```

**`getMonthName(date, locale='es-ES')`**
Nombre del mes.

```javascript
const mes = dateTimeService.getMonthName(new Date());
// "noviembre"
```

**`toISO(date)`**
Formato ISO 8601.

```javascript
const iso = dateTimeService.toISO(new Date());
// "2024-11-29T15:30:00.000Z"
```

**`toSQL(date)`**
Formato SQL (YYYY-MM-DD HH:mm:ss).

```javascript
const sql = dateTimeService.toSQL(new Date());
// "2024-11-29 15:30:00"
```

**`toDateOnly(date)`**
Solo fecha (YYYY-MM-DD).

```javascript
const fecha = dateTimeService.toDateOnly(new Date());
// "2024-11-29"
```

**`toTimeOnly(date)`**
Solo hora (HH:mm:ss).

```javascript
const hora = dateTimeService.toTimeOnly(new Date());
// "15:30:00"
```

#### Métodos de configuración:

- `getTimezone()` - Obtiene timezone configurada
- `setTimezone(timezone)` - Configura timezone (solo testing)

#### Método privado:

**`_ensureDate(date)`**
Asegura que el valor sea Date válido.

- Acepta: Date, string, number
- Valida: isNaN(date.getTime())
- Lanza error si inválido

**Características generales:**

- ✅ Manejo de Date, string y number
- ✅ Validación exhaustiva de fechas inválidas
- ✅ Inmutabilidad (retorna nuevas fechas)
- ✅ Soporte de valores negativos en sumas
- ✅ Formato de fecha personalizable
- ✅ Locale configurable

---

### 4. Index de Servicios

**Archivo:** `src/infrastructure/services/index.js`

Exporta todos los servicios desde un punto centralizado:

```javascript
export { HashService } from "./HashService.js";
export { TokenService } from "./TokenService.js";
export { DateTimeService } from "./DateTimeService.js";
```

## 📊 Estadísticas del Código

| Servicio        | Líneas  | Métodos Públicos | Métodos Privados |
| --------------- | ------- | ---------------- | ---------------- |
| HashService     | 94      | 5                | 0                |
| TokenService    | 220     | 14               | 0                |
| DateTimeService | 450     | 35               | 1                |
| index.js        | 8       | -                | -                |
| **TOTAL**       | **772** | **54**           | **1**            |

## 🏗️ Patrones de Implementación

### 1. Validación de Entrada

```javascript
if (!password || typeof password !== "string") {
  throw new Error("La contraseña debe ser una cadena de texto válida");
}
```

### 2. Configuración Flexible

```javascript
constructor(secretKey = null, options = {}) {
  this.secretKey = secretKey || process.env.JWT_SECRET || "secret-key-default";
  this.defaultOptions = { ...defaultConfig, ...options };
}
```

### 3. Manejo de Errores Específicos

```javascript
try {
  return jwt.verify(token, this.secretKey, options);
} catch (error) {
  if (error.name === "TokenExpiredError") {
    throw new Error("El token ha expirado");
  }
  if (error.name === "JsonWebTokenError") {
    throw new Error("Token inválido");
  }
  // ...
}
```

### 4. Inmutabilidad en Fechas

```javascript
addDays(date, days) {
  const d = this._ensureDate(date);
  const result = new Date(d); // Nueva instancia
  result.setDate(result.getDate() + days);
  return result;
}
```

### 5. Métodos de Conveniencia

```javascript
// Alto nivel
generateShortLived(payload, expiresIn = "15m") {
  return this.generate(payload, { expiresIn });
}

// Bajo nivel
generate(payload, customOptions = {}) {
  // Implementación completa
}
```

## 🔧 Uso en Casos de Uso

### Ejemplo: AuthService con HashService

```javascript
class LoginUseCase {
  constructor(usuarioRepository, hashService, tokenService) {
    this.usuarioRepository = usuarioRepository;
    this.hashService = hashService;
    this.tokenService = tokenService;
  }

  async execute(email, password) {
    const usuario = await this.usuarioRepository.findByEmail(email);

    // Usar HashService
    const passwordValida = await this.hashService.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      throw new Error("Credenciales inválidas");
    }

    // Usar TokenService
    const token = this.tokenService.generate({
      userId: usuario.id,
      rol: usuario.rol,
    });

    return { usuario, token };
  }
}
```

### Ejemplo: DateTimeService en Consultas

```javascript
class ObtenerEntrenamientosDeHoyUseCase {
  constructor(entrenamientoRepository, dateTimeService) {
    this.entrenamientoRepository = entrenamientoRepository;
    this.dateTimeService = dateTimeService;
  }

  async execute() {
    const inicioHoy = this.dateTimeService.startOfDay(new Date());
    const finHoy = this.dateTimeService.endOfDay(new Date());

    return await this.entrenamientoRepository.findByDateRange(
      inicioHoy,
      finHoy
    );
  }
}
```

## ✅ Validaciones Realizadas

### HashService:

- ✅ Validación de password no vacío
- ✅ Validación de tipo string
- ✅ Manejo de errores de bcrypt
- ✅ Validación de formato hash bcrypt (regex)
- ✅ Validación de salt rounds (4-31)

### TokenService:

- ✅ Validación de payload (objeto no array)
- ✅ Bloqueo de campos reservados JWT
- ✅ Validación de token string no vacío
- ✅ Manejo de errores específicos JWT
- ✅ Validación de secret key
- ✅ Warning si usa clave por defecto

### DateTimeService:

- ✅ Validación de fechas inválidas (isNaN)
- ✅ Conversión automática Date/string/number
- ✅ Validación de timezone string
- ✅ Validación de formato de fecha
- ✅ Validación de dateString en parse

## 🎯 Próximos Pasos

### Inmediato: Tarea 3.3 - Optimización Pool (2h)

1. Revisar configuración de pool
2. Implementar reintentos de conexión
3. Agregar health checks
4. Configurar límites de conexiones

### Futuro: Resto de FASE 3

- Tarea 3.4: Database Migrations (6h)
- Tarea 3.5: Adapt Controllers (6h)
- Tarea 3.6: Dependency Injection (2h)

## 📝 Notas Técnicas

1. **HashService - Salt Rounds**: 10 rounds es el estándar recomendado (2^10 = 1,024 iteraciones). Mayor = más seguro pero más lento.

2. **TokenService - Secret Key**: En producción DEBE usar `process.env.JWT_SECRET` con al menos 256 bits de entropía.

3. **TokenService - Refresh Strategy**: El método `refresh()` verifica el token actual antes de generar uno nuevo, evitando refrescar tokens inválidos.

4. **DateTimeService - Timezone**: Configurado para "Europe/Madrid" pero flexible. Los métodos `findToday()` y `findThisWeek()` en repositorios deben usar esta zona horaria.

5. **DateTimeService - Inmutabilidad**: Todos los métodos que modifican fechas retornan nuevas instancias, preservando la fecha original.

6. **DateTimeService - startOfWeek**: Considera lunes como primer día de la semana (estándar ISO 8601 europeo).

7. **Error Handling**: Todos los servicios usan `throw new Error()` con mensajes descriptivos para facilitar debugging.

8. **Testing**: Los métodos `setSaltRounds()`, `setSecretKey()`, `setTimezone()` están diseñados para facilitar testing con valores controlados.

## 🔒 Consideraciones de Seguridad

### HashService:

- ✅ Bcrypt incluye salt automático (no necesita gestión manual)
- ✅ Algoritmo resistente a GPU/ASIC attacks
- ✅ Costo adaptativo (aumentar rounds en el futuro)
- ⚠️ No usar para API keys o secrets (usar HMAC-SHA256)

### TokenService:

- ✅ Firma HMAC SHA256 (estándar JWT)
- ✅ Expiración obligatoria
- ✅ Validación de issuer/audience previene token replay
- ⚠️ Secret key debe tener alta entropía (256+ bits)
- ⚠️ No almacenar datos sensibles en payload (es visible)
- ⚠️ Método `decode()` NO verifica firma (solo para inspección)

### DateTimeService:

- ✅ Validación exhaustiva previene ataques de fecha inválida
- ✅ Timezone configurable previene bugs de conversión
- ⚠️ No usar `Date.now()` directamente, usar `dateTimeService.now()` para testing

## 🎉 Conclusión

Tarea 3.2 completada exitosamente. Los 3 servicios externos están implementados con funcionalidad completa, validaciones exhaustivas y patrones consistentes. La capa de infraestructura ahora proporciona:

- **Seguridad**: Hashing bcrypt y JWT
- **Autenticación**: Generación y verificación de tokens
- **Temporal**: Manipulación completa de fechas

Los servicios están listos para ser inyectados en casos de uso y controladores.

**Progreso FASE 3:** 2/6 tareas (33.3%)
**Progreso General:** 12/26 tareas (46.2%)
