// ==========================================
// BASE DE DATOS (PostgreSQL)
// ==========================================

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const esLocal =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes("localhost") ||
    process.env.DATABASE_URL.includes("127.0.0.1"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: esLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Catálogos iniciales
const AREAS = [
  "Trabajo",
  "Educación",
  "Emprendimiento",
  "Familia",
  "Salud",
  "Comunidad",
  "Recreación",
  "Otro",
];
const MOTIVOS = [
  "Empleo",
  "Educación",
  "Salud",
  "Orientación jurídica",
  "Vivienda",
  "Emprendimiento",
  "Redes de apoyo",
  "Otro",
];

// Líneas de atención que aparecen en el botón de ayuda/emergencia
const LINEAS_AYUDA = [
  [
    "Línea 155",
    "155",
    "Orientación y acompañamiento para mujeres víctimas de violencia.",
    "24 horas",
    "Violencia de género",
    1,
  ],
  [
    "Línea 106",
    "106",
    "Línea de salud mental y apoyo emocional.",
    "24 horas",
    "Salud mental",
    2,
  ],
  [
    "Línea 123",
    "123",
    "Emergencias médicas, policiales y de protección.",
    "24 horas",
    "Emergencias",
    3,
  ],
  [
    "Línea 195",
    "195",
    "Orientación sobre servicios sociales y programas de la ciudad.",
    "24 horas",
    "Servicios sociales",
    4,
  ],
  [
    "Línea 141",
    "141",
    "Protección de niñas, niños y adolescentes (ICBF).",
    "24 horas",
    "Niñez y familia",
    5,
  ],
  [
    "Línea 122",
    "122",
    "Atención de denuncias y orientación de la Fiscalía.",
    "24 horas",
    "Justicia",
    6,
  ],
  [
    "Línea 147",
    "147",
    "Orientación y atención de emergencias en Bogotá.",
    "24 horas",
    "Emergencias",
    7,
  ],
];

// Servicios de ejemplo para el mapa
const SERVICIOS_MAPA = [
  [
    "Casa Libertad",
    "Fundaciones",
    "Bogotá",
    "Carrera 16 # 34-50",
    "377 9595",
    "Lunes a viernes, 8:00 a 17:00",
    "Atención pospenitenciaria, orientación psicosocial, jurídica y laboral.",
    4.6155,
    -74.07,
    null,
  ],
  [
    "Fundación Acción Interna",
    "Atención psicosocial",
    "Bogotá",
    "Calle 63 # 24-10",
    "310 260 0134",
    "Lunes a viernes, 8:00 a 17:00",
    "Acompañamiento psicosocial, formación y oportunidades de empleo.",
    4.6486,
    -74.0664,
    null,
  ],
  [
    "Casa de la Mujer",
    "Albergues",
    "Bogotá",
    "Carrera 7 # 32-16",
    "195",
    "24 horas",
    "Orientación y protección para mujeres en situación de riesgo.",
    4.5981,
    -74.0758,
    null,
  ],
  [
    "Hospital Universitario San Ignacio",
    "Salud",
    "Bogotá",
    "Carrera 7 # 40-62",
    "601 594 6161",
    "24 horas",
    "Servicios de salud física y mental.",
    4.628,
    -74.064,
    null,
  ],
  [
    "Secretaría Distrital de Salud",
    "Salud",
    "Bogotá",
    "Carrera 32 # 12-81",
    "601 364 9090",
    "Lunes a viernes, 8:00 a 17:00",
    "Afiliación, orientación y rutas de atención en salud.",
    4.6118,
    -74.082,
    null,
  ],
  [
    "Agencia Pública de Empleo SENA",
    "Empleo",
    "Bogotá",
    "Calle 57 # 8-14",
    "601 546 1500",
    "Lunes a viernes, 8:00 a 17:00",
    "Intermediación laboral, orientación ocupacional y formación.",
    4.632,
    -74.069,
    null,
  ],
  [
    "Comisaría de Familia de Teusaquillo",
    "Comisarías de familia",
    "Bogotá",
    "Calle 39 # 19-30",
    "601 380 1234",
    "Lunes a viernes, 8:00 a 17:00",
    "Orientación y protección en casos de violencia intrafamiliar.",
    4.64,
    -74.07,
    null,
  ],
  [
    "Universidad Distrital Francisco José de Caldas",
    "Educación",
    "Bogotá",
    "Carrera 7 # 40B-53",
    "601 323 9300",
    "Lunes a viernes, 8:00 a 18:00",
    "Programas académicos, cursos y orientación educativa.",
    4.6285,
    -74.0655,
    null,
  ],
  [
    "Fundación Caminos de Esperanza",
    "Fundaciones",
    "Medellín",
    "Carrera 43A # 1-50",
    "604 444 5566",
    "Lunes a viernes, 8:00 a 17:00",
    "Acompañamiento a mujeres en procesos de reintegración.",
    6.2518,
    -75.5636,
    null,
  ],
  [
    "Albergue Mujeres en Red",
    "Albergues",
    "Medellín",
    "Calle 44 # 52-20",
    "604 322 1100",
    "24 horas",
    "Alojamiento temporal y orientación psicosocial.",
    6.2442,
    -75.5812,
    null,
  ],
  [
    "Hospital San Vicente Fundación",
    "Salud",
    "Medellín",
    "Calle 64 # 51D-154",
    "604 444 1333",
    "24 horas",
    "Atención médica y salud mental.",
    6.2518,
    -75.57,
    null,
  ],
  [
    "Comisaría de Familia de Belén",
    "Comisarías de familia",
    "Medellín",
    "Carrera 76 # 30-45",
    "604 385 5555",
    "Lunes a viernes, 8:00 a 17:00",
    "Protección y orientación familiar.",
    6.23,
    -75.59,
    null,
  ],
  [
    "SENA Centro de Servicios Empresariales",
    "Empleo",
    "Medellín",
    "Calle 51 # 57-70",
    "604 576 0000",
    "Lunes a viernes, 8:00 a 17:00",
    "Formación, emprendimiento e intermediación laboral.",
    6.26,
    -75.58,
    null,
  ],
  [
    "Fundación Semilla de Paz",
    "Fundaciones",
    "Cali",
    "Avenida 6N # 23-45",
    "602 661 2233",
    "Lunes a viernes, 8:00 a 17:00",
    "Acompañamiento psicosocial y jurídico para mujeres.",
    3.4516,
    -76.532,
    null,
  ],
  [
    "Hospital Universitario del Valle",
    "Salud",
    "Cali",
    "Calle 5 # 36-08",
    "602 620 6000",
    "24 horas",
    "Atención médica, psicológica y psiquiátrica.",
    3.421,
    -76.54,
    null,
  ],
  [
    "Comisaría de Familia de Cali Centro",
    "Comisarías de familia",
    "Cali",
    "Calle 10 # 5-30",
    "602 887 1234",
    "Lunes a viernes, 8:00 a 17:00",
    "Orientación y protección en violencia intrafamiliar.",
    3.45,
    -76.532,
    null,
  ],
  [
    "Agencia de Empleo de Cali",
    "Empleo",
    "Cali",
    "Avenida 6N # 20-30",
    "602 660 1234",
    "Lunes a viernes, 8:00 a 17:00",
    "Bolsa de empleo y orientación laboral.",
    3.455,
    -76.535,
    null,
  ],
  [
    "Fundación Renacer Caribe",
    "Fundaciones",
    "Barranquilla",
    "Carrera 45 # 70-20",
    "605 360 1122",
    "Lunes a viernes, 8:00 a 17:00",
    "Apoyo psicosocial y social a mujeres y familias.",
    10.9878,
    -74.7889,
    null,
  ],
  [
    "Hospital General de Barranquilla",
    "Salud",
    "Barranquilla",
    "Carrera 45 # 70-50",
    "605 330 7000",
    "24 horas",
    "Atención médica y salud mental.",
    10.98,
    -74.79,
    null,
  ],
  [
    "Comisaría de Familia de Barranquilla",
    "Comisarías de familia",
    "Barranquilla",
    "Calle 40 # 44-50",
    "605 385 1234",
    "Lunes a viernes, 8:00 a 17:00",
    "Protección y orientación familiar.",
    10.97,
    -74.8,
    null,
  ],
  [
    "Albergue Casa de Acogida",
    "Albergues",
    "Cartagena",
    "Calle 30 # 20-15",
    "605 660 1122",
    "24 horas",
    "Alojamiento temporal y acompañamiento.",
    10.391,
    -75.4794,
    null,
  ],
  [
    "Hospital Universitario del Caribe",
    "Salud",
    "Cartagena",
    "Carrera 50 # 30-20",
    "605 655 6000",
    "24 horas",
    "Servicios de salud y atención psicosocial.",
    10.4,
    -75.5,
    null,
  ],
  [
    "Unidad de Empleo de Bucaramanga",
    "Empleo",
    "Bucaramanga",
    "Carrera 27 # 35-20",
    "607 633 1234",
    "Lunes a viernes, 8:00 a 17:00",
    "Orientación laboral y bolsa de empleo.",
    7.1193,
    -73.1227,
    null,
  ],
  [
    "Fundación Mujer y Vida",
    "Fundaciones",
    "Bucaramanga",
    "Calle 36 # 20-10",
    "607 645 1122",
    "Lunes a viernes, 8:00 a 17:00",
    "Acompañamiento psicosocial y jurídico.",
    7.125,
    -73.119,
    null,
  ],
];

// ------------------------------------------
// UTILIDADES
// ------------------------------------------
const consultar = async (sql, params = []) => {
  const res = await pool.query(sql, params);
  return res.rows;
};

// Transacciones en Postgres (BEGIN / COMMIT / ROLLBACK)
async function enTransaccion(fn) {
  const conexion = await pool.connect();
  try {
    await conexion.query("BEGIN");
    const resultado = await fn(conexion);
    await conexion.query("COMMIT");
    return resultado;
  } catch (e) {
    await conexion.query("ROLLBACK");
    throw e;
  } finally {
    conexion.release();
  }
}

const conFecha = (fila) =>
  fila && fila.creado_en instanceof Date
    ? { ...fila, creado_en: fila.creado_en.toISOString() }
    : fila;

// ------------------------------------------
// ARRANQUE: crea las tablas y los catálogos
// ------------------------------------------
async function iniciar() {
  const sqlPath = path.join(__dirname, "schema.sql");
  if (fs.existsSync(sqlPath)) {
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);
  }

  // Migración opcional para roles en PostgreSQL si ya existía la tabla
  await pool
    .query("ALTER TABLE usuarias DROP CONSTRAINT IF EXISTS usuarias_rol_check;")
    .catch(() => {});

  for (const nombre of AREAS) {
    await consultar(
      "INSERT INTO areas (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING",
      [nombre],
    );
  }
  for (const nombre of MOTIVOS) {
    await consultar(
      "INSERT INTO motivos (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING",
      [nombre],
    );
  }

  for (const [
    nombre,
    numero,
    descripcion,
    horario,
    categoria,
    orden,
  ] of LINEAS_AYUDA) {
    await consultar(
      `INSERT INTO lineas_ayuda (nombre, numero, descripcion, horario, categoria, orden)
             VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING`,
      [nombre, numero, descripcion, horario, categoria, orden],
    );
  }

  for (const [
    nombre,
    categoria,
    ciudad,
    direccion,
    telefono,
    horario,
    descripcion,
    lat,
    lng,
    web,
  ] of SERVICIOS_MAPA) {
    await consultar(
      `INSERT INTO servicios_mapa
                (nombre, categoria, ciudad, direccion, telefono, horario, descripcion, lat, lng, web, creado_en)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
             ON CONFLICT DO NOTHING`,
      [
        nombre,
        categoria,
        ciudad,
        direccion,
        telefono,
        horario,
        descripcion,
        lat,
        lng,
        web,
      ],
    );
  }
}

