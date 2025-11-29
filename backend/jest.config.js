/**
 * Configuración de Jest para el proyecto FutbolClub
 * Soporte para ES Modules y tests unitarios, integración y e2e
 */

export default {
  // Indicar que usamos ES Modules
  testEnvironment: "node",

  // Transformación de archivos (ninguna necesaria con --experimental-vm-modules)
  transform: {},

  // Extensiones de archivos a procesar
  moduleFileExtensions: ["js", "json"],

  // Patrones de archivos de test
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],

  // Archivos a ignorar
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
    "!src/tests/**",
  ],

  // Coverage thresholds (objetivos de cobertura)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Directorio de reportes de coverage
  coverageDirectory: "coverage",

  // Reportes de coverage
  coverageReporters: ["text", "lcov", "html", "json-summary"],

  // Setup files (ejecutados antes de cada test)
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Verbose output
  verbose: true,

  // Timeout por defecto (5 segundos)
  testTimeout: 5000,

  // Clear mocks automáticamente entre tests
  clearMocks: true,

  // Restore mocks automáticamente entre tests
  restoreMocks: true,

  // Reset mocks automáticamente entre tests
  resetMocks: true,
};
