import pool from "../../config/database.js";
import { HashService } from "../../src/infrastructure/services/HashService.js";

const hashService = new HashService();

/**
 * Seed: Datos de prueba para desarrollo
 */
export async function seed(client) {
  console.log("🌱 Insertando datos de prueba...");

  // 1. Crear usuarios
  const adminPassword = await hashService.hash("Admin123!");
  const gestorPassword = await hashService.hash("Gestor123!");
  const jugadorPassword = await hashService.hash("Jugador123!");

  await client.query(
    `
    INSERT INTO usuarios (email, password, nombre, rol, activo) VALUES
      ('admin@futbolclub.com', $1, 'Administrador', 'admin', true),
      ('gestor@futbolclub.com', $2, 'Gestor Principal', 'gestor', true),
      ('jugador1@futbolclub.com', $3, 'Juan Pérez', 'jugador', true),
      ('jugador2@futbolclub.com', $3, 'María García', 'jugador', true),
      ('jugador3@futbolclub.com', $3, 'Carlos López', 'jugador', true),
      ('jugador4@futbolclub.com', $3, 'Ana Martínez', 'jugador', true),
      ('jugador5@futbolclub.com', $3, 'Pedro Sánchez', 'jugador', true),
      ('jugador6@futbolclub.com', $3, 'Laura Fernández', 'jugador', true),
      ('jugador7@futbolclub.com', $3, 'David Rodríguez', 'jugador', true),
      ('jugador8@futbolclub.com', $3, 'Elena González', 'jugador', true)
    ON CONFLICT (email) DO NOTHING
  `,
    [adminPassword, gestorPassword, jugadorPassword]
  );

  console.log("✅ Usuarios creados");

  // 2. Crear perfiles de jugadores
  await client.query(`
    INSERT INTO jugadores (usuario_id, numero_dorsal, posicion, posicion_id, alias, telefono) 
    SELECT 
      u.id,
      CASE 
        WHEN u.nombre = 'Juan Pérez' THEN 1
        WHEN u.nombre = 'María García' THEN 7
        WHEN u.nombre = 'Carlos López' THEN 10
        WHEN u.nombre = 'Ana Martínez' THEN 4
        WHEN u.nombre = 'Pedro Sánchez' THEN 5
        WHEN u.nombre = 'Laura Fernández' THEN 9
        WHEN u.nombre = 'David Rodríguez' THEN 3
        WHEN u.nombre = 'Elena González' THEN 11
      END as numero_dorsal,
      CASE 
        WHEN u.nombre = 'Juan Pérez' THEN 'Portero'
        WHEN u.nombre = 'María García' THEN 'Cierre'
        WHEN u.nombre = 'Carlos López' THEN 'Pivot'
        WHEN u.nombre = 'Ana Martínez' THEN 'Ala'
        WHEN u.nombre = 'Pedro Sánchez' THEN 'Cierre'
        WHEN u.nombre = 'Laura Fernández' THEN 'Ala'
        WHEN u.nombre = 'David Rodríguez' THEN 'Pivot'
        WHEN u.nombre = 'Elena González' THEN 'Ala-Pivot'
      END as posicion,
      CASE 
        WHEN u.nombre = 'Juan Pérez' THEN 1
        WHEN u.nombre = 'María García' THEN 2
        WHEN u.nombre = 'Carlos López' THEN 4
        WHEN u.nombre = 'Ana Martínez' THEN 3
        WHEN u.nombre = 'Pedro Sánchez' THEN 2
        WHEN u.nombre = 'Laura Fernández' THEN 3
        WHEN u.nombre = 'David Rodríguez' THEN 4
        WHEN u.nombre = 'Elena González' THEN 5
      END as posicion_id,
      CASE 
        WHEN u.nombre = 'Juan Pérez' THEN 'Juanito'
        WHEN u.nombre = 'María García' THEN 'Mari'
        WHEN u.nombre = 'Carlos López' THEN 'Carlitos'
        WHEN u.nombre = 'Ana Martínez' THEN 'Anita'
        WHEN u.nombre = 'Pedro Sánchez' THEN 'Pedrito'
        WHEN u.nombre = 'Laura Fernández' THEN 'Lau'
        WHEN u.nombre = 'David Rodríguez' THEN 'Davi'
        WHEN u.nombre = 'Elena González' THEN 'Ele'
      END as alias,
      '+34 6' || LPAD((RANDOM() * 100000000)::int::text, 8, '0') as telefono
    FROM usuarios u
    WHERE u.rol = 'jugador'
    ON CONFLICT (usuario_id) DO NOTHING
  `);

  console.log("✅ Perfiles de jugadores creados");

  // 3. Crear entrenamientos
  await client.query(`
    INSERT INTO entrenamientos (fecha_hora, lugar, descripcion, duracion_minutos, creado_por) 
    SELECT 
      CURRENT_TIMESTAMP + (interval '1 day' * generate_series),
      'Polideportivo Municipal',
      'Entrenamiento regular de la semana ' || generate_series,
      90,
      (SELECT id FROM usuarios WHERE rol = 'gestor' LIMIT 1)
    FROM generate_series(1, 7)
  `);

  console.log("✅ Entrenamientos creados");

  // 4. Crear partidos
  await client.query(`
    INSERT INTO partidos (fecha_hora, rival, lugar, tipo, es_local, creado_por) 
    VALUES
      (CURRENT_TIMESTAMP + interval '3 days', 'CD Rival FC', 'Pabellón Principal', 'liga', true, 
       (SELECT id FROM usuarios WHERE rol = 'gestor' LIMIT 1)),
      (CURRENT_TIMESTAMP + interval '10 days', 'UD Competidor', 'Pabellón Visitante', 'liga', false,
       (SELECT id FROM usuarios WHERE rol = 'gestor' LIMIT 1)),
      (CURRENT_TIMESTAMP + interval '17 days', 'CF Contrincante', 'Pabellón Principal', 'copa', true,
       (SELECT id FROM usuarios WHERE rol = 'gestor' LIMIT 1))
  `);

  console.log("✅ Partidos creados");

  // 5. Crear asistencias de prueba
  await client.query(`
    INSERT INTO asistencias_entrenamientos (entrenamiento_id, jugador_id, estado)
    SELECT 
      e.id,
      u.id,
      CASE 
        WHEN RANDOM() > 0.8 THEN 'ausente'
        WHEN RANDOM() > 0.9 THEN 'pendiente'
        ELSE 'confirmado'
      END
    FROM entrenamientos e
    CROSS JOIN usuarios u
    WHERE u.rol = 'jugador'
      AND e.id IN (SELECT id FROM entrenamientos LIMIT 3)
    ON CONFLICT (entrenamiento_id, jugador_id) DO NOTHING
  `);

  await client.query(`
    INSERT INTO asistencias_partidos (partido_id, jugador_id, estado)
    SELECT 
      p.id,
      u.id,
      CASE 
        WHEN RANDOM() > 0.85 THEN 'ausente'
        WHEN RANDOM() > 0.95 THEN 'pendiente'
        ELSE 'confirmado'
      END
    FROM partidos p
    CROSS JOIN usuarios u
    WHERE u.rol = 'jugador'
    ON CONFLICT (partido_id, jugador_id) DO NOTHING
  `);

  console.log("✅ Asistencias creadas");
  console.log("\n✅ Seed completado exitosamente");
  console.log("\n📧 Credenciales de prueba:");
  console.log("   Admin:   admin@futbolclub.com / Admin123!");
  console.log("   Gestor:  gestor@futbolclub.com / Gestor123!");
  console.log("   Jugador: jugador1@futbolclub.com / Jugador123!");
}