// ------------------------------------------
// USUARIAS
// ------------------------------------------
const crearUsuaria = async (nombre, email, hash, rol = "usuaria") => {
  const res = await pool.query(
    "INSERT INTO usuarias (nombre, email, password_hash, rol, creado_en) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
    [nombre, email, hash, rol],
  );
  return res.rows[0].id;
};

const usuariaPorEmail = async (email) =>
  (
    await consultar("SELECT * FROM usuarias WHERE email = $1 LIMIT 1", [email])
  )[0];

const usuariaPorId = async (id) =>
  (
    await consultar(
      "SELECT id, nombre, email, rol FROM usuarias WHERE id = $1 LIMIT 1",
      [id],
    )
  )[0];

const usuariaConHash = async (id) =>
  (await consultar("SELECT * FROM usuarias WHERE id = $1 LIMIT 1", [id]))[0];

const cambiarHash = (id, hash) =>
  consultar("UPDATE usuarias SET password_hash = $1 WHERE id = $2", [hash, id]);

const existeAdmin = async () =>
  (await consultar("SELECT 1 AS ok FROM usuarias WHERE rol = 'admin' LIMIT 1"))
    .length > 0;

// ------------------------------------------
// TESTIMONIOS
// ------------------------------------------
const SQL_TESTIMONIOS = `
    SELECT t.id, t.nombre_publico, t.texto, t.estado, t.creado_en,
           (SELECT STRING_AGG(a.nombre, ', ' ORDER BY a.id)
              FROM testimonio_areas ta JOIN areas a ON a.id = ta.area_id
             WHERE ta.testimonio_id = t.id) AS areas
      FROM testimonios t`;

