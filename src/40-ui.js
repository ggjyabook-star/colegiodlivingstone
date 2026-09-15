/* ============================================================================
   40-ui.js — Iconografía, componentes de interfaz y gráficas en SVG.
   Declara: const ICONOS, const U

   Convención de escapado:
     · Las ranuras compositivas (cuerpo, acciones, valor, pie, accion) se
       insertan TAL CUAL: son HTML que arma quien llama.
     · Todo lo demás es texto plano y se escapa aquí dentro.
   ========================================================================== */

/* --------------------------------------------------------------- iconos ---
   Trazo de 1.6 sobre lienzo 24×24. Sólo "estrella" y "punto" van rellenos. */
const ICONOS = {

  casa: '<path d="M3.4 10.6 12 4l8.6 6.6"/><path d="M5.6 9.4V19a1.4 1.4 0 0 0 1.4 1.4h10a1.4 1.4 0 0 0 1.4-1.4V9.4"/><path d="M9.8 20.4v-5.2h4.4v5.2"/>',

  libro: '<path d="M4 4.6h5.2A2.8 2.8 0 0 1 12 7.4v12a2.2 2.2 0 0 0-2.2-2.2H4z"/><path d="M20 4.6h-5.2A2.8 2.8 0 0 0 12 7.4v12a2.2 2.2 0 0 1 2.2-2.2H20z"/>',

  usuarios: '<circle cx="9.2" cy="8.2" r="3.4"/><path d="M3.2 20v-1.6a4.2 4.2 0 0 1 4.2-4.2h3.6a4.2 4.2 0 0 1 4.2 4.2V20"/><path d="M17 4.9a3.4 3.4 0 0 1 0 6.6"/><path d="M20.8 20v-1.6a4.2 4.2 0 0 0-3.1-4.06"/>',

  usuario: '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20.2v-1.4a4.6 4.6 0 0 1 4.6-4.6h5.2a4.6 4.6 0 0 1 4.6 4.6v1.4"/>',

  tarjeta: '<rect x="2.6" y="5.2" width="18.8" height="13.6" rx="2.4"/><path d="M2.6 9.8h18.8"/><path d="M6 14.8h3.4"/>',

  grafica: '<path d="M3.6 18.8h16.8"/><rect x="5.4" y="10.4" width="3.4" height="8.4" rx=".8"/><rect x="10.3" y="6.6" width="3.4" height="12.2" rx=".8"/><rect x="15.2" y="13.2" width="3.4" height="5.6" rx=".8"/>',

  estrella: '<path d="M12 2.6 14.86 8.4l6.4.94-4.63 4.5 1.09 6.36L12 17.2l-5.72 3l1.09-6.36-4.63-4.5 6.4-.94z" fill="currentColor" stroke="none"/>',

  calendario: '<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="2.2"/><path d="M3.4 9.8h17.2"/><path d="M8.2 3.4v3.6M15.8 3.4v3.6"/><path d="M7.8 13.6h1.6M11.2 13.6h1.6M14.6 13.6h1.6M7.8 17h1.6M11.2 17h1.6"/>',

  reloj: '<circle cx="12" cy="12" r="8.6"/><path d="M12 6.9V12l3.4 2.1"/>',

  campana: '<path d="M18 9.4c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 5.2-2 6.8-2 6.8h16s-2-1.6-2-6.8z"/><path d="M13.94 19.4a2.2 2.2 0 0 1-3.88 0"/>',

  archivo: '<path d="M13.6 3.4H7.4a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h9.2a2 2 0 0 0 2-2V8.6z"/><path d="M13.6 3.4v5.2h5.2"/>',

  subir: '<path d="M4.4 15.4v3.2a2 2 0 0 0 2 2h11.2a2 2 0 0 0 2-2v-3.2"/><path d="M8.2 8 12 4.2 15.8 8"/><path d="M12 4.4v10.8"/>',

  descargar: '<path d="M4.4 15.4v3.2a2 2 0 0 0 2 2h11.2a2 2 0 0 0 2-2v-3.2"/><path d="M8.2 11 12 14.8 15.8 11"/><path d="M12 3.8v11"/>',

  mas: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',

  menos: '<path d="M5.2 12h13.6"/>',

  lapiz: '<path d="M4 20.1h4.1L18.3 9.9a2.05 2.05 0 0 0 0-2.9l-1.2-1.2a2.05 2.05 0 0 0-2.9 0L4 16z"/><path d="M14.1 6.5l3.4 3.4"/>',

  basura: '<path d="M4 6.6h16"/><path d="M9.4 6.6V4.9a1.5 1.5 0 0 1 1.5-1.5h2.2a1.5 1.5 0 0 1 1.5 1.5v1.7"/><path d="M6.5 6.6l.85 12.1a2 2 0 0 0 2 1.86h5.3a2 2 0 0 0 2-1.86l.85-12.1"/><path d="M10.4 10.4v6.2M13.6 10.4v6.2"/>',

  buscar: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.5 15.5 20.4 20.4"/>',

  filtro: '<path d="M3.6 5.2h16.8l-6.7 7.9v6.1l-3.4-1.9v-4.2z"/>',

  cheque: '<path d="M4.8 12.6 9.5 17.3 19.2 7.2"/>',

  equis: '<path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8"/>',

  alerta: '<path d="M10.28 4.2 2.86 17a2 2 0 0 0 1.72 3h14.84a2 2 0 0 0 1.72-3L13.72 4.2a2 2 0 0 0-3.44 0z"/><path d="M12 9.4v4.2"/><path d="M12 16.8h.01"/>',

  info: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11.2v5.2"/><path d="M12 7.9h.01"/>',

  engrane: '<circle cx="12" cy="12" r="3.1"/><circle cx="12" cy="12" r="6.6"/><path d="M12 5.4V3.2M12 20.8v-2.2M18.6 12h2.2M3.2 12h2.2M16.66 7.34l1.56-1.56M5.78 18.22l1.56-1.56M16.66 16.66l1.56 1.56M5.78 5.78l1.56 1.56"/>',

  salir: '<path d="M9.6 20.4H6.2a2 2 0 0 1-2-2V5.6a2 2 0 0 1 2-2h3.4"/><path d="M15.4 16.4 19.8 12l-4.4-4.4"/><path d="M19.8 12H9.4"/>',

  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',

  'flecha-der': '<path d="M4.6 12h14.2"/><path d="M13.2 6.4 18.8 12l-5.6 5.6"/>',

  'flecha-izq': '<path d="M19.4 12H5.2"/><path d="M10.8 6.4 5.2 12l5.6 5.6"/>',

  'flecha-arriba': '<path d="M12 19.4V5.2"/><path d="M6.4 10.8 12 5.2l5.6 5.6"/>',

  'flecha-abajo': '<path d="M12 4.6v14.2"/><path d="M6.4 13.2 12 18.8l5.6-5.6"/>',

  ojo: '<path d="M2.4 12S6 5.4 12 5.4 21.6 12 21.6 12 18 18.6 12 18.6 2.4 12 2.4 12z"/><circle cx="12" cy="12" r="3"/>',

  sol: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2"/><path d="M12 19.2v2.2"/><path d="M4.4 4.4l1.6 1.6"/><path d="M18 18l1.6 1.6"/><path d="M2.6 12h2.2"/><path d="M19.2 12h2.2"/><path d="M4.4 19.6 6 18"/><path d="M18 6l1.6-1.6"/>',

  luna: '<path d="M20.4 13.6A8.4 8.4 0 0 1 10.4 3.6a8.4 8.4 0 1 0 10 10z"/>',

  /* --- los seis pilares del colegio, dibujados para esto ------------------ */

  identidad: '<path d="M12 2.9 19 5.5v6c0 4.6-3.1 7.4-7 8.9-3.9-1.5-7-4.3-7-8.9v-6z"/>' +
    '<circle cx="12" cy="10.1" r="2.1"/><path d="M8.5 16.3a3.9 3.9 0 0 1 7 0"/>',

  valores: '<path d="M12 20.1c-1.1-.7-7.2-4.5-7.2-9.2A4 4 0 0 1 12 8.2a4 4 0 0 1 7.2 2.7c0 4.7-6.1 8.5-7.2 9.2z"/>',

  idiomas: '<circle cx="12" cy="12" r="8.9"/><path d="M3.1 12h17.8"/>' +
    '<path d="M12 3.1c2.5 2.5 3.9 5.6 3.9 8.9S14.5 18.4 12 20.9c-2.5-2.5-3.9-5.6-3.9-8.9S9.5 5.6 12 3.1z"/>' +
    '<path d="M5.2 6.7a13 13 0 0 0 13.6 0"/><path d="M5.2 17.3a13 13 0 0 1 13.6 0"/>',

  robotica: '<circle cx="12" cy="2.9" r="1.1"/><path d="M12 4v2.3"/>' +
    '<rect x="4.6" y="6.3" width="14.8" height="11.5" rx="2.8"/>' +
    '<path d="M4.6 10.9H2.9M19.4 10.9h1.7"/>' +
    '<circle cx="9.3" cy="11.3" r="1.2"/><circle cx="14.7" cy="11.3" r="1.2"/>' +
    '<path d="M9.6 15h4.8"/><path d="M8.4 17.8v2.4M15.6 17.8v2.4"/>',

  arte: '<path d="M12 3.3c4.9 0 8.8 3.1 8.8 7 0 2.3-1.9 4.2-4.2 4.2h-1.9c-1 0-1.8.8-1.8 1.7 0 1.2 1.3 1.6 1.3 3 0 1.1-.9 1.5-2.2 1.5A8.7 8.7 0 0 1 12 3.3z"/>' +
    '<circle cx="8.1" cy="9.4" r="1.05"/><circle cx="12" cy="7.5" r="1.05"/>' +
    '<circle cx="15.8" cy="9.7" r="1.05"/><circle cx="7.4" cy="13.6" r="1.05"/>',

  ciencias: '<path d="M12 2.7v2.6"/><circle cx="12" cy="6.4" r="1.5"/>' +
    '<path d="M10.9 7.7 5.4 20.6"/><path d="M13.1 7.7 18.6 20.6"/>' +
    '<path d="M7.9 16.2c1.2 1.4 2.6 2.1 4.1 2.1s2.9-.7 4.1-2.1"/>' +
    '<path d="M18.6 20.6l1.9-1.2"/>',

  /* --- After Class -------------------------------------------------------- */

  balon: '<circle cx="12" cy="12" r="8.9"/><path d="M12 7.7 15.9 10.5 14.4 15.1H9.6L8.1 10.5z"/>' +
    '<path d="M12 3.1v4.6M20.5 10.5l-4.6 0M18.6 18.9 14.4 15.1M5.4 18.9 9.6 15.1M3.5 10.5l4.6 0"/>',

  musica: '<circle cx="8.6" cy="17" r="2.6"/><path d="M11.2 17V5.1"/>' +
    '<path d="M11.2 5.1c3.4.5 5.5 1.9 5.9 4.4"/><path d="M11.2 9.3c2.4.4 4 1.3 4.5 2.9"/>',

  'ojo-cerrado': '<path d="M4.2 4.6 19.8 19.4"/><path d="M10.2 6c.58-.11 1.18-.17 1.8-.17 6 0 9.6 6.17 9.6 6.17a17.5 17.5 0 0 1-3.35 4.02"/><path d="M6.4 8.2A17.4 17.4 0 0 0 2.4 12s3.6 6.17 9.6 6.17a9.9 9.9 0 0 0 3.4-.6"/><path d="M10.3 10.4a3 3 0 0 0 4.2 4.28"/>',

  correo: '<rect x="2.8" y="5" width="18.4" height="14" rx="2.2"/><path d="M3.6 7.6 12 13.2l8.4-5.6"/>',

  telefono: '<path d="M20.4 16.9v2.5a1.7 1.7 0 0 1-1.86 1.7 16.9 16.9 0 0 1-7.36-2.62 16.6 16.6 0 0 1-5.1-5.1A16.9 16.9 0 0 1 3.46 6a1.7 1.7 0 0 1 1.69-1.87h2.5a1.7 1.7 0 0 1 1.7 1.46c.1.82.3 1.62.58 2.38a1.7 1.7 0 0 1-.38 1.79l-1.06 1.06a13.6 13.6 0 0 0 5.1 5.1l1.06-1.06a1.7 1.7 0 0 1 1.79-.38c.76.28 1.56.48 2.38.58a1.7 1.7 0 0 1 1.46 1.72z"/>',

  pin: '<path d="M20 10.4c0 5.6-8 12-8 12s-8-6.4-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10.2" r="2.9"/>',

  escudo: '<path d="M12 21.4s7.4-3.4 7.4-9.2V5.9L12 3.1 4.6 5.9v6.3c0 5.8 7.4 9.2 7.4 9.2z"/><path d="M9.1 12.1l2.1 2.1 3.7-3.9"/>',

  birrete: '<path d="M2.6 8.8 12 4.4l9.4 4.4-9.4 4.4z"/><path d="M6.6 10.9v4.6c0 1.66 2.42 3 5.4 3s5.4-1.34 5.4-3v-4.6"/><path d="M21.4 8.8v5.6"/>',

  portapapeles: '<path d="M9.2 4.2H7.6a2 2 0 0 0-2 2v12.4a2 2 0 0 0 2 2h8.8a2 2 0 0 0 2-2V6.2a2 2 0 0 0-2-2h-1.6"/><rect x="9" y="2.6" width="6" height="3.6" rx="1.1"/><path d="M8.8 11.6h6.4M8.8 15.2h4.2"/>',

  chat: '<path d="M4.6 20.4V6.4a2.2 2.2 0 0 1 2.2-2.2h10.4a2.2 2.2 0 0 1 2.2 2.2v6.6a2.2 2.2 0 0 1-2.2 2.2H9.2z"/><path d="M8.4 8.2h8M8.4 11.4h5"/>',

  candado: '<rect x="4.6" y="10.4" width="14.8" height="10" rx="2.2"/><path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/><path d="M12 14.2v2.6"/>',

  foto: '<rect x="3" y="4.6" width="18" height="14.8" rx="2.2"/><circle cx="8.6" cy="9.8" r="1.7"/><path d="M3.4 17.4l4.5-4.3a2 2 0 0 1 2.72 0l4.28 4.1"/><path d="M14.1 14.5l1.7-1.6a2 2 0 0 1 2.72 0l2.08 1.98"/>',

  pdf: '<path d="M13.6 3.4H7.4a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h9.2a2 2 0 0 0 2-2V8.6z"/><path d="M13.6 3.4v5.2h5.2"/><path d="M8.6 12.8h4M8.6 15.6h6.8M8.6 18.2h3.4"/>',

  video: '<rect x="2.8" y="5.4" width="18.4" height="13.2" rx="2.4"/><path d="M10.4 9.5 15.4 12l-5 2.5z"/>',

  liga: '<path d="M10.2 13.8a3.9 3.9 0 0 0 5.88.42l2.4-2.4a3.9 3.9 0 0 0-5.52-5.52l-1.38 1.37"/><path d="M13.8 10.2a3.9 3.9 0 0 0-5.88-.42l-2.4 2.4a3.9 3.9 0 0 0 5.52 5.52l1.37-1.37"/>',

  presentacion: '<rect x="3" y="4" width="18" height="12.4" rx="2"/><path d="M12 16.4v3.2"/><path d="M8.4 20.4 12 19.4l3.6 1"/><path d="M7.4 12.6l2.9-3.2 2.4 2 3.9-4.2"/>',

  hoja: '<rect x="3.4" y="3.8" width="17.2" height="16.4" rx="2.2"/><path d="M3.4 9.2h17.2M3.4 14.8h17.2M9.4 3.8v16.4M15 3.8v16.4"/>',

  dinero: '<rect x="2.4" y="6.2" width="19.2" height="11.6" rx="2.2"/><circle cx="12" cy="12" r="2.8"/><path d="M6.2 9.8v4.4M17.8 9.8v4.4"/>',

  'tendencia-arriba': '<path d="M3.4 16.6 9.4 10.6l3.6 3.6 7.6-7.6"/><path d="M15.6 6.6h5v5"/>',

  'tendencia-abajo': '<path d="M3.4 7.4 9.4 13.4l3.6-3.6 7.6 7.6"/><path d="M15.6 17.4h5v-5"/>',

  punto: '<circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none"/>',

  sello: '<circle cx="12" cy="9.2" r="5.6"/><path d="M8.5 13.9 7.3 21l4.7-2.6 4.7 2.6-1.2-7.1"/>',

  sol: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.2M12 19v2.2M21.2 12H19M5 12H2.8M18.5 5.5l-1.56 1.56M7.06 16.94 5.5 18.5M18.5 18.5l-1.56-1.56M7.06 7.06 5.5 5.5"/>',

  luna: '<path d="M20.6 13.6A8.6 8.6 0 0 1 10.4 3.4a8.6 8.6 0 1 0 10.2 10.2z"/>',

  refrescar: '<path d="M20.4 11.3A8.4 8.4 0 0 0 6.3 6.3L3.6 8.8"/><path d="M3.6 4.4v4.6h4.6"/><path d="M3.6 12.7a8.4 8.4 0 0 0 14.1 5l2.7-2.5"/><path d="M20.4 19.6V15h-4.6"/>'
};

