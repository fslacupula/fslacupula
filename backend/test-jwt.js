import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

console.log("=== Test JWT ===");
console.log("JWT_SECRET configurado:", JWT_SECRET ? "✓ Sí" : "✗ No");
console.log("JWT_SECRET valor:", JWT_SECRET);

// Crear un token de prueba
const testPayload = {
  id: 999,
  email: "test@test.com",
  rol: "jugador",
};

try {
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: "7d" });
  console.log("\n✓ Token generado exitosamente");
  console.log("Token:", token.substring(0, 50) + "...");

  // Verificar el token
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log("\n✓ Token verificado exitosamente");
  console.log("Payload decodificado:", decoded);
} catch (error) {
  console.error("\n✗ Error:", error.message);
}
