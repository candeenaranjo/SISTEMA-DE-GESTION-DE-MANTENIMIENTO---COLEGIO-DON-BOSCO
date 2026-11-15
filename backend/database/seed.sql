-- ============================================================
-- seed.sql - Sistema de Gestión de Mantenimiento - Colegio Don Bosco
-- Ejecutar después de schema.sql (con los 2 fixes de arriba).
--   psql -U postgres -d donbosco_mantenimiento -f seed.sql
-- ============================================================
-- \encoding UTF8

TRUNCATE TABLE notificaciones, compras, historial, tareas, requerimientos,
  personal_externo, usuarios, especialidades, sectores, cargos, roles, categorias
  RESTART IDENTITY CASCADE;

-- ------------------------------------------------------------
-- Catálogos
-- ------------------------------------------------------------
INSERT INTO roles (id_rol, nombre) OVERRIDING SYSTEM VALUE VALUES
  (1, 'ordenanza'),
  (2, 'jefeMantenimiento'),
  (3, 'directivo');

INSERT INTO cargos (id_cargo, nombre) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Rector'),
  (2, 'Vicerrector'),
  (3, 'Secretaria'),
  (4, 'Director de Estudios'),
  (5, 'Administrador'),
  (6, 'Secretario'),
  (7, 'Coordinador de Pastoral');

INSERT INTO sectores (id_sector, nombre) OVERRIDING SYSTEM VALUE VALUES
  (1,  'Aula 8'),
  (2,  'Aula 12'),
  (3,  'Aula 15'),
  (4,  'Baño Pabellón B'),
  (5,  'Patio central'),
  (6,  'Laboratorio 3'),
  (7,  'Laboratorio de informática'),
  (8,  'Dirección'),
  (9,  'Pasillo principal'),
  (10, 'Biblioteca'),
  (11, 'Gimnasio'),
  (12, 'Cocina'),
  (13, 'Pabellón B (Aula 12 - Pasillo)'),
  (14, 'Pabellón C - Cocina'),
  (15, 'Pabellón B - Baño'),
  (16, 'Pabellón B'),
  (17, 'Pabellón C'),
  (18, 'Capilla'),
  (19, 'Salón de actos'),
  (20, 'Otro');

INSERT INTO especialidades (id_especialidad, nombre) OVERRIDING SYSTEM VALUE VALUES
  (1,  'Electricista'),
  (2,  'Plomería'),
  (3,  'Albañilería'),
  (4,  'Pintura'),
  (5,  'Carpintería'),
  (6,  'Gasista'),
  (7,  'Herrería'),
  (8,  'Climatización'),
  (9,  'Mantenimiento general'),
  (10, 'Vidriería'),
  (11, 'Cerrajería'),
  (12, 'Jardinería');

INSERT INTO categorias (id_categoria, nombre) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Plomería'),
  (2, 'Electricidad'),
  (3, 'Pintura'),
  (4, 'Carpintería'),
  (5, 'Albañilería'),
  (6, 'Climatización'),
  (7, 'Limpieza'),
  (8, 'Gas'),
  (9, 'Cerrajería'),
  (10,'Otros');

