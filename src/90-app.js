/* ============================================================================
   90-app.js — Cascarón de la aplicación.
   Declara: const App, const Acciones. Arranca al final del archivo.
   Contiene: enrutador de hash, delegación de eventos, riel + barra superior,
   pantalla de acceso y acciones globales.
   ========================================================================== */

const App = {};
const Acciones = {};

(function () {

  /* ------------------------------------------------------------------ estado */

  var ZONAS = ['publico', 'acceso', 'alumno', 'profesor', 'direccion'];
  var PANELES = { alumno: true, profesor: true, direccion: true };
  var ROL_LEGIBLE = { alumno: 'Estudiante', profesor: 'Docente', direccion: 'Dirección' };
  var LLAVE_TEMA = 'altamira.tema';

  var VISTAS = {};          // se arma en el arranque
  var menuAbierto = false;  // cajón del riel en pantallas angostas

  /* -------------------------------------------------------------- utilidades */

  function esFn(v) { return typeof v === 'function'; }

  // Ejecuta y devuelve `alt` si algo truena. Evita que un selector deje muerto el cascarón.
  function intentar(fn, alt) {
    try { return fn(); } catch (e) { return alt; }
  }

  // Escape sin depender de U: sólo se usa en la pantalla de error.
  function escSeguro(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function elementoDe(nodo) {
    var n = nodo;
    while (n && n.nodeType !== 1) { n = n.parentNode; }
    return n;
  }

  function masCercano(nodo, selector) {
    var el = elementoDe(nodo);
    return (el && el.closest) ? el.closest(selector) : null;
  }

  function leerArgs(el) {
    var crudo = el.dataset ? el.dataset.args : el.getAttribute('data-args');
    if (!crudo) return {};
    try {
      var o = JSON.parse(crudo);
      return (o && typeof o === 'object') ? o : {};
    } catch (e) {
      return {};
    }
  }

  // Atributos de acción listos para interpolar en una cadena de HTML.
  function acc(nombre, args) {
    var mapa = { 'data-accion': nombre };
    if (args) mapa['data-args'] = args;
    return ' ' + U.attr(mapa);
  }

  function capitalizar(txt) {
    var t = String(txt || '');
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  }

  function navDe(vista) {
    var nav = (vista && Array.isArray(vista.nav)) ? vista.nav : [];
    return nav.filter(function (it) { return it && it.id; });
  }

  function itemPorId(nav, id) {
    for (var i = 0; i < nav.length; i++) {
      if (nav[i].id === id) return nav[i];
    }
    return null;
  }

  function idQueCoincide(nav, patron) {
    for (var i = 0; i < nav.length; i++) {
      if (patron.test(String(nav[i].id))) return nav[i].id;
    }
    return null;
  }

  /* --------------------------------------------------------------- enrutador */

  function decodificar(txt) {
    return intentar(function () {
      return decodeURIComponent(String(txt).replace(/\+/g, ' '));
    }, String(txt));
  }

  function parsearParams(cadena) {
    var params = {};
    if (!cadena) return params;
    cadena.split('&').forEach(function (par) {
      if (!par) return;
      var i = par.indexOf('=');
      var clave = i < 0 ? par : par.slice(0, i);
      var valor = i < 0 ? '' : par.slice(i + 1);
      if (!clave) return;
      params[decodificar(clave)] = decodificar(valor);
    });
    return params;
  }

  // "#/alumno/materias?id=mat-01" -> {zona, seccion, params}
  function parsearHash(hash) {
    var crudo = String(hash || '');
    if (crudo.charAt(0) === '#') crudo = crudo.slice(1);
    var corte = crudo.indexOf('?');
    var ruta = corte < 0 ? crudo : crudo.slice(0, corte);
    var consulta = corte < 0 ? '' : crudo.slice(corte + 1);
    var segmentos = ruta.split('/').filter(function (s) { return s !== ''; });
    return {
      zona: segmentos[0] || '',
      seccion: segmentos[1] || '',
      params: parsearParams(consulta)
    };
  }

  // Devuelve la ruta a la que hay que mandar al visitante, o null si la actual sirve.
  function destinoValido(hash) {
    var h = parsearHash(hash);
    var ses = intentar(function () { return Sesion.actual(); }, null);
    if (!h.zona) return '#/publico';
    if (ZONAS.indexOf(h.zona) < 0) return '#/publico';
    if (PANELES[h.zona]) {
      if (!ses) return '#/acceso';
      if (ses.rol !== h.zona) return PANELES[ses.rol] ? '#/' + ses.rol : '#/publico';
      // Sesión que apunta a alguien que ya no está en DB: de vuelta al acceso.
      if (!intentar(function () { return Sesion.persona(); }, null)) return '#/acceso';
    }
    return null;
  }

  function seccionValida(vista, zona, seccion) {
    if (!vista) return seccion;
    var nav = navDe(vista);
    if (seccion) {
      if (itemPorId(nav, seccion)) return seccion;
      if (Array.isArray(vista.secciones) && vista.secciones.indexOf(seccion) >= 0) return seccion;
      // El sitio público tiene páginas de detalle fuera del nav (perfil docente).
      if (zona === 'publico') return seccion;
    }
    return nav.length ? nav[0].id : '';
  }

  function construirCtx(h) {
    var ses = intentar(function () { return Sesion.actual(); }, null);
    var vista = VISTAS[h.zona] || null;
    return {
      zona: h.zona,
      rol: PANELES[h.zona] ? h.zona : (ses ? ses.rol : null),
      id: ses ? ses.id : null,
      persona: intentar(function () { return Sesion.persona(); }, null),
      seccion: seccionValida(vista, h.zona, h.seccion),
      params: h.params
    };
  }

  function resolver() {
    var destino = destinoValido(location.hash);
    var h = parsearHash(destino || location.hash);
    return { redirigir: destino, ctx: construirCtx(h) };
  }

  /* --------------------------------------------------------------- API de App */

  App.ctx = function () {
    return resolver().ctx;
  };

  // Acepta "#/alumno/tareas", "/alumno/tareas" o "alumno/tareas".
  App.ir = function (ruta) {
    var r = String(ruta == null ? '' : ruta);
    if (r.charAt(0) !== '#') r = '#' + (r.charAt(0) === '/' ? r : '/' + r);
    fijarMenu(false);
    if (location.hash === r) { pintar(false); return; }
    location.hash = r;
  };

  App.refrescar = function () {
    pintar(true);
  };

  /* ----------------------------------------------------------------- pintado */

  function pintar(conservarScroll) {
    var raiz = document.getElementById('raiz');
    if (!raiz) return;
    try {
      pintarInterno(raiz, conservarScroll);
    } catch (e) {
      raiz.innerHTML = pantallaError(e && e.message ? e.message : e);
    }
  }

  function pintarInterno(raiz, conservarScroll) {
    var contenidoPrevio = document.querySelector('.contenido');
    var yContenido = contenidoPrevio ? contenidoPrevio.scrollTop : 0;
    var yVentana = window.pageYOffset || document.documentElement.scrollTop || 0;

    var r = resolver();
    if (r.redirigir && location.hash !== r.redirigir) {
      location.hash = r.redirigir;   // el evento hashchange vuelve a pintar
      return;
    }

    var ctx = r.ctx;
    if (!PANELES[ctx.zona]) menuAbierto = false;

    raiz.innerHTML = dibujar(ctx);
    ponerTitulo(ctx);

    if (conservarScroll) {
      var contenido = document.querySelector('.contenido');
      if (contenido) contenido.scrollTop = yContenido;
      window.scrollTo(0, yVentana);
    } else {
      window.scrollTo(0, 0);
    }

    var vista = VISTAS[ctx.zona];
    if (vista && esFn(vista.montado)) {
      try {
        vista.montado(ctx);
      } catch (e) {
        intentar(function () { return U.toast('No se pudo terminar de cargar la sección', 'crit'); }, null);
      }
    }
  }

  function dibujar(ctx) {
    if (ctx.zona === 'acceso') return pantallaAcceso();
    var vista = VISTAS[ctx.zona];
    if (!vista) return pantallaError('No hay una vista registrada para «' + ctx.zona + '».');
    if (ctx.zona === 'publico') return vista.render(ctx);
    return cascaron(ctx, vista);
  }

  function ponerTitulo(ctx) {
    var extra = '';
    if (ctx.zona === 'acceso') {
      extra = 'Acceso a la demostración';
    } else {
      var vista = VISTAS[ctx.zona];
      var item = vista ? itemPorId(navDe(vista), ctx.seccion) : null;
      extra = (item && item.texto) ? item.texto : (vista && vista.titulo ? vista.titulo : '');
    }
    document.title = DB.escuela.nombre + ((extra && extra !== DB.escuela.nombre) ? ' · ' + extra : '');
  }

  /* ------------------------------------------------------- cascarón con sesión */

  function cascaron(ctx, vista) {
    var nav = navDe(vista);
    var activo = itemPorId(nav, ctx.seccion) || nav[0] || null;
    var cuerpo = vista.render(ctx);
    return '' +
      '<div class="shell">' +
        riel(ctx, vista, nav) +
        '<div class="principal">' +
          topbar(ctx, vista, activo) +
          '<main class="contenido"><div class="contenedor">' + cuerpo + '</div></main>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="velo' + (menuAbierto ? '' : ' oculto') + '" id="velo"' +
        acc('app:cerrarMenu') + ' aria-label="Cerrar el menú"></button>';
  }

  function riel(ctx, vista, nav) {
    var escuela = DB.escuela;
    var conteos = conteosNav(ctx, nav);

    var items = nav.map(function (item) {
      var esActivo = item.id === ctx.seccion;
      var n = conteos[item.id] || 0;
      return '<button type="button" class="riel-nav-item"' +
          acc('app:ir', { ruta: '#/' + ctx.zona + '/' + item.id }) +
          (esActivo ? ' aria-current="page"' : '') + '>' +
          U.icono(item.icono || 'punto', 18) +
          '<span class="truncar">' + U.esc(item.texto || item.id) + '</span>' +
          (n > 0 ? '<span class="conteo">' + n + '</span>' : '') +
        '</button>';
    }).join('');

    return '<aside class="riel' + (menuAbierto ? ' abierto' : '') + '" id="riel">' +
        '<div class="riel-marca">' +
          '<button type="button" class="fila crece"' + acc('app:ir', { ruta: '#/publico' }) +
            ' style="border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer;text-align:left"' +
            ' title="Ver el sitio público">' +
            '<span class="sello">' + U.esc(escuela.sello) + '</span>' +
            '<span class="crece truncar">' +
              '<span class="nombre truncar" style="display:block">' + U.esc(escuela.nombre) + '</span>' +
              '<span class="ciclo" style="display:block">Ciclo ' + U.esc(escuela.ciclo) + '</span>' +
            '</span>' +
          '</button>' +
        '</div>' +
        '<nav class="riel-nav" aria-label="Secciones">' +
          '<span class="etiqueta">' + U.esc(vista.titulo || 'Panel') + '</span>' +
          items +
        '</nav>' +
        '<div class="riel-pie">' +
          '<div class="riel-persona">' +
            (ctx.persona ? U.avatar(ctx.persona, 'sm') : '') +
            '<div class="crece truncar">' +
              '<div class="nom truncar">' + U.esc(ctx.persona ? ctx.persona.nombre : '') + '</div>' +
              '<div class="rol truncar">' + U.esc(rolLegible(ctx)) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="fila gap-1 mt-1">' +
            '<button type="button" class="btn btn-fantasma btn-sm crece"' + acc('app:tema') +
              ' title="Cambiar entre tema claro y oscuro">' +
              U.icono(iconoTema(), 15) + '<span>Tema</span>' +
            '</button>' +
            '<button type="button" class="btn btn-fantasma btn-sm"' + acc('app:salir') + '>' +
              U.icono('salir', 15) + '<span>Salir</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</aside>';
  }

  function topbar(ctx, vista, activo) {
    var titulo = (activo && activo.texto) ? activo.texto : (vista.titulo || DB.escuela.nombre);
    var sub;
    if (activo && activo.sub) sub = activo.sub;
    else if (vista.titulo && vista.titulo !== titulo) sub = vista.titulo;
    else sub = DB.escuela.nombre + ' · ciclo ' + DB.escuela.ciclo;

    return '<header class="topbar">' +
        '<button type="button" class="btn btn-fantasma btn-icono btn-menu"' + acc('app:menu') +
          ' aria-label="Abrir el menú">' + U.icono('menu', 18) + '</button>' +
        '<div class="crece">' +
          '<h1 class="truncar">' + U.esc(titulo) + '</h1>' +
          '<div class="sub truncar">' + U.esc(sub) + '</div>' +
        '</div>' +
        '<button type="button" class="btn btn-fantasma btn-sm"' + acc('app:ir', { ruta: '#/publico' }) + '>' +
          U.icono('casa', 15) + '<span class="nowrap">Sitio público</span>' +
        '</button>' +
        (ctx.persona ? U.avatar(ctx.persona, 'sm') : '') +
      '</header>';
  }

  function rolLegible(ctx) {
    if (ctx.zona === 'direccion' && ctx.persona && ctx.persona.cargo) return ctx.persona.cargo;
    return ROL_LEGIBLE[ctx.rol] || '';
  }

  // Conteos vivos junto a la entrada de nav que corresponde en cada panel.
  function conteosNav(ctx, nav) {
    var mapa = {};
    nav.forEach(function (item) {
      if (typeof item.conteo === 'number' && item.conteo > 0) mapa[item.id] = item.conteo;
    });

    var destino = null;
    var n = 0;
    if (ctx.zona === 'alumno') {
      destino = idQueCoincide(nav, /tarea|entrega|pendien/i);
      n = intentar(function () { return contarPorEntregar(ctx.id); }, 0);
    } else if (ctx.zona === 'profesor') {
      destino = idQueCoincide(nav, /rese|reseñ|opini|valorac/i);
      n = intentar(function () { return (Q.resenasDeProfesor(ctx.id, 'pendiente') || []).length; }, 0);
    } else if (ctx.zona === 'direccion') {
      destino = idQueCoincide(nav, /riesg|alerta/i) || idQueCoincide(nav, /alumn/i);
      n = intentar(function () { return (Q.riesgo() || []).length; }, 0);
    }
    // El conteo que la propia vista declaró en su nav manda sobre el calculado aquí.
    if (destino && n > 0 && !Object.prototype.hasOwnProperty.call(mapa, destino)) mapa[destino] = n;
    return mapa;
  }

  function contarPorEntregar(alumnoId) {
    var n = 0;
    (Q.tareasDeAlumno(alumnoId) || []).forEach(function (fila) {
      var e = fila && fila.entrega;
      if (e && (e.estado === 'pendiente' || e.estado === 'atrasada')) n++;
    });
    return n;
  }

  /* -------------------------------------------------------- pantalla de acceso */

  function pantallaAcceso() {
    var escuela = DB.escuela;

    var deDireccion = DB.direccion ? [tarjetaCuenta('direccion', DB.direccion, {
      a: U.esc(DB.direccion.cargo || 'Dirección general'),
      b: U.esc(DB.direccion.email || '')
    })] : [];

    var deProfesores = DB.profesores.map(function (p) {
      return tarjetaCuenta('profesor', p, detalleProfesor(p));
    });

    var deAlumnos = DB.alumnos.map(function (a) {
      return tarjetaCuenta('alumno', a, detalleAlumno(a));
    });

    var total = deDireccion.length + deProfesores.length + deAlumnos.length;

    return '<div class="acceso">' +
        '<div class="acceso-interior">' +
          '<div class="entre mb-3">' +
            '<button type="button" class="btn btn-fantasma btn-sm"' + acc('app:ir', { ruta: '#/publico' }) + '>' +
              U.icono('flecha-izq', 15) + '<span>Volver al sitio</span>' +
            '</button>' +
            '<button type="button" class="btn btn-fantasma btn-sm btn-icono"' + acc('app:tema') +
              ' aria-label="Cambiar entre tema claro y oscuro">' + U.icono(iconoTema(), 16) + '</button>' +
          '</div>' +

          '<div class="fila gap-2 mb-2">' +
            '<span class="sello sello-lg">' + U.esc(escuela.sello) + '</span>' +
            '<div>' +
              '<div class="destacado" style="font-size:1.06rem;font-weight:600">' + U.esc(escuela.nombre) + '</div>' +
              '<div class="silencio">Ciclo ' + U.esc(escuela.ciclo) + ' · Portal escolar</div>' +
            '</div>' +
          '</div>' +

          '<h1 class="acceso-tit">Elige una cuenta para entrar</h1>' +
          '<p class="silencio mb-2">' + total + ' cuentas de ejemplo, listas con su información completa. ' +
            'Puedes cambiar de cuenta cuando quieras desde el botón de salir.</p>' +

          '<div class="aviso-demo mb-3">' + U.icono('info', 17) +
            '<div><strong>Esto es una demostración.</strong> No hay contraseñas: al pulsar una cuenta entras ' +
            'directo. Todos los nombres, calificaciones y pagos son ficticios y viven sólo en este navegador.</div>' +
          '</div>' +

          grupoCuentas('Dirección', deDireccion) +
          grupoCuentas('Profesores', deProfesores) +
          grupoCuentas('Alumnos', deAlumnos) +

          '<div class="separador"></div>' +
          '<div class="fila envuelve gap-1">' +
            '<button type="button" class="btn btn-sm"' + acc('app:reiniciarDemo') + '>' +
              U.icono('alerta', 15) + '<span>Reiniciar los datos de la demostración</span>' +
            '</button>' +
            '<span class="silencio" style="font-size:.8rem">Devuelve todo a su estado original.</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function grupoCuentas(titulo, tarjetas) {
    if (!tarjetas.length) return '';
    return '<div class="seccion">' +
        '<span class="etiqueta">' + U.esc(titulo) + ' · ' + tarjetas.length + '</span>' +
        '<div class="cuentas mt-1">' + tarjetas.join('') + '</div>' +
      '</div>';
  }

  function tarjetaCuenta(rol, persona, detalle) {
    return '<button type="button" class="cuenta"' + acc('app:entrar', { rol: rol, id: persona.id }) + '>' +
        U.avatar(persona, 'md') +
        '<div class="crece">' +
          '<div class="nom truncar">' + U.esc(persona.nombre) + '</div>' +
          '<div class="det truncar">' + detalle.a + '</div>' +
          (detalle.b ? '<div class="det truncar">' + detalle.b + '</div>' : '') +
        '</div>' +
        U.icono('flecha-der', 16) +
      '</button>';
  }

  function detalleProfesor(p) {
    var materias = intentar(function () { return Q.materiasDeProfesor(p.id) || []; }, []);
    var nombres = materias.map(function (m) { return m.nombre; }).join(' · ');
    return {
      a: 'Clave ' + U.esc(p.clave) + ' · ' + materias.length + (materias.length === 1 ? ' materia' : ' materias'),
      b: nombres ? U.esc(nombres) : 'Sin materias asignadas'
    };
  }

  function detalleAlumno(a) {
    var promedio = intentar(function () { return Q.promedioGeneral(a.id); }, null);
    return {
      a: 'Matrícula ' + U.esc(a.matricula) + ' · Promedio ' + U.notaTexto(promedio),
      b: (a.estatus && a.estatus !== 'activo')
        ? U.badge(capitalizar(a.estatus), a.estatus === 'baja' ? 'crit' : 'aviso')
        : ''
    };
  }

  /* -------------------------------------------------------- pantalla de error */

  function pantallaError(mensaje) {
    return '<div class="acceso"><div class="acceso-interior">' +
        '<div class="panel">' +
          '<div class="panel-cab"><div>' +
            '<h3 class="panel-tit">No se pudo dibujar esta sección</h3>' +
            '<p class="panel-sub">La demostración sigue viva. Vuelve al sitio o reinicia los datos para dejarla como nueva.</p>' +
          '</div></div>' +
          '<div class="panel-cuerpo">' +
            '<div class="caja-suave mono" style="font-size:.8rem">' + escSeguro(mensaje) + '</div>' +
            '<div class="fila envuelve gap-1 mt-2">' +
              '<button type="button" class="btn btn-primario" data-accion="app:ir" ' +
                'data-args=\'{"ruta":"#/publico"}\'>Ir al sitio público</button>' +
              '<button type="button" class="btn btn-peligro" data-accion="app:reiniciarDemo">' +
                'Reiniciar la demostración</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div></div>';
  }

  /* --------------------------------------------------------------- menú y tema */

  function fijarMenu(abierto) {
    menuAbierto = !!abierto;
    var elRiel = document.getElementById('riel');
    var elVelo = document.getElementById('velo');
    if (elRiel) {
      if (menuAbierto) elRiel.classList.add('abierto');
      else elRiel.classList.remove('abierto');
    }
    if (elVelo) {
      if (menuAbierto) elVelo.classList.remove('oculto');
      else elVelo.classList.add('oculto');
    }
  }

  function temaActual() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    var oscuro = intentar(function () {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }, false);
    return oscuro ? 'dark' : 'light';
  }

  function iconoTema() {
    return temaActual() === 'dark' ? 'ojo-cerrado' : 'ojo';
  }

  function restaurarTema() {
    var t = intentar(function () { return window.localStorage.getItem(LLAVE_TEMA); }, null);
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  }

  function guardarTema(t) {
    intentar(function () { window.localStorage.setItem(LLAVE_TEMA, t); return true; }, false);
  }

  /* ----------------------------------------------------------------- acciones */

  var GLOBALES = {

    'app:nada': function () { },

    'app:ir': function (args) {
      App.ir(args && args.ruta ? args.ruta : '#/publico');
    },

    'app:menu': function () {
      fijarMenu(!menuAbierto);
    },

    'app:cerrarMenu': function () {
      fijarMenu(false);
    },

    'app:cerrarModal': function () {
      U.cerrarModal();
    },

    'app:entrar': function (args) {
      if (!args || !args.rol || !args.id) return;
      var entro = Sesion.entrar(args.rol, args.id);
      var persona = Sesion.persona();
      if (entro === false || !persona) {
        U.toast('Esa cuenta ya no está disponible', 'crit');
        App.ir('#/acceso');
        return;
      }
      U.toast('Entraste como ' + persona.nombre, 'ok');
      App.ir('#/' + args.rol);
    },

    'app:salir': function () {
      U.confirmar({
        titulo: 'Cerrar la sesión',
        texto: 'Vuelves al sitio público. Los datos de la demostración se conservan tal como están.',
        textoOk: 'Cerrar sesión',
        accion: 'app:salirConfirmado'
      });
    },

    'app:salirConfirmado': function () {
      U.cerrarModal();
      Sesion.salir();
      U.toast('Sesión cerrada');
      App.ir('#/publico');
    },

    'app:reiniciarDemo': function () {
      U.confirmar({
        titulo: 'Reiniciar la demostración',
        texto: 'Se descartan todos los cambios que hiciste y vuelven los datos originales. No se puede deshacer.',
        textoOk: 'Reiniciar todo',
        peligro: true,
        accion: 'app:reiniciarConfirmado'
      });
    },

    'app:reiniciarConfirmado': function () {
      U.cerrarModal();
      Store.reiniciar();
      U.toast('Demostración reiniciada', 'ok');
      App.ir('#/publico');
    },

    'app:tema': function () {
      var siguiente = temaActual() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', siguiente);
      guardarTema(siguiente);
      App.refrescar();   // vuelve a pintar para que el icono coincida con el tema
    }
  };

  function mezclarAcciones(origen) {
    if (!origen || typeof origen !== 'object') return;
    Object.keys(origen).forEach(function (clave) {
      if (esFn(origen[clave])) Acciones[clave] = origen[clave];
    });
  }

  function armarAcciones() {
    [VistaPublica, VistaAlumno, VistaProfesor, VistaDireccion].forEach(function (vista) {
      mezclarAcciones(vista && vista.acciones);
    });
    mezclarAcciones(GLOBALES);   // las globales van al final: el cascarón siempre responde
  }

  function despachar(nombre, args, ev, el) {
    if (!nombre) return;
    if (!Object.prototype.hasOwnProperty.call(Acciones, nombre)) return;
    var manejador = Acciones[nombre];
    if (!esFn(manejador)) return;
    try {
      manejador(args || {}, ev, el);
    } catch (e) {
      intentar(function () { return U.toast('No se pudo completar la acción', 'crit'); }, null);
    }
  }

  /* -------------------------------------------------------- delegación global */

  function alClic(ev) {
    var el = masCercano(ev.target, '[data-accion]');
    if (!el || el.disabled) return;
    if (el.tagName.toLowerCase() === 'a') {
      var href = el.getAttribute('href');
      if (!href || href === '#') ev.preventDefault();
    }
    despachar(el.getAttribute('data-accion'), leerArgs(el), ev, el);
  }

  function alCambio(ev) {
    var el = masCercano(ev.target, '[data-cambio]');
    if (!el) return;
    despachar(el.getAttribute('data-cambio'), leerArgs(el), ev, el);
  }

  function alEntrada(ev) {
    var el = masCercano(ev.target, '[data-entrada]');
    if (!el) return;
    despachar(el.getAttribute('data-entrada'), leerArgs(el), ev, el);
  }

  function alEnvio(ev) {
    var form = masCercano(ev.target, 'form[data-envio]');
    if (!form) return;
    ev.preventDefault();
    var args = leerArgs(form);
    args.datos = datosDeFormulario(form);
    despachar(form.getAttribute('data-envio'), args, ev, form);
  }

  function alTecla(ev) {
    if (ev.key !== 'Enter' || ev.defaultPrevented) return;
    var el = masCercano(ev.target, '[data-accion]');
    if (!el || el.disabled) return;
    var etiqueta = el.tagName.toLowerCase();
    // Botones y enlaces ya disparan clic por su cuenta; los campos tienen su propio Enter.
    if (etiqueta === 'button' || etiqueta === 'a' || etiqueta === 'input' ||
        etiqueta === 'textarea' || etiqueta === 'select') return;
    ev.preventDefault();
    despachar(el.getAttribute('data-accion'), leerArgs(el), ev, el);
  }

  // FormData + las casillas sin marcar como false (FormData las omite).
  function datosDeFormulario(form) {
    var datos = {};
    var fd = new FormData(form);
    fd.forEach(function (valor, clave) {
      if (Object.prototype.hasOwnProperty.call(datos, clave)) {
        if (!Array.isArray(datos[clave])) datos[clave] = [datos[clave]];
        datos[clave].push(valor);
      } else {
        datos[clave] = valor;
      }
    });
    var casillas = form.querySelectorAll('input[type="checkbox"]');
    for (var i = 0; i < casillas.length; i++) {
      var c = casillas[i];
      if (!c.name) continue;
      if (!c.checked) {
        // Sólo cuenta como false si ninguna casilla marcada dejó ya un valor con ese nombre
        // (en un grupo de casillas, la desmarcada no debe borrar a sus compañeras).
        if (!Object.prototype.hasOwnProperty.call(datos, c.name)) datos[c.name] = false;
      } else if (c.value === '' || c.value === 'on') {
        datos[c.name] = true;
      }
    }
    return datos;
  }

  function registrarEventos() {
    document.addEventListener('click', alClic);
    document.addEventListener('change', alCambio);
    document.addEventListener('input', alEntrada);
    document.addEventListener('submit', alEnvio);
    document.addEventListener('keydown', alTecla);
    // Al ensanchar la ventana el riel vuelve a ser fijo: el velo se quedaría tapando el contenido.
    window.addEventListener('resize', function () {
      if (menuAbierto && window.innerWidth > 900) fijarMenu(false);
    });
  }

  /* ----------------------------------------------------------------- arranque */

  function arrancar() {
    Store.cargar();
    restaurarTema();
    VISTAS = {
      publico: VistaPublica,
      alumno: VistaAlumno,
      profesor: VistaProfesor,
      direccion: VistaDireccion
    };
    armarAcciones();
    registrarEventos();
    Store.suscribir(App.refrescar);
    window.addEventListener('hashchange', function () {
      fijarMenu(false);
      pintar(false);
    });
    pintar(false);   // pintar() ya lleva su propio try/catch y pantalla de error
  }

  arrancar();

})();
