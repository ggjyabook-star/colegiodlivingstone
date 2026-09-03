/* ============================================================================
   80-direccion.js — Panel de la dirección: gobierno de todo el colegio.
   Declara: const VistaDireccion
   ========================================================================== */

const VistaDireccion = (function () {

  /* ---------------------------------------------------------------- apoyos */

  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  var METODOS = ['Transferencia SPEI', 'Tarjeta de débito', 'Depósito en ventanilla', 'Domiciliación'];

  /* Estado de los filtros de la vista; sobrevive a App.refrescar(). */
  var estado = {
    seccion: null,
    foco: null,
    qAlumno: '',
    fEstatus: 'todos',
    fPagoEstado: 'todos',
    fPagoAlumno: 'todos',
    fResProfesor: 'todos',
    fResEstado: 'todas'
  };

  function esc(v) { return U.esc(v); }

  function isoHoy() {
    var m = HOY.getMonth() + 1, d = HOY.getDate();
    return HOY.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function num(v) { var n = Number(v); return isNaN(n) ? 0 : n; }

  /* kpisEscuela puede entregar el porcentaje suelto o dentro de {pct}. */
  function pctNum(v) {
    if (v && typeof v === 'object') return Math.round(num(v.pct));
    return Math.round(num(v));
  }

  function varPct(n, alto, medio) { return n >= alto ? 'ok' : (n >= medio ? 'aviso' : 'crit'); }

  /* Devuelve '' cuando no hay nota: U.kpi omite la clase y no se pide una
     variante .v-neutro, que no existe en la hoja de estilo. */
  function varNota(n) {
    if (n === null || n === undefined) return '';
    return n >= 8 ? 'ok' : (n >= 6 ? 'aviso' : 'crit');
  }

  function nota(n) {
    if (n === null || n === undefined || isNaN(Number(n))) return '<span class="silencio">—</span>';
    return '<span class="' + U.claseNota(n) + '">' + esc(U.notaTexto(n)) + '</span>';
  }

  function fmtPct(v) { return v + '%'; }

  function mesLargo(periodo) {
    var p = String(periodo || '').split('-');
    var m = parseInt(p[1], 10);
    if (!p[0] || isNaN(m) || m < 1 || m > 12) return String(periodo || '—');
    var t = MESES[m - 1];
    return t.charAt(0).toUpperCase() + t.slice(1) + ' ' + p[0];
  }

  /* Persona (de cualquier rol) por id, para bitácora y autorías. */
  function quien(id) {
    if (!id) return null;
    if (DB.direccion && DB.direccion.id === id) return DB.direccion;
    var r = null;
    DB.profesores.forEach(function (x) { if (x.id === id) r = x; });
    if (r) return r;
    DB.alumnos.forEach(function (x) { if (x.id === id) r = x; });
    return r;
  }

  function badgeEstatusAlumno(e) {
    if (e === 'activo') return U.badge('Activo', 'ok');
    if (e === 'condicionado') return U.badge('Condicionado', 'aviso');
    if (e === 'baja') return U.badge('Baja', 'crit');
    return U.badge('Sin estatus', 'neutro');
  }

  function badgePago(e) {
    if (e === 'pagado') return U.badge('Pagado', 'ok');
    if (e === 'vencido') return U.badge('Vencido', 'crit');
    return U.badge('Pendiente', 'aviso');
  }

  function badgeResena(e) {
    if (e === 'publica') return U.badge('Publicada', 'ok');
    if (e === 'oculta') return U.badge('Oculta', 'neutro');
    return U.badge('Pendiente', 'aviso');
  }

  function severidad(s) {
    return (s === 'alta' || s === 'media' || s === 'baja') ? s : 'media';
  }

  function celdaPersona(p, sub) {
    if (!p) return '<span class="silencio">—</span>';
    return '<div class="fila">' + U.avatar(p, 'sm') +
      '<div class="crece"><div class="truncar"><strong>' + esc(p.nombre) + '</strong></div>' +
      (sub ? '<small class="silencio">' + sub + '</small>' : '') + '</div></div>';
  }

  function materiasActivas() {
    return DB.materias.filter(function (m) { return m.estatus !== 'archivada'; });
  }

  function opciones(lista, sel) {
    return lista.map(function (o) {
      var v = String(o.v);
      return '<option value="' + esc(v) + '"' + (v === String(sel) ? ' selected' : '') + '>' + esc(o.t) + '</option>';
    }).join('');
  }

  function opcionesProfesor(sel) {
    return opciones(DB.profesores.map(function (p) { return { v: p.id, t: p.nombre }; }), sel);
  }

  /* ------------------------------------------------------- campos de forma */

  function campo(c) {
    var id = c.id || ('cmp-' + c.nombre);
    var req = c.requerido ? ' required' : '';
    var marca = c.requerido ? ' <span class="campo-req">*</span>' : '';
    var val = (c.valor === null || c.valor === undefined) ? '' : c.valor;
    var ctrl;
    if (c.tipo === 'area') {
      ctrl = '<textarea class="area" id="' + id + '" name="' + esc(c.nombre) + '" rows="' + (c.filas || 4) + '"' +
        (c.placeholder ? ' placeholder="' + esc(c.placeholder) + '"' : '') + req + '>' + esc(val) + '</textarea>';
    } else if (c.tipo === 'selec') {
      ctrl = '<select class="selec" id="' + id + '" name="' + esc(c.nombre) + '"' + req + '>' +
        opciones(c.opciones || [], val) + '</select>';
    } else {
      ctrl = '<input class="entrada" id="' + id + '" name="' + esc(c.nombre) + '" type="' + esc(c.tipo || 'text') +
        '" value="' + esc(val) + '"' +
        (c.placeholder ? ' placeholder="' + esc(c.placeholder) + '"' : '') +
        (c.min !== undefined ? ' min="' + esc(c.min) + '"' : '') +
        (c.max !== undefined ? ' max="' + esc(c.max) + '"' : '') +
        (c.paso !== undefined ? ' step="' + esc(c.paso) + '"' : '') + req + '>';
    }
    return '<div class="campo ' + (c.col || 'col-12') + '">' +
      '<label class="campo-etiqueta" for="' + id + '">' + esc(c.etiqueta) + marca + '</label>' + ctrl +
      (c.ayuda ? '<span class="campo-ayuda">' + esc(c.ayuda) + '</span>' : '') + '</div>';
  }

  function casilla(nombre, etiqueta, marcada) {
    return '<div class="campo col-12"><label class="checa"><input type="checkbox" name="' + esc(nombre) + '"' +
      (marcada ? ' checked' : '') + '><span>' + esc(etiqueta) + '</span></label></div>';
  }

  function forma(cfg) {
    return '<form data-envio="' + cfg.accion + '"' +
      (cfg.args ? ' ' + U.attr({ 'data-args': cfg.args }) : '') + '>' +
      '<div class="form-rejilla">' + cfg.campos + '</div>' +
      '<div class="form-acciones">' + (cfg.acciones || '') + '</div></form>';
  }

  function btnCancelar() {
    return '<button type="button" class="btn" data-accion="app:cerrarModal">Cancelar</button>';
  }

  function btnEnviar(texto) {
    return '<button type="submit" class="btn btn-primario">' + esc(texto) + '</button>';
  }

  function tabla(columnas, filas, vacio) {
    return '<div class="tabla-envoltura">' +
      U.tabla({ columnas: columnas, filas: filas, vacio: vacio }) + '</div>';
  }

  /* Cierra, avisa y repinta tras una mutación. Devuelve true si salió bien. */
  function tras(r, mensaje) {
    if (!r || !r.ok) {
      U.toast((r && r.error) || 'No se pudo completar la operación.', 'crit');
      return false;
    }
    U.cerrarModal();
    U.toast(mensaje, 'ok');
    App.refrescar();
    return true;
  }

  function noEncontrado(titulo, texto, ruta, textoRuta) {
    return U.seccion({
      titulo: titulo,
      cuerpo: U.panel({
        cuerpo: U.vacio({
          icono: 'alerta', titulo: titulo, texto: texto,
          accion: '<a class="btn btn-primario" href="' + ruta + '">' + esc(textoRuta) + '</a>'
        })
      })
    });
  }

  /* --------------------------------------------------------- cálculo común */

  function alumnosDeProfesor(profesorId) {
    var vistos = {};
    Q.materiasDeProfesor(profesorId).forEach(function (m) {
      (Q.alumnosDeMateria(m.id) || []).forEach(function (a) { vistos[a.id] = 1; });
    });
    return Object.keys(vistos).length;
  }

  function promedioProfesor(profesorId) {
    var suma = 0, n = 0;
    Q.materiasDeProfesor(profesorId).forEach(function (m) {
      var p = Q.promedioGrupo(m.id);
      if (p !== null && p !== undefined) { suma += p; n++; }
    });
    return n ? Math.round(suma / n * 10) / 10 : null;
  }

  function asistenciaDeMateria(materiaId) {
    var pres = 0, tot = 0;
    (Q.alumnosDeMateria(materiaId) || []).forEach(function (a) {
      var x = Q.asistencia(a.id, materiaId) || {};
      pres += num(x.presentes); tot += num(x.totales);
    });
    return tot ? Math.round(pres / tot * 100) : 0;
  }

  /* Captura de calificaciones: lo que la dirección vigila de verdad. */
  function capturaMateria(m) {
    var evs = Q.evaluacionesDeMateria(m.id) || [];
    var als = Q.alumnosDeMateria(m.id) || [];
    var hoy = isoHoy();
    var debidas = evs.filter(function (e) { return String(e.fecha) <= hoy; });
    var esperadas = debidas.length * als.length;
    var hechas = 0;
    debidas.forEach(function (e) {
      als.forEach(function (a) { if (Q.nota(a.id, e.id)) hechas++; });
    });
    return {
      esperadas: esperadas, hechas: hechas,
      totalCiclo: evs.length * als.length,
      evaluaciones: evs.length, debidas: debidas.length, alumnos: als.length,
      pct: esperadas ? Math.round(hechas / esperadas * 100) : 100
    };
  }

  function estadoCuenta(a) {
    var ps = Q.pagosDeAlumno(a.id) || [];
    var total = 0, pagado = 0, ultimo = null;
    ps.forEach(function (p) {
      total += num(p.monto) + num(p.recargo);
      if (p.estado === 'pagado') {
        pagado += num(p.monto);
        if (p.pagadoEl && (!ultimo || p.pagadoEl > ultimo)) ultimo = p.pagadoEl;
      }
    });
    var ad = Q.adeudo(a.id) || {};
    return { total: total, pagado: pagado, adeudo: num(ad.total), ultimo: ultimo, pagos: ps };
  }

  /* Periodos mensuales del ciclo, a partir del ciclo declarado por la escuela. */
  function periodosCiclo() {
    var anio = parseInt((String(DB.escuela.ciclo || '').match(/\d{4}/) || ['2025'])[0], 10);
    var lista = [], y = anio, m = 8, i;
    for (i = 0; i < 11; i++) {
      lista.push(y + '-' + (m < 10 ? '0' : '') + m);
      m++; if (m > 12) { m = 1; y++; }
    }
    return lista;
  }

  /* --------------------------------------------------------------- gráficas */

  /* Un renglón por mes: lo cobrado avanzando sobre lo esperado. Se lee de un
     vistazo qué mes quedó corto, que es justo lo que revisa la dirección. */
  function graficaIngresos() {
    var meses = Q.ingresosPorMes() || [];
    if (!meses.length) {
      return U.vacio({ icono: 'dinero', titulo: 'Sin movimientos', texto: 'Todavía no hay colegiaturas generadas en el ciclo.' });
    }
    var totalC = 0, totalE = 0;
    var filas = meses.map(function (m) {
      var c = num(m.cobrado), e = num(m.esperado);
      totalC += c; totalE += e;
      var pct = e > 0 ? Math.round(c / e * 100) : 0;
      var v = pct >= 100 ? 'ok' : (pct >= 70 ? 'aviso' : 'crit');
      return '<div style="display:grid;grid-template-columns:88px 1fr auto;align-items:center;gap:.75rem">' +
        '<span class="etiqueta" style="text-transform:none;letter-spacing:0;font-size:.8rem;color:var(--tinta-2)">' +
          U.esc(m.etiqueta) + '</span>' +
        '<div class="progreso" title="' + U.esc(U.moneda(c) + ' de ' + U.moneda(e)) + '">' +
          '<div class="progreso-barra v-' + v + '" style="width:' + Math.min(100, pct) + '%"></div></div>' +
        '<span class="mono nowrap" style="color:var(--tinta-2)">' +
          U.moneda(c) + ' <span class="silencio">/ ' + U.moneda(e) + '</span></span>' +
        '</div>';
    }).join('');

    var pctTotal = totalE > 0 ? Math.round(totalC / totalE * 100) : 0;
    return '<div class="pila gap-1">' + filas + '</div>' +
      '<div class="separador"></div>' +
      '<div class="entre">' +
        '<span class="etiqueta">Total del ciclo</span>' +
        '<span class="fila gap-1">' +
          U.badge(pctTotal + '% cobrado', pctTotal >= 90 ? 'ok' : (pctTotal >= 70 ? 'aviso' : 'crit')) +
          '<span class="mono">' + U.moneda(totalC) + ' <span class="silencio">/ ' + U.moneda(totalE) + '</span></span>' +
        '</span>' +
      '</div>';
  }

  function graficaPromedioMaterias() {
    var series = materiasActivas().map(function (m) {
      var p = Q.promedioGrupo(m.id);
      return { etiqueta: m.nombre, valor: (p === null || p === undefined) ? 0 : p, color: m.color || 'var(--marca)' };
    });
    return U.barras({ series: series, max: 10, meta: 8, formato: U.notaTexto });
  }

  function dineroDato(etiqueta, valor, clase) {
    return '<div class="dato"><span class="e">' + esc(etiqueta) + '</span>' +
      '<span class="v ' + (clase || '') + '"><strong>' + U.moneda(valor) + '</strong></span></div>';
  }

  /* ============================================================ RESUMEN ==== */

  function seccionResumen() {
    var k = Q.kpisEscuela() || {};
    var asis = pctNum(k.asistencia);
    var cumpl = pctNum(k.cumplimientoPct);
    var prom = (k.promedioGeneral === null || k.promedioGeneral === undefined) ? null : k.promedioGeneral;
    var h = [];

    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Alumnos activos', icono: 'usuarios', variante: 'marca',
      valor: num(k.alumnos), sub: DB.alumnos.length + ' en el padrón completo',
      pie: 'Altas, condicionados y bajas en la sección Alumnos'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Personas docentes', icono: 'birrete', variante: 'marca',
      valor: num(k.profesores), sub: 'Claustro del ciclo ' + esc(DB.escuela.ciclo),
      pie: 'Cada quien con su perfil público y sus reseñas'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Materias del ciclo', icono: 'libro', variante: 'marca',
      valor: num(k.materias), sub: DB.inscripciones.length + ' inscripciones vigentes',
      pie: 'Horario semanal completo en la sección Materias'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Promedio general', icono: 'grafica', variante: varNota(prom),
      valor: U.notaTexto(prom), sub: 'Escala 0 a 10 · mínima aprobatoria 6.0',
      pie: 'Promedio de los promedios por materia'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Asistencia global', icono: 'cheque', variante: varPct(asis, 90, 80),
      valor: asis + '%', sub: 'Todas las materias del ciclo',
      pie: 'Se calcula sobre sesiones impartidas'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Cobranza', icono: 'dinero', variante: varPct(cumpl, 90, 75),
      valor: cumpl + '%', sub: U.moneda(num(k.cobrado)) + ' cobrados',
      pie: U.moneda(num(k.vencido)) + ' vencidos al día de hoy'
    }) + '</div>');

    /* Ingresos del ciclo */
    h.push('<div class="col-8">' + U.panel({
      titulo: 'Ingresos del ciclo',
      sub: 'Cobrado contra esperado, mes por mes',
      acciones: '<a class="btn btn-sm btn-suave" href="#/direccion/finanzas">Ir a finanzas</a>',
      cuerpo: graficaIngresos() +
        '<div class="separador"></div>' +
        '<div class="datos-rejilla">' +
        dineroDato('Total cobrado', num(k.cobrado)) +
        dineroDato('Por cobrar', num(k.porCobrar)) +
        dineroDato('Vencido', num(k.vencido), 'nota-baja') +
        '</div>'
    }) + '</div>');

    /* Reseñas por autorizar */
    var pendTotal = 0;
    var filasRes = DB.profesores.map(function (p) {
      var pend = (Q.resenasDeProfesor(p.id, 'pendiente') || []).length;
      pendTotal += pend;
      return '<li class="lista-item">' + U.avatar(p, 'sm') +
        '<div class="crece"><div class="truncar"><strong>' + esc(p.nombre) + '</strong></div>' +
        '<small class="silencio">' + esc(p.titulo || '') + '</small></div>' +
        (pend ? U.badge(pend + (pend === 1 ? ' pendiente' : ' pendientes'), 'aviso') : U.badge('Al día', 'ok')) +
        '<button type="button" class="btn btn-sm" data-accion="dir:verResenasDe" ' +
        U.attr({ 'data-args': { id: p.id } }) + '>Ver</button></li>';
    }).join('');

    h.push('<div class="col-4">' + U.panel({
      titulo: 'Reseñas por autorizar',
      sub: pendTotal ? 'Hay retroalimentación detenida' : 'Nada detenido',
      cuerpo: '<ul class="lista">' + filasRes + '</ul>' +
        '<div class="separador"></div>' +
        '<small class="silencio">La dirección las ve todas; publicarlas ' +
        'corresponde únicamente a la persona docente.</small>'
    }) + '</div>');

    /* Alumnos en riesgo */
    h.push('<div class="col-12">' + U.panel({
      titulo: 'Alumnos que requieren atención',
      sub: 'Promedio bajo, asistencia irregular o adeudo vencido',
      cuerpo: panelRiesgo()
    }) + '</div>');

    /* Promedio por materia */
    h.push('<div class="col-6">' + U.panel({
      titulo: 'Promedio por materia',
      sub: 'Meta institucional: 8.0',
      cuerpo: graficaPromedioMaterias()
    }) + '</div>');

    /* Actividad reciente */
    var bit = DB.bitacora.slice().sort(function (a, b) {
      return a.fecha < b.fecha ? 1 : (a.fecha > b.fecha ? -1 : 0);
    }).slice(0, 8);
    var filasBit = bit.length ? bit.map(function (b) {
      var p = quien(b.actorId);
      return '<li class="lista-item">' + (p ? U.avatar(p, 'sm') : U.icono('punto', 18)) +
        '<div class="crece"><div class="t">' + esc(b.texto) + '</div>' +
        '<div class="d">' + esc(p ? p.nombre : 'Sistema') + ' · ' + esc(U.fecha(b.fecha, 'relativa')) + '</div>' +
        '</div></li>';
    }).join('') : '';

    h.push('<div class="col-6">' + U.panel({
      titulo: 'Actividad reciente',
      sub: 'Últimos movimientos registrados en la bitácora',
      cuerpo: filasBit ? '<ul class="lista">' + filasBit + '</ul>' :
        U.vacio({ icono: 'portapapeles', titulo: 'Sin movimientos', texto: 'La bitácora se llena conforme se opera el colegio.' })
    }) + '</div>');

    return U.seccion({
      titulo: 'Tablero de dirección',
      sub: DB.escuela.nombre + ' · Ciclo ' + DB.escuela.ciclo + ' · Corte al ' + U.fecha(isoHoy(), 'larga'),
      cuerpo: '<div class="rejilla">' + h.join('') + '</div>'
    });
  }

  function panelRiesgo() {
    var lista = Q.riesgo() || [];
    if (!lista.length) {
      return U.vacio({
        icono: 'cheque', titulo: 'Nadie en riesgo hoy',
        texto: 'Ningún alumno cruza los umbrales de promedio, asistencia o adeudo.'
      });
    }
    var filas = lista.map(function (r) {
      var a = r.alumno;
      var sev = severidad(r.severidad);
      var prom = Q.promedioGeneral(a.id);
      var as = Q.asistencia(a.id) || {};
      var ad = Q.adeudo(a.id) || {};
      var badge = sev === 'alta' ? U.badge('Alta', 'crit') : (sev === 'media' ? U.badge('Media', 'aviso') : U.badge('Baja', 'ok'));
      return {
        alumno: '<div class="franja-riesgo ' + sev + '">' + celdaPersona(a, esc(a.matricula)) + '</div>',
        severidad: badge,
        motivo: '<span>' + esc(r.motivo) + '</span>',
        promedio: nota(prom),
        asistencia: '<span class="mono">' + pctNum(as.pct) + '%</span>',
        adeudo: num(ad.total) ? '<span class="nota-baja mono">' + U.moneda(num(ad.total)) + '</span>' : '<span class="silencio">—</span>',
        acciones: '<a class="btn btn-sm" href="#/direccion/alumnos?id=' + esc(a.id) + '">Expediente</a>'
      };
    });
    return tabla([
      { clave: 'alumno', titulo: 'Alumno', html: true },
      { clave: 'severidad', titulo: 'Severidad', html: true },
      { clave: 'motivo', titulo: 'Motivo', html: true },
      { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
      { clave: 'asistencia', titulo: 'Asistencia', align: 'num', html: true },
      { clave: 'adeudo', titulo: 'Adeudo', align: 'num', html: true },
      { clave: 'acciones', titulo: '', align: 'num', html: true }
    ], filas, 'Sin alumnos en riesgo.');
  }

  /* ============================================================ ALUMNOS ==== */

  function alumnosFiltrados() {
    var q = estado.qAlumno.trim().toLowerCase();
    return DB.alumnos.filter(function (a) {
      if (estado.fEstatus !== 'todos' && a.estatus !== estado.fEstatus) return false;
      if (!q) return true;
      return (a.nombre + ' ' + a.matricula + ' ' + a.email).toLowerCase().indexOf(q) >= 0;
    });
  }

  function seccionAlumnos() {
    var lista = alumnosFiltrados();
    var filas = lista.map(function (a) {
      var as = Q.asistencia(a.id) || {};
      var ad = Q.adeudo(a.id) || {};
      var pctAs = pctNum(as.pct);
      var deuda = num(ad.total);
      return {
        alumno: celdaPersona(a, esc(a.email)),
        matricula: '<span class="mono">' + esc(a.matricula) + '</span>',
        materias: '<span class="mono">' + Q.materiasDeAlumno(a.id).length + '</span>',
        promedio: nota(Q.promedioGeneral(a.id)),
        asistencia: '<span class="' + (pctAs >= 90 ? 'nota-alta' : (pctAs >= 80 ? 'nota-media' : 'nota-baja')) + '">' + pctAs + '%</span>',
        adeudo: deuda ? '<span class="nota-baja mono">' + U.moneda(deuda) + '</span>' : '<span class="silencio">Al corriente</span>',
        estatus: badgeEstatusAlumno(a.estatus) + (num(a.becaPct) ? ' ' + U.chip('Beca ' + num(a.becaPct) + '%') : ''),
        acciones: '<div class="fila gap-1">' +
          '<a class="btn btn-sm" href="#/direccion/alumnos?id=' + esc(a.id) + '">Expediente</a>' +
          '<button type="button" class="btn btn-sm btn-icono" aria-label="Editar a ' + esc(a.nombre) + '" ' +
          'data-accion="dir:editarAlumno" ' + U.attr({ 'data-args': { id: a.id } }) + '>' + U.icono('lapiz', 15) + '</button>' +
          '<button type="button" class="btn btn-sm btn-icono" aria-label="Cambiar el estatus de ' + esc(a.nombre) + '" ' +
          'data-accion="dir:menuEstatus" ' + U.attr({ 'data-args': { id: a.id } }) + '>' + U.icono('escudo', 15) + '</button>' +
          '</div>'
      };
    });

    var controles = '<div class="fila envuelve mb-2">' +
      '<div class="buscador crece">' + U.icono('buscar', 16) +
      '<input class="entrada" id="dir-busca-alumno" type="search" value="' + esc(estado.qAlumno) + '" ' +
      'placeholder="Buscar por nombre, matrícula o correo" aria-label="Buscar alumno" data-entrada="dir:buscarAlumno">' +
      '</div>' +
      '<select class="selec" style="width:auto;min-width:190px" aria-label="Filtrar por estatus" data-cambio="dir:filtroEstatus">' +
      opciones([
        { v: 'todos', t: 'Todos los estatus' },
        { v: 'activo', t: 'Sólo activos' },
        { v: 'condicionado', t: 'Sólo condicionados' },
        { v: 'baja', t: 'Sólo bajas' }
      ], estado.fEstatus) + '</select>' +
      '<span class="chip">' + lista.length + ' de ' + DB.alumnos.length + '</span>' +
      '</div>';

    return U.seccion({
      titulo: 'Alumnos',
      sub: 'Padrón completo del colegio, con promedio, asistencia y estado de cuenta',
      acciones: '<button type="button" class="btn btn-primario" data-accion="dir:nuevoAlumno">' +
        U.icono('mas', 16) + ' Nuevo alumno</button>',
      cuerpo: U.panel({
        cuerpo: controles + tabla([
          { clave: 'alumno', titulo: 'Alumno', html: true },
          { clave: 'matricula', titulo: 'Matrícula', html: true },
          { clave: 'materias', titulo: 'Materias', align: 'num', html: true },
          { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
          { clave: 'asistencia', titulo: 'Asistencia', align: 'num', html: true },
          { clave: 'adeudo', titulo: 'Adeudo', align: 'num', html: true },
          { clave: 'estatus', titulo: 'Estatus', html: true },
          { clave: 'acciones', titulo: '', align: 'num', html: true }
        ], filas, 'Ningún alumno coincide con la búsqueda.')
      })
    });
  }

  function camposAlumno(a) {
    a = a || {};
    var t = a.tutor || {};
    return campo({ nombre: 'nombre', etiqueta: 'Nombre completo', valor: a.nombre, requerido: true, col: 'col-12', id: 'al-nombre' }) +
      campo({ nombre: 'email', tipo: 'email', etiqueta: 'Correo institucional', valor: a.email, requerido: true, col: 'col-6', id: 'al-email' }) +
      campo({ nombre: 'telefono', tipo: 'tel', etiqueta: 'Teléfono', valor: a.telefono, col: 'col-6', id: 'al-tel' }) +
      campo({ nombre: 'nacimiento', tipo: 'date', etiqueta: 'Fecha de nacimiento', valor: a.nacimiento, col: 'col-6', id: 'al-nac' }) +
      campo({ nombre: 'becaPct', tipo: 'number', etiqueta: 'Beca (%)', valor: a.becaPct === undefined ? 0 : a.becaPct, min: 0, max: 100, paso: 5, col: 'col-6', id: 'al-beca' }) +
      campo({
        nombre: 'estatus', tipo: 'selec', etiqueta: 'Estatus', valor: a.estatus || 'activo', col: 'col-6', id: 'al-est',
        opciones: [{ v: 'activo', t: 'Activo' }, { v: 'condicionado', t: 'Condicionado' }, { v: 'baja', t: 'Baja' }]
      }) +
      campo({ nombre: 'notas', tipo: 'area', filas: 3, etiqueta: 'Notas internas', valor: a.notas, col: 'col-12', id: 'al-notas', ayuda: 'Sólo las ve la dirección.' }) +
      '<div class="campo col-12"><span class="etiqueta">Datos del tutor</span></div>' +
      campo({ nombre: 'tutorNombre', etiqueta: 'Nombre del tutor', valor: t.nombre, col: 'col-6', id: 'al-tnom' }) +
      campo({ nombre: 'tutorParentesco', etiqueta: 'Parentesco', valor: t.parentesco, col: 'col-6', id: 'al-tpar' }) +
      campo({ nombre: 'tutorTelefono', tipo: 'tel', etiqueta: 'Teléfono del tutor', valor: t.telefono, col: 'col-6', id: 'al-ttel' }) +
      campo({ nombre: 'tutorEmail', tipo: 'email', etiqueta: 'Correo del tutor', valor: t.email, col: 'col-6', id: 'al-tmail' });
  }

  function datosAlumnoDeForma(d) {
    return {
      nombre: String(d.nombre || '').trim(),
      email: String(d.email || '').trim(),
      telefono: String(d.telefono || '').trim(),
      nacimiento: String(d.nacimiento || '').trim(),
      becaPct: num(d.becaPct),
      estatus: d.estatus || 'activo',
      notas: String(d.notas || ''),
      tutor: {
        nombre: String(d.tutorNombre || '').trim(),
        parentesco: String(d.tutorParentesco || '').trim(),
        telefono: String(d.tutorTelefono || '').trim(),
        email: String(d.tutorEmail || '').trim()
      }
    };
  }

  function validaAlumno(datos) {
    if (datos.nombre.length < 4) { U.toast('Escribe el nombre completo del alumno.', 'crit'); return false; }
    if (datos.email.indexOf('@') < 1) { U.toast('El correo no es válido.', 'crit'); return false; }
    if (datos.becaPct < 0 || datos.becaPct > 100) { U.toast('La beca va de 0 a 100 por ciento.', 'crit'); return false; }
    return true;
  }

  /* --------------------------------------------------------- expediente ---- */

  function expediente(id) {
    var a = Q.alumno(id);
    if (!a) {
      return noEncontrado('Expediente no encontrado',
        'No existe ningún alumno con ese identificador.', '#/direccion/alumnos', 'Volver al padrón');
    }
    var mats = Q.materiasDeAlumno(a.id);
    var as = Q.asistencia(a.id) || {};
    var ec = estadoCuenta(a);
    var prom = Q.promedioGeneral(a.id);
    var t = a.tutor || {};
    var h = [];

    /* Cabecera */
    h.push('<div class="col-12">' + U.panel({
      cuerpo: '<div class="fila envuelve gap-3">' + U.avatar(a, 'lg') +
        '<div class="crece"><h2 class="destacado">' + esc(a.nombre) + '</h2>' +
        '<div class="fila envuelve gap-1 mt-1">' + badgeEstatusAlumno(a.estatus) +
        U.chip('Matrícula ' + a.matricula) +
        (num(a.becaPct) ? U.chip('Beca ' + num(a.becaPct) + '%') : '') +
        U.chip(mats.length + (mats.length === 1 ? ' materia' : ' materias')) + '</div>' +
        '<div class="datos-rejilla mt-2">' +
        '<div class="dato"><span class="e">Correo</span><span class="v">' + esc(a.email) + '</span></div>' +
        '<div class="dato"><span class="e">Teléfono</span><span class="v mono">' + esc(a.telefono || '—') + '</span></div>' +
        '<div class="dato"><span class="e">Nacimiento</span><span class="v">' + esc(a.nacimiento ? U.fecha(a.nacimiento, 'corta') : '—') + '</span></div>' +
        '<div class="dato"><span class="e">Ingreso</span><span class="v">' + esc(a.ingreso ? U.fecha(a.ingreso, 'corta') : '—') + '</span></div>' +
        '</div></div>' +
        '<div class="pila">' +
        '<button type="button" class="btn btn-primario" data-accion="dir:editarAlumno" ' +
        U.attr({ 'data-args': { id: a.id } }) + '>' + U.icono('lapiz', 15) + ' Editar datos</button>' +
        '<button type="button" class="btn" data-accion="dir:menuEstatus" ' +
        U.attr({ 'data-args': { id: a.id } }) + '>' + U.icono('escudo', 15) + ' Cambiar estatus</button>' +
        '</div></div>'
    }) + '</div>');

    /* KPI */
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Promedio general', icono: 'grafica', variante: varNota(prom),
      valor: U.notaTexto(prom), sub: 'Promedio de sus ' + mats.length + ' materias'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Asistencia', icono: 'cheque', variante: varPct(pctNum(as.pct), 90, 80),
      valor: pctNum(as.pct) + '%', sub: num(as.presentes) + ' de ' + num(as.totales) + ' sesiones'
    }) + '</div>');
    h.push('<div class="col-4">' + U.kpi({
      etiqueta: 'Adeudo', icono: 'dinero', variante: ec.adeudo ? 'crit' : 'ok',
      valor: U.moneda(ec.adeudo), sub: ec.adeudo ? 'Requiere gestión de cobranza' : 'Estado de cuenta al corriente'
    }) + '</div>');

    /* Boleta */
    var filasBoleta = mats.map(function (m) {
      var av = Q.avanceMateria(a.id, m.id) || {};
      var asm = Q.asistencia(a.id, m.id) || {};
      var pr = Q.profesor(m.profesorId);
      return {
        materia: '<div><strong>' + esc(m.nombre) + '</strong><div><small class="silencio mono">' + esc(m.codigo) + ' · ' + esc(m.aula || '') + '</small></div></div>',
        profesor: esc(pr ? pr.nombre : '—'),
        promedio: nota(Q.promedioMateria(a.id, m.id)),
        avance: '<div style="min-width:120px">' + U.progreso(num(av.pct), num(av.pct) >= 80 ? 'ok' : 'aviso') +
          '<small class="silencio mono">' + num(av.calificadas) + ' de ' + num(av.total) + '</small></div>',
        asistencia: '<span class="mono">' + pctNum(asm.pct) + '%</span>',
        acciones: '<button type="button" class="btn btn-sm btn-peligro" data-accion="dir:pedirBaja" ' +
          U.attr({ 'data-args': { id: a.id, materiaId: m.id } }) + '>Dar de baja</button>'
      };
    });

    var sinInscribir = materiasActivas().filter(function (m) {
      return mats.every(function (x) { return x.id !== m.id; });
    });
    var altaMateria = sinInscribir.length
      ? '<form class="fila envuelve gap-1" data-envio="dir:inscribir" ' + U.attr({ 'data-args': { id: a.id } }) + '>' +
        '<select class="selec crece" name="materiaId" aria-label="Materia a inscribir" required>' +
        opciones(sinInscribir.map(function (m) { return { v: m.id, t: m.codigo + ' · ' + m.nombre }; }), '') +
        '</select><button type="submit" class="btn btn-primario">' + U.icono('mas', 15) + ' Inscribir</button></form>'
      : '<small class="silencio">Ya está inscrito en todas las materias activas del ciclo.</small>';

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Boleta y materias inscritas',
      sub: 'Calificación, avance de captura y asistencia por materia',
      cuerpo: tabla([
        { clave: 'materia', titulo: 'Materia', html: true },
        { clave: 'profesor', titulo: 'Imparte', html: true },
        { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
        { clave: 'avance', titulo: 'Avance de captura', html: true },
        { clave: 'asistencia', titulo: 'Asistencia', align: 'num', html: true },
        { clave: 'acciones', titulo: '', align: 'num', html: true }
      ], filasBoleta, 'Este alumno no tiene materias inscritas.') +
        '<div class="separador"></div>' + altaMateria
    }) + '</div>');

    /* Pagos */
    var filasPagos = ec.pagos.map(function (p) {
      return {
        concepto: '<div><strong>' + esc(p.concepto) + '</strong><div><small class="silencio mono">' + esc(p.referencia || '') + '</small></div></div>',
        vence: esc(U.fecha(p.vence, 'corta')),
        monto: '<span class="mono">' + U.moneda(num(p.monto)) + '</span>' +
          (num(p.recargo) ? '<div><small class="nota-baja mono">+ ' + U.moneda(num(p.recargo)) + ' de recargo</small></div>' : ''),
        estado: badgePago(p.estado),
        pagado: p.pagadoEl ? esc(U.fecha(p.pagadoEl, 'corta')) + '<div><small class="silencio">' + esc(p.metodo || '') + '</small></div>' : '<span class="silencio">—</span>',
        acciones: p.estado === 'pagado' ? '' :
          '<button type="button" class="btn btn-sm btn-primario" data-accion="dir:modalPago" ' +
          U.attr({ 'data-args': { id: p.id } }) + '>Registrar pago</button>'
      };
    });

    h.push('<div class="col-8">' + U.panel({
      titulo: 'Historial de pagos',
      sub: U.moneda(ec.pagado) + ' pagados de ' + U.moneda(ec.total) + ' del ciclo',
      cuerpo: tabla([
        { clave: 'concepto', titulo: 'Concepto', html: true },
        { clave: 'vence', titulo: 'Vence', html: true },
        { clave: 'monto', titulo: 'Monto', align: 'num', html: true },
        { clave: 'estado', titulo: 'Estado', html: true },
        { clave: 'pagado', titulo: 'Pagado el', html: true },
        { clave: 'acciones', titulo: '', align: 'num', html: true }
      ], filasPagos, 'Sin movimientos de cobranza.')
    }) + '</div>');

    /* Tutor */
    h.push('<div class="col-4">' + U.panel({
      titulo: 'Tutor responsable',
      cuerpo: t.nombre ? '<div class="pila">' +
        '<div class="dato"><span class="e">Nombre</span><span class="v"><strong>' + esc(t.nombre) + '</strong></span></div>' +
        '<div class="dato"><span class="e">Parentesco</span><span class="v">' + esc(t.parentesco || '—') + '</span></div>' +
        '<div class="dato"><span class="e">Teléfono</span><span class="v mono">' + esc(t.telefono || '—') + '</span></div>' +
        '<div class="dato"><span class="e">Correo</span><span class="v">' + esc(t.email || '—') + '</span></div>' +
        '</div>' : U.vacio({ icono: 'usuario', titulo: 'Sin tutor registrado', texto: 'Captúralo desde el botón de editar datos.' })
    }) + '</div>');

    /* Notas internas */
    h.push('<div class="col-12">' + U.panel({
      titulo: 'Notas internas',
      sub: 'Visibles únicamente para la dirección',
      cuerpo: forma({
        accion: 'dir:guardarNotas', args: { id: a.id },
        campos: campo({ nombre: 'notas', tipo: 'area', filas: 4, etiqueta: 'Seguimiento del expediente', valor: a.notas, col: 'col-12', id: 'exp-notas' }),
        acciones: btnEnviar('Guardar notas')
      })
    }) + '</div>');

    return U.migas([{ texto: 'Alumnos', ruta: '#/direccion/alumnos' }, { texto: a.nombre }]) +
      U.seccion({
        titulo: 'Expediente de ' + a.nombre,
        sub: 'Matrícula ' + a.matricula + ' · ingresó el ' + U.fecha(a.ingreso, 'larga'),
        acciones: '<a class="btn" href="#/direccion/alumnos">' + U.icono('flecha-izq', 15) + ' Volver al padrón</a>',
        cuerpo: '<div class="rejilla">' + h.join('') + '</div>'
      });
  }

  /* ========================================================= PROFESORES ==== */

  function seccionProfesores() {
    var filas = DB.profesores.map(function (p) {
      var mats = Q.materiasDeProfesor(p.id);
      var r = Q.ratingProfesor(p.id, false) || {};
      return {
        profesor: celdaPersona(p, esc(p.email)),
        clave: '<span class="mono">' + esc(p.clave || '—') + '</span>',
        titulo: esc(p.titulo || '—'),
        materias: mats.length ? mats.map(function (m) { return U.chip(m.codigo); }).join(' ') : '<span class="silencio">Sin materias</span>',
        alumnos: '<span class="mono">' + alumnosDeProfesor(p.id) + '</span>',
        promedio: nota(promedioProfesor(p.id)),
        valoracion: U.estrellas(num(r.promedio)) + '<div><small class="silencio">' + num(r.total) + ' reseñas</small></div>',
        publico: p.perfilPublico ? U.badge('Público', 'ok') : U.badge('Oculto', 'neutro'),
        acciones: '<a class="btn btn-sm" href="#/direccion/profesores?id=' + esc(p.id) + '">Ver ficha</a>'
      };
    });

    return U.seccion({
      titulo: 'Claustro',
      sub: 'Personas docentes, sus materias y su valoración',
      acciones: '<button type="button" class="btn btn-primario" data-accion="dir:nuevoProfesor">' +
        U.icono('mas', 16) + ' Nuevo profesor</button>',
      cuerpo: U.panel({
        cuerpo: tabla([
          { clave: 'profesor', titulo: 'Persona docente', html: true },
          { clave: 'clave', titulo: 'Clave', html: true },
          { clave: 'titulo', titulo: 'Título', html: true },
          { clave: 'materias', titulo: 'Materias', html: true },
          { clave: 'alumnos', titulo: 'Alumnos', align: 'num', html: true },
          { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
          { clave: 'valoracion', titulo: 'Valoración', html: true },
          { clave: 'publico', titulo: 'Perfil', html: true },
          { clave: 'acciones', titulo: '', align: 'num', html: true }
        ], filas, 'Todavía no hay personas docentes registradas.')
      })
    });
  }

  function camposProfesor(p) {
    p = p || {};
    return campo({ nombre: 'nombre', etiqueta: 'Nombre completo', valor: p.nombre, requerido: true, col: 'col-12', id: 'pr-nombre' }) +
      campo({ nombre: 'email', tipo: 'email', etiqueta: 'Correo institucional', valor: p.email, requerido: true, col: 'col-6', id: 'pr-email' }) +
      campo({ nombre: 'titulo', etiqueta: 'Título académico', valor: p.titulo, requerido: true, col: 'col-6', id: 'pr-titulo' }) +
      campo({ nombre: 'telefono', tipo: 'tel', etiqueta: 'Teléfono', valor: p.telefono, col: 'col-6', id: 'pr-tel' }) +
      campo({ nombre: 'oficina', etiqueta: 'Oficina', valor: p.oficina, col: 'col-6', id: 'pr-ofi' }) +
      campo({
        nombre: 'areas', etiqueta: 'Áreas que domina', col: 'col-12', id: 'pr-areas',
        valor: (p.areas || []).join(', '), ayuda: 'Sepáralas con comas.'
      });
  }

  function datosProfesorDeForma(d) {
    return {
      nombre: String(d.nombre || '').trim(),
      email: String(d.email || '').trim(),
      titulo: String(d.titulo || '').trim(),
      telefono: String(d.telefono || '').trim(),
      oficina: String(d.oficina || '').trim(),
      areas: String(d.areas || '').split(',').map(function (x) { return x.trim(); })
        .filter(function (x) { return x.length > 0; })
    };
  }

  function validaProfesor(datos) {
    if (datos.nombre.length < 4) { U.toast('Escribe el nombre completo.', 'crit'); return false; }
    if (datos.email.indexOf('@') < 1) { U.toast('El correo no es válido.', 'crit'); return false; }
    if (!datos.titulo) { U.toast('Falta el título académico.', 'crit'); return false; }
    return true;
  }

  function fichaProfesor(id) {
    var p = Q.profesor(id);
    if (!p) {
      return noEncontrado('Ficha no encontrada',
        'No existe ninguna persona docente con ese identificador.', '#/direccion/profesores', 'Volver al claustro');
    }
    var mats = Q.materiasDeProfesor(p.id);
    var r = Q.ratingProfesor(p.id, false) || {};
    var pend = (Q.resenasDeProfesor(p.id, 'pendiente') || []).length;
    var otras = materiasActivas().filter(function (m) { return m.profesorId !== p.id; });
    var h = [];

    h.push('<div class="col-12">' + U.panel({
      cuerpo: '<div class="fila envuelve gap-3">' + U.avatar(p, 'lg') +
        '<div class="crece"><h2 class="destacado">' + esc(p.nombre) + '</h2>' +
        '<div class="silencio">' + esc(p.titulo || '') + '</div>' +
        '<div class="fila envuelve gap-1 mt-1">' +
        U.chip('Clave ' + (p.clave || '—')) +
        (p.perfilPublico ? U.badge('Perfil público visible', 'ok') : U.badge('Perfil fuera del sitio', 'neutro')) +
        (pend ? U.badge(pend + ' reseñas por autorizar', 'aviso') : '') + '</div>' +
        '<div class="datos-rejilla mt-2">' +
        '<div class="dato"><span class="e">Correo</span><span class="v">' + esc(p.email) + '</span></div>' +
        '<div class="dato"><span class="e">Teléfono</span><span class="v mono">' + esc(p.telefono || '—') + '</span></div>' +
        '<div class="dato"><span class="e">Oficina</span><span class="v">' + esc(p.oficina || '—') + '</span></div>' +
        '<div class="dato"><span class="e">Asesoría</span><span class="v">' + esc(p.horarioAsesoria || '—') + '</span></div>' +
        '<div class="dato"><span class="e">Ingreso</span><span class="v">' + esc(p.ingreso ? U.fecha(p.ingreso, 'corta') : '—') + '</span></div>' +
        '</div></div>' +
        '<div class="pila"><a class="btn btn-suave" href="#/publico/profesor?id=' + esc(p.id) + '">' +
        U.icono('ojo', 15) + ' Ver perfil público</a></div>' +
        '</div>' +
        (p.bio ? '<div class="separador"></div><p>' + esc(p.bio) + '</p>' : '')
    }) + '</div>');

    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Materias a su cargo', icono: 'libro', variante: 'marca', valor: mats.length,
      sub: esc(mats.map(function (m) { return m.codigo; }).join(' · ')) || 'Sin asignación'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Alumnos atendidos', icono: 'usuarios', variante: 'marca', valor: alumnosDeProfesor(p.id),
      sub: 'Personas distintas en sus grupos'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Promedio de sus grupos', icono: 'grafica', variante: varNota(promedioProfesor(p.id)),
      valor: U.notaTexto(promedioProfesor(p.id)), sub: 'Meta institucional 8.0'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Valoración docente', icono: 'estrella', variante: num(r.promedio) >= 4 ? 'ok' : 'aviso',
      valor: num(r.promedio) ? num(r.promedio).toFixed(1) : '—',
      sub: num(r.total) + ' reseñas registradas'
    }) + '</div>');

    /* Materias a su cargo y reasignación */
    var filasMat = mats.map(function (m) {
      return {
        materia: '<div><strong>' + esc(m.nombre) + '</strong><div><small class="silencio mono">' + esc(m.codigo) + ' · ' + esc(m.aula || '') + '</small></div></div>',
        inscritos: '<span class="mono">' + (Q.alumnosDeMateria(m.id) || []).length + ' / ' + num(m.cupo) + '</span>',
        promedio: nota(Q.promedioGrupo(m.id)),
        mover: '<select class="selec" style="min-width:200px" aria-label="Reasignar ' + esc(m.nombre) + '" ' +
          'data-cambio="dir:reasignarMateria" ' + U.attr({ 'data-args': { id: m.id } }) + '>' +
          opcionesProfesor(m.profesorId) + '</select>'
      };
    });

    h.push('<div class="col-8">' + U.panel({
      titulo: 'Materias a su cargo',
      sub: 'Cambia el selector para reasignar una materia a otra persona docente',
      cuerpo: tabla([
        { clave: 'materia', titulo: 'Materia', html: true },
        { clave: 'inscritos', titulo: 'Inscritos', align: 'num', html: true },
        { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
        { clave: 'mover', titulo: 'Imparte', html: true }
      ], filasMat, 'No tiene materias asignadas.') +
        '<div class="separador"></div>' +
        (otras.length
          ? '<form class="fila envuelve gap-1" data-envio="dir:asignarMateria" ' + U.attr({ 'data-args': { id: p.id } }) + '>' +
            '<select class="selec crece" name="materiaId" aria-label="Materia por asignar" required>' +
            opciones(otras.map(function (m) { return { v: m.id, t: m.codigo + ' · ' + m.nombre }; }), '') +
            '</select><button type="submit" class="btn btn-primario">' + U.icono('mas', 15) + ' Asignarle esta materia</button></form>'
          : '<small class="silencio">Todas las materias activas ya están a su cargo.</small>')
    }) + '</div>');

    h.push('<div class="col-4">' + U.panel({
      titulo: 'Áreas y formación',
      cuerpo: '<div class="fila envuelve gap-1">' +
        ((p.areas || []).length ? (p.areas || []).map(function (x) { return U.chip(x); }).join(' ') : '<small class="silencio">Sin áreas declaradas</small>') +
        '</div>' +
        ((p.formacion || []).length ? '<div class="separador"></div><ul class="linea-tiempo">' +
          p.formacion.map(function (f) {
            return '<li><div class="t">' + esc(f.grado) + '</div><div class="d">' + esc(f.institucion) + ' · ' + esc(f.anio) + '</div></li>';
          }).join('') + '</ul>' : '') +
        (p.cv ? '<div class="separador"></div><div class="fila">' + U.icono('pdf', 18) +
          '<div class="crece"><div class="truncar"><strong>' + esc(p.cv.nombre) + '</strong></div>' +
          '<small class="silencio">' + esc(p.cv.tamano || '') + ' · actualizado el ' + esc(U.fecha(p.cv.actualizado, 'corta')) + '</small></div></div>' : '')
    }) + '</div>');

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Editar datos de la persona docente',
      sub: 'La biografía, la formación y la experiencia las edita cada quien desde su propio panel',
      cuerpo: forma({
        accion: 'dir:guardarProfesor', args: { id: p.id },
        campos: camposProfesor(p) +
          campo({ nombre: 'horarioAsesoria', etiqueta: 'Horario de asesoría', valor: p.horarioAsesoria, col: 'col-12', id: 'pr-ases' }) +
          casilla('perfilPublico', 'Mostrar su perfil en el sitio público del colegio', !!p.perfilPublico),
        acciones: btnEnviar('Guardar cambios')
      })
    }) + '</div>');

    return U.migas([{ texto: 'Claustro', ruta: '#/direccion/profesores' }, { texto: p.nombre }]) +
      U.seccion({
        titulo: p.nombre,
        sub: 'Ficha completa de la persona docente',
        acciones: '<a class="btn" href="#/direccion/profesores">' + U.icono('flecha-izq', 15) + ' Volver al claustro</a>',
        cuerpo: '<div class="rejilla">' + h.join('') + '</div>'
      });
  }

  /* =========================================================== MATERIAS ==== */

  function horarioSemanal() {
    var dias = DIAS.slice();
    var bloques = {};
    dias.forEach(function (d) { bloques[d] = []; });
    materiasActivas().forEach(function (m) {
      (m.horario || []).forEach(function (b) {
        if (!bloques[b.dia]) { bloques[b.dia] = []; dias.push(b.dia); }
        bloques[b.dia].push({ inicio: b.inicio, fin: b.fin, m: m });
      });
    });
    var cols = dias.map(function (d) {
      var lista = bloques[d].slice().sort(function (a, b) {
        return a.inicio < b.inicio ? -1 : (a.inicio > b.inicio ? 1 : 0);
      });
      var cuerpo = lista.length ? lista.map(function (b) {
        var pr = Q.profesor(b.m.profesorId);
        return '<div class="horario-bloque" style="border-left-color:' + esc(b.m.color || 'var(--marca)') + '">' +
          '<div class="h">' + esc(b.inicio) + ' – ' + esc(b.fin) + '</div>' +
          '<div class="m">' + esc(b.m.nombre) + '</div>' +
          '<div class="h">' + esc(b.m.aula || '') + ' · ' + esc(pr ? pr.nombre : 'Sin asignar') + '</div>' +
          '</div>';
      }).join('') : '<small class="silencio">Sin clases</small>';
      return '<div class="horario-dia"><span class="etiqueta">' + esc(d) + '</span>' + cuerpo + '</div>';
    }).join('');
    return '<div class="horario">' + cols + '</div>';
  }

  function seccionMaterias() {
    var filas = DB.materias.map(function (m) {
      var inscritos = (Q.alumnosDeMateria(m.id) || []).length;
      var cupo = num(m.cupo);
      var lleno = cupo ? Math.round(inscritos / cupo * 100) : 0;
      return {
        codigo: '<span class="mono">' + esc(m.codigo) + '</span>',
        nombre: '<div><strong>' + esc(m.nombre) + '</strong><div><small class="silencio">' +
          esc((m.horario || []).map(function (b) { return b.dia + ' ' + b.inicio; }).join(' · ') || 'Sin horario') + '</small></div></div>',
        profesor: '<select class="selec" style="min-width:200px" aria-label="Profesor de ' + esc(m.nombre) + '" ' +
          'data-cambio="dir:reasignarMateria" ' + U.attr({ 'data-args': { id: m.id } }) + '>' +
          opcionesProfesor(m.profesorId) + '</select>',
        creditos: '<span class="mono">' + num(m.creditos) + '</span>',
        aula: esc(m.aula || '—'),
        cupo: '<div style="min-width:110px"><span class="mono">' + inscritos + ' / ' + cupo + '</span>' +
          U.progreso(lleno, lleno >= 100 ? 'crit' : 'ok') + '</div>',
        promedio: nota(Q.promedioGrupo(m.id)),
        estatus: m.estatus === 'archivada' ? U.badge('Archivada', 'neutro') : U.badge('Activa', 'ok'),
        acciones: m.estatus === 'archivada' ? '<span class="silencio">—</span>' :
          '<button type="button" class="btn btn-sm btn-peligro" data-accion="dir:pedirArchivar" ' +
          U.attr({ 'data-args': { id: m.id } }) + '>Archivar</button>'
      };
    });

    var cuerpoTabla = U.panel({
      titulo: 'Oferta del ciclo ' + DB.escuela.ciclo,
      sub: 'Cambia el selector de la columna «Imparte» para reasignar la materia',
      cuerpo: tabla([
        { clave: 'codigo', titulo: 'Código', html: true },
        { clave: 'nombre', titulo: 'Materia', html: true },
        { clave: 'profesor', titulo: 'Imparte', html: true },
        { clave: 'creditos', titulo: 'Créditos', align: 'num', html: true },
        { clave: 'aula', titulo: 'Aula', html: true },
        { clave: 'cupo', titulo: 'Inscritos', html: true },
        { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
        { clave: 'estatus', titulo: 'Estatus', html: true },
        { clave: 'acciones', titulo: '', align: 'num', html: true }
      ], filas, 'No hay materias registradas.')
    });

    return U.seccion({
      titulo: 'Materias',
      sub: 'Asignación docente, cupo, promedio y horario semanal del colegio',
      acciones: '<button type="button" class="btn btn-primario" data-accion="dir:nuevaMateria">' +
        U.icono('mas', 16) + ' Nueva materia</button>',
      cuerpo: '<div class="rejilla">' +
        '<div class="col-12">' + cuerpoTabla + '</div>' +
        '<div class="col-12">' + U.panel({
          titulo: 'Horario semanal del colegio',
          sub: 'Todas las materias activas, colocadas por día y ordenadas por hora',
          cuerpo: horarioSemanal()
        }) + '</div>' +
        '</div>'
    });
  }

  function camposMateria() {
    return campo({ nombre: 'codigo', etiqueta: 'Código', requerido: true, col: 'col-4', id: 'mt-cod', placeholder: 'MAT-220' }) +
      campo({ nombre: 'nombre', etiqueta: 'Nombre de la materia', requerido: true, col: 'col-8', id: 'mt-nom' }) +
      campo({ nombre: 'profesorId', tipo: 'selec', etiqueta: 'Imparte', requerido: true, col: 'col-6', id: 'mt-prof', opciones: DB.profesores.map(function (p) { return { v: p.id, t: p.nombre }; }) }) +
      campo({ nombre: 'aula', etiqueta: 'Aula', col: 'col-6', id: 'mt-aula', placeholder: 'B-204' }) +
      campo({ nombre: 'creditos', tipo: 'number', etiqueta: 'Créditos', valor: 6, min: 1, max: 12, col: 'col-6', id: 'mt-cre' }) +
      campo({ nombre: 'cupo', tipo: 'number', etiqueta: 'Cupo', valor: 24, min: 1, max: 60, col: 'col-6', id: 'mt-cupo' }) +
      campo({ nombre: 'descripcion', tipo: 'area', filas: 3, etiqueta: 'Descripción', col: 'col-12', id: 'mt-desc' }) +
      '<div class="campo col-12"><span class="etiqueta">Primer bloque de horario</span></div>' +
      campo({ nombre: 'dia', tipo: 'selec', etiqueta: 'Día', col: 'col-4', id: 'mt-dia', opciones: DIAS.map(function (d) { return { v: d, t: d }; }) }) +
      campo({ nombre: 'inicio', tipo: 'time', etiqueta: 'Inicio', valor: '07:30', col: 'col-4', id: 'mt-ini' }) +
      campo({ nombre: 'fin', tipo: 'time', etiqueta: 'Fin', valor: '09:00', col: 'col-4', id: 'mt-fin' });
  }

  /* =========================================================== FINANZAS ==== */

  function seccionFinanzas() {
    var k = Q.kpisEscuela() || {};
    var cumpl = pctNum(k.cumplimientoPct);
    var h = [];

    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Cobrado', icono: 'dinero', variante: 'ok',
      valor: U.moneda(num(k.cobrado)), sub: 'Ingresos confirmados del ciclo'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Por cobrar', icono: 'reloj', variante: 'aviso',
      valor: U.moneda(num(k.porCobrar)), sub: 'Todo lo no pagado, con lo vencido incluido'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Vencido', icono: 'alerta', variante: 'crit',
      valor: U.moneda(num(k.vencido)), sub: 'Con recargo del ' + num(DB.escuela.recargoPct) + '%'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Cumplimiento', icono: 'cheque', variante: varPct(cumpl, 90, 75),
      valor: cumpl + '%', sub: 'Del total facturado en el ciclo'
    }) + '</div>');

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Ingresos por mes',
      sub: 'Cobrado contra esperado',
      acciones: '<button type="button" class="btn btn-primario btn-sm" data-accion="dir:modalColegiaturas">' +
        U.icono('mas', 15) + ' Generar colegiaturas</button>',
      cuerpo: graficaIngresos()
    }) + '</div>');

    /* Estado de cuenta por alumno */
    var filasEC = DB.alumnos.map(function (a) {
      var ec = estadoCuenta(a);
      return {
        alumno: celdaPersona(a, esc(a.matricula)),
        total: '<span class="mono">' + U.moneda(ec.total) + '</span>',
        pagado: '<span class="mono">' + U.moneda(ec.pagado) + '</span>',
        adeudo: ec.adeudo ? '<span class="nota-baja mono">' + U.moneda(ec.adeudo) + '</span>' : '<span class="nota-alta">Al corriente</span>',
        ultimo: ec.ultimo ? esc(U.fecha(ec.ultimo, 'corta')) : '<span class="silencio">Sin pagos</span>',
        acciones: '<a class="btn btn-sm" href="#/direccion/alumnos?id=' + esc(a.id) + '">Expediente</a>'
      };
    });

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Estado de cuenta por alumno',
      sub: 'Total del ciclo, pagado, adeudo y último movimiento',
      cuerpo: tabla([
        { clave: 'alumno', titulo: 'Alumno', html: true },
        { clave: 'total', titulo: 'Total del ciclo', align: 'num', html: true },
        { clave: 'pagado', titulo: 'Pagado', align: 'num', html: true },
        { clave: 'adeudo', titulo: 'Adeudo', align: 'num', html: true },
        { clave: 'ultimo', titulo: 'Último pago', html: true },
        { clave: 'acciones', titulo: '', align: 'num', html: true }
      ], filasEC, 'Sin alumnos en el padrón.')
    }) + '</div>');

    /* Todos los pagos, con filtros */
    var pagos = DB.pagos.filter(function (p) {
      if (estado.fPagoEstado !== 'todos' && p.estado !== estado.fPagoEstado) return false;
      if (estado.fPagoAlumno !== 'todos' && p.alumnoId !== estado.fPagoAlumno) return false;
      return true;
    }).sort(function (a, b) { return a.vence < b.vence ? 1 : (a.vence > b.vence ? -1 : 0); });

    var filasPagos = pagos.map(function (p) {
      var a = Q.alumno(p.alumnoId);
      return {
        alumno: celdaPersona(a, a ? esc(a.matricula) : ''),
        concepto: '<div><strong>' + esc(p.concepto) + '</strong><div><small class="silencio mono">' + esc(p.referencia || '') + '</small></div></div>',
        periodo: '<span class="mono">' + esc(p.periodo) + '</span>',
        vence: esc(U.fecha(p.vence, 'corta')),
        monto: '<span class="mono">' + U.moneda(num(p.monto)) + '</span>' +
          (num(p.recargo) ? '<div><small class="nota-baja mono">+ ' + U.moneda(num(p.recargo)) + '</small></div>' : ''),
        estado: badgePago(p.estado),
        metodo: p.metodo ? esc(p.metodo) + '<div><small class="silencio">' + esc(U.fecha(p.pagadoEl, 'corta')) + '</small></div>' : '<span class="silencio">—</span>',
        acciones: p.estado === 'pagado' ? '' :
          '<button type="button" class="btn btn-sm btn-primario" data-accion="dir:modalPago" ' +
          U.attr({ 'data-args': { id: p.id } }) + '>Registrar pago</button>'
      };
    });

    var filtros = '<div class="fila envuelve mb-2">' +
      '<select class="selec" style="width:auto;min-width:180px" aria-label="Filtrar por estado" data-cambio="dir:filtroPagoEstado">' +
      opciones([
        { v: 'todos', t: 'Todos los estados' },
        { v: 'pagado', t: 'Pagados' },
        { v: 'pendiente', t: 'Pendientes' },
        { v: 'vencido', t: 'Vencidos' }
      ], estado.fPagoEstado) + '</select>' +
      '<select class="selec" style="width:auto;min-width:220px" aria-label="Filtrar por alumno" data-cambio="dir:filtroPagoAlumno">' +
      opciones([{ v: 'todos', t: 'Todos los alumnos' }].concat(DB.alumnos.map(function (a) {
        return { v: a.id, t: a.nombre };
      })), estado.fPagoAlumno) + '</select>' +
      '<span class="chip">' + pagos.length + ' de ' + DB.pagos.length + ' movimientos</span>' +
      '</div>';

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Movimientos de cobranza',
      sub: 'Todos los pagos del ciclo',
      cuerpo: filtros + tabla([
        { clave: 'alumno', titulo: 'Alumno', html: true },
        { clave: 'concepto', titulo: 'Concepto', html: true },
        { clave: 'periodo', titulo: 'Periodo', html: true },
        { clave: 'vence', titulo: 'Vence', html: true },
        { clave: 'monto', titulo: 'Monto', align: 'num', html: true },
        { clave: 'estado', titulo: 'Estado', html: true },
        { clave: 'metodo', titulo: 'Método', html: true },
        { clave: 'acciones', titulo: '', align: 'num', html: true }
      ], filasPagos, 'Ningún movimiento coincide con los filtros.')
    }) + '</div>');

    return U.seccion({
      titulo: 'Finanzas',
      sub: 'Cobranza del ciclo ' + DB.escuela.ciclo + ' · colegiatura base ' + U.moneda(num(DB.escuela.colegiaturaMensual)),
      acciones: '<button type="button" class="btn btn-primario" data-accion="dir:modalColegiaturas">' +
        U.icono('dinero', 16) + ' Generar colegiaturas</button>',
      cuerpo: '<div class="rejilla">' + h.join('') + '</div>'
    });
  }

  /* ========================================================== ACADÉMICO ==== */

  function distribucionColegio() {
    var b = [
      { etiqueta: '9.0 a 10', valor: 0 },
      { etiqueta: '8.0 a 8.9', valor: 0 },
      { etiqueta: '7.0 a 7.9', valor: 0 },
      { etiqueta: '6.0 a 6.9', valor: 0 },
      { etiqueta: 'Menos de 6', valor: 0 }
    ];
    DB.calificaciones.forEach(function (c) {
      var v = Number(c.valor);
      if (isNaN(v)) return;
      if (v >= 9) b[0].valor++;
      else if (v >= 8) b[1].valor++;
      else if (v >= 7) b[2].valor++;
      else if (v >= 6) b[3].valor++;
      else b[4].valor++;
    });
    return b;
  }

  function seccionAcademico() {
    var k = Q.kpisEscuela() || {};
    var activas = materiasActivas();
    var dist = distribucionColegio();
    var totalCal = dist.reduce(function (s, x) { return s + x.valor; }, 0);
    var reprobados = dist[4].valor;
    var maxDist = dist.reduce(function (s, x) { return Math.max(s, x.valor); }, 0);
    var h = [];

    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Promedio general', icono: 'grafica', variante: varNota(k.promedioGeneral),
      valor: U.notaTexto(k.promedioGeneral), sub: 'Colegio completo'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Calificaciones capturadas', icono: 'portapapeles', variante: 'marca',
      valor: totalCal, sub: 'En ' + activas.length + ' materias'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Notas reprobatorias', icono: 'alerta', variante: reprobados ? 'crit' : 'ok',
      valor: reprobados, sub: totalCal ? Math.round(reprobados / totalCal * 100) + '% del total' : 'Sin capturas'
    }) + '</div>');
    h.push('<div class="col-3">' + U.kpi({
      etiqueta: 'Asistencia global', icono: 'cheque', variante: varPct(pctNum(k.asistencia), 90, 80),
      valor: pctNum(k.asistencia) + '%', sub: 'Todas las materias'
    }) + '</div>');

    h.push('<div class="col-6">' + U.panel({
      titulo: 'Promedio por materia',
      sub: 'Meta institucional: 8.0',
      cuerpo: graficaPromedioMaterias()
    }) + '</div>');

    h.push('<div class="col-6">' + U.panel({
      titulo: 'Distribución de calificaciones',
      sub: 'Todas las capturas del colegio, agrupadas por rango',
      cuerpo: U.columnas({ series: dist, max: maxDist }) +
        '<div class="separador"></div>' +
        '<div class="datos-rejilla">' + dist.map(function (x) {
          return '<div class="dato"><span class="e">' + esc(x.etiqueta) + '</span><span class="v mono">' +
            x.valor + (totalCal ? ' · ' + Math.round(x.valor / totalCal * 100) + '%' : '') + '</span></div>';
        }).join('') + '</div>'
    }) + '</div>');

    h.push('<div class="col-6">' + U.panel({
      titulo: 'Asistencia por materia',
      sub: 'Umbral de alerta: 80%',
      cuerpo: U.barras({
        series: activas.map(function (m) {
          var p = asistenciaDeMateria(m.id);
          return { etiqueta: m.nombre, valor: p, color: p >= 90 ? 'var(--ok)' : (p >= 80 ? 'var(--aviso)' : 'var(--crit)') };
        }),
        max: 100, meta: 90, formato: fmtPct
      })
    }) + '</div>');

    /* Comparativa docente */
    var filasProf = DB.profesores.map(function (p) {
      var r = Q.ratingProfesor(p.id, false) || {};
      var mats = Q.materiasDeProfesor(p.id);
      return {
        profesor: celdaPersona(p, esc(p.titulo || '')),
        grupos: '<span class="mono">' + mats.length + '</span>',
        alumnos: '<span class="mono">' + alumnosDeProfesor(p.id) + '</span>',
        promedio: nota(promedioProfesor(p.id)),
        asistencia: '<span class="mono">' + (mats.length
          ? Math.round(mats.reduce(function (s, m) { return s + asistenciaDeMateria(m.id); }, 0) / mats.length)
          : 0) + '%</span>',
        valoracion: U.estrellas(num(r.promedio)) + '<div><small class="silencio">' + num(r.total) + ' reseñas</small></div>'
      };
    });

    h.push('<div class="col-6">' + U.panel({
      titulo: 'Comparativa del claustro',
      sub: 'Carga, resultados y valoración de cada persona docente',
      cuerpo: tabla([
        { clave: 'profesor', titulo: 'Persona docente', html: true },
        { clave: 'grupos', titulo: 'Grupos', align: 'num', html: true },
        { clave: 'alumnos', titulo: 'Alumnos', align: 'num', html: true },
        { clave: 'promedio', titulo: 'Promedio', align: 'num', html: true },
        { clave: 'asistencia', titulo: 'Asistencia', align: 'num', html: true },
        { clave: 'valoracion', titulo: 'Valoración', html: true }
      ], filasProf, 'Sin claustro registrado.')
    }) + '</div>');

    /* Avance de captura */
    var filasCap = activas.map(function (m) {
      var c = capturaMateria(m);
      var pr = Q.profesor(m.profesorId);
      return {
        materia: '<div><strong>' + esc(m.nombre) + '</strong><div><small class="silencio mono">' + esc(m.codigo) + '</small></div></div>',
        profesor: esc(pr ? pr.nombre : '—'),
        esperado: '<span class="mono">' + c.hechas + ' / ' + c.esperadas + '</span>' +
          '<div><small class="silencio">' + c.debidas + ' de ' + c.evaluaciones + ' evaluaciones ya aplicadas</small></div>',
        avance: '<div style="min-width:130px">' + U.progreso(c.pct, c.pct >= 100 ? 'ok' : (c.pct >= 80 ? 'aviso' : 'crit')) +
          '<small class="mono silencio">' + c.pct + '%</small></div>',
        ciclo: '<span class="mono">' + c.totalCiclo + '</span>',
        estado: c.pct >= 100 ? U.badge('Al corriente', 'ok') : (c.pct >= 80 ? U.badge('Con rezago', 'aviso') : U.badge('Atrasada', 'crit'))
      };
    });

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Avance de captura de calificaciones',
      sub: 'Notas capturadas sobre las esperadas al ' + U.fecha(isoHoy(), 'larga') +
        ' — sólo cuentan las evaluaciones cuya fecha ya pasó',
      cuerpo: tabla([
        { clave: 'materia', titulo: 'Materia', html: true },
        { clave: 'profesor', titulo: 'Imparte', html: true },
        { clave: 'esperado', titulo: 'Capturadas / esperadas', align: 'num', html: true },
        { clave: 'avance', titulo: 'Avance', html: true },
        { clave: 'ciclo', titulo: 'Total del ciclo', align: 'num', html: true },
        { clave: 'estado', titulo: 'Estado', html: true }
      ], filasCap, 'No hay materias activas.')
    }) + '</div>');

    return U.seccion({
      titulo: 'Académico',
      sub: 'Resultados del colegio y vigilancia de la captura de calificaciones',
      cuerpo: '<div class="rejilla">' + h.join('') + '</div>'
    });
  }

  /* ============================================================ RESEÑAS ==== */

  function seccionResenas() {
    var todas = DB.resenas.slice().sort(function (a, b) {
      return a.fecha < b.fecha ? 1 : (a.fecha > b.fecha ? -1 : 0);
    });
    var porProfesor = estado.fResProfesor === 'todos' ? todas : todas.filter(function (r) {
      return r.profesorId === estado.fResProfesor;
    });
    var conteo = { todas: porProfesor.length, pendiente: 0, publica: 0, oculta: 0 };
    porProfesor.forEach(function (r) {
      if (conteo[r.estado] !== undefined) conteo[r.estado]++;
    });
    var lista = estado.fResEstado === 'todas' ? porProfesor : porProfesor.filter(function (r) {
      return r.estado === estado.fResEstado;
    });

    var pestanas = [
      { id: 'todas', texto: 'Todas', n: conteo.todas },
      { id: 'pendiente', texto: 'Pendientes', n: conteo.pendiente },
      { id: 'publica', texto: 'Publicadas', n: conteo.publica },
      { id: 'oculta', texto: 'Ocultas', n: conteo.oculta }
    ].map(function (t) {
      return '<button type="button" class="pestana' + (estado.fResEstado === t.id ? ' pestana-activa' : '') + '" ' +
        'data-accion="dir:filtroResenaEstado" ' + U.attr({ 'data-args': { v: t.id } }) + '>' +
        esc(t.texto) + '<span class="conteo">' + t.n + '</span></button>';
    }).join('');

    var filtroProf = '<select class="selec" style="width:auto;min-width:240px" aria-label="Filtrar por persona docente" ' +
      'data-cambio="dir:filtroResenaProfesor">' +
      opciones([{ v: 'todos', t: 'Todo el claustro' }].concat(DB.profesores.map(function (p) {
        return { v: p.id, t: p.nombre };
      })), estado.fResProfesor) + '</select>';

    var cuerpo = lista.length ? lista.map(function (r) {
      var pr = Q.profesor(r.profesorId);
      var al = Q.alumno(r.alumnoId);
      var m = Q.materia(r.materiaId);
      var autor = r.anonima
        ? '<span class="chip">' + U.icono('usuario', 14) + ' Reseña anónima</span>'
        : (al ? '<span class="fila gap-1">' + U.avatar(al, 'xs') + '<span>' + esc(al.nombre) + '</span></span>'
              : '<span class="silencio">Autor no disponible</span>');
      var acc = r.estado === 'publica'
        ? '<button type="button" class="btn btn-sm btn-peligro" data-accion="dir:pedirOcultar" ' +
          U.attr({ 'data-args': { id: r.id } }) + '>' + U.icono('ojo-cerrado', 15) + ' Ocultar</button>'
        : (r.estado === 'pendiente'
          ? '<span class="silencio"><small>Sólo ' + esc(pr ? pr.nombre : 'la persona docente') + ' puede publicarla</small></span>'
          : '<span class="silencio"><small>Fuera del perfil público</small></span>');
      return '<div class="resena">' +
        '<div class="entre envuelve">' +
        '<div class="fila envuelve gap-1">' + U.estrellas(num(r.estrellas)) + badgeResena(r.estado) +
        (m ? U.chip(m.codigo + ' · ' + m.nombre) : '') + '</div>' +
        '<div class="fila gap-1">' + acc + '</div>' +
        '</div>' +
        '<div class="cuerpo">' + esc(r.comentario) + '</div>' +
        '<div class="meta fila envuelve gap-1 mt-1">' + autor + '<span>·</span>' +
        '<span>Sobre ' + esc(pr ? pr.nombre : '—') + '</span><span>·</span>' +
        '<span>' + esc(U.fecha(r.fecha, 'corta')) + '</span>' +
        '<span class="crece"></span>' +
        '<span class="mono">' + ['claridad', 'dominio', 'trato', 'puntualidad'].map(function (c) {
          return c.charAt(0).toUpperCase() + ' ' + num((r.criterios || {})[c]);
        }).join(' · ') + '</span>' +
        '</div>' +
        (r.respuesta ? '<div class="respuesta"><span class="quien">Respuesta de ' + esc(pr ? pr.nombre : 'la persona docente') + '</span>' +
          esc(r.respuesta.texto) + '</div>' : '') +
        '</div>';
    }).join('') : U.vacio({
      icono: 'estrella', titulo: 'Sin reseñas con estos filtros',
      texto: 'Cambia el estado o la persona docente para ver el resto de la retroalimentación.'
    });

    return U.seccion({
      titulo: 'Reseñas',
      sub: 'Retroalimentación de los alumnos sobre el claustro',
      cuerpo: '<div class="caja-suave mb-2">' + U.icono('info', 16) +
        ' <strong>La dirección ve todas las reseñas, incluidas las pendientes y las ocultas, pero no puede publicarlas:</strong> ' +
        'autorizar una reseña pendiente le corresponde únicamente a la persona docente evaluada. ' +
        'La dirección sí puede retirar del sitio público una reseña ya publicada que resulte inapropiada.</div>' +
        U.panel({
          titulo: 'Todas las reseñas del colegio',
          acciones: filtroProf,
          cuerpo: '<div class="pestanas">' + pestanas + '</div>' + cuerpo
        })
    });
  }

  /* ============================================================= AVISOS ==== */

  function seccionAvisos() {
    var lista = DB.avisos.slice().sort(function (a, b) {
      return a.fecha < b.fecha ? 1 : (a.fecha > b.fecha ? -1 : 0);
    });

    var items = lista.length ? lista.map(function (av) {
      var autor = quien(av.autorId);
      var m = av.materiaId ? Q.materia(av.materiaId) : null;
      return '<li class="lista-item">' + (autor ? U.avatar(autor, 'sm') : U.icono('campana', 18)) +
        '<div class="crece">' +
        '<div class="fila envuelve gap-1"><span class="t">' + esc(av.titulo) + '</span>' +
        (av.prioridad === 'alta' ? U.badge('Prioridad alta', 'crit') : U.badge('Normal', 'neutro')) +
        (av.ambito === 'escuela' ? U.chip('Todo el colegio') : U.chip(m ? m.codigo + ' · ' + m.nombre : 'Materia')) +
        '</div>' +
        '<div class="d">' + esc(autor ? autor.nombre : 'Dirección') + ' · ' + esc(U.fecha(av.fecha, 'relativa')) + '</div>' +
        '<p class="mt-1">' + esc(av.cuerpo) + '</p>' +
        '</div></li>';
    }).join('') : '';

    var opcAmbito = [{ v: 'escuela', t: 'Todo el colegio' }].concat(materiasActivas().map(function (m) {
      return { v: m.id, t: m.codigo + ' · ' + m.nombre };
    }));

    return U.seccion({
      titulo: 'Avisos',
      sub: 'Comunicación oficial del colegio',
      cuerpo: '<div class="rejilla">' +
        '<div class="col-8">' + U.panel({
          titulo: 'Avisos publicados',
          sub: lista.length + ' en el ciclo',
          cuerpo: items ? '<ul class="lista">' + items + '</ul>' : U.vacio({
            icono: 'campana', titulo: 'Sin avisos', texto: 'Publica el primero desde el formulario de la derecha.'
          })
        }) + '</div>' +
        '<div class="col-4">' + U.panel({
          titulo: 'Publicar un aviso',
          sub: 'Se firma con el nombre de la dirección',
          cuerpo: forma({
            accion: 'dir:publicarAviso',
            campos: campo({ nombre: 'titulo', etiqueta: 'Título', requerido: true, col: 'col-12', id: 'av-tit' }) +
              campo({ nombre: 'ambito', tipo: 'selec', etiqueta: 'Ámbito', col: 'col-12', id: 'av-amb', opciones: opcAmbito }) +
              campo({
                nombre: 'prioridad', tipo: 'selec', etiqueta: 'Prioridad', col: 'col-12', id: 'av-pri',
                opciones: [{ v: 'normal', t: 'Normal' }, { v: 'alta', t: 'Alta' }]
              }) +
              campo({ nombre: 'cuerpo', tipo: 'area', filas: 5, etiqueta: 'Cuerpo del aviso', requerido: true, col: 'col-12', id: 'av-cue' }),
            acciones: btnEnviar('Publicar aviso')
          })
        }) + '</div>' +
        '</div>'
    });
  }

  /* ============================================================ COLEGIO ==== */

  function seccionColegio() {
    var e = DB.escuela;
    var d = DB.direccion;
    var conteos = [
      ['Alumnos', DB.alumnos.length], ['Personas docentes', DB.profesores.length],
      ['Materias', DB.materias.length], ['Inscripciones', DB.inscripciones.length],
      ['Evaluaciones', DB.evaluaciones.length], ['Calificaciones', DB.calificaciones.length],
      ['Registros de asistencia', DB.asistencias.length], ['Tareas', DB.tareas.length],
      ['Entregas', DB.entregas.length], ['Materiales', DB.materiales.length],
      ['Avisos', DB.avisos.length], ['Pagos', DB.pagos.length],
      ['Reseñas', DB.resenas.length], ['Bitácora', DB.bitacora.length]
    ];

    var formaEscuela = forma({
      accion: 'dir:guardarEscuela',
      campos: campo({ nombre: 'nombre', etiqueta: 'Nombre del colegio', valor: e.nombre, requerido: true, col: 'col-6', id: 'es-nom' }) +
        campo({ nombre: 'lema', etiqueta: 'Lema', valor: e.lema, col: 'col-6', id: 'es-lema' }) +
        campo({ nombre: 'ciclo', etiqueta: 'Ciclo escolar', valor: e.ciclo, requerido: true, col: 'col-4', id: 'es-ciclo' }) +
        campo({ nombre: 'telefono', tipo: 'tel', etiqueta: 'Teléfono', valor: e.telefono, col: 'col-4', id: 'es-tel' }) +
        campo({ nombre: 'email', tipo: 'email', etiqueta: 'Correo de contacto', valor: e.email, col: 'col-4', id: 'es-mail' }) +
        campo({ nombre: 'direccion', etiqueta: 'Dirección', valor: e.direccion, col: 'col-8', id: 'es-dir' }) +
        campo({ nombre: 'ciudad', etiqueta: 'Ciudad', valor: e.ciudad, col: 'col-4', id: 'es-ciu' }) +
        campo({ nombre: 'sitio', etiqueta: 'Sitio', valor: e.sitio, col: 'col-4', id: 'es-sitio' }) +
        campo({ nombre: 'horarioAtencion', etiqueta: 'Horario de atención', valor: e.horarioAtencion, col: 'col-8', id: 'es-hor' }) +
        campo({ nombre: 'colegiaturaMensual', tipo: 'number', etiqueta: 'Colegiatura mensual (MXN)', valor: num(e.colegiaturaMensual), min: 0, paso: 50, col: 'col-6', id: 'es-col' }) +
        campo({ nombre: 'recargoPct', tipo: 'number', etiqueta: 'Recargo por mora (%)', valor: num(e.recargoPct), min: 0, max: 50, col: 'col-6', id: 'es-rec' }) +
        campo({ nombre: 'mision', tipo: 'area', filas: 2, etiqueta: 'Misión', valor: e.mision, col: 'col-12', id: 'es-mis' }) +
        campo({ nombre: 'acercaDe', tipo: 'area', filas: 5, etiqueta: 'Descripción para el sitio público', valor: e.acercaDe, col: 'col-12', id: 'es-desc' }),
      acciones: '<a class="btn" href="#/publico">' + U.icono('ojo', 15) + ' Ver el sitio público</a>' + btnEnviar('Guardar y publicar')
    });

    var h = [];
    h.push('<div class="col-8">' + U.panel({
      titulo: 'Identidad y operación',
      sub: 'Lo que se guarda aquí se refleja de inmediato en el sitio público',
      cuerpo: formaEscuela
    }) + '</div>');

    h.push('<div class="col-4">' + U.panel({
      titulo: 'Perfil de la dirección',
      cuerpo: '<div class="centro mb-2">' + U.avatar(d, 'xl') + '</div>' +
        '<div class="txt-c"><h3 class="destacado">' + esc(d.nombre) + '</h3>' +
        '<div class="silencio">' + esc(d.cargo) + '</div></div>' +
        '<div class="separador"></div>' +
        '<div class="campo"><label class="campo-etiqueta" for="dir-foto">Fotografía del perfil</label>' +
        '<input class="entrada" id="dir-foto" type="file" accept="image/*" data-cambio="dir:foto">' +
        '<span class="campo-ayuda">La imagen se guarda dentro de la demostración, en este mismo navegador.</span></div>' +
        '<div class="pila">' +
        '<div class="dato"><span class="e">Correo</span><span class="v">' + esc(d.email) + '</span></div>' +
        '<div class="dato"><span class="e">Teléfono</span><span class="v mono">' + esc(d.telefono) + '</span></div>' +
        '<div class="dato"><span class="e">En el cargo desde</span><span class="v">' + esc(U.fecha(d.desde, 'larga')) + '</span></div>' +
        '</div>' +
        (d.bio ? '<div class="separador"></div><p class="silencio">' + esc(d.bio) + '</p>' : '') +
        '<a class="btn btn-suave btn-bloque mt-2" href="#/publico">' + U.icono('liga', 15) + ' Abrir el sitio público</a>'
    }) + '</div>');

    h.push('<div class="col-12">' + U.panel({
      titulo: 'Datos de la demostración',
      sub: 'Todo vive en este navegador; nada sale de tu equipo',
      cuerpo: '<div class="datos-rejilla">' + conteos.map(function (c) {
        return '<div class="dato"><span class="e">' + esc(c[0]) + '</span><span class="v mono"><strong>' + c[1] + '</strong></span></div>';
      }).join('') + '</div>' +
        '<div class="separador"></div>' +
        '<div class="entre envuelve">' +
        '<div class="crece"><strong>Reiniciar la demostración</strong>' +
        '<div class="silencio"><small>Vuelve a sembrar los datos originales del Colegio Altamira.</small></div></div>' +
        '<button type="button" class="btn btn-peligro" data-accion="dir:pedirReinicio">' +
        U.icono('alerta', 15) + ' Reiniciar demostración</button>' +
        '</div>'
    }) + '</div>');

    return U.seccion({
      titulo: 'Colegio',
      sub: 'Identidad institucional, perfil de la dirección y datos de la demostración',
      cuerpo: '<div class="rejilla">' + h.join('') + '</div>'
    });
  }

  /* ============================================================= MODALES ==== */

  function modalAlumno(a) {
    U.modal({
      titulo: a ? 'Editar a ' + a.nombre : 'Nuevo alumno',
      sub: a ? 'Matrícula ' + a.matricula : 'La matrícula se asigna automáticamente',
      ancho: 'ancho',
      cuerpo: forma({
        accion: a ? 'dir:guardarAlumno' : 'dir:crearAlumno',
        args: a ? { id: a.id } : null,
        campos: camposAlumno(a),
        acciones: btnCancelar() + btnEnviar(a ? 'Guardar cambios' : 'Dar de alta')
      })
    });
  }

  function modalProfesor(p) {
    U.modal({
      titulo: p ? 'Editar a ' + p.nombre : 'Nueva persona docente',
      sub: p ? 'Clave ' + (p.clave || '—') : 'La clave se asigna automáticamente',
      ancho: 'ancho',
      cuerpo: forma({
        accion: p ? 'dir:guardarProfesor' : 'dir:crearProfesor',
        args: p ? { id: p.id } : null,
        campos: camposProfesor(p),
        acciones: btnCancelar() + btnEnviar(p ? 'Guardar cambios' : 'Dar de alta')
      })
    });
  }

  function modalMateria() {
    U.modal({
      titulo: 'Nueva materia',
      sub: 'Se abre activa y aparece de inmediato en el horario semanal',
      ancho: 'ancho',
      cuerpo: forma({
        accion: 'dir:crearMateria',
        campos: camposMateria(),
        acciones: btnCancelar() + btnEnviar('Crear materia')
      })
    });
  }

  function modalEstatus(a) {
    var opcs = [
      { v: 'activo', t: 'Activo', d: 'Acceso completo al portal y a la inscripción de materias.' },
      { v: 'condicionado', t: 'Condicionado', d: 'Sigue en clases, con seguimiento académico obligatorio.' },
      { v: 'baja', t: 'Baja', d: 'Sale del padrón activo y deja de contar en los indicadores.' }
    ].filter(function (o) { return o.v !== a.estatus; });

    U.modal({
      titulo: 'Cambiar estatus',
      sub: a.nombre + ' · hoy está como ' + a.estatus,
      cuerpo: '<ul class="lista">' + opcs.map(function (o) {
        return '<li><button type="button" class="lista-item" data-accion="dir:pedirEstatus" ' +
          U.attr({ 'data-args': { id: a.id, estatus: o.v } }) + '>' +
          '<span class="crece"><span class="t" style="display:block">Pasar a «' + esc(o.t) + '»</span>' +
          '<span class="d" style="display:block">' + esc(o.d) + '</span></span>' +
          U.icono('flecha-der', 16) + '</button></li>';
      }).join('') + '</ul>',
      acciones: btnCancelar()
    });
  }

  function modalPago(p) {
    var a = Q.alumno(p.alumnoId);
    U.modal({
      titulo: 'Registrar pago',
      sub: (a ? a.nombre + ' · ' : '') + p.concepto,
      cuerpo: '<div class="caja-suave mb-2">' +
        '<div class="entre"><span>Monto</span><strong class="mono">' + U.moneda(num(p.monto)) + '</strong></div>' +
        (num(p.recargo) ? '<div class="entre"><span>Recargo por mora</span><strong class="mono nota-baja">' +
          U.moneda(num(p.recargo)) + '</strong></div>' : '') +
        '<div class="entre"><span>Vence</span><span class="mono">' + esc(U.fecha(p.vence, 'corta')) + '</span></div>' +
        '</div>' +
        forma({
          accion: 'dir:guardarPago', args: { id: p.id },
          campos: campo({
            nombre: 'metodo', tipo: 'selec', etiqueta: 'Método de pago', col: 'col-12', id: 'pg-met',
            opciones: METODOS.map(function (m) { return { v: m, t: m }; })
          }) +
            campo({ nombre: 'referencia', etiqueta: 'Referencia', valor: p.referencia, requerido: true, col: 'col-12', id: 'pg-ref' }),
          acciones: btnCancelar() + btnEnviar('Marcar como pagado')
        })
    });
  }

  function modalColegiaturas() {
    var lista = periodosCiclo();
    var opcs = lista.map(function (p) {
      var ya = DB.pagos.filter(function (x) { return x.periodo === p; }).length;
      return { v: p, t: mesLargo(p) + (ya ? ' · ' + ya + ' ya generadas' : ' · sin generar') };
    });
    var sugerido = '';
    lista.forEach(function (p) {
      if (!sugerido && !DB.pagos.some(function (x) { return x.periodo === p; })) sugerido = p;
    });
    if (!sugerido) sugerido = lista[lista.length - 1];

    U.modal({
      titulo: 'Generar colegiaturas',
      sub: 'Se crea un cargo pendiente por cada alumno activo',
      cuerpo: '<div class="caja-suave mb-2">Colegiatura base ' + U.moneda(num(DB.escuela.colegiaturaMensual)) +
        ', menos la beca de cada alumno. No se duplican los cargos que ya existan en el periodo.</div>' +
        forma({
          accion: 'dir:generarColegiaturas',
          campos: campo({ nombre: 'periodo', tipo: 'selec', etiqueta: 'Periodo', valor: sugerido, col: 'col-12', id: 'gc-per', opciones: opcs }),
          acciones: btnCancelar() + btnEnviar('Generar')
        })
    });
  }

  /* ============================================================ ACCIONES ==== */

  var acciones = {

    /* --- alumnos --- */
    'dir:buscarAlumno': function (args, ev, el) {
      estado.qAlumno = el.value;
      estado.foco = 'dir-busca-alumno';
      App.refrescar();
    },
    'dir:filtroEstatus': function (args, ev, el) {
      estado.fEstatus = el.value;
      estado.foco = null;
      App.refrescar();
    },
    'dir:nuevoAlumno': function () { modalAlumno(null); },
    'dir:editarAlumno': function (args) {
      var a = Q.alumno(args.id);
      if (!a) { U.toast('No encontramos ese alumno.', 'crit'); return; }
      modalAlumno(a);
    },
    'dir:crearAlumno': function (args) {
      var datos = datosAlumnoDeForma((args && args.datos) || {});
      if (!validaAlumno(datos)) return;
      tras(M.crearAlumno(datos), 'Alumno dado de alta.');
    },
    'dir:guardarAlumno': function (args) {
      var datos = datosAlumnoDeForma((args && args.datos) || {});
      if (!validaAlumno(datos)) return;
      tras(M.actualizarAlumno(args.id, datos), 'Datos del alumno actualizados.');
    },
    'dir:guardarNotas': function (args) {
      var d = (args && args.datos) || {};
      tras(M.actualizarAlumno(args.id, { notas: String(d.notas || '') }), 'Notas internas guardadas.');
    },
    'dir:menuEstatus': function (args) {
      var a = Q.alumno(args.id);
      if (!a) { U.toast('No encontramos ese alumno.', 'crit'); return; }
      modalEstatus(a);
    },
    'dir:pedirEstatus': function (args) {
      var a = Q.alumno(args.id);
      if (!a) return;
      var textos = {
        activo: 'Recupera el acceso completo y vuelve a contar en los indicadores del colegio.',
        condicionado: 'Queda bajo seguimiento académico: conserva sus materias y aparece marcado en el tablero.',
        baja: 'Sale del padrón activo, deja de contar en los indicadores y ya no se le generan colegiaturas.'
      };
      U.cerrarModal();
      U.confirmar({
        titulo: 'Cambiar el estatus de ' + a.nombre,
        texto: 'Pasará de «' + a.estatus + '» a «' + args.estatus + '». ' + (textos[args.estatus] || ''),
        textoOk: 'Cambiar estatus',
        peligro: args.estatus === 'baja',
        accion: 'dir:cambiarEstatus',
        args: { id: a.id, estatus: args.estatus }
      });
    },
    'dir:cambiarEstatus': function (args) {
      tras(M.cambiarEstatusAlumno(args.id, args.estatus), 'Estatus actualizado.');
    },
    'dir:inscribir': function (args) {
      var d = (args && args.datos) || {};
      if (!d.materiaId) { U.toast('Elige una materia.', 'crit'); return; }
      tras(M.inscribir(args.id, d.materiaId), 'Alumno inscrito en la materia.');
    },
    'dir:pedirBaja': function (args) {
      var a = Q.alumno(args.id), m = Q.materia(args.materiaId);
      if (!a || !m) return;
      U.confirmar({
        titulo: 'Dar de baja de la materia',
        texto: a.nombre + ' dejará de aparecer en las listas de ' + m.nombre +
          '. Sus calificaciones y su asistencia de esa materia dejan de contar en el promedio general.',
        textoOk: 'Dar de baja',
        peligro: true,
        accion: 'dir:desinscribir',
        args: { id: a.id, materiaId: m.id }
      });
    },
    'dir:desinscribir': function (args) {
      tras(M.desinscribir(args.id, args.materiaId), 'Alumno dado de baja de la materia.');
    },

    /* --- profesores --- */
    'dir:nuevoProfesor': function () { modalProfesor(null); },
    'dir:crearProfesor': function (args) {
      var datos = datosProfesorDeForma((args && args.datos) || {});
      if (!validaProfesor(datos)) return;
      tras(M.crearProfesor(datos), 'Persona docente dada de alta.');
    },
    'dir:guardarProfesor': function (args) {
      var d = (args && args.datos) || {};
      var datos = datosProfesorDeForma(d);
      if (!validaProfesor(datos)) return;
      /* Sólo se tocan los campos que el formulario en turno realmente trae:
         así una forma corta nunca borra el horario de asesoría ni el perfil público. */
      if (d.horarioAsesoria !== undefined) datos.horarioAsesoria = String(d.horarioAsesoria).trim();
      if (d.perfilPublico !== undefined) datos.perfilPublico = !!d.perfilPublico;
      tras(M.actualizarProfesor(args.id, datos), 'Datos de la persona docente actualizados.');
    },
    'dir:asignarMateria': function (args) {
      var d = (args && args.datos) || {};
      if (!d.materiaId) { U.toast('Elige una materia.', 'crit'); return; }
      tras(M.actualizarMateria(d.materiaId, { profesorId: args.id }), 'Materia reasignada.');
    },
    'dir:reasignarMateria': function (args, ev, el) {
      tras(M.actualizarMateria(args.id, { profesorId: el.value }), 'Materia reasignada.');
    },

    /* --- materias --- */
    'dir:nuevaMateria': function () { modalMateria(); },
    'dir:crearMateria': function (args) {
      var d = (args && args.datos) || {};
      var datos = {
        codigo: String(d.codigo || '').trim().toUpperCase(),
        nombre: String(d.nombre || '').trim(),
        profesorId: d.profesorId,
        creditos: num(d.creditos),
        aula: String(d.aula || '').trim(),
        cupo: num(d.cupo),
        descripcion: String(d.descripcion || '').trim(),
        estatus: 'activa',
        horario: []
      };
      if (datos.codigo.length < 3) { U.toast('El código de la materia es demasiado corto.', 'crit'); return; }
      if (datos.nombre.length < 4) { U.toast('Escribe el nombre completo de la materia.', 'crit'); return; }
      if (!datos.profesorId) { U.toast('Asigna una persona docente.', 'crit'); return; }
      if (datos.cupo < 1) { U.toast('El cupo debe ser al menos de una persona.', 'crit'); return; }
      if (d.dia && d.inicio && d.fin) {
        if (String(d.fin) <= String(d.inicio)) { U.toast('La hora de fin debe ser posterior a la de inicio.', 'crit'); return; }
        datos.horario.push({ dia: d.dia, inicio: d.inicio, fin: d.fin });
      }
      tras(M.crearMateria(datos), 'Materia creada.');
    },
    'dir:pedirArchivar': function (args) {
      var m = Q.materia(args.id);
      if (!m) return;
      U.confirmar({
        titulo: 'Archivar ' + m.nombre,
        texto: 'La materia sale del horario semanal y de la oferta del ciclo. Las calificaciones ya capturadas se conservan.',
        textoOk: 'Archivar',
        peligro: true,
        accion: 'dir:archivarMateria',
        args: { id: m.id }
      });
    },
    'dir:archivarMateria': function (args) {
      tras(M.archivarMateria(args.id), 'Materia archivada.');
    },

    /* --- finanzas --- */
    'dir:filtroPagoEstado': function (args, ev, el) { estado.fPagoEstado = el.value; App.refrescar(); },
    'dir:filtroPagoAlumno': function (args, ev, el) { estado.fPagoAlumno = el.value; App.refrescar(); },
    'dir:modalPago': function (args) {
      var p = null;
      DB.pagos.forEach(function (x) { if (x.id === args.id) p = x; });
      if (!p) { U.toast('No encontramos ese movimiento.', 'crit'); return; }
      modalPago(p);
    },
    'dir:guardarPago': function (args) {
      var d = (args && args.datos) || {};
      if (!String(d.referencia || '').trim()) { U.toast('Captura la referencia del pago.', 'crit'); return; }
      tras(M.registrarPago(args.id, {
        metodo: d.metodo || METODOS[0],
        referencia: String(d.referencia).trim()
      }), 'Pago registrado.');
    },
    'dir:modalColegiaturas': function () { modalColegiaturas(); },
    'dir:generarColegiaturas': function (args) {
      var d = (args && args.datos) || {};
      if (!d.periodo) { U.toast('Elige el periodo.', 'crit'); return; }
      var antes = DB.pagos.length;
      /* Quiénes ya tenían cargo de ese periodo antes de generar: ésos se omiten. */
      var yaTenian = DB.alumnos.filter(function (a) {
        return a.estatus !== 'baja' && DB.pagos.some(function (p) {
          return p.alumnoId === a.id && p.periodo === d.periodo;
        });
      }).length;
      var r = M.generarColegiaturas(d.periodo);
      if (!r || !r.ok) {
        U.toast((r && r.error) || 'No se pudieron generar las colegiaturas.', 'crit');
        return;
      }
      var creados = (typeof r.generados === 'number') ? r.generados : (DB.pagos.length - antes);
      var omitidos = (typeof r.omitidos === 'number') ? r.omitidos : yaTenian;
      U.cerrarModal();
      U.toast(mesLargo(d.periodo) + ': ' + creados + (creados === 1 ? ' colegiatura generada' : ' colegiaturas generadas') +
        ' y ' + omitidos + (omitidos === 1 ? ' omitida' : ' omitidas'), creados ? 'ok' : 'aviso');
      App.refrescar();
    },

    /* --- reseñas --- */
    'dir:filtroResenaProfesor': function (args, ev, el) { estado.fResProfesor = el.value; App.refrescar(); },
    'dir:filtroResenaEstado': function (args) {
      var v = args && args.v;
      if (!v) return;
      estado.fResEstado = v;
      App.refrescar();
    },
    'dir:verResenasDe': function (args) {
      estado.fResProfesor = args.id;
      estado.fResEstado = 'pendiente';
      App.ir('#/direccion/resenas');
    },
    'dir:pedirOcultar': function (args) {
      var r = null;
      DB.resenas.forEach(function (x) { if (x.id === args.id) r = x; });
      if (!r) return;
      var pr = Q.profesor(r.profesorId);
      U.confirmar({
        titulo: 'Ocultar esta reseña',
        texto: 'Dejará de aparecer en el perfil público de ' + (pr ? pr.nombre : 'la persona docente') +
          ' y ya no contará en su valoración visible. La reseña no se borra: queda en el expediente ' +
          'y sólo la persona docente puede volver a publicarla.',
        textoOk: 'Ocultar reseña',
        peligro: true,
        accion: 'dir:ocultarResena',
        args: { id: r.id }
      });
    },
    'dir:ocultarResena': function (args) {
      tras(M.moderarResena(args.id, 'oculta'), 'Reseña retirada del sitio público.');
    },

    /* --- avisos --- */
    'dir:publicarAviso': function (args) {
      var d = (args && args.datos) || {};
      var titulo = String(d.titulo || '').trim();
      var cuerpo = String(d.cuerpo || '').trim();
      if (titulo.length < 4) { U.toast('El título del aviso es demasiado corto.', 'crit'); return; }
      if (cuerpo.length < 10) { U.toast('Escribe el cuerpo del aviso.', 'crit'); return; }
      var v = d.ambito || 'escuela';
      tras(M.publicarAviso({
        titulo: titulo,
        cuerpo: cuerpo,
        ambito: v === 'escuela' ? 'escuela' : 'materia',
        materiaId: v === 'escuela' ? null : v,
        prioridad: d.prioridad === 'alta' ? 'alta' : 'normal',
        autorId: DB.direccion.id,
        autorRol: 'direccion',
        fecha: isoHoy()
      }), 'Aviso publicado.');
    },

    /* --- colegio --- */
    'dir:guardarEscuela': function (args) {
      var d = (args && args.datos) || {};
      var nombre = String(d.nombre || '').trim();
      if (nombre.length < 3) { U.toast('El colegio necesita un nombre.', 'crit'); return; }
      if (num(d.colegiaturaMensual) < 0) { U.toast('La colegiatura no puede ser negativa.', 'crit'); return; }
      tras(M.actualizarEscuela({
        nombre: nombre,
        lema: String(d.lema || '').trim(),
        ciclo: String(d.ciclo || '').trim(),
        direccion: String(d.direccion || '').trim(),
        ciudad: String(d.ciudad || '').trim(),
        telefono: String(d.telefono || '').trim(),
        email: String(d.email || '').trim(),
        sitio: String(d.sitio || '').trim(),
        horarioAtencion: String(d.horarioAtencion || '').trim(),
        colegiaturaMensual: num(d.colegiaturaMensual),
        recargoPct: num(d.recargoPct),
        mision: String(d.mision || '').trim(),
        acercaDe: String(d.acercaDe || '').trim()
      }), 'Datos del colegio actualizados en el sitio público.');
    },
    'dir:foto': function (args, ev, el) {
      U.leerArchivo(el, function (archivo) {
        if (!archivo || !archivo.url) { U.toast('No se pudo leer la imagen.', 'crit'); return; }
        tras(M.subirFoto('direccion', DB.direccion.id, archivo.url), 'Fotografía actualizada.');
      });
    },
    'dir:pedirReinicio': function () {
      U.confirmar({
        titulo: 'Reiniciar la demostración',
        texto: 'Se borra todo lo capturado en este navegador —alumnos, materias, calificaciones, pagos, ' +
          'reseñas y avisos nuevos— y se vuelve a sembrar el Colegio Altamira original. ' +
          'Los cambios que hayas hecho se pierden y no hay manera de recuperarlos.',
        textoOk: 'Sí, reiniciar todo',
        peligro: true,
        accion: 'app:reiniciarDemo'
      });
    }
  };

  /* ============================================================== VISTA ==== */

  return {
    titulo: 'Dirección general',

    nav: [
      { id: 'resumen', texto: 'Resumen', icono: 'casa' },
      { id: 'alumnos', texto: 'Alumnos', icono: 'usuarios' },
      { id: 'profesores', texto: 'Profesores', icono: 'birrete' },
      { id: 'materias', texto: 'Materias', icono: 'libro' },
      { id: 'finanzas', texto: 'Finanzas', icono: 'dinero' },
      { id: 'academico', texto: 'Académico', icono: 'grafica' },
      { id: 'resenas', texto: 'Reseñas', icono: 'estrella' },
      { id: 'avisos', texto: 'Avisos', icono: 'campana' },
      { id: 'colegio', texto: 'Colegio', icono: 'engrane' }
    ],

    render: function (ctx) {
      var sec = (ctx && ctx.seccion) || 'resumen';
      var params = (ctx && ctx.params) || {};
      if (estado.seccion !== sec) { estado.seccion = sec; estado.foco = null; }

      if (sec === 'alumnos') return params.id ? expediente(params.id) : seccionAlumnos();
      if (sec === 'profesores') return params.id ? fichaProfesor(params.id) : seccionProfesores();
      if (sec === 'materias') return seccionMaterias();
      if (sec === 'finanzas') return seccionFinanzas();
      if (sec === 'academico') return seccionAcademico();
      if (sec === 'resenas') return seccionResenas();
      if (sec === 'avisos') return seccionAvisos();
      if (sec === 'colegio') return seccionColegio();
      return seccionResumen();
    },

    /* Devuelve el cursor al buscador tras repintar. */
    montado: function () {
      if (!estado.foco) return;
      var el = document.getElementById(estado.foco);
      if (!el) return;
      el.focus();
      if (el.setSelectionRange && el.type !== 'number') {
        var n = el.value.length;
        el.setSelectionRange(n, n);
      }
    },

    acciones: acciones
  };

})();

