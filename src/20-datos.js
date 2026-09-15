/* ============================================================================
   20-datos.js — Semilla de la demostración: The Livingstone.
   Declara: const SEMILLA
   Los datos derivados (materias por grado, calificaciones, asistencias,
   entregas, pagos) se generan con un hash determinista: la demo se ve idéntica
   en cada equipo y en cada recarga.
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
  function dos(n) { return n < 10 ? '0' + n : String(n); }

  var ACENTOS = { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n' };
  function llano(t) {
    return String(t).toLowerCase().replace(/[áéíóúüñ]/g, function (c) { return ACENTOS[c] || c; });
  }
  /* Tratamientos que no forman parte del nombre para correo e iniciales. */
  var TRATOS = { 'mtro.': 1, 'mtra.': 1, 'miss': 1, 'teacher': 1, 'lic.': 1, 'prof.': 1, 'dr.': 1, 'dra.': 1 };
  function partesNombre(nombre) {
    return String(nombre).split(/\s+/).filter(function (p) { return p && !TRATOS[llano(p)]; });
  }
  function usuario(nombre) {
    var p = partesNombre(nombre);
    return llano((p[0] || 'persona') + '.' + (p[1] || '')).replace(/[^a-z0-9.]/g, '').replace(/\.$/, '');
  }
  function inic(nombre) {
    var p = partesNombre(nombre);
    return ((p[0] || '?').charAt(0) + (p[1] || '?').charAt(0)).toUpperCase();
  }
  function archivoCV(nombre) {
    return 'CV_' + llano(partesNombre(nombre).slice(0, 2).join('_')).replace(/[^a-z_]/g, '') + '_2025.pdf';
  }

  var PALETA = ['#273E55', '#4175FC', '#1F6F63', '#6C8299', '#5C3A6E', '#9C4A3D'];
  function color(i) { return PALETA[i % PALETA.length]; }

  var DOM = 'colegiodlivingstone.edu.mx';
  var DOM_AL = 'alumnos.colegiodlivingstone.edu.mx';

  /* ---------------------------------------------------------------- escuela */
  var escuela = {
    nombre: 'The Livingstone',
    nombreLargo: 'Colegio The Livingstone',
    lema: 'Esfuérzate y sé valiente',
    ciclo: '2025 – 2026',
    fundacion: 1983,
    direccion: 'Av. Clavería 12, Col. Clavería, Azcapotzalco',
    ciudad: 'Ciudad de México, C.P. 02080',
    telefono: '55 9347 8415',
    telefono2: '55 9347 8416',
    whatsapp: '55 7459 1723',
    email: 'contacto@cdl.edu.mx',
    buzon: 'tuvoz@cdl.edu.mx',
    sitio: 'colegiodlivingstone.edu.mx',
    colegiaturaMensual: 5450,
    moneda: 'MXN',
    horarioAtencion: 'Lunes a viernes, 7:30 a 15:00 h',
    sello: 'TL',
    diasHabiles: 'Lun–Vie',
    recargoPct: 5,
    mision: 'Brindar una de las mejores experiencias de vida a nuestros alumnos, a través de una ' +
      'calidad educativa y un alto compromiso humano, inculcándoles una pasión por la excelencia ' +
      'académica, espiritual y profesional.',
    vision: 'Ser una institución acreditada académicamente que enfatiza la integración de principios ' +
      'y valores universales.',
    valores: ['Amor al prójimo', 'Honestidad', 'Servicio', 'Trabajo en equipo',
      'Calidad en el servicio', 'Respeto', 'Gratitud'],
    acercaDe: 'The Livingstone es una institución de gran prestigio fundada en 1983. Como parte del ' +
      'Proyecto Educativo Livingstone, fue concebido con la visión de transformar a México con alumnos ' +
      'capaces de entender lo verdaderamente importante de la vida, para así cambiar a la sociedad al ' +
      'formar familias edificadas con los valores adquiridos en nuestros centros educativos. A partir ' +
      'del ciclo escolar 2014 el colegio evolucionó para ofrecer una formación a la altura de nuestra ' +
      'época global: nuestra bandera es la formación bicultural con los fuertes valores que siempre nos ' +
      'han caracterizado.',
    excelencia: 'Buscamos la excelencia académica y la integridad. La calidad humana, la honestidad, la ' +
      'capacitación del profesorado, la instrumentación del modelo educativo, la integración de las ' +
      'artes, la tecnología de punta y la renovación permanente de nuestras instalaciones crean el ' +
      'marco idóneo para que florezca la excelencia.',
    cita: {
      texto: 'Iré a cualquier parte siempre y cuando sea hacia adelante.',
      autor: 'David Livingstone'
    },
    indicadores: [
      { valor: '15K+', etiqueta: 'Alumnos egresados' },
      { valor: '50+', etiqueta: 'Profesores capacitados' },
      { valor: '12+', etiqueta: 'Actividades After Class' },
      { valor: '40+', etiqueta: 'Años de trayectoria' }
    ],
    pilares: [
      { icono: 'escudo', titulo: 'Identidad',
        texto: 'En The Livingstone los estudiantes se sienten aceptados y comprendidos; nuestra ' +
          'comunidad se fortalece con la calidad humana y la excelencia académica.' },
      { icono: 'estrella', titulo: 'Valores',
        texto: 'Buscamos la excelencia académica y la integridad humana a través de un modelo ' +
          'educativo basado en altos valores humanos.' },
      { icono: 'chat', titulo: 'Idiomas',
        texto: 'Nuestro enfoque bicultural prepara a los alumnos para certificarse en inglés con ' +
          'Cambridge y Oxford, mientras aprenden también francés.' },
      { icono: 'engrane', titulo: 'Robótica',
        texto: 'Experiencia práctica con los últimos lenguajes y tecnologías de programación.' },
      { icono: 'foto', titulo: 'Arte',
        texto: 'Nuestros alumnos utilizan los recursos, elementos y materiales de las artes para ' +
          'expresar sus ideas, sentimientos y emociones.' },
      { icono: 'grafica', titulo: 'Ciencias exactas',
        texto: 'El alto nivel educativo en matemáticas nos permite estar dentro de los primeros ' +
          'lugares de la prueba MARSA.' }
    ],
    alianzas: [
      { nombre: 'Dallas Baptist University', sigla: 'DBU',
        texto: 'Formamos parte del Dallas Baptist Global Community, una red de escuelas interesadas en ' +
          'formar una nueva generación de líderes: becas académicas y deportivas, talleres virtuales de ' +
          'desarrollo profesional y créditos universitarios adelantados para bachillerato.' },
      { nombre: 'Knotion', sigla: 'KN',
        texto: 'Ecosistema de aprendizaje transdisciplinario que incorpora la tecnología al aula desde ' +
          'preescolar, con el Impact Model como eje de los proyectos.' },
      { nombre: 'Oxford Education', sigla: 'OX',
        texto: 'Por más de diez años aplicamos exámenes de certificación internacional de Oxford, del ' +
          'nivel A1 al C2 del Marco Común Europeo, incluida la entrevista oral en línea.' },
      { nombre: 'University of Cambridge', sigla: 'CAM',
        texto: 'Somos centro de preparación y aplicación: Starters en 2º de primaria, Movers en 4º, ' +
          'Flyers en 6º, y Preliminary (B1) o First (B2) en 3º de secundaria.' }
    ],
    afterclass: [
      { grupo: 'Deportivas', icono: 'usuarios',
        actividades: ['Tae Kwon Do', 'Fútbol', 'Basquetball', 'Voleyball', 'Ajedrez'] },
      { grupo: 'Arte y danza', icono: 'foto',
        actividades: ['Danza moderna', 'Danza folclórica', 'Música', 'Pintura', 'Teatro'] },
      { grupo: 'Culturales', icono: 'libro',
        actividades: ['Club de tareas', 'Escuela de idiomas', 'Club de robótica'] }
    ],
    afterclassTexto: 'Diseñado para las familias que por sus horarios de trabajo requieren ampliar el ' +
      'tiempo de permanencia de sus hijos en el colegio, After Class ofrece actividades culturales, ' +
      'deportivas y supervisión de las tareas escolares.',
    internacional: [
      { lugar: 'Reino Unido',
        detalle: 'Estancias de quince días con acompañamiento docente las veinticuatro horas. Los ' +
          'alumnos se hospedan en campus universitarios, toman clases de perfeccionamiento del idioma y ' +
          'conocen Cambridge, Oxford y Londres.' },
      { lugar: 'Dallas Baptist University',
        detalle: 'Campamento de verano de una semana para alumnos de quince a dieciocho años: clases, ' +
          'conferencias, seminarios y trabajo comunitario junto a jóvenes de todo el mundo.' }
    ],
    redes: [
      { nombre: 'Facebook', usuario: '/TheLivingstoneCDMX' },
      { nombre: 'Instagram', usuario: '@thelivingstone_cdmx' },
      { nombre: 'YouTube', usuario: 'The Livingstone' }
    ]
  };

  /* ---------------------------------------------------------------- niveles */
  var niveles = [
    {
      id: 'niv-pre', nombre: 'Preescolar', orden: 1, color: '#6C8299',
      edades: '3 a 6 años', colegiatura: 4350, inscripcion: 8700,
      certificacion: 'Plataforma Knotion desde el primer grado',
      descripcion: 'El programa de preescolar promueve el uso del lenguaje y la comunicación, e integra ' +
        'los campos formativos de manera que los alumnos desarrollen habilidades y capacidades que les ' +
        'permitan desenvolverse con seguridad. El uso de la plataforma Knotion les da las herramientas ' +
        'para iniciarse en el uso de la tecnología en el ámbito educativo.'
    },
    {
      id: 'niv-pri', nombre: 'Primaria', orden: 2, color: '#1F6F63',
      edades: '6 a 12 años', colegiatura: 5100, inscripcion: 10200,
      certificacion: 'Cambridge Starters (2º), Movers (4º) y Flyers (6º)',
      descripcion: 'Un programa académico bicultural integral y sólido, con experiencias de aprendizaje ' +
        'significativas que ayudan a nuestros estudiantes a desarrollar su potencial en un entorno de ' +
        'cuidado y afecto. Se introduce una tercera lengua, el francés, y se trabajan talleres de ' +
        'teatro, gimnasia y música, manteniéndonos a la vanguardia en el uso de la tecnología.'
    },
    {
      id: 'niv-sec', nombre: 'Secundaria', orden: 3, color: '#4175FC',
      edades: '12 a 15 años', colegiatura: 5850, inscripcion: 11700,
      certificacion: 'Cambridge Preliminary (B1) o First Certificate (B2) en 3º',
      descripcion: 'El Modelo Educativo Bicultural tiene un enfoque basado en proyectos: con referencia ' +
        'al Impact Model del ecosistema Knotion, se promueve que los jóvenes identifiquen fuentes ' +
        'fidedignas de información, las analicen críticamente y elaboren propuestas de forma ' +
        'colaborativa. Al concluir, los alumnos están en aptitud de presentar un examen de ' +
        'certificación internacional hasta nivel B2.'
    },
    {
      id: 'niv-bac', nombre: 'Bachillerato', orden: 4, color: '#273E55',
      edades: '15 a 18 años', colegiatura: 6600, inscripcion: 13200,
      certificacion: 'Oxford Education y Cambridge hasta nivel C1',
      descripcion: 'La currícula de bachillerato responde a las necesidades del mundo actual y las ' +
        'proyecta hacia la vida laboral: contabilidad, creación de contenido digital, manejo de ' +
        'habilidades socioemocionales, apoyo vocacional y un nivel alto de inglés con preparación para ' +
        'exámenes de certificación internacional hasta nivel C1.'
    }
  ];

  /* ----------------------------------------------------------------- grados */
  var PLAN_GRADOS = [
    { nivelId: 'niv-pre', cuantos: 3, nace: 2021, aula: 'K' },
    { nivelId: 'niv-pri', cuantos: 6, nace: 2018, aula: 'P' },
    { nivelId: 'niv-sec', cuantos: 3, nace: 2012, aula: 'S' },
    { nivelId: 'niv-bac', cuantos: 3, nace: 2009, aula: 'B' }
  ];
  var CLAVE_NIVEL = { 'niv-pre': 'pre', 'niv-pri': 'pri', 'niv-sec': 'sec', 'niv-bac': 'bac' };

  /* Profesor titular (tutor de grupo) de cada grado. */
  var TITULARES = {
    'gr-pre-1': 'pr-01', 'gr-pre-2': 'pr-01', 'gr-pre-3': 'pr-02',
    'gr-pri-1': 'pr-03', 'gr-pri-2': 'pr-03', 'gr-pri-3': 'pr-03',
    'gr-pri-4': 'pr-04', 'gr-pri-5': 'pr-04', 'gr-pri-6': 'pr-05',
    'gr-sec-1': 'pr-10', 'gr-sec-2': 'pr-09', 'gr-sec-3': 'pr-12',
    'gr-bac-1': 'pr-11', 'gr-bac-2': 'pr-13', 'gr-bac-3': 'pr-14'
  };

  var grados = [];
  PLAN_GRADOS.forEach(function (p) {
    var nv = niveles.filter(function (n) { return n.id === p.nivelId; })[0];
    for (var g = 1; g <= p.cuantos; g++) {
      var id = 'gr-' + CLAVE_NIVEL[p.nivelId] + '-' + g;
      grados.push({
        id: id,
        nivelId: p.nivelId,
        numero: g,
        etiqueta: g + 'º de ' + nv.nombre,
        corto: g + 'º ' + nv.nombre,
        grupo: 'A',
        aula: p.aula + '-' + dos(g * 10 + 1),
        cupo: 24,
        tutorId: TITULARES[id],
        nacimiento: p.nace + (g - 1)
      });
    }
  });

  function grado(id) { return grados.filter(function (g) { return g.id === id; })[0]; }

  /* -------------------------------------------------------------- dirección */
  var direccion = {
    id: 'dir-01', rol: 'direccion',
    nombre: 'Mtra. Rebeca Villaseñor Argüelles',
    cargo: 'Directora general',
    email: 'direccion@' + DOM,
    telefono: '55 9347 8415',
    foto: null, iniciales: 'RV', color: '#2E4159',
    desde: '2015-08-03',
    bio: 'Veintidós años en gestión escolar y egresada del propio colegio. Dirige The Livingstone desde ' +
      '2015, el ciclo en que la institución consolidó el modelo bicultural y la alianza con Knotion. ' +
      'Sostiene dos reglas: que ninguna familia se entere tarde de un problema académico y que cada ' +
      'grado, de preescolar a bachillerato, tenga un titular que responda por su grupo.'
  };

  /* ------------------------------------------------------------- profesores */
  /* Los campos repetitivos (correo, iniciales, color, teléfono, CV) se
     completan más abajo para no escribirlos catorce veces. */
  var profesores = [
    {
      id: 'pr-01', clave: 'D-101', nombre: 'Miss Paulina Cázares Lomelí',
      titulo: 'Licenciada en Educación Preescolar · Certificación Knotion',
      oficina: 'Edificio Kínder, sala de maestras', horarioAsesoria: 'Martes y jueves, 13:00 a 14:30 h',
      ingreso: '2016-08-01', cvKb: 168,
      bio: 'Doy los campos formativos de preescolar desde hace doce años. A los tres y cuatro años nadie ' +
        'aprende quieto: aquí se aprende moviéndose, cantando y tocando las cosas. La tableta entra a la ' +
        'sala cuando aporta algo que el material concreto no puede dar, no antes.',
      areas: ['Campos formativos', 'Lenguaje y comunicación', 'Pensamiento matemático', 'Knotion', 'Motricidad'],
      formacion: [
        { grado: 'Licenciatura en Educación Preescolar', institucion: 'Escuela Nacional para Maestras de Jardines de Niños', anio: '2012' },
        { grado: 'Diplomado en Estimulación Temprana', institucion: 'Universidad Panamericana', anio: '2015' },
        { grado: 'Certificación Knotion Educator', institucion: 'Knotion', anio: '2019' }
      ],
      experiencia: [
        { puesto: 'Coordinadora de preescolar', lugar: 'The Livingstone', periodo: '2021 – actual',
          detalle: 'Articulación de los tres grados con la plataforma Knotion y el programa de lectura en casa.' },
        { puesto: 'Titular de 2º de preescolar', lugar: 'The Livingstone', periodo: '2016 – 2021',
          detalle: 'Grupo de veintidós alumnos y proyecto anual de expresión oral.' },
        { puesto: 'Educadora', lugar: 'Instituto Simón Bolívar, Azcapotzalco', periodo: '2012 – 2016',
          detalle: 'Primer y segundo grado de preescolar.' }
      ]
    },
    {
      id: 'pr-02', clave: 'D-104', nombre: 'Teacher Melissa Aguirre Fonseca',
      titulo: 'Licenciada en Enseñanza del Inglés · CELTA',
      oficina: 'Edificio Kínder, cubículo 2', horarioAsesoria: 'Lunes y miércoles, 13:00 a 14:30 h',
      ingreso: '2017-08-07', cvKb: 152,
      bio: 'English for Kids y el primer tramo de primaria. En preescolar el inglés no se estudia: se vive. ' +
        'Canciones, rutinas y órdenes sencillas todos los días, hasta que el idioma deja de ser una materia ' +
        'y se vuelve la lengua en la que piden permiso para ir por agua.',
      areas: ['English for Kids', 'CLIL', 'Phonics', 'Cambridge Young Learners'],
      formacion: [
        { grado: 'Licenciatura en Enseñanza del Inglés', institucion: 'Universidad del Valle de México', anio: '2015' },
        { grado: 'Certificación CELTA', institucion: 'Cambridge Assessment English', anio: '2017' },
        { grado: 'Teaching Young Learners', institucion: 'Oxford Education', anio: '2020' }
      ],
      experiencia: [
        { puesto: 'Titular de 3º de preescolar y English for Kids', lugar: 'The Livingstone', periodo: '2019 – actual',
          detalle: 'Puente entre preescolar y el CLIL de primaria; prepara a los grupos para Starters.' },
        { puesto: 'Teacher de inglés, preescolar', lugar: 'The Livingstone', periodo: '2017 – 2019',
          detalle: 'Tres grupos diarios con enfoque de inmersión total.' },
        { puesto: 'Instructora de inglés infantil', lugar: 'Harmon Hall', periodo: '2015 – 2017',
          detalle: 'Cursos sabatinos para niños de cuatro a ocho años.' }
      ]
    },
    {
      id: 'pr-03', clave: 'D-112', nombre: 'Mtra. Gabriela Ordóñez Rueda',
      titulo: 'Maestra en Educación Básica · Titular de primaria baja',
      oficina: 'Edificio A, cubículo 3', horarioAsesoria: 'Martes y jueves, 13:30 a 15:00 h',
      ingreso: '2013-08-05', cvKb: 194,
      bio: 'Español de primero a sexto. Empiezo con la letra y termino con el ensayo. Leo en voz alta todos ' +
        'los días, incluso en sexto, porque un niño que no oye leer bien no escribe bien. Corrijo con tinta ' +
        'de color y devuelvo al día siguiente: una corrección que llega tarde no corrige nada.',
      areas: ['Español', 'Lectoescritura', 'Comprensión lectora', 'Ortografía', 'Redacción'],
      formacion: [
        { grado: 'Maestría en Educación Básica', institucion: 'Universidad Pedagógica Nacional', anio: '2016' },
        { grado: 'Licenciatura en Educación Primaria', institucion: 'Benemérita Escuela Nacional de Maestros', anio: '2009' },
        { grado: 'Diplomado en Comprensión Lectora', institucion: 'ILCE', anio: '2018' }
      ],
      experiencia: [
        { puesto: 'Titular de primaria baja', lugar: 'The Livingstone', periodo: '2018 – actual',
          detalle: 'Tutoría de 1º a 3º y coordinación del programa de lectura en voz alta.' },
        { puesto: 'Profesora de español, primaria', lugar: 'The Livingstone', periodo: '2013 – 2018',
          detalle: 'Los seis grados, con taller de escritura al cierre de cada parcial.' },
        { puesto: 'Docente frente a grupo', lugar: 'Escuela Primaria Ignacio Ramírez, CDMX', periodo: '2009 – 2013',
          detalle: 'Grupos de treinta y ocho alumnos en turno matutino.' }
      ]
    },
    {
      id: 'pr-04', clave: 'D-118', nombre: 'Mtro. Rodrigo Salazar Bermúdez',
      titulo: 'Maestro en Didáctica de las Matemáticas',
      oficina: 'Edificio A, cubículo 7', horarioAsesoria: 'Lunes y miércoles, 13:30 a 15:00 h',
      ingreso: '2014-08-04', cvKb: 210,
      bio: 'Matemáticas de primaria y preparación para la prueba MARSA. Nadie memoriza un algoritmo antes ' +
        'de entender de dónde sale: primero material concreto, luego dibujo, al final el número. El ' +
        'resultado es que en quinto ya discuten estrategias en lugar de esperar a que yo diga si está bien.',
      areas: ['Matemáticas', 'Resolución de problemas', 'MARSA', 'Cálculo mental', 'Geometría'],
      formacion: [
        { grado: 'Maestría en Didáctica de las Matemáticas', institucion: 'Universidad Autónoma Metropolitana', anio: '2017' },
        { grado: 'Licenciatura en Educación Primaria', institucion: 'Benemérita Escuela Nacional de Maestros', anio: '2011' },
        { grado: 'Diplomado en Olimpiada de Matemáticas', institucion: 'Sociedad Matemática Mexicana', anio: '2019' }
      ],
      experiencia: [
        { puesto: 'Titular de primaria alta', lugar: 'The Livingstone', periodo: '2019 – actual',
          detalle: 'Tutoría de 4º y 5º; entrenador de la selección del colegio para la olimpiada.' },
        { puesto: 'Profesor de matemáticas, primaria', lugar: 'The Livingstone', periodo: '2014 – 2019',
          detalle: 'Rediseño del plan de cálculo mental diario.' },
        { puesto: 'Asesor pedagógico', lugar: 'Editorial Santillana', periodo: '2012 – 2014',
          detalle: 'Capacitación docente sobre el material de matemáticas de primaria.' }
      ]
    },
    {
      id: 'pr-05', clave: 'D-123', nombre: 'Mtra. Ana Lucía Peña Mondragón',
      titulo: 'Bióloga · Maestra en Divulgación de la Ciencia',
      oficina: 'Laboratorio 1', horarioAsesoria: 'Martes, 13:00 a 15:00 h',
      ingreso: '2018-08-06', cvKb: 176,
      bio: 'Ciencias naturales en primaria y titular de sexto. Tengo una regla: cada unidad abre con algo ' +
        'que se pueda ver, oler o medir; el cuaderno viene después. El huerto del patio trasero lo ' +
        'sostienen los de cuarto desde hace tres años y ahí se entienden mejor los ciclos que en ' +
        'cualquier lámina.',
      areas: ['Ciencias naturales', 'Método científico', 'Educación ambiental', 'Huerto escolar'],
      formacion: [
        { grado: 'Maestría en Divulgación de la Ciencia', institucion: 'Universidad Nacional Autónoma de México', anio: '2018' },
        { grado: 'Licenciatura en Biología', institucion: 'Universidad Autónoma Metropolitana', anio: '2014' },
        { grado: 'Diplomado en Indagación Científica en el Aula', institucion: 'Innovec', anio: '2021' }
      ],
      experiencia: [
        { puesto: 'Titular de 6º y profesora de ciencias', lugar: 'The Livingstone', periodo: '2021 – actual',
          detalle: 'Feria de ciencias de fin de ciclo y proyecto del huerto escolar.' },
        { puesto: 'Profesora de ciencias naturales', lugar: 'The Livingstone', periodo: '2018 – 2021',
          detalle: 'Los seis grados de primaria, con bitácora de laboratorio desde tercero.' },
        { puesto: 'Talleres de ciencia para niños', lugar: 'Universum, Museo de las Ciencias', periodo: '2015 – 2018',
          detalle: 'Diseño e impartición de talleres de fin de semana.' }
      ]
    },
    {
      id: 'pr-06', clave: 'D-127', nombre: 'Teacher Jonathan Beltrán Cruz',
      titulo: 'Licenciado en Lengua Inglesa · Cambridge Speaking Examiner',
      oficina: 'Edificio A, cubículo 9', horarioAsesoria: 'Miércoles y viernes, 13:00 a 14:30 h',
      ingreso: '2016-08-01', cvKb: 188,
      bio: 'English CLIL de tercero a sexto y responsable de los exámenes Cambridge de primaria. Doy ' +
        'ciencia e historia en inglés, no clases de inglés: el idioma se aprende usándolo para algo. Soy ' +
        'examinador oral certificado, así que el simulacro de aquí se parece mucho al examen de verdad.',
      areas: ['CLIL', 'Cambridge Starters, Movers y Flyers', 'Speaking', 'Reading comprehension'],
      formacion: [
        { grado: 'Licenciatura en Lengua Inglesa', institucion: 'Universidad Nacional Autónoma de México', anio: '2013' },
        { grado: 'Certificación TKT módulos 1 a 3', institucion: 'Cambridge Assessment English', anio: '2015' },
        { grado: 'Cambridge Speaking Examiner (YLE)', institucion: 'Cambridge Assessment English', anio: '2019' }
      ],
      experiencia: [
        { puesto: 'Coordinador de certificaciones de primaria', lugar: 'The Livingstone', periodo: '2020 – actual',
          detalle: 'Calendario de simulacros y aplicación de Starters, Movers y Flyers.' },
        { puesto: 'Teacher de English CLIL', lugar: 'The Livingstone', periodo: '2016 – 2020',
          detalle: 'Ciencias y estudios sociales en inglés de 3º a 6º.' },
        { puesto: 'Instructor de inglés', lugar: 'Berlitz México', periodo: '2013 – 2016',
          detalle: 'Cursos intensivos para adolescentes y adultos.' }
      ]
    },
    {
      id: 'pr-07', clave: 'D-131', nombre: 'Mtra. Sofía Mendieta Lara',
      titulo: 'Maestra en Enseñanza del Francés · DALF C1',
      oficina: 'Edificio A, cubículo 11', horarioAsesoria: 'Jueves, 13:00 a 15:00 h',
      ingreso: '2019-08-05', cvKb: 164,
      bio: 'Francés en primaria, la tercera lengua de la casa. Un niño que ya se maneja en dos idiomas ' +
        'puede con un tercero si se le presenta como juego y no como obligación. Trabajo con canción, ' +
        'cocina y cómic; en sexto ya sostienen una conversación sencilla y escriben una postal sin ayuda.',
      areas: ['Francés A1–A2', 'Fonética', 'Cultura francófona', 'DELF Prim'],
      formacion: [
        { grado: 'Maestría en Enseñanza del Francés como Lengua Extranjera', institucion: 'Universidad de Guadalajara', anio: '2019' },
        { grado: 'Licenciatura en Lenguas Modernas', institucion: 'Universidad Nacional Autónoma de México', anio: '2015' },
        { grado: 'Diploma DALF C1', institucion: 'Alliance Française', anio: '2017' }
      ],
      experiencia: [
        { puesto: 'Profesora de francés, primaria', lugar: 'The Livingstone', periodo: '2019 – actual',
          detalle: 'Los seis grados y preparación al DELF Prim A1.' },
        { puesto: 'Profesora de francés', lugar: 'Alliance Française de México', periodo: '2016 – 2019',
          detalle: 'Cursos infantiles y de adolescentes, niveles A1 a B1.' },
        { puesto: 'Asistente de lengua española', lugar: 'Académie de Lyon, Francia', periodo: '2015 – 2016',
          detalle: 'Programa de asistentes de lengua en dos liceos.' }
      ]
    },
    {
      id: 'pr-08', clave: 'D-136', nombre: 'Mtro. Ernesto Galindo Rivas',
      titulo: 'Ingeniero en Mecatrónica · Maestro en Tecnología Educativa',
      oficina: 'Laboratorio de robótica', horarioAsesoria: 'Lunes y miércoles, 14:00 a 15:30 h',
      ingreso: '2015-08-03', cvKb: 232,
      bio: 'Robótica y tecnología, de tercero de primaria a tercero de secundaria. En primaria armamos y ' +
        'programamos por bloques; en secundaria ya escribimos Python y controlamos sensores. Lo que ' +
        'califico no es el robot bonito: es la bitácora donde se ve qué falló y qué hicieron para ' +
        'corregirlo.',
      areas: ['Robótica educativa', 'Python', 'Programación por bloques', 'Impresión 3D', 'Pensamiento computacional'],
      formacion: [
        { grado: 'Maestría en Tecnología Educativa', institucion: 'Tecnológico de Monterrey', anio: '2018' },
        { grado: 'Ingeniería en Mecatrónica', institucion: 'Instituto Politécnico Nacional', anio: '2012' },
        { grado: 'Certificación LEGO Education Academy', institucion: 'LEGO Education', anio: '2016' }
      ],
      experiencia: [
        { puesto: 'Responsable del laboratorio de robótica', lugar: 'The Livingstone', periodo: '2018 – actual',
          detalle: 'Equipo del colegio en la FIRST LEGO League y club de robótica de After Class.' },
        { puesto: 'Profesor de tecnología', lugar: 'The Livingstone', periodo: '2015 – 2018',
          detalle: 'Programación por bloques en primaria y proyectos de secundaria.' },
        { puesto: 'Ingeniero de automatización', lugar: 'Grupo Industrial Vasconia', periodo: '2012 – 2015',
          detalle: 'Celdas automatizadas de la línea de producción.' }
      ]
    },
    {
      id: 'pr-09', clave: 'D-142', nombre: 'Mtro. Iván Carreño Padilla',
      titulo: 'Maestro en Matemáticas Aplicadas',
      oficina: 'Edificio B, cubículo 4', horarioAsesoria: 'Martes y jueves, 13:30 a 15:00 h',
      ingreso: '2012-08-06', cvKb: 246,
      bio: 'Matemáticas de secundaria y bachillerato. Trabajo con parciales acumulativos: lo de septiembre ' +
        'se vuelve a preguntar en diciembre, porque una materia que se olvida al terminar el parcial no se ' +
        'aprendió. Entreno a los equipos que presentan MARSA y la olimpiada, y ahí los resultados hablan.',
      areas: ['Álgebra', 'Geometría analítica', 'Cálculo diferencial', 'Probabilidad', 'MARSA', 'Olimpiada'],
      formacion: [
        { grado: 'Maestría en Matemáticas Aplicadas', institucion: 'Centro de Investigación en Matemáticas (CIMAT)', anio: '2011' },
        { grado: 'Licenciatura en Física y Matemáticas', institucion: 'Instituto Politécnico Nacional', anio: '2008' },
        { grado: 'Diplomado en Didáctica de las Ciencias Exactas', institucion: 'Universidad Iberoamericana', anio: '2016' }
      ],
      experiencia: [
        { puesto: 'Coordinador del área de exactas', lugar: 'The Livingstone', periodo: '2017 – actual',
          detalle: 'Plan de evaluación por pesos y preparación a MARSA en secundaria y bachillerato.' },
        { puesto: 'Profesor de matemáticas', lugar: 'The Livingstone', periodo: '2012 – 2017',
          detalle: 'Secundaria y bachillerato, con asesoría abierta dos tardes por semana.' },
        { puesto: 'Entrenador de olimpiada', lugar: 'Delegación CDMX, Olimpiada Mexicana de Matemáticas', periodo: '2010 – 2016',
          detalle: 'Preparación de la preselección; dos medallas nacionales de bronce.' }
      ]
    },
    {
      id: 'pr-10', clave: 'D-147', nombre: 'Mtra. Renata Ocampo Villalobos',
      titulo: 'Maestra en Literatura Hispánica',
      oficina: 'Edificio B, cubículo 6', horarioAsesoria: 'Lunes y miércoles, 13:00 a 14:30 h',
      ingreso: '2016-08-01', cvKb: 198,
      bio: 'Español y literatura en secundaria y bachillerato. Todo lo que pido leer se lee completo y se ' +
        'discute en clase: no hay resúmenes de resúmenes. Devuelvo los ensayos corregidos línea por línea ' +
        'en menos de una semana, porque un texto que se regresa tres semanas después ya no le sirve a nadie.',
      areas: ['Literatura hispanoamericana', 'Redacción argumentativa', 'Ortografía', 'Oratoria', 'Debate'],
      formacion: [
        { grado: 'Maestría en Literatura Hispánica', institucion: 'El Colegio de México', anio: '2016' },
        { grado: 'Licenciatura en Letras Hispánicas', institucion: 'Universidad Nacional Autónoma de México', anio: '2012' },
        { grado: 'Diplomado en Escritura Creativa', institucion: 'Universidad del Claustro de Sor Juana', anio: '2019' }
      ],
      experiencia: [
        { puesto: 'Titular de 1º de secundaria y profesora de letras', lugar: 'The Livingstone', periodo: '2019 – actual',
          detalle: 'Club de debate y concurso de oratoria del colegio.' },
        { puesto: 'Profesora de español y literatura', lugar: 'The Livingstone', periodo: '2016 – 2019',
          detalle: 'Secundaria y bachillerato, con tres entregas corregidas por parcial.' },
        { puesto: 'Correctora de estilo', lugar: 'Fondo de Cultura Económica', periodo: '2013 – 2016',
          detalle: 'Cuidado de edición de catorce títulos de narrativa y ensayo.' }
      ]
    },
    {
      id: 'pr-11', clave: 'D-153', nombre: 'Mtro. Samuel Arriaga Quintero',
      titulo: 'Químico Farmacéutico Biólogo · Maestro en Enseñanza de las Ciencias',
      oficina: 'Laboratorio 2', horarioAsesoria: 'Martes y viernes, 13:30 a 15:00 h',
      ingreso: '2014-08-04', cvKb: 220,
      bio: 'Ciencias de secundaria y bachillerato: biología, física y química según el grado. Ocho ' +
        'prácticas de laboratorio por parcial, todas con reporte escrito y propagación de incertidumbre ' +
        'desde secundaria. Prefiero un experimento que salió mal y está bien explicado que uno perfecto ' +
        'y copiado.',
      areas: ['Biología', 'Física', 'Química', 'Laboratorio', 'Método científico'],
      formacion: [
        { grado: 'Maestría en Enseñanza de las Ciencias', institucion: 'Universidad Autónoma Metropolitana', anio: '2015' },
        { grado: 'Químico Farmacéutico Biólogo', institucion: 'Universidad Nacional Autónoma de México', anio: '2010' },
        { grado: 'Diplomado en Seguridad en Laboratorios Escolares', institucion: 'Instituto Politécnico Nacional', anio: '2018' }
      ],
      experiencia: [
        { puesto: 'Titular de 1º de bachillerato y jefe de laboratorios', lugar: 'The Livingstone', periodo: '2019 – actual',
          detalle: 'Protocolo de seguridad y calendario de prácticas de los dos laboratorios.' },
        { puesto: 'Profesor de ciencias', lugar: 'The Livingstone', periodo: '2014 – 2019',
          detalle: 'Biología, física y química en secundaria y bachillerato.' },
        { puesto: 'Analista de control de calidad', lugar: 'Laboratorios Liomont', periodo: '2010 – 2014',
          detalle: 'Validación de métodos analíticos.' }
      ]
    },
    {
      id: 'pr-12', clave: 'D-158', nombre: 'Mtra. Alejandra Pons Escamilla',
      titulo: 'Maestra en Historia · Licenciada en Filosofía',
      oficina: 'Edificio B, cubículo 8', horarioAsesoria: 'Miércoles, 13:00 a 15:00 h',
      ingreso: '2017-08-07', cvKb: 182,
      bio: 'Historia, formación cívica y filosofía. Trabajo con fuentes directas: prensa de la época, ' +
        'fotografía y testimonio oral, para que la historia se sienta discutible y no memorizable. En ' +
        'bachillerato la clase termina siendo un debate y mi trabajo es que nadie opine sin haber leído.',
      areas: ['Historia de México', 'Historia universal', 'Formación cívica y ética', 'Filosofía', 'Análisis de fuentes'],
      formacion: [
        { grado: 'Maestría en Historia', institucion: 'Universidad Nacional Autónoma de México', anio: '2017' },
        { grado: 'Licenciatura en Filosofía', institucion: 'Universidad Nacional Autónoma de México', anio: '2013' },
        { grado: 'Diplomado en Educación en Derechos Humanos', institucion: 'Comisión Nacional de los Derechos Humanos', anio: '2020' }
      ],
      experiencia: [
        { puesto: 'Titular de 3º de secundaria', lugar: 'The Livingstone', periodo: '2020 – actual',
          detalle: 'Acompañamiento del grupo de salida y proyecto de historia oral del barrio de Clavería.' },
        { puesto: 'Profesora de historia y civismo', lugar: 'The Livingstone', periodo: '2017 – 2020',
          detalle: 'Secundaria y bachillerato, con trabajo de archivo por parcial.' },
        { puesto: 'Investigadora asistente', lugar: 'Instituto Mora', periodo: '2014 – 2017',
          detalle: 'Proyecto de historia oral del siglo XX mexicano.' }
      ]
    },
    {
      id: 'pr-13', clave: 'D-164', nombre: 'Teacher Claudia Fierro Navarrete',
      titulo: 'Licenciada en Lengua Inglesa · CPE C2 · Oxford Test Supervisor',
      oficina: 'Edificio B, cubículo 10', horarioAsesoria: 'Lunes y jueves, 13:30 a 15:00 h',
      ingreso: '2013-08-05', cvKb: 214,
      bio: 'English de secundaria y bachillerato, y responsable de las certificaciones Cambridge y Oxford ' +
        'del colegio. Aplicamos dos simulacros antes del examen real para saber en qué hay que trabajar, ' +
        'no para asustar a nadie. Mi meta es que salgan de tercero de bachillerato con un C1 en la mano.',
      areas: ['Cambridge B1, B2 y C1', 'Oxford Test of English', 'Academic writing', 'Listening', 'Speaking'],
      formacion: [
        { grado: 'Licenciatura en Lengua Inglesa', institucion: 'Universidad Nacional Autónoma de México', anio: '2010' },
        { grado: 'Certificate of Proficiency in English (C2)', institucion: 'Cambridge Assessment English', anio: '2012' },
        { grado: 'Diplomado en Evaluación de Lenguas', institucion: 'Universidad de las Américas Puebla', anio: '2018' }
      ],
      experiencia: [
        { puesto: 'Coordinadora de certificaciones internacionales', lugar: 'The Livingstone', periodo: '2018 – actual',
          detalle: 'Aplicación de Preliminary, First y Oxford Test; acompañamiento del viaje al Reino Unido.' },
        { puesto: 'Teacher de inglés', lugar: 'The Livingstone', periodo: '2013 – 2018',
          detalle: 'Secundaria y bachillerato, evaluación por las cuatro habilidades.' },
        { puesto: 'Coordinadora académica', lugar: 'Quick Learning', periodo: '2010 – 2013',
          detalle: 'Supervisión de doce instructores y del programa de conversación.' }
      ]
    },
    {
      id: 'pr-14', clave: 'D-171', nombre: 'Lic. Marisol Tapia Benítez',
      titulo: 'Licenciada en Administración · Maestra en Orientación Educativa',
      oficina: 'Edificio B, orientación', horarioAsesoria: 'Martes y jueves, 12:30 a 14:00 h',
      ingreso: '2019-08-05', cvKb: 190,
      bio: 'Doy el eje de desarrollo profesional de bachillerato: contabilidad en primero, creación de ' +
        'contenido digital en segundo, y habilidades socioemocionales con orientación vocacional en ' +
        'tercero. También llevo el proceso de admisión a universidad y el programa de créditos ' +
        'adelantados con DBU.',
      areas: ['Contabilidad básica', 'Emprendimiento', 'Contenido digital', 'Orientación vocacional', 'Habilidades socioemocionales'],
      formacion: [
        { grado: 'Maestría en Orientación Educativa', institucion: 'Universidad Iberoamericana', anio: '2019' },
        { grado: 'Licenciatura en Administración', institucion: 'Instituto Politécnico Nacional', anio: '2013' },
        { grado: 'Certificación en Educación Socioemocional', institucion: 'Yale Center for Emotional Intelligence', anio: '2022' }
      ],
      experiencia: [
        { puesto: 'Titular de 3º de bachillerato y orientadora', lugar: 'The Livingstone', periodo: '2021 – actual',
          detalle: 'Acompañamiento vocacional del grupo de salida y enlace con el programa DBU.' },
        { puesto: 'Profesora del eje de desarrollo profesional', lugar: 'The Livingstone', periodo: '2019 – 2021',
          detalle: 'Contabilidad, contenido digital y proyecto emprendedor de fin de ciclo.' },
        { puesto: 'Analista financiera', lugar: 'Grupo Financiero Banorte', periodo: '2013 – 2018',
          detalle: 'Banca de empresas, área de crédito.' }
      ]
    }
  ].map(function (p, i) {
    return {
      id: p.id, rol: 'profesor', clave: p.clave, nombre: p.nombre,
      email: usuario(p.nombre) + '@' + DOM,
      foto: null, iniciales: inic(p.nombre), color: color(i),
      titulo: p.titulo,
      telefono: '55 9347 84' + dos(20 + i),
      oficina: p.oficina,
      horarioAsesoria: p.horarioAsesoria,
      bio: p.bio,
      areas: p.areas,
      formacion: p.formacion,
      experiencia: p.experiencia,
      cv: { nombre: archivoCV(p.nombre), tamano: p.cvKb + ' KB', actualizado: '2025-08-' + dos(4 + i), url: null },
      perfilPublico: true,
      ingreso: p.ingreso,
      estatus: 'activo'
    };
  });

  /* ---------------------------------------------------------------- alumnos */
  /* Dos alumnos de muestra por grado, de 1º de preescolar a 3º de bachillerato.
     perfil: rendimiento base. pago: estado de cuenta al 14 de noviembre.
       al  = al corriente        pen = colegiatura de noviembre pendiente
       v1  = un pago vencido     v2  = dos pagos vencidos                      */
  var PERFILES = {
    alto:        { base: 9.3, disp: 0.45, exactas: 0.2,  letras: 0.2,  asistencia: 0.97 },
    solido:      { base: 8.6, disp: 0.60, exactas: 0.1,  letras: 0.2,  asistencia: 0.94 },
    medio:       { base: 7.8, disp: 0.85, exactas: -0.2, letras: 0.2,  asistencia: 0.90 },
    irregular:   { base: 7.0, disp: 1.10, exactas: -0.4, letras: 0.4,  asistencia: 0.81 },
    seguimiento: { base: 6.2, disp: 1.20, exactas: -0.5, letras: 0.2,  asistencia: 0.73 }
  };
  var PAGOS_PERFIL = {
    al:  ['P', 'P', 'P', 'P', 'P'],
    pen: ['P', 'P', 'P', 'P', 'N'],
    v1:  ['P', 'P', 'P', 'V', 'N'],
    v2:  ['P', 'P', 'V', 'V', 'N']
  };

  /* gradoId, nombre, perfil, pago, beca %, estatus, notas internas, tutor, parentesco */
  var FILAS_ALUMNOS = [
    ['gr-pre-1', 'Emiliano Zavala Ruvalcaba', 'solido', 'al', 0, 'activo',
      'Ingresó en agosto. Adaptación acompañada por la coordinación de preescolar.',
      'Karla Ruvalcaba Mejía', 'Madre'],
    ['gr-pre-1', 'Isabella Cortés Manrique', 'alto', 'al', 0, 'activo',
      'Primer año en el colegio. Participa en el taller de música de After Class.',
      'Óscar Cortés Lira', 'Padre'],

    ['gr-pre-2', 'Santiago Bermúdez Olvera', 'medio', 'pen', 0, 'activo',
      'Trabaja motricidad fina en sesiones cortas con la titular del grupo.',
      'Diana Olvera Ceja', 'Madre'],
    ['gr-pre-2', 'Regina Palomino Estrada', 'alto', 'al', 20, 'activo',
      'Beca de hermanos (20%). Hermana de Ximena Palomino, de 4º de primaria.',
      'Mauricio Palomino Vega', 'Padre'],

    ['gr-pre-3', 'Matías Dorantes Quiroz', 'solido', 'al', 0, 'activo',
      'La valoración de inglés lo deja listo para presentar Starters en primaria.',
      'Priscila Quiroz Nava', 'Madre'],
    ['gr-pre-3', 'Ana Sofía Rentería Lugo', 'irregular', 'pen', 0, 'activo',
      'Ausencias justificadas del 6 al 10 de octubre por incapacidad médica.',
      'Gerardo Rentería Solís', 'Padre'],

    ['gr-pri-1', 'Leonardo Ibáñez Murrieta', 'solido', 'al', 0, 'activo',
      'Cambio de colegio en agosto. Nivelación de lectoescritura los martes.',
      'Fabiola Murrieta Cano', 'Madre'],
    ['gr-pri-1', 'Julieta Ancira Robledo', 'alto', 'al', 0, 'activo',
      'Lectura fluida por encima del grado. Asiste al club de tareas de After Class.',
      'Raúl Ancira Pérez', 'Padre'],

    ['gr-pri-2', 'Iker Montalvo Cisneros', 'medio', 'pen', 0, 'activo',
      'Presenta Cambridge Starters en marzo. Refuerzo de speaking los miércoles.',
      'Nayeli Cisneros Ávalos', 'Madre'],
    ['gr-pri-2', 'Ximena Fuentevilla Aguirre', 'alto', 'al', 0, 'activo',
      'Primer lugar en el concurso de lectura en voz alta del ciclo pasado.',
      'Jorge Fuentevilla Rangel', 'Padre'],

    ['gr-pri-3', 'Bruno Salcedo Villagómez', 'irregular', 'v1', 0, 'activo',
      'Entregas atrasadas de español desde octubre. Se avisó a la tutora el día 28.',
      'Erika Villagómez Nieto', 'Madre'],
    ['gr-pri-3', 'Renata Aispuro Camacho', 'solido', 'al', 15, 'activo',
      'Beca deportiva (15%) por la selección de voleyball del colegio.',
      'Iván Aispuro Beltrán', 'Padre'],

    ['gr-pri-4', 'Ximena Palomino Estrada', 'alto', 'al', 20, 'activo',
      'Beca de hermanos (20%). Selección del colegio para la olimpiada de matemáticas.',
      'Mauricio Palomino Vega', 'Padre'],
    ['gr-pri-4', 'Rodrigo Cuevas Escandón', 'medio', 'pen', 0, 'activo',
      'Responsable del huerto escolar en el turno de los jueves.',
      'Lucía Escandón Portillo', 'Madre'],

    ['gr-pri-5', 'Valentina Ocaranza Bermejo', 'alto', 'al', 0, 'activo',
      'Movers con distinción el ciclo pasado; va por Flyers en sexto.',
      'Andrés Ocaranza Lugo', 'Padre'],
    ['gr-pri-5', 'Ángel Tejada Solórzano', 'seguimiento', 'v2', 0, 'condicionado',
      'Bajo seguimiento académico desde el 20 de octubre. Compromiso firmado con la ' +
      'madre: asesoría de matemáticas obligatoria los lunes.',
      'Marisela Solórzano Prieto', 'Madre'],

    ['gr-pri-6', 'Camila Berrones Zaldívar', 'alto', 'al', 40, 'activo',
      'Beca de excelencia (40%). Coordina la feria de ciencias de sexto.',
      'Héctor Berrones Ocampo', 'Padre'],
    ['gr-pri-6', 'Diego Alonso Menchaca Ruiz', 'medio', 'pen', 0, 'activo',
      'Solicitó cambio de horario del club de robótica para el segundo periodo.',
      'Fernando Menchaca Lara', 'Padre'],

    ['gr-sec-1', 'Mariana Esquivel Lozoya', 'solido', 'al', 0, 'activo',
      'Integrante del club de debate. Presenta Preliminary en tercero.',
      'Verónica Lozoya Del Río', 'Madre'],
    ['gr-sec-1', 'Patricio Gaytán Medrano', 'irregular', 'v1', 0, 'activo',
      'Dos entregas atrasadas de robótica. Se citó a la familia el 7 de noviembre.',
      'Alfonso Gaytán Ruelas', 'Padre'],

    ['gr-sec-2', 'Regina Villaseñor Márquez', 'alto', 'al', 0, 'activo',
      'Seleccionada para el viaje académico al Reino Unido de julio.',
      'Claudia Márquez Ibarra', 'Madre'],
    ['gr-sec-2', 'Emilio Zambrano Castañeda', 'seguimiento', 'v2', 0, 'condicionado',
      'Promedio y asistencia por debajo del mínimo. Plan de recuperación con la titular.',
      'Rafael Zambrano Ordaz', 'Padre'],

    ['gr-sec-3', 'Valeria Nájera Quintanar', 'medio', 'pen', 0, 'activo',
      'Presenta First Certificate (B2) en mayo. Asesoría de writing los jueves.',
      'Rocío Quintanar Vela', 'Madre'],
    ['gr-sec-3', 'Sebastián Iturbide Prado', 'solido', 'al', 10, 'activo',
      'Beca de convenio (10%). Capitán del equipo de la FIRST LEGO League.',
      'Mónica Prado Gaona', 'Madre'],

    ['gr-bac-1', 'Renata Solís Ibarra', 'alto', 'al', 20, 'activo',
      'Beca por promedio (20%) desde el ciclo 2024–2025. Representa al colegio en la ' +
      'olimpiada de matemáticas.',
      'Adriana Ibarra Peña', 'Madre'],
    ['gr-bac-1', 'Mateo Urrutia Sandoval', 'seguimiento', 'v2', 0, 'condicionado',
      'Bajo seguimiento desde el 22 de octubre. Asesoría obligatoria de matemáticas los martes.',
      'Silvia Sandoval Arroyo', 'Madre'],

    ['gr-bac-2', 'Fernanda Escalante Barrios', 'alto', 'al', 40, 'activo',
      'Beca de excelencia (40%). Aspirante al programa de créditos adelantados de DBU.',
      'Gustavo Escalante Núñez', 'Padre'],
    ['gr-bac-2', 'Alejandro Cantú Lerma', 'medio', 'pen', 0, 'activo',
      'Campamento de verano DBU 2026: expediente en revisión por la coordinación.',
      'Paulina Lerma Ontiveros', 'Madre'],

    ['gr-bac-3', 'Andrea Quintanilla Mora', 'solido', 'al', 0, 'activo',
      'Presenta el Oxford Test of English (C1) en febrero. Orientación vocacional en curso.',
      'Esteban Quintanilla Ruiz', 'Padre'],
    ['gr-bac-3', 'Joaquín Bustamante Félix', 'irregular', 'v2', 0, 'activo',
      'Dos pagos vencidos y entregas atrasadas del eje de desarrollo profesional.',
      'Leticia Félix Camarena', 'Madre']
  ];

  var alumnos = FILAS_ALUMNOS.map(function (f, i) {
    var g = grado(f[0]);
    var nombre = f[1];
    var id = 'al-' + dos(i + 1);
    var indiceGrado = grados.map(function (x) { return x.id; }).indexOf(g.id);
    var antiguedad = Math.min(indiceGrado, 1 + Math.floor(h(id + 'ant') * 3));
    var mes = 1 + Math.floor(h(id + 'mes') * 12);
    var dia = 1 + Math.floor(h(id + 'dia') * 27);
    return {
      id: id, rol: 'alumno',
      matricula: 'L-' + (2600 + i + 1),
      nombre: nombre,
      gradoId: g.id,
      email: usuario(nombre) + '@' + DOM_AL,
      foto: null, iniciales: inic(nombre), color: color(i),
      nacimiento: g.nacimiento + '-' + dos(mes) + '-' + dos(dia),
      telefono: '55 ' + (2000 + Math.floor(h(id + 'tel') * 7999)) + ' ' + dos(10 + Math.floor(h(id + 't2') * 89)),
      tutor: {
        nombre: f[7],
        parentesco: f[8],
        telefono: '55 ' + (3000 + Math.floor(h(id + 'tut') * 6999)) + ' ' + dos(10 + Math.floor(h(id + 'tu2') * 89)),
        email: usuario(f[7]) + '@correo.mx'
      },
      ingreso: (2025 - antiguedad) + '-08-' + dos(18 + Math.floor(h(id + 'ing') * 5)),
      estatus: f[5],
      becaPct: f[4],
      notas: f[6],
      _perfil: f[2],
      _pago: f[3]
    };
  });

  /* --------------------------------------------------------------- materias */
  /* Plan de estudios por nivel. Cada renglón se repite en todos los grados del
     nivel (salvo que traiga «desde»), y de ahí salen las materias reales.
       prof — clave del docente, o función del número de grado
       nombre / desc — texto fijo, o función del número de grado
       ses — sesiones por semana                                              */
  var COLOR_AREA = {
    lengua: '#5C3A6E', mate: '#273E55', ciencias: '#1F6F63', ingles: '#4175FC',
    frances: '#9C4A3D', robotica: '#4A5A2B', arte: '#9A6B1E', historia: '#7A3E52',
    desarrollo: '#2F5D6E'
  };
  /* Las materias de especialidad se dan en el espacio de quien las imparte y
     las demás en el salón del grupo. Como un profesor nunca tiene dos clases a
     la misma hora, así ningún espacio queda empalmado. */
  var AULA_ESPECIAL = {
    'pr-01': 'Salón de artes',
    'pr-02': 'Aula de idiomas 1',
    'pr-05': 'Laboratorio 1',
    'pr-06': 'Aula de idiomas 2',
    'pr-07': 'Aula de idiomas 3',
    'pr-08': 'Laboratorio de robótica',
    'pr-11': 'Laboratorio 2',
    'pr-13': 'Aula de idiomas 4'
  };
  var AREA_ESPECIAL = { ingles: 1, frances: 1, robotica: 1, arte: 1, ciencias: 1 };
  function aulaDe(area, profesorId, g) {
    if (AREA_ESPECIAL[area] && AULA_ESPECIAL[profesorId]) return AULA_ESPECIAL[profesorId];
    return g.aula;
  }

  var PLAN = {
    'niv-pre': [
      { pfx: 'LEN', nombre: 'Lenguaje y Comunicación', prof: 'pr-01', ses: 4, cred: 6, area: 'lengua',
        desc: 'Campo formativo de lenguaje: expresión oral, conciencia fonológica y primeros trazos. ' +
          'Lectura diaria en voz alta y una narración propia por semana.' },
      { pfx: 'PMA', nombre: 'Pensamiento Matemático', prof: 'pr-01', ses: 3, cred: 6, area: 'mate',
        desc: 'Conteo, comparación, forma, espacio y medida con material concreto. La cantidad se toca ' +
          'antes de escribirse.' },
      { pfx: 'ENG', nombre: 'English for Kids', prof: 'pr-02', ses: 4, cred: 5, area: 'ingles',
        desc: 'Inmersión diaria en inglés con canciones, rutinas de salón y phonics. El idioma se usa, ' +
          'no se estudia.' },
      { pfx: 'ART', nombre: 'Expresión Artística y Motriz', prof: 'pr-01', ses: 2, cred: 4, area: 'arte',
        desc: 'Música, movimiento, pintura y juego motriz grueso y fino, con la plataforma Knotion como ' +
          'apoyo de las evidencias.' }
    ],
    'niv-pri': [
      { pfx: 'ESP', nombre: 'Español', prof: 'pr-03', ses: 4, cred: 8, area: 'lengua',
        desc: function (n) {
          return n <= 2
            ? 'Lectoescritura, comprensión lectora y ortografía básica, con lectura en voz alta todos los días.'
            : 'Comprensión lectora, gramática y taller de escritura: un texto propio corregido por parcial.';
        } },
      { pfx: 'MAT', nombre: 'Matemáticas', prof: 'pr-04', ses: 4, cred: 8, area: 'mate',
        desc: function (n) {
          return n <= 3
            ? 'Número, suma y resta con material concreto, y resolución de problemas de la vida diaria.'
            : 'Fracciones, proporcionalidad, geometría y problemas de varios pasos, con preparación a la prueba MARSA.';
        } },
      { pfx: 'CNA', nombre: 'Ciencias Naturales', prof: 'pr-05', ses: 3, cred: 6, area: 'ciencias',
        desc: 'Cada unidad abre con algo que se pueda ver, oler o medir. Bitácora de laboratorio desde ' +
          'tercero y participación en el huerto escolar.' },
      { pfx: 'ENG', nombre: 'English CLIL',
        prof: function (n) { return n <= 2 ? 'pr-02' : 'pr-06'; }, ses: 4, cred: 7, area: 'ingles',
        desc: function (n) {
          if (n <= 2) return 'Inglés integrado a contenidos, con preparación al examen Cambridge Starters en 2º.';
          if (n <= 4) return 'Ciencias y estudios sociales en inglés (CLIL), con preparación al examen Cambridge Movers en 4º.';
          return 'Ciencias y estudios sociales en inglés (CLIL), con preparación al examen Cambridge Flyers en 6º.';
        } },
      { pfx: 'FRA', nombre: 'Francés', prof: 'pr-07', ses: 2, cred: 4, area: 'frances',
        desc: 'La tercera lengua del colegio, trabajada con canción, cocina y cómic. Al terminar la ' +
          'primaria se sostiene una conversación sencilla de nivel A1.' },
      { pfx: 'ROB', nombre: 'Robótica y Tecnología', prof: 'pr-08', ses: 2, cred: 4, area: 'robotica', desde: 3,
        desc: 'Armado y programación por bloques, con bitácora de fallas y correcciones. Semillero del ' +
          'equipo de la FIRST LEGO League.' }
    ],
    'niv-sec': [
      { pfx: 'ESP', nombre: 'Español y Literatura', prof: 'pr-10', ses: 4, cred: 8, area: 'lengua',
        desc: 'Lectura completa de las obras del programa y taller de redacción argumentativa, con tres ' +
          'entregas corregidas por parcial.' },
      { pfx: 'MAT', nombre: 'Matemáticas', prof: 'pr-09', ses: 4, cred: 8, area: 'mate',
        desc: function (n) {
          if (n === 1) return 'Aritmética, proporcionalidad y primeras ecuaciones, con parciales acumulativos.';
          if (n === 2) return 'Álgebra, sistemas de ecuaciones y geometría, con preparación a la prueba MARSA.';
          return 'Funciones, probabilidad y estadística, con repaso integral para el examen de admisión.';
        } },
      { pfx: 'CIE', ses: 4, cred: 7, area: 'ciencias', prof: 'pr-11',
        nombre: function (n) {
          return ['Ciencias I: Biología', 'Ciencias II: Física', 'Ciencias III: Química'][n - 1];
        },
        desc: 'Ocho prácticas de laboratorio por parcial, todas con reporte escrito y tratamiento de la ' +
          'incertidumbre de la medición.' },
      { pfx: 'HIS', ses: 3, cred: 6, area: 'historia', prof: 'pr-12',
        nombre: function (n) {
          return ['Historia y Formación Cívica I', 'Historia y Formación Cívica II', 'Historia y Formación Cívica III'][n - 1];
        },
        desc: 'Historia trabajada con fuentes directas —prensa, fotografía y testimonio oral— y ' +
          'formación cívica sobre casos reales.' },
      { pfx: 'ENG', ses: 4, cred: 7, area: 'ingles', prof: 'pr-13',
        nombre: function (n) { return ['English A2+', 'English B1', 'English B2 · First Certificate'][n - 1]; },
        desc: function (n) {
          return n < 3
            ? 'Evaluación por las cuatro habilidades, con simulacros de la suite Cambridge cada parcial.'
            : 'Preparación intensiva al examen Preliminary (B1) o First Certificate (B2) de Cambridge, ' +
              'con dos simulacros completos antes de la aplicación.';
        } },
      { pfx: 'ROB', nombre: 'Robótica y Proyectos', prof: 'pr-08', ses: 2, cred: 4, area: 'robotica',
        desc: 'Python, sensores y proyecto transdisciplinario bajo el Impact Model de Knotion. Se ' +
          'califica la bitácora, no el robot bonito.' }
    ],
    'niv-bac': [
      { pfx: 'MAT', ses: 5, cred: 9, area: 'mate', prof: 'pr-09',
        nombre: function (n) { return ['Álgebra y Trigonometría', 'Geometría Analítica', 'Cálculo Diferencial'][n - 1]; },
        desc: 'Parciales acumulativos: lo de septiembre se vuelve a preguntar en diciembre. Asesoría ' +
          'abierta dos tardes por semana.' },
      { pfx: 'CIE', ses: 4, cred: 8, area: 'ciencias', prof: 'pr-11',
        nombre: function (n) { return ['Química General', 'Física: Mecánica', 'Biología Contemporánea'][n - 1]; },
        desc: 'Teoría y laboratorio en la misma materia, con reporte de práctica y propagación de ' +
          'incertidumbre en cada sesión experimental.' },
      { pfx: 'LET', ses: 4, cred: 7, area: 'lengua', prof: 'pr-10',
        nombre: function (n) { return ['Taller de Lectura y Redacción', 'Literatura Hispanoamericana', 'Redacción Argumentativa'][n - 1]; },
        desc: 'Se lee completo y se discute en clase. Los ensayos se devuelven corregidos línea por ' +
          'línea en menos de una semana.' },
      { pfx: 'HIS', ses: 3, cred: 6, area: 'historia', prof: 'pr-12',
        nombre: function (n) { return ['Historia de México Contemporáneo', 'Historia Universal', 'Filosofía y Ética'][n - 1]; },
        desc: 'Trabajo directo sobre fuentes y cierre de cada unidad en debate: nadie opina sin haber leído.' },
      { pfx: 'ENG', ses: 5, cred: 8, area: 'ingles', prof: 'pr-13',
        nombre: function (n) { return ['English B2', 'English B2+ · Oxford Test', 'English C1 Advanced'][n - 1]; },
        desc: 'Academic writing, listening y speaking con examinadores certificados. La meta es salir ' +
          'de tercero con un C1 en la mano.' },
      { pfx: 'DPR', ses: 3, cred: 6, area: 'desarrollo', prof: 'pr-14',
        nombre: function (n) { return ['Contabilidad Básica', 'Creación de Contenido Digital', 'Habilidades Socioemocionales y Orientación Vocacional'][n - 1]; },
        desc: 'El eje que conecta el bachillerato con la vida laboral y con el proceso de admisión a la ' +
          'universidad, incluido el programa de créditos adelantados de DBU.' }
    ]
  };

  function resolver(valor, n) { return typeof valor === 'function' ? valor(n) : valor; }

  var LETRA_NIVEL = { 'niv-pre': 'K', 'niv-pri': 'P', 'niv-sec': 'S', 'niv-bac': 'B' };

  var materias = [];
  grados.forEach(function (g) {
    PLAN[g.nivelId].forEach(function (p) {
      if (p.desde && g.numero < p.desde) return;
      materias.push({
        id: 'mat-' + g.id.replace('gr-', '') + '-' + p.pfx.toLowerCase(),
        codigo: p.pfx + '-' + LETRA_NIVEL[g.nivelId] + g.numero,
        nombre: resolver(p.nombre, g.numero),
        gradoId: g.id,
        nivelId: g.nivelId,
        profesorId: resolver(p.prof, g.numero),
        creditos: p.cred,
        aula: aulaDe(p.area, resolver(p.prof, g.numero), g),
        cupo: g.cupo,
        color: COLOR_AREA[p.area],
        estatus: 'activa',
        horario: [],
        sesiones: p.ses,
        area: p.area,
        descripcion: resolver(p.desc, g.numero)
      });
    });
  });

  /* ---------------------------------------------------------------- horario */
  /* Rejilla de cinco días por seis franjas. El repartidor da a cada materia sus
     sesiones en huecos libres del grado y, de ser posible, también libres para
     su profesor: dentro de un grado nunca se encima nada. */
  var DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  var FRANJAS = [
    { inicio: '07:30', fin: '08:20' }, { inicio: '08:25', fin: '09:15' },
    { inicio: '09:35', fin: '10:25' }, { inicio: '10:30', fin: '11:20' },
    { inicio: '11:40', fin: '12:30' }, { inicio: '12:35', fin: '13:25' }
  ];
  var RANURAS = [];
  FRANJAS.forEach(function (f, fi) {
    DIAS.forEach(function (d, di) {
      RANURAS.push({ clave: d + '|' + f.inicio, dia: d, inicio: f.inicio, fin: f.fin, orden: fi * 5 + di });
    });
  });

  var ocupaGrado = {};
  var ocupaProfe = {};
  function libre(mapa, llave, clave) {
    return !(mapa[llave] && mapa[llave][clave]);
  }
  function ocupar(mapa, llave, clave) {
    if (!mapa[llave]) mapa[llave] = {};
    mapa[llave][clave] = true;
  }

  grados.forEach(function (g, ig) {
    var giro = (ig * 9) % RANURAS.length;          /* cada grado arranca en otro hueco */
    var orden = RANURAS.slice(giro).concat(RANURAS.slice(0, giro));
    materias.filter(function (m) { return m.gradoId === g.id; }).forEach(function (m) {
      var puestas = 0;
      /* Primera vuelta: huecos buenos para el grado y para el profesor. */
      orden.forEach(function (r) {
        if (puestas >= m.sesiones) return;
        if (!libre(ocupaGrado, g.id, r.clave) || !libre(ocupaProfe, m.profesorId, r.clave)) return;
        m.horario.push({ dia: r.dia, inicio: r.inicio, fin: r.fin });
        ocupar(ocupaGrado, g.id, r.clave);
        ocupar(ocupaProfe, m.profesorId, r.clave);
        puestas++;
      });
      /* Segunda vuelta, por si el profesor ya estaba lleno: basta con que el
         grado tenga el hueco libre. */
      orden.forEach(function (r) {
        if (puestas >= m.sesiones) return;
        if (!libre(ocupaGrado, g.id, r.clave)) return;
        m.horario.push({ dia: r.dia, inicio: r.inicio, fin: r.fin });
        ocupar(ocupaGrado, g.id, r.clave);
        puestas++;
      });
      m.horario.sort(function (a, b) {
        var da = DIAS.indexOf(a.dia) - DIAS.indexOf(b.dia);
        return da !== 0 ? da : (a.inicio < b.inicio ? -1 : 1);
      });
    });
  });

  /* ----------------------------------------------------------- inscripciones */
  /* Cada alumno cursa el plan completo de su grado. */
  var inscripciones = [];
  var ni = 1;
  alumnos.forEach(function (a) {
    materias.filter(function (m) { return m.gradoId === a.gradoId; }).forEach(function (m) {
      inscripciones.push({ id: 'ins-' + (ni++), alumnoId: a.id, materiaId: m.id });
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
  materias.forEach(function (m) {
    plantillaEval.forEach(function (p) {
      evaluaciones.push({
        id: 'ev-' + m.id.replace('mat-', '') + '-' + p.clave,
        materiaId: m.id, nombre: p.nombre, tipo: p.tipo, peso: p.peso, fecha: p.fecha
      });
    });
  });

  /* ----------------------------------------------------------- calificaciones */
  var EXACTAS = { mate: 1, ciencias: 1, robotica: 1 };
  var deriva = { p1: -0.25, ta: 0.35, p2: 0.0, pr: 0.3 };
  var porId = {};
  materias.forEach(function (m) { porId[m.id] = m; });
  var perfilDe = {};
  alumnos.forEach(function (a) { perfilDe[a.id] = PERFILES[a._perfil]; });

  var calificaciones = [];
  var nc = 1;
  inscripciones.forEach(function (ins) {
    var pf = perfilDe[ins.alumnoId];
    var m = porId[ins.materiaId];
    var afin = EXACTAS[m.area] ? pf.exactas : pf.letras;
    plantillaEval.forEach(function (p) {
      if (!p.calificada) return;
      var llave = ins.alumnoId + ins.materiaId + p.clave;
      var ruido = (h(llave) - 0.5) * 2 * pf.disp;
      var valor = red1(tope(pf.base + afin + deriva[p.clave] + ruido, 3.5, 10));
      calificaciones.push({
        id: 'cal-' + (nc++),
        alumnoId: ins.alumnoId,
        evaluacionId: 'ev-' + m.id.replace('mat-', '') + '-' + p.clave,
        valor: valor, capturadaEl: p.fecha, capturadaPor: m.profesorId
      });
    });
  });

  /* ------------------------------------------------------------- asistencias */
  var asistencias = [];
  var na = 1;
  inscripciones.forEach(function (ins) {
    var pf = perfilDe[ins.alumnoId];
    var m = porId[ins.materiaId];
    var totales = m.sesiones * 12;                 /* doce semanas de ciclo cursadas */
    var tasa = tope(pf.asistencia + (h(ins.alumnoId + ins.materiaId) - 0.5) * 0.12, 0.55, 1);
    asistencias.push({
      id: 'as-' + (na++),
      alumnoId: ins.alumnoId, materiaId: ins.materiaId,
      presentes: Math.round(totales * tasa), totales: totales
    });
  });

  /* ------------------------------------------------------------------ tareas */
  /* Banco por nivel y área: dos tareas y dos materiales por materia. La primera
     tarea ya venció (sostiene las entregas atrasadas); la segunda está por
     vencer (sostiene «próximas entregas»).                                    */
  var BANCO = {
    'niv-pre|lengua': {
      t: [['Cuento viajero: mi página', 'proyecto', 'Ilustrar y dictar a casa la página que toca del cuento del grupo.'],
          ['Caja de sonidos iniciales', 'tarea', 'Traer tres objetos que empiecen con el sonido de la semana.']],
      m: [['Lista de lectura en voz alta', 'pdf', 'Veinte títulos recomendados para leer en casa, uno por noche.'],
          ['Canciones de rutina del salón', 'video', 'Las mismas que cantamos al entrar, para repasarlas en casa.']]
    },
    'niv-pre|mate': {
      t: [['Colección de diez', 'tarea', 'Juntar diez objetos iguales y traerlos contados en una bolsita.'],
          ['Figuras en mi casa', 'proyecto', 'Buscar y dibujar tres figuras geométricas que haya en casa.']],
      m: [['Tarjetas de conteo del 1 al 20', 'pdf', 'Para imprimir y recortar; se usan también en clase.'],
          ['Juego de formas Knotion', 'liga', 'Actividad de la plataforma para repasar forma y espacio.']]
    },
    'niv-pre|ingles': {
      t: [['My family flashcards', 'tarea', 'Draw and name four members of your family. Bring it to circle time.'],
          ['Colors hunt at home', 'proyecto', 'Find one object for each color of the week and say its name in English.']],
      m: [['Phonics songs — set 1', 'video', 'The five songs we sing every morning, with the lyrics.'],
          ['Picture dictionary', 'pdf', 'Sixty words with pictures, the ones we use in class.']]
    },
    'niv-pre|arte': {
      t: [['Autorretrato con material libre', 'proyecto', 'Un autorretrato usando el material que cada quien elija.'],
          ['Ritmo con el cuerpo', 'tarea', 'Practicar en casa la secuencia de palmas y pasos que vimos el viernes.']],
      m: [['Bitácora de evidencias Knotion', 'liga', 'Aquí suben las fotos de los trabajos del periodo.'],
          ['Guía de motricidad fina en casa', 'pdf', 'Ocho ejercicios de cinco minutos para hacer en casa.']]
    },

    'niv-pri|lengua': {
      t: [['Lectura de la semana con ficha', 'tarea', 'Leer el texto y llenar la ficha de comprensión completa.'],
          ['Taller de escritura: mi texto corregido', 'proyecto', 'Entregar el borrador corregido con la rúbrica al frente.']],
      m: [['Antología del periodo', 'pdf', 'Los seis textos que leemos este parcial.'],
          ['Rúbrica de escritura', 'pdf', 'Los cinco criterios con los que califico. No hay sorpresas.']]
    },
    'niv-pri|mate': {
      t: [['Problemario del parcial', 'tarea', 'Diez problemas con procedimiento completo, no sólo el resultado.'],
          ['Reto MARSA de la semana', 'proyecto', 'Un problema largo para resolver en equipo y explicar en el pizarrón.']],
      m: [['Cuadernillo de cálculo mental', 'pdf', 'Una hoja diaria de cinco minutos.'],
          ['Material recortable de fracciones', 'hoja', 'Para armar las tiras que usamos en clase.']]
    },
    'niv-pri|ciencias': {
      t: [['Bitácora del huerto escolar', 'tarea', 'Registrar riego, altura y observaciones de la semana.'],
          ['Experimento en casa con reporte', 'proyecto', 'Hacer el experimento del cuadernillo y escribir qué pasó y por qué.']],
      m: [['Manual de prácticas del periodo', 'pdf', 'Las ocho prácticas con material y procedimiento.'],
          ['Video: el ciclo del agua en el huerto', 'video', 'Grabado en el patio trasero con los de cuarto.']]
    },
    'niv-pri|ingles': {
      t: [['Reading log — five nights', 'tarea', 'Read ten minutes a night and write one sentence about it.'],
          ['CLIL project: poster in English', 'proyecto', 'A poster about the science topic, presented orally.']],
      m: [['Cambridge practice test', 'pdf', 'Simulacro completo con hoja de respuestas.'],
          ['Speaking prompts for the mock exam', 'hoja', 'Las preguntas que usamos en el simulacro oral.']]
    },
    'niv-pri|frances': {
      t: [['Ma carte postale', 'tarea', 'Escribir una postal de seis líneas a un amigo imaginario.'],
          ['Recette illustrée', 'proyecto', 'Ilustrar una receta sencilla con su vocabulario en francés.']],
      m: [['Chansons du trimestre', 'video', 'Las cuatro canciones del periodo con su letra.'],
          ['Vocabulaire A1 illustré', 'pdf', 'Ochenta palabras con imagen, por campo semántico.']]
    },
    'niv-pri|robotica': {
      t: [['Robot seguidor de línea', 'proyecto', 'Armar y programar por bloques; entregar la bitácora de fallas.'],
          ['Secuencia de diez bloques', 'tarea', 'Resolver el reto del laberinto con diez bloques o menos.']],
      m: [['Guía de armado paso a paso', 'pdf', 'Con fotos de cada pieza y el orden de ensamble.'],
          ['Plantilla de bitácora de fallas', 'hoja', 'Qué falló, qué hicimos, qué pasó después.']]
    },

    'niv-sec|lengua': {
      t: [['Ensayo argumentativo del parcial', 'proyecto', 'Ochocientas palabras con tesis explícita y dos citas del texto.'],
          ['Control de lectura de la obra', 'tarea', 'Leer la obra completa; se discute en clase antes del control.']],
      m: [['Rúbrica del ensayo argumentativo', 'pdf', 'Los cinco criterios de corrección.'],
          ['Antología del periodo', 'pdf', 'Seis cuentos y dos capítulos de novela en versión de lectura.']]
    },
    'niv-sec|mate': {
      t: [['Serie de ejercicios del parcial', 'tarea', 'Veinte ejercicios con procedimiento; se revisa que esté completo.'],
          ['Proyecto: modelo con datos propios', 'proyecto', 'Levantar datos una semana y ajustar un modelo que los explique.']],
      m: [['Formulario del parcial', 'hoja', 'Una hoja. Se permite en el examen.'],
          ['Resolución del segundo parcial', 'video', 'Grabación con la resolución problema por problema.']]
    },
    'niv-sec|ciencias': {
      t: [['Reporte de la práctica 6', 'tarea', 'Formato de reporte con propagación de incertidumbre.'],
          ['Proyecto de feria de ciencias', 'proyecto', 'Pregunta, hipótesis, montaje y resultados en cartel.']],
      m: [['Manual de prácticas de laboratorio', 'pdf', 'Las ocho prácticas del periodo.'],
          ['Simulador del experimento (PhET)', 'liga', 'Para reproducir la práctica antes de venir al laboratorio.']]
    },
    'niv-sec|historia': {
      t: [['Análisis de fuente: prensa de la época', 'tarea', 'Comparar la cobertura de dos diarios sobre el mismo hecho.'],
          ['Historia oral de Clavería', 'proyecto', 'Entrevistar a una persona del barrio y transcribir diez minutos.']],
      m: [['Ficha de análisis de fuentes', 'hoja', 'La misma ficha para todo el periodo.'],
          ['Cronología comentada del siglo XX', 'presentacion', 'Ochenta diapositivas con imagen de archivo y pie de fuente.']]
    },
    'niv-sec|ingles': {
      t: [['Writing task: opinion essay', 'tarea', '250 words. Linkers and a clear position are required.'],
          ['Cambridge mock exam — full paper', 'proyecto', 'Reading, writing, listening and speaking in one sitting.']],
      m: [['Linkers and connectors cheat sheet', 'hoja', 'One page. Use it in the writing task.'],
          ['Listening practice — part 3', 'video', 'Three recordings with the answer key at the end.']]
    },
    'niv-sec|robotica': {
      t: [['Sensor de distancia en Python', 'tarea', 'Programar la lectura del sensor y registrar diez mediciones.'],
          ['Proyecto Impact Model', 'proyecto', 'Un problema del barrio resuelto con un prototipo y su bitácora.']],
      m: [['Cuaderno de Python: listas y ciclos', 'presentacion', 'Cuarenta celdas resueltas y diez para practicar.'],
          ['Plantilla de bitácora del proyecto', 'hoja', 'Qué falló, qué hicimos, qué pasó después.']]
    },

    'niv-bac|mate': {
      t: [['Serie del parcial con procedimiento', 'tarea', 'Treinta ejercicios; se califica el procedimiento, no el resultado.'],
          ['Proyecto: modelo de razón de cambio', 'proyecto', 'Elegir un fenómeno medible, levantar datos y ajustar el modelo.']],
      m: [['Formulario permitido en el parcial', 'hoja', 'Una hoja, la misma para todos.'],
          ['Resolución del segundo parcial', 'video', 'Treinta y ocho minutos, problema por problema.']]
    },
    'niv-bac|ciencias': {
      t: [['Reporte de práctica con incertidumbre', 'tarea', 'Formato completo, con propagación de error y conclusión.'],
          ['Investigación experimental del periodo', 'proyecto', 'Diseño propio, montaje en el laboratorio y cartel final.']],
      m: [['Manual de prácticas del periodo', 'pdf', 'Las ocho prácticas con material, procedimiento y seguridad.'],
          ['Tabla de constantes y unidades', 'hoja', 'La que se permite en los parciales.']]
    },
    'niv-bac|lengua': {
      t: [['Ensayo 3 con tesis y dos citas', 'proyecto', 'Mil doscientas palabras, tesis en el primer párrafo.'],
          ['Control de lectura de la novela', 'tarea', 'Leer completa; se discute el jueves y hay control.']],
      m: [['Rúbrica del ensayo', 'pdf', 'Los cinco criterios con los que califico.'],
          ['Antología del periodo', 'pdf', 'Los textos completos en versión de lectura.']]
    },
    'niv-bac|historia': {
      t: [['Línea del tiempo comentada', 'proyecto', 'Doce hitos con fuente citada y un párrafo propio en cada uno.'],
          ['Ficha de debate del jueves', 'tarea', 'Tres argumentos con fuente, a favor y en contra.']],
      m: [['Dossier de fuentes primarias', 'pdf', 'Prensa, fotografía y documentos del periodo.'],
          ['Guía del debate final', 'hoja', 'Reglas, tiempos y criterios de evaluación.']]
    },
    'niv-bac|ingles': {
      t: [['Academic writing: argumentative essay', 'tarea', '350 words, formal register, cited sources.'],
          ['Oxford Test mock — full session', 'proyecto', 'Complete online mock, including the speaking interview.']],
      m: [['Writing band descriptors', 'pdf', 'How the exam is actually marked, level by level.'],
          ['Speaking interview — sample answers', 'video', 'Two full interviews with the examiner comments.']]
    },
    'niv-bac|desarrollo': {
      t: [['Ejercicio integral del periodo', 'tarea', 'Caso práctico resuelto con el formato visto en clase.'],
          ['Proyecto final del eje', 'proyecto', 'Entrega con presentación de diez minutos ante el grupo.']],
      m: [['Formatos y plantillas del eje', 'hoja', 'Los formatos que se usan en las entregas del periodo.'],
          ['Guía de admisión universitaria y DBU', 'pdf', 'Fechas, requisitos y el programa de créditos adelantados.']]
    }
  };

  var PUNTOS = { tarea: 10, proyecto: 20, lectura: 5 };
  var TAM = { pdf: ['640 KB', '1.4 MB', '2.8 MB'], video: ['—'], liga: ['—'],
    presentacion: ['512 KB', '9.2 MB'], hoja: ['64 KB', '128 KB'] };

  var tareas = [];
  var materiales = [];
  var nt = 1;
  var nm = 1;
  materias.forEach(function (m, im) {
    var banco = BANCO[m.nivelId + '|' + m.area];
    if (!banco) return;

    banco.t.forEach(function (t, k) {
      var venceDia = k === 0 ? 3 + (im % 8) : 17 + (im % 10);
      tareas.push({
        id: 'tar-' + dos(nt++),
        materiaId: m.id,
        titulo: t[0],
        descripcion: t[2],
        tipo: t[1],
        vence: '2025-11-' + dos(venceDia),
        puntos: PUNTOS[t[1]] || 10,
        publicadaEl: '2025-' + (venceDia > 14 ? '11-' + dos(Math.max(1, venceDia - 9)) : '10-' + dos(20 + (im % 8))),
        archivo: k === 0 && (im % 3 === 0)
          ? { nombre: 'Formato_' + m.codigo + '.pdf', tamano: (60 + im % 40) + ' KB' } : null
      });
    });

    banco.m.forEach(function (x, k) {
      var tam = TAM[x[1]] || ['—'];
      materiales.push({
        id: 'mtr-' + dos(nm++),
        materiaId: m.id,
        titulo: x[0],
        tipo: x[1],
        descripcion: x[2],
        subidoEl: k === 0 ? '2025-11-' + dos(2 + (im % 11)) : '2025-10-' + dos(8 + (im % 20)),
        tamano: tam[im % tam.length],
        autorId: m.profesorId,
        url: null
      });
    });
  });

  /* ---------------------------------------------------------------- entregas */
  /* Los atrasos salen del perfil de cada quien: el que falta más a clase también
     entrega tarde con más frecuencia. */
  var entregas = [];
  var ne = 1;
  var porMateria = {};
  inscripciones.forEach(function (i) {
    if (!porMateria[i.materiaId]) porMateria[i.materiaId] = [];
    porMateria[i.materiaId].push(i.alumnoId);
  });

  tareas.forEach(function (t) {
    (porMateria[t.materiaId] || []).forEach(function (alumnoId) {
      var pf = perfilDe[alumnoId];
      var r = h(alumnoId + t.id);
      var vencida = t.vence < '2025-11-14';
      var umbralAtraso = (1 - pf.asistencia) * 1.25;
      var estado, fecha = null, calif = null;
      if (vencida) {
        if (r < umbralAtraso) {
          estado = 'atrasada';
        } else if (r < umbralAtraso + 0.18) {
          estado = 'entregada';                    /* llegó a tiempo, sin revisar */
          fecha = t.vence;
        } else {
          estado = 'revisada';
          fecha = t.vence;
          calif = red1(tope(pf.base + (h(t.id + alumnoId) - 0.45) * 2, 4, 10));
        }
      } else {
        estado = r < 0.30 ? 'entregada' : 'pendiente';
        if (estado === 'entregada') fecha = '2025-11-12';
      }
      entregas.push({
        id: 'ent-' + (ne++), tareaId: t.id, alumnoId: alumnoId,
        estado: estado, fecha: fecha, calificacion: calif
      });
    });
  });

  /* ------------------------------------------------------------------ avisos */
  var avisos = [
    { id: 'av-01', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Calendario del tercer parcial', prioridad: 'alta', fecha: '2025-11-12',
      cuerpo: 'El tercer parcial se aplica del 1 al 5 de diciembre en el horario normal de cada materia, ' +
        'de primaria a bachillerato. El calendario detallado por grupo ya está en la cartelera del ' +
        'edificio A y en el portal. Preescolar cierra su tercer periodo con evidencias, sin examen.' },
    { id: 'av-02', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Reinscripciones al ciclo 2026 – 2027', prioridad: 'alta', fecha: '2025-11-05',
      cuerpo: 'Continuamos inscripciones y reinscripciones. Las familias que confirmen antes del 15 de ' +
        'diciembre conservan la cuota del ciclo actual. Pregunta en administración por las promociones ' +
        'vigentes: no te quedes sin tu lugar.' },
    { id: 'av-03', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Colegiatura de noviembre', prioridad: 'normal', fecha: '2025-11-03',
      cuerpo: 'La colegiatura de noviembre vence el día 5. A partir del día 10 se aplica el recargo del ' +
        '5% previsto en el reglamento. En la sección de Pagos del portal pueden consultar su estado de ' +
        'cuenta al día y descargar sus recibos.' },
    { id: 'av-04', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Suspensión de labores: lunes 17 de noviembre', prioridad: 'normal', fecha: '2025-11-10',
      cuerpo: 'El lunes 17 de noviembre no habrá clases por consejo técnico escolar. Las asesorías de la ' +
        'tarde se recorren al martes 18 en el mismo horario, y After Class opera normalmente a partir de ' +
        'las 14:00 h.' },
    { id: 'av-05', autorId: 'dir-01', autorRol: 'direccion', ambito: 'escuela', materiaId: null,
      titulo: 'Junta informativa: viaje académico al Reino Unido', prioridad: 'normal', fecha: '2025-10-30',
      cuerpo: 'Jueves 27 de noviembre, 18:00 h, en el aula magna. Se explican fechas, costos, requisitos ' +
        'de pasaporte y el acompañamiento docente del viaje de julio de 2026 para secundaria y ' +
        'bachillerato.' },
    { id: 'av-06', autorId: 'pr-13', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-sec-3-eng',
      titulo: 'Fechas del simulacro Cambridge B2', prioridad: 'alta', fecha: '2025-11-08',
      cuerpo: 'El segundo simulacro completo es el viernes 28 de noviembre, de 7:30 a 11:20 en el aula de ' +
        'idiomas. Traigan identificación del colegio. El resultado no cuenta para la boleta: sirve para ' +
        'decidir quién presenta Preliminary y quién First.' },
    { id: 'av-07', autorId: 'pr-09', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-bac-3-mat',
      titulo: 'Asesoría extra antes del tercer parcial', prioridad: 'normal', fecha: '2025-11-11',
      cuerpo: 'Abro una asesoría adicional el jueves 27 de noviembre, de 13:30 a 15:00 en el cubículo 4. ' +
        'Vengan con problemas concretos; no voy a repetir la clase.' },
    { id: 'av-08', autorId: 'pr-08', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-sec-2-rob',
      titulo: 'FIRST LEGO League: ensayo del sábado', prioridad: 'normal', fecha: '2025-11-06',
      cuerpo: 'Ensayo general el sábado 22 de noviembre de 9:00 a 13:00 en el laboratorio de robótica. ' +
        'Traigan la bitácora impresa: el jurado la pide y vale más que la corrida perfecta.' },
    { id: 'av-09', autorId: 'pr-01', autorRol: 'profesor', ambito: 'materia', materiaId: 'mat-pre-1-len',
      titulo: 'Cuento viajero: orden de la semana', prioridad: 'normal', fecha: '2025-11-07',
      cuerpo: 'El cuento viajero llega a casa el lunes y regresa el miércoles con la página ilustrada. ' +
        'Es normal que el texto lo dicten ellos y lo escriba un adulto: lo que evaluamos es la idea, no ' +
        'la letra.' }
  ];

  /* ------------------------------------------------------------------- pagos */
  var periodos = [
    { periodo: '2025-08', concepto: 'Inscripción ciclo 2025 – 2026', tipo: 'inscripcion', vence: '2025-08-05' },
    { periodo: '2025-08b', concepto: 'Colegiatura de agosto 2025', tipo: 'colegiatura', vence: '2025-08-05' },
    { periodo: '2025-09', concepto: 'Colegiatura de septiembre 2025', tipo: 'colegiatura', vence: '2025-09-05' },
    { periodo: '2025-10', concepto: 'Colegiatura de octubre 2025', tipo: 'colegiatura', vence: '2025-10-05' },
    { periodo: '2025-11', concepto: 'Colegiatura de noviembre 2025', tipo: 'colegiatura', vence: '2025-11-05' }
  ];
  var METODOS = ['Transferencia SPEI', 'Tarjeta de débito', 'Depósito en ventanilla', 'Domiciliación'];
  var nivelPorGrado = {};
  grados.forEach(function (g) {
    nivelPorGrado[g.id] = niveles.filter(function (n) { return n.id === g.nivelId; })[0];
  });

  var pagos = [];
  var np = 1;
  alumnos.forEach(function (a) {
    var nv = nivelPorGrado[a.gradoId];
    PAGOS_PERFIL[a._pago].forEach(function (est, k) {
      var p = periodos[k];
      var base = p.tipo === 'inscripcion' ? nv.inscripcion : nv.colegiatura;
      var monto = Math.round(base * (1 - a.becaPct / 100));
      var estado = est === 'P' ? 'pagado' : (est === 'V' ? 'vencido' : 'pendiente');
      var diaPago = 1 + Math.floor(entre(a.id + p.periodo, 0, 4));
      pagos.push({
        id: 'pag-' + String(np++).padStart(3, '0'),
        alumnoId: a.id, concepto: p.concepto, periodo: p.periodo,
        monto: monto, vence: p.vence, estado: estado,
        pagadoEl: estado === 'pagado' ? p.vence.slice(0, 8) + dos(diaPago) : null,
        metodo: estado === 'pagado' ? METODOS[Math.floor(entre(a.id + p.periodo + 'm', 0, 3.99))] : null,
        referencia: 'TLV-' + p.periodo.replace('-', '') + '-' + a.matricula.replace('L-', ''),
        recargo: estado === 'vencido' ? Math.round(monto * 0.05) : 0
      });
    });
  });

  /* ----------------------------------------------------------------- reseñas */
  var resenas = [
    { id: 'res-01', profesorId: 'pr-09', alumnoId: 'al-25', materiaId: 'mat-bac-1-mat', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 4, puntualidad: 5 },
      comentario: 'Explica de dónde sale cada fórmula antes de usarla, y eso cambia todo. Las asesorías ' +
        'del martes valen más que la clase misma porque ahí sí se detiene con cada quien.',
      fecha: '2025-10-24', estado: 'publica', anonima: false,
      respuesta: { texto: 'Gracias, Renata. La asesoría del martes seguirá abierta todo diciembre.', fecha: '2025-10-25' } },

    { id: 'res-02', profesorId: 'pr-13', alumnoId: 'al-27', materiaId: 'mat-bac-2-eng', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 5, puntualidad: 4 },
      comentario: 'Los simulacros antes del examen real quitan muchísimo miedo. Llegué al Oxford Test ' +
        'sabiendo exactamente cómo se calificaba cada parte.',
      fecha: '2025-10-28', estado: 'publica', anonima: false, respuesta: null },

    { id: 'res-03', profesorId: 'pr-10', alumnoId: 'al-23', materiaId: 'mat-sec-3-esp', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 5, puntualidad: 5 },
      comentario: 'Devuelve los ensayos corregidos en menos de una semana, con comentarios línea por ' +
        'línea. Nunca había mejorado tanto escribiendo.',
      fecha: '2025-10-18', estado: 'publica', anonima: false,
      respuesta: { texto: 'Me alegra, Valeria. Insiste con la tesis del primer párrafo: ahí estaba el nudo.', fecha: '2025-10-19' } },

    { id: 'res-04', profesorId: 'pr-04', alumnoId: 'al-13', materiaId: 'mat-pri-4-mat', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 5, puntualidad: 5 },
      comentario: 'Primero lo armamos con material y después lo escribimos. Cuando llegó el examen de ' +
        'fracciones ya lo entendía, no me lo estaba aprendiendo de memoria.',
      fecha: '2025-11-04', estado: 'publica', anonima: false,
      respuesta: { texto: 'Gracias, Ximena. Nos vemos en el entrenamiento de olimpiada del jueves.', fecha: '2025-11-05' } },

    { id: 'res-05', profesorId: 'pr-06', alumnoId: 'al-17', materiaId: 'mat-pri-6-eng', estrellas: 5,
      criterios: { claridad: 5, dominio: 5, trato: 4, puntualidad: 5 },
      comentario: 'Damos ciencias en inglés y casi no te das cuenta de que estás aprendiendo el idioma. ' +
        'El simulacro de Flyers fue igualito al examen de verdad.',
      fecha: '2025-11-02', estado: 'publica', anonima: false, respuesta: null },

    { id: 'res-06', profesorId: 'pr-08', alumnoId: 'al-24', materiaId: 'mat-sec-3-rob', estrellas: 5,
      criterios: { claridad: 4, dominio: 5, trato: 5, puntualidad: 5 },
      comentario: 'Que califique la bitácora y no el robot terminado nos quitó el miedo a equivocarnos. ' +
        'Es la única materia donde documentar un error da puntos.',
      fecha: '2025-11-09', estado: 'publica', anonima: false, respuesta: null },

    { id: 'res-07', profesorId: 'pr-12', alumnoId: 'al-21', materiaId: 'mat-sec-2-his', estrellas: 4,
      criterios: { claridad: 4, dominio: 5, trato: 5, puntualidad: 4 },
      comentario: 'Trabajar con periódicos de la época en lugar del libro de texto hace que la historia ' +
        'se sienta discutible. Lo único: las entrevistas del proyecto piden mucho tiempo fuera de clase.',
      fecha: '2025-11-06', estado: 'publica', anonima: false, respuesta: null },

    { id: 'res-08', profesorId: 'pr-11', alumnoId: 'al-26', materiaId: 'mat-bac-1-cie', estrellas: 3,
      criterios: { claridad: 3, dominio: 5, trato: 3, puntualidad: 4 },
      comentario: 'Sabe muchísimo pero va rápido. Si te quedas atrás en la primera media hora de la ' +
        'práctica, ya no alcanzas el resto de la sesión.',
      fecha: '2025-11-10', estado: 'pendiente', anonima: true, respuesta: null },

    { id: 'res-09', profesorId: 'pr-13', alumnoId: 'al-30', materiaId: 'mat-bac-3-eng', estrellas: 3,
      criterios: { claridad: 4, dominio: 5, trato: 3, puntualidad: 3 },
      comentario: 'Muy buena clase, pero los writings tardan en regresar y a veces ya estamos en el ' +
        'siguiente tema sin saber qué salió mal en el anterior.',
      fecha: '2025-11-11', estado: 'pendiente', anonima: true, respuesta: null },

    { id: 'res-10', profesorId: 'pr-05', alumnoId: 'al-15', materiaId: 'mat-pri-5-cna', estrellas: 4,
      criterios: { claridad: 4, dominio: 5, trato: 5, puntualidad: 4 },
      comentario: 'El huerto es lo mejor de la materia. La parte del cuerpo humano se siente más ' +
        'apurada que el resto del programa.',
      fecha: '2025-11-10', estado: 'pendiente', anonima: false, respuesta: null },

    { id: 'res-11', profesorId: 'pr-10', alumnoId: 'al-19', materiaId: 'mat-sec-1-esp', estrellas: 2,
      criterios: { claridad: 3, dominio: 4, trato: 2, puntualidad: 3 },
      comentario: 'Comentario retirado por la persona docente: contenía datos personales de un tercero.',
      fecha: '2025-10-28', estado: 'oculta', anonima: true, respuesta: null }
  ];

  /* ---------------------------------------------------------------- bitácora */
  var bitacora = [
    { id: 'bit-01', fecha: '2025-11-12', actorId: 'dir-01', texto: 'Publicó el aviso «Calendario del tercer parcial».' },
    { id: 'bit-02', fecha: '2025-11-11', actorId: 'pr-09', texto: 'Abrió una asesoría extra de Cálculo Diferencial para el 27 de noviembre.' },
    { id: 'bit-03', fecha: '2025-11-09', actorId: 'pr-10', texto: 'Capturó las calificaciones del proyecto integrador en sus seis materias.' },
    { id: 'bit-04', fecha: '2025-11-08', actorId: 'pr-13', texto: 'Programó el segundo simulacro Cambridge B2 de 3º de secundaria.' },
    { id: 'bit-05', fecha: '2025-11-05', actorId: 'dir-01', texto: 'Abrió el periodo de reinscripciones al ciclo 2026 – 2027.' },
    { id: 'bit-06', fecha: '2025-10-25', actorId: 'pr-09', texto: 'Respondió una reseña pública de Álgebra y Trigonometría.' },
    { id: 'bit-07', fecha: '2025-10-22', actorId: 'dir-01', texto: 'Cambió a «condicionado» el estatus de Mateo Urrutia Sandoval.' },
    { id: 'bit-08', fecha: '2025-10-20', actorId: 'dir-01', texto: 'Cambió a «condicionado» el estatus de Ángel Tejada Solórzano.' }
  ];

  /* Los campos de trabajo (_perfil, _pago) no viajan a la base. */
  alumnos = alumnos.map(function (a) {
    var limpio = {};
    Object.keys(a).forEach(function (k) { if (k.charAt(0) !== '_') limpio[k] = a[k]; });
    return limpio;
  });

  return {
    version: 4,
    contador: 100,
    escuela: escuela,
    direccion: direccion,
    niveles: niveles,
    grados: grados,
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
