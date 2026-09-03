/* ============================================================================
   20-datos.js — Semilla de la demostración.
   Declara: const SEMILLA
   Los datos derivados (calificaciones, asistencias, entregas) se generan con un
   hash determinista: la demo se ve idéntica en cada equipo y en cada recarga.
   ========================================================================== */

const SEMILLA = (function construirSemilla() {

  /* --- ruido determinista: mismo texto, mismo número, siempre --- */
  function h(texto) {
    var x = 2166136261;
    for (var i = 0; i < texto.length; i++) {
      x ^= texto.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return ((x >>> 0) % 100000) / 100000;
  }
  function entre(texto, min, max) { return min + h(texto) * (max - min); }
  function red1(n) { return Math.round(n * 10) / 10; }
  function tope(n, min, max) { return Math.max(min, Math.min(max, n)); }

  /* ---------------------------------------------------------------- escuela */
  var escuela = {
    nombre: 'Colegio Altamira',
    lema: 'Rigor y oficio desde 1978',
    ciclo: '2025 – 2026',
    fundacion: 1978,
    direccion: 'Av. de los Fresnos 218, Col. Jardines de la Hacienda',
    ciudad: 'Santiago de Querétaro, Qro.',
    telefono: '(442) 214 88 30',
    email: 'contacto@colegioaltamira.mx',
    sitio: 'colegioaltamira.mx',
    colegiaturaMensual: 4800,
    moneda: 'MXN',
    horarioAtencion: 'Lunes a viernes, 7:30 a 15:00 h',
    sello: 'CA',
    diasHabiles: 'Lun–Vie',
    recargoPct: 5,
    mision: 'Formar personas que piensen con rigor, escriban con claridad y trabajen con oficio.',
    acercaDe: 'Colegio Altamira es una institución privada fundada en 1978. Trabajamos con grupos ' +
      'de menos de veinticinco personas, evaluación por parciales acumulativos y acompañamiento ' +
      'directo del claustro. Cada persona inscrita tiene acceso a su expediente académico completo: ' +
      'calificaciones, asistencia, materiales, entregas y estado de cuenta, en tiempo real.'
  };

  /* -------------------------------------------------------------- dirección */
  var direccion = {
    id: 'dir-01', rol: 'direccion',
    nombre: 'Mtra. Lucía Fernanda Bravo Estrada',
    cargo: 'Directora general',
    email: 'direccion@colegioaltamira.mx',
    telefono: '(442) 214 88 31',
    foto: null, iniciales: 'LB', color: '#6E3A63',
    desde: '2016-01-11',
    bio: 'Veintiséis años en gestión escolar. Dirige Altamira desde 2016, con foco en evaluación ' +
      'transparente y en que ninguna familia se entere tarde de un problema académico.'
  };

  /* ------------------------------------------------------------- profesores */
  var profesores = [
    {
      id: 'pr-01', rol: 'profesor', clave: 'D-104',
      nombre: 'Mtro. Emilio Cárdenas Rojo',
      email: 'emilio.cardenas@colegioaltamira.mx',
      foto: null, iniciales: 'EC', color: '#1B4B7A',
      titulo: 'Maestro en Matemáticas Aplicadas',
      telefono: '(442) 214 88 42',
      oficina: 'Edificio B, cubículo 12',
      horarioAsesoria: 'Martes y jueves, 13:00 a 15:00 h',
      bio: 'Enseño matemáticas y física desde hace catorce años. Mi apuesta es que nadie memorice ' +
        'un procedimiento sin haber entendido antes de dónde sale. Trabajo con parciales acumulativos ' +
        'y con un proyecto integrador por materia, porque un examen aislado no dice mucho de nadie.',
      areas: ['Cálculo', 'Álgebra lineal', 'Mecánica clásica', 'Modelación matemática', 'Python'],
      formacion: [
        { grado: 'Maestría en Matemáticas Aplicadas', institucion: 'CIMAT, Guanajuato', anio: '2013' },
        { grado: 'Licenciatura en Física', institucion: 'Universidad Autónoma de Querétaro', anio: '2009' },
        { grado: 'Diplomado en Didáctica de las Ciencias', institucion: 'Instituto Politécnico Nacional', anio: '2016' }
      ],
      experiencia: [
        { puesto: 'Coordinador del área de exactas', lugar: 'Colegio Altamira', periodo: '2019 – actual',
          detalle: 'Rediseño del plan de evaluación por pesos y del proyecto integrador de cada materia.' },
        { puesto: 'Profesor de matemáticas y física', lugar: 'Colegio Altamira', periodo: '2015 – 2019',
          detalle: 'Cálculo diferencial, mecánica y química general.' },
        { puesto: 'Instructor de olimpiada de matemáticas', lugar: 'Delegación Querétaro', periodo: '2011 – 2015',
          detalle: 'Preparación de la selección estatal; dos medallas nacionales de bronce.' }
      ],
      cv: { nombre: 'CV_Emilio_Cardenas_2025.pdf', tamano: '186 KB', actualizado: '2025-08-04', url: null },
      perfilPublico: true,
      ingreso: '2015-08-03', estatus: 'activo'
    },
    {
      id: 'pr-02', rol: 'profesor', clave: 'D-117',
      nombre: 'Mtra. Ximena Robles Alcántara',
      email: 'ximena.robles@colegioaltamira.mx',
      foto: null, iniciales: 'XR', color: '#16704F',
      titulo: 'Maestra en Literatura Hispánica',
      telefono: '(442) 214 88 47',
      oficina: 'Edificio A, cubículo 4',
      horarioAsesoria: 'Lunes y miércoles, 12:00 a 14:00 h',
      bio: 'Doy literatura, historia e inglés. Corrijo mucho y devuelvo rápido: un texto que se ' +
        'regresa tres semanas después ya no le sirve a nadie. Todo lo que pido leer se lee completo ' +
        'y se discute en clase; no hay resúmenes de resúmenes.',
      areas: ['Narrativa hispanoamericana', 'Redacción argumentativa', 'Historia de México', 'Inglés B2–C1'],
      formacion: [
        { grado: 'Maestría en Literatura Hispánica', institucion: 'El Colegio de México', anio: '2017' },
        { grado: 'Licenciatura en Letras Modernas', institucion: 'Universidad Nacional Autónoma de México', anio: '2012' },
        { grado: 'Certificación CELTA', institucion: 'Cambridge Assessment English', anio: '2014' }
      ],
      experiencia: [
        { puesto: 'Profesora de letras e historia', lugar: 'Colegio Altamira', periodo: '2019 – actual',
          detalle: 'Literatura y redacción, historia contemporánea, inglés B2 y apreciación artística.' },
        { puesto: 'Editora de mesa', lugar: 'Fondo Editorial de Querétaro', periodo: '2016 – 2019',
          detalle: 'Corrección de estilo y cuidado de edición de doce títulos de narrativa.' },
        { puesto: 'Tallerista de escritura creativa', lugar: 'Casa de la Cultura de Querétaro', periodo: '2013 – 2018',
          detalle: 'Taller anual de cuento para público general.' }
      ],
      cv: { nombre: 'CV_Ximena_Robles_2025.pdf', tamano: '204 KB', actualizado: '2025-07-28', url: null },
      perfilPublico: true,
      ingreso: '2019-08-05', estatus: 'activo'
    }
  ];

  /* ---------------------------------------------------------------- alumnos */
  var alumnos = [
    {
      id: 'al-01', rol: 'alumno', matricula: 'A-2431',
      nombre: 'Renata Solís Ibarra',
      email: 'renata.solis@alumnos.colegioaltamira.mx',
      foto: null, iniciales: 'RS', color: '#6E3A63',
      nacimiento: '2007-03-14', telefono: '(442) 331 90 22',
      tutor: { nombre: 'Adriana Ibarra Peña', parentesco: 'Madre', telefono: '(442) 118 44 09', email: 'adriana.ibarra@correo.mx' },
      ingreso: '2023-08-21', estatus: 'activo', becaPct: 20,
      notas: 'Beca por promedio desde el ciclo 2024–2025. Representa al colegio en olimpiada de matemáticas.'
    },
    {
      id: 'al-02', rol: 'alumno', matricula: 'A-2447',
      nombre: 'Diego Alonso Menchaca Ruiz',
      email: 'diego.menchaca@alumnos.colegioaltamira.mx',
      foto: null, iniciales: 'DM', color: '#2C7793',
      nacimiento: '2007-07-02', telefono: '(442) 240 17 65',
      tutor: { nombre: 'Fernando Menchaca Lara', parentesco: 'Padre', telefono: '(442) 240 17 60', email: 'f.menchaca@correo.mx' },
      ingreso: '2023-08-21', estatus: 'activo', becaPct: 0,
      notas: 'Solicitó cambio de horario de asesoría de física para el segundo periodo.'
    },
    {
      id: 'al-03', rol: 'alumno', matricula: 'A-2452',
      nombre: 'Valeria Nájera Quintanar',
      email: 'valeria.najera@alumnos.colegioaltamira.mx',
      foto: null, iniciales: 'VN', color: '#A9762A',
      nacimiento: '2007-11-28', telefono: '(442) 502 33 18',
      tutor: { nombre: 'Rocío Quintanar Vela', parentesco: 'Madre', telefono: '(442) 502 33 10', email: 'rocio.quintanar@correo.mx' },
      ingreso: '2024-01-15', estatus: 'activo', becaPct: 0,
      notas: 'Ausencias justificadas del 6 al 10 de octubre por incapacidad médica.'
    },
    {
      id: 'al-04', rol: 'alumno', matricula: 'A-2468',
      nombre: 'Mateo Ibarra Sandoval',
      email: 'mateo.ibarra@alumnos.colegioaltamira.mx',
      foto: null, iniciales: 'MI', color: '#9C4A3D',
      nacimiento: '2008-01-09', telefono: '(442) 774 65 03',
      tutor: { nombre: 'Silvia Sandoval Arroyo', parentesco: 'Madre', telefono: '(442) 774 65 00', email: 'silvia.sandoval@correo.mx' },
      ingreso: '2024-08-19', estatus: 'condicionado', becaPct: 0,
      notas: 'Bajo seguimiento académico desde el 22 de octubre. Compromiso firmado con la tutora: ' +
        'asesoría obligatoria de cálculo los martes.'
    },
    {
      id: 'al-05', rol: 'alumno', matricula: 'A-2473',
      nombre: 'Camila Ferrer Ochoa',
      email: 'camila.ferrer@alumnos.colegioaltamira.mx',
      foto: null, iniciales: 'CF', color: '#16704F',
      nacimiento: '2007-05-21', telefono: '(442) 190 78 41',
      tutor: { nombre: 'Héctor Ferrer Ocampo', parentesco: 'Padre', telefono: '(442) 190 78 40', email: 'hector.ferrer@correo.mx' },
      ingreso: '2024-08-19', estatus: 'activo', becaPct: 40,
      notas: 'Beca de excelencia (40%). Coordina el taller de lectura de los viernes.'
    }
  ];

  /* --------------------------------------------------------------- materias */
  var materias = [
    { id: 'mat-01', codigo: 'MAT-210', nombre: 'Cálculo Diferencial', profesorId: 'pr-01',
      creditos: 8, aula: 'B-204', cupo: 24, color: '#1B4B7A', estatus: 'activa',
      horario: [{ dia: 'Lun', inicio: '07:30', fin: '09:00' }, { dia: 'Mié', inicio: '07:30', fin: '09:00' }, { dia: 'Vie', inicio: '09:10', fin: '10:40' }],
      descripcion: 'Límites, continuidad, derivada y sus aplicaciones. Se trabaja con problemas de razón de cambio tomados de física y economía.' },

    { id: 'mat-02', codigo: 'FIS-140', nombre: 'Física: Mecánica', profesorId: 'pr-01',
      creditos: 7, aula: 'Lab. 2', cupo: 22, color: '#2C7793', estatus: 'activa',
      horario: [{ dia: 'Mar', inicio: '09:10', fin: '10:40' }, { dia: 'Jue', inicio: '09:10', fin: '11:00' }],
      descripcion: 'Cinemática, leyes de Newton, trabajo y energía. Ocho prácticas de laboratorio con reporte escrito.' },

    { id: 'mat-03', codigo: 'QUI-120', nombre: 'Química General', profesorId: 'pr-01',
      creditos: 6, aula: 'Lab. 1', cupo: 22, color: '#16704F', estatus: 'activa',
      horario: [{ dia: 'Lun', inicio: '11:10', fin: '12:40' }, { dia: 'Mié', inicio: '11:10', fin: '12:40' }],
      descripcion: 'Estructura atómica, enlace, estequiometría y disoluciones. Bitácora de laboratorio obligatoria.' },

    { id: 'mat-04', codigo: 'INF-105', nombre: 'Pensamiento Computacional', profesorId: 'pr-01',
      creditos: 5, aula: 'Centro de cómputo', cupo: 20, color: '#6E3A63', estatus: 'activa',
      horario: [{ dia: 'Vie', inicio: '11:10', fin: '13:00' }],
      descripcion: 'Descomposición de problemas, algoritmos y estructuras de datos básicas en Python. Sin requisitos previos.' },

    { id: 'mat-05', codigo: 'LET-230', nombre: 'Literatura y Redacción', profesorId: 'pr-02',
      creditos: 7, aula: 'A-108', cupo: 24, color: '#A9762A', estatus: 'activa',
      horario: [{ dia: 'Lun', inicio: '09:10', fin: '10:40' }, { dia: 'Jue', inicio: '07:30', fin: '09:00' }],
      descripcion: 'Lectura de seis novelas hispanoamericanas y taller de ensayo argumentativo con tres entregas corregidas.' },

    { id: 'mat-06', codigo: 'HIS-118', nombre: 'Historia de México Contemporáneo', profesorId: 'pr-02',
      creditos: 6, aula: 'A-112', cupo: 26, color: '#9C4A3D', estatus: 'activa',
      horario: [{ dia: 'Mar', inicio: '07:30', fin: '09:00' }, { dia: 'Vie', inicio: '07:30', fin: '09:00' }],
      descripcion: 'De la Revolución al presente, con trabajo directo sobre fuentes: prensa, fotografía y testimonio oral.' },

    { id: 'mat-07', codigo: 'ING-160', nombre: 'Inglés B2', profesorId: 'pr-02',
      creditos: 5, aula: 'A-105', cupo: 20, color: '#1B4B7A', estatus: 'activa',
      horario: [{ dia: 'Mar', inicio: '11:10', fin: '12:40' }, { dia: 'Jue', inicio: '11:10', fin: '12:40' }],
      descripcion: 'Comprensión y producción de nivel B2 del Marco Común Europeo. Evaluación por las cuatro habilidades.' },

    { id: 'mat-08', codigo: 'ART-112', nombre: 'Apreciación Artística', profesorId: 'pr-02',
      creditos: 4, aula: 'Aula magna', cupo: 30, color: '#2C7793', estatus: 'activa',
      horario: [{ dia: 'Mié', inicio: '13:00', fin: '14:30' }],
      descripcion: 'Recorrido por artes visuales, música y escena. Incluye dos visitas guiadas al Museo de Arte de Querétaro.' }
  ];

  /* ----------------------------------------------------------- inscripciones */
  var mapaInscripcion = {
    'al-01': ['mat-01', 'mat-02', 'mat-03', 'mat-05', 'mat-06', 'mat-07'],
    'al-02': ['mat-01', 'mat-02', 'mat-04', 'mat-06', 'mat-07'],
    'al-03': ['mat-01', 'mat-03', 'mat-05', 'mat-07', 'mat-08'],
    'al-04': ['mat-01', 'mat-02', 'mat-04', 'mat-05', 'mat-08'],
    'al-05': ['mat-01', 'mat-03', 'mat-04', 'mat-05', 'mat-06', 'mat-08']
  };
  var inscripciones = [];
  var ni = 1;
  Object.keys(mapaInscripcion).forEach(function (aid) {
    mapaInscripcion[aid].forEach(function (mid) {
      inscripciones.push({ id: 'ins-' + (ni++), alumnoId: aid, materiaId: mid });
    });
  });

  /* ------------------------------------------------------------ evaluaciones */
  /* Cinco evaluaciones por materia. Las cuatro primeras ya están calificadas;
     el tercer parcial (5 de diciembre) todavía no. */
  var plantillaEval = [
    { clave: 'p1', nombre: 'Primer parcial',      tipo: 'parcial',  peso: 0.25, fecha: '2025-09-19', calificada: true },
    { clave: 'ta', nombre: 'Tareas y ejercicios', tipo: 'tarea',    peso: 0.15, fecha: '2025-10-03', calificada: true },
    { clave: 'p2', nombre: 'Segundo parcial',     tipo: 'parcial',  peso: 0.25, fecha: '2025-10-17', calificada: true },
    { clave: 'pr', nombre: 'Proyecto integrador', tipo: 'proyecto', peso: 0.15, fecha: '2025-11-07', calificada: true },
    { clave: 'p3', nombre: 'Tercer parcial',      tipo: 'parcial',  peso: 0.20, fecha: '2025-12-05', calificada: false }
  ];
  var evaluaciones = [];
  materias.forEach(function (m, im) {
    plantillaEval.forEach(function (p, ip) {
      evaluaciones.push({
        id: 'ev-' + String(im + 1).padStart(2, '0') + '-' + p.clave,
        materiaId: m.id, nombre: p.nombre, tipo: p.tipo, peso: p.peso, fecha: p.fecha
      });
    });
  });

  /* ----------------------------------------------------------- calificaciones */
  /* Perfil de cada alumno: nivel base, dispersión y afinidad por área. */
  var perfil = {
    'al-01': { base: 9.2, disp: 0.5, exactas: 0.4,  letras: 0.0,  asistencia: 0.97 },
    'al-02': { base: 8.3, disp: 0.8, exactas: 0.2,  letras: -0.3, asistencia: 0.93 },
    'al-03': { base: 7.5, disp: 1.1, exactas: -0.4, letras: 0.5,  asistencia: 0.84 },
    'al-04': { base: 6.3, disp: 1.2, exactas: -0.5, letras: 0.2,  asistencia: 0.76 },
    'al-05': { base: 8.9, disp: 0.6, exactas: 0.1,  letras: 0.4,  asistencia: 0.96 }
  };
  var esExacta = { 'mat-01': 1, 'mat-02': 1, 'mat-03': 1, 'mat-04': 1 };
  /* El tercer parcial se acerca; la tendencia sube o baja según el alumno. */
  var deriva = { 'p1': -0.25, 'ta': 0.35, 'p2': 0.0, 'pr': 0.3 };

  var calificaciones = [];
  var nc = 1;
  inscripciones.forEach(function (ins) {
    var pf = perfil[ins.alumnoId];
    var afin = esExacta[ins.materiaId] ? pf.exactas : pf.letras;
    plantillaEval.forEach(function (p) {
      if (!p.calificada) return;
      var im = materias.findIndex(function (m) { return m.id === ins.materiaId; });
      var evId = 'ev-' + String(im + 1).padStart(2, '0') + '-' + p.clave;
      var llave = ins.alumnoId + ins.materiaId + p.clave;
      var ruido = (h(llave) - 0.5) * 2 * pf.disp;
      var valor = red1(tope(pf.base + afin + deriva[p.clave] + ruido, 3.5, 10));
      calificaciones.push({
        id: 'cal-' + (nc++),
        alumnoId: ins.alumnoId, evaluacionId: evId,
        valor: valor, capturadaEl: p.fecha,
        capturadaPor: materias[im].profesorId
      });
    });
  });

  /* ------------------------------------------------------------- asistencias */
  var asistencias = [];
  var na = 1;
  inscripciones.forEach(function (ins) {
    var pf = perfil[ins.alumnoId];
    var totales = 28 + Math.round(entre(ins.materiaId + 'tot', 0, 12));
    var tasa = tope(pf.asistencia + (h(ins.alumnoId + ins.materiaId) - 0.5) * 0.14, 0.55, 1);
    asistencias.push({
      id: 'as-' + (na++),
      alumnoId: ins.alumnoId, materiaId: ins.materiaId,
      presentes: Math.round(totales * tasa), totales: totales
    });
  });

  /* ------------------------------------------------------------------ tareas */
  var tareas = [
    { id: 'tar-01', materiaId: 'mat-01', titulo: 'Serie 7: regla de la cadena', tipo: 'tarea',
      descripcion: 'Problemas 12 a 30 del cuadernillo. Entregar el procedimiento completo, no sólo el resultado.',
      vence: '2025-11-17', puntos: 10, publicadaEl: '2025-11-10', archivo: { nombre: 'Serie_07_cadena.pdf', tamano: '412 KB' } },
    { id: 'tar-02', materiaId: 'mat-01', titulo: 'Proyecto: modelo de razón de cambio', tipo: 'proyecto',
      descripcion: 'Elegir un fenómeno medible, levantar datos durante una semana y ajustar un modelo derivable.',
      vence: '2025-11-21', puntos: 20, publicadaEl: '2025-10-30', archivo: null },
    { id: 'tar-03', materiaId: 'mat-02', titulo: 'Reporte de práctica 6: plano inclinado', tipo: 'tarea',
      descripcion: 'Formato de reporte de laboratorio con propagación de incertidumbre.',
      vence: '2025-11-14', puntos: 10, publicadaEl: '2025-11-06', archivo: { nombre: 'Formato_reporte_lab.pdf', tamano: '96 KB' } },
    { id: 'tar-04', materiaId: 'mat-03', titulo: 'Estequiometría: problemario 4', tipo: 'tarea',
      descripcion: 'Reactivo limitante y rendimiento porcentual. Diez problemas.',
      vence: '2025-11-07', puntos: 10, publicadaEl: '2025-10-30', archivo: null },
    { id: 'tar-05', materiaId: 'mat-04', titulo: 'Algoritmo de ordenamiento comentado', tipo: 'proyecto',
      descripcion: 'Implementar dos ordenamientos en Python y comparar sus tiempos con 10 000 elementos.',
      vence: '2025-11-28', puntos: 20, publicadaEl: '2025-11-07', archivo: null },
    { id: 'tar-06', materiaId: 'mat-05', titulo: 'Ensayo 3: sobre "Pedro Páramo"', tipo: 'proyecto',
      descripcion: 'Mil doscientas palabras, tesis explícita en el primer párrafo y dos citas del texto.',
      vence: '2025-11-18', puntos: 20, publicadaEl: '2025-11-04', archivo: { nombre: 'Rubrica_ensayo_3.pdf', tamano: '128 KB' } },
    { id: 'tar-07', materiaId: 'mat-05', titulo: 'Lectura: "Aura", de Carlos Fuentes', tipo: 'lectura',
      descripcion: 'Leer completa. Se discute en la sesión del jueves; habrá control de lectura.',
      vence: '2025-11-13', puntos: 5, publicadaEl: '2025-11-03', archivo: null },
    { id: 'tar-08', materiaId: 'mat-06', titulo: 'Análisis de fuente: prensa de 1968', tipo: 'tarea',
      descripcion: 'Comparar la cobertura de dos diarios sobre un mismo hecho. Ficha de análisis adjunta.',
      vence: '2025-11-20', puntos: 15, publicadaEl: '2025-11-08', archivo: { nombre: 'Ficha_analisis_fuente.pdf', tamano: '74 KB' } },
    { id: 'tar-09', materiaId: 'mat-07', titulo: 'Writing task: opinion essay', tipo: 'tarea',
      descripcion: '250 words. Topic: "Should schools publish teacher ratings?" Linkers required.',
      vence: '2025-11-10', puntos: 10, publicadaEl: '2025-11-03', archivo: null },
    { id: 'tar-10', materiaId: 'mat-08', titulo: 'Bitácora de visita: Museo de Arte de Querétaro', tipo: 'tarea',
      descripcion: 'Tres obras, ficha técnica y media cuartilla de lectura personal de cada una.',
      vence: '2025-11-26', puntos: 15, publicadaEl: '2025-11-12', archivo: null },
    { id: 'tar-11', materiaId: 'mat-06', titulo: 'Línea del tiempo comentada: 1968–1994', tipo: 'proyecto',
      descripcion: 'Doce hitos con fuente citada y un párrafo propio de interpretación en cada uno.',
      vence: '2025-10-31', puntos: 20, publicadaEl: '2025-10-13', archivo: null },
    { id: 'tar-12', materiaId: 'mat-04', titulo: 'Ejercicio 5: condicionales y ciclos', tipo: 'tarea',
      descripcion: 'Ocho ejercicios en Python. Se revisa que corra, no sólo que esté escrito.',
      vence: '2025-11-03', puntos: 10, publicadaEl: '2025-10-27', archivo: null }
  ];

  /* ---------------------------------------------------------------- entregas */
  /* Atrasos fijados a mano: son los que sostienen las alertas de la demo
     (Mateo bajo seguimiento; Valeria estuvo incapacitada en octubre). */
  var atrasosFijos = {
    'al-04|tar-07': 1, 'al-04|tar-12': 1, 'al-04|tar-04': 1,
    'al-03|tar-09': 1, 'al-02|tar-11': 1
  };
  var entregas = [];
  var ne = 1;
  tareas.forEach(function (t) {
    inscripciones.filter(function (i) { return i.materiaId === t.materiaId; }).forEach(function (ins) {
      var pf = perfil[ins.alumnoId];
      var r = h(ins.alumnoId + t.id);
      var vencida = t.vence < '2025-11-14';
      /* Quien falta más a clase también entrega tarde con más frecuencia. */
      var umbralAtraso = (1 - pf.asistencia) * 1.15;
      var estado, fecha = null, calif = null;
      if (vencida) {
        if (atrasosFijos[ins.alumnoId + '|' + t.id] || r < umbralAtraso) {
          estado = 'atrasada';
        } else if (r < umbralAtraso + 0.18) {
          estado = 'entregada';                 /* llegó a tiempo pero aún sin revisar */
          fecha = t.vence;
        } else {
          estado = 'revisada';
          fecha = t.vence;
          calif = red1(tope(pf.base + (h(t.id + ins.alumnoId) - 0.45) * 2, 4, 10));
        }
      } else {
        estado = r < 0.32 ? 'entregada' : 'pendiente';
        if (estado === 'entregada') fecha = '2025-11-12';
      }
      entregas.push({
        id: 'ent-' + (ne++), tareaId: t.id, alumnoId: ins.alumnoId,
        estado: estado, fecha: fecha, calificacion: calif
      });
    });
  });

  /* -------------------------------------------------------------- materiales */
  var materiales = [
    { id: 'mtr-01', materiaId: 'mat-01', titulo: 'Notas de clase: la derivada como razón de cambio', tipo: 'pdf',
      descripcion: 'Veintidós páginas con los ejemplos que vimos en el pizarrón.', subidoEl: '2025-11-11', tamano: '1.4 MB', autorId: 'pr-01', url: null },
    { id: 'mtr-02', materiaId: 'mat-01', titulo: 'Formulario de derivadas', tipo: 'hoja',
      descripcion: 'Una hoja. Se permite en el tercer parcial.', subidoEl: '2025-10-28', tamano: '88 KB', autorId: 'pr-01', url: null },
    { id: 'mtr-03', materiaId: 'mat-01', titulo: 'Resolución del segundo parcial', tipo: 'video',
      descripcion: 'Grabación de 38 minutos con la resolución completa, problema por problema.', subidoEl: '2025-10-21', tamano: '—', autorId: 'pr-01', url: null },
    { id: 'mtr-04', materiaId: 'mat-02', titulo: 'Manual de prácticas de laboratorio', tipo: 'pdf',
      descripcion: 'Las ocho prácticas del periodo, con material y procedimiento.', subidoEl: '2025-08-26', tamano: '3.1 MB', autorId: 'pr-01', url: null },
    { id: 'mtr-05', materiaId: 'mat-02', titulo: 'Simulador de plano inclinado (PhET)', tipo: 'liga',
      descripcion: 'Para reproducir la práctica 6 antes de venir al laboratorio.', subidoEl: '2025-11-05', tamano: '—', autorId: 'pr-01', url: null },
    { id: 'mtr-06', materiaId: 'mat-03', titulo: 'Tabla periódica anotada', tipo: 'pdf',
      descripcion: 'Con electronegatividades y radios atómicos.', subidoEl: '2025-09-02', tamano: '640 KB', autorId: 'pr-01', url: null },
    { id: 'mtr-07', materiaId: 'mat-04', titulo: 'Cuaderno de Python: listas y diccionarios', tipo: 'presentacion',
      descripcion: 'Cuarenta celdas con ejercicios resueltos y otros diez para practicar.', subidoEl: '2025-11-07', tamano: '512 KB', autorId: 'pr-01', url: null },
    { id: 'mtr-08', materiaId: 'mat-05', titulo: 'Rúbrica del ensayo argumentativo', tipo: 'pdf',
      descripcion: 'Los cinco criterios con los que califico. No hay sorpresas.', subidoEl: '2025-11-04', tamano: '128 KB', autorId: 'pr-02', url: null },
    { id: 'mtr-09', materiaId: 'mat-05', titulo: 'Antología del periodo', tipo: 'pdf',
      descripcion: 'Seis cuentos y dos capítulos de novela en versión de lectura.', subidoEl: '2025-08-25', tamano: '2.8 MB', autorId: 'pr-02', url: null },
    { id: 'mtr-10', materiaId: 'mat-06', titulo: 'Cronología comentada 1910–2000', tipo: 'presentacion',
      descripcion: 'Ochenta diapositivas con imagen de archivo y pie de fuente.', subidoEl: '2025-10-14', tamano: '9.2 MB', autorId: 'pr-02', url: null },
    { id: 'mtr-11', materiaId: 'mat-07', titulo: 'Linkers and connectors — cheat sheet', tipo: 'hoja',
      descripcion: 'Una página. Úsenla en el writing task.', subidoEl: '2025-11-09', tamano: '64 KB', autorId: 'pr-02', url: null },
    { id: 'mtr-12', materiaId: 'mat-08', titulo: 'Guía de la visita al Museo de Arte', tipo: 'pdf',
      descripcion: 'Mapa de salas y las tres obras obligatorias de la bitácora.', subidoEl: '2025-11-12', tamano: '1.1 MB', autorId: 'pr-02', url: null }
  ];

  /* ------------------------------------------------------------------ avisos */
  var avisos = [
    { id: 'av-01', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Calendario del tercer parcial', prioridad: 'alta', fecha: '2025-11-12',
      cuerpo: 'El tercer parcial se aplica del 1 al 5 de diciembre en el horario normal de cada materia. ' +
        'El calendario detallado por aula ya está publicado en la cartelera del edificio A y en el portal.' },
    { id: 'av-02', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Colegiatura de noviembre', prioridad: 'normal', fecha: '2025-11-03',
      cuerpo: 'La colegiatura de noviembre vence el día 5. A partir del día 10 se aplica el recargo del 5% ' +
        'previsto en el reglamento. En la sección de Pagos pueden consultar su estado de cuenta al día.' },
    { id: 'av-03', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Suspensión de labores: 17 de noviembre', prioridad: 'normal', fecha: '2025-11-10',
      cuerpo: 'El lunes 17 de noviembre no habrá clases por consejo técnico. Las asesorías de la tarde ' +
        'se recorren al martes 18 en el mismo horario.' },
    { id: 'av-04', autorId: 'pr-01', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-01',
      titulo: 'Asesoría extra antes del tercer parcial', prioridad: 'normal', fecha: '2025-11-11',
      cuerpo: 'Abro una asesoría adicional el jueves 27 de noviembre de 13:00 a 15:00 en B-204. ' +
        'Vengan con problemas concretos; no voy a repetir la clase.' },
    { id: 'av-05', autorId: 'pr-02', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-05',
      titulo: 'Cambio de fecha del control de lectura', prioridad: 'alta', fecha: '2025-11-08',
      cuerpo: 'El control de lectura de "Aura" se recorre al jueves 20. Aprovechen la semana extra: ' +
        'la novela es corta pero pide una segunda lectura.' },
    { id: 'av-06', autorId: 'pr-01', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-02',
      titulo: 'Práctica 6: traer calculadora y regla', prioridad: 'normal', fecha: '2025-11-06',
      cuerpo: 'El jueves hacemos el plano inclinado. Sin calculadora científica no se puede levantar el reporte.' }
  ];

  /* ------------------------------------------------------------------- pagos */
  var periodos = [
    { periodo: '2025-08', concepto: 'Inscripción ciclo 2025–2026', monto: 9600, vence: '2025-08-05' },
    { periodo: '2025-08b', concepto: 'Colegiatura de agosto 2025', monto: 4800, vence: '2025-08-05' },
    { periodo: '2025-09', concepto: 'Colegiatura de septiembre 2025', monto: 4800, vence: '2025-09-05' },
    { periodo: '2025-10', concepto: 'Colegiatura de octubre 2025', monto: 4800, vence: '2025-10-05' },
    { periodo: '2025-11', concepto: 'Colegiatura de noviembre 2025', monto: 4800, vence: '2025-11-05' }
  ];
  /* Estado por alumno y periodo: P = pagado, V = vencido, N = pendiente */
  var estadoPagos = {
    'al-01': ['P', 'P', 'P', 'P', 'P'],
    'al-02': ['P', 'P', 'P', 'P', 'N'],
    'al-03': ['P', 'P', 'P', 'V', 'N'],
    'al-04': ['P', 'P', 'V', 'V', 'N'],
    'al-05': ['P', 'P', 'P', 'P', 'P']
  };
  var metodos = ['Transferencia SPEI', 'Tarjeta de débito', 'Depósito en ventanilla', 'Domiciliación'];
  var pagos = [];
  var np = 1;
  alumnos.forEach(function (a) {
    estadoPagos[a.id].forEach(function (est, k) {
      var p = periodos[k];
      var monto = Math.round(p.monto * (1 - a.becaPct / 100));
      var estado = est === 'P' ? 'pagado' : (est === 'V' ? 'vencido' : 'pendiente');
      var recargo = estado === 'vencido' ? Math.round(monto * 0.05) : 0;
      var diaPago = 1 + Math.floor(entre(a.id + p.periodo, 0, 4));
      pagos.push({
        id: 'pag-' + String(np++).padStart(3, '0'),
        alumnoId: a.id, concepto: p.concepto, periodo: p.periodo,
        monto: monto, vence: p.vence, estado: estado,
        pagadoEl: estado === 'pagado' ? p.vence.slice(0, 8) + String(diaPago).padStart(2, '0') : null,
        metodo: estado === 'pagado' ? metodos[Math.floor(entre(a.id + p.periodo + 'm', 0, 3.99))] : null,
        referencia: 'ALT-' + p.periodo.replace('-', '') + '-' + a.matricula.replace('A-', ''),
        recargo: recargo
      });
    });
  });

  /* ----------------------------------------------------------------- reseñas */
  var resenas = [
    { id: 'res-01', profesorId: 'pr-01', alumnoId: 'al-01', materiaId: 'mat-01', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 4, puntualidad: 5 },
      comentario: 'Explica de dónde sale cada fórmula antes de usarla, y eso cambia todo. Las asesorías del ' +
        'martes valen mucho más que la clase misma porque ahí sí se detiene con cada quien.',
      fecha: '2025-10-24', estado: 'publica', anonima: false,
      respuesta: { texto: 'Gracias, Renata. La asesoría del martes seguirá abierta todo diciembre.', fecha: '2025-10-25' } },

    { id: 'res-02', profesorId: 'pr-01', alumnoId: 'al-05', materiaId: 'mat-03', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 5, puntualidad: 4 },
      comentario: 'La bitácora de laboratorio parecía puro trámite y terminó siendo lo más útil del semestre. ' +
        'Regresa las correcciones escritas a mano, una por una.',
      fecha: '2025-10-30', estado: 'publica', anonima: false, respuesta: null },

    { id: 'res-03', profesorId: 'pr-01', alumnoId: 'al-02', materiaId: 'mat-02', estrellas: 4,
      criterios: { claridad: 4, dominio: 5, trato: 4, puntualidad: 3 },
      comentario: 'Muy bueno en el pizarrón. Lo único: los reportes de laboratorio tardan en regresar y a veces ' +
        'ya estamos en la práctica siguiente sin saber qué salió mal en la anterior.',
      fecha: '2025-11-06', estado: 'pendiente', anonima: true, respuesta: null },

    { id: 'res-04', profesorId: 'pr-01', alumnoId: 'al-04', materiaId: 'mat-01', estrellas: 3,
      criterios: { claridad: 3, dominio: 5, trato: 3, puntualidad: 4 },
      comentario: 'Sabe muchísimo pero va rápido. Si te quedas atrás en la primera media hora, ya no alcanzas ' +
        'el resto de la clase.',
      fecha: '2025-11-09', estado: 'pendiente', anonima: true, respuesta: null },

    { id: 'res-05', profesorId: 'pr-02', alumnoId: 'al-03', materiaId: 'mat-05', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 5, puntualidad: 5 },
      comentario: 'Devuelve los ensayos corregidos en menos de una semana, con comentarios línea por línea. ' +
        'Nunca había mejorado tanto escribiendo.',
      fecha: '2025-10-18', estado: 'publica', anonima: false,
      respuesta: { texto: 'Me alegra, Valeria. Insiste con la tesis del primer párrafo: ahí estaba el nudo.', fecha: '2025-10-19' } },

    { id: 'res-06', profesorId: 'pr-02', alumnoId: 'al-01', materiaId: 'mat-06', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 5, puntualidad: 4 },
      comentario: 'Trabajar con periódicos de la época en lugar de un libro de texto hace que la historia se ' +
        'sienta discutible y no memorizable.',
      fecha: '2025-11-02', estado: 'publica', anonima: false, respuesta: null },

    { id: 'res-07', profesorId: 'pr-02', alumnoId: 'al-05', materiaId: 'mat-08', estrellas: 4,
      criterios: { claridad: 4, dominio: 5, trato: 5, puntualidad: 4 },
      comentario: 'Las visitas al museo son lo mejor de la materia. La parte de música se siente más apurada ' +
        'que el resto del programa.',
      fecha: '2025-11-10', estado: 'pendiente', anonima: false, respuesta: null },

    { id: 'res-08', profesorId: 'pr-02', alumnoId: 'al-04', materiaId: 'mat-05', estrellas: 2,
      criterios: { claridad: 3, dominio: 4, trato: 2, puntualidad: 3 },
      comentario: 'Comentario retirado por la persona docente: contenía datos personales de un tercero.',
      fecha: '2025-10-28', estado: 'oculta', anonima: true, respuesta: null }
  ];

  /* ---------------------------------------------------------------- bitácora */
  var bitacora = [
    { id: 'bit-01', fecha: '2025-11-12', actorId: 'dir-01', texto: 'Publicó el aviso «Calendario del tercer parcial».' },
    { id: 'bit-02', fecha: '2025-11-11', actorId: 'pr-01', texto: 'Subió «Notas de clase: la derivada como razón de cambio» a Cálculo Diferencial.' },
    { id: 'bit-03', fecha: '2025-11-09', actorId: 'pr-02', texto: 'Capturó las calificaciones del proyecto integrador de Literatura y Redacción.' },
    { id: 'bit-04', fecha: '2025-11-07', actorId: 'pr-01', texto: 'Cerró la captura del proyecto integrador en sus cuatro materias.' },
    { id: 'bit-05', fecha: '2025-10-25', actorId: 'pr-01', texto: 'Respondió una reseña pública de Cálculo Diferencial.' },
    { id: 'bit-06', fecha: '2025-10-22', actorId: 'dir-01', texto: 'Cambió a «condicionado» el estatus de Mateo Ibarra Sandoval.' }
  ];

  return {
    version: 3,
    contador: 100,
    escuela: escuela,
    direccion: direccion,
    profesores: profesores,
    alumnos: alumnos,
    materias: materias,
    inscripciones: inscripciones,
    evaluaciones: evaluaciones,
    calificaciones: calificaciones,
    asistencias: asistencias,
    tareas: tareas,
    entregas: entregas,
    materiales: materiales,
    avisos: avisos,
    pagos: pagos,
    resenas: resenas,
    bitacora: bitacora
  };
})();