const crearTestimonio = ({ usuariaId, nombrePublico, texto, areas }) =>
  enTransaccion(async (c) => {
    const r = await c.query(
      "INSERT INTO testimonios (usuaria_id, nombre_publico, texto, creado_en) VALUES ($1, $2, $3, NOW()) RETURNING id",
      [usuariaId || null, nombrePublico || null, texto],
    );
    const testimonioId = r.rows[0].id;

    for (const nombre of areas) {
      const encontradas = await c.query(
        "SELECT id FROM areas WHERE nombre = $1 LIMIT 1",
        [nombre],
      );
      if (encontradas.rows.length) {
        await c.query(
          "INSERT INTO testimonio_areas (testimonio_id, area_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [testimonioId, encontradas.rows[0].id],
        );
      }
    }
    return testimonioId;
  });

const testimoniosPublicos = async () =>
  (
    await consultar(
      SQL_TESTIMONIOS +
        " WHERE t.estado = 'aprobado' ORDER BY t.creado_en DESC, t.id DESC",
    )
  ).map(conFecha);

const listarTestimonios = async (estado) =>
  (estado
    ? await consultar(
        SQL_TESTIMONIOS +
          " WHERE t.estado = $1 ORDER BY t.creado_en DESC, t.id DESC",
        [estado],
      )
    : await consultar(SQL_TESTIMONIOS + " ORDER BY t.creado_en DESC, t.id DESC")
  ).map(conFecha);

const estadoTestimonio = async (id, estado) => {
  const res = await pool.query(
    "UPDATE testimonios SET estado = $1 WHERE id = $2",
    [estado, id],
  );
  return res.rowCount;
};

const borrarTestimonio = async (id) => {
  const res = await pool.query("DELETE FROM testimonios WHERE id = $1", [id]);
  return res.rowCount;
};

// ------------------------------------------
// SOLICITUDES DE ORIENTACIÓN
// ------------------------------------------
const SQL_SOLICITUDES = `
    SELECT s.id, s.nombre, s.contacto, s.mensaje, s.estado, s.creado_en,
           (SELECT STRING_AGG(m.nombre, ', ' ORDER BY m.id)
              FROM solicitud_motivos sm JOIN motivos m ON m.id = sm.motivo_id
             WHERE sm.solicitud_id = s.id) AS motivos
      FROM solicitudes s`;

const crearSolicitud = ({ nombre, contacto, mensaje, motivos }) =>
  enTransaccion(async (c) => {
    const r = await c.query(
      "INSERT INTO solicitudes (nombre, contacto, mensaje, creado_en) VALUES ($1, $2, $3, NOW()) RETURNING id",
      [nombre || null, contacto || null, mensaje || null],
    );
    const solicitudId = r.rows[0].id;

    for (const nombreMotivo of motivos) {
      const encontrados = await c.query(
        "SELECT id FROM motivos WHERE nombre = $1 LIMIT 1",
        [nombreMotivo],
      );
      if (encontrados.rows.length) {
        await c.query(
          "INSERT INTO solicitud_motivos (solicitud_id, motivo_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [solicitudId, encontrados.rows[0].id],
        );
      }
    }
    return solicitudId;
  });

const listarSolicitudes = async (estado) =>
  (estado
    ? await consultar(
        SQL_SOLICITUDES +
          " WHERE s.estado = $1 ORDER BY s.creado_en DESC, s.id DESC",
        [estado],
      )
    : await consultar(SQL_SOLICITUDES + " ORDER BY s.creado_en DESC, s.id DESC")
  ).map(conFecha);

const estadoSolicitud = async (id, estado) => {
  const res = await pool.query(
    "UPDATE solicitudes SET estado = $1 WHERE id = $2",
    [estado, id],
  );
  return res.rowCount;
};

const borrarSolicitud = async (id) => {
  const res = await pool.query("DELETE FROM solicitudes WHERE id = $1", [id]);
  return res.rowCount;
};

// ------------------------------------------
// USUARIAS, PROFESIONALES Y ACCESOS
// ------------------------------------------
const listarUsuarias = async () =>
  (
    await consultar(
      `SELECT u.id, u.nombre, u.email, u.rol, u.creado_en,
                (SELECT TO_CHAR(MAX(a.creado_en), 'YYYY-MM-DD"T"HH24:MI:SS')
                   FROM accesos a WHERE a.usuaria_id = u.id) AS ultimo_acceso
           FROM usuarias u
          WHERE u.rol = 'usuaria'
          ORDER BY u.nombre`,
    )
  ).map(conFecha);

const registrarAcceso = (usuariaId) =>
  consultar("INSERT INTO accesos (usuaria_id, creado_en) VALUES ($1, NOW())", [
    usuariaId,
  ]);

const existeProfesional = async () =>
  (
    await consultar(
      "SELECT 1 AS ok FROM usuarias WHERE rol = 'profesional' LIMIT 1",
    )
  ).length > 0;

