/**
 * Seed: Datos REALES extraídos de la base de datos actual (29-nov-2025)
 * ⚠️ Contiene usuarios, jugadores y datos reales del equipo
 */

import { HashService } from "../../src/infrastructure/services/HashService.js";

const hashService = new HashService();

export async function seed(client) {
  console.log("🌱 Insertando datos REALES del equipo...");

  // Hash para usuario de prueba
  const testPassword = await hashService.hash("Test123!");

  // 1. USUARIOS REALES (16 usuarios del equipo + 1 gestor) + 1 usuario de prueba
  await client.query(
    `
    INSERT INTO usuarios (id, email, password, nombre, rol, activo, created_at) VALUES
      (1, 'fslacupula@gmail.com', '$2b$10$zX0lscxm7wM/vluFD5rEW.KZ/J16kpAacZ/rs/eJKoIe/Y1qONsOm', 'Gestor', 'gestor', true, '2025-11-27T02:40:09.058Z'),
      (2, 'ortegasanz@gmail.com', '$2b$10$t6p1jOXubuRO3Mzg3WiABeRA/p/afuX8UKysnnbmE.gKVfU.1AGom', 'Alberto Ortega', 'jugador', true, '2025-11-27T02:51:41.648Z'),
      (3, 'markgarciaga@gmail.com', '$2b$10$2Kj1txaBFZHJ4fA0tDZXT.Hsc2x/HMLK5jO5t50VZfwmSNHupczay', 'Marc García', 'jugador', true, '2025-11-27T02:52:33.551Z'),
      (4, 'victormurillo018@gmail.com', '$2b$10$ZeZ4S8t4bSFEo9gVraSWtOm21iHM1yiDWi1IB3EcXBMugN3kehK/W', 'Victor Murillo', 'jugador', true, '2025-11-27T02:52:59.760Z'),
      (5, 'richardgiralt@gmail.com', '$2b$10$mSmfEezqUdv3PcfExktylOXuF99x0AfjggGZIRBYv.xSk/kJ7UYLC', 'Richard Giralt', 'jugador', true, '2025-11-27T02:53:47.560Z'),
      (6, 'victor.zaragozabermejo@ibdglobal.com', '$2b$10$RVv/If6fFFrSwIdDvaM6SOhig2hoshZR2kRlUo06ZISk5OLu.JTxK', 'Victor Zaragoza', 'jugador', true, '2025-11-27T02:54:33.757Z'),
      (7, 'mr7@gmail.com', '$2b$10$U2aic7QCURtljtCVJw84Yub2vua8r.U3xdo/fjP6t4zoRoaJ/vQiy', 'Mario Rubio', 'jugador', true, '2025-11-27T02:55:29.258Z'),
      (8, 'alexbenedicogarcia@gmail.com', '$2b$10$fJP1IyRf6EeAERMXZUDpTOUtTgi0/.6saGqPBVZR4STKCmtESvH12', 'Alex Benedico', 'jugador', true, '2025-11-27T02:55:56.147Z'),
      (9, 'edgarcruzfernandez@gmail.com', '$2b$10$fihZZMU/3AGkeoGC5JPEv.I68KSBGHzW9lrv8WwrM.dEFf2QXpGde', 'Edgar Cruz', 'jugador', true, '2025-11-27T02:56:27.555Z'),
      (10, 'astivill10@gmail.com', '$2b$10$h.NNEU1FdCMd0E.kU2fYFORdvdy703rNPtG9T449XQnsqIABzpLZa', 'Jordi Astivill', 'jugador', true, '2025-11-27T02:57:04.255Z'),
      (11, 'polmartinez16@gmail.com', '$2b$10$qKbu1PuViO526e5Nial6lufF.RUwfPsp1HQh1GXuCiPRoXOSd93uC', 'Pol Martínez', 'jugador', true, '2025-11-27T02:57:31.548Z'),
      (12, 'alex.gomez.sans@gmail.com', '$2b$10$All72FE4GMtihSF7kBholOmnpO.LD/nBeoMjnBjG8juXNhCEzqUdm', 'Alex Gómez', 'jugador', true, '2025-11-27T02:58:04.563Z'),
      (13, 'sopenagonzalez@gmail.com', '$2b$10$DeOtsE0fCtelO6ZHLB9tvuC3LX2LrZnWLAKQ.RSsCmp.QePwNxYO2', 'Albert Sopena', 'jugador', true, '2025-11-27T02:58:56.045Z'),
      (14, 'joel.malagon.kubala@gmail.com', '$2b$10$oNdnxaazA.g0JQM30hz6uOn3FBTsNzn0AvX5/HTMTy/8pu.mZzvIK', 'Joel Malagón', 'jugador', true, '2025-11-27T02:59:34.053Z'),
      (15, 'joan.astivill93@gmail.com', '$2b$10$66ZUk.6QNPp71XgkPHs0eet6VtGmy/g0fju5q6ycS7ElTUJ2.mQnu', 'Joan Astivill', 'jugador', true, '2025-11-27T03:00:04.856Z'),
      (16, 'fg17@gmail.com', '$2b$10$36wNe79CU84OWTrq5ki3oO0AoJkMBOIUm75FYP51QYcR1e5gC2oYu', 'Fran González', 'jugador', true, '2025-11-27T03:01:48.749Z'),
      (99, 'test@gestor.com', $1, 'Usuario de Prueba', 'gestor', true, NOW())
    ON CONFLICT (email) DO NOTHING
  `,
    [testPassword]
  );

  console.log("✅ 16 usuarios reales + 1 de prueba creados");

  // 2. POSICIONES (estructura del equipo de fútbol sala)
  await client.query(`
    INSERT INTO posiciones (id, nombre, abreviatura) VALUES
      (1, 'Portero', 'POR'),
      (2, 'Cierre', 'CIE'),
      (3, 'Ala', 'ALA'),
      (4, 'Pivot', 'PIV'),
      (5, 'Ala-Pivot', 'AP'),
      (6, 'Extra', 'EXT'),
      (7, 'Staff', 'STF')
    ON CONFLICT (id) DO NOTHING
  `);

  console.log("✅ 7 posiciones creadas");

  // 3. JUGADORES REALES (15 perfiles de jugador)
  await client.query(`
    INSERT INTO jugadores (id, usuario_id, posicion_id, numero_dorsal, alias, created_at) VALUES
      (1, 2, 7, NULL, 'Burrito', '2025-11-27T02:51:41.654Z'),
      (2, 3, 7, NULL, 'Marc', '2025-11-27T02:52:33.556Z'),
      (3, 4, 7, NULL, 'Murillo', '2025-11-27T02:52:59.763Z'),
      (4, 5, 1, 24, 'Richard', '2025-11-27T02:53:47.647Z'),
      (5, 6, 1, 1, 'Pipa', '2025-11-27T02:54:33.760Z'),
      (6, 7, 3, 7, 'Mario', '2025-11-27T02:55:29.261Z'),
      (7, 8, 3, 6, 'Bene', '2025-11-27T02:55:56.150Z'),
      (8, 9, 5, 8, 'Oxi', '2025-11-27T02:56:27.558Z'),
      (9, 10, 4, 9, 'Alemán', '2025-11-27T02:57:04.257Z'),
      (10, 11, 2, 10, 'Pol', '2025-11-27T02:57:31.551Z'),
      (11, 12, 4, 11, 'Tosco', '2025-11-27T02:58:04.646Z'),
      (12, 13, 2, 14, 'Sopen', '2025-11-27T02:58:56.049Z'),
      (13, 14, 5, 28, 'Tanketa', '2025-11-27T02:59:34.056Z'),
      (14, 15, 3, 21, 'Joan', '2025-11-27T03:00:04.861Z'),
      (15, 16, 3, 17, 'Fran', '2025-11-27T03:01:48.752Z')
    ON CONFLICT (usuario_id) DO NOTHING
  `);

  console.log("✅ 15 perfiles de jugador creados");

  // 4. MOTIVOS DE AUSENCIA
  await client.query(`
    INSERT INTO motivos_ausencia (id, motivo, activo, created_at) VALUES
      (1, 'Trabajo', true, '2025-11-27T02:33:29.125Z'),
      (2, 'Lesión', true, '2025-11-27T02:33:29.125Z'),
      (3, 'Enfermedad', true, '2025-11-27T02:33:29.125Z'),
      (4, 'Viaje', true, '2025-11-27T02:33:29.125Z'),
      (5, 'Personal', true, '2025-11-27T02:33:29.125Z'),
      (6, 'Otro', true, '2025-11-27T02:33:29.125Z')
    ON CONFLICT (id) DO NOTHING
  `);

  console.log("✅ 6 motivos de ausencia creados");

  // 5. PARTIDOS REALES
  await client.query(`
    INSERT INTO partidos (id, fecha_hora, rival, lugar, tipo, creado_por, created_at) VALUES
      (1, '2025-11-29T18:30:00.000Z', 'Polinyá "B"', 'Polinyá', 'liga', 1, '2025-11-27T03:06:52.945Z')
    ON CONFLICT (id) DO NOTHING
  `);

  console.log("✅ 1 partido real creado");

  // 6. ENTRENAMIENTOS REALES
  await client.query(`
    INSERT INTO entrenamientos (id, fecha_hora, lugar, duracion_minutos, creado_por, created_at) VALUES
      (3, '2025-11-25T20:00:00.000Z', 'Pabellón 1 Sant Fost', 90, 1, '2025-11-27T03:03:03.184Z'),
      (4, '2025-11-27T18:30:00.000Z', 'Pabellón 1', 90, 1, '2025-11-27T03:04:05.146Z')
    ON CONFLICT (id) DO NOTHING
  `);

  console.log("✅ 2 entrenamientos reales creados");

  // 7. ASISTENCIAS A PARTIDOS (15 respuestas reales al partido del 29-nov)
  await client.query(`
    INSERT INTO asistencias_partidos (id, partido_id, jugador_id, estado, motivo_ausencia_id, fecha_respuesta) VALUES
      (1, 1, 2, 'confirmado', NULL, '2025-11-27T03:06:56.745Z'),
      (2, 1, 3, 'confirmado', NULL, '2025-11-28T10:33:51.078Z'),
      (3, 1, 4, 'confirmado', NULL, '2025-11-28T22:40:15.927Z'),
      (4, 1, 6, 'ausente', 5, '2025-11-28T22:40:33.689Z'),
      (5, 1, 8, 'confirmado', NULL, '2025-11-27T03:07:55.343Z'),
      (6, 1, 7, 'ausente', 6, '2025-11-27T03:08:04.469Z'),
      (7, 1, 9, 'confirmado', NULL, '2025-11-27T03:07:43.984Z'),
      (8, 1, 10, 'confirmado', NULL, '2025-11-27T03:07:46.395Z'),
      (9, 1, 11, 'confirmado', NULL, '2025-11-27T03:07:34.722Z'),
      (10, 1, 12, 'ausente', 1, '2025-11-28T22:40:21.652Z'),
      (11, 1, 13, 'confirmado', NULL, '2025-11-27T03:07:38.209Z'),
      (12, 1, 16, 'confirmado', NULL, '2025-11-27T03:07:20.254Z'),
      (13, 1, 15, 'confirmado', NULL, '2025-11-27T03:07:44.856Z'),
      (14, 1, 5, 'confirmado', NULL, '2025-11-27T03:07:36.254Z'),
      (15, 1, 14, 'ausente', 5, '2025-11-28T22:40:26.980Z')
    ON CONFLICT (id) DO NOTHING
  `);

  console.log("✅ 15 asistencias a partidos creadas");

  // 8. ASISTENCIAS A ENTRENAMIENTOS (30 respuestas del 25-nov + 16 del 27-nov)
  await client.query(`
    INSERT INTO asistencias_entrenamientos (id, entrenamiento_id, jugador_id, estado, motivo_ausencia_id, fecha_respuesta) VALUES
      -- Entrenamiento 25-nov
      (16, 3, 2, 'confirmado', NULL, '2025-11-27T03:03:11.070Z'),
      (17, 3, 3, 'ausente', 5, '2025-11-27T03:03:16.143Z'),
      (18, 3, 4, 'confirmado', NULL, '2025-11-27T03:03:18.131Z'),
      (19, 3, 6, 'ausente', 6, '2025-11-27T03:03:39.763Z'),
      (20, 3, 8, 'confirmado', NULL, '2025-11-27T03:03:22.587Z'),
      (21, 3, 7, 'ausente', 5, '2025-11-27T03:03:34.306Z'),
      (22, 3, 9, 'confirmado', NULL, '2025-11-27T03:03:26.971Z'),
      (23, 3, 10, 'confirmado', NULL, '2025-11-27T03:03:29.722Z'),
      (24, 3, 11, 'confirmado', NULL, '2025-11-27T03:03:35.820Z'),
      (25, 3, 12, 'ausente', 1, '2025-11-27T03:03:25.363Z'),
      (26, 3, 13, 'confirmado', NULL, '2025-11-27T03:03:21.708Z'),
      (27, 3, 16, 'confirmado', NULL, '2025-11-27T03:03:27.929Z'),
      (28, 3, 15, 'confirmado', NULL, '2025-11-27T03:03:28.563Z'),
      (29, 3, 5, 'confirmado', NULL, '2025-11-27T03:03:36.846Z'),
      (30, 3, 14, 'confirmado', NULL, '2025-11-27T03:03:30.555Z'),
      -- Entrenamiento 27-nov
      (47, 4, 2, 'ausente', 3, '2025-11-27T03:14:58.453Z'),
      (48, 4, 3, 'confirmado', NULL, '2025-11-27T03:04:12.377Z'),
      (49, 4, 4, 'confirmado', NULL, '2025-11-27T03:06:02.063Z'),
      (50, 4, 6, 'pendiente', NULL, '2025-11-27T03:04:05.163Z'),
      (51, 4, 8, 'ausente', 3, '2025-11-27T18:38:06.366Z'),
      (52, 4, 7, 'confirmado', NULL, '2025-11-27T03:04:55.705Z'),
      (53, 4, 9, 'confirmado', NULL, '2025-11-27T03:05:44.558Z'),
      (54, 4, 10, 'confirmado', NULL, '2025-11-27T03:05:46.630Z'),
      (55, 4, 11, 'confirmado', NULL, '2025-11-27T03:05:24.218Z'),
      (56, 4, 12, 'confirmado', NULL, '2025-11-27T03:04:51.748Z'),
      (57, 4, 13, 'confirmado', NULL, '2025-11-27T03:05:35.668Z'),
      (58, 4, 16, 'confirmado', NULL, '2025-11-27T03:04:36.868Z'),
      (59, 4, 15, 'confirmado', NULL, '2025-11-27T03:05:46.044Z'),
      (60, 4, 5, 'confirmado', NULL, '2025-11-27T03:05:25.047Z'),
      (61, 4, 14, 'confirmado', NULL, '2025-11-27T03:04:38.574Z')
    ON CONFLICT (id) DO NOTHING
  `);

  console.log("✅ 46 asistencias a entrenamientos creadas (2 eventos)");

  // Actualizar secuencias de IDs
  await client.query(`
    SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
    SELECT setval('jugadores_id_seq', (SELECT MAX(id) FROM jugadores));
    SELECT setval('posiciones_id_seq', (SELECT MAX(id) FROM posiciones));
    SELECT setval('motivos_ausencia_id_seq', (SELECT MAX(id) FROM motivos_ausencia));
    SELECT setval('partidos_id_seq', (SELECT MAX(id) FROM partidos));
    SELECT setval('entrenamientos_id_seq', (SELECT MAX(id) FROM entrenamientos));
    SELECT setval('asistencias_partidos_id_seq', (SELECT MAX(id) FROM asistencias_partidos));
    SELECT setval('asistencias_entrenamientos_id_seq', (SELECT MAX(id) FROM asistencias_entrenamientos));
  `);

  console.log("✅ Secuencias actualizadas");

  console.log("\n📊 RESUMEN DE DATOS REALES:");
  console.log("   • 16 usuarios reales + 1 de prueba (17 total)");
  console.log("   • 7 posiciones de fútbol sala");
  console.log("   • 15 perfiles completos de jugador");
  console.log("   • 6 motivos de ausencia");
  console.log("   • 1 partido próximo (29-nov vs Polinyá)");
  console.log("   • 2 entrenamientos (25 y 27 de noviembre)");
  console.log("   • 61 registros de asistencia reales");
  console.log("\n🔑 CREDENCIALES DE PRUEBA:");
  console.log("   Email: test@gestor.com");
  console.log("   Password: Test123!");
  console.log(
    "\n⚠️  Las contraseñas de los usuarios reales están hasheadas - usar las originales"
  );
}
