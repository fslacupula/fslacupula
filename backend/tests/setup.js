/**
 * Setup global para tests
 * Se ejecuta antes de cada archivo de test
 */

// Configurar zona horaria para tests
process.env.TZ = "Europe/Madrid";

// Configurar variables de entorno para tests
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key-for-testing-only";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_NAME = "futbolclub_test";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "postgres";

// Suprimir console.log en tests (descomentar si es necesario)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

console.log("🧪 Test environment initialized");
