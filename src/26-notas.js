/* ============================================================================
   26-notas.js — Notas para padres de familia que publica el colegio.
   Declara: const NOTAS
   Es el contenido editorial del sitio: artículos de orientación para las
   familias, firmados por alguien del claustro o por la dirección.

   Cada nota es contenido, no interfaz: el cuerpo se arma con bloques y la
   vista pública decide cómo se ven. Bloques disponibles:

     { t:'p',     x:'párrafo' }
     { t:'h',     x:'subtítulo' }
     { t:'lista', x:['punto', 'punto'] }
     { t:'pasos', x:[{ t:'título del paso', x:'texto' }] }
     { t:'dato',  x:'apunte que va en recuadro' }
     { t:'cita',  x:'frase', de:'quién la dijo' }
     { t:'tabla', cab:['col','col'], filas:[['a','b']] }

   En cualquier texto, **lo que va entre asteriscos dobles** sale en negritas.
   Nada más: el texto se escapa antes de dibujarse.

   `autorId` apunta a un profesor (pr-XX) o a la dirección (dir-01), para que
   la firma lleve al perfil público de quien escribe. La imagen de cada nota
   es el dibujo que ILUSTRACIONES guarda con este mismo `id`.
   ========================================================================== */

const NOTAS = [

  /* ------------------------------------------------------------------------ */
  {
    id: 'habitos-en-casa',
    tema: 'Aprendizaje',
    icono: 'casa',
    fecha: '2025-11-04',
    lectura: 7,
    autorId: 'pr-05',
    titulo: 'Cinco cosas que sí mueven el aprendizaje en casa',
    gancho: 'No son las apps ni las clases particulares. Lo que más cambia el rendimiento de un ' +
            'niño cabe en cinco hábitos, y cuatro de ellos son gratis.',
    cuerpo: [
      { t: 'p', x: 'Cada año, en las juntas de padres, alguien hace la misma pregunta: «¿qué le ' +
                   'compro, qué le pongo, a dónde lo llevo para que le vaya mejor?». La respuesta ' +
                   'honesta decepciona un poco, porque lo que mejor funciona no se compra. Va lo ' +
                   'que la investigación educativa sostiene con más firmeza, en orden de peso.' },

      { t: 'h', x: '1. Dormir. En serio, dormir' },
      { t: 'p', x: 'El sueño no es tiempo perdido: es cuando el cerebro consolida lo que se ' +
                   'estudió durante el día. Un adolescente que duerme seis horas estudia con una ' +
                   'desventaja que ningún método compensa.' },
      { t: 'p', x: 'Las recomendaciones pediátricas son claras: **de 6 a 12 años, entre 9 y 12 ' +
                   'horas**; **de 13 a 18 años, entre 8 y 10**. Y más importante que el total es ' +
                   'la regularidad: la misma hora de dormir entre semana sostiene mejor el ' +
                   'rendimiento que dormir poco de lunes a viernes y recuperar el sábado.' },
      { t: 'dato', x: 'Prueba concreta: el celular se queda fuera del cuarto, cargando en la sala. ' +
                      'Es la medida que más rápido devuelve horas de sueño a un adolescente.' },

      { t: 'h', x: '2. Preguntarse, no releer' },
      { t: 'p', x: 'Releer el cuaderno **se siente** productivo: todo suena conocido. Esa ' +
                   'sensación es precisamente la trampa. Cerrar el libro e intentar recordar ' +
                   'produce un aprendizaje bastante más duradero que volver a leer, aunque en el ' +
                   'momento se sienta más difícil e incómodo.' },
      { t: 'p', x: 'En casa se aplica sin material: pídale a su hijo que le cuente de qué se ' +
                   'trató la clase, sin abrir el cuaderno. Lo que no pueda contar es exactamente ' +
                   'lo que le falta estudiar. Ese hueco, encontrado un martes, no aparece el día ' +
                   'del examen.' },

      { t: 'h', x: '3. Repartir el estudio en el tiempo' },
      { t: 'p', x: 'Cuatro sesiones de 25 minutos en cuatro días distintos rinden más que una de ' +
                   'cien minutos la noche anterior, aun siendo el mismo tiempo total. El examen ' +
                   'mide lo que sobrevivió, y lo que hace que algo sobreviva es haberlo visitado ' +
                   'varias veces con descansos de por medio.' },
      { t: 'p', x: 'Esto cambia la conversación de casa: en vez de «ponte a estudiar», sirve más ' +
                   'un «¿qué tienes el jueves?» el lunes.' },

      { t: 'h', x: '4. Leer en voz alta más tiempo del que parece necesario' },
      { t: 'p', x: 'Cuando un niño ya lee solo, muchas familias dejan de leerle. Vale la pena ' +
                   'seguir. Leerle en voz alta lo expone a un vocabulario y a estructuras de ' +
                   'frase más complejas de las que alcanza por sí mismo, y el vocabulario es el ' +
                   'mejor predictor de la comprensión lectora más adelante.' },
      { t: 'p', x: 'A partir de secundaria el equivalente es otro: leer lo mismo que él. Una ' +
                   'novela compartida da tema de conversación durante semanas.' },

      { t: 'h', x: '5. Preguntar de la escuela, pero bien' },
      { t: 'p', x: '«¿Cómo te fue?» tiene una sola respuesta posible: «bien». Las preguntas ' +
                   'concretas abren conversaciones de verdad.' },
      { t: 'lista', x: [
        '¿Qué fue lo más difícil de hoy?',
        '¿A quién ayudaste o quién te ayudó?',
        '¿Qué le preguntaste al profe?',
        '¿Qué hiciste hoy que ayer no sabías hacer?'
      ] },
      { t: 'p', x: 'Y al comentar los resultados, hable del **proceso**, no de la etiqueta. ' +
                   '«Se nota que le dedicaste tiempo» y «esa forma de organizarte funcionó» ' +
                   'dejan al niño con algo que puede repetir. «Eres muy inteligente» lo deja ' +
                   'con algo que puede perder.' },

      { t: 'h', x: 'Y una que no ayuda tanto como parece' },
      { t: 'p', x: 'Sentarse a hacer la tarea **con** él está bien; hacérsela, no. La tarea es el ' +
                   'único termómetro que tiene el profesor para saber qué entendió el grupo. Una ' +
                   'tarea resuelta por el papá informa mal, y el costo se cobra en el examen.' },
      { t: 'p', x: 'Si la tarea está tomando muchísimo más tiempo del que debería, eso no se ' +
                   'arregla resolviéndola: se avisa al profesor titular. Es información valiosa y ' +
                   'en el portal se puede mandar en dos minutos.' }
    ],
    fuentes: [
      'American Academy of Sleep Medicine y American Academy of Pediatrics — recomendaciones de horas de sueño por edad.',
      'Roediger y Karpicke, «Test-Enhanced Learning», Psychological Science (2006).',
      'Cepeda, Pashler, Vul, Wixted y Rohrer — metaanálisis sobre práctica distribuida, Psychological Bulletin (2006).'
    ]
  },

  /* ------------------------------------------------------------------------ */
  {
    id: 'hablar-de-la-colegiatura',
    tema: 'Familia y dinero',
    icono: 'dinero',
    fecha: '2025-10-21',
    lectura: 8,
    autorId: 'pr-14',
    titulo: 'Hablar de la colegiatura en casa: por qué conviene y cómo hacerlo',
    gancho: 'La mayoría de las familias trata el costo de la escuela como un asunto de adultos. ' +
            'Hay buenas razones para abrirlo — y una forma de hacerlo que sale mal.',
    cuerpo: [
      { t: 'p', x: 'Nadie quiere que un hijo se sienta una carga. Por eso, en muchas casas, la ' +
                   'colegiatura es un tema del que se habla en voz baja o no se habla. Es ' +
                   'comprensible, pero hay una diferencia grande entre **cargarle la preocupación** ' +
                   'y **que sepa lo que cuesta su educación**. Lo primero sobra; lo segundo enseña.' },

      { t: 'h', x: 'Por qué no es prematuro' },
      { t: 'p', x: 'Buena parte de los hábitos básicos que gobiernan la relación de un adulto con ' +
                   'el dinero se forman mucho antes de que ese adulto tenga dinero propio: ' +
                   'investigación de la Universidad de Cambridge ubica su formación **alrededor de ' +
                   'los siete años**. Esperar a la universidad para hablar de finanzas es llegar ' +
                   'una década tarde.' },
      { t: 'p', x: 'La OCDE mide competencia financiera en jóvenes de quince años dentro de PISA. ' +
                   'Un hallazgo se repite prueba tras prueba: los estudiantes que **conversan de ' +
                   'dinero con sus padres** obtienen mejores resultados que quienes no lo hacen. ' +
                   'No es la mesada lo que marca la diferencia, es la conversación.' },

      { t: 'h', x: 'Cómo se habla, según la edad' },
      { t: 'pasos', x: [
        { t: 'De 5 a 8 años', x: 'La escuela cuesta dinero, como la casa y la comida, y la ' +
                                 'familia decidió pagarla. Con eso basta. Números chiquitos y ' +
                                 'comparaciones concretas: «esto que pagamos al mes alcanza para ' +
                                 'tantas semanas de despensa».' },
        { t: 'De 9 a 12 años', x: 'Ya se puede enseñar la cifra real y qué compra: los maestros, ' +
                                  'el laboratorio, la biblioteca, los materiales. Y se le puede ' +
                                  'dar una decisión pequeña pero real —una actividad de la tarde, ' +
                                  'una salida— donde vea que elegir una cosa significa no elegir ' +
                                  'otra.' },
        { t: 'De 13 a 18 años', x: 'El número completo del año: inscripción, colegiatura, ' +
                                   'uniformes, materiales, salidas. Que él arme la cuenta con ' +
                                   'usted, no que se la entreguen hecha. A esta edad la ' +
                                   'conversación se conecta con la que viene: carrera, ' +
                                   'universidad, becas, y qué parte va a poner él.' }
      ] },

      { t: 'h', x: 'Lo que no hay que hacer' },
      { t: 'p', x: 'Usar la colegiatura como reproche. «Con lo que pagamos y mira tus ' +
                   'calificaciones» convierte la educación en una deuda, y una deuda no motiva: ' +
                   'hace que el hijo **esconda** la calificación mala en vez de pedir ayuda. Es ' +
                   'exactamente lo contrario de lo que se buscaba.' },
      { t: 'cita', x: 'Que sepa lo que cuesta, no lo que debe.', de: 'Regla práctica para esta conversación' },

      { t: 'h', x: 'Dos cosas prácticas que conviene saber' },
      { t: 'p', x: 'La primera: en México las colegiaturas de escuelas con validez oficial son ' +
                   '**deducibles** en la declaración anual del ISR, dentro de un tope anual por ' +
                   'alumno y por nivel.' },
      { t: 'tabla', cab: ['Nivel', 'Tope anual deducible por alumno'], filas: [
        ['Preescolar', '$14,200'],
        ['Primaria', '$12,900'],
        ['Secundaria', '$19,900'],
        ['Profesional técnico', '$17,100'],
        ['Bachillerato o equivalente', '$24,500']
      ] },
      { t: 'p', x: 'Para que aplique, el pago debe hacerse con **cheque nominativo, transferencia ' +
                   'o tarjeta** —nunca en efectivo—, la factura debe llevar el **CURP del alumno** ' +
                   'y la escuela debe tener autorización o reconocimiento de validez oficial. La ' +
                   'inscripción, los uniformes y los materiales no entran. Confirme los montos del ' +
                   'ejercicio en curso con el SAT o con su contador antes de declarar.' },
      { t: 'p', x: 'La segunda: casi todos los colegios tienen becas, y casi todas se pierden por ' +
                   'no preguntar a tiempo. Los criterios y las fechas de solicitud son públicos; ' +
                   'pedirlos no compromete a nada.' },

      { t: 'dato', x: 'En el portal del colegio, la sección de **Pagos** muestra el estado de ' +
                      'cuenta al día: lo pagado, lo que sigue y la referencia de cada movimiento. ' +
                      'Es un buen punto de partida para esta conversación, porque el número deja ' +
                      'de ser una abstracción.' }
    ],
    fuentes: [
      'Whitebread y Bingham, «Habit Formation and Learning in Young Children», University of Cambridge para el Money Advice Service (2013).',
      'OCDE — PISA, evaluación de competencia financiera en estudiantes de 15 años.',
      'SAT — estímulo fiscal por pagos de colegiaturas, Decreto del 26 de diciembre de 2013 y reglas vigentes.'
    ]
  },

  /* ------------------------------------------------------------------------ */
  {
    id: 'todos-aprenden-distinto',
    tema: 'Aprendizaje',
    icono: 'identidad',
    fecha: '2025-10-07',
    lectura: 7,
    autorId: 'pr-03',
    titulo: 'Todos los niños aprenden distinto, pero no como suele decirse',
    gancho: 'Lo de «mi hijo es visual» es de las ideas más repetidas en educación, y de las peor ' +
            'sostenidas. Las diferencias entre niños son reales; están en otro lado.',
    cuerpo: [
      { t: 'p', x: 'En algún momento casi todos los padres escuchan —o dicen— alguna versión de ' +
                   'esto: «es que él es visual», «ella aprende haciendo», «a mi hijo hay que ' +
                   'explicarle de oído». La idea de fondo es que cada niño tiene un canal ' +
                   'preferido y que enseñarle por ese canal lo hace aprender más. Suena razonable ' +
                   'y es cómoda. El problema es que se ha puesto a prueba y no se sostiene.' },

      { t: 'h', x: 'Qué se probó exactamente' },
      { t: 'p', x: 'Para que la teoría de los estilos de aprendizaje sea útil, tiene que cumplirse ' +
                   'una cosa concreta: que a un alumno «visual» le vaya mejor con material visual ' +
                   'que con material auditivo, y al «auditivo» al revés. Una revisión ya clásica ' +
                   'de Pashler y colegas (2008) buscó estudios con ese diseño y encontró muy ' +
                   'pocos; los que sí lo tenían **no hallaron ese efecto**. Revisiones posteriores ' +
                   'llegaron al mismo lugar.' },
      { t: 'p', x: 'Ojo con lo que esto no dice. No dice que los niños sean iguales, ni que las ' +
                   'preferencias no existan: a un niño puede gustarle más ver un video que ' +
                   'escuchar una explicación, y eso es verdad. Lo que no aparece es el beneficio ' +
                   'de **casar** la enseñanza con esa preferencia.' },

      { t: 'h', x: 'Por qué la etiqueta cuesta cara' },
      { t: 'p', x: 'Un niño al que se le repite que «no es de números» termina creyéndolo, y ' +
                   'quien cree eso deja de intentar. La etiqueta se vuelve un techo. En clase ' +
                   'vemos la versión adolescente todo el tiempo: «yo soy de letras» dicho a los ' +
                   'catorce años, para no volver a abrir un libro de matemáticas.' },

      { t: 'h', x: 'Dónde sí están las diferencias' },
      { t: 'lista', x: [
        '**Conocimiento previo.** Es el predictor más fuerte de lo que un niño va a aprender en la clase de mañana. Dos alumnos en la misma banca pueden estar partiendo de lugares muy distintos, y eso no se ve en la boleta del ciclo pasado.',
        '**Ritmo.** Hay niños que necesitan más vueltas para lo mismo. Ritmo no es capacidad: confundirlos es el error más común y el más costoso.',
        '**Vocabulario y lenguaje de casa.** Cuántas palabras escucha y usa un niño fuera de la escuela pesa muchísimo en su comprensión lectora años después.',
        '**Atención y funciones ejecutivas.** Planear, esperar, sostener una tarea. Maduran a velocidades distintas y el rango normal es amplísimo.',
        '**Intereses.** Lo que engancha a cada uno. Es la palanca más útil que tiene un maestro, y funciona en cualquier canal.',
        '**Condiciones específicas.** Dislexia, TDAH, altas capacidades. Son reales, sí requieren ajustes concretos y las diagnostica un profesional, no una intuición de casa ni de escuela.'
      ] },

      { t: 'h', x: 'Entonces, ¿para qué sirven los videos, los mapas y los experimentos?' },
      { t: 'p', x: 'Sirven, y mucho. Pero por otra razón. No es que cada niño tenga un canal: es ' +
                   'que cada **contenido** lo tiene. La geometría necesita imagen. Un poema ' +
                   'necesita sonido. La química necesita que algo cambie de color enfrente de ' +
                   'ti. Presentar lo mismo de varias formas ayuda a todo el grupo, no a un ' +
                   'subgrupo con determinada etiqueta.' },
      { t: 'dato', x: 'La versión corta para casa: en vez de buscar **el** canal de su hijo, ' +
                      'busque que tenga varias entradas al mismo tema. Es lo que hacemos en clase ' +
                      'y funciona para todos.' },

      { t: 'h', x: 'Qué puede hacer usted' },
      { t: 'pasos', x: [
        { t: 'Describa con verbos, no con etiquetas', x: 'En lugar de «es kinestésico», diga ' +
              '«se concentra mejor cuando puede armar algo con las manos». Lo primero cierra; lo ' +
              'segundo es información útil para el maestro.' },
        { t: 'Lleve datos concretos a la junta', x: 'Cuánto tarda en la tarea, en qué materia se ' +
              'traba, a qué hora rinde. Eso cambia una conversación mucho más que una etiqueta.' },
        { t: 'Pregunte por el punto de partida', x: '«¿Qué le falta de lo anterior para poder con ' +
              'esto?» es la pregunta que más rápido destraba a un alumno atorado.' },
        { t: 'Si sospecha algo específico, evalúe', x: 'Si hay indicios de dislexia, TDAH o de ' +
              'altas capacidades, lo que corresponde es una valoración profesional. Adivinar ' +
              'retrasa el apoyo real.' }
      ] },
      { t: 'p', x: 'En el portal, cada evaluación queda registrada por criterio y no sólo por ' +
                   'calificación final. Sirve justo para esto: ver **en qué** se atoró, no nada ' +
                   'más cuánto sacó.' }
    ],
    fuentes: [
      'Pashler, McDaniel, Rohrer y Bjork, «Learning Styles: Concepts and Evidence», Psychological Science in the Public Interest (2008).',
      'Willingham, Hughes y Dobolyi, «The Scientific Status of Learning Styles Theories», Teaching of Psychology (2015).'
    ]
  },

  /* ------------------------------------------------------------------------ */
  {
    id: 'sistema-educativo-mexico',
    tema: 'Para decidir',
    icono: 'birrete',
    fecha: '2025-09-16',
    lectura: 9,
    autorId: 'dir-01',
    titulo: 'Cómo está organizado el sistema educativo en México',
    gancho: 'Quince grados obligatorios, cuatro campos formativos y una clave que conviene pedir ' +
            'antes de firmar una inscripción. Una guía para entender dónde está parado su hijo.',
    cuerpo: [
      { t: 'p', x: 'Muchas decisiones escolares se toman con información parcial, no por descuido ' +
                   'sino porque el sistema se explica poco. Va un mapa breve de cómo está armado ' +
                   'y qué conviene preguntarle a cualquier colegio —este incluido— antes de ' +
                   'inscribir a un hijo.' },

      { t: 'h', x: 'Qué es obligatorio' },
      { t: 'p', x: 'La Constitución establece como obligatorias la **educación básica** ' +
                   '—preescolar, primaria y secundaria— y, desde la reforma de febrero de 2012, ' +
                   'también la **media superior**. En total son quince grados: tres de preescolar, ' +
                   'seis de primaria, tres de secundaria y tres de bachillerato.' },
      { t: 'tabla', cab: ['Tramo', 'Grados', 'Edad aproximada'], filas: [
        ['Preescolar', '3', '3 a 5 años'],
        ['Primaria', '6', '6 a 11 años'],
        ['Secundaria', '3', '12 a 14 años'],
        ['Media superior', '3', '15 a 17 años']
      ] },
      { t: 'p', x: 'Cada ciclo escolar la SEP publica un calendario oficial, que en los últimos ' +
                   'años ha rondado entre 185 y 190 días de clase, con las fechas de inicio, fin, ' +
                   'periodos de evaluación y días de consejo técnico.' },

      { t: 'h', x: 'Quién regula qué' },
      { t: 'p', x: 'La Secretaría de Educación Pública fija el plan de estudios nacional y las ' +
                   'autoridades educativas de cada estado operan y supervisan. Toda escuela, ' +
                   'pública o particular, tiene una **Clave de Centro de Trabajo (CCT)** que la ' +
                   'identifica ante el sistema. Es un dato público y se puede consultar.' },
      { t: 'dato', x: 'Para que los estudios de una escuela particular tengan validez oficial, ' +
                      'educación básica requiere **autorización** de la autoridad educativa, y ' +
                      'media superior y superior requieren **Reconocimiento de Validez Oficial de ' +
                      'Estudios (RVOE)**. No es un trámite decorativo: sin eso, los papeles no ' +
                      'sirven para inscribirse en otra escuela ni para titularse. Pida el número ' +
                      'y verifíquelo.' },

      { t: 'h', x: 'Qué cambió con el plan vigente' },
      { t: 'p', x: 'El Plan de Estudio 2022, dentro de lo que se llama Nueva Escuela Mexicana, ' +
                   'reorganizó la educación básica. En lugar de una lista larga de asignaturas ' +
                   'sueltas, el trabajo se agrupa en **cuatro campos formativos**:' },
      { t: 'lista', x: [
        '**Lenguajes** — español, lenguas indígenas, lenguas extranjeras y lenguajes artísticos.',
        '**Saberes y pensamiento científico** — matemáticas y ciencias naturales.',
        '**Ética, naturaleza y sociedades** — historia, geografía, civismo y cuidado del entorno.',
        '**De lo humano y lo comunitario** — desarrollo personal, salud, actividad física y vida en comunidad.'
      ] },
      { t: 'p', x: 'La trayectoria se organiza en **seis fases** en vez de grados aislados: la ' +
                   'fase 1 corresponde a educación inicial; la 2, a preescolar; la 3, a 1º y 2º ' +
                   'de primaria; la 4, a 3º y 4º; la 5, a 5º y 6º; y la 6, a secundaria. La idea ' +
                   'es que dos grados consecutivos se trabajen como un tramo continuo.' },
      { t: 'p', x: 'Además hay **siete ejes articuladores** que atraviesan todos los campos: ' +
                   'inclusión, pensamiento crítico, interculturalidad crítica, igualdad de género, ' +
                   'vida saludable, apropiación de las culturas a través de la lectura y la ' +
                   'escritura, y artes y experiencias estéticas.' },
      { t: 'p', x: 'Para las familias el cambio práctico es que la boleta de básica reporta ' +
                   'avance por campo formativo y por periodo, no una lista de materias con ' +
                   'promedio. A muchos padres les cuesta leerla al principio, y es completamente ' +
                   'razonable pedirle al colegio que se las explique.' },

      { t: 'h', x: 'Las rutas de bachillerato' },
      { t: 'p', x: 'La media superior tiene tres caminos. El **bachillerato general** prepara ' +
                   'sobre todo para continuar a la universidad. El **bachillerato tecnológico** ' +
                   'suma una carrera técnica al mismo tiempo, con la que se puede trabajar al ' +
                   'salir. El **profesional técnico** apunta directamente al empleo, aunque hoy ' +
                   'casi todas sus modalidades también permiten seguir estudiando. Los tres ' +
                   'otorgan certificado de media superior.' },

      { t: 'h', x: 'Qué preguntarle a un colegio antes de inscribir' },
      { t: 'lista', x: [
        'La CCT y, según el nivel, el número de autorización o de RVOE.',
        'Cuántos alumnos hay por grupo y quién es el titular de cada grado.',
        'La formación de la planta docente y cuánta rotación hay de un año a otro.',
        'Cómo y cada cuándo informan el avance académico, y a quién se le escribe cuando algo no va bien.',
        'Qué pasa cuando un alumno se atrasa: si hay asesoría, recuperación o acompañamiento, y si eso cuesta aparte.',
        'El costo **total** del año: inscripción, colegiatura, uniformes, materiales, salidas y cuotas extraordinarias.',
        'Si hay becas, con qué criterios y en qué fechas se solicitan.'
      ] },
      { t: 'p', x: 'Las primeras dos preguntas se contestan con un número. Las demás dicen mucho ' +
                   'por la forma en que se contestan.' }
    ],
    fuentes: [
      'Constitución Política de los Estados Unidos Mexicanos, artículo 3º, y reforma de obligatoriedad de la media superior (febrero de 2012).',
      'Ley General de Educación — autorización y reconocimiento de validez oficial de estudios para particulares.',
      'SEP — Plan de Estudio 2022 para la educación preescolar, primaria y secundaria: campos formativos, fases y ejes articuladores.'
    ]
  },

  /* ------------------------------------------------------------------------ */
  {
    id: 'las-tardes-tambien-educan',
    tema: 'Vida escolar',
    icono: 'balon',
    fecha: '2025-08-26',
    lectura: 6,
    autorId: 'pr-08',
    titulo: 'Las tardes también educan: qué gana un niño en las actividades extraescolares',
    gancho: 'Entre la última clase y la cena hay un bloque de horas que decide más cosas de las ' +
            'que parece. Qué dice la investigación, y cómo distinguir una buena actividad de una ' +
            'guardería cara.',
    cuerpo: [
      { t: 'p', x: 'De lunes a viernes, las horas que van del fin de clases a la noche son el ' +
                   'bloque menos estructurado de la semana de un niño. Lo que se pone ahí ' +
                   'importa, y no todas las opciones valen lo mismo.' },

      { t: 'h', x: 'Qué encontró la investigación' },
      { t: 'p', x: 'El estudio más citado sobre programas de la tarde es un metaanálisis de ' +
                   'Durlak, Weissberg y Pachan (2010) que revisó 68 programas. El resultado tiene ' +
                   'un matiz que vale oro: los programas mejoraron el autoconcepto, el vínculo con ' +
                   'la escuela, la conducta social y hasta los resultados académicos… **pero sólo ' +
                   'los que estaban bien diseñados**. Los que simplemente ocupaban la tarde no ' +
                   'mostraron esos efectos.' },
      { t: 'p', x: 'Los autores resumieron el buen diseño en cuatro rasgos: la actividad avanza ' +
                   'en **secuencia** de lo simple a lo complejo, los niños **hacen** en vez de ' +
                   'escuchar, hay un **foco** claro de tiempo dedicado a practicar la habilidad, y ' +
                   'se dice **explícitamente** qué se está aprendiendo. Es una buena lista para ' +
                   'evaluar cualquier taller.' },

      { t: 'h', x: 'Por qué funciona' },
      { t: 'lista', x: [
        '**Entrenan lo mismo que el estudio.** Un deporte de equipo, un instrumento o un proyecto de robótica exigen planear, inhibir el impulso, sostener la atención y corregir sobre la marcha. Son las mismas funciones ejecutivas que se usan para estudiar, practicadas en un contexto donde el niño quiere estar.',
        '**Dan un lugar donde se es bueno en algo.** Un alumno que en el salón se siente promedio puede ser el que mejor pasa el balón o el que arma el circuito. Esa identidad viaja de regreso al aula, y en la adolescencia pesa muchísimo.',
        '**Ponen adultos alrededor.** Un entrenador o un instructor es otro adulto que conoce al niño y nota cuando algo cambia. Rara vez se piensa como beneficio y suele serlo.',
        '**El idioma entra por la puerta de atrás.** Una actividad en inglés funciona porque ahí el idioma es el medio y no el objeto: se usa para lograr algo que importa, que es exactamente como se aprende mejor.'
      ] },

      { t: 'h', x: 'Cuánto es demasiado' },
      { t: 'p', x: 'Sobrecargar la tarde es un riesgo real y bastante común. Dos a cuatro tardes ' +
                   'ocupadas suele ser un punto sano; un niño también necesita tiempo sin ' +
                   'programar y, sobre todo, dormir lo que le toca.' },
      { t: 'dato', x: 'Tres señales de que hay que quitar algo: está durmiendo menos, la tarea se ' +
                      'quedó sin espacio, o llega de mal humor a la actividad que antes le ' +
                      'gustaba. Cualquiera de las tres basta.' },

      { t: 'h', x: 'Qué preguntar antes de inscribirlo' },
      { t: 'pasos', x: [
        { t: 'Quién la da', x: 'Formación del instructor y cuánto lleva con el grupo. La ' +
              'continuidad importa tanto como el título.' },
        { t: 'Cuántos son', x: 'Un taller de veinticinco niños con un solo adulto no es un ' +
              'taller. Pregunte el número real, no el máximo permitido.' },
        { t: 'A dónde llega', x: '¿Hay una progresión durante el año y algo que cierre —una ' +
              'muestra, un torneo, una presentación—? Tener un destino cambia por completo el ' +
              'compromiso de los niños.' },
        { t: 'Quién lo cuida al final', x: 'Hasta qué hora hay supervisión y cómo es la entrega. ' +
              'Es lo más aburrido de preguntar y lo primero que uno agradece.' }
      ] },
      { t: 'p', x: 'Y una última: deje que elija. Una actividad escogida por el niño y sostenida ' +
                   'un año completo vale más que tres impuestas y abandonadas en noviembre.' }
    ],
    fuentes: [
      'Durlak, Weissberg y Pachan, «A Meta-Analysis of After-School Programs That Seek to Promote Personal and Social Skills», American Journal of Community Psychology (2010).',
      'Diamond y Lee, «Interventions Shown to Aid Executive Function Development in Children 4 to 12 Years Old», Science (2011).'
    ]
  }

];