const listarProfesionales = async (soloActivos = true) =>
  (
    await consultar(
      `SELECT u.id, u.nombre, u.email, u.creado_en, p.especialidad, p.descripcion, p.activo
           FROM usuarias u
           INNER JOIN perfiles_profesionales p ON p.usuaria_id = u.id
          WHERE u.rol = 'profesional' ${soloActivos ? "AND p.activo = true" : ""}
          ORDER BY u.nombre`,
    )
  ).map(conFecha);

const profesionalPorId = async (id) =>
  (
    await consultar(
      `SELECT u.id, u.nombre, u.email, p.especialidad, p.descripcion, p.activo
           FROM usuarias u
           INNER JOIN perfiles_profesionales p ON p.usuaria_id = u.id
          WHERE u.id = $1 AND u.rol = 'profesional' LIMIT 1`,
      [id],
    )
  )[0];

const crearPerfilProfesional = (usuariaId, especialidad, descripcion) =>
  consultar(
    "INSERT INTO perfiles_profesionales (usuaria_id, especialidad, descripcion, activo) VALUES ($1, $2, $3, true)",
    [usuariaId, especialidad, descripcion || null],
  );

const crearProfesionalCompleto = ({
  nombre,
  email,
  hash,
  especialidad,
  descripcion,
  rangos,
}) =>
  enTransaccion(async (c) => {
    const r = await c.query(
      `INSERT INTO usuarias (nombre, email, password_hash, rol, creado_en)
             VALUES ($1, $2, $3, 'profesional', NOW()) RETURNING id`,
      [nombre, email, hash],
    );
    const id = r.rows[0].id;

    await c.query(
      "INSERT INTO perfiles_profesionales (usuaria_id, especialidad, descripcion, activo) VALUES ($1, $2, $3, true)",
      [id, especialidad, descripcion || null],
    );

    for (const ra of rangos || []) {
      await c.query(
        "INSERT INTO disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)",
        [id, ra.dia_semana, ra.hora_inicio, ra.hora_fin],
      );
    }
    return id;
  });

const actualizarPerfilProfesional = (
  usuariaId,
  { especialidad, descripcion, activo },
) =>
  consultar(
    `UPDATE perfiles_profesionales
            SET especialidad = $1, descripcion = $2, activo = $3
          WHERE usuaria_id = $4`,
    [especialidad, descripcion || null, activo ? true : false, usuariaId],
  );

const profesionalReciente = async (usuariaId) => {
  const cita = await consultar(
    "SELECT profesional_id FROM citas WHERE usuaria_id = $1 ORDER BY fecha_hora DESC, id DESC LIMIT 1",
    [usuariaId],
  );
  if (cita.length) return cita[0].profesional_id;

  const mensaje = await consultar(
    "SELECT profesional_id FROM mensajes WHERE usuaria_id = $1 ORDER BY creado_en DESC, id DESC LIMIT 1",
    [usuariaId],
  );
  return mensaje.length ? mensaje[0].profesional_id : null;
};

// ------------------------------------------
// DISPONIBILIDAD
// ------------------------------------------
const listarDisponibilidad = async (profesionalId) =>
  consultar(
    `SELECT id, dia_semana,
                TO_CHAR(hora_inicio, 'HH24:MI') AS hora_inicio,
                TO_CHAR(hora_fin, 'HH24:MI') AS hora_fin
           FROM disponibilidad
          WHERE profesional_id = $1
          ORDER BY dia_semana, hora_inicio`,
    [profesionalId],
  );

const tieneDisponibilidad = async (profesionalId) =>
  (
    await consultar(
      "SELECT 1 AS ok FROM disponibilidad WHERE profesional_id = $1 LIMIT 1",
      [profesionalId],
    )
  ).length > 0;

const reemplazarDisponibilidad = (profesionalId, rangos) =>
  enTransaccion(async (c) => {
    await c.query("DELETE FROM disponibilidad WHERE profesional_id = $1", [
      profesionalId,
    ]);
    for (const r of rangos) {
      await c.query(
        "INSERT INTO disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4)",
        [profesionalId, r.dia_semana, r.hora_inicio, r.hora_fin],
      );
    }
  });

// ------------------------------------------
// CITAS
// ------------------------------------------
const SQL_CITAS = `
    SELECT c.id, c.usuaria_id, c.profesional_id,
           TO_CHAR(c.fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora,
           c.duracion_min, c.modalidad, c.motivo, c.estado, c.notas,
           TO_CHAR(c.creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en,
           u.nombre AS usuaria, u.email AS usuaria_email,
           p.nombre AS profesional, p.email AS profesional_email,
           pp.especialidad
      FROM citas c
      INNER JOIN usuarias u ON u.id = c.usuaria_id
      INNER JOIN usuarias p ON p.id = c.profesional_id
      LEFT JOIN perfiles_profesionales pp ON pp.usuaria_id = p.id`;

