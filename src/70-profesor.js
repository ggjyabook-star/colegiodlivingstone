/* ============================================================================
   70-profesor.js — Panel del profesor.
   Declara: const VistaProfesor
   Todo lo que se ve aquí opera sobre datos reales de DB a través de Q y M.
   ========================================================================== */

const VistaProfesor = (function () {

  /* ------------------------------------------------------------ constantes */
  var DIAS_SEM = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  var DIAS_CLASE = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

  var TIPOS_EVAL = [
    { v: 'parcial', t: 'Parcial' },
    { v: 'tarea', t: 'Tareas y ejercicios' },
    { v: 'proyecto', t: 'Proyecto' },
    { v: 'practica', t: 'Práctica' }
  ];
  var TIPOS_TAREA = [
    { v: 'tarea', t: 'Tarea' },
    { v: 'proyecto', t: 'Proyecto' },
    { v: 'lectura', t: 'Lectura' },
    { v: 'practica', t: 'Práctica' }
  ];
  var TIPOS_MATERIAL = [
    { v: 'pdf', t: 'Documento PDF' },
    { v: 'presentacion', t: 'Presentación' },
    { v: 'hoja', t: 'Hoja de trabajo' },
    { v: 'video', t: 'Video' },
    { v: 'liga', t: 'Liga externa' }
  ];
  var ESTADOS_ENTREGA = [
    { v: 'pendiente', t: 'Pendiente' },
    { v: 'entregada', t: 'Entregada' },
    { v: 'revisada', t: 'Revisada' },
    { v: 'atrasada', t: 'Atrasada' }
  ];
  var VARIANTE_ENTREGA = {
    pendiente: 'neutro', entregada: 'info', revisada: 'ok', atrasada: 'crit'
  };
  var ETIQUETA_ENTREGA = {
    pendiente: 'Pendiente', entregada: 'Entregada', revisada: 'Revisada', atrasada: 'Atrasada'
  };
  var CRITERIOS = [
    { k: 'claridad', t: 'Claridad' },
    { k: 'dominio', t: 'Dominio' },
    { k: 'trato', t: 'Trato' },
    { k: 'puntualidad', t: 'Puntualidad' }
  ];

  /* Archivo leído en el modal abierto (foto, CV o material). */
  var archivoTmp = null;

  /* ---------------------------------------------------------- utilidades */
  function esc(v) { return U.esc(v == null ? '' : v); }
  function red1(n) { return Math.round(n * 10) / 10; }
  function pctDe(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }
  function dos(n) { return String(n).length < 2 ? '0' + n : String(n); }
  function isoDe(f) { return f.getFullYear() + '-' + dos(f.getMonth() + 1) + '-' + dos(f.getDate()); }
  function diasTexto(n) { return n + (n === 1 ? ' día' : ' días'); }
  /* Texto relativo de una fecha de entrega contra HOY (Q.diasParaEntrega).
     Va entre paréntesis después de «vence <fecha>», por eso no repite el verbo. */
  function vencimientoTexto(d) {
    if (d === 0) return 'hoy mismo';
    if (d < 0) return 'cerrada hace ' + diasTexto(Math.abs(d));
    return 'en ' + diasTexto(d);
  }

  function ruta(seccion, params) {
    var q = [];
    if (params) {
      Object.keys(params).forEach(function (k) {
        if (params[k] != null && params[k] !== '') {
          q.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k]));
        }
      });
    }
    return '#/profesor/' + seccion + (q.length ? '?' + q.join('&') : '');
  }
  /* Atributos listos para pegar dentro de un <button>. */
  function irA(seccion, params) {
    return ' data-accion="pr:ir" ' + U.attr({ 'data-args': { ruta: ruta(seccion, params) } });
  }
  function args(o) { return ' ' + U.attr({ 'data-args': o }); }

  /* Lee el identificador que manda U.pestanas sin depender de una sola forma. */
  function idDeArgs(a, el) {
    if (typeof a === 'string') return a;
    if (a && typeof a === 'object') {
      if (a.id) return a.id;
      if (a.tab) return a.tab;
      if (a.valor) return a.valor;
    }
    if (el && el.getAttribute) {
      var v = el.getAttribute('data-tab');
      if (v) return v;
    }
    return null;
  }

  /* ---------------------------------------------------- formularios propios */
  /* Campo de formulario con las clases reales de la hoja de estilo. */
  function campo(o) {
    var id = o.id || ('cp-' + (o.nombre || 'x'));
    var at = ' id="' + esc(id) + '"';
    if (o.nombre) at += ' name="' + esc(o.nombre) + '"';
    if (o.req) at += ' required';
    if (o.min != null) at += ' min="' + esc(o.min) + '"';
    if (o.max != null) at += ' max="' + esc(o.max) + '"';
    if (o.paso != null) at += ' step="' + esc(o.paso) + '"';
    if (o.ph) at += ' placeholder="' + esc(o.ph) + '"';
    if (o.acepta) at += ' accept="' + esc(o.acepta) + '"';
    if (o.accion) at += ' data-cambio="' + esc(o.accion) + '"';
    if (o.args) at += args(o.args);

    var ctrl;
    if (o.tipo === 'area') {
      ctrl = '<textarea class="area"' + at + ' rows="' + (o.filas || 4) + '">' + esc(o.valor) + '</textarea>';
    } else if (o.tipo === 'selec') {
      var ops = (o.opciones || []).map(function (op) {
        var sel = String(op.v) === String(o.valor == null ? '' : o.valor) ? ' selected' : '';
        return '<option value="' + esc(op.v) + '"' + sel + '>' + esc(op.t) + '</option>';
      }).join('');
      ctrl = '<select class="selec"' + at + '>' + ops + '</select>';
    } else if (o.tipo === 'file') {
      ctrl = '<input class="entrada" type="file"' + at + '>';
    } else {
      ctrl = '<input class="entrada" type="' + esc(o.tipo || 'text') + '"' + at +
        ' value="' + esc(o.valor) + '">';
    }
    return '<div class="campo"' + (o.col ? ' style="grid-column:span ' + o.col + '"' : '') + '>' +
      '<label class="campo-etiqueta" for="' + esc(id) + '">' + esc(o.etiqueta) + '</label>' +
      ctrl +
      (o.ayuda != null ? '<span class="campo-ayuda"' + (o.ayudaId ? ' id="' + esc(o.ayudaId) + '"' : '') +
        '>' + esc(o.ayuda) + '</span>' : '') +
      '</div>';
  }

  function form(o) {
    var cuerpo = o.rejilla === false ? o.cuerpo : '<div class="form-rejilla">' + o.cuerpo + '</div>';
    var botones = '';
    if (o.cancelar !== false) {
      botones += '<button type="button" class="btn" data-accion="app:cerrarModal">Cancelar</button>';
    }
    botones += '<button type="submit" class="btn btn-primario">' + esc(o.ok || 'Guardar') + '</button>';
    return '<form data-envio="' + esc(o.accion) + '"' + (o.args ? args(o.args) : '') + '>' +
      cuerpo + '<div class="form-acciones">' + botones + '</div></form>';
  }

  /* Paleta: sólo colores que ya viven en los datos. */
  function paleta() {
    var vistos = [];
    (DB.materias || []).forEach(function (m) {
      if (m.color && vistos.indexOf(m.color) < 0) vistos.push(m.color);
    });
    return vistos;
  }
  function selectorColor(actual) {
    var lista = paleta();
    if (actual && lista.indexOf(actual) < 0) lista = [actual].concat(lista);
    var opciones = lista.map(function (c, i) {
      var marcado = (actual ? c === actual : i === 0) ? ' checked' : '';
      return '<label class="chip" style="cursor:pointer;padding-left:.4rem">' +
        '<input type="radio" name="color" value="' + esc(c) + '"' + marcado +
        ' aria-label="Color ' + (i + 1) + '" style="accent-color:' + esc(c) + '">' +
        '<span style="display:inline-block;width:14px;height:14px;border-radius:4px;background:' +
        esc(c) + '"></span></label>';
    }).join('');
    return '<div class="campo" style="grid-column:span 12">' +
      '<span class="campo-etiqueta">Color de la materia</span>' +
      '<div class="fila envuelve gap-1">' + opciones + '</div></div>';
  }

  /* Tres bloques de horario editables. */
  function camposHorario(horario) {
    var h = horario || [];
    var opDias = [{ v: '', t: 'Sin bloque' }].concat(DIAS_CLASE.map(function (d) { return { v: d, t: d }; }));
    var out = '<div class="campo" style="grid-column:span 12">' +
      '<span class="campo-etiqueta">Horario semanal</span>' +
      '<span class="campo-ayuda">Hasta tres bloques. Deja «Sin bloque» los que no uses.</span></div>';
    for (var i = 0; i < 3; i++) {
      var b = h[i] || {};
      out += campo({ tipo: 'selec', nombre: 'dia' + i, etiqueta: 'Día ' + (i + 1), valor: b.dia || '', opciones: opDias, col: 4 });
      out += campo({ tipo: 'time', nombre: 'ini' + i, etiqueta: 'Inicia', valor: b.inicio || '', col: 4 });
      out += campo({ tipo: 'time', nombre: 'fin' + i, etiqueta: 'Termina', valor: b.fin || '', col: 4 });
    }
    return out;
  }
  function leerHorario(datos) {
    var out = [];
    for (var i = 0; i < 3; i++) {
      var d = datos['dia' + i], ini = datos['ini' + i], fin = datos['fin' + i];
      if (d && ini && fin) out.push({ dia: d, inicio: ini, fin: fin });
    }
    return out;
  }

  /* -------------------------------------------------------------- consultas */
  function yo() { return Sesion.persona(); }

  function materiasDe(p, conArchivadas) {
    var lista = (Q.materiasDeProfesor(p.id) || []).slice();
    if (!conArchivadas) lista = lista.filter(function (m) { return m.estatus !== 'archivada'; });
    return lista;
  }
  function idsMaterias(p, conArchivadas) {
    return materiasDe(p, conArchivadas).map(function (m) { return m.id; });
  }
  function alumnosDe(p) {
    var vistos = {}, out = [];
    materiasDe(p, false).forEach(function (m) {
      (Q.alumnosDeMateria(m.id) || []).forEach(function (a) {
        if (!vistos[a.id]) { vistos[a.id] = true; out.push(a); }
      });
    });
    out.sort(function (a, b) { return a.nombre < b.nombre ? -1 : 1; });
    return out;
  }
  function materiasDeAlumnoCon(p, alumnoId) {
    return materiasDe(p, false).filter(function (m) { return inscrito(alumnoId, m.id); });
  }
  function inscrito(alumnoId, materiaId) {
    return (DB.inscripciones || []).some(function (i) {
      return i.alumnoId === alumnoId && i.materiaId === materiaId;
    });
  }
  function tareasDe(p) {
    var ids = idsMaterias(p, true);
    return (DB.tareas || []).filter(function (t) { return ids.indexOf(t.materiaId) >= 0; })
      .slice().sort(function (a, b) { return a.vence < b.vence ? -1 : 1; });
  }
  function entregasDe(tareaId) {
    return (DB.entregas || []).filter(function (e) { return e.tareaId === tareaId; });
  }
  function conteoEntregas(tareaId) {
    var c = { pendiente: 0, entregada: 0, revisada: 0, atrasada: 0, total: 0 };
    entregasDe(tareaId).forEach(function (e) {
      if (c[e.estado] != null) c[e.estado]++;
      c.total++;
    });
    return c;
  }
  function entrega(tareaId, alumnoId) {
    var r = (DB.entregas || []).filter(function (e) {
      return e.tareaId === tareaId && e.alumnoId === alumnoId;
    });
    return r.length ? r[0] : null;
  }
  function materialesDe(p) {
    var ids = idsMaterias(p, true);
    return (DB.materiales || []).filter(function (mt) {
      return ids.indexOf(mt.materiaId) >= 0 && (!mt.autorId || mt.autorId === p.id);
    }).slice().sort(function (a, b) { return a.subidoEl < b.subidoEl ? 1 : -1; });
  }
  function avisosMios(p) {
    return (DB.avisos || []).filter(function (a) { return a.autorId === p.id; })
      .slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  }
  function avisosDireccion() {
    return (DB.avisos || []).filter(function (a) { return a.autorRol === 'direccion'; })
      .slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  }
  function resenasDe(p) {
    return (Q.resenasDeProfesor(p.id) || []).slice()
      .sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  }
  function porEstado(lista, estado) {
    return lista.filter(function (r) { return r.estado === estado; });
  }
  function sumaPesos(materiaId) {
    var s = 0;
    (Q.evaluacionesDeMateria(materiaId) || []).forEach(function (e) { s += num(e.peso, 0); });
    return Math.round(s * 1000) / 1000;
  }
  function asistenciaPct(alumnoId, materiaId) {
    var a = Q.asistencia(alumnoId, materiaId);
    if (!a || !a.totales) return null;
    return pctDe(a.presentes, a.totales);
  }
  function promedioEvaluacion(evId, alumnos) {
    var s = 0, n = 0;
    alumnos.forEach(function (a) {
      var c = Q.nota(a.id, evId);
      if (c && c.valor != null) { s += num(c.valor, 0); n++; }
    });
    return n ? red1(s / n) : null;
  }
  function promedioDeGrupos(p) {
    var vals = [];
    materiasDe(p, false).forEach(function (m) {
      var v = Q.promedioGrupo(m.id);
      if (v != null) vals.push(v);
    });
    if (!vals.length) return null;
    var s = 0;
    vals.forEach(function (v) { s += v; });
    return red1(s / vals.length);
  }

  /* Próximas sesiones a partir de HOY, según el horario de sus materias. */
  function proximasSesiones(p, cuantas) {
    var lista = [], materias = materiasDe(p, false);
    var hoyIdx = HOY.getDay();
    var ahora = dos(HOY.getHours()) + ':' + dos(HOY.getMinutes());
    for (var off = 0; off < 7 && lista.length < cuantas; off++) {
      var nombreDia = DIAS_SEM[(hoyIdx + off) % 7];
      var bloques = [];
      materias.forEach(function (m) {
        (m.horario || []).forEach(function (b) {
          if (b.dia !== nombreDia) return;
          if (off === 0 && b.inicio <= ahora) return;
          bloques.push({ materia: m, bloque: b });
        });
      });
      bloques.sort(function (a, b) { return a.bloque.inicio < b.bloque.inicio ? -1 : 1; });
      for (var k = 0; k < bloques.length && lista.length < cuantas; k++) {
        lista.push({
          materia: bloques[k].materia,
          bloque: bloques[k].bloque,
          cuando: off === 0 ? 'Hoy' : (off === 1 ? 'Mañana' : nombreDia)
        });
      }
    }
    return lista;
  }

  /* Alumnos suyos con promedio bajo 7 o asistencia bajo 80 %. */
  function requierenAtencion(p) {
    var out = [];
    materiasDe(p, false).forEach(function (m) {
      (Q.alumnosDeMateria(m.id) || []).forEach(function (a) {
        var prom = Q.promedioMateria(a.id, m.id);
        var asis = asistenciaPct(a.id, m.id);
        if (prom != null && prom < 7) {
          out.push({ alumno: a, materia: m, tipo: 'promedio', valor: prom, orden: prom });
        }
        if (asis != null && asis < 80) {
          out.push({ alumno: a, materia: m, tipo: 'asistencia', valor: asis, orden: asis / 10 });
        }
      });
    });
    out.sort(function (a, b) { return a.orden - b.orden; });
    return out;
  }

  /* ------------------------------------------------------------- fragmentos */
  function panelPlano(o) {
    return '<div class="panel' + (o.clase ? ' ' + o.clase : '') + '">' +
      '<div class="panel-cab"><div><p class="panel-tit">' + esc(o.titulo) + '</p>' +
      (o.sub ? '<p class="panel-sub">' + esc(o.sub) + '</p>' : '') + '</div>' +
      (o.acciones ? '<div class="panel-acc">' + o.acciones + '</div>' : '') +
      '</div><div class="panel-cuerpo sin-relleno">' + o.cuerpo + '</div>' +
      (o.pie ? '<div class="panel-pie">' + o.pie + '</div>' : '') + '</div>';
  }
  function cabecera(titulo, sub, acciones) {
    return '<div class="seccion-cab"><div><h2>' + esc(titulo) + '</h2>' +
      (sub ? '<p class="sub">' + esc(sub) + '</p>' : '') + '</div>' +
      (acciones ? '<div class="fila envuelve gap-1">' + acciones + '</div>' : '') + '</div>';
  }
  function nota(v) {
    return v == null ? '<span class="silencio">—</span>'
      : '<span class="' + U.claseNota(v) + '">' + U.notaTexto(v) + '</span>';
  }
  function puntoColor(c) {
    return '<span style="display:inline-block;width:9px;height:9px;border-radius:3px;flex:none;background:' +
      esc(c) + '"></span>';
  }
  function horarioTexto(m) {
    if (!m.horario || !m.horario.length) return 'Sin horario asignado';
    return m.horario.map(function (b) { return b.dia + ' ' + b.inicio + '–' + b.fin; }).join(' · ');
  }
  function opcionesMaterias(p) {
    return materiasDe(p, false).map(function (m) {
      return { v: m.id, t: m.codigo + ' · ' + m.nombre };
    });
  }
  function barraCriterio(etiqueta, valor, sobre) {
    var v = valor == null ? 0 : valor;
    return '<div class="barra-criterio"><span>' + esc(etiqueta) + '</span>' +
      U.progreso(pctDe(v, sobre)) +
      '<span class="n">' + (valor == null ? '—' : red1(v).toFixed(1)) + '</span></div>';
  }

  /* ========================================================= SECCIÓN RESUMEN */
  function verResumen(p) {
    var materias = materiasDe(p, false);
    var alumnos = alumnosDe(p);
    var prom = promedioDeGrupos(p);
    var todas = resenasDe(p);
    var pendientes = porEstado(todas, 'pendiente');
    var rating = Q.ratingProfesor(p.id, false) ||
      { promedio: 0, total: 0, distribucion: [0, 0, 0, 0, 0], criterios: {} };

    var cupoTotal = 0;
    materias.forEach(function (m) { cupoTotal += num(m.cupo, 0); });

    var kpis = '<div class="rejilla mb-2">' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Materias que imparto', valor: materias.length, icono: 'libro',
        sub: esc(materias.map(function (m) { return m.codigo; }).join(' · ')),
        pie: 'Ciclo ' + esc(DB.escuela.ciclo)
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Alumnos distintos', valor: alumnos.length, icono: 'usuarios',
        sub: 'En todos mis grupos', pie: 'Cupo total autorizado: ' + cupoTotal
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Promedio de mis grupos', valor: prom == null ? '—' : U.notaTexto(prom),
        icono: 'grafica',
        variante: prom == null ? '' : (prom >= 8 ? 'ok' : (prom >= 7 ? 'aviso' : 'crit')),
        sub: 'Escala 0 a 10, mínima aprobatoria 6.0',
        pie: 'Sólo evaluaciones ya calificadas'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Mi valoración docente',
        valor: rating.total ? red1(rating.promedio).toFixed(1) : '—',
        icono: 'estrella', variante: 'marca',
        sub: rating.total + (rating.total === 1 ? ' reseña en total' : ' reseñas en total'),
        pie: pendientes.length
          ? pendientes.length + (pendientes.length === 1 ? ' espera tu autorización' : ' esperan tu autorización')
          : 'Nada por autorizar'
      }) + '</div></div>';

    var series = materias.map(function (m) {
      var v = Q.promedioGrupo(m.id);
      return { etiqueta: m.codigo, valor: v == null ? 0 : v };
    });
    var panelProm = U.panel({
      titulo: 'Promedio por grupo',
      sub: 'Promedio ponderado de cada materia que imparto',
      acciones: '<button type="button" class="btn btn-sm"' + irA('calificaciones') + '>Capturar calificaciones</button>',
      cuerpo: series.length ? U.columnas({ series: series, max: 10, alto: 190 })
        : U.vacio({ icono: 'libro', titulo: 'Sin materias', texto: 'Da de alta una materia para ver su promedio.' })
    });

    var ses = proximasSesiones(p, 6);
    var panelSes = panelPlano({
      titulo: 'Mis próximas sesiones',
      sub: 'A partir del ' + U.fecha(isoDe(HOY), 'corta'),
      cuerpo: ses.length ? '<ul class="lista">' + ses.map(function (s) {
        return '<li class="lista-item">' + puntoColor(s.materia.color) +
          '<div class="crece"><div class="t truncar">' + esc(s.materia.nombre) + '</div>' +
          '<div class="d">' + esc(s.cuando) + ' · ' + esc(s.bloque.inicio) + '–' + esc(s.bloque.fin) +
          ' · ' + esc(s.materia.aula) + '</div></div>' +
          '<button type="button" class="btn btn-sm"' + irA('materias', { id: s.materia.id }) + '>Abrir</button></li>';
      }).join('') + '</ul>'
        : U.vacio({ icono: 'calendario', titulo: 'Sin sesiones próximas', texto: 'No hay bloques de horario en los siguientes siete días.' })
    });

    var aten = requierenAtencion(p).slice(0, 8);
    var panelAten = panelPlano({
      titulo: 'Requieren atención',
      sub: 'Promedio bajo 7.0 o asistencia bajo 80 %',
      cuerpo: aten.length ? '<ul class="lista">' + aten.map(function (x) {
        var critico = x.tipo === 'promedio' ? x.valor < 6 : x.valor < 70;
        return '<li class="lista-item">' + U.avatar(x.alumno, 'sm') +
          '<div class="crece"><div class="t truncar">' + esc(x.alumno.nombre) + '</div>' +
          '<div class="d truncar">' + esc(x.materia.nombre) + ' · ' +
          (x.tipo === 'promedio' ? 'promedio de la materia' : 'asistencia acumulada') + '</div></div>' +
          U.badge(x.tipo === 'promedio' ? U.notaTexto(x.valor) : x.valor + ' %', critico ? 'crit' : 'aviso') +
          '<button type="button" class="btn btn-sm btn-icono" aria-label="Ver expediente de ' + esc(x.alumno.nombre) +
          '" data-accion="pr:expediente"' + args({ alumnoId: x.alumno.id }) + '>' + U.icono('ojo', 16) + '</button></li>';
      }).join('') + '</ul>'
        : U.vacio({ icono: 'cheque', titulo: 'Todo en orden', texto: 'Ningún alumno tuyo está por debajo del umbral de promedio ni de asistencia.' })
    });

    var porRevisar = tareasDe(p).map(function (t) {
      var c = conteoEntregas(t.id);
      return { tarea: t, materia: Q.materia(t.materiaId), pend: c.entregada + c.atrasada, conteo: c };
    }).filter(function (x) { return x.pend > 0; })
      .sort(function (a, b) { return b.pend - a.pend; }).slice(0, 8);

    var panelRev = panelPlano({
      titulo: 'Entregas por revisar',
      sub: 'Trabajos entregados o atrasados que siguen sin revisar',
      cuerpo: porRevisar.length ? '<ul class="lista">' + porRevisar.map(function (x) {
        return '<li class="lista-item">' + U.icono('portapapeles', 18) +
          '<div class="crece"><div class="t truncar">' + esc(x.tarea.titulo) + '</div>' +
          '<div class="d truncar">' + esc(x.materia ? x.materia.nombre : '') +
          ' · vence ' + U.fecha(x.tarea.vence, 'corta') + '</div></div>' +
          U.badge(x.conteo.entregada + ' entregadas', 'info') +
          U.badge(x.conteo.atrasada + ' atrasadas', x.conteo.atrasada ? 'crit' : 'neutro') +
          '<button type="button" class="btn btn-sm"' + irA('tareas', { id: x.tarea.id }) + '>Revisar</button></li>';
      }).join('') + '</ul>'
        : U.vacio({ icono: 'cheque', titulo: 'Nada por revisar', texto: 'No hay entregas pendientes de revisión en tus materias.' })
    });

    var panelRes = panelPlano({
      titulo: 'Reseñas pendientes de autorizar',
      sub: 'Ninguna aparece en el perfil público hasta que tú la autorices',
      acciones: '<button type="button" class="btn btn-sm"' + irA('resenas', { tab: 'pendientes' }) + '>Ir a moderación</button>',
      cuerpo: pendientes.length ? '<ul class="lista">' + pendientes.slice(0, 4).map(function (r) {
        var m = Q.materia(r.materiaId);
        var al = r.anonima ? null : Q.alumno(r.alumnoId);
        var quien = r.anonima ? 'Anónimo' : (al ? al.nombre : 'Anónimo');
        return '<li class="lista-item"><div class="crece">' +
          '<div class="fila envuelve gap-1">' + U.estrellas(r.estrellas) +
          '<span class="d">' + esc(quien) + ' · ' + esc(m ? m.nombre : '') + ' · ' +
          U.fecha(r.fecha, 'corta') + '</span></div>' +
          '<div class="d truncar" style="color:var(--tinta-2)">' + esc(r.comentario) + '</div></div>' +
          '<button type="button" class="btn btn-sm btn-primario" data-accion="pr:moderar"' +
          args({ id: r.id, estado: 'publica' }) + '>Autorizar</button>' +
          '<button type="button" class="btn btn-sm" data-accion="pr:moderar"' +
          args({ id: r.id, estado: 'oculta' }) + '>Ocultar</button></li>';
      }).join('') + '</ul>'
        : U.vacio({ icono: 'estrella', titulo: 'Sin pendientes', texto: 'Todas tus reseñas ya fueron revisadas.' })
    });

    return '<div class="contenedor">' +
      cabecera('Panel de ' + p.nombre,
        'Ciclo ' + DB.escuela.ciclo + ' · ' + U.fecha(isoDe(HOY), 'larga'),
        '<button type="button" class="btn btn-primario"' + irA('calificaciones') + '>' +
        U.icono('grafica', 16) + ' Capturar calificaciones</button>') +
      kpis +
      '<div class="rejilla">' +
      '<div class="col-8">' + panelProm + '</div>' +
      '<div class="col-4">' + panelSes + '</div>' +
      '<div class="col-6">' + panelAten + '</div>' +
      '<div class="col-6">' + panelRev + '</div>' +
      '<div class="col-12">' + panelRes + '</div>' +
      '</div></div>';
  }
  /* ======================================================== SECCIÓN MATERIAS */
  function tarjetaMateria(m) {
    var inscritos = (Q.alumnosDeMateria(m.id) || []).length;
    var evs = Q.evaluacionesDeMateria(m.id) || [];
    var prom = Q.promedioGrupo(m.id);
    var usoPct = pctDe(inscritos, num(m.cupo, 0));
    var archivada = m.estatus === 'archivada';

    var acciones = '<button type="button" class="btn btn-sm btn-icono" aria-label="Editar ' + esc(m.nombre) + '"' +
      ' data-accion="pr:formMateria"' + args({ id: m.id }) + '>' + U.icono('lapiz', 15) + '</button>';
    if (!archivada) {
      acciones += '<button type="button" class="btn btn-sm btn-icono" aria-label="Archivar ' + esc(m.nombre) + '"' +
        ' data-accion="pr:pedirArchivar"' + args({ id: m.id }) + '>' + U.icono('archivo', 15) + '</button>';
    }

    var cuerpo =
      '<div class="fila envuelve gap-1 mb-2">' +
      U.chip(m.aula, 'neutro') + U.chip(m.creditos + ' créditos') +
      (archivada ? U.badge('Archivada', 'neutro') : U.badge('Activa', 'ok')) + '</div>' +
      '<p class="d silencio" style="font-size:.82rem;margin-bottom:.7rem">' + esc(horarioTexto(m)) + '</p>' +
      '<div class="entre mb-1"><span class="etiqueta">Cupo usado</span>' +
      '<span class="mono">' + inscritos + ' / ' + esc(m.cupo) + '</span></div>' +
      U.progreso(usoPct, usoPct >= 100 ? 'crit' : (usoPct >= 85 ? 'aviso' : 'ok')) +
      '<div class="separador"></div>' +
      '<div class="datos-rejilla">' +
      '<div class="dato"><span class="e">Promedio</span><span class="v">' + nota(prom) + '</span></div>' +
      '<div class="dato"><span class="e">Evaluaciones</span><span class="v mono">' + evs.length + '</span></div>' +
      '<div class="dato"><span class="e">Suma de pesos</span><span class="v mono">' +
      sumaPesos(m.id).toFixed(2) + '</span></div></div>';

    return '<div class="panel" style="height:100%">' +
      '<div class="panel-cab"><div class="fila gap-1">' + puntoColor(m.color) +
      '<div><p class="panel-tit">' + esc(m.nombre) + '</p>' +
      '<p class="panel-sub mono">' + esc(m.codigo) + '</p></div></div>' +
      '<div class="panel-acc">' + acciones + '</div></div>' +
      '<div class="panel-cuerpo">' + cuerpo + '</div>' +
      '<div class="panel-pie"><div class="fila envuelve gap-1">' +
      '<button type="button" class="btn btn-sm btn-suave"' + irA('materias', { id: m.id }) + '>Abrir grupo</button>' +
      '<button type="button" class="btn btn-sm"' + irA('calificaciones', { id: m.id }) + '>Calificaciones</button>' +
      '</div></div></div>';
  }

  function verMaterias(p, ctx) {
    var pm = ctx.params || {};
    if (pm.id && Q.materia(pm.id)) return verMateriaDetalle(p, ctx, Q.materia(pm.id));

    var lista = materiasDe(p, true);
    var activas = lista.filter(function (m) { return m.estatus !== 'archivada'; });
    var cuerpo = lista.length
      ? '<div class="rejilla">' + lista.map(function (m) {
        return '<div class="col-4">' + tarjetaMateria(m) + '</div>';
      }).join('') + '</div>'
      : U.vacio({
        icono: 'libro', titulo: 'Todavía no tienes materias',
        texto: 'Crea la primera materia para empezar a inscribir alumnos y capturar calificaciones.'
      });

    return '<div class="contenedor">' +
      cabecera('Mis materias',
        activas.length + (activas.length === 1 ? ' materia activa' : ' materias activas') +
        ' · ' + alumnosDe(p).length + ' alumnos distintos',
        '<button type="button" class="btn btn-primario" data-accion="pr:formMateria">' +
        U.icono('mas', 16) + ' Nueva materia</button>') +
      cuerpo + '</div>';
  }

  function tabAlumnosMateria(p, m) {
    var als = Q.alumnosDeMateria(m.id) || [];
    var filas = als.map(function (a) {
      var prom = Q.promedioMateria(a.id, m.id);
      var as = Q.asistencia(a.id, m.id) || { presentes: 0, totales: 0 };
      var apct = asistenciaPct(a.id, m.id);
      var av = Q.avanceMateria(a.id, m.id) || { calificadas: 0, total: 0 };
      return '<tr>' +
        '<td><div class="fila gap-1">' + U.avatar(a, 'sm') +
        '<div class="crece"><div class="truncar">' + esc(a.nombre) + '</div>' +
        '<div class="d silencio mono" style="font-size:.75rem">' + esc(a.matricula) + '</div></div></div></td>' +
        '<td class="num">' + nota(prom) + '</td>' +
        '<td class="num mono">' + av.calificadas + '/' + av.total + '</td>' +
        '<td class="num mono">' + (apct == null ? '—' : apct + ' %') + '</td>' +
        '<td class="num mono silencio">' + as.presentes + '/' + as.totales + '</td>' +
        '<td class="txt-d"><button type="button" class="btn btn-sm" data-accion="pr:expediente"' +
        args({ alumnoId: a.id, materiaId: m.id }) + '>Expediente</button> ' +
        '<button type="button" class="btn btn-sm btn-peligro" data-accion="pr:pedirDesinscribir"' +
        args({ alumnoId: a.id, materiaId: m.id }) + '>Dar de baja</button></td></tr>';
    }).join('');

    var tabla = als.length
      ? '<div class="tabla-envoltura"><table class="tabla"><thead><tr>' +
      '<th>Alumno</th><th class="num">Promedio</th><th class="num">Avance</th>' +
      '<th class="num">Asistencia</th><th class="num">Sesiones</th><th></th></tr></thead>' +
      '<tbody>' + filas + '</tbody></table></div>'
      : U.vacio({ icono: 'usuarios', titulo: 'Sin alumnos inscritos', texto: 'Inscribe alumnos para poder capturar calificaciones y asistencia.' });

    return panelPlano({
      titulo: 'Alumnos inscritos',
      sub: als.length + ' de ' + m.cupo + ' lugares ocupados',
      acciones: '<button type="button" class="btn btn-sm btn-primario" data-accion="pr:formInscribir"' +
        args({ materiaId: m.id }) + '>' + U.icono('mas', 15) + ' Inscribir alumno</button>',
      cuerpo: tabla
    });
  }

  function tabEvaluacionesMateria(p, m) {
    var evs = Q.evaluacionesDeMateria(m.id) || [];
    var als = Q.alumnosDeMateria(m.id) || [];
    var suma = sumaPesos(m.id);
    var filas = evs.map(function (e) {
      var calificadas = 0;
      als.forEach(function (a) { var c = Q.nota(a.id, e.id); if (c && c.valor != null) calificadas++; });
      var tipo = TIPOS_EVAL.filter(function (t) { return t.v === e.tipo; })[0];
      return '<tr><td>' + esc(e.nombre) + '</td>' +
        '<td>' + U.badge(tipo ? tipo.t : e.tipo, 'info') + '</td>' +
        '<td class="num mono">' + num(e.peso, 0).toFixed(2) + '</td>' +
        '<td class="mono">' + U.fecha(e.fecha, 'corta') + '</td>' +
        '<td class="num mono">' + calificadas + '/' + als.length + '</td>' +
        '<td class="num">' + nota(promedioEvaluacion(e.id, als)) + '</td>' +
        '<td class="txt-d"><button type="button" class="btn btn-sm btn-icono" aria-label="Editar ' + esc(e.nombre) + '"' +
        ' data-accion="pr:formEvaluacion"' + args({ materiaId: m.id, id: e.id }) + '>' + U.icono('lapiz', 15) + '</button> ' +
        '<button type="button" class="btn btn-sm btn-icono btn-peligro" aria-label="Eliminar ' + esc(e.nombre) + '"' +
        ' data-accion="pr:pedirEliminarEval"' + args({ id: e.id }) + '>' + U.icono('basura', 15) + '</button></td></tr>';
    }).join('');

    var aviso = Math.abs(suma - 1) < 0.001
      ? '<span class="badge badge-ok">Suma de pesos 1.00</span>'
      : '<span class="badge badge-aviso">Suma de pesos ' + suma.toFixed(2) + ' · debe llegar a 1.00</span>';

    return panelPlano({
      titulo: 'Evaluaciones del periodo',
      sub: 'El promedio se calcula con estos pesos, sólo sobre lo ya calificado',
      acciones: aviso + ' <button type="button" class="btn btn-sm btn-primario" data-accion="pr:formEvaluacion"' +
        args({ materiaId: m.id }) + '>' + U.icono('mas', 15) + ' Nueva evaluación</button>',
      cuerpo: evs.length
        ? '<div class="tabla-envoltura"><table class="tabla"><thead><tr>' +
        '<th>Evaluación</th><th>Tipo</th><th class="num">Peso</th><th>Fecha</th>' +
        '<th class="num">Capturadas</th><th class="num">Promedio</th><th></th></tr></thead>' +
        '<tbody>' + filas + '</tbody></table></div>'
        : U.vacio({ icono: 'grafica', titulo: 'Sin evaluaciones', texto: 'Crea las evaluaciones del periodo para poder capturar calificaciones.' })
    });
  }

  function tabHorarioMateria(p, m) {
    var cuerpo = '<div class="horario">' + DIAS_CLASE.map(function (d) {
      var bloques = (m.horario || []).filter(function (b) { return b.dia === d; });
      return '<div class="horario-dia"><span class="etiqueta">' + esc(d) + '</span>' +
        (bloques.length ? bloques.map(function (b) {
          return '<div class="horario-bloque" style="border-left-color:' + esc(m.color) + '">' +
            '<div class="h">' + esc(b.inicio) + '–' + esc(b.fin) + '</div>' +
            '<div class="m">' + esc(m.nombre) + '</div>' +
            '<div class="h">' + esc(m.aula) + '</div></div>';
        }).join('') : '<span class="silencio" style="font-size:.8rem">—</span>') +
        '</div>';
    }).join('') + '</div>';

    var otras = materiasDe(p, false).filter(function (x) { return x.id !== m.id; });
    var choques = [];
    (m.horario || []).forEach(function (b) {
      otras.forEach(function (o) {
        (o.horario || []).forEach(function (ob) {
          if (ob.dia === b.dia && ob.inicio < b.fin && b.inicio < ob.fin) {
            choques.push(o.codigo + ' el ' + b.dia + ' a las ' + ob.inicio);
          }
        });
      });
    });

    return U.panel({
      titulo: 'Horario de la materia',
      sub: 'Aula ' + m.aula + ' · ' + DB.escuela.diasHabiles,
      acciones: '<button type="button" class="btn btn-sm" data-accion="pr:formMateria"' + args({ id: m.id }) +
        '>' + U.icono('lapiz', 15) + ' Editar horario</button>',
      cuerpo: cuerpo + (choques.length
        ? '<div class="caja-suave mt-2 fila gap-1" style="color:var(--aviso)">' + U.icono('alerta', 16) +
        '<span>Se empalma con ' + esc(choques.join(', ')) + '.</span></div>'
        : '<p class="campo-ayuda mt-2">Sin empalmes con tus otras materias.</p>')
    });
  }

  function verMateriaDetalle(p, ctx, m) {
    if (m.profesorId !== p.id) {
      return '<div class="contenedor">' + U.vacio({
        icono: 'candado', titulo: 'Materia de otra persona',
        texto: 'Sólo puedes administrar las materias que tú impartes.'
      }) + '</div>';
    }
    var pm = ctx.params || {};
    var tab = pm.tab || 'alumnos';
    var als = Q.alumnosDeMateria(m.id) || [];
    var evs = Q.evaluacionesDeMateria(m.id) || [];

    var pestanas = U.pestanas([
      { id: 'alumnos', texto: 'Alumnos', conteo: als.length },
      { id: 'evaluaciones', texto: 'Evaluaciones', conteo: evs.length },
      { id: 'horario', texto: 'Horario', conteo: (m.horario || []).length }
    ], tab, 'pr:tabMateria');

    var cuerpo = tab === 'evaluaciones' ? tabEvaluacionesMateria(p, m)
      : (tab === 'horario' ? tabHorarioMateria(p, m) : tabAlumnosMateria(p, m));

    var resumen = '<div class="rejilla mb-2">' +
      '<div class="col-3">' + U.kpi({ etiqueta: 'Inscritos', valor: als.length, sub: 'Cupo ' + esc(m.cupo), icono: 'usuarios' }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Promedio del grupo', valor: U.notaTexto(Q.promedioGrupo(m.id)),
        variante: (Q.promedioGrupo(m.id) || 0) >= 8 ? 'ok' : 'aviso', icono: 'grafica', sub: 'Ponderado por pesos'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({ etiqueta: 'Evaluaciones', valor: evs.length, sub: 'Suma de pesos ' + sumaPesos(m.id).toFixed(2), icono: 'cheque' }) + '</div>' +
      '<div class="col-3">' + U.kpi({ etiqueta: 'Créditos', valor: m.creditos, sub: 'Aula ' + esc(m.aula), icono: 'birrete' }) + '</div>' +
      '</div>';

    return '<div class="contenedor">' +
      U.migas([{ texto: 'Mis materias', ruta: ruta('materias') }, { texto: m.nombre }]) +
      cabecera(m.nombre, m.codigo + ' · ' + horarioTexto(m),
        '<button type="button" class="btn"' + irA('calificaciones', { id: m.id }) + '>' + U.icono('grafica', 16) + ' Calificaciones</button>' +
        '<button type="button" class="btn btn-suave" data-accion="pr:formMateria"' + args({ id: m.id }) + '>' +
        U.icono('lapiz', 16) + ' Editar materia</button>') +
      '<p class="mb-2" style="color:var(--tinta-2);max-width:70ch">' + esc(m.descripcion) + '</p>' +
      resumen + pestanas + cuerpo + '</div>';
  }
  /* =================================================== SECCIÓN CALIFICACIONES */
  function verCalificaciones(p, ctx) {
    var pm = ctx.params || {};
    var materias = materiasDe(p, false);
    if (!materias.length) {
      return '<div class="contenedor">' + cabecera('Captura de calificaciones', 'Sin materias activas') +
        U.vacio({
          icono: 'grafica', titulo: 'Todavía no hay nada que capturar',
          texto: 'Crea una materia y sus evaluaciones para empezar la captura.'
        }) +
        '<div class="centro"><button type="button" class="btn btn-primario"' + irA('materias') +
        '>Ir a mis materias</button></div></div>';
    }
    var mid = pm.id;
    var existe = materias.filter(function (m) { return m.id === mid; }).length > 0;
    if (!existe) mid = materias[0].id;
    var m = Q.materia(mid);
    var evs = Q.evaluacionesDeMateria(mid) || [];
    var als = Q.alumnosDeMateria(mid) || [];
    var suma = sumaPesos(mid);

    var selector = '<div class="fila envuelve gap-1">' +
      '<label class="campo-etiqueta" for="pr-sel-materia">Materia</label>' +
      '<select class="selec" id="pr-sel-materia" style="max-width:340px" data-cambio="pr:cambiarMateriaCalif">' +
      materias.map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (x.id === mid ? ' selected' : '') + '>' +
          esc(x.codigo + ' · ' + x.nombre) + '</option>';
      }).join('') + '</select>' +
      '<button type="button" class="btn" data-accion="pr:formAsistencia"' + args({ materiaId: mid }) + '>' +
      U.icono('cheque', 16) + ' Capturar asistencia</button>' +
      '<button type="button" class="btn"' + irA('materias', { id: mid, tab: 'evaluaciones' }) + '>' +
      U.icono('engrane', 16) + ' Evaluaciones</button></div>';

    var leyenda = '<div class="fila envuelve gap-1 mt-1">' +
      U.badge('Suma de pesos ' + suma.toFixed(2), Math.abs(suma - 1) < 0.001 ? 'ok' : 'aviso') +
      '<span class="campo-ayuda">' +
      (Math.abs(suma - 1) < 0.001
        ? 'Los pesos de esta materia cierran en 1.00.'
        : 'Los pesos suman ' + suma.toFixed(2) + '. Ajusta las evaluaciones para que cierren en 1.00.') +
      ' El promedio se calcula sólo con lo ya calificado. Escala 0 a 10; deja la celda vacía para borrar una nota.</span></div>';

    var cuerpoTabla;
    if (!als.length || !evs.length) {
      cuerpoTabla = U.vacio({
        icono: 'grafica',
        titulo: !als.length ? 'Sin alumnos inscritos' : 'Sin evaluaciones',
        texto: !als.length
          ? 'Inscribe alumnos en la materia para capturar sus calificaciones.'
          : 'Crea al menos una evaluación con su peso para poder capturar.'
      }) + '<div class="centro" style="padding-bottom:1.4rem">' +
        '<button type="button" class="btn btn-primario"' +
        irA('materias', { id: mid, tab: !als.length ? 'alumnos' : 'evaluaciones' }) +
        '>Abrir la materia</button></div>';
    } else {
      var encabezado = '<tr><th style="min-width:210px">Alumno</th>' +
        evs.map(function (e) {
          return '<th class="num"><div>' + esc(e.nombre) + '</div>' +
            '<div class="mono silencio" style="font-weight:400;text-transform:none;letter-spacing:0">peso ' +
            num(e.peso, 0).toFixed(2) + ' · ' + U.fecha(e.fecha, 'corta') + '</div></th>';
        }).join('') +
        '<th class="num">Promedio</th></tr>';

      var cuerpo = als.map(function (a) {
        var celdas = evs.map(function (e) {
          var c = Q.nota(a.id, e.id);
          var val = c && c.valor != null ? c.valor : '';
          return '<td class="num"><input class="celda-nota" type="number" min="0" max="10" step="0.1"' +
            ' value="' + esc(val) + '" data-prev="' + esc(val) + '"' +
            ' data-eval="' + esc(e.id) + '" data-peso="' + num(e.peso, 0) + '"' +
            ' aria-label="' + esc(e.nombre + ' de ' + a.nombre) + '"' +
            ' data-cambio="pr:capturarNota"' + args({ alumnoId: a.id, evaluacionId: e.id }) + '></td>';
        }).join('');
        var prom = Q.promedioMateria(a.id, mid);
        return '<tr data-fila="' + esc(a.id) + '">' +
          '<td><div class="fila gap-1">' + U.avatar(a, 'sm') +
          '<div class="crece"><div class="truncar">' + esc(a.nombre) + '</div>' +
          '<div class="silencio mono" style="font-size:.72rem">' + esc(a.matricula) + '</div></div></div></td>' +
          celdas +
          '<td class="num ' + (prom == null ? 'silencio' : U.claseNota(prom)) + '" data-prom="' + esc(a.id) + '">' +
          U.notaTexto(prom) + '</td></tr>';
      }).join('');

      var pie = '<tr>' +
        '<td style="background:var(--superficie-2);font-weight:600">Promedio del grupo</td>' +
        evs.map(function (e) {
          var pe = promedioEvaluacion(e.id, als);
          return '<td class="num mono" style="background:var(--superficie-2);font-weight:600"' +
            ' data-promev="' + esc(e.id) + '">' + U.notaTexto(pe) + '</td>';
        }).join('') +
        '<td class="num mono" style="background:var(--superficie-2);font-weight:600" data-promgrupo="1">' +
        U.notaTexto(Q.promedioGrupo(mid)) + '</td></tr>';

      cuerpoTabla = '<div class="tabla-envoltura"><table class="tabla" id="pr-tabla-notas">' +
        '<thead>' + encabezado + '</thead><tbody>' + cuerpo + '</tbody>' +
        '<tfoot>' + pie + '</tfoot></table></div>';
    }

    /* distribución del grupo por rango */
    var rangos = [
      { etiqueta: '10 – 9', valor: 0 }, { etiqueta: '9 – 8', valor: 0 },
      { etiqueta: '8 – 7', valor: 0 }, { etiqueta: '7 – 6', valor: 0 },
      { etiqueta: 'menos de 6', valor: 0 }
    ];
    var conProm = 0;
    als.forEach(function (a) {
      var v = Q.promedioMateria(a.id, mid);
      if (v == null) return;
      conProm++;
      if (v >= 9) rangos[0].valor++;
      else if (v >= 8) rangos[1].valor++;
      else if (v >= 7) rangos[2].valor++;
      else if (v >= 6) rangos[3].valor++;
      else rangos[4].valor++;
    });

    return '<div class="contenedor">' +
      cabecera('Captura de calificaciones', m.nombre + ' · ' + m.codigo + ' · aula ' + m.aula) +
      '<div class="panel mb-2"><div class="panel-cuerpo">' + selector + leyenda + '</div></div>' +
      panelPlano({
        titulo: 'Concentrado del grupo',
        sub: als.length + ' alumnos · ' + evs.length + ' evaluaciones · los cambios se guardan al salir de cada celda',
        cuerpo: cuerpoTabla
      }) +
      '<div class="rejilla mt-2"><div class="col-6">' +
      U.panel({
        titulo: 'Distribución de calificaciones',
        sub: conProm + ' alumnos con promedio calculado',
        cuerpo: U.columnas({ series: rangos, max: Math.max(1, als.length), alto: 180 })
      }) + '</div><div class="col-6">' +
      U.panel({
        titulo: 'Asistencia del grupo',
        sub: 'Sesiones registradas por alumno',
        acciones: '<button type="button" class="btn btn-sm" data-accion="pr:formAsistencia"' + args({ materiaId: mid }) + '>Capturar</button>',
        cuerpo: als.length ? als.map(function (a) {
          var ap = asistenciaPct(a.id, mid);
          var as = Q.asistencia(a.id, mid) || { presentes: 0, totales: 0 };
          return '<div class="barra-criterio mb-1" style="grid-template-columns:150px 1fr 74px">' +
            '<span class="truncar">' + esc(a.nombre.split(' ')[0] + ' ' + (a.nombre.split(' ')[1] || '')) + '</span>' +
            U.progreso(ap == null ? 0 : ap, ap == null ? '' : (ap >= 90 ? 'ok' : (ap >= 80 ? 'aviso' : 'crit'))) +
            '<span class="n">' + as.presentes + '/' + as.totales + '</span></div>';
        }).join('') : '<p class="silencio">Sin alumnos inscritos.</p>'
      }) + '</div></div></div>';
  }

  /* Recalcula, sin volver a pintar la vista, las celdas derivadas de la tabla. */
  function recalcularTabla(tabla, filaTr, evId) {
    if (filaTr) {
      var inputs = filaTr.querySelectorAll('input.celda-nota');
      var sv = 0, sp = 0, i;
      for (i = 0; i < inputs.length; i++) {
        var v = parseFloat(inputs[i].value);
        var w = parseFloat(inputs[i].getAttribute('data-peso'));
        if (isFinite(v) && isFinite(w) && w > 0) { sv += v * w; sp += w; }
      }
      var celda = filaTr.querySelector('[data-prom]');
      if (celda) {
        var prom = sp > 0 ? red1(sv / sp) : null;
        celda.textContent = U.notaTexto(prom);
        celda.className = 'num ' + (prom == null ? 'silencio' : U.claseNota(prom));
      }
    }
    if (evId) {
      var col = tabla.querySelectorAll('input.celda-nota[data-eval="' + evId + '"]');
      var s = 0, n = 0, k;
      for (k = 0; k < col.length; k++) {
        var cv = parseFloat(col[k].value);
        if (isFinite(cv)) { s += cv; n++; }
      }
      var pieCelda = tabla.querySelector('[data-promev="' + evId + '"]');
      if (pieCelda) pieCelda.textContent = n ? U.notaTexto(red1(s / n)) : U.notaTexto(null);
    }
    var filas = tabla.querySelectorAll('tbody tr[data-fila]');
    var acum = 0, cuenta = 0, f;
    for (f = 0; f < filas.length; f++) {
      var ins = filas[f].querySelectorAll('input.celda-nota');
      var fv = 0, fp = 0, j;
      for (j = 0; j < ins.length; j++) {
        var val = parseFloat(ins[j].value);
        var pes = parseFloat(ins[j].getAttribute('data-peso'));
        if (isFinite(val) && isFinite(pes) && pes > 0) { fv += val * pes; fp += pes; }
      }
      if (fp > 0) { acum += fv / fp; cuenta++; }
    }
    var celdaGrupo = tabla.querySelector('[data-promgrupo]');
    if (celdaGrupo) celdaGrupo.textContent = cuenta ? U.notaTexto(red1(acum / cuenta)) : U.notaTexto(null);
  }
  /* ========================================================== SECCIÓN TAREAS */
  function verTareas(p, ctx) {
    var pm = ctx.params || {};
    if (pm.id) {
      var t = Q.tarea(pm.id);
      if (t && idsMaterias(p, true).indexOf(t.materiaId) >= 0) return verTareaDetalle(p, t);
    }
    var tareas = tareasDe(p);
    var materias = materiasDe(p, false);
    var porMateria = materias.map(function (m) {
      return { materia: m, tareas: tareas.filter(function (t) { return t.materiaId === m.id; }) };
    }).filter(function (g) { return g.tareas.length > 0; });

    var pendientesTotal = 0;
    tareas.forEach(function (t) { var c = conteoEntregas(t.id); pendientesTotal += c.entregada + c.atrasada; });

    var cuerpo = porMateria.length ? porMateria.map(function (g) {
      return '<div class="mb-2">' + panelPlano({
        titulo: g.materia.nombre,
        sub: g.materia.codigo + ' · ' + g.tareas.length + (g.tareas.length === 1 ? ' tarea' : ' tareas'),
        acciones: '<button type="button" class="btn btn-sm" data-accion="pr:formTarea"' + args({ materiaId: g.materia.id }) +
          '>' + U.icono('mas', 15) + ' Nueva en esta materia</button>',
        cuerpo: '<ul class="lista">' + g.tareas.map(function (t) {
          var c = conteoEntregas(t.id);
          var dias = Q.diasParaEntrega(t.vence);
          var tipoT = TIPOS_TAREA.filter(function (x) { return x.v === t.tipo; })[0];
          return '<li class="lista-item"><div class="crece">' +
            '<div class="t truncar">' + esc(t.titulo) + '</div>' +
            '<div class="d">' + esc(tipoT ? tipoT.t : t.tipo) + ' · ' + t.puntos + ' puntos · vence ' +
            U.fecha(t.vence, 'corta') + ' (' + vencimientoTexto(dias) + ')</div></div>' +
            '<div class="fila envuelve gap-1">' +
            U.badge(c.revisada + ' revisadas', 'ok') +
            U.badge(c.entregada + ' entregadas', 'info') +
            U.badge(c.atrasada + ' atrasadas', c.atrasada ? 'crit' : 'neutro') +
            U.badge(c.pendiente + ' pendientes', 'neutro') + '</div>' +
            '<button type="button" class="btn btn-sm btn-suave"' + irA('tareas', { id: t.id }) + '>Abrir</button></li>';
        }).join('') + '</ul>'
      }) + '</div>';
    }).join('') : ('<div class="panel"><div class="panel-cuerpo">' + U.vacio({
      icono: 'portapapeles', titulo: 'Sin tareas publicadas',
      texto: 'Publica la primera tarea para que tus alumnos la vean en su portal.'
    }) + '<div class="centro"><button type="button" class="btn btn-primario" data-accion="pr:formTarea">' +
      'Nueva tarea</button></div></div></div>');

    return '<div class="contenedor">' +
      cabecera('Tareas y trabajos',
        tareas.length + ' publicadas · ' + pendientesTotal + ' entregas esperando revisión',
        '<button type="button" class="btn btn-primario" data-accion="pr:formTarea">' +
        U.icono('mas', 16) + ' Nueva tarea</button>') +
      cuerpo + '</div>';
  }

  function verTareaDetalle(p, t) {
    var m = Q.materia(t.materiaId);
    var als = Q.alumnosDeMateria(t.materiaId) || [];
    var c = conteoEntregas(t.id);
    var dias = Q.diasParaEntrega(t.vence);

    var filas = als.map(function (a) {
      var e = entrega(t.id, a.id) || { estado: 'pendiente', fecha: null, calificacion: null };
      var opciones = ESTADOS_ENTREGA.map(function (o) {
        return '<option value="' + o.v + '"' + (o.v === e.estado ? ' selected' : '') + '>' + o.t + '</option>';
      }).join('');
      return '<tr>' +
        '<td><div class="fila gap-1">' + U.avatar(a, 'sm') +
        '<div class="crece"><div class="truncar">' + esc(a.nombre) + '</div>' +
        '<div class="silencio mono" style="font-size:.72rem">' + esc(a.matricula) + '</div></div></div></td>' +
        '<td>' + U.badge(ETIQUETA_ENTREGA[e.estado] || e.estado, VARIANTE_ENTREGA[e.estado] || 'neutro') + '</td>' +
        '<td class="mono">' + (e.fecha ? U.fecha(e.fecha, 'corta') : '<span class="silencio">—</span>') + '</td>' +
        '<td><select class="selec" style="min-width:150px" data-cambio="pr:entregaEstado"' +
        args({ tareaId: t.id, alumnoId: a.id }) + ' aria-label="Estado de la entrega de ' + esc(a.nombre) + '">' +
        opciones + '</select></td>' +
        '<td><input class="celda-nota" type="number" min="0" max="10" step="0.1"' +
        ' value="' + esc(e.calificacion == null ? '' : e.calificacion) + '"' +
        ' data-cambio="pr:entregaCalif"' + args({ tareaId: t.id, alumnoId: a.id }) +
        ' aria-label="Calificación de la entrega de ' + esc(a.nombre) + '"></td></tr>';
    }).join('');

    var tabla = als.length
      ? '<div class="tabla-envoltura"><table class="tabla"><thead><tr>' +
      '<th>Alumno</th><th>Estado actual</th><th>Fecha</th><th>Cambiar estado</th>' +
      '<th class="num">Calificación</th></tr></thead><tbody>' + filas + '</tbody></table></div>'
      : U.vacio({ icono: 'usuarios', titulo: 'Sin alumnos', texto: 'Nadie está inscrito en esta materia todavía.' });

    return '<div class="contenedor">' +
      U.migas([{ texto: 'Tareas', ruta: ruta('tareas') }, { texto: t.titulo }]) +
      cabecera(t.titulo, (m ? m.nombre + ' · ' : '') + t.puntos + ' puntos · vence ' + U.fecha(t.vence, 'larga'),
        '<button type="button" class="btn"' + irA('tareas') + '>' + U.icono('flecha-izq', 16) + ' Todas las tareas</button>') +
      '<div class="rejilla mb-2">' +
      '<div class="col-3">' + U.kpi({ etiqueta: 'Revisadas', valor: c.revisada, variante: 'ok', icono: 'cheque', sub: 'de ' + c.total }) + '</div>' +
      '<div class="col-3">' + U.kpi({ etiqueta: 'Entregadas', valor: c.entregada, variante: 'marca', icono: 'subir', sub: 'Esperan revisión' }) + '</div>' +
      '<div class="col-3">' + U.kpi({ etiqueta: 'Atrasadas', valor: c.atrasada, variante: c.atrasada ? 'crit' : '', icono: 'alerta', sub: 'Fuera de fecha' }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Pendientes', valor: c.pendiente, icono: 'reloj',
        sub: dias === 0 ? 'Vence hoy'
          : (dias < 0 ? 'Cerró hace ' + diasTexto(Math.abs(dias))
            : (dias === 1 ? 'Falta 1 día' : 'Faltan ' + diasTexto(dias)))
      }) + '</div></div>' +
      U.panel({ titulo: 'Instrucciones publicadas', cuerpo: '<p>' + esc(t.descripcion) + '</p>' +
        (t.archivo ? '<div class="caja-suave fila gap-1 mt-2">' + U.icono('pdf', 18) +
          '<span class="crece">' + esc(t.archivo.nombre) + '</span>' +
          '<span class="silencio mono">' + esc(t.archivo.tamano) + '</span></div>' : '') }) +
      '<div class="mt-2">' + panelPlano({
        titulo: 'Entregas del grupo',
        sub: 'Cambia el estado o califica; se guarda al momento',
        cuerpo: tabla
      }) + '</div></div>';
  }

  /* ====================================================== SECCIÓN MATERIALES */
  function verMateriales(p, ctx) {
    var mats = materialesDe(p);
    var materias = materiasDe(p, false);
    var grupos = materias.map(function (m) {
      return { materia: m, items: mats.filter(function (x) { return x.materiaId === m.id; }) };
    }).filter(function (g) { return g.items.length > 0; });

    var cuerpo = grupos.length ? grupos.map(function (g) {
      return '<div class="mb-2">' + panelPlano({
        titulo: g.materia.nombre,
        sub: g.materia.codigo + ' · ' + g.items.length + (g.items.length === 1 ? ' material' : ' materiales'),
        acciones: '<button type="button" class="btn btn-sm" data-accion="pr:formMaterial"' + args({ materiaId: g.materia.id }) +
          '>' + U.icono('subir', 15) + ' Subir a esta materia</button>',
        cuerpo: '<ul class="lista">' + g.items.map(function (x) {
          var tipoT = TIPOS_MATERIAL.filter(function (o) { return o.v === x.tipo; })[0];
          return '<li class="lista-item">' + U.icono(x.tipo, 20) +
            '<div class="crece"><div class="t truncar">' + esc(x.titulo) + '</div>' +
            '<div class="d truncar">' + esc(x.descripcion) + '</div></div>' +
            U.chip(tipoT ? tipoT.t : x.tipo) +
            '<span class="mono silencio nowrap">' + esc(x.tamano) + '</span>' +
            '<span class="d nowrap">' + U.fecha(x.subidoEl, 'corta') + '</span>' +
            '<button type="button" class="btn btn-sm btn-icono btn-peligro" aria-label="Eliminar ' + esc(x.titulo) + '"' +
            ' data-accion="pr:pedirEliminarMaterial"' + args({ id: x.id }) + '>' + U.icono('basura', 15) + '</button></li>';
        }).join('') + '</ul>'
      }) + '</div>';
    }).join('') : ('<div class="panel"><div class="panel-cuerpo">' + U.vacio({
      icono: 'archivo', titulo: 'Sin materiales',
      texto: 'Sube apuntes, formularios o ligas para que tus alumnos los tengan a la mano.'
    }) + '<div class="centro"><button type="button" class="btn btn-primario" data-accion="pr:formMaterial">' +
      'Subir material</button></div></div></div>');

    return '<div class="contenedor">' +
      cabecera('Materiales de apoyo',
        mats.length + ' archivos publicados en ' + grupos.length + ' materias',
        '<button type="button" class="btn btn-primario" data-accion="pr:formMaterial">' +
        U.icono('subir', 16) + ' Subir material</button>') +
      cuerpo + '</div>';
  }
  /* ========================================================= SECCIÓN ALUMNOS */
  function promedioConmigo(p, alumnoId) {
    var vals = [];
    materiasDeAlumnoCon(p, alumnoId).forEach(function (m) {
      var v = Q.promedioMateria(alumnoId, m.id);
      if (v != null) vals.push(v);
    });
    if (!vals.length) return null;
    var s = 0;
    vals.forEach(function (v) { s += v; });
    return red1(s / vals.length);
  }
  function asistenciaConmigo(p, alumnoId) {
    var pres = 0, tot = 0;
    materiasDeAlumnoCon(p, alumnoId).forEach(function (m) {
      var a = Q.asistencia(alumnoId, m.id);
      if (a && a.totales) { pres += a.presentes; tot += a.totales; }
    });
    return tot ? pctDe(pres, tot) : null;
  }

  function verAlumnos(p) {
    var als = alumnosDe(p);
    var filas = als.map(function (a) {
      var ms = materiasDeAlumnoCon(p, a.id);
      var prom = promedioConmigo(p, a.id);
      var asis = asistenciaConmigo(p, a.id);
      var vEst = a.estatus === 'activo' ? 'ok' : (a.estatus === 'condicionado' ? 'aviso' : 'crit');
      var busca = (a.nombre + ' ' + a.matricula).toLowerCase();
      return '<tr data-busca="' + esc(busca) + '" style="cursor:pointer" data-accion="pr:expediente"' +
        args({ alumnoId: a.id }) + '>' +
        '<td><div class="fila gap-1">' + U.avatar(a, 'sm') +
        '<div class="crece"><div class="truncar">' + esc(a.nombre) + '</div>' +
        '<div class="silencio truncar" style="font-size:.75rem">' + esc(a.email) + '</div></div></div></td>' +
        '<td class="mono">' + esc(a.matricula) + '</td>' +
        '<td><div class="fila envuelve gap-1">' + ms.map(function (m) {
          return U.chip(m.codigo);
        }).join('') + '</div></td>' +
        '<td class="num">' + nota(prom) + '</td>' +
        '<td class="num mono">' + (asis == null ? '—' : asis + ' %') + '</td>' +
        '<td>' + U.badge(a.estatus, vEst) + '</td>' +
        '<td class="txt-d"><button type="button" class="btn btn-sm" data-accion="pr:expediente"' +
        args({ alumnoId: a.id }) + '>Expediente</button></td></tr>';
    }).join('');

    var buscador = '<div class="buscador" style="max-width:320px">' + U.icono('buscar', 16) +
      '<input class="entrada" type="search" placeholder="Buscar por nombre o matrícula"' +
      ' aria-label="Buscar alumno" data-entrada="pr:buscarAlumno"></div>';

    var cuerpo = als.length
      ? '<div class="tabla-envoltura"><table class="tabla" id="pr-tabla-alumnos"><thead><tr>' +
      '<th>Alumno</th><th>Matrícula</th><th>Materias conmigo</th><th class="num">Promedio</th>' +
      '<th class="num">Asistencia</th><th>Estatus</th><th></th></tr></thead>' +
      '<tbody>' + filas + '</tbody></table>' +
      '<p class="vacio oculto" id="pr-sin-resultados">Ningún alumno coincide con la búsqueda.</p></div>'
      : U.vacio({ icono: 'usuarios', titulo: 'Sin alumnos', texto: 'Inscribe alumnos en tus materias para verlos aquí.' });

    return '<div class="contenedor">' +
      cabecera('Mis alumnos',
        als.length + ' alumnos distintos en ' + materiasDe(p, false).length + ' materias', buscador) +
      panelPlano({
        titulo: 'Listado',
        sub: 'Toca una fila para abrir el expediente de esa persona conmigo',
        cuerpo: cuerpo
      }) + '</div>';
  }

  function expedienteHTML(p, a) {
    var ms = materiasDeAlumnoCon(p, a.id);
    var bloques = ms.map(function (m) {
      var evs = Q.evaluacionesDeMateria(m.id) || [];
      var as = Q.asistencia(a.id, m.id) || { presentes: 0, totales: 0 };
      var ap = asistenciaPct(a.id, m.id);
      var tareasM = tareasDe(p).filter(function (t) { return t.materiaId === m.id; });
      var chips = { pendiente: 0, entregada: 0, revisada: 0, atrasada: 0 };
      tareasM.forEach(function (t) {
        var e = entrega(t.id, a.id);
        if (e && chips[e.estado] != null) chips[e.estado]++;
      });
      return '<div class="caja-suave mb-2">' +
        '<div class="entre mb-1"><div class="fila gap-1">' + puntoColor(m.color) +
        '<strong>' + esc(m.nombre) + '</strong><span class="silencio mono">' + esc(m.codigo) + '</span></div>' +
        '<span>' + nota(Q.promedioMateria(a.id, m.id)) + '</span></div>' +
        '<div class="tabla-envoltura"><table class="tabla"><thead><tr>' +
        '<th>Evaluación</th><th class="num">Peso</th><th class="num">Calificación</th></tr></thead><tbody>' +
        evs.map(function (e) {
          var c = Q.nota(a.id, e.id);
          return '<tr><td>' + esc(e.nombre) + '</td>' +
            '<td class="num mono">' + num(e.peso, 0).toFixed(2) + '</td>' +
            '<td class="num">' + nota(c && c.valor != null ? c.valor : null) + '</td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="fila envuelve gap-1 mt-1">' +
        U.badge('Asistencia ' + (ap == null ? '—' : ap + ' %') + ' (' + as.presentes + '/' + as.totales + ')',
          ap == null ? 'neutro' : (ap >= 80 ? 'ok' : 'crit')) +
        U.chip(chips.revisada + ' revisadas') + U.chip(chips.entregada + ' entregadas') +
        U.chip(chips.atrasada + ' atrasadas') + U.chip(chips.pendiente + ' pendientes') +
        '</div></div>';
    }).join('');

    return '<div class="fila gap-2 mb-2">' + U.avatar(a, 'lg') +
      '<div class="crece"><div class="destacado" style="font-size:1.1rem">' + esc(a.nombre) + '</div>' +
      '<div class="silencio mono">' + esc(a.matricula) + ' · ' + esc(a.email) + '</div>' +
      '<div class="fila envuelve gap-1 mt-1">' +
      U.badge(a.estatus, a.estatus === 'activo' ? 'ok' : 'aviso') +
      U.chip('Promedio conmigo ' + U.notaTexto(promedioConmigo(p, a.id))) +
      U.chip('Asistencia ' + (asistenciaConmigo(p, a.id) == null ? '—' : asistenciaConmigo(p, a.id) + ' %')) +
      '</div></div></div>' +
      (bloques || '<p class="silencio">Este alumno no cursa ninguna materia contigo.</p>') +
      form({
        accion: 'pr:guardarNotaAlumno', args: { alumnoId: a.id }, rejilla: false, cancelar: true,
        ok: 'Guardar nota',
        cuerpo: campo({
          tipo: 'area', nombre: 'notas', etiqueta: 'Nota del profesor sobre este alumno',
          valor: a.notas, filas: 3,
          ayuda: 'Queda en el expediente del alumno; la ve también la dirección.'
        })
      });
  }

  /* ========================================================= SECCIÓN RESEÑAS */
  function tarjetaResena(r) {
    var m = Q.materia(r.materiaId);
    var al = r.anonima ? null : Q.alumno(r.alumnoId);
    var quien = r.anonima ? 'Anónimo' : (al ? al.nombre : 'Anónimo');
    var avatarQuien = al
      ? U.avatar(al, 'sm')
      : '<span class="avatar avatar-sm" style="background:var(--superficie-3);color:var(--tinta-2)" aria-hidden="true">' +
      U.icono('candado', 14) + '</span>';

    var botones = '';
    if (r.estado !== 'publica') {
      botones += '<button type="button" class="btn btn-sm btn-primario" data-accion="pr:moderar"' +
        args({ id: r.id, estado: 'publica' }) + '>' + U.icono('cheque', 15) + ' Autorizar y publicar</button>';
    }
    if (r.estado !== 'oculta') {
      botones += '<button type="button" class="btn btn-sm" data-accion="pr:moderar"' +
        args({ id: r.id, estado: 'oculta' }) + '>' + U.icono('ojo-cerrado', 15) + ' Ocultar</button>';
    }
    botones += '<button type="button" class="btn btn-sm" data-accion="pr:formResponder"' + args({ id: r.id }) + '>' +
      U.icono('chat', 15) + ' Responder</button>';

    var estadoBadge = r.estado === 'publica' ? U.badge('Publicada', 'ok')
      : (r.estado === 'oculta' ? U.badge('Oculta', 'neutro') : U.badge('Pendiente de autorizar', 'aviso'));

    return '<div class="resena">' +
      '<div class="entre"><div class="fila gap-1">' + avatarQuien +
      '<div><div class="fila gap-1">' + U.estrellas(r.estrellas) + estadoBadge + '</div>' +
      '<div class="meta">' + esc(quien) + ' · ' + esc(m ? m.nombre : 'Materia dada de baja') +
      ' · ' + U.fecha(r.fecha, 'larga') + '</div></div></div></div>' +
      '<div class="fila envuelve gap-1 mt-1">' + CRITERIOS.map(function (c) {
        return U.chip(c.t + ' ' + ((r.criterios || {})[c.k] == null ? '—' : r.criterios[c.k]) + '/5');
      }).join('') + '</div>' +
      '<p class="cuerpo">' + esc(r.comentario) + '</p>' +
      (r.respuesta ? '<div class="respuesta"><span class="quien">Mi respuesta · ' +
        U.fecha(r.respuesta.fecha, 'corta') + '</span>' + esc(r.respuesta.texto) + '</div>' : '') +
      '<div class="fila envuelve gap-1 mt-2">' + botones + '</div></div>';
  }

  function verResenas(p, ctx) {
    var pm = ctx.params || {};
    var todas = resenasDe(p);
    var pend = porEstado(todas, 'pendiente');
    var pub = porEstado(todas, 'publica');
    var ocu = porEstado(todas, 'oculta');
    var tab = pm.tab || (pend.length ? 'pendientes' : 'publicas');
    var lista = tab === 'publicas' ? pub : (tab === 'ocultas' ? ocu : pend);

    var rating = Q.ratingProfesor(p.id, false) ||
      { promedio: 0, total: 0, distribucion: [0, 0, 0, 0, 0], criterios: {} };
    var dist = rating.distribucion || [0, 0, 0, 0, 0];
    var maxDist = Math.max(1, dist[0], dist[1], dist[2], dist[3], dist[4]);

    var resumen = '<div class="rejilla mb-2"><div class="col-4">' +
      U.panel({
        titulo: 'Mi valoración',
        sub: rating.total + ' reseñas recibidas en total',
        cuerpo: '<div class="txt-c mb-2">' +
          '<div class="destacado" style="font-size:2.6rem;line-height:1.1">' +
          (rating.total ? red1(rating.promedio).toFixed(1) : '—') + '</div>' +
          '<div class="centro">' + U.estrellas(rating.promedio, { tam: 'lg' }) + '</div>' +
          '<p class="campo-ayuda mt-1">Incluye pendientes, publicadas y ocultas.</p></div>' +
          [5, 4, 3, 2, 1].map(function (n) {
            return '<div class="barra-criterio"><span>' + n + ' estrellas</span>' +
              U.progreso(pctDe(dist[n - 1] || 0, maxDist)) +
              '<span class="n">' + (dist[n - 1] || 0) + '</span></div>';
          }).join('')
      }) + '</div><div class="col-4">' +
      U.panel({
        titulo: 'Criterios',
        sub: 'Promedio de cada criterio sobre 5',
        cuerpo: CRITERIOS.map(function (c) {
          var v = (rating.criterios || {})[c.k];
          return barraCriterio(c.t, v == null ? null : v, 5);
        }).join('') +
          '<p class="campo-ayuda mt-2">Los criterios los califica el alumno al escribir su reseña.</p>'
      }) + '</div><div class="col-4">' +
      U.panel({
        titulo: 'Cómo funciona la autorización',
        cuerpo: '<div class="caja-suave fila gap-1" style="align-items:flex-start">' +
          U.icono('escudo', 18) +
          '<p>Sólo las reseñas que <strong>autorices</strong> aparecen en tu perfil público del colegio. ' +
          'Las pendientes y las ocultas no las ve nadie más que tú y la dirección. ' +
          'Puedes responder cualquiera; tu respuesta se publica junto con la reseña autorizada.</p></div>' +
          '<div class="fila envuelve gap-1 mt-2">' +
          '<button type="button" class="btn btn-suave" data-accion="pr:ir"' +
          args({ ruta: '#/publico/profesor?id=' + p.id }) + '>' + U.icono('ojo', 16) +
          ' Ver cómo quedó mi perfil público</button></div>' +
          '<p class="campo-ayuda mt-2">Tu perfil público está ' +
          (p.perfilPublico ? 'visible en el sitio del colegio.' : 'oculto: actívalo en Mi perfil.') + '</p>'
      }) + '</div></div>';

    var pestanas = U.pestanas([
      { id: 'pendientes', texto: 'Pendientes', conteo: pend.length },
      { id: 'publicas', texto: 'Publicadas', conteo: pub.length },
      { id: 'ocultas', texto: 'Ocultas', conteo: ocu.length }
    ], tab, 'pr:tabResenas');

    var cuerpo = lista.length
      ? '<div class="panel"><div class="panel-cuerpo">' + lista.map(tarjetaResena).join('') + '</div></div>'
      : U.vacio({
        icono: 'estrella',
        titulo: tab === 'pendientes' ? 'Nada por autorizar' : (tab === 'publicas' ? 'Sin reseñas publicadas' : 'Sin reseñas ocultas'),
        texto: tab === 'pendientes'
          ? 'Cuando un alumno escriba una reseña, aparecerá aquí para que decidas si se publica.'
          : 'Aquí se listan las reseñas en este estado.'
      });

    return '<div class="contenedor">' +
      cabecera('Reseñas de mis alumnos',
        pend.length + ' pendientes · ' + pub.length + ' publicadas · ' + ocu.length + ' ocultas') +
      resumen + pestanas + cuerpo + '</div>';
  }
  /* ========================================================== SECCIÓN AVISOS */
  function verAvisos(p) {
    var mios = avisosMios(p);
    var dir = avisosDireccion();
    var opciones = [{ v: 'escuela', t: 'Toda la escuela' }].concat(
      materiasDe(p, false).map(function (m) { return { v: m.id, t: 'Sólo ' + m.codigo + ' · ' + m.nombre }; })
    );

    var formulario = form({
      accion: 'pr:guardarAviso', cancelar: false, ok: 'Publicar aviso',
      cuerpo:
        campo({ tipo: 'selec', nombre: 'destino', etiqueta: 'Para quién', opciones: opciones, valor: 'escuela', col: 6 }) +
        campo({
          tipo: 'selec', nombre: 'prioridad', etiqueta: 'Prioridad', col: 6, valor: 'normal',
          opciones: [{ v: 'normal', t: 'Normal' }, { v: 'alta', t: 'Alta' }]
        }) +
        campo({ nombre: 'titulo', etiqueta: 'Título', req: true, col: 12, ph: 'Asesoría extra antes del tercer parcial' }) +
        campo({
          tipo: 'area', nombre: 'cuerpo', etiqueta: 'Mensaje', req: true, col: 12, filas: 4,
          ph: 'Escribe el aviso completo. Se publica con la fecha de hoy.'
        })
    });

    var listaMios = mios.length ? '<ul class="lista">' + mios.map(function (a) {
      var m = a.materiaId ? Q.materia(a.materiaId) : null;
      return '<li class="lista-item">' + U.icono('campana', 18) +
        '<div class="crece"><div class="t">' + esc(a.titulo) + '</div>' +
        '<div class="d">' + U.fecha(a.fecha, 'larga') + ' · ' +
        (a.ambito === 'escuela' ? 'Toda la escuela' : esc(m ? m.nombre : 'Materia')) + '</div>' +
        '<p class="d mt-1" style="color:var(--tinta-2)">' + esc(a.cuerpo) + '</p></div>' +
        (a.prioridad === 'alta' ? U.badge('Alta', 'crit') : U.badge('Normal', 'neutro')) + '</li>';
    }).join('') + '</ul>' : U.vacio({
      icono: 'campana', titulo: 'Todavía no publicas avisos',
      texto: 'Usa el formulario para avisar a toda la escuela o sólo a una de tus materias.'
    });

    var listaDir = dir.length ? '<ul class="lista">' + dir.map(function (a) {
      return '<li class="lista-item">' + U.icono('escudo', 18) +
        '<div class="crece"><div class="t">' + esc(a.titulo) + '</div>' +
        '<div class="d">Dirección · ' + U.fecha(a.fecha, 'larga') + '</div>' +
        '<p class="d mt-1" style="color:var(--tinta-2)">' + esc(a.cuerpo) + '</p></div>' +
        (a.prioridad === 'alta' ? U.badge('Alta', 'crit') : '') + '</li>';
    }).join('') + '</ul>' : U.vacio({ icono: 'campana', titulo: 'Sin avisos de dirección', texto: 'No hay comunicados vigentes.' });

    return '<div class="contenedor">' +
      cabecera('Avisos', mios.length + ' publicados por mí · ' + dir.length + ' de dirección') +
      '<div class="rejilla">' +
      '<div class="col-4">' + U.panel({
        titulo: 'Publicar un aviso',
        sub: 'Aparece de inmediato en el portal de quien corresponda',
        cuerpo: formulario
      }) + '</div>' +
      '<div class="col-8">' + panelPlano({ titulo: 'Mis avisos', sub: 'Los que yo he publicado', cuerpo: listaMios }) +
      '<div class="mt-2">' + panelPlano({ titulo: 'Avisos de dirección', sub: 'Comunicados generales del colegio', cuerpo: listaDir }) + '</div>' +
      '</div></div></div>';
  }

  /* ========================================================== SECCIÓN PERFIL */
  function verPerfil(p) {
    var cabeceraPerfil = '<div class="perfil-cab mb-2">' +
      '<div class="pila"><div>' + U.avatar(p, 'xl') + '</div>' +
      '<div class="campo mb-0">' +
      '<label class="campo-etiqueta" for="pr-foto">Cambiar mi foto</label>' +
      '<input class="entrada" type="file" id="pr-foto" accept="image/*" data-cambio="pr:archivoFoto">' +
      '<span class="campo-ayuda">JPG o PNG. Se ve en tu perfil público y en el portal.</span></div>' +
      (p.foto ? '<button type="button" class="btn btn-sm btn-peligro" data-accion="pr:quitarFoto">' +
        U.icono('basura', 15) + ' Quitar foto</button>' : '') +
      '</div>' +
      '<div><div class="nom">' + esc(p.nombre) + '</div>' +
      '<div class="tit">' + esc(p.titulo) + '</div>' +
      '<div class="fila envuelve gap-1 mt-1">' +
      U.badge('Clave ' + p.clave, 'marca') +
      U.badge(p.perfilPublico ? 'Perfil público visible' : 'Perfil público oculto', p.perfilPublico ? 'ok' : 'neutro') +
      U.chip(materiasDe(p, false).length + ' materias') +
      U.chip(alumnosDe(p).length + ' alumnos') + '</div>' +
      '<div class="datos-rejilla mt-2">' +
      '<div class="dato"><span class="e">Correo</span><span class="v">' + esc(p.email) + '</span></div>' +
      '<div class="dato"><span class="e">Teléfono</span><span class="v">' + esc(p.telefono) + '</span></div>' +
      '<div class="dato"><span class="e">Oficina</span><span class="v">' + esc(p.oficina) + '</span></div>' +
      '<div class="dato"><span class="e">En Altamira desde</span><span class="v">' + U.fecha(p.ingreso, 'mes') + '</span></div>' +
      '</div>' +
      '<div class="fila envuelve gap-1 mt-2">' +
      '<button type="button" class="btn btn-suave" data-accion="pr:ir"' + args({ ruta: '#/publico/profesor?id=' + p.id }) + '>' +
      U.icono('ojo', 16) + ' Ver mi perfil público</button></div>' +
      '</div></div>';

    var cv = p.cv;
    var tarjetaCV = U.panel({
      titulo: 'Currículum',
      sub: 'El archivo que la dirección y las familias pueden consultar',
      cuerpo: (cv
        ? '<div class="caja-suave fila gap-1">' + U.icono('pdf', 26) +
        '<div class="crece"><div class="t"><strong>' + esc(cv.nombre) + '</strong></div>' +
        '<div class="d silencio">' + esc(cv.tamano) + ' · actualizado el ' + U.fecha(cv.actualizado, 'larga') + '</div></div>' +
        '<button type="button" class="btn btn-sm" data-accion="pr:descargarCV">' + U.icono('descargar', 15) + ' Descargar</button></div>'
        : '<div class="zona-suelta">' + U.icono('subir', 22) +
        '<p class="mt-1">Todavía no has subido tu currículum. Sube un PDF para que aparezca en tu expediente.</p></div>') +
        '<div class="campo mt-2 mb-0">' +
        '<label class="campo-etiqueta" for="pr-cv">' + (cv ? 'Reemplazar el archivo' : 'Subir mi currículum') + '</label>' +
        '<input class="entrada" type="file" id="pr-cv" accept=".pdf,.doc,.docx" data-cambio="pr:archivoCV">' +
        '<span class="campo-ayuda">Se guarda el nombre, el tamaño y la fecha de actualización.</span></div>'
    });

    var formPublico = U.panel({
      titulo: 'Datos públicos',
      sub: 'Esto es lo que se ve en el sitio del colegio',
      cuerpo: form({
        accion: 'pr:guardarPerfil', cancelar: false, ok: 'Guardar cambios',
        cuerpo:
          campo({ nombre: 'titulo', etiqueta: 'Título profesional', valor: p.titulo, req: true, col: 6 }) +
          campo({ nombre: 'telefono', etiqueta: 'Teléfono', valor: p.telefono, col: 6 }) +
          campo({ nombre: 'oficina', etiqueta: 'Oficina', valor: p.oficina, col: 6 }) +
          campo({ nombre: 'horarioAsesoria', etiqueta: 'Horario de asesoría', valor: p.horarioAsesoria, col: 6 }) +
          campo({
            tipo: 'area', nombre: 'bio', etiqueta: 'Semblanza', valor: p.bio, filas: 5, col: 12,
            ayuda: 'Dos o tres frases sobre cómo trabajas. Se publica tal cual.'
          }) +
          campo({
            nombre: 'areas', etiqueta: 'Áreas de especialidad', col: 12,
            valor: (p.areas || []).join(', '),
            ayuda: 'Sepáralas con comas. Se muestran como etiquetas en tu perfil público.'
          }) +
          '<div class="campo" style="grid-column:span 12">' +
          '<label class="checa"><input type="checkbox" name="perfilPublico" value="1"' +
          (p.perfilPublico ? ' checked' : '') + '>' +
          '<span>Mostrar mi perfil en el sitio público del colegio' +
          '<span class="campo-ayuda" style="display:block">Si lo desactivas, tu ficha y tus reseñas autorizadas dejan de aparecer en el sitio.</span>' +
          '</span></label></div>'
      })
    });

    var formacion = p.formacion || [];
    var panelFormacion = panelPlano({
      titulo: 'Formación académica',
      sub: formacion.length + ' registros',
      acciones: '<button type="button" class="btn btn-sm btn-primario" data-accion="pr:formFormacion">' +
        U.icono('mas', 15) + ' Agregar</button>',
      cuerpo: formacion.length ? '<ul class="lista">' + formacion.map(function (f, i) {
        return '<li class="lista-item">' + U.icono('birrete', 18) +
          '<div class="crece"><div class="t">' + esc(f.grado) + '</div>' +
          '<div class="d">' + esc(f.institucion) + ' · ' + esc(f.anio) + '</div></div>' +
          '<button type="button" class="btn btn-sm btn-icono btn-peligro" aria-label="Eliminar ' + esc(f.grado) + '"' +
          ' data-accion="pr:pedirEliminarFormacion"' + args({ i: i }) + '>' + U.icono('basura', 15) + '</button></li>';
      }).join('') + '</ul>' : U.vacio({ icono: 'birrete', titulo: 'Sin formación registrada', texto: 'Agrega tus grados y certificaciones.' })
    });

    var experiencia = p.experiencia || [];
    var panelExperiencia = panelPlano({
      titulo: 'Trayectoria',
      sub: experiencia.length + ' registros',
      acciones: '<button type="button" class="btn btn-sm btn-primario" data-accion="pr:formExperiencia">' +
        U.icono('mas', 15) + ' Agregar</button>',
      cuerpo: experiencia.length ? '<ul class="lista">' + experiencia.map(function (x, i) {
        return '<li class="lista-item">' + U.icono('portapapeles', 18) +
          '<div class="crece"><div class="t">' + esc(x.puesto) + '</div>' +
          '<div class="d">' + esc(x.lugar) + ' · ' + esc(x.periodo) + '</div>' +
          (x.detalle ? '<p class="d mt-1" style="color:var(--tinta-2)">' + esc(x.detalle) + '</p>' : '') + '</div>' +
          '<button type="button" class="btn btn-sm btn-icono btn-peligro" aria-label="Eliminar ' + esc(x.puesto) + '"' +
          ' data-accion="pr:pedirEliminarExperiencia"' + args({ i: i }) + '>' + U.icono('basura', 15) + '</button></li>';
      }).join('') + '</ul>' : U.vacio({ icono: 'portapapeles', titulo: 'Sin trayectoria registrada', texto: 'Agrega los puestos que has ocupado.' })
    });

    return '<div class="contenedor">' +
      cabecera('Mi perfil', 'Foto, currículum y los datos que ve el público') +
      cabeceraPerfil +
      '<div class="rejilla">' +
      '<div class="col-8">' + formPublico + '</div>' +
      '<div class="col-4">' + tarjetaCV + '</div>' +
      '<div class="col-6">' + panelFormacion + '</div>' +
      '<div class="col-6">' + panelExperiencia + '</div>' +
      '</div></div>';
  }
  /* ========================================================= MODALES / FORMS */
  function modalMateria(p, m) {
    var esNueva = !m;
    var base = m || { creditos: 6, cupo: 24, horario: [], color: '' };
    U.modal({
      titulo: esNueva ? 'Nueva materia' : 'Editar ' + base.nombre,
      sub: esNueva ? 'Quedarás asignado como profesor de esta materia'
        : 'Los cambios se reflejan de inmediato en el portal de tus alumnos',
      ancho: 'ancho',
      cuerpo: form({
        accion: 'pr:guardarMateria',
        args: { id: esNueva ? '' : base.id },
        ok: esNueva ? 'Crear materia' : 'Guardar cambios',
        cuerpo:
          campo({ nombre: 'nombre', etiqueta: 'Nombre de la materia', valor: base.nombre, req: true, col: 8, ph: 'Cálculo Diferencial' }) +
          campo({ nombre: 'codigo', etiqueta: 'Código', valor: base.codigo, req: true, col: 4, ph: 'MAT-210' }) +
          campo({ tipo: 'number', nombre: 'creditos', etiqueta: 'Créditos', valor: base.creditos, min: 1, max: 20, paso: 1, req: true, col: 4 }) +
          campo({ nombre: 'aula', etiqueta: 'Aula', valor: base.aula, req: true, col: 4, ph: 'B-204' }) +
          campo({ tipo: 'number', nombre: 'cupo', etiqueta: 'Cupo', valor: base.cupo, min: 1, max: 60, paso: 1, req: true, col: 4 }) +
          campo({
            tipo: 'area', nombre: 'descripcion', etiqueta: 'Descripción', valor: base.descripcion, col: 12, filas: 3,
            ayuda: 'Se muestra en la oferta pública del colegio y en el portal del alumno.'
          }) +
          selectorColor(base.color) +
          camposHorario(base.horario)
      })
    });
  }

  function modalInscribir(p, materiaId) {
    var m = Q.materia(materiaId);
    var inscritos = (Q.alumnosDeMateria(materiaId) || []).map(function (a) { return a.id; });
    var libres = (DB.alumnos || []).filter(function (a) {
      return inscritos.indexOf(a.id) < 0 && a.estatus !== 'baja';
    });
    if (!libres.length) {
      U.toast('Todos los alumnos activos ya están inscritos en ' + m.codigo + '.', 'aviso');
      return;
    }
    U.modal({
      titulo: 'Inscribir alumno',
      sub: m.nombre + ' · ' + inscritos.length + ' de ' + m.cupo + ' lugares ocupados',
      cuerpo: form({
        accion: 'pr:inscribir', args: { materiaId: materiaId }, ok: 'Inscribir',
        cuerpo: campo({
          tipo: 'selec', nombre: 'alumnoId', etiqueta: 'Alumno', col: 12, req: true,
          opciones: libres.map(function (a) { return { v: a.id, t: a.matricula + ' · ' + a.nombre }; }),
          ayuda: 'Sólo aparecen alumnos que no están inscritos y no tienen baja.'
        })
      })
    });
  }

  function modalEvaluacion(p, materiaId, ev) {
    var m = Q.materia(materiaId);
    var otras = (Q.evaluacionesDeMateria(materiaId) || []).filter(function (e) {
      return !ev || e.id !== ev.id;
    });
    var usado = 0;
    otras.forEach(function (e) { usado += num(e.peso, 0); });
    var disponible = Math.round((1 - usado) * 1000) / 1000;
    var base = ev || { tipo: 'parcial', peso: disponible > 0 ? disponible : 0.1, fecha: isoDe(HOY) };

    U.modal({
      titulo: ev ? 'Editar evaluación' : 'Nueva evaluación',
      sub: m.nombre + ' · queda ' + disponible.toFixed(2) + ' de peso disponible',
      cuerpo: form({
        accion: 'pr:guardarEvaluacion',
        args: { materiaId: materiaId, id: ev ? ev.id : '' },
        ok: ev ? 'Guardar' : 'Crear evaluación',
        cuerpo:
          campo({ nombre: 'nombre', etiqueta: 'Nombre', valor: base.nombre, req: true, col: 12, ph: 'Tercer parcial' }) +
          campo({ tipo: 'selec', nombre: 'tipo', etiqueta: 'Tipo', valor: base.tipo, opciones: TIPOS_EVAL, col: 6 }) +
          campo({ tipo: 'date', nombre: 'fecha', etiqueta: 'Fecha', valor: base.fecha, req: true, col: 6 }) +
          campo({
            tipo: 'number', nombre: 'peso', etiqueta: 'Peso', valor: base.peso, min: 0.01, max: 1, paso: 0.01, req: true, col: 6,
            ayuda: 'Entre 0.01 y 1.00. La suma de todas las evaluaciones debe cerrar en 1.00.'
          })
      })
    });
  }

  function modalAsistencia(p, materiaId) {
    var m = Q.materia(materiaId);
    var als = Q.alumnosDeMateria(materiaId) || [];
    if (!als.length) { U.toast('Esta materia todavía no tiene alumnos inscritos.', 'aviso'); return; }
    var filas = als.map(function (a) {
      var as = Q.asistencia(a.id, materiaId) || { presentes: 0, totales: 0 };
      return '<tr><td><div class="fila gap-1">' + U.avatar(a, 'sm') +
        '<span class="truncar">' + esc(a.nombre) + '</span></div></td>' +
        '<td><input class="celda-nota" type="number" min="0" step="1" name="p_' + esc(a.id) + '"' +
        ' value="' + as.presentes + '" aria-label="Sesiones presentes de ' + esc(a.nombre) + '"></td>' +
        '<td><input class="celda-nota" type="number" min="1" step="1" name="t_' + esc(a.id) + '"' +
        ' value="' + as.totales + '" aria-label="Sesiones totales de ' + esc(a.nombre) + '"></td></tr>';
    }).join('');

    U.modal({
      titulo: 'Capturar asistencia',
      sub: m.nombre + ' · ' + als.length + ' alumnos',
      ancho: 'ancho',
      cuerpo: form({
        accion: 'pr:guardarAsistencia', args: { materiaId: materiaId }, rejilla: false,
        ok: 'Guardar asistencia',
        cuerpo: '<p class="campo-ayuda mb-2">Captura las sesiones a las que asistió cada alumno y el total impartido. ' +
          'El porcentaje se recalcula solo.</p>' +
          '<div class="tabla-envoltura"><table class="tabla"><thead><tr>' +
          '<th>Alumno</th><th class="num">Presentes</th><th class="num">Totales</th>' +
          '</tr></thead><tbody>' + filas + '</tbody></table></div>'
      })
    });
  }

  function modalTarea(p, materiaId) {
    var ops = opcionesMaterias(p);
    if (!ops.length) { U.toast('Primero crea una materia activa.', 'aviso'); return; }
    U.modal({
      titulo: 'Nueva tarea',
      sub: 'Se publica de inmediato y genera una entrega pendiente por alumno',
      ancho: 'ancho',
      cuerpo: form({
        accion: 'pr:guardarTarea', ok: 'Publicar tarea',
        cuerpo:
          campo({ tipo: 'selec', nombre: 'materiaId', etiqueta: 'Materia', opciones: ops, valor: materiaId || ops[0].v, col: 6, req: true }) +
          campo({ tipo: 'selec', nombre: 'tipo', etiqueta: 'Tipo', opciones: TIPOS_TAREA, valor: 'tarea', col: 6 }) +
          campo({ nombre: 'titulo', etiqueta: 'Título', req: true, col: 12, ph: 'Serie 8: aplicaciones de la derivada' }) +
          campo({ tipo: 'area', nombre: 'descripcion', etiqueta: 'Instrucciones', col: 12, filas: 4, req: true, ph: 'Qué hay que entregar y cómo se califica.' }) +
          campo({ tipo: 'date', nombre: 'vence', etiqueta: 'Vence el', valor: isoDe(HOY), req: true, col: 6 }) +
          campo({ tipo: 'number', nombre: 'puntos', etiqueta: 'Puntos', valor: 10, min: 1, max: 100, paso: 1, req: true, col: 6 })
      })
    });
  }

  function modalMaterial(p, materiaId) {
    var ops = opcionesMaterias(p);
    if (!ops.length) { U.toast('Primero crea una materia activa.', 'aviso'); return; }
    archivoTmp = null;
    U.modal({
      titulo: 'Subir material',
      sub: 'Queda disponible en el portal de los alumnos inscritos',
      cuerpo: form({
        accion: 'pr:guardarMaterial', ok: 'Subir material',
        cuerpo:
          campo({ tipo: 'selec', nombre: 'materiaId', etiqueta: 'Materia', opciones: ops, valor: materiaId || ops[0].v, col: 12, req: true }) +
          campo({ nombre: 'titulo', etiqueta: 'Título', req: true, col: 12, ph: 'Formulario de derivadas' }) +
          campo({ tipo: 'selec', nombre: 'tipo', etiqueta: 'Tipo', opciones: TIPOS_MATERIAL, valor: 'pdf', col: 12 }) +
          campo({ tipo: 'area', nombre: 'descripcion', etiqueta: 'Descripción', col: 12, filas: 3, ph: 'Para qué sirve y cuándo se usa.' }) +
          campo({
            tipo: 'file', id: 'pr-arch-material', etiqueta: 'Archivo', col: 12,
            accion: 'pr:archivoMaterial', acepta: '.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.csv,.txt',
            ayuda: 'Elige un archivo para tomar su nombre y su tamaño.', ayudaId: 'pr-arch-info'
          })
      })
    });
  }

  function modalResponder(r) {
    var m = Q.materia(r.materiaId);
    U.modal({
      titulo: 'Responder la reseña',
      sub: (m ? m.nombre + ' · ' : '') + U.fecha(r.fecha, 'larga'),
      cuerpo: '<div class="caja-suave mb-2">' + U.estrellas(r.estrellas) +
        '<p class="mt-1">' + esc(r.comentario) + '</p></div>' +
        form({
          accion: 'pr:responder', args: { id: r.id }, ok: 'Publicar respuesta',
          cuerpo: campo({
            tipo: 'area', nombre: 'texto', etiqueta: 'Mi respuesta', req: true, col: 12, filas: 4,
            valor: r.respuesta ? r.respuesta.texto : '',
            ayuda: 'Se publica junto con la reseña si está autorizada. Sé breve y concreto.'
          })
        })
    });
  }

  function modalFormacion() {
    U.modal({
      titulo: 'Agregar formación académica',
      cuerpo: form({
        accion: 'pr:agregarFormacion', ok: 'Agregar',
        cuerpo:
          campo({ nombre: 'grado', etiqueta: 'Grado o certificación', req: true, col: 12, ph: 'Maestría en Matemáticas Aplicadas' }) +
          campo({ nombre: 'institucion', etiqueta: 'Institución', req: true, col: 8, ph: 'CIMAT, Guanajuato' }) +
          campo({ nombre: 'anio', etiqueta: 'Año', req: true, col: 4, ph: '2013' })
      })
    });
  }

  function modalExperiencia() {
    U.modal({
      titulo: 'Agregar trayectoria',
      cuerpo: form({
        accion: 'pr:agregarExperiencia', ok: 'Agregar',
        cuerpo:
          campo({ nombre: 'puesto', etiqueta: 'Puesto', req: true, col: 12, ph: 'Coordinador del área de exactas' }) +
          campo({ nombre: 'lugar', etiqueta: 'Lugar', req: true, col: 6, ph: 'Colegio Altamira' }) +
          campo({ nombre: 'periodo', etiqueta: 'Periodo', req: true, col: 6, ph: '2019 – actual' }) +
          campo({ tipo: 'area', nombre: 'detalle', etiqueta: 'Detalle', col: 12, filas: 3, ph: 'Qué hiciste ahí.' })
      })
    });
  }

  /* Cierra el modal, avisa y vuelve a pintar. */
  function listo(mensaje) {
    U.cerrarModal();
    U.toast(mensaje, 'ok');
    App.refrescar();
  }
  function falla(r, alterno) {
    U.toast((r && r.error) || alterno || 'No se pudo completar la operación.', 'crit');
  }
  function avisarPesos(materiaId) {
    var s = sumaPesos(materiaId);
    if (Math.abs(s - 1) > 0.001) {
      U.toast('La suma de pesos de la materia es ' + s.toFixed(2) + '; debe cerrar en 1.00.', 'aviso');
    }
  }
  /* ========================================================== ACCIONES (pr:) */
  var acciones = {

    'pr:ir': function (a) {
      if (a && a.ruta) App.ir(a.ruta);
    },

    'pr:tabMateria': function (a, ev, el) {
      var tab = idDeArgs(a, el) || 'alumnos';
      var pm = (App.ctx() || {}).params || {};
      App.ir(ruta('materias', { id: pm.id, tab: tab }));
    },

    'pr:tabResenas': function (a, ev, el) {
      App.ir(ruta('resenas', { tab: idDeArgs(a, el) || 'pendientes' }));
    },

    /* ---- materias ---- */
    'pr:formMateria': function (a) {
      var m = a && a.id ? Q.materia(a.id) : null;
      modalMateria(yo(), m);
    },

    'pr:guardarMateria': function (a) {
      var p = yo(), d = (a && a.datos) || {};
      var nombre = (d.nombre || '').trim(), codigo = (d.codigo || '').trim().toUpperCase();
      var creditos = num(d.creditos, 0), cupo = num(d.cupo, 0);
      if (!nombre || !codigo) { U.toast('El nombre y el código son obligatorios.', 'crit'); return; }
      if (creditos < 1 || creditos > 20) { U.toast('Los créditos deben ir de 1 a 20.', 'crit'); return; }
      if (cupo < 1) { U.toast('El cupo debe ser al menos 1.', 'crit'); return; }
      var repetido = (DB.materias || []).filter(function (x) {
        return x.codigo.toUpperCase() === codigo && x.id !== (a && a.id);
      }).length > 0;
      if (repetido) { U.toast('Ya existe una materia con el código ' + codigo + '.', 'crit'); return; }
      var horario = leerHorario(d);
      if (!horario.length) { U.toast('Define al menos un bloque de horario completo.', 'crit'); return; }
      var choque = horario.filter(function (b) { return b.inicio >= b.fin; }).length > 0;
      if (choque) { U.toast('La hora de inicio debe ser anterior a la de término.', 'crit'); return; }

      var datos = {
        nombre: nombre, codigo: codigo, creditos: creditos, aula: (d.aula || '').trim(),
        cupo: cupo, descripcion: (d.descripcion || '').trim(),
        color: d.color || paleta()[0], horario: horario, profesorId: p.id
      };
      var r;
      if (a && a.id) {
        var actual = Q.materia(a.id);
        var inscritos = (Q.alumnosDeMateria(a.id) || []).length;
        if (cupo < inscritos) {
          U.toast('El cupo no puede ser menor que los ' + inscritos + ' alumnos ya inscritos.', 'crit');
          return;
        }
        datos.estatus = actual ? actual.estatus : 'activa';
        r = M.actualizarMateria(a.id, datos);
      } else {
        datos.estatus = 'activa';
        r = M.crearMateria(datos);
      }
      if (!r || !r.ok) { falla(r, 'No se pudo guardar la materia.'); return; }
      listo(a && a.id ? 'Materia actualizada.' : 'Materia creada y asignada a ti.');
    },

    'pr:pedirArchivar': function (a) {
      var m = Q.materia(a.id);
      if (!m) return;
      U.confirmar({
        titulo: 'Archivar ' + m.nombre,
        texto: 'La materia deja de aparecer como activa y ya no se puede capturar en ella. ' +
          'Las calificaciones y la asistencia se conservan.',
        textoOk: 'Archivar', peligro: true,
        accion: 'pr:archivarMateria', args: { id: m.id }
      });
    },

    'pr:archivarMateria': function (a) {
      var r = M.archivarMateria(a.id);
      if (!r || !r.ok) { falla(r, 'No se pudo archivar la materia.'); return; }
      listo('Materia archivada.');
    },

    /* ---- inscripciones ---- */
    'pr:formInscribir': function (a) { modalInscribir(yo(), a.materiaId); },

    'pr:inscribir': function (a) {
      var d = (a && a.datos) || {};
      if (!d.alumnoId) { U.toast('Elige un alumno.', 'crit'); return; }
      var r = M.inscribir(d.alumnoId, a.materiaId);
      if (!r || !r.ok) { falla(r, 'No se pudo inscribir al alumno.'); return; }
      listo('Alumno inscrito en la materia.');
    },

    'pr:pedirDesinscribir': function (a) {
      var al = Q.alumno(a.alumnoId), m = Q.materia(a.materiaId);
      if (!al || !m) return;
      U.confirmar({
        titulo: 'Dar de baja a ' + al.nombre,
        texto: 'Se retira de ' + m.nombre + '. Sus calificaciones de esta materia dejan de contar en su promedio.',
        textoOk: 'Dar de baja', peligro: true,
        accion: 'pr:desinscribir', args: { alumnoId: a.alumnoId, materiaId: a.materiaId }
      });
    },

    'pr:desinscribir': function (a) {
      var r = M.desinscribir(a.alumnoId, a.materiaId);
      if (!r || !r.ok) { falla(r, 'No se pudo dar de baja al alumno.'); return; }
      listo('Alumno dado de baja de la materia.');
    },

    /* ---- evaluaciones ---- */
    'pr:formEvaluacion': function (a) {
      var ev = a && a.id ? Q.evaluacion(a.id) : null;
      modalEvaluacion(yo(), a.materiaId, ev);
    },

    'pr:guardarEvaluacion': function (a) {
      var d = (a && a.datos) || {};
      var nombre = (d.nombre || '').trim();
      var peso = num(d.peso, 0);
      if (!nombre) { U.toast('Ponle nombre a la evaluación.', 'crit'); return; }
      if (peso <= 0 || peso > 1) { U.toast('El peso debe estar entre 0.01 y 1.00.', 'crit'); return; }
      if (!d.fecha) { U.toast('Elige la fecha de la evaluación.', 'crit'); return; }
      var otras = (Q.evaluacionesDeMateria(a.materiaId) || []).filter(function (e) {
        return !a.id || e.id !== a.id;
      });
      var usado = 0;
      otras.forEach(function (e) { usado += num(e.peso, 0); });
      if (usado + peso > 1.0001) {
        U.toast('La suma de pesos llegaría a ' + (usado + peso).toFixed(2) + '. No puede pasar de 1.00.', 'crit');
        return;
      }
      var datos = { nombre: nombre, tipo: d.tipo || 'parcial', peso: peso, fecha: d.fecha };
      var r = a.id ? M.actualizarEvaluacion(a.id, datos) : M.crearEvaluacion(a.materiaId, datos);
      if (!r || !r.ok) { falla(r, 'No se pudo guardar la evaluación.'); return; }
      listo(a.id ? 'Evaluación actualizada.' : 'Evaluación creada.');
      avisarPesos(a.materiaId);
    },

    'pr:pedirEliminarEval': function (a) {
      var e = Q.evaluacion(a.id);
      if (!e) return;
      U.confirmar({
        titulo: 'Eliminar ' + e.nombre,
        texto: 'Se borran también las calificaciones capturadas en esa evaluación. Esta acción no se deshace.',
        textoOk: 'Eliminar', peligro: true,
        accion: 'pr:eliminarEvaluacion', args: { id: e.id, materiaId: e.materiaId }
      });
    },

    'pr:eliminarEvaluacion': function (a) {
      var r = M.eliminarEvaluacion(a.id);
      if (!r || !r.ok) { falla(r, 'No se pudo eliminar la evaluación.'); return; }
      listo('Evaluación eliminada.');
      avisarPesos(a.materiaId);
    },

    /* ---- captura de calificaciones ---- */
    'pr:cambiarMateriaCalif': function (a, ev, el) {
      App.ir(ruta('calificaciones', { id: el.value }));
    },

    'pr:capturarNota': function (a, ev, el) {
      var crudo = (el.value || '').trim();
      var valor = crudo === '' ? '' : num(crudo, null);
      if (crudo !== '' && (valor == null || valor < 0 || valor > 10)) {
        U.toast('La calificación debe ir de 0 a 10.', 'crit');
        el.value = el.getAttribute('data-prev') || '';
        return;
      }
      var r = M.guardarNota(a.alumnoId, a.evaluacionId, valor);
      if (!r || !r.ok) {
        falla(r, 'No se pudo guardar la calificación.');
        el.value = el.getAttribute('data-prev') || '';
        return;
      }
      /* M.guardarNota persiste, y el arranque repinta la vista al guardar: la
         celda original puede haber quedado fuera del documento. Se vuelve a
         buscar en la tabla vigente y, si nadie repintó, se recupera la misma. */
      var tabla = document.getElementById('pr-tabla-notas');
      var celda = tabla ? tabla.querySelector('tr[data-fila="' + a.alumnoId +
        '"] input.celda-nota[data-eval="' + a.evaluacionId + '"]') : null;
      if (!celda) celda = el;
      celda.setAttribute('data-prev', celda.value);
      celda.classList.add('cambiada');
      var tr = celda.parentNode;
      while (tr && tr.tagName !== 'TR') { tr = tr.parentNode; }
      if (tabla) recalcularTabla(tabla, tr, a.evaluacionId);
    },

    'pr:formAsistencia': function (a) { modalAsistencia(yo(), a.materiaId); },

    'pr:guardarAsistencia': function (a) {
      var d = (a && a.datos) || {};
      var als = Q.alumnosDeMateria(a.materiaId) || [];
      /* Primero se valida todo: nada se escribe si un solo renglón está mal. */
      var filas = [], malos = 0, i;
      for (i = 0; i < als.length; i++) {
        var pres = num(d['p_' + als[i].id], 0), tot = num(d['t_' + als[i].id], 0);
        if (tot < 1 || pres < 0 || pres > tot) { malos++; continue; }
        filas.push({ id: als[i].id, pres: pres, tot: tot });
      }
      if (malos) {
        U.toast('Revisa ' + malos + (malos === 1 ? ' renglón: las presentes' : ' renglones: las presentes') +
          ' no pueden pasar de las totales y el total debe ser al menos 1.', 'crit');
        return;
      }
      var errores = 0, guardados = 0;
      for (i = 0; i < filas.length; i++) {
        var r = M.actualizarAsistencia(filas[i].id, a.materiaId, filas[i].pres, filas[i].tot);
        if (r && r.ok) guardados++; else errores++;
      }
      if (errores) { falla(null, 'No se pudo guardar la asistencia de ' + errores + ' alumnos.'); return; }
      listo('Asistencia guardada para ' + guardados +
        (guardados === 1 ? ' alumno.' : ' alumnos.'));
    },

    /* ---- tareas ---- */
    'pr:formTarea': function (a) { modalTarea(yo(), a && a.materiaId); },

    'pr:guardarTarea': function (a) {
      var d = (a && a.datos) || {};
      var titulo = (d.titulo || '').trim();
      if (!d.materiaId) { U.toast('Elige la materia.', 'crit'); return; }
      if (!titulo) { U.toast('Ponle título a la tarea.', 'crit'); return; }
      if (!(d.descripcion || '').trim()) { U.toast('Escribe las instrucciones de la tarea.', 'crit'); return; }
      if (!d.vence) { U.toast('Elige la fecha de vencimiento.', 'crit'); return; }
      var puntos = num(d.puntos, 0);
      if (puntos < 1) { U.toast('Los puntos deben ser al menos 1.', 'crit'); return; }
      var r = M.crearTarea(d.materiaId, {
        titulo: titulo, tipo: d.tipo || 'tarea', descripcion: (d.descripcion || '').trim(),
        vence: d.vence, puntos: puntos, publicadaEl: isoDe(HOY), archivo: null
      });
      if (!r || !r.ok) { falla(r, 'No se pudo publicar la tarea.'); return; }
      listo('Tarea publicada.');
    },

    'pr:entregaEstado': function (a, ev, el) {
      var tr = el.parentNode;
      while (tr && tr.tagName !== 'TR') { tr = tr.parentNode; }
      var inp = tr ? tr.querySelector('input.celda-nota') : null;
      var cal = inp && inp.value !== '' ? num(inp.value, null) : null;
      var r = M.marcarEntrega(a.tareaId, a.alumnoId, el.value, cal);
      if (!r || !r.ok) { falla(r, 'No se pudo actualizar la entrega.'); return; }
      U.toast('Entrega actualizada.', 'ok');
      App.refrescar();
    },

    'pr:entregaCalif': function (a, ev, el) {
      var crudo = (el.value || '').trim();
      var cal = crudo === '' ? null : num(crudo, null);
      if (crudo !== '' && (cal == null || cal < 0 || cal > 10)) {
        U.toast('La calificación de la entrega debe ir de 0 a 10.', 'crit');
        return;
      }
      var tr = el.parentNode;
      while (tr && tr.tagName !== 'TR') { tr = tr.parentNode; }
      var sel = tr ? tr.querySelector('select') : null;
      var estado = sel ? sel.value : 'revisada';
      if (crudo !== '' && estado !== 'revisada') estado = 'revisada';
      var r = M.marcarEntrega(a.tareaId, a.alumnoId, estado, cal);
      if (!r || !r.ok) { falla(r, 'No se pudo calificar la entrega.'); return; }
      U.toast('Entrega calificada.', 'ok');
      App.refrescar();
    },

    /* ---- materiales ---- */
    'pr:formMaterial': function (a) { modalMaterial(yo(), a && a.materiaId); },

    'pr:archivoMaterial': function (a, ev, el) {
      U.leerArchivo(el, function (arch) {
        if (!arch) return;
        archivoTmp = {
          nombre: arch.nombre,
          tamano: typeof arch.tamano === 'number' ? U.tamano(arch.tamano) : arch.tamano,
          url: arch.url
        };
        var info = document.getElementById('pr-arch-info');
        if (info) info.textContent = 'Seleccionado: ' + archivoTmp.nombre + ' · ' + archivoTmp.tamano;
        var tit = document.getElementById('cp-titulo');
        if (tit && !tit.value) tit.value = archivoTmp.nombre.replace(/\.[a-z0-9]+$/i, '');
      });
    },

    'pr:guardarMaterial': function (a) {
      var p = yo(), d = (a && a.datos) || {};
      var titulo = (d.titulo || '').trim();
      if (!d.materiaId) { U.toast('Elige la materia.', 'crit'); return; }
      if (!titulo) { U.toast('Ponle título al material.', 'crit'); return; }
      var r = M.subirMaterial(d.materiaId, {
        titulo: titulo, tipo: d.tipo || 'pdf', descripcion: (d.descripcion || '').trim(),
        tamano: archivoTmp ? archivoTmp.tamano : '—',
        url: archivoTmp ? archivoTmp.url : null,
        autorId: p.id, subidoEl: isoDe(HOY)
      });
      archivoTmp = null;
      if (!r || !r.ok) { falla(r, 'No se pudo subir el material.'); return; }
      listo('Material publicado.');
    },

    'pr:pedirEliminarMaterial': function (a) {
      var mt = (DB.materiales || []).filter(function (x) { return x.id === a.id; })[0];
      if (!mt) return;
      U.confirmar({
        titulo: 'Eliminar material',
        texto: '«' + mt.titulo + '» dejará de estar disponible para los alumnos.',
        textoOk: 'Eliminar', peligro: true,
        accion: 'pr:eliminarMaterial', args: { id: a.id }
      });
    },

    'pr:eliminarMaterial': function (a) {
      var r = M.eliminarMaterial(a.id);
      if (!r || !r.ok) { falla(r, 'No se pudo eliminar el material.'); return; }
      listo('Material eliminado.');
    },

    /* ---- alumnos ---- */
    'pr:buscarAlumno': function (a, ev, el) {
      var q = (el.value || '').toLowerCase().trim();
      var filas = document.querySelectorAll('#pr-tabla-alumnos tbody tr[data-busca]');
      var visibles = 0;
      for (var i = 0; i < filas.length; i++) {
        var t = filas[i].getAttribute('data-busca') || '';
        var oculta = q !== '' && t.indexOf(q) < 0;
        filas[i].classList.toggle('oculto', oculta);
        if (!oculta) visibles++;
      }
      var vacio = document.getElementById('pr-sin-resultados');
      if (vacio) vacio.classList.toggle('oculto', visibles > 0);
    },

    'pr:expediente': function (a) {
      var p = yo(), al = Q.alumno(a.alumnoId);
      if (!al) { U.toast('No encuentro a ese alumno.', 'crit'); return; }
      U.modal({
        titulo: 'Expediente conmigo',
        sub: al.nombre + ' · ' + al.matricula,
        ancho: 'ancho',
        cuerpo: expedienteHTML(p, al)
      });
    },

    'pr:guardarNotaAlumno': function (a) {
      var d = (a && a.datos) || {};
      var r = M.actualizarAlumno(a.alumnoId, { notas: (d.notas || '').trim() });
      if (!r || !r.ok) { falla(r, 'No se pudo guardar la nota.'); return; }
      listo('Nota del profesor guardada.');
    },

    /* ---- reseñas ---- */
    'pr:moderar': function (a) {
      var r = M.moderarResena(a.id, a.estado);
      if (!r || !r.ok) { falla(r, 'No se pudo moderar la reseña.'); return; }
      listo(a.estado === 'publica'
        ? 'Reseña autorizada: ya aparece en tu perfil público.'
        : 'Reseña oculta: deja de aparecer en el perfil público.');
    },

    'pr:formResponder': function (a) {
      var r = (DB.resenas || []).filter(function (x) { return x.id === a.id; })[0];
      if (!r) return;
      modalResponder(r);
    },

    'pr:responder': function (a) {
      var d = (a && a.datos) || {};
      var texto = (d.texto || '').trim();
      if (!texto) { U.toast('Escribe tu respuesta.', 'crit'); return; }
      var r = M.responderResena(a.id, texto);
      if (!r || !r.ok) { falla(r, 'No se pudo publicar la respuesta.'); return; }
      listo('Respuesta publicada.');
    },

    /* ---- avisos ---- */
    'pr:guardarAviso': function (a) {
      var p = yo(), d = (a && a.datos) || {};
      var titulo = (d.titulo || '').trim(), cuerpo = (d.cuerpo || '').trim();
      if (!titulo) { U.toast('Ponle título al aviso.', 'crit'); return; }
      if (!cuerpo) { U.toast('Escribe el mensaje del aviso.', 'crit'); return; }
      var esEscuela = !d.destino || d.destino === 'escuela';
      var r = M.publicarAviso({
        autorId: p.id, autorRol: 'profesor',
        ambito: esEscuela ? 'escuela' : 'materia',
        materiaId: esEscuela ? null : d.destino,
        titulo: titulo, cuerpo: cuerpo,
        prioridad: d.prioridad === 'alta' ? 'alta' : 'normal',
        fecha: isoDe(HOY)
      });
      if (!r || !r.ok) { falla(r, 'No se pudo publicar el aviso.'); return; }
      U.toast('Aviso publicado.', 'ok');
      App.refrescar();
    },

    /* ---- perfil ---- */
    'pr:archivoFoto': function (a, ev, el) {
      var p = yo();
      U.leerArchivo(el, function (arch) {
        if (!arch || !arch.url) { U.toast('No se pudo leer la imagen.', 'crit'); return; }
        var r = M.subirFoto('profesor', p.id, arch.url);
        if (!r || !r.ok) { falla(r, 'No se pudo guardar la foto.'); return; }
        U.toast('Foto actualizada.', 'ok');
        App.refrescar();
      });
    },

    'pr:quitarFoto': function () {
      var p = yo();
      var r = M.subirFoto('profesor', p.id, null);
      if (!r || !r.ok) { falla(r, 'No se pudo quitar la foto.'); return; }
      U.toast('Foto retirada: vuelven tus iniciales.', 'ok');
      App.refrescar();
    },

    'pr:archivoCV': function (a, ev, el) {
      var p = yo();
      U.leerArchivo(el, function (arch) {
        if (!arch) { U.toast('No se pudo leer el archivo.', 'crit'); return; }
        var r = M.subirCV(p.id, {
          nombre: arch.nombre,
          tamano: typeof arch.tamano === 'number' ? U.tamano(arch.tamano) : arch.tamano,
          url: arch.url,
          actualizado: isoDe(HOY)
        });
        if (!r || !r.ok) { falla(r, 'No se pudo guardar el currículum.'); return; }
        U.toast('Currículum actualizado.', 'ok');
        App.refrescar();
      });
    },

    'pr:descargarCV': function () {
      U.toast('Esta demostración no descarga archivos: el currículum es de muestra.', 'aviso');
    },

    'pr:guardarPerfil': function (a) {
      var p = yo(), d = (a && a.datos) || {};
      var titulo = (d.titulo || '').trim();
      if (!titulo) { U.toast('El título profesional es obligatorio.', 'crit'); return; }
      var areas = (d.areas || '').split(',').map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });
      var r = M.actualizarPerfilProfesor(p.id, {
        titulo: titulo,
        bio: (d.bio || '').trim(),
        telefono: (d.telefono || '').trim(),
        oficina: (d.oficina || '').trim(),
        horarioAsesoria: (d.horarioAsesoria || '').trim(),
        areas: areas,
        perfilPublico: !!d.perfilPublico
      });
      if (!r || !r.ok) { falla(r, 'No se pudo guardar el perfil.'); return; }
      U.toast('Perfil actualizado.', 'ok');
      App.refrescar();
    },

    'pr:formFormacion': function () { modalFormacion(); },

    'pr:agregarFormacion': function (a) {
      var p = yo(), d = (a && a.datos) || {};
      var grado = (d.grado || '').trim(), inst = (d.institucion || '').trim(), anio = (d.anio || '').trim();
      if (!grado || !inst || !anio) { U.toast('Completa grado, institución y año.', 'crit'); return; }
      var lista = (p.formacion || []).slice();
      lista.push({ grado: grado, institucion: inst, anio: anio });
      var r = M.actualizarPerfilProfesor(p.id, { formacion: lista });
      if (!r || !r.ok) { falla(r, 'No se pudo agregar la formación.'); return; }
      listo('Formación agregada.');
    },

    'pr:pedirEliminarFormacion': function (a) {
      var p = yo(), f = (p.formacion || [])[a.i];
      if (!f) return;
      U.confirmar({
        titulo: 'Eliminar formación',
        texto: '«' + f.grado + '» dejará de aparecer en tu perfil público.',
        textoOk: 'Eliminar', peligro: true,
        accion: 'pr:eliminarFormacion', args: { i: a.i }
      });
    },

    'pr:eliminarFormacion': function (a) {
      var p = yo();
      var lista = (p.formacion || []).slice();
      lista.splice(a.i, 1);
      var r = M.actualizarPerfilProfesor(p.id, { formacion: lista });
      if (!r || !r.ok) { falla(r, 'No se pudo eliminar la formación.'); return; }
      listo('Formación eliminada.');
    },

    'pr:formExperiencia': function () { modalExperiencia(); },

    'pr:agregarExperiencia': function (a) {
      var p = yo(), d = (a && a.datos) || {};
      var puesto = (d.puesto || '').trim(), lugar = (d.lugar || '').trim(), periodo = (d.periodo || '').trim();
      if (!puesto || !lugar || !periodo) { U.toast('Completa puesto, lugar y periodo.', 'crit'); return; }
      var lista = (p.experiencia || []).slice();
      lista.push({ puesto: puesto, lugar: lugar, periodo: periodo, detalle: (d.detalle || '').trim() });
      var r = M.actualizarPerfilProfesor(p.id, { experiencia: lista });
      if (!r || !r.ok) { falla(r, 'No se pudo agregar la trayectoria.'); return; }
      listo('Trayectoria agregada.');
    },

    'pr:pedirEliminarExperiencia': function (a) {
      var p = yo(), x = (p.experiencia || [])[a.i];
      if (!x) return;
      U.confirmar({
        titulo: 'Eliminar trayectoria',
        texto: '«' + x.puesto + '» dejará de aparecer en tu perfil público.',
        textoOk: 'Eliminar', peligro: true,
        accion: 'pr:eliminarExperiencia', args: { i: a.i }
      });
    },

    'pr:eliminarExperiencia': function (a) {
      var p = yo();
      var lista = (p.experiencia || []).slice();
      lista.splice(a.i, 1);
      var r = M.actualizarPerfilProfesor(p.id, { experiencia: lista });
      if (!r || !r.ok) { falla(r, 'No se pudo eliminar la trayectoria.'); return; }
      listo('Trayectoria eliminada.');
    }
  };

  /* ============================================================== LA VISTA */
  return {
    titulo: 'Panel del profesor',
    nav: [
      { id: 'resumen', texto: 'Resumen', icono: 'casa' },
      { id: 'materias', texto: 'Materias', icono: 'libro' },
      { id: 'calificaciones', texto: 'Calificaciones', icono: 'grafica' },
      { id: 'tareas', texto: 'Tareas', icono: 'portapapeles' },
      { id: 'materiales', texto: 'Materiales', icono: 'archivo' },
      { id: 'alumnos', texto: 'Alumnos', icono: 'usuarios' },
      { id: 'resenas', texto: 'Reseñas', icono: 'estrella' },
      { id: 'avisos', texto: 'Avisos', icono: 'campana' },
      { id: 'perfil', texto: 'Mi perfil', icono: 'usuario' }
    ],
    acciones: acciones,
    render: function (ctx) {
      var c = ctx || {};
      var p = c.persona || Sesion.persona();
      if (!p || p.rol !== 'profesor') {
        return '<div class="contenedor">' + U.vacio({
          icono: 'candado', titulo: 'Sesión no válida',
          texto: 'Vuelve a entrar como profesor para ver este panel.'
        }) + '</div>';
      }
      var s = c.seccion || 'resumen';
      if (s === 'materias') return verMaterias(p, c);
      if (s === 'calificaciones') return verCalificaciones(p, c);
      if (s === 'tareas') return verTareas(p, c);
      if (s === 'materiales') return verMateriales(p, c);
      if (s === 'alumnos') return verAlumnos(p);
      if (s === 'resenas') return verResenas(p, c);
      if (s === 'avisos') return verAvisos(p);
      if (s === 'perfil') return verPerfil(p);
      return verResumen(p);
    }
  };

})();