/* ------------------------------------------------------------ componentes -- */
const U = (function () {

  var contador = 0;
  function nuevoId(pfx) { contador += 1; return (pfx || 'u') + '-' + contador; }
  function r2(n) { return Math.round(n * 100) / 100; }

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  /* --- escapado ---------------------------------------------------------- */

  /* Estricto: para atributos y para cualquier texto que venga de DB. */
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Para nodos de texto: idempotente, no vuelve a escapar entidades ya escritas. */
  function escT(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,8}|#\d{1,6}|#x[0-9a-fA-F]{1,6});)/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function attr(obj) {
    if (!obj) return '';
    var salida = [];
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (v === null || v === undefined || v === false) return;
      if (v === true) { salida.push(k); return; }
      if (typeof v === 'object') {
        /* Comillas simples + entidades: data-args sobrevive cualquier contenido. */
        salida.push(k + "='" + esc(JSON.stringify(v)) + "'");
      } else {
        salida.push(k + '="' + esc(v) + '"');
      }
    });
    return salida.length ? ' ' + salida.join(' ') : '';
  }

  /* --- iconos ------------------------------------------------------------ */

  function icono(nombre, tam) {
    var d = Object.prototype.hasOwnProperty.call(ICONOS, nombre) ? ICONOS[nombre] : null;
    if (typeof d !== 'string') d = ICONOS.punto;
    var t = tam || 17;
    return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + d + '</svg>';
  }

  /* --- identidad --------------------------------------------------------- */

  function iniciales(nombre) {
    var partes = String(nombre || '').trim().split(/\s+/).filter(function (p) {
      return p && !/^(mtro|mtra|lic|dr|dra|ing|prof|profa|arq|c)\.?$/i.test(p);
    });
    if (!partes.length) return '—';
    /* Con nombre compuesto (4 palabras o más) toma nombre + primer apellido. */
    var segunda = partes.length >= 4 ? partes[2] : partes[1];
    return (partes[0].charAt(0) + (segunda ? segunda.charAt(0) : '')).toUpperCase();
  }

  function avatar(persona, tam) {
    var cls = 'avatar' + (tam ? ' avatar-' + esc(tam) : '');
    if (!persona) {
      return '<span class="' + cls + '" style="background:var(--superficie-3);color:var(--tinta-3)" ' +
        'aria-hidden="true">—</span>';
    }
    if (persona.foto) {
      return '<span class="' + cls + '" title="' + esc(persona.nombre) + '">' +
        '<img src="' + esc(persona.foto) + '" alt=""></span>';
    }
    var ini = persona.iniciales || iniciales(persona.nombre);
    var fondo = persona.color || 'var(--marca)';
    return '<span class="' + cls + '" style="background:' + esc(fondo) + '" ' +
      'title="' + esc(persona.nombre) + '">' + escT(ini) + '</span>';
  }

  /* --- insignias --------------------------------------------------------- */

  function badge(texto, variante) {
    return '<span class="badge badge-' + esc(variante || 'neutro') + '">' + escT(texto) + '</span>';
  }

  function chip(texto, variante) {
    var color = { ok: 'var(--ok)', aviso: 'var(--aviso)', crit: 'var(--crit)',
      info: 'var(--info)', marca: 'var(--marca-ink)' }[variante];
    return '<span class="chip"' + (color ? ' style="color:' + color + '"' : '') + '>' +
      escT(texto) + '</span>';
  }

  /* --- números, fechas --------------------------------------------------- */

  function moneda(n) {
    var num = Number(n);
    if (!isFinite(num)) num = 0;
    var neg = num < 0;
    var partes = Math.abs(num).toFixed(2).split('.');
    var enteros = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-$' : '$') + enteros + '.' + partes[1];
  }

  function tamano(bytes) {
    var b = Number(bytes);
    if (!isFinite(b) || b <= 0) return '0 KB';
    if (b < 1024) return Math.round(b) + ' B';
    if (b < 1048576) return Math.round(b / 1024) + ' KB';
    var mb = b / 1048576;
    return (mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10) + ' MB';
  }

  function aFecha(iso) {
    if (!iso) return null;
    if (iso instanceof Date) return iso;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function hoySinHora() {
    return new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate());
  }

  function fecha(iso, formato) {
    var f = aFecha(iso);
    if (!f) return '—';
    var d = f.getDate(), mes = f.getMonth(), anio = f.getFullYear();
    if (formato === 'larga') {
      return DIAS[f.getDay()] + ' ' + d + ' de ' + MESES[mes] + ' de ' + anio;
    }
    if (formato === 'mes') return MESES[mes] + ' ' + anio;
    if (formato === 'relativa') {
      var dias = Math.round((new Date(anio, mes, d) - hoySinHora()) / 86400000);
      if (dias === 0) return 'hoy';
      if (dias === 1) return 'mañana';
      if (dias === -1) return 'ayer';
      if (dias > 1) return 'en ' + dias + ' días';
      return 'hace ' + Math.abs(dias) + ' días';
    }
    return d + ' ' + MESES_C[mes] + ' ' + anio;
  }

  function notaTexto(n) {
    if (n === null || n === undefined || n === '') return '—';
    var v = Number(n);
    if (!isFinite(v)) return '—';
    return v.toFixed(1);
  }

  function claseNota(n) {
    if (n === null || n === undefined || n === '') return '';
    var v = Number(n);
    if (!isFinite(v)) return '';
    if (v >= 8.5) return 'nota-alta';
    if (v >= 6) return 'nota-media';
    return 'nota-baja';
  }

  function fmt(v, formato) {
    if (typeof formato === 'function') return formato(v);
    if (formato === 'moneda') return moneda(v);
    if (formato === 'pct' || formato === 'porcentaje') return Math.round(Number(v) || 0) + '%';
    if (formato === 'nota') return notaTexto(v);
    if (formato === 'entero') return String(Math.round(Number(v) || 0));
    var n = Number(v);
    if (!isFinite(n)) return '—';
    return String(Math.round(n * 10) / 10);
  }

  function colorVar(variante) {
    if (variante === 'ok') return 'var(--ok)';
    if (variante === 'aviso') return 'var(--aviso)';
    if (variante === 'crit') return 'var(--crit)';
    if (variante === 'acento') return 'var(--acento)';
    return 'var(--marca)';
  }

  function colorSerie(i, propio) {
    return propio || 'var(--serie-' + ((i % 6) + 1) + ')';
  }

  function recorta(texto, max) {
    var t = String(texto === null || texto === undefined ? '' : texto);
    return t.length > max ? t.slice(0, max - 1) + '…' : t;
  }

  /* --- superficies ------------------------------------------------------- */

  function seccion(o) {
    o = o || {};
    var cab = '';
    if (o.titulo || o.sub || o.acciones) {
      cab = '<div class="seccion-cab"><div>' +
        (o.titulo ? '<h2>' + escT(o.titulo) + '</h2>' : '') +
        (o.sub ? '<div class="sub">' + escT(o.sub) + '</div>' : '') +
        '</div>' +
        (o.acciones ? '<div class="fila envuelve gap-1">' + juntar(o.acciones) + '</div>' : '') +
        '</div>';
    }
    return '<section class="seccion' + (o.clase ? ' ' + esc(o.clase) : '') + '">' +
      cab + (o.cuerpo || '') + '</section>';
  }

  function panel(o) {
    o = o || {};
    var cab = '';
    if (o.titulo || o.sub || o.acciones) {
      cab = '<div class="panel-cab"><div>' +
        (o.titulo ? '<h3 class="panel-tit">' + escT(o.titulo) + '</h3>' : '') +
        (o.sub ? '<p class="panel-sub">' + escT(o.sub) + '</p>' : '') +
        '</div>' +
        (o.acciones ? '<div class="panel-acc">' + juntar(o.acciones) + '</div>' : '') +
        '</div>';
    }
    return '<div class="panel' + (o.clase ? ' ' + esc(o.clase) : '') + '">' + cab +
      '<div class="panel-cuerpo' + (o.sinRelleno ? ' sin-relleno' : '') + '">' + (o.cuerpo || '') + '</div>' +
      (o.pie ? '<div class="panel-pie">' + o.pie + '</div>' : '') +
      '</div>';
  }

  function juntar(v) {
    if (v === null || v === undefined) return '';
    return Array.isArray(v) ? v.join('') : String(v);
  }

  function vacio(o) {
    o = o || {};
    return '<div class="vacio">' +
      '<div class="ico">' + icono(o.icono || 'portapapeles', 22) + '</div>' +
      '<h4>' + escT(o.titulo || 'Sin información') + '</h4>' +
      (o.texto ? '<p>' + escT(o.texto) + '</p>' : '') +
      (o.accion ? '<div class="mt-2">' + juntar(o.accion) + '</div>' : '') +
      '</div>';
  }

  function kpi(o) {
    o = o || {};
    return '<div class="kpi' + (o.variante ? ' v-' + esc(o.variante) : '') +
      (o.clase ? ' ' + esc(o.clase) : '') + '">' +
      '<div class="kpi-etiqueta">' + (o.icono ? icono(o.icono, 13) : '') +
      '<span>' + escT(o.etiqueta) + '</span></div>' +
      '<div class="kpi-valor">' + (o.valor === null || o.valor === undefined ? '—' : o.valor) + '</div>' +
      (o.sub ? '<div class="kpi-sub">' + escT(o.sub) + '</div>' : '') +
      (o.pie ? '<div class="kpi-pie">' + o.pie + '</div>' : '') +
      '</div>';
  }

  function progreso(pct, variante) {
    var p = Number(pct);
    if (!isFinite(p)) p = 0;
    p = Math.max(0, Math.min(100, p));
    return '<div class="progreso" role="progressbar" aria-valuenow="' + Math.round(p) +
      '" aria-valuemin="0" aria-valuemax="100">' +
      '<div class="progreso-barra' + (variante ? ' v-' + esc(variante) : '') +
      '" style="width:' + r2(p) + '%"></div></div>';
  }

  /* --- tabla ------------------------------------------------------------- */

  function claseCol(c, esCelda) {
    var l = [];
    var a = c.align || '';
    if (a === 'der' || a === 'right' || a === 'num') l.push('num');
    else if (a === 'centro' || a === 'center') l.push('centro-col');
    if (esCelda && c.mono) l.push('mono');
    if (c.clase) l.push(c.clase);
    return l.join(' ');
  }

  function tabla(o) {
    o = o || {};
    var columnas = o.columnas || [];
    var filas = o.filas || [];
    if (!filas.length || !columnas.length) {
      return vacio({ icono: o.iconoVacio || 'portapapeles', titulo: 'Sin registros', texto: o.vacio || '' });
    }
    var cabeza = columnas.map(function (c) {
      var cls = claseCol(c, false);
      return '<th' + (cls ? ' class="' + cls + '"' : '') +
        (c.ancho ? ' style="width:' + esc(c.ancho) + '"' : '') + '>' + escT(c.titulo) + '</th>';
    }).join('');

    var cuerpo = filas.map(function (f) {
      var celdas = columnas.map(function (c) {
        var v = f[c.clave];
        var cls = claseCol(c, true);
        var contenido = c.html ? (v === null || v === undefined ? '' : v) : escT(v);
        return '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + contenido + '</td>';
      }).join('');
      return '<tr' + (f._clase ? ' class="' + esc(f._clase) + '"' : '') + attr(f._attr) + '>' +
        celdas + '</tr>';
    }).join('');

    return '<div class="tabla-envoltura"><table class="tabla' + (o.clase ? ' ' + esc(o.clase) : '') + '">' +
      '<thead><tr>' + cabeza + '</tr></thead><tbody>' + cuerpo + '</tbody></table></div>';
  }

  /* --- estrellas --------------------------------------------------------- */

  /* `total` es el tamaño de la escala: cuántas estrellas se pintan (5 por
     omisión). Quien necesite mostrar el número de reseñas lo escribe aparte. */
  function estrellas(valor, o) {
    o = o || {};
    var escala = Math.round(Number(o.total));
    if (!isFinite(escala) || escala < 1) escala = 5;
    if (escala > 10) escala = 10;
    var v = Number(valor);
    if (!isFinite(v)) v = 0;
    v = Math.max(0, Math.min(escala, v));
    var llenas = Math.round(v);
    var piezas = '';
    for (var i = 1; i <= escala; i++) {
      piezas += '<span' + (i <= llenas ? ' class="estrella-llena"' : '') + '>' + icono('estrella', 15) + '</span>';
    }
    return '<span class="estrellas' + (o.tam === 'lg' ? ' tam-lg' : '') + '" role="img" ' +
      'aria-label="' + esc(v.toFixed(1) + ' de ' + escala) + '">' +
      piezas + (o.sinValor ? '' : '<span class="valor">' + escT(v.toFixed(1)) + '</span>') + '</span>';
  }

  function estrellasInput(nombre, valor) {
    var base = nuevoId('est');
    var v = Number(valor) || 0;
    var piezas = '';
    for (var n = 5; n >= 1; n--) {
      var id = base + '-' + n;
      piezas += '<input type="radio" id="' + id + '" name="' + esc(nombre) + '" value="' + n + '"' +
        (n === v ? ' checked' : '') + '>' +
        '<label for="' + id + '" title="' + n + ' de 5" aria-label="' + n + ' de 5">' +
        icono('estrella', 26) + '</label>';
    }
    return '<div class="estrellas-input" role="radiogroup" aria-label="Calificación">' + piezas + '</div>';
  }

  /* --- gráficas ---------------------------------------------------------- */

  function sinDatos(o, texto) {
    return vacio({
      icono: 'grafica',
      titulo: (o && o.vacio) || 'Sin datos que graficar',
      texto: texto || 'Todavía no hay información suficiente para esta gráfica.'
    });
  }

  function abreSvg(w, h, etiqueta) {
    return '<svg class="grafica" viewBox="0 0 ' + r2(w) + ' ' + r2(h) + '" ' +
      'preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(etiqueta) + '">';
  }

  /* Barras horizontales con etiqueta a la izquierda y valor al final. */
  function barras(o) {
    o = o || {};
    var series = (o.series || []).filter(Boolean);
    if (!series.length) return sinDatos(o);

    var valores = series.map(function (s) { return Number(s.valor) || 0; });
    var conMeta = typeof o.meta === 'number' && isFinite(o.meta);
    var max = Number(o.max);
    if (!isFinite(max) || max <= 0) {
      max = Math.max.apply(null, valores.concat(conMeta ? [Number(o.meta)] : []));
    }
    if (!isFinite(max) || max <= 0) max = 1;

    var textos = valores.map(function (v) { return fmt(v, o.formato); });
    var anchoValor = Math.max(38, Math.max.apply(null, textos.map(function (t) { return t.length; })) * 6.2 + 8);
    var W = 340;
    var anchoEtiqueta = 94;
    var x0 = anchoEtiqueta + 8;
    var largoMax = W - anchoValor - x0;
    if (largoMax < 60) { anchoEtiqueta = 70; x0 = 78; largoMax = W - anchoValor - x0; }

    var padTop = 6;
    var padBot = conMeta ? 20 : 6;
    var altoFila = 26;
    var H = padTop + series.length * altoFila + padBot;
    if (o.alto && Number(o.alto) > padTop + padBot + series.length * 14) {
      H = Number(o.alto);
      altoFila = (H - padTop - padBot) / series.length;
    }

    var cuerpo = series.map(function (s, i) {
      var cy = padTop + i * altoFila + altoFila / 2;
      var w = Math.max(0, Math.min(1, valores[i] / max)) * largoMax;
      var et = recorta(s.etiqueta, 22);
      var ajuste = et.length * 5.7 > anchoEtiqueta
        ? ' textLength="' + anchoEtiqueta + '" lengthAdjust="spacingAndGlyphs"' : '';
      return '<rect x="' + x0 + '" y="' + r2(cy - 6) + '" width="' + r2(largoMax) + '" height="12" rx="3" ' +
          'fill="var(--superficie-3)"/>' +
        (w > 0.6 ? '<rect x="' + x0 + '" y="' + r2(cy - 6) + '" width="' + r2(w) + '" height="12" rx="3" ' +
          'fill="' + esc(colorSerie(i, s.color)) + '"/>' : '') +
        '<text x="' + anchoEtiqueta + '" y="' + r2(cy + 3.8) + '" text-anchor="end"' + ajuste + '>' +
          escT(et) + '</text>' +
        /* El valor va al final del carril, no de la barra: así nunca lo cruza la línea de meta. */
        '<text class="val" x="' + r2(x0 + largoMax + 7) + '" y="' + r2(cy + 3.8) + '">' + escT(textos[i]) + '</text>';
    }).join('');

    var meta = '';
    if (conMeta) {
      var xm = r2(x0 + Math.max(0, Math.min(1, Number(o.meta) / max)) * largoMax);
      meta = '<line class="meta" x1="' + xm + '" y1="' + padTop + '" x2="' + xm + '" y2="' + r2(H - padBot + 3) + '"/>' +
        '<text x="' + xm + '" y="' + r2(H - 4) + '" text-anchor="middle">meta ' + escT(fmt(o.meta, o.formato)) + '</text>';
    }

    var resumen = series.map(function (s, i) { return recorta(s.etiqueta, 24) + ': ' + textos[i]; }).join(', ');
    return abreSvg(W, H, 'Gráfica de barras. ' + resumen) + cuerpo + meta + '</svg>';
  }

  /* Columnas verticales con eje inferior. */
  function columnas(o) {
    o = o || {};
    var series = (o.series || []).filter(Boolean);
    if (!series.length) return sinDatos(o);

    var valores = series.map(function (s) { return Number(s.valor) || 0; });
    var max = Number(o.max);
    if (!isFinite(max) || max <= 0) max = Math.max.apply(null, valores);
    if (!isFinite(max) || max <= 0) max = 1;

    var W = 340, padL = 10, padR = 10, padT = 22;
    var n = series.length;
    var hueco = (W - padL - padR) / n;
    var etiquetas = series.map(function (s) { return String(s.etiqueta === null || s.etiqueta === undefined ? '' : s.etiqueta); });
    var largoMax = Math.max.apply(null, etiquetas.map(function (e) { return e.length; }));
    var rotar = largoMax * 5.6 > hueco - 4;
    var padBot = rotar ? 46 : 26;
    var H = Number(o.alto) > 90 ? Number(o.alto) : 190;
    var base = H - padBot;
    var util = base - padT;
    var ancho = Math.min(34, hueco * 0.62);

    var cuerpo = series.map(function (s, i) {
      var cx = padL + i * hueco + hueco / 2;
      var alto = Math.max(0, Math.min(1, valores[i] / max)) * util;
      var y = base - alto;
      var texto = fmt(valores[i], o.formato);
      var et = rotar ? recorta(etiquetas[i], 13) : etiquetas[i];
      var etiqueta = rotar
        ? '<text x="' + r2(cx) + '" y="' + r2(base + 13) + '" text-anchor="end" ' +
          'transform="rotate(-38 ' + r2(cx) + ' ' + r2(base + 13) + ')">' + escT(et) + '</text>'
        : '<text x="' + r2(cx) + '" y="' + r2(base + 15) + '" text-anchor="middle">' + escT(et) + '</text>';
      return (alto > 0.6 ? '<rect x="' + r2(cx - ancho / 2) + '" y="' + r2(y) + '" width="' + r2(ancho) +
          '" height="' + r2(alto) + '" rx="3" fill="' + esc(colorSerie(i, s.color)) + '"/>' : '') +
        /* El valor sólo se pinta si cabe dentro del hueco de la columna. */
        (texto.length * 5.8 <= hueco ? '<text class="val" x="' + r2(cx) + '" y="' + r2(y - 6) +
          '" text-anchor="middle">' + escT(texto) + '</text>' : '') + etiqueta;
    }).join('');

    var eje = '<line class="eje" x1="' + padL + '" y1="' + r2(base) + '" x2="' + (W - padR) + '" y2="' + r2(base) + '"/>';
    var resumen = series.map(function (s, i) { return etiquetas[i] + ': ' + fmt(valores[i], o.formato); }).join(', ');
    return abreSvg(W, H, 'Gráfica de columnas. ' + resumen) + eje + cuerpo + '</svg>';
  }

  /* Línea con área en degradado, rejilla y puntos marcados. */
  function linea(o) {
    o = o || {};
    var pts = (o.puntos || []).filter(Boolean);
    if (!pts.length) return sinDatos(o);

    var vals = pts.map(function (p) { return Number(p.valor) || 0; });
    var mx = (o.max !== null && o.max !== undefined && isFinite(o.max)) ? Number(o.max) : Math.max.apply(null, vals);
    var mn = (o.min !== null && o.min !== undefined && isFinite(o.min)) ? Number(o.min) : Math.min.apply(null, vals);
    if (!isFinite(mx)) mx = 1;
    if (!isFinite(mn)) mn = 0;
    if (mx - mn < 0.0001) { mx = mx + 1; mn = Math.max(0, mn - 1); }
    if (mx - mn < 0.0001) mx = mn + 1;

    var etiquetasY = [0, 1, 2, 3].map(function (k) { return fmt(mn + (mx - mn) * k / 3, o.formato); });
    var padL = Math.max(28, Math.max.apply(null, etiquetasY.map(function (t) { return t.length; })) * 6.2 + 10);
    var W = 360, padR = 14, padT = 18, padBot = 26;
    var H = Number(o.alto) > 90 ? Number(o.alto) : 180;
    var base = H - padBot, techo = padT;
    var util = W - padL - padR;

    function px(i) { return pts.length === 1 ? padL + util / 2 : padL + util * i / (pts.length - 1); }
    function py(v) { return base - ((v - mn) / (mx - mn)) * (base - techo); }

    var rejilla = [0, 1, 2, 3].map(function (k) {
      var y = r2(py(mn + (mx - mn) * k / 3));
      return '<line class="rejilla-lin" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"/>' +
        '<text x="' + r2(padL - 7) + '" y="' + r2(y + 3.6) + '" text-anchor="end">' + escT(etiquetasY[k]) + '</text>';
    }).join('');

    var trazo = pts.map(function (p, i) {
      return (i ? 'L' : 'M') + r2(px(i)) + ' ' + r2(py(vals[i]));
    }).join(' ');
    var area = trazo + ' L' + r2(px(pts.length - 1)) + ' ' + r2(base) + ' L' + r2(px(0)) + ' ' + r2(base) + ' Z';

    var idGrad = nuevoId('degradado');
    var defs = '<defs><linearGradient id="' + idGrad + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="var(--marca)" stop-opacity="0.30"/>' +
      '<stop offset="1" stop-color="var(--marca)" stop-opacity="0"/></linearGradient></defs>';

    var meta = '';
    if (typeof o.meta === 'number' && isFinite(o.meta) && o.meta >= mn && o.meta <= mx) {
      var ym = r2(py(Number(o.meta)));
      meta = '<line class="meta" x1="' + padL + '" y1="' + ym + '" x2="' + (W - padR) + '" y2="' + ym + '"/>';
    }

    var ultimo = pts.length - 1;
    var marcas = pts.map(function (p, i) {
      var x = r2(px(i)), y = r2(py(vals[i]));
      var esUlt = i === ultimo;
      return '<circle cx="' + x + '" cy="' + y + '" r="' + (esUlt ? 4.6 : 3) + '" ' +
        'fill="' + (esUlt ? 'var(--marca)' : 'var(--superficie)') + '" stroke="var(--marca)" stroke-width="1.6"/>';
    }).join('');

    var xUlt = px(ultimo);
    var valorUlt = '<text class="val" x="' + r2(ultimo === 0 ? xUlt : xUlt + 2) + '" y="' + r2(py(vals[ultimo]) - 10) +
      '" text-anchor="' + (ultimo === 0 ? 'middle' : 'end') + '">' + escT(fmt(vals[ultimo], o.formato)) + '</text>';

    var ejeX = pts.map(function (p, i) {
      if (pts.length > 9 && i % 2 === 1) return '';
      return '<text x="' + r2(px(i)) + '" y="' + r2(H - 8) + '" text-anchor="middle">' +
        escT(recorta(p.etiqueta, 9)) + '</text>';
    }).join('');

    var resumen = pts.map(function (p, i) { return recorta(p.etiqueta, 14) + ': ' + fmt(vals[i], o.formato); }).join(', ');
    /* Con un solo punto no hay trazo ni área que dibujar: sólo el marcador. */
    var trazos = pts.length < 2 ? '' :
      '<path d="' + area + '" fill="url(#' + idGrad + ')" stroke="none"/>' +
      '<path d="' + trazo + '" fill="none" stroke="var(--marca)" stroke-width="2.2" ' +
      'stroke-linecap="round" stroke-linejoin="round"/>';

    return abreSvg(W, H, 'Gráfica de línea. ' + resumen) + defs + rejilla + meta +
      trazos + marcas + valorUlt + ejeX + '</svg>';
  }

  /* Anillo de progreso. */
  function anillo(pct, o) {
    o = o || {};
    var p = Number(pct);
    if (!isFinite(p)) p = 0;
    p = Math.max(0, Math.min(100, p));
    var tam = Number(o.tam) > 0 ? Number(o.tam) : 132;
    var radio = 52, circ = 2 * Math.PI * radio;
    var lleno = circ * p / 100;
    var etiqueta = (o.etiqueta === null || o.etiqueta === undefined) ? Math.round(p) + '%' : String(o.etiqueta);
    var yValor = o.sub ? 62 : 70;

    return '<svg class="grafica" viewBox="0 0 128 128" preserveAspectRatio="xMidYMid meet" ' +
      'style="width:' + tam + 'px;height:' + tam + 'px;margin:0 auto" role="img" ' +
      'aria-label="' + esc(etiqueta + (o.sub ? '. ' + o.sub : '')) + '">' +
      '<circle cx="64" cy="64" r="' + radio + '" fill="none" stroke="var(--superficie-3)" stroke-width="11"/>' +
      (p > 0 ? '<circle cx="64" cy="64" r="' + radio + '" fill="none" stroke="' + colorVar(o.variante) + '" ' +
        'stroke-width="11" stroke-linecap="round" stroke-dasharray="' + r2(lleno) + ' ' + r2(circ - lleno) + '" ' +
        'transform="rotate(-90 64 64)"/>' : '') +
      '<text x="64" y="' + yValor + '" text-anchor="middle" ' +
        'style="fill:var(--tinta);font-family:var(--f-display);font-size:27px;font-weight:600">' +
        escT(etiqueta) + '</text>' +
      (o.sub ? '<text x="64" y="82" text-anchor="middle" style="font-size:11px">' + escT(recorta(o.sub, 22)) + '</text>' : '') +
      '</svg>';
  }

  /* Dona con hueco al centro y leyenda debajo. */
  function dona(o) {
    o = o || {};
    var todos = (o.segmentos || []).filter(Boolean);
    if (!todos.length) return sinDatos(o);
    var centro = o.centro || {};
    var tam = Number(o.tam) > 0 ? Number(o.tam) : 156;
    var radio = 46, circ = 2 * Math.PI * radio;
    var visibles = todos.filter(function (s) { return (Number(s.valor) || 0) > 0; });
    var total = visibles.reduce(function (a, s) { return a + (Number(s.valor) || 0); }, 0);

    var arcos = '';
    if (total > 0) {
      var acumulado = 0;
      arcos = todos.map(function (s, i) {
        var v = Number(s.valor) || 0;
        if (v <= 0) return '';
        var frac = v / total;
        var largo = Math.max(0.5, frac * circ - (visibles.length > 1 ? 2.2 : 0));
        var pieza = '<circle cx="64" cy="64" r="' + radio + '" fill="none" stroke="' + esc(colorSerie(i, s.color)) + '" ' +
          'stroke-width="20" stroke-dasharray="' + r2(largo) + ' ' + r2(circ - largo) + '" ' +
          'stroke-dashoffset="' + r2(-acumulado) + '" transform="rotate(-90 64 64)"/>';
        acumulado += frac * circ;
        return pieza;
      }).join('');
    }

    var resumen = todos.map(function (s) {
      return String(s.etiqueta) + ': ' + fmt(s.valor, o.formato);
    }).join(', ');

    var svg = '<svg class="grafica" viewBox="0 0 128 128" preserveAspectRatio="xMidYMid meet" ' +
      'style="width:' + tam + 'px;height:' + tam + 'px" role="img" aria-label="' + esc('Gráfica de dona. ' + resumen) + '">' +
      '<circle cx="64" cy="64" r="' + radio + '" fill="none" stroke="var(--superficie-3)" stroke-width="20"/>' +
      arcos +
      (centro.valor !== null && centro.valor !== undefined
        ? '<text x="64" y="' + (centro.sub ? 62 : 69) + '" text-anchor="middle" ' +
          'style="fill:var(--tinta);font-family:var(--f-display);font-size:23px;font-weight:600">' +
          escT(centro.valor) + '</text>' : '') +
      (centro.sub ? '<text x="64" y="80" text-anchor="middle" style="font-size:10.5px">' +
        escT(recorta(centro.sub, 20)) + '</text>' : '') +
      '</svg>';

    var leyenda = '<div class="leyenda">' + todos.map(function (s, i) {
      return '<span class="leyenda-item"><span class="punto" style="background:' + esc(colorSerie(i, s.color)) + '"></span>' +
        escT(s.etiqueta) + ' <strong>' + escT(fmt(s.valor, o.formato)) + '</strong></span>';
    }).join('') + '</div>';

    return '<div><div class="centro">' + svg + '</div>' + leyenda + '</div>';
  }

  /* --- formularios ------------------------------------------------------- */

  function opcionesHtml(opciones, valor, placeholder) {
    var html = '';
    var hayValor = valor !== null && valor !== undefined && valor !== '';
    if (placeholder) {
      html += '<option value=""' + (hayValor ? '' : ' selected') + '>' + escT(placeholder) + '</option>';
    }
    html += (opciones || []).map(function (op) {
      var v = (op && typeof op === 'object') ? op.valor : op;
      var t = (op && typeof op === 'object') ? (op.texto === undefined ? op.valor : op.texto) : op;
      var sel = hayValor && String(valor) === String(v) ? ' selected' : '';
      return '<option value="' + esc(v) + '"' + sel + '>' + escT(t) + '</option>';
    }).join('');
    return html;
  }

  var TIPOS_INPUT = {
    texto: 'text', numero: 'number', fecha: 'date', hora: 'time',
    correo: 'email', tel: 'tel', archivo: 'file', color: 'color', clave: 'password'
  };

  function campo(o) {
    o = o || {};
    var tipo = o.tipo || 'texto';
    var id = o.id || nuevoId('campo');
    var nombre = o.nombre || id;
    var extra = attr(o.attrs) +
      (o.cambio ? ' data-cambio="' + esc(o.cambio) + '"' : '') +
      (o.entrada ? ' data-entrada="' + esc(o.entrada) + '"' : '') +
      (o.deshabilitado ? ' disabled' : '') +
      (o.soloLectura ? ' readonly' : '') +
      (o.requerido ? ' required' : '');
    var marca = o.requerido ? ' <span class="campo-req">*</span>' : '';
    var ayuda = o.ayuda ? '<div class="campo-ayuda" id="' + id + '-ayuda">' + escT(o.ayuda) + '</div>' : '';
    var descrito = o.ayuda ? ' aria-describedby="' + id + '-ayuda"' : '';
    var control, interior;

    if (tipo === 'checa') {
      interior = '<label class="checa" for="' + id + '">' +
        '<input type="checkbox" id="' + id + '" name="' + esc(nombre) + '" value="1"' +
        (o.valor ? ' checked' : '') + descrito + extra + '>' +
        '<span>' + escT(o.etiqueta) + marca + '</span></label>' + ayuda;
    } else {
      if (tipo === 'area') {
        control = '<textarea class="area" id="' + id + '" name="' + esc(nombre) + '" rows="' + (o.filas || 4) + '"' +
          (o.placeholder ? ' placeholder="' + esc(o.placeholder) + '"' : '') + descrito + extra + '>' +
          escT(o.valor) + '</textarea>';
      } else if (tipo === 'selec') {
        control = '<select class="selec" id="' + id + '" name="' + esc(nombre) + '"' + descrito + extra + '>' +
          opcionesHtml(o.opciones, o.valor, o.placeholder) + '</select>';
      } else {
        var t = TIPOS_INPUT[tipo] || 'text';
        control = '<input class="entrada' + (o.mono ? ' mono' : '') + '" type="' + t + '" id="' + id + '" ' +
          'name="' + esc(nombre) + '"' +
          (t === 'file' ? '' : ' value="' + esc(o.valor) + '"') +
          (o.placeholder && t !== 'file' && t !== 'color' ? ' placeholder="' + esc(o.placeholder) + '"' : '') +
          (o.min !== undefined && o.min !== null ? ' min="' + esc(o.min) + '"' : '') +
          (o.max !== undefined && o.max !== null ? ' max="' + esc(o.max) + '"' : '') +
          (o.paso !== undefined && o.paso !== null ? ' step="' + esc(o.paso) + '"' : '') +
          (t === 'file' && o.acepta ? ' accept="' + esc(o.acepta) + '"' : '') +
          descrito + extra + '>';
      }
      interior = '<label class="campo-etiqueta" for="' + id + '">' + escT(o.etiqueta) + marca + '</label>' +
        control + ayuda;
    }

    return '<div class="col-' + (o.col || 12) + '"><div class="campo">' + interior + '</div></div>';
  }

  function form(o) {
    o = o || {};
    var acciones = o.acciones
      ? juntar(o.acciones)
      : '<button type="submit" class="btn btn-primario">Guardar</button>';
    return '<form id="' + esc(o.id || nuevoId('form')) + '"' +
      (o.accion ? ' data-envio="' + esc(o.accion) + '"' : '') + attr(o.attrs) +
      ' class="form-rejilla' + (o.clase ? ' ' + esc(o.clase) : '') + '">' +
      juntar(o.campos) +
      '<div class="col-12 form-acciones">' + acciones + '</div>' +
      '</form>';
  }

  /* --- navegación -------------------------------------------------------- */

  function pestanas(items, activo, accion) {
    var lista = (items || []).filter(Boolean);
    return '<div class="pestanas" role="tablist">' + lista.map(function (it) {
      var esActiva = String(it.id) === String(activo);
      return '<button type="button" class="pestana' + (esActiva ? ' pestana-activa' : '') + '" ' +
        'role="tab" aria-selected="' + (esActiva ? 'true' : 'false') + '"' +
        (accion ? ' data-accion="' + esc(accion) + '"' + attr({ 'data-args': { id: it.id } }) : '') + '>' +
        (it.icono ? icono(it.icono, 15) : '') + escT(it.texto) +
        (it.conteo === null || it.conteo === undefined ? '' : '<span class="conteo">' + escT(it.conteo) + '</span>') +
        '</button>';
    }).join('') + '</div>';
  }

  function migas(items) {
    var lista = (items || []).filter(Boolean);
    if (!lista.length) return '';
    return '<nav class="migas" aria-label="Ruta">' + lista.map(function (it, i) {
      var sep = i ? '<span class="sep" aria-hidden="true">/</span>' : '';
      var ultimo = i === lista.length - 1;
      if (ultimo || !it.ruta) {
        return sep + '<span class="actual"' + (ultimo ? ' aria-current="page"' : '') + '>' + escT(it.texto) + '</span>';
      }
      return sep + '<a href="' + esc(it.ruta) + '">' + escT(it.texto) + '</a>';
    }).join('') + '</nav>';
  }

  /* --- avisos flotantes -------------------------------------------------- */

  var ICONO_TOAST = { ok: 'cheque', crit: 'alerta', aviso: 'alerta', info: 'info' };

  function toast(mensaje, variante) {
    var zona = document.getElementById('toasts');
    if (!zona) return;
    while (zona.children.length >= 3) zona.removeChild(zona.firstElementChild);
    var el = document.createElement('div');
    el.className = 'toast' + (variante ? ' v-' + variante : '');
    el.setAttribute('role', variante === 'crit' ? 'alert' : 'status');
    el.innerHTML = icono(ICONO_TOAST[variante] || 'info', 16) + '<span>' + escT(mensaje) + '</span>';
    zona.appendChild(el);
    window.setTimeout(function () {
      if (!el.parentNode) return;
      el.className += ' saliendo';
      window.setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 260);
    }, 3600);
  }

  /* --- modal ------------------------------------------------------------- */

  var modalAbierto = null;
  var focoPrevio = null;
  var overflowPrevio = '';

  function enfocables(raiz) {
    var sel = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), ' +
      'select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.prototype.slice.call(raiz.querySelectorAll(sel));
  }

  function modal(o) {
    o = o || {};
    var contenedor = document.getElementById('modales');
    if (!contenedor) return;
    if (!modalAbierto) {
      focoPrevio = document.activeElement;
      overflowPrevio = document.body.style.overflow;
    }
    contenedor.innerHTML = '';

    var ancho = o.ancho === 'ancho' ? ' ancho' : (o.ancho === 'angosto' ? ' angosto' : '');
    var fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML =
      '<div class="modal' + ancho + '" role="dialog" aria-modal="true" ' +
        'aria-label="' + esc(o.titulo || 'Ventana') + '">' +
        '<div class="modal-cab"><div>' +
          '<h3>' + escT(o.titulo || '') + '</h3>' +
          (o.sub ? '<div class="sub">' + escT(o.sub) + '</div>' : '') +
        '</div>' +
        '<button type="button" class="btn btn-fantasma btn-icono" data-accion="app:cerrarModal" ' +
          'data-cerrar-modal="1" aria-label="Cerrar">' + icono('equis', 18) + '</button>' +
        '</div>' +
        '<div class="modal-cuerpo">' + (o.cuerpo || '') + '</div>' +
        (o.acciones ? '<div class="modal-pie">' + juntar(o.acciones) + '</div>' : '') +
      '</div>';

    contenedor.appendChild(fondo);
    document.body.style.overflow = 'hidden';
    modalAbierto = fondo;

    fondo.addEventListener('mousedown', function (ev) {
      if (ev.target === fondo) cerrarModal();
    });
    /* Todos los controles de cierre, no sólo el primero: la «Cancelar» de
       U.confirmar también lleva data-cerrar-modal. */
    Array.prototype.forEach.call(fondo.querySelectorAll('[data-cerrar-modal]'), function (b) {
      b.addEventListener('click', function () { cerrarModal(); });
    });

    var cuerpo = fondo.querySelector('.modal-cuerpo');
    var candidatos = cuerpo ? enfocables(cuerpo) : [];
    if (!candidatos.length) candidatos = enfocables(fondo);
    if (candidatos.length && candidatos[0].focus) {
      try { candidatos[0].focus(); } catch (e) { /* sin foco disponible */ }
    }
  }

  function cerrarModal() {
    var contenedor = document.getElementById('modales');
    if (contenedor) contenedor.innerHTML = '';
    if (!modalAbierto) return;
    modalAbierto = null;
    document.body.style.overflow = overflowPrevio;
    if (focoPrevio && focoPrevio.focus && document.body.contains(focoPrevio)) {
      try { focoPrevio.focus(); } catch (e) { /* el elemento ya no existe */ }
    }
    focoPrevio = null;
  }

  function confirmar(o) {
    o = o || {};
    var idOk = nuevoId('ok');
    modal({
      titulo: o.titulo || 'Confirmar',
      ancho: 'angosto',
      cuerpo: '<p>' + escT(o.texto || '¿Deseas continuar?') + '</p>',
      acciones:
        '<button type="button" class="btn" data-accion="app:cerrarModal" data-cerrar-modal="1">' +
          escT(o.textoCancelar || 'Cancelar') + '</button>' +
        '<button type="button" id="' + idOk + '" class="btn ' + (o.peligro ? 'btn-peligro' : 'btn-primario') + '"' +
          (o.accion ? ' data-accion="' + esc(o.accion) + '"' : '') +
          attr({ 'data-args': o.args || {} }) + '>' +
          escT(o.textoOk || 'Aceptar') + '</button>'
    });
    var propio = modalAbierto;
    var boton = document.getElementById(idOk);
    if (boton) {
      boton.addEventListener('click', function () {
        /* Cierra después de que la acción global haya corrido. */
        window.setTimeout(function () {
          if (modalAbierto === propio) cerrarModal();
        }, 0);
      });
    }
  }

  /* Escape y trampa de foco: se registran una sola vez. */
  document.addEventListener('keydown', function (ev) {
    if (!modalAbierto) return;
    if (ev.key === 'Escape') {
      ev.preventDefault();
      cerrarModal();
      return;
    }
    if (ev.key !== 'Tab') return;
    var lista = enfocables(modalAbierto);
    if (!lista.length) return;
    var primero = lista[0], ultimo = lista[lista.length - 1];
    if (ev.shiftKey && document.activeElement === primero) {
      ev.preventDefault();
      ultimo.focus();
    } else if (!ev.shiftKey && document.activeElement === ultimo) {
      ev.preventDefault();
      primero.focus();
    }
  });

  /* --- archivos ---------------------------------------------------------- */

  function leerArchivo(input, cb) {
    if (!input || !input.files || !input.files.length || typeof cb !== 'function') return;
    var archivo = input.files[0];
    var lector = new FileReader();
    lector.onload = function () {
      cb({
        nombre: archivo.name,
        tamano: tamano(archivo.size),
        tipo: archivo.type || '',
        url: String(lector.result)
      });
    };
    lector.readAsDataURL(archivo);
  }

  return {
    esc: esc,
    attr: attr,
    icono: icono,
    avatar: avatar,
    badge: badge,
    chip: chip,
    kpi: kpi,
    tabla: tabla,
    barras: barras,
    columnas: columnas,
    linea: linea,
    anillo: anillo,
    dona: dona,
    estrellas: estrellas,
    estrellasInput: estrellasInput,
    moneda: moneda,
    fecha: fecha,
    notaTexto: notaTexto,
    claseNota: claseNota,
    seccion: seccion,
    panel: panel,
    vacio: vacio,
    campo: campo,
    form: form,
    pestanas: pestanas,
    migas: migas,
    toast: toast,
    modal: modal,
    cerrarModal: cerrarModal,
    confirmar: confirmar,
    leerArchivo: leerArchivo,
    tamano: tamano,
    iniciales: iniciales,
    progreso: progreso
  };
})();