const crearCita = async ({
  usuariaId,
  profesionalId,
  fechaHora,
  duracion,
  modalidad,
  motivo,
}) => {
  const res = await pool.query(
    `INSERT INTO citas (usuaria_id, profesional_id, fecha_hora, duracion_min, modalidad, motivo, creado_en)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
    [usuariaId, profesionalId, fechaHora, duracion, modalidad, motivo || null],
  );
  return res.rows[0].id;
};

const citasDeUsuaria = async (usuariaId) =>
  consultar(
    SQL_CITAS +
      " WHERE c.usuaria_id = $1 ORDER BY c.fecha_hora DESC, c.id DESC LIMIT 100",
    [usuariaId],
  );

const citasDeProfesional = async (profesionalId) =>
  consultar(
    SQL_CITAS +
      " WHERE c.profesional_id = $1 ORDER BY c.fecha_hora DESC, c.id DESC LIMIT 200",
    [profesionalId],
  );

const todasLasCitas = async () =>
  consultar(SQL_CITAS + " ORDER BY c.fecha_hora DESC, c.id DESC LIMIT 500");

const citaPorId = async (id) =>
  (await consultar(SQL_CITAS + " WHERE c.id = $1 LIMIT 1", [id]))[0];

const cambiarEstadoCita = (id, estado, notas) =>
  consultar(
    "UPDATE citas SET estado = $1, notas = COALESCE($2, notas) WHERE id = $3",
    [estado, notas || null, id],
  );

const hayConflictoCita = async (profesionalId, fechaHora, excluirId) => {
  const condicionExcluir = excluirId ? " AND id <> $4" : "";
  const parametros = excluirId
    ? [profesionalId, fechaHora, fechaHora, excluirId]
    : [profesionalId, fechaHora, fechaHora];

  const filas = await consultar(
    `SELECT 1 AS ok FROM citas
          WHERE profesional_id = $1
            AND estado IN ('pendiente', 'confirmada')
            AND fecha_hora < ($2::timestamp + INTERVAL '50 minute')
            AND (fecha_hora + (duracion_min || ' minute')::interval) > $3
            ${condicionExcluir}
          LIMIT 1`,
    parametros,
  );
  return filas.length > 0;
};

const citasOcupadas = async (profesionalId, desde, hasta) =>
  consultar(
    `SELECT TO_CHAR(fecha_hora, 'YYYY-MM-DD"T"HH24:MI:SS') AS fecha_hora
           FROM citas
          WHERE profesional_id = $1 AND estado IN ('pendiente', 'confirmada')
            AND fecha_hora BETWEEN $2 AND $3`,
    [profesionalId, desde, hasta],
  );

const contarCitasActivasUsuaria = async (usuariaId) =>
  Number(
    (
      await consultar(
        `SELECT COUNT(*) AS n FROM citas
          WHERE usuaria_id = $1 AND fecha_hora >= (NOW() - INTERVAL '5 hour')
            AND estado IN ('pendiente', 'confirmada')`,
        [usuariaId],
      )
    )[0].n,
  );

// ------------------------------------------
// MENSAJERÍA
// ------------------------------------------
const crearMensaje = async ({ usuariaId, profesionalId, remitente, texto }) => {
  const res = await pool.query(
    `INSERT INTO mensajes (usuaria_id, profesional_id, remitente, texto, creado_en)
         VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
    [usuariaId, profesionalId, remitente, texto],
  );
  return res.rows[0].id;
};

const mensajesConversacion = async (usuariaId, profesionalId) =>
  consultar(
    `SELECT id, remitente, texto, leido,
                TO_CHAR(creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en
           FROM mensajes
          WHERE usuaria_id = $1 AND profesional_id = $2
          ORDER BY creado_en ASC, id ASC
          LIMIT 300`,
    [usuariaId, profesionalId],
  );

const marcarMensajesLeidos = (usuariaId, profesionalId, quien) =>
  consultar(
    `UPDATE mensajes SET leido = true
          WHERE usuaria_id = $1 AND profesional_id = $2 AND remitente = $3 AND leido = false`,
    [
      usuariaId,
      profesionalId,
      quien === "profesional" ? "usuaria" : "profesional",
    ],
  );

const resumenConversacionesUsuaria = async (usuariaId) =>
  consultar(
    `SELECT p.id AS profesional_id, p.nombre AS profesional, pp.especialidad,
                (SELECT m.texto FROM mensajes m
                  WHERE m.usuaria_id = $1 AND m.profesional_id = p.id
                  ORDER BY m.creado_en DESC, m.id DESC LIMIT 1) AS ultimo,
                (SELECT TO_CHAR(m.creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') FROM mensajes m
                  WHERE m.usuaria_id = $2 AND m.profesional_id = p.id
                  ORDER BY m.creado_en DESC, m.id DESC LIMIT 1) AS ultimo_en,
                (SELECT COUNT(*) FROM mensajes m
                  WHERE m.usuaria_id = $3 AND m.profesional_id = p.id
                    AND m.remitente = 'profesional' AND m.leido = false) AS sin_leer
           FROM usuarias p
           INNER JOIN perfiles_profesionales pp ON pp.usuaria_id = p.id
          WHERE p.rol = 'profesional' AND pp.activo = true
          ORDER BY pp.especialidad, p.nombre`,
    [usuariaId, usuariaId, usuariaId],
  );

const resumenConversacionesProfesional = async (profesionalId) =>
  consultar(
    `SELECT u.id AS usuaria_id, u.nombre AS usuaria,
                (SELECT m.texto FROM mensajes m
                  WHERE m.profesional_id = $1 AND m.usuaria_id = u.id
                  ORDER BY m.creado_en DESC, m.id DESC LIMIT 1) AS ultimo,
                (SELECT TO_CHAR(m.creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') FROM mensajes m
                  WHERE m.profesional_id = $2 AND m.usuaria_id = u.id
                  ORDER BY m.creado_en DESC, m.id DESC LIMIT 1) AS ultimo_en,
                (SELECT COUNT(*) FROM mensajes m
                  WHERE m.profesional_id = $3 AND m.usuaria_id = u.id
                    AND m.remitente = 'usuaria' AND m.leido = false) AS sin_leer
           FROM usuarias u
          WHERE u.rol = 'usuaria' AND (
                EXISTS (SELECT 1 FROM mensajes m WHERE m.profesional_id = $4 AND m.usuaria_id = u.id)
               OR EXISTS (SELECT 1 FROM citas c WHERE c.profesional_id = $5 AND c.usuaria_id = u.id)
          )
          ORDER BY ultimo_en DESC NULLS LAST, u.nombre`,
    [profesionalId, profesionalId, profesionalId, profesionalId, profesionalId],
  );

// ------------------------------------------
// DIARIO EMOCIONAL
// ------------------------------------------
const guardarDiario = async ({ usuariaId, fecha, animo, emociones, nota }) => {
  await consultar(
    `INSERT INTO diario_emocional (usuaria_id, fecha, animo, emociones, nota, creado_en)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (usuaria_id, fecha) DO UPDATE SET
            animo = EXCLUDED.animo,
            emociones = EXCLUDED.emociones,
            nota = EXCLUDED.nota,
            creado_en = NOW()`,
    [usuariaId, fecha, animo, emociones || null, nota || null],
  );

  return (
    await consultar(
      `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, animo, emociones, nota,
                TO_CHAR(creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en
           FROM diario_emocional
          WHERE usuaria_id = $1 AND fecha = $2 LIMIT 1`,
      [usuariaId, fecha],
    )
  )[0];
};