-- ------------------------------------------------------------
-- Usuarios (hash bcrypt de "1234")
-- ------------------------------------------------------------
INSERT INTO usuarios (
  id_usuario, nombre_usuario, nombre, apellido, dni, email, password_hash,
  id_rol, telefono, id_cargo, activo, created_at
) OVERRIDING SYSTEM VALUE VALUES
  -- Ordenanzas
  (1,  'atorres',       'Ana',      'Torres',      '30123456', 'atorres@donbosco.org.ar',       '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4551234', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (2,  'lfernandez',    'Luis',     'Fernández',   '31234567', 'lfernandez@donbosco.org.ar',    '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4552345', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (3,  'smartinez',     'Sofía',    'Martínez',    '32345678', 'smartinez@donbosco.org.ar',     '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4553456', NULL, FALSE, '2025-01-10 08:00:00-03'),
  (7,  'laurafernandez', 'Laura',   'Fernández',   '33456789', 'laurafernandez@donbosco.org.ar', '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4557890', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (8,  'cmendez',       'Carlos',   'Méndez',      '34567890', 'cmendez@donbosco.org.ar',       '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4558901', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (10, 'pruiz',         'Pedro',    'Ruiz',        '35678901', 'pruiz@donbosco.org.ar',         '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4569012', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (12, 'msilva',        'Matías',   'Silva',       '36789012', 'msilva@donbosco.org.ar',        '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4560123', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (13, 'jtorres',       'Juan',     'Torres',      '37890123', 'jtorres@donbosco.org.ar',       '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4561234', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (14, 'mgonzalez',     'María',    'González',    '38901234', 'mgonzalez@donbosco.org.ar',     '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4562345', NULL, TRUE,  '2025-01-10 08:00:00-03'),
  (15, 'rcastro',       'Romina',   'Castro',      '39123456', 'rcastro@donbosco.org.ar',       '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 1, '266 4563456', NULL, TRUE,  '2025-02-15 08:00:00-03'),

  -- Directivos
  (4,  'cperez',        'Carlos',   'Pérez',       '20123456', 'cperez@donbosco.org.ar',        '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 1, TRUE,  '2025-01-10 08:00:00-03'),
  (5,  'mgomez',        'María',    'Gómez',       '21234567', 'mgomez@donbosco.org.ar',        '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 3, TRUE,  '2025-01-10 08:00:00-03'),
  (9,  'jvillar',       'Jorge',    'Villar',      '23456789', 'jvillar@donbosco.org.ar',       '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 6, TRUE,  '2025-01-10 08:00:00-03'),
  (11, 'lgomez',        'Lucía',    'Gómez',       '24567890', 'lgomez@donbosco.org.ar',        '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 3, TRUE,  '2025-01-10 08:00:00-03'),
  (16, 'srodriguez',    'Silvia',   'Rodríguez',   '25678901', 'srodriguez@donbosco.org.ar',    '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 3, NULL, 2, TRUE,  '2025-02-20 08:00:00-03'),

  -- Jefes de Mantenimiento
  (6,  'jrodriguez',    'Juan',     'Rodríguez',   '22345678', 'jrodriguez@donbosco.org.ar',    '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 2, NULL, NULL, TRUE, '2025-01-10 08:00:00-03'),
  (17, 'mbenitez',      'Marcos',   'Benítez',     '26789012', 'mbenitez@donbosco.org.ar',      '$2b$10$MdAWYQmY/Ad3ejF6JByxHORzZfhywigohgRnzU0r17CECKem0UBTm', 2, NULL, NULL, TRUE, '2025-03-01 08:00:00-03');

-- ------------------------------------------------------------
-- Personal externo (todos con DNI)
-- ------------------------------------------------------------
INSERT INTO personal_externo (
  id_personal, nombre, apellido, dni, email, telefono, id_especialidad,
  matricula, genero, observaciones, activo, created_at
) OVERRIDING SYSTEM VALUE VALUES
  (1, 'Juan Carlos', 'Gómez',     '40111222', 'jc.gomez@mail.com',     '+54 9 2664 12-3456', 1,  'ELEC-001',  'M', NULL, TRUE,  '2025-02-01 09:00:00-03'),
  (2, 'María Laura', 'Torres',    '40222333', 'ml.torres@mail.com',    '+54 9 2664 22-3344', 2,  'PLOM-014',  'F', NULL, TRUE,  '2025-02-01 09:00:00-03'),
  (3, 'Ramiro',      'Sánchez',   '40333444', NULL,                    '+54 9 2664 33-7788', 3,  'ALB-007',   'M', NULL, TRUE,  '2025-02-01 09:00:00-03'),
  (4, 'Fernando',    'Vega',      '40444555', NULL,                    '+54 9 2664 44-5566', 4,  NULL,        'M', NULL, TRUE,  '2025-02-01 09:00:00-03'),
  (5, 'Lucía',       'Rojas',     '40555666', 'l.rojas@mail.com',      '+54 9 2664 55-4433', 5,  'CARP-021',  'F', NULL, TRUE,  '2025-02-01 09:00:00-03'),
  (6, 'Pablo',       'Álvarez',   '40666777', NULL,                    '+54 9 2664 66-2211', 9,  NULL,        'M', NULL, TRUE,  '2025-02-01 09:00:00-03'),
  (7, 'Diego',       'Martínez',  '40777888', NULL,                    '+54 9 2664 77-8899', 6,  'GAS-003',   'M', 'Baja por incumplimiento', FALSE, '2025-02-01 09:00:00-03'),
  (8, 'Sofía',       'Gutiérrez', '40888999', NULL,                    '+54 9 2664 88-6677', 7,  'HERR-009',  'F', 'Baja por mudanza',        FALSE, '2025-02-01 09:00:00-03'),
  (9, 'ClimaSur',    'S.A.',      '309999999','contacto@climasur.com', '+54 9 2664 98-7654', 8,  'CLIMA-002', NULL,'Empresa de climatización', TRUE, '2025-02-01 09:00:00-03'),
  (10,'Alejandro',   'Ponce',     '41111000', NULL,                    '+54 9 2664 11-2233', 10, 'VID-004',   'M', NULL, TRUE,  '2025-03-10 09:00:00-03'),
  (11,'Gabriela',    'Núñez',     '41222111', NULL,                    '+54 9 2664 21-3344', 11, 'CERR-005',  'F', NULL, TRUE,  '2025-03-10 09:00:00-03'),
  (12,'Sergio',      'Luna',      '41333222', NULL,                    '+54 9 2664 31-4455', 12, 'JARD-001',  'M', NULL, TRUE,  '2025-03-10 09:00:00-03');

-- ------------------------------------------------------------
-- Requerimientos
--   Estado coherente con la tarea viva:
--     sin tarea viva o tarea pendiente  -> 'pendiente'
--     tarea en-proceso/demorada/finalizada/rechazada -> 'asignado'
--     tarea aprobada                    -> 'resuelto'
--     todas las tareas canceladas       -> 'pendiente'
-- ------------------------------------------------------------
INSERT INTO requerimientos (
  id_requerimiento, id_categoria, descripcion, id_sector, imagen,
  id_usuario, estado, activo, fecha_emision
) OVERRIDING SYSTEM VALUE VALUES
  (342, 1, 'Se observa filtración de agua en el techo del pabellón B, principalmente en la zona del pasillo. En días de lluvia el agua se filtra hacia el interior y afecta las luminarias y el cielorraso.',
        13, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800', 7,  'asignado', TRUE, TO_TIMESTAMP('25/06/2025 09:12','DD/MM/YYYY HH24:MI')),
  (341, 2, 'La luz de emergencia del pasillo principal no enciende. Se verificó que no es problema del tubo LED.',
        9,  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800', 8,  'asignado', TRUE, TO_TIMESTAMP('24/06/2025 08:47','DD/MM/YYYY HH24:MI')),
  (340, 4, 'La puerta del aula 12 está dañada y no cierra correctamente. Se necesita revisar la cerradura y ajustar la bisagra.',
        2,  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 7,  'asignado', TRUE, TO_TIMESTAMP('24/06/2025 16:30','DD/MM/YYYY HH24:MI')),
  (339, 6, 'El aire acondicionado del laboratorio de informática no enfría. Hace ruido extraño al encender.',
        7,  NULL, 9,  'asignado', TRUE, TO_TIMESTAMP('24/06/2025 14:22','DD/MM/YYYY HH24:MI')),
  (338, 3, 'Se observa pintura descascarada en la pared del patio. Necesita lijado y repintado.',
        5,  'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800', 1,  'asignado', TRUE, TO_TIMESTAMP('24/06/2025 11:15','DD/MM/YYYY HH24:MI')),
  (337, 6, 'La calefacción del aula 8 no prende. Se verificó que el termostato está en buen estado.',
        1,  NULL, 10, 'asignado', TRUE, TO_TIMESTAMP('23/06/2025 17:40','DD/MM/YYYY HH24:MI')),
  (336, 8, 'Se siente olor a gas en la cocina del pabellón C. Se recomienda revisar las conexiones de la cocina.',
        14, 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800', 11, 'pendiente', TRUE, TO_TIMESTAMP('23/06/2025 12:18','DD/MM/YYYY HH24:MI')),
  (335, 2, 'La toma del laboratorio 3 está suelta y hace mal contacto. Puede ser peligroso.',
        6,  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800', 12, 'resuelto', TRUE, TO_TIMESTAMP('22/06/2025 10:05','DD/MM/YYYY HH24:MI')),
  -- más requerimientos de prueba
  (343, 5, 'Grieta en la pared del aula 15, lado ventana. Se agranda con el tiempo.',
        3,  NULL, 14, 'pendiente', TRUE, TO_TIMESTAMP('26/06/2025 08:10','DD/MM/YYYY HH24:MI')),
  (345, 2, 'Fluorescentes del salón de actos parpadean. Son 4 tubos.',
        19, NULL, 1,  'asignado', TRUE, TO_TIMESTAMP('26/06/2025 10:40','DD/MM/YYYY HH24:MI')),
  (346, 1, 'Pérdida de agua en el baño del pabellón B. El inodoro no para de cargar.',
        15, NULL, 2,  'asignado', TRUE, TO_TIMESTAMP('26/06/2025 11:05','DD/MM/YYYY HH24:MI')),
  (347, 3, 'Repintar la capilla: humedad en la pared del altar.',
        18, NULL, 13, 'asignado', TRUE, TO_TIMESTAMP('26/06/2025 12:00','DD/MM/YYYY HH24:MI')),
  (348, 7, 'Basura acumulada en el patio central luego del acto del 25 de mayo.',
        5,  NULL, 7,  'resuelto', TRUE, TO_TIMESTAMP('25/06/2025 16:30','DD/MM/YYYY HH24:MI'));

-- ------------------------------------------------------------
-- Tareas
-- ------------------------------------------------------------
INSERT INTO tareas (
  id_tarea, id_requerimiento, prioridad, estado, fecha_creacion,
  fecha_inicio, fecha_fin, observaciones, id_directivo, id_responsable,
  id_personal_externo, id_tarea_origen, costo_personal_externo
) OVERRIDING SYSTEM VALUE VALUES
  -- 128: req 342 filtración -> en-proceso, interno (Carlos Méndez)
  (128, 342, 'alta',  'en-proceso',
   TO_TIMESTAMP('25/06/2025 09:12','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('25/06/2025 10:30','DD/MM/YYYY HH24:MI'),
   NULL, 'Se necesita cerrar el paso de agua antes de reparar.', NULL, 8, NULL, NULL, NULL),

  -- 127: req 341 luz emergencia -> finalizada, externo (Gómez)
  (127, 341, 'media', 'finalizada',
   TO_TIMESTAMP('24/06/2025 08:47','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('24/06/2025 10:15','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('24/06/2025 14:00','DD/MM/YYYY HH24:MI'),
   'Cambio de luminaria completo.', NULL, NULL, 1, NULL, 40000.00),

  -- 126: req 340 puerta aula 12 -> en-proceso, interno (Juan Torres)
  (126, 340, 'alta',  'en-proceso',
   TO_TIMESTAMP('24/06/2025 16:30','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('25/06/2025 08:00','DD/MM/YYYY HH24:MI'),
   NULL, 'Se retiró la cerradura rota para su reemplazo.', NULL, 13, NULL, NULL, NULL),

  -- 125: req 339 aire lab -> en-proceso, externo ClimaSur
  (125, 339, 'media', 'en-proceso',
   TO_TIMESTAMP('24/06/2025 14:22','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('25/06/2025 09:00','DD/MM/YYYY HH24:MI'),
   NULL, 'ClimaSur diagnosticó y pidió repuesto.', NULL, NULL, 9, NULL, 35000.00),

  -- 124: req 338 pintura patio -> demorada por lluvia, interno (Laura Fernández)
  (124, 338, 'baja',  'demorada',
   TO_TIMESTAMP('24/06/2025 11:15','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('24/06/2025 13:00','DD/MM/YYYY HH24:MI'),
   NULL, 'Se demora por lluvia. Se retomará cuando el clima mejore.', NULL, 7, NULL, NULL, NULL),

  -- 123: req 337 calefacción aula 8 -> finalizada, interno (Pedro Ruiz), Directivo aprueba luego
  (123, 337, 'alta',  'finalizada',
   TO_TIMESTAMP('23/06/2025 17:40','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('24/06/2025 09:00','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('24/06/2025 15:00','DD/MM/YYYY HH24:MI'),
   'Revisión de caldera completa.', NULL, 10, NULL, NULL, NULL),

  -- 121: req 335 toma eléctrica -> aprobada, interno (Juan Torres), Directivo (Carlos Pérez)
  (121, 335, 'media', 'aprobada',
   TO_TIMESTAMP('22/06/2025 10:05','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('22/06/2025 11:30','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('22/06/2025 16:30','DD/MM/YYYY HH24:MI'),
   'Trabajo conforme.', 4, 13, NULL, NULL, NULL),

  -- 131: req 345 fluorescentes salón de actos -> en-proceso, interno (Ana Torres)
  (131, 345, 'media', 'en-proceso',
   TO_TIMESTAMP('26/06/2025 10:40','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('26/06/2025 11:30','DD/MM/YYYY HH24:MI'),
   NULL, 'Se están cambiando los tubos.', NULL, 1, NULL, NULL, NULL),

  -- 133: req 347 repintar capilla -> en-proceso, externo (Ponce)
  (133, 347, 'baja',  'en-proceso',
   TO_TIMESTAMP('26/06/2025 12:00','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('26/06/2025 13:00','DD/MM/YYYY HH24:MI'),
   NULL, 'Se lijó la pared y se aplicó sellador.', NULL, NULL, 10, NULL, 25000.00),

  -- 134: req 348 basura patio -> aprobada, interno (Laura Fernández), Directivo (María Gómez)
  (134, 348, 'baja',  'aprobada',
   TO_TIMESTAMP('25/06/2025 16:30','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('25/06/2025 17:00','DD/MM/YYYY HH24:MI'),
   TO_TIMESTAMP('25/06/2025 18:30','DD/MM/YYYY HH24:MI'),
   'Limpieza completa.', 5, 7, NULL, NULL, NULL);

-- ------------------------------------------------------------
-- Historial de auditoría
-- ------------------------------------------------------------
INSERT INTO historial (id_tarea, estado, motivo, id_usuario, fecha_hora) VALUES
  -- 128
  (128, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0342', 6,  TO_TIMESTAMP('25/06/2025 09:12','DD/MM/YYYY HH24:MI')),
  (128, 'en-proceso', 'El técnico Carlos Méndez inició la reparación.',  8,  TO_TIMESTAMP('25/06/2025 10:30','DD/MM/YYYY HH24:MI')),
  -- 127
  (127, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0341', 6,  TO_TIMESTAMP('24/06/2025 08:47','DD/MM/YYYY HH24:MI')),
  (127, 'en-proceso', 'Juan Carlos Gómez inició el cambio de luminaria.', 6,  TO_TIMESTAMP('24/06/2025 10:15','DD/MM/YYYY HH24:MI')),
  (127, 'finalizada', 'El personal externo completó el cambio de luminaria.', 6, TO_TIMESTAMP('24/06/2025 14:00','DD/MM/YYYY HH24:MI')),
  -- 126
  (126, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0340', 6,  TO_TIMESTAMP('24/06/2025 16:30','DD/MM/YYYY HH24:MI')),
  (126, 'en-proceso', 'Se retiró la cerradura rota para su reemplazo.',   13, TO_TIMESTAMP('25/06/2025 08:00','DD/MM/YYYY HH24:MI')),
  -- 125
  (125, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0339', 6,  TO_TIMESTAMP('24/06/2025 14:22','DD/MM/YYYY HH24:MI')),
  (125, 'en-proceso', 'ClimaSur S.A. se presentó para revisar el equipo.', 6, TO_TIMESTAMP('25/06/2025 09:00','DD/MM/YYYY HH24:MI')),
  -- 124
  (124, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0338', 6,  TO_TIMESTAMP('24/06/2025 11:15','DD/MM/YYYY HH24:MI')),
  (124, 'en-proceso', 'Se inició la preparación de la superficie.',       7,  TO_TIMESTAMP('24/06/2025 13:00','DD/MM/YYYY HH24:MI')),
  (124, 'demorada',   'Se demora por lluvia. Se retomará cuando el clima mejore.', 7, TO_TIMESTAMP('25/06/2025 08:30','DD/MM/YYYY HH24:MI')),
  -- 123
  (123, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0337', 6,  TO_TIMESTAMP('23/06/2025 17:40','DD/MM/YYYY HH24:MI')),
  (123, 'en-proceso', 'Pedro Ruiz comenzó la revisión de la caldera.',   10, TO_TIMESTAMP('24/06/2025 09:00','DD/MM/YYYY HH24:MI')),
  (123, 'finalizada', 'Tarea finalizada. Pendiente de evaluación del Directivo.', 10, TO_TIMESTAMP('24/06/2025 15:00','DD/MM/YYYY HH24:MI')),
  -- 121 (aprobada)
  (121, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0335', 6,  TO_TIMESTAMP('22/06/2025 10:05','DD/MM/YYYY HH24:MI')),
  (121, 'en-proceso', 'Juan Torres inició el reemplazo de la toma.',      13, TO_TIMESTAMP('22/06/2025 11:30','DD/MM/YYYY HH24:MI')),
  (121, 'finalizada', 'Tarea finalizada. Pendiente de evaluación del Directivo.', 13, TO_TIMESTAMP('22/06/2025 16:30','DD/MM/YYYY HH24:MI')),
  (121, 'aprobada',   'El Directivo aprobó la tarea. Trabajo conforme.',  4,  TO_TIMESTAMP('23/06/2025 09:15','DD/MM/YYYY HH24:MI')),
  -- 131
  (131, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0345', 6,  TO_TIMESTAMP('26/06/2025 10:40','DD/MM/YYYY HH24:MI')),
  (131, 'en-proceso', 'Ana Torres inició el recambio de tubos.',          1,  TO_TIMESTAMP('26/06/2025 11:30','DD/MM/YYYY HH24:MI')),
  -- 133
  (133, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0347', 6,  TO_TIMESTAMP('26/06/2025 12:00','DD/MM/YYYY HH24:MI')),
  (133, 'en-proceso', 'Alejandro Ponce inició los trabajos de pintura.',  6,  TO_TIMESTAMP('26/06/2025 13:00','DD/MM/YYYY HH24:MI')),
  -- 134
  (134, 'pendiente',  'Tarea creada a partir del requerimiento REQ-0348', 6,  TO_TIMESTAMP('25/06/2025 16:30','DD/MM/YYYY HH24:MI')),
  (134, 'en-proceso', 'Laura Fernández inició la limpieza.',              7,  TO_TIMESTAMP('25/06/2025 17:00','DD/MM/YYYY HH24:MI')),
  (134, 'finalizada', 'Limpieza completa.',                               7,  TO_TIMESTAMP('25/06/2025 18:30','DD/MM/YYYY HH24:MI')),
  (134, 'aprobada',   'El Directivo aprobó la tarea.',                    5,  TO_TIMESTAMP('26/06/2025 09:00','DD/MM/YYYY HH24:MI'));

-- ------------------------------------------------------------
-- Compras
-- ------------------------------------------------------------
INSERT INTO compras (id_tarea, monto, detalle, categoria, fecha, factura) VALUES
  (126, 12450.00, 'Cerradura de embutir y juego de bisagras.',   'materiales', TO_TIMESTAMP('25/06/2025 08:30','DD/MM/YYYY HH24:MI'), NULL),
  (127, 12500.00, 'Luminaria LED de emergencia 20W.',            'materiales', TO_TIMESTAMP('24/06/2025 09:30','DD/MM/YYYY HH24:MI'), NULL),
  (124,  8900.00, 'Pintura exterior + rodillo.',                 'materiales', TO_TIMESTAMP('24/06/2025 12:00','DD/MM/YYYY HH24:MI'), NULL),
  (121,  4300.00, 'Toma Schuko + cable.',                        'materiales', TO_TIMESTAMP('22/06/2025 11:00','DD/MM/YYYY HH24:MI'), NULL),
  (125, 15000.00, 'Visita técnica de ClimaSur para diagnóstico.', 'servicios', TO_TIMESTAMP('25/06/2025 10:00','DD/MM/YYYY HH24:MI'), NULL),
  (133, 25000.00, 'Sellador, látex y pinceles.',                 'materiales', TO_TIMESTAMP('26/06/2025 13:30','DD/MM/YYYY HH24:MI'), NULL),
  (134,  6500.00, 'Bolsas de residuos y guantes.',               'materiales', TO_TIMESTAMP('25/06/2025 17:10','DD/MM/YYYY HH24:MI'), NULL);

-- ------------------------------------------------------------
-- Notificaciones
-- ------------------------------------------------------------
INSERT INTO notificaciones (
  id_usuario, id_requerimiento, id_tarea, tipo, titulo, mensaje, leida, created_at
) VALUES
  (6, 342, NULL, 'requerimiento', 'Nuevo requerimiento',
   'Se emitió el requerimiento REQ-0342: Filtración en techo - Pabellón B.',
   FALSE, TO_TIMESTAMP('25/06/2025 09:12','DD/MM/YYYY HH24:MI')),
  (6, 341, NULL, 'requerimiento', 'Nuevo requerimiento',
   'Se emitió el requerimiento REQ-0341: Luz de emergencia sin funcionar.',
   TRUE,  TO_TIMESTAMP('24/06/2025 08:47','DD/MM/YYYY HH24:MI')),
  (4, NULL, 123, 'tarea-finalizada', 'Tarea finalizada',
   'La tarea T-0123: Revisión de caldera pasó a finalizada y espera tu aprobación.',
   FALSE, TO_TIMESTAMP('24/06/2025 15:00','DD/MM/YYYY HH24:MI')),
  (6, NULL, 121, 'tarea-aprobada', 'Tarea aprobada',
   'El Directivo aprobó la tarea T-0121: Reemplazo de toma eléctrica.',
   FALSE, TO_TIMESTAMP('23/06/2025 09:15','DD/MM/YYYY HH24:MI')),
  (5, NULL, 127, 'tarea-finalizada', 'Tarea finalizada',
   'La tarea T-0127: Cambio de luminaria pasó a finalizada.',
   FALSE, TO_TIMESTAMP('24/06/2025 14:00','DD/MM/YYYY HH24:MI')),
  (6, 335, NULL, 'requerimiento', 'Nuevo requerimiento',
   'Se emitió el requerimiento REQ-0335: Toma eléctrica suelta.',
   TRUE,  TO_TIMESTAMP('22/06/2025 10:05','DD/MM/YYYY HH24:MI')),
  -- nuevas notificaciones
  (6, 343, NULL, 'requerimiento', 'Nuevo requerimiento',
   'Se emitió el requerimiento REQ-0343: Grieta en aula 15.',
   FALSE, TO_TIMESTAMP('26/06/2025 08:10','DD/MM/YYYY HH24:MI')),
  (5, NULL, 134, 'tarea-finalizada', 'Tarea finalizada',
   'La tarea T-0134: Limpieza patio central pasó a finalizada.',
   TRUE,  TO_TIMESTAMP('25/06/2025 18:30','DD/MM/YYYY HH24:MI')),
  (4, NULL, 134, 'tarea-aprobada', 'Tarea aprobada',
   'El Directivo aprobó la tarea T-0134: Limpieza patio central.',
   FALSE, TO_TIMESTAMP('26/06/2025 09:00','DD/MM/YYYY HH24:MI'));

-- ------------------------------------------------------------
-- Ajustar secuencias después de insertar IDs explícitos
-- ------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('roles', 'id_rol'),                 (SELECT MAX(id_rol) FROM roles));
SELECT setval(pg_get_serial_sequence('cargos', 'id_cargo'),              (SELECT MAX(id_cargo) FROM cargos));
SELECT setval(pg_get_serial_sequence('sectores', 'id_sector'),           (SELECT MAX(id_sector) FROM sectores));
SELECT setval(pg_get_serial_sequence('especialidades', 'id_especialidad'), (SELECT MAX(id_especialidad) FROM especialidades));
SELECT setval(pg_get_serial_sequence('usuarios', 'id_usuario'),          (SELECT MAX(id_usuario) FROM usuarios));
SELECT setval(pg_get_serial_sequence('personal_externo', 'id_personal'), (SELECT MAX(id_personal) FROM personal_externo));
SELECT setval(pg_get_serial_sequence('requerimientos', 'id_requerimiento'), (SELECT MAX(id_requerimiento) FROM requerimientos));
SELECT setval(pg_get_serial_sequence('tareas', 'id_tarea'),              (SELECT MAX(id_tarea) FROM tareas));
SELECT setval(pg_get_serial_sequence('categorias', 'id_categoria'),      (SELECT MAX(id_categoria) FROM categorias));