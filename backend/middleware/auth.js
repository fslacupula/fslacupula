import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
    req.user = user;
    next();
  });
};

export const esGestor = (req, res, next) => {
  if (req.user.rol !== "gestor") {
    return res.status(403).json({ error: "Acceso denegado. Solo gestores." });
  }
  next();
};

export const esJugadorOGestor = (req, res, next) => {
  if (req.user.rol !== "jugador" && req.user.rol !== "gestor") {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};