const diarioDeUsuaria = async (usuariaId, limite = 60) => {
  const n = Math.min(Math.max(Number(limite) || 60, 1), 365);
  return consultar(
    `SELECT id, TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, animo, emociones, nota,
                TO_CHAR(creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en
           FROM diario_emocional
          WHERE usuaria_id = $1
          ORDER BY fecha DESC, id DESC
          LIMIT $2`,
    [usuariaId, n],
  );
};

const diarioPorDia = async (usuariaId, dias = 30) => {
  const n = Math.min(Math.max(Number(dias) || 30, 1), 365);
  return consultar(
    `SELECT TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
                ROUND(AVG(animo)::numeric, 1) AS promedio, COUNT(*) AS registros
           FROM diario_emocional
          WHERE usuaria_id = $1 AND fecha >= (NOW() - INTERVAL '5 hour')::date - ($2 - 1) * INTERVAL '1 day'
          GROUP BY fecha
          ORDER BY fecha`,
    [usuariaId, n],
  );
};

// ------------------------------------------
// TESTS DE BIENESTAR Y ALERTAS
// ------------------------------------------
const guardarTest = async ({
  usuariaId,
  tipo,
  puntaje,
  nivel,
  respuestas,
  riesgo,
}) => {
  const res = await pool.query(
    `INSERT INTO tests_bienestar (usuaria_id, tipo, puntaje, nivel, respuestas, riesgo, creado_en)
         VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
    [
      usuariaId,
      tipo,
      puntaje,
      nivel,
      JSON.stringify(respuestas),
      riesgo ? true : false,
    ],
  );
  return res.rows[0].id;
};

const historialTests = async (usuariaId) =>
  consultar(
    `SELECT id, tipo, puntaje, nivel, riesgo,
                TO_CHAR(creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en
           FROM tests_bienestar
          WHERE usuaria_id = $1
          ORDER BY creado_en DESC, id DESC
          LIMIT 60`,
    [usuariaId],
  );

const todosLosTests = async () =>
  consultar(
    `SELECT t.id, t.tipo, t.puntaje, t.nivel, t.riesgo,
                TO_CHAR(t.creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en,
                u.id AS usuaria_id, u.nombre AS usuaria, u.email AS usuaria_email
           FROM tests_bienestar t
           INNER JOIN usuarias u ON u.id = t.usuaria_id
          ORDER BY t.creado_en DESC, t.id DESC
          LIMIT 500`,
  );

const crearAlerta = ({ usuariaId, profesionalId, tipo, nivel, descripcion }) =>
  consultar(
    `INSERT INTO alertas (usuaria_id, profesional_id, tipo, nivel, descripcion, creado_en)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
    [usuariaId, profesionalId || null, tipo, nivel || "alto", descripcion],
  );

const SQL_ALERTAS = `
    SELECT a.id, a.tipo, a.nivel, a.descripcion, a.atendida,
           TO_CHAR(a.creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en,
           u.id AS usuaria_id, u.nombre AS usuaria, u.email AS usuaria_email,
           p.id AS profesional_id, p.nombre AS profesional
      FROM alertas a
      INNER JOIN usuarias u ON u.id = a.usuaria_id
      LEFT JOIN usuarias p ON p.id = a.profesional_id`;

const alertasDeProfesional = async (profesionalId) =>
  consultar(
    SQL_ALERTAS +
      " WHERE (a.profesional_id = $1 OR a.profesional_id IS NULL) ORDER BY a.atendida ASC, a.creado_en DESC",
    [profesionalId],
  );

const alertasAdmin = async () =>
  consultar(
    SQL_ALERTAS + " ORDER BY a.atendida ASC, a.creado_en DESC LIMIT 500",
  );

const atenderAlerta = (id, profesionalId) =>
  consultar(
    `UPDATE alertas
            SET atendida = true,
                profesional_id = COALESCE(profesional_id, $1)
          WHERE id = $2`,
    [profesionalId || null, id],
  );

// ------------------------------------------
// LÍNEAS DE AYUDA Y MAPA DE SERVICIOS
// ------------------------------------------
const lineasAyuda = async () =>
  consultar(
    `SELECT id, nombre, numero, descripcion, horario, categoria
           FROM lineas_ayuda
          WHERE activo = true
          ORDER BY orden, nombre`,
  );

const serviciosMapa = async (categoria, ciudad) => {
  let sql = `SELECT id, nombre, categoria, ciudad, direccion, telefono, horario,
                      descripcion, lat, lng, web
                 FROM servicios_mapa
                WHERE 1 = 1`;
  const params = [];

  if (categoria) {
    params.push(categoria);
    sql += ` AND categoria = $${params.length}`;
  }

  if (ciudad) {
    params.push(ciudad);
    sql += ` AND ciudad = $${params.length}`;
  }

  sql += " ORDER BY ciudad, categoria, nombre";
  return consultar(sql, params);
};

const filtrosServicios = async () => {
  const categorias = await consultar(
    "SELECT DISTINCT categoria FROM servicios_mapa ORDER BY categoria",
  );
  const ciudades = await consultar(
    "SELECT DISTINCT ciudad FROM servicios_mapa ORDER BY ciudad",
  );

  return {
    categorias: categorias.map((f) => f.categoria),
    ciudades: ciudades.map((f) => f.ciudad),
  };
};

// ------------------------------------------
// LOGROS LABORALES
// ------------------------------------------
const listarLogros = async () =>
  consultar(
    `SELECT l.id, l.empresa, l.cargo,
                TO_CHAR(l.fecha, 'YYYY-MM-DD') AS fecha,
                TO_CHAR(l.creado_en, 'YYYY-MM-DD"T"HH24:MI:SS') AS creado_en,
                u.id AS usuaria_id, u.nombre AS usuaria
           FROM logros_laborales l
           INNER JOIN usuarias u ON u.id = l.usuaria_id
          ORDER BY l.fecha DESC, l.id DESC
          LIMIT 300`,
  );

const crearLogro = async ({ usuariaId, empresa, cargo, fecha }) => {
  const res = await pool.query(
    "INSERT INTO logros_laborales (usuaria_id, empresa, cargo, fecha, creado_en) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
    [usuariaId, empresa, cargo || null, fecha],
  );
  return res.rows[0].id;
};

const borrarLogro = async (id) => {
  const res = await pool.query("DELETE FROM logros_laborales WHERE id = $1", [
    id,
  ]);
  return res.rowCount;
};

// ------------------------------------------
// RESUMEN Y ESTADÍSTICAS
// ------------------------------------------
const contar = async (sql) => Number((await consultar(sql))[0].n);
const uno = async (sql, params = []) => (await consultar(sql, params))[0] || {};

const resumen = async () => ({
  testimoniosPendientes: await contar(
    "SELECT COUNT(*) AS n FROM testimonios WHERE estado = 'pendiente'",
  ),
  testimoniosPublicados: await contar(
    "SELECT COUNT(*) AS n FROM testimonios WHERE estado = 'aprobado'",
  ),
  solicitudesNuevas: await contar(
    "SELECT COUNT(*) AS n FROM solicitudes WHERE estado = 'nueva'",
  ),
  citasPendientes: await contar(
    "SELECT COUNT(*) AS n FROM citas WHERE estado = 'pendiente'",
  ),
  alertasPendientes: await contar(
    "SELECT COUNT(*) AS n FROM alertas WHERE atendida = false",
  ),
});

const estadisticas = async () => {
  const [
    totalUsuarias,
    activas,
    desertoras,
    citasRealizadas,
    citasPendientes,
    citasConfirmadas,
    citasCanceladas,
    testsTotal,
    testsRiesgo,
    alertasPendientes,
    promedioAnimo,
    entradasDiario,
    mensajesTotal,
    empleosConseguidos,
    progresoPromedio,
    testimoniosPendientes,
    testimoniosPublicados,
    solicitudesNuevas,
    citasPorEstado,
    citasPorMes,
    testsPorMes,
    animoPorDia,
    nuevosPorMes,
    logrosPorMes,
  ] = await Promise.all([
    uno("SELECT COUNT(*) AS n FROM usuarias WHERE rol = 'usuaria'"),
    uno(`SELECT COUNT(DISTINCT u.id) AS n
               FROM usuarias u
              WHERE u.rol = 'usuaria' AND (
                    EXISTS (SELECT 1 FROM accesos a WHERE a.usuaria_id = u.id AND a.creado_en >= NOW() - INTERVAL '30 day')
                 OR EXISTS (SELECT 1 FROM citas c WHERE c.usuaria_id = u.id AND c.creado_en >= NOW() - INTERVAL '30 day')
                 OR EXISTS (SELECT 1 FROM diario_emocional d WHERE d.usuaria_id = u.id AND d.creado_en >= NOW() - INTERVAL '30 day')
                 OR EXISTS (SELECT 1 FROM tests_bienestar t WHERE t.usuaria_id = u.id AND t.creado_en >= NOW() - INTERVAL '30 day')
                 OR EXISTS (SELECT 1 FROM mensajes m WHERE m.usuaria_id = u.id AND m.creado_en >= NOW() - INTERVAL '30 day')
              )`),
    uno(`SELECT COUNT(*) AS n
               FROM usuarias u
              WHERE u.rol = 'usuaria'
                AND u.creado_en <= NOW() - INTERVAL '60 day'
                AND NOT EXISTS (SELECT 1 FROM accesos a WHERE a.usuaria_id = u.id AND a.creado_en >= NOW() - INTERVAL '60 day')
                AND NOT EXISTS (SELECT 1 FROM citas c WHERE c.usuaria_id = u.id AND c.creado_en >= NOW() - INTERVAL '60 day')
                AND NOT EXISTS (SELECT 1 FROM diario_emocional d WHERE d.usuaria_id = u.id AND d.creado_en >= NOW() - INTERVAL '60 day')
                AND NOT EXISTS (SELECT 1 FROM tests_bienestar t WHERE t.usuaria_id = u.id AND t.creado_en >= NOW() - INTERVAL '60 day')
                AND NOT EXISTS (SELECT 1 FROM mensajes m WHERE m.usuaria_id = u.id AND m.creado_en >= NOW() - INTERVAL '60 day')`),
    uno(
      "SELECT COUNT(*) AS n FROM citas WHERE estado = 'completada' OR (estado = 'confirmada' AND fecha_hora < (NOW() - INTERVAL '5 hour'))",
    ),
    uno("SELECT COUNT(*) AS n FROM citas WHERE estado = 'pendiente'"),
    uno("SELECT COUNT(*) AS n FROM citas WHERE estado = 'confirmada'"),
    uno("SELECT COUNT(*) AS n FROM citas WHERE estado = 'cancelada'"),
    uno("SELECT COUNT(*) AS n FROM tests_bienestar"),
    uno("SELECT COUNT(*) AS n FROM tests_bienestar WHERE riesgo = true"),
    uno("SELECT COUNT(*) AS n FROM alertas WHERE atendida = false"),
    uno(
      "SELECT ROUND(AVG(animo)::numeric, 1) AS n FROM diario_emocional WHERE fecha >= (NOW() - INTERVAL '5 hour')::date - INTERVAL '30 day'",
    ),
    uno("SELECT COUNT(*) AS n FROM diario_emocional"),
    uno("SELECT COUNT(*) AS n FROM mensajes"),
    uno("SELECT COUNT(*) AS n FROM logros_laborales"),
    uno(`SELECT ROUND(AVG(
                    (CASE WHEN EXISTS (SELECT 1 FROM citas c WHERE c.usuaria_id = u.id AND c.estado = 'completada') THEN 25 ELSE 0 END) +
                    (CASE WHEN EXISTS (SELECT 1 FROM diario_emocional d WHERE d.usuaria_id = u.id AND d.fecha >= (NOW() - INTERVAL '5 hour')::date - INTERVAL '30 day') THEN 25 ELSE 0 END) +
                    (CASE WHEN EXISTS (SELECT 1 FROM tests_bienestar t WHERE t.usuaria_id = u.id) THEN 25 ELSE 0 END) +
                    (CASE WHEN EXISTS (SELECT 1 FROM mensajes m WHERE m.usuaria_id = u.id) THEN 25 ELSE 0 END)
                )::numeric, 0) AS n
               FROM usuarias u WHERE u.rol = 'usuaria'`),
    uno("SELECT COUNT(*) AS n FROM testimonios WHERE estado = 'pendiente'"),
    uno("SELECT COUNT(*) AS n FROM testimonios WHERE estado = 'aprobado'"),
    uno("SELECT COUNT(*) AS n FROM solicitudes WHERE estado = 'nueva'"),
    consultar("SELECT estado, COUNT(*) AS n FROM citas GROUP BY estado"),
    consultar(`SELECT TO_CHAR(fecha_hora, 'YYYY-MM') AS mes, estado, COUNT(*) AS n
                     FROM citas
                    WHERE fecha_hora >= DATE_TRUNC('month', NOW() - INTERVAL '5 hour') - INTERVAL '5 month'
                    GROUP BY mes, estado ORDER BY mes`),
    consultar(`SELECT TO_CHAR(creado_en, 'YYYY-MM') AS mes, COUNT(*) AS total, SUM(CASE WHEN riesgo THEN 1 ELSE 0 END) AS riesgo
                     FROM tests_bienestar
                    WHERE creado_en >= DATE_TRUNC('month', NOW()) - INTERVAL '5 month'
                    GROUP BY mes ORDER BY mes`),
    consultar(`SELECT TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha, ROUND(AVG(animo)::numeric, 1) AS promedio, COUNT(*) AS n
                     FROM diario_emocional
                    WHERE fecha >= (NOW() - INTERVAL '5 hour')::date - INTERVAL '29 day'
                    GROUP BY fecha ORDER BY fecha`),
    consultar(`SELECT TO_CHAR(creado_en, 'YYYY-MM') AS mes, COUNT(*) AS n
                     FROM usuarias
                    WHERE rol = 'usuaria' AND creado_en >= DATE_TRUNC('month', NOW()) - INTERVAL '5 month'
                    GROUP BY mes ORDER BY mes`),
    consultar(`SELECT TO_CHAR(fecha, 'YYYY-MM') AS mes, COUNT(*) AS n
                     FROM logros_laborales
                    WHERE fecha >= (NOW() - INTERVAL '5 hour')::date - INTERVAL '5 month'
                    GROUP BY mes ORDER BY mes`),
  ]);

  const numero = (obj) => Number((obj && obj.n) || 0);
  const total = numero(totalUsuarias);
  const activasN = numero(activas);
  const promedio = promedioAnimo.n;

  return {
    generadoEn: new Date().toISOString(),
    totalUsuarias: total,
    usuariasActivas: activasN,
    usuariasInactivas: Math.max(total - activasN, 0),
    desercion: total ? Math.round((numero(desertoras) / total) * 1000) / 10 : 0,
    citasRealizadas: numero(citasRealizadas),
    citasPendientes: numero(citasPendientes),
    citasConfirmadas: numero(citasConfirmadas),
    citasCanceladas: numero(citasCanceladas),
    testsTotal: numero(testsTotal),
    testsRiesgo: numero(testsRiesgo),
    alertasPendientes: numero(alertasPendientes),
    promedioAnimo: promedio === null ? null : Number(promedio),
    entradasDiario: numero(entradasDiario),
    mensajesTotal: numero(mensajesTotal),
    empleosConseguidos: numero(empleosConseguidos),
    progresoPromedio: Number(progresoPromedio.n || 0),
    testimoniosPendientes: numero(testimoniosPendientes),
    testimoniosPublicados: numero(testimoniosPublicados),
    solicitudesNuevas: numero(solicitudesNuevas),
    citasPorEstado: citasPorEstado.map((f) => ({
      estado: f.estado,
      total: Number(f.n),
    })),
    citasPorMes: citasPorMes.map((f) => ({
      mes: f.mes,
      estado: f.estado,
      total: Number(f.n),
    })),
    testsPorMes: testsPorMes.map((f) => ({
      mes: f.mes,
      total: Number(f.total),
      riesgo: Number(f.riesgo || 0),
    })),
    animoPorDia: animoPorDia.map((f) => ({
      fecha: f.fecha,
      promedio: Number(f.promedio),
      registros: Number(f.n),
    })),
    nuevosPorMes: nuevosPorMes.map((f) => ({ mes: f.mes, total: Number(f.n) })),
    logrosPorMes: logrosPorMes.map((f) => ({ mes: f.mes, total: Number(f.n) })),
  };
};

module.exports = {
  AREAS,
  MOTIVOS,
  iniciar,
  crearUsuaria,
  usuariaPorEmail,
  usuariaPorId,
  usuariaConHash,
  cambiarHash,
  existeAdmin,
  listarUsuarias,
  registrarAcceso,
  existeProfesional,
  listarProfesionales,
  profesionalPorId,
  crearPerfilProfesional,
  crearProfesionalCompleto,
  actualizarPerfilProfesional,
  profesionalReciente,
  listarDisponibilidad,
  tieneDisponibilidad,
  reemplazarDisponibilidad,
  crearCita,
  citasDeUsuaria,
  citasDeProfesional,
  todasLasCitas,
  citaPorId,
  cambiarEstadoCita,
  hayConflictoCita,
  citasOcupadas,
  contarCitasActivasUsuaria,
  crearMensaje,
  mensajesConversacion,
  marcarMensajesLeidos,
  resumenConversacionesUsuaria,
  resumenConversacionesProfesional,
  guardarDiario,
  diarioDeUsuaria,
  diarioPorDia,
  guardarTest,
  historialTests,
  todosLosTests,
  crearAlerta,
  alertasDeProfesional,
  alertasAdmin,
  atenderAlerta,
  lineasAyuda,
  serviciosMapa,
  filtrosServicios,
  listarLogros,
  crearLogro,
  borrarLogro,
  crearTestimonio,
  testimoniosPublicos,
  listarTestimonios,
  estadoTestimonio,
  borrarTestimonio,
  crearSolicitud,
  listarSolicitudes,
  estadoSolicitud,
  borrarSolicitud,
  resumen,
  estadisticas,
};
