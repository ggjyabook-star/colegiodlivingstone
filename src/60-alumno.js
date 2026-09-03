/* ============================================================================
   60-alumno.js — Panel del alumno con sesión iniciada.
   Declara: const VistaAlumno
   Todo el HTML se arma con las clases de 10-estilos.css y los componentes de U.
   ========================================================================== */

const VistaAlumno = (function () {

  /* ---------------------------------------------------------------- tablas */

  var TEXTO_CRITERIO = { 1: 'Muy bajo', 2: 'Bajo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };

  var ESTADO_ENTREGA = {
    pendiente: { texto: 'Por entregar', variante: 'neutro' },
    entregada: { texto: 'Entregada', variante: 'info' },
    revisada:  { texto: 'Revisada', variante: 'ok' },
    atrasada:  { texto: 'Atrasada', variante: 'crit' }
  };

  var ESTADO_PAGO = {
    pagado:    { texto: 'Pagado', variante: 'ok' },
    pendiente: { texto: 'Pendiente', variante: 'aviso' },
    vencido:   { texto: 'Vencido', variante: 'crit' }
  };

  var ESTADO_RESENA = {
    pendiente: { texto: 'En revisión', variante: 'aviso' },
    publica:   { texto: 'Publicada', variante: 'ok' },
    oculta:    { texto: 'No publicada', variante: 'neutro' }
  };

  var TIPO_EVAL = {
    parcial: 'Parcial', tarea: 'Tarea', proyecto: 'Proyecto',
    practica: 'Práctica', lectura: 'Lectura'
  };

  var ICONO_MATERIAL = {
    pdf: 'pdf', video: 'video', liga: 'liga', presentacion: 'presentacion', hoja: 'hoja'
  };

  var PESTANAS_TAREAS = [
    { id: 'pendiente', texto: 'Por entregar' },
    { id: 'entregada', texto: 'Entregadas' },
    { id: 'revisada',  texto: 'Revisadas' },
    { id: 'atrasada',  texto: 'Atrasadas' }
  ];

  /* ------------------------------------------------------------ utilidades */

  function argsAttr(o) { return U.attr({ 'data-args': o || {} }); }

  function primerNombre(n) {
    var partes = String(n || '').trim().split(/\s+/);
    return partes[0] || '';
  }

  function hay(n) { return n !== null && n !== undefined && n !== ''; }

  function esCorreo(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '')); }

  function horarioLegible(m) {
    if (!m || !m.horario || !m.horario.length) return 'Horario por confirmar';
    return m.horario.map(function (b) {
      return b.dia + ' ' + b.inicio + '–' + b.fin;
    }).join(' · ');
  }

  function varNota(n) {
    if (!hay(n)) return '';
    if (n >= 8.5) return 'ok';
    if (n >= 6) return 'aviso';
    return 'crit';
  }

  function varAsistencia(p) {
    if (p >= 90) return 'ok';
    if (p >= 80) return 'aviso';
    return 'crit';
  }

  function varAvance(p) {
    if (p >= 80) return 'ok';
    if (p >= 40) return 'aviso';
    return 'crit';
  }

  function estadoMateria(n) {
    if (!hay(n)) return { texto: 'Sin evaluar', variante: 'neutro' };
    if (n < 6) return { texto: 'Reprobada', variante: 'crit' };
    if (n < 7) return { texto: 'En riesgo', variante: 'aviso' };
    return { texto: 'Aprobada', variante: 'ok' };
  }

  function textoDias(d) {
    var abs = Math.abs(d);
    if (d < 0) return 'Venció hace ' + abs + (abs === 1 ? ' día' : ' días');
    if (d === 0) return 'Vence hoy';
    if (d === 1) return 'Vence mañana';
    return 'Faltan ' + d + ' días';
  }

  function colorDias(d) {
    if (d < 0) return 'var(--crit)';
    if (d <= 3) return 'var(--aviso)';
    return 'var(--tinta-2)';
  }

  function pct(n) { return Math.round(n || 0) + '%'; }

  /* HOY es un Date fijo; U.fecha trabaja con cadenas ISO */
  function isoHoy() {
    var m = String(HOY.getMonth() + 1);
    var d = String(HOY.getDate());
    return HOY.getFullYear() + '-' + (m.length < 2 ? '0' + m : m) + '-' + (d.length < 2 ? '0' + d : d);
  }

  /* --------------------------------------------------- envoltorios de marca */

  function pnl(o) {
    var cab = '';
    if (o.titulo || o.acciones) {
      cab = '<div class="panel-cab">' +
        '<div><h3 class="panel-tit">' + (o.titulo || '') + '</h3>' +
        (o.sub ? '<p class="panel-sub">' + o.sub + '</p>' : '') +
        '</div>' +
        (o.acciones ? '<div class="panel-acc">' + o.acciones + '</div>' : '') +
        '</div>';
    }
    return '<div class="panel' + (o.clase ? ' ' + o.clase : '') + '">' + cab +
      '<div class="panel-cuerpo' + (o.sinRelleno ? ' sin-relleno' : '') + '">' + (o.cuerpo || '') + '</div>' +
      (o.pie ? '<div class="panel-pie">' + o.pie + '</div>' : '') +
      '</div>';
  }

  function sec(o) {
    return '<section class="seccion">' +
      '<div class="seccion-cab">' +
      '<div><h2>' + (o.titulo || '') + '</h2>' +
      (o.sub ? '<div class="sub">' + o.sub + '</div>' : '') + '</div>' +
      (o.acciones ? '<div class="panel-acc">' + o.acciones + '</div>' : '') +
      '</div>' + (o.cuerpo || '') + '</section>';
  }

  function puntoMateria(m) {
    return '<span aria-hidden="true" style="display:inline-block;width:9px;height:9px;' +
      'border-radius:3px;flex:none;background:' + U.esc(m.color) + '"></span>';
  }

  function dato(etiqueta, valor, mono) {
    return '<div class="dato"><span class="e">' + U.esc(etiqueta) + '</span>' +
      '<span class="v' + (mono ? ' mono' : '') + '">' + valor + '</span></div>';
  }

  function tablaEnv(cabeza, cuerpo, pie) {
    return '<div class="tabla-envoltura"><table class="tabla">' +
      '<thead><tr>' + cabeza + '</tr></thead>' +
      '<tbody>' + cuerpo + '</tbody>' +
      (pie ? '<tfoot>' + pie + '</tfoot>' : '') +
      '</table></div>';
  }

  /* --------------------------------------------------------- filas comunes */

  function filaEntrega(it) {
    var d = Q.diasParaEntrega(it.tarea.vence);
    var est = ESTADO_ENTREGA[it.entrega ? it.entrega.estado : 'pendiente'] || ESTADO_ENTREGA.pendiente;
    return '<div class="tarjeta-plana"><div class="entre envuelve gap-2">' +
      '<div class="crece">' +
      '<div class="fila gap-1">' + puntoMateria(it.materia) +
      '<span class="etiqueta">' + U.esc(it.materia.nombre) + '</span></div>' +
      '<div><strong>' + U.esc(it.tarea.titulo) + '</strong></div>' +
      '<div class="silencio" style="font-size:.8rem">' +
      U.esc(TIPO_EVAL[it.tarea.tipo] || it.tarea.tipo) + ' · ' + it.tarea.puntos + ' puntos · ' +
      'vence el ' + U.fecha(it.tarea.vence, 'corta') + '</div>' +
      '</div>' +
      '<div class="fila gap-1 envuelve">' +
      '<span class="nowrap" style="font-weight:600;color:' + colorDias(d) + '">' + textoDias(d) + '</span>' +
      U.badge(est.texto, est.variante) +
      '</div></div></div>';
  }

  function filaAviso(av) {
    var autor = Q.persona(av.autorRol, av.autorId);
    var ambito = av.ambito === 'escuela'
      ? 'Toda la escuela'
      : ((Q.materia(av.materiaId) || {}).nombre || 'Materia');
    var alta = av.prioridad === 'alta';
    return '<div class="tarjeta-plana"><div class="franja-riesgo' + (alta ? ' alta' : '') + '">' +
      '<div class="entre envuelve gap-1">' +
      '<strong>' + U.esc(av.titulo) + '</strong>' +
      (alta ? U.badge('Prioridad alta', 'crit') : U.badge('Informativo', 'neutro')) +
      '</div>' +
      '<div class="silencio" style="font-size:.79rem">' +
      U.esc(ambito) + ' · ' + U.esc(autor ? autor.nombre : 'Colegio Altamira') +
      ' · ' + U.fecha(av.fecha, 'relativa') + '</div>' +
      '<p class="mt-1" style="font-size:.87rem">' + U.esc(av.cuerpo) + '</p>' +
      '</div></div>';
  }

  function filaMaterial(mt, materia) {
    var ico = ICONO_MATERIAL[mt.tipo] || 'archivo';
    return '<div class="tarjeta-plana"><div class="entre envuelve gap-2">' +
      '<div class="fila gap-2 crece">' +
      '<span class="centro" style="width:34px;height:34px;flex:none;border-radius:var(--r-md);' +
      'background:var(--superficie-3);color:var(--tinta-2)">' + U.icono(ico, 17) + '</span>' +
      '<div class="crece">' +
      '<div><strong>' + U.esc(mt.titulo) + '</strong></div>' +
      '<div class="silencio" style="font-size:.8rem">' + U.esc(mt.descripcion) + '</div>' +
      '<div class="silencio" style="font-size:.76rem">' +
      (materia ? U.esc(materia.nombre) + ' · ' : '') +
      U.fecha(mt.subidoEl, 'corta') + ' · ' + U.esc(mt.tamano) + '</div>' +
      '</div></div>' +
      '<button type="button" class="btn btn-sm btn-suave" data-accion="al:abrirMaterial" ' +
      argsAttr({ id: mt.id }) + '>' + U.icono('ojo', 14) + ' Abrir</button>' +
      '</div></div>';
  }

  /* ==================================================== SECCIÓN · RESUMEN == */

  function tarjetaAtencion(a, mats) {
    var pagos = Q.pagosDeAlumno(a.id);
    var vencidos = pagos.filter(function (p) { return p.estado === 'vencido'; });
    var reprobadas = mats.filter(function (m) {
      var p = Q.promedioMateria(a.id, m.id);
      return hay(p) && p < 6;
    });
    var atrasadas = Q.tareasDeAlumno(a.id).filter(function (it) {
      return it.entrega && it.entrega.estado === 'atrasada';
    });

    var puntos = [];
    if (vencidos.length) {
      var saldo = 0, recargo = 0;
      vencidos.forEach(function (p) { saldo += p.monto + (p.recargo || 0); recargo += (p.recargo || 0); });
      puntos.push({
        icono: 'dinero',
        texto: (vencidos.length === 1 ? 'Tienes un pago vencido' : 'Tienes ' + vencidos.length + ' pagos vencidos') +
          ' por ' + U.moneda(saldo) + ', con ' + U.moneda(recargo) + ' de recargo aplicado.',
        cta: 'Ver estado de cuenta', ruta: '#/alumno/pagos'
      });
    }
    if (reprobadas.length) {
      puntos.push({
        icono: 'alerta',
        texto: 'Vas reprobando ' + reprobadas.map(function (m) {
          return U.esc(m.nombre) + ' (' + U.notaTexto(Q.promedioMateria(a.id, m.id)) + ')';
        }).join(', ') + '. Aún falta el tercer parcial para levantar el promedio.',
        cta: 'Ver calificaciones', ruta: '#/alumno/calificaciones'
      });
    }
    if (atrasadas.length) {
      puntos.push({
        icono: 'portapapeles',
        texto: (atrasadas.length === 1 ? 'Una entrega quedó atrasada' : atrasadas.length + ' entregas quedaron atrasadas') +
          ': ' + U.esc(atrasadas[0].tarea.titulo) + (atrasadas.length > 1 ? ' y otras más.' : '.'),
        cta: 'Ver tareas', ruta: '#/alumno/tareas?tab=atrasada'
      });
    }

    var sev = vencidos.length || reprobadas.length ? 'alta' : (atrasadas.length ? 'media' : 'baja');
    var titulo = puntos.length ? 'Esto necesita tu atención' : 'No tienes pendientes urgentes';
    var cuerpo;
    if (puntos.length) {
      cuerpo = '<div class="pila mt-1">' + puntos.map(function (p) {
        return '<div class="entre envuelve gap-2">' +
          '<div class="fila gap-1 crece">' +
          '<span style="color:var(--crit);flex:none">' + U.icono(p.icono, 16) + '</span>' +
          '<span style="font-size:.89rem">' + p.texto + '</span></div>' +
          '<a class="btn btn-sm" href="' + p.ruta + '">' + p.cta + '</a>' +
          '</div>';
      }).join('') + '</div>';
    } else {
      cuerpo = '<p class="mt-1" style="font-size:.89rem">Tus pagos están al corriente, ninguna materia está ' +
        'reprobada y no hay entregas atrasadas. Revisa abajo las próximas fechas para que siga así.</p>';
    }

    return '<div class="tarjeta mb-2"><div class="franja-riesgo ' + sev + '">' +
      '<div class="fila gap-1"><h3>' + titulo + '</h3></div>' + cuerpo +
      '</div></div>';
  }

  function panelRendimiento(a, mats) {
    var series = [];
    mats.forEach(function (m) {
      var p = Q.promedioMateria(a.id, m.id);
      if (hay(p)) series.push({ etiqueta: m.nombre, valor: p, color: m.color });
    });
    series.sort(function (x, y) { return y.valor - x.valor; });
    var cuerpo = series.length
      ? U.barras({ series: series, max: 10, alto: 42 * series.length + 30, meta: 8 })
      : U.vacio({ icono: 'grafica', titulo: 'Sin promedios todavía', texto: 'En cuanto se capture la primera evaluación aparecerá aquí.' });
    return pnl({
      titulo: 'Rendimiento por materia',
      sub: 'Promedio ponderado de cada materia. La línea marca la meta de 8.0.',
      cuerpo: cuerpo
    });
  }

  /* El eje X no da para "Proyecto integrador": abrevia sin perder el sentido.
     La prosa de abajo sí usa el nombre completo. */
  function etiquetaEje(nombre) {
    var t = String(nombre || '')
      .replace(/^Primer\s+/i, '1er ').replace(/^Segundo\s+/i, '2.º ')
      .replace(/^Tercer\s+/i, '3er ').replace(/^Cuarto\s+/i, '4.º ');
    var corte = t.indexOf(' y ');
    if (corte > 0) t = t.slice(0, corte);
    if (t.length > 14) {
      var esp = t.lastIndexOf(' ', 14);
      t = t.slice(0, esp > 5 ? esp : 14);
    }
    return t;
  }

  function panelTendencia(a) {
    var crudos = Q.rendimientoPorParcial(a.id) || [];
    var pts = crudos.map(function (p) {
      return { etiqueta: etiquetaEje(p.etiqueta), valor: p.valor };
    });
    var frase = 'Todavía no hay suficientes evaluaciones para leer una tendencia.';
    if (crudos.length >= 2) {
      var ini = crudos[0], fin = crudos[crudos.length - 1];
      var d = Math.round((fin.valor - ini.valor) * 10) / 10;
      if (d >= 0.2) {
        frase = 'Tu promedio subió ' + d.toFixed(1) + ' puntos entre ' + U.esc(ini.etiqueta) +
          ' y ' + U.esc(fin.etiqueta) + '. Vas de menos a más.';
      } else if (d <= -0.2) {
        frase = 'Tu promedio bajó ' + Math.abs(d).toFixed(1) + ' puntos entre ' + U.esc(ini.etiqueta) +
          ' y ' + U.esc(fin.etiqueta) + '. Conviene apretar antes del tercer parcial.';
      } else {
        frase = 'Tu promedio se mantiene entre ' + U.esc(ini.etiqueta) + ' y ' + U.esc(fin.etiqueta) +
          ', con una variación de apenas ' + Math.abs(d).toFixed(1) + ' puntos.';
      }
    }
    var cuerpo = pts.length
      ? U.linea({ puntos: pts, min: 0, max: 10, alto: 220, meta: 6 }) +
        '<p class="mt-2" style="font-size:.88rem">' + frase + '</p>'
      : U.vacio({ icono: 'tendencia-arriba', titulo: 'Sin serie de tendencia', texto: frase });
    return pnl({
      titulo: 'Tendencia del ciclo',
      sub: 'Promedio por corte de evaluación. La línea marca el mínimo aprobatorio de 6.0.',
      cuerpo: cuerpo
    });
  }

  function seccionResumen(a) {
    var mats = Q.materiasDeAlumno(a.id);
    var prom = Q.promedioGeneral(a.id);
    var asis = Q.asistencia(a.id);
    var ad = Q.adeudo(a.id);
    var creditos = mats.reduce(function (s, m) { return s + (m.creditos || 0); }, 0);
    var pagos = Q.pagosDeAlumno(a.id);
    var vencidos = pagos.filter(function (p) { return p.estado === 'vencido'; });
    var deuda = ad && hay(ad.total) ? ad.total : 0;

    var kpis =
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Promedio general', icono: 'grafica',
        valor: U.notaTexto(prom), variante: varNota(prom),
        sub: mats.length + ' materias inscritas',
        pie: 'Mínima aprobatoria: 6.0'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Asistencia global', icono: 'cheque',
        valor: pct(asis.pct), variante: varAsistencia(asis.pct),
        sub: asis.presentes + ' de ' + asis.totales + ' sesiones',
        pie: 'Contadas en todas tus materias'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Créditos inscritos', icono: 'libro',
        valor: String(creditos), variante: 'marca',
        sub: 'Ciclo ' + U.esc(DB.escuela.ciclo),
        pie: 'Carga completa del periodo'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Estado de cuenta', icono: 'tarjeta',
        valor: deuda > 0 ? U.moneda(deuda) : 'Al corriente',
        variante: deuda > 0 ? (vencidos.length ? 'crit' : 'aviso') : 'ok',
        sub: deuda > 0
          ? (vencidos.length
            ? (vencidos.length === 1 ? 'Un pago vencido' : vencidos.length + ' pagos vencidos')
            : 'Saldo pendiente por cubrir')
          : 'Sin adeudos registrados',
        pie: 'Recargo por mora: ' + DB.escuela.recargoPct + '%'
      }) + '</div>';

    var prox = Q.proximasEntregas(a.id, 5);
    var panelProx = pnl({
      titulo: 'Próximas entregas',
      sub: 'Las cinco más cercanas, con los días que faltan.',
      acciones: '<a class="btn btn-sm" href="#/alumno/tareas">Ver todas</a>',
      cuerpo: prox.length
        ? '<div class="pila">' + prox.map(filaEntrega).join('') + '</div>'
        : U.vacio({ icono: 'cheque', titulo: 'Sin entregas próximas', texto: 'No tienes tareas por vencer en este momento.' })
    });

    var avisos = Q.avisosPara('alumno', a.id).slice(0, 3);
    var panelAvisos = pnl({
      titulo: 'Avisos recientes',
      sub: 'Lo último publicado por la dirección y tus profesores.',
      acciones: '<a class="btn btn-sm" href="#/alumno/avisos">Ver todos</a>',
      cuerpo: avisos.length
        ? '<div class="pila">' + avisos.map(filaAviso).join('') + '</div>'
        : U.vacio({ icono: 'campana', titulo: 'Sin avisos', texto: 'Cuando haya un aviso nuevo aparecerá aquí.' })
    });

    var mtrs = Q.materialesDeAlumno(a.id).slice(0, 4);
    var panelMtrs = pnl({
      titulo: 'Últimos materiales',
      sub: 'Lo más reciente que subieron tus profesores.',
      acciones: '<a class="btn btn-sm" href="#/alumno/materiales">Ver todos</a>',
      cuerpo: mtrs.length
        ? '<div class="pila">' + mtrs.map(function (x) { return filaMaterial(x.material, x.materia); }).join('') + '</div>'
        : U.vacio({ icono: 'archivo', titulo: 'Sin materiales', texto: 'Todavía no hay material publicado en tus materias.' })
    });

    var cabecera =
      '<div class="entre envuelve gap-2 mb-2">' +
      '<div class="fila gap-2">' + U.avatar(a, 'lg') +
      '<div><h2 class="destacado">Hola, ' + U.esc(primerNombre(a.nombre)) + '</h2>' +
      '<div class="fila gap-1 envuelve" style="font-size:.85rem">' +
      '<span class="mono">' + U.esc(a.matricula) + '</span>' +
      '<span class="silencio">·</span>' +
      '<span class="silencio">Ciclo ' + U.esc(DB.escuela.ciclo) + '</span>' +
      '</div></div></div>' +
      U.badge(a.estatus === 'activo' ? 'Inscripción activa' : 'Estatus: ' + a.estatus,
        a.estatus === 'activo' ? 'ok' : 'aviso') +
      '</div>';

    return cabecera +
      tarjetaAtencion(a, mats) +
      '<div class="rejilla mb-3">' + kpis + '</div>' +
      '<div class="rejilla">' +
      '<div class="col-6">' + panelRendimiento(a, mats) + '</div>' +
      '<div class="col-6">' + panelTendencia(a) + '</div>' +
      '<div class="col-12">' + panelProx + '</div>' +
      '<div class="col-6">' + panelAvisos + '</div>' +
      '<div class="col-6">' + panelMtrs + '</div>' +
      '</div>';
  }

  /* =================================================== SECCIÓN · MATERIAS == */

  function tarjetaMateria(a, m) {
    var prof = Q.profesor(m.profesorId);
    var prom = Q.promedioMateria(a.id, m.id);
    var av = Q.avanceMateria(a.id, m.id);
    var as = Q.asistencia(a.id, m.id);
    return '<a class="tarjeta" href="#/alumno/materias?id=' + U.esc(m.id) + '" ' +
      'style="display:flex;flex-direction:column;gap:.55rem;color:inherit;text-decoration:none">' +
      '<div class="entre gap-1">' +
      '<div class="fila gap-1">' + puntoMateria(m) +
      '<span class="mono" style="font-size:.74rem;color:var(--acento);font-weight:600">' + U.esc(m.codigo) + '</span>' +
      '</div>' + U.badge(m.creditos + ' créditos', 'neutro') +
      '</div>' +
      '<h3>' + U.esc(m.nombre) + '</h3>' +
      '<div class="fila gap-1">' + U.avatar(prof, 'xs') +
      '<span class="silencio truncar" style="font-size:.82rem">' + U.esc(prof ? prof.nombre : 'Por asignar') + '</span>' +
      '</div>' +
      '<div class="silencio" style="font-size:.79rem">' +
      U.icono('reloj', 13) + ' ' + U.esc(horarioLegible(m)) + '</div>' +
      '<div class="silencio" style="font-size:.79rem">' +
      U.icono('pin', 13) + ' Aula ' + U.esc(m.aula) + '</div>' +
      '<div class="separador" style="margin:.4rem 0"></div>' +
      '<div class="entre gap-1">' +
      '<span class="etiqueta">Promedio</span>' +
      '<span class="' + (hay(prom) ? U.claseNota(prom) : 'silencio') + '" style="font-size:1.05rem">' +
      U.notaTexto(prom) + '</span>' +
      '</div>' +
      U.progreso(av.pct, varAvance(av.pct)) +
      '<div class="entre gap-1 silencio" style="font-size:.76rem">' +
      '<span>' + av.calificadas + ' de ' + av.total + ' evaluaciones calificadas</span>' +
      '<span>Asistencia ' + pct(as.pct) + '</span>' +
      '</div>' +
      '</a>';
  }

  function detalleMateria(a, m) {
    var prof = Q.profesor(m.profesorId);
    var evs = Q.evaluacionesDeMateria(m.id);
    var prom = Q.promedioMateria(a.id, m.id);
    var grupo = Q.promedioGrupo(m.id);
    var as = Q.asistencia(a.id, m.id);
    var av = Q.avanceMateria(a.id, m.id);

    /* promedio ponderado: suma(valor × peso) / suma(peso) sobre lo ya calificado */
    var pesoCal = 0, acum = 0;
    evs.forEach(function (e) {
      var c = Q.nota(a.id, e.id);
      if (c && hay(c.valor)) { pesoCal += e.peso; acum += c.valor * e.peso; }
    });
    var ponderado = pesoCal > 0 ? Math.round((acum / pesoCal) * 10) / 10 : null;

    var cabeza = '<th>Evaluación</th><th>Tipo</th><th class="num">Peso</th>' +
      '<th>Fecha</th><th class="num">Calificación</th><th class="num">Aporte</th>';
    var filas = evs.map(function (e) {
      var c = Q.nota(a.id, e.id);
      var tiene = c && hay(c.valor);
      return '<tr' + (tiene ? '' : ' class="fila-atenuada"') + '>' +
        '<td><strong>' + U.esc(e.nombre) + '</strong></td>' +
        '<td>' + U.badge(TIPO_EVAL[e.tipo] || e.tipo, 'neutro') + '</td>' +
        '<td class="num mono">' + Math.round(e.peso * 100) + '%</td>' +
        '<td class="mono">' + U.fecha(e.fecha, 'corta') + '</td>' +
        '<td class="num">' + (tiene
          ? '<span class="' + U.claseNota(c.valor) + '">' + U.notaTexto(c.valor) + '</span>'
          : '<span class="silencio">Sin calificar</span>') + '</td>' +
        '<td class="num mono">' + (tiene ? (Math.round(c.valor * e.peso * 100) / 100).toFixed(2) : '—') + '</td>' +
        '</tr>';
    }).join('');
    var pie = '<tr><td colspan="4"><strong>Promedio ponderado sobre lo calificado</strong></td>' +
      '<td class="num ' + (hay(ponderado) ? U.claseNota(ponderado) : '') + '">' + U.notaTexto(ponderado) + '</td>' +
      '<td class="num mono">' + Math.round(pesoCal * 100) + '%</td></tr>';

    var difTexto;
    if (hay(prom) && hay(grupo)) {
      var dif = Math.round((prom - grupo) * 10) / 10;
      if (dif > 0) difTexto = 'Estás ' + dif.toFixed(1) + ' puntos por arriba del promedio del grupo.';
      else if (dif < 0) difTexto = 'Estás ' + Math.abs(dif).toFixed(1) + ' puntos por debajo del promedio del grupo.';
      else difTexto = 'Estás justo en el promedio del grupo.';
    } else {
      difTexto = 'Aún no hay promedio de grupo con qué comparar.';
    }

    var tareas = Q.tareasDeAlumno(a.id).filter(function (it) { return it.materia.id === m.id; });
    var mtrs = Q.materialesDeAlumno(a.id).filter(function (x) { return x.materia.id === m.id; });

    return U.migas([{ texto: 'Materias', ruta: '#/alumno/materias' }, { texto: m.nombre }]) +
      pnl({
        clase: 'mb-2',
        cuerpo:
          '<div class="entre envuelve gap-2">' +
          '<div class="crece">' +
          '<div class="fila gap-1">' + puntoMateria(m) +
          '<span class="mono" style="font-size:.76rem;color:var(--acento);font-weight:600">' + U.esc(m.codigo) + '</span>' +
          U.badge(m.estatus === 'activa' ? 'Materia activa' : 'Archivada', m.estatus === 'activa' ? 'ok' : 'neutro') +
          '</div>' +
          '<h2 class="destacado mt-1">' + U.esc(m.nombre) + '</h2>' +
          '<p class="silencio mt-1" style="font-size:.88rem;max-width:62ch">' + U.esc(m.descripcion) + '</p>' +
          '<div class="fila envuelve gap-1 mt-1">' +
          '<span class="chip">' + U.icono('reloj', 13) + ' ' + U.esc(horarioLegible(m)) + '</span>' +
          '<span class="chip">' + U.icono('pin', 13) + ' Aula ' + U.esc(m.aula) + '</span>' +
          '<span class="chip">' + U.icono('birrete', 13) + ' ' + m.creditos + ' créditos</span>' +
          '</div></div>' +
          '<div class="caja-suave" style="min-width:250px">' +
          '<span class="etiqueta">Imparte</span>' +
          '<div class="fila gap-1 mt-1">' + U.avatar(prof, 'md') +
          '<div><div style="font-weight:600">' + U.esc(prof ? prof.nombre : 'Por asignar') + '</div>' +
          '<div class="silencio" style="font-size:.79rem">' + U.esc(prof ? prof.titulo : '') + '</div>' +
          '</div></div>' +
          (prof ? '<div class="silencio mt-1" style="font-size:.79rem">' +
            U.icono('pin', 12) + ' ' + U.esc(prof.oficina) + '<br>' +
            U.icono('reloj', 12) + ' Asesoría: ' + U.esc(prof.horarioAsesoria) + '</div>' : '') +
          '</div></div>'
      }) +
      '<div class="rejilla mb-2">' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Tu promedio', icono: 'grafica',
        valor: U.notaTexto(prom), variante: varNota(prom),
        sub: estadoMateria(prom).texto
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Promedio del grupo', icono: 'usuarios',
        valor: U.notaTexto(grupo), variante: 'marca', sub: difTexto
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Asistencia', icono: 'cheque',
        valor: pct(as.pct), variante: varAsistencia(as.pct),
        sub: as.presentes + ' de ' + as.totales + ' sesiones'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Avance', icono: 'portapapeles',
        valor: pct(av.pct), variante: varAvance(av.pct),
        sub: av.calificadas + ' de ' + av.total + ' evaluaciones'
      }) + '</div>' +
      '</div>' +
      pnl({
        titulo: 'Desglose de evaluaciones',
        sub: 'Todas las evaluaciones del ciclo, con su peso y tu calificación.',
        sinRelleno: true,
        cuerpo: tablaEnv(cabeza, filas, pie),
        pie: 'El promedio se calcula sólo sobre las evaluaciones ya calificadas. ' +
          'El tercer parcial todavía no entra en el cálculo.'
      }) +
      '<div class="rejilla mt-2">' +
      '<div class="col-6">' + pnl({
        titulo: 'Asistencia de la materia',
        cuerpo: '<div class="centro">' + U.anillo(as.pct, {
          etiqueta: 'Asistencia',
          sub: as.presentes + ' de ' + as.totales + ' sesiones',
          variante: varAsistencia(as.pct)
        }) + '</div>'
      }) + '</div>' +
      '<div class="col-6">' + pnl({
        titulo: 'Tareas de la materia',
        cuerpo: tareas.length
          ? '<div class="pila">' + tareas.map(filaEntrega).join('') + '</div>'
          : U.vacio({ icono: 'portapapeles', titulo: 'Sin tareas', texto: 'No hay tareas publicadas en esta materia.' })
      }) + '</div>' +
      '<div class="col-12">' + pnl({
        titulo: 'Materiales de la materia',
        cuerpo: mtrs.length
          ? '<div class="pila">' + mtrs.map(function (x) { return filaMaterial(x.material, null); }).join('') + '</div>'
          : U.vacio({ icono: 'archivo', titulo: 'Sin materiales', texto: 'Todavía no hay material publicado aquí.' })
      }) + '</div>' +
      '</div>';
  }

  function seccionMaterias(a, ctx) {
    var mats = Q.materiasDeAlumno(a.id);
    var id = ctx.params && ctx.params.id;
    if (id) {
      var m = null;
      mats.forEach(function (x) { if (x.id === id) m = x; });
      if (!m) {
        return sec({
          titulo: 'Materia no disponible',
          cuerpo: pnl({
            cuerpo: U.vacio({
              icono: 'alerta', titulo: 'No encontramos esa materia',
              texto: 'La materia no existe o no estás inscrito en ella.',
              accion: '<a class="btn btn-primario" href="#/alumno/materias">Volver a mis materias</a>'
            })
          })
        });
      }
      return '<section class="seccion">' + detalleMateria(a, m) + '</section>';
    }
    return sec({
      titulo: 'Mis materias',
      sub: mats.length + ' materias inscritas en el ciclo ' + U.esc(DB.escuela.ciclo) + '. Toca una para ver el detalle.',
      cuerpo: '<div class="rejilla">' + mats.map(function (m) {
        return '<div class="col-4">' + tarjetaMateria(a, m) + '</div>';
      }).join('') + '</div>'
    });
  }

  /* ============================================== SECCIÓN · CALIFICACIONES == */

  function boletaTabla(a, mats) {
    var cols = [], pesos = {};
    mats.forEach(function (m) {
      Q.evaluacionesDeMateria(m.id).forEach(function (e) {
        if (cols.indexOf(e.nombre) === -1) { cols.push(e.nombre); pesos[e.nombre] = e.peso; }
      });
    });

    var cabeza = '<th>Materia</th>';
    cols.forEach(function (c) {
      cabeza += '<th class="num">' + U.esc(c) + '<br><span class="silencio">' +
        Math.round((pesos[c] || 0) * 100) + '%</span></th>';
    });
    cabeza += '<th class="num">Promedio</th><th>Estado</th>';

    var filas = mats.map(function (m) {
      var evs = Q.evaluacionesDeMateria(m.id);
      var tds = '<td><div class="fila gap-1">' + puntoMateria(m) +
        '<div><strong>' + U.esc(m.nombre) + '</strong>' +
        '<div class="mono silencio" style="font-size:.72rem">' + U.esc(m.codigo) + '</div></div></div></td>';
      cols.forEach(function (cn) {
        var e = null;
        evs.forEach(function (x) { if (!e && x.nombre === cn) e = x; });
        if (!e) { tds += '<td class="num silencio">—</td>'; return; }
        var c = Q.nota(a.id, e.id);
        if (!c || !hay(c.valor)) { tds += '<td class="num silencio">—</td>'; return; }
        tds += '<td class="num ' + U.claseNota(c.valor) + '">' + U.notaTexto(c.valor) + '</td>';
      });
      var p = Q.promedioMateria(a.id, m.id);
      var est = estadoMateria(p);
      tds += '<td class="num ' + (hay(p) ? U.claseNota(p) : 'silencio') + '">' + U.notaTexto(p) + '</td>';
      tds += '<td>' + U.badge(est.texto, est.variante) + '</td>';
      return '<tr>' + tds + '</tr>';
    }).join('');

    var pie = '<tr><td colspan="' + (cols.length + 1) + '"><strong>Promedio general del ciclo</strong></td>' +
      '<td class="num ' + (hay(Q.promedioGeneral(a.id)) ? U.claseNota(Q.promedioGeneral(a.id)) : '') + '">' +
      U.notaTexto(Q.promedioGeneral(a.id)) + '</td><td></td></tr>';

    return tablaEnv(cabeza, filas, pie);
  }

  function seccionCalificaciones(a) {
    var mats = Q.materiasDeAlumno(a.id);
    var conProm = [];
    mats.forEach(function (m) {
      var p = Q.promedioMateria(a.id, m.id);
      if (hay(p)) conProm.push({ materia: m, prom: p });
    });
    conProm.sort(function (x, y) { return y.prom - x.prom; });

    var aprobadas = conProm.filter(function (x) { return x.prom >= 7; }).length;
    var enRiesgo = conProm.filter(function (x) { return x.prom >= 6 && x.prom < 7; }).length;
    var reprobadas = conProm.filter(function (x) { return x.prom < 6; }).length;
    var mejor = conProm[0] || null;
    var peor = conProm.length ? conProm[conProm.length - 1] : null;

    var resumen =
      '<div class="rejilla">' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Materias aprobadas', icono: 'cheque',
        valor: String(aprobadas), variante: 'ok', sub: 'Con promedio de 7.0 o más'
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'En riesgo', icono: 'alerta',
        valor: String(enRiesgo), variante: enRiesgo ? 'aviso' : 'ok',
        sub: 'Entre 6.0 y 6.9' + (reprobadas
          ? ' · ' + (reprobadas === 1 ? 'una reprobada' : reprobadas + ' reprobadas')
          : '')
      }) + '</div>' +
      '<div class="col-3">' + U.kpi({
        etiqueta: 'Promedio general', icono: 'grafica',
        valor: U.notaTexto(Q.promedioGeneral(a.id)),
        variante: varNota(Q.promedioGeneral(a.id)), sub: 'Promedio de tus materias'
      }) + '</div>' +
      '<div class="col-3">' + pnl({
        cuerpo:
          '<span class="etiqueta">Mejor y peor promedio</span>' +
          (mejor
            ? '<div class="entre gap-1 mt-1"><span class="truncar">' + U.esc(mejor.materia.nombre) + '</span>' +
              '<strong class="' + U.claseNota(mejor.prom) + '">' + U.notaTexto(mejor.prom) + '</strong></div>'
            : '') +
          (peor
            ? '<div class="entre gap-1 mt-1"><span class="truncar">' + U.esc(peor.materia.nombre) + '</span>' +
              '<strong class="' + U.claseNota(peor.prom) + '">' + U.notaTexto(peor.prom) + '</strong></div>'
            : '<p class="silencio">Sin promedios todavía.</p>')
      }) + '</div>' +
      '</div>';

    return sec({
      titulo: 'Boleta de calificaciones',
      sub: 'Una fila por materia y una columna por evaluación del ciclo ' + U.esc(DB.escuela.ciclo) + '.',
      acciones: '<button type="button" class="btn btn-primario btn-sm" data-accion="al:boleta">' +
        U.icono('descargar', 14) + ' Descargar boleta</button>',
      cuerpo: pnl({
        titulo: 'Concentrado por evaluación',
        sub: 'El porcentaje bajo cada columna es el peso de esa evaluación.',
        sinRelleno: true,
        cuerpo: boletaTabla(a, mats),
        pie: 'Escala de 0 a 10. Mínima aprobatoria 6.0. El guion largo indica evaluación aún no calificada.'
      }) + '<div class="mt-2">' + resumen + '</div>'
    });
  }

  /* ===================================================== SECCIÓN · TAREAS == */

  function seccionTareas(a, ctx) {
    var todas = Q.tareasDeAlumno(a.id);
    var activo = (ctx.params && ctx.params.tab) || 'pendiente';
    var conteos = {};
    PESTANAS_TAREAS.forEach(function (p) { conteos[p.id] = 0; });
    todas.forEach(function (it) {
      var e = it.entrega ? it.entrega.estado : 'pendiente';
      if (conteos[e] !== undefined) conteos[e]++;
    });
    if (conteos[activo] === undefined) activo = 'pendiente';

    var items = PESTANAS_TAREAS.map(function (p) {
      return { id: p.id, texto: p.texto, conteo: conteos[p.id] };
    });

    var lista = todas.filter(function (it) {
      return (it.entrega ? it.entrega.estado : 'pendiente') === activo;
    }).sort(function (x, y) { return x.tarea.vence < y.tarea.vence ? -1 : 1; });

    var filas = lista.map(function (it) {
      var d = Q.diasParaEntrega(it.tarea.vence);
      var est = ESTADO_ENTREGA[it.entrega ? it.entrega.estado : 'pendiente'];
      var calif = it.entrega && hay(it.entrega.calificacion);
      return '<div class="tarjeta-plana"><div class="entre envuelve gap-2">' +
        '<div class="crece">' +
        '<div class="fila gap-1">' + puntoMateria(it.materia) +
        '<span class="etiqueta">' + U.esc(it.materia.nombre) + '</span></div>' +
        '<div><strong>' + U.esc(it.tarea.titulo) + '</strong></div>' +
        '<div class="silencio" style="font-size:.81rem">' + U.esc(it.tarea.descripcion) + '</div>' +
        '<div class="fila envuelve gap-1 mt-1" style="font-size:.78rem">' +
        '<span class="chip">' + U.esc(TIPO_EVAL[it.tarea.tipo] || it.tarea.tipo) + '</span>' +
        '<span class="chip">' + it.tarea.puntos + ' puntos</span>' +
        '<span class="chip mono">' + U.fecha(it.tarea.vence, 'corta') + '</span>' +
        '<span class="nowrap" style="font-weight:600;color:' + colorDias(d) + '">' + textoDias(d) + '</span>' +
        '</div></div>' +
        '<div class="pila gap-1" style="align-items:flex-end">' +
        U.badge(est.texto, est.variante) +
        (calif
          ? '<span class="' + U.claseNota(it.entrega.calificacion) + '" style="font-size:1.15rem">' +
            U.notaTexto(it.entrega.calificacion) + '</span>'
          : '') +
        (activo === 'pendiente'
          ? '<button type="button" class="btn btn-sm btn-primario" data-accion="al:entregar" ' +
            argsAttr({ tareaId: it.tarea.id }) + '>' + U.icono('cheque', 14) + ' Marcar como entregada</button>'
          : '') +
        '</div></div></div>';
    }).join('');

    var vacios = {
      pendiente: 'No tienes tareas por entregar en este momento.',
      entregada: 'Todavía no has marcado ninguna entrega pendiente de revisión.',
      revisada: 'Aún no hay tareas revisadas y calificadas.',
      atrasada: 'No tienes entregas atrasadas. Bien ahí.'
    };

    return sec({
      titulo: 'Tareas y entregas',
      sub: todas.length + ' tareas publicadas en tus materias durante el ciclo.',
      cuerpo: U.pestanas(items, activo, 'al:tabTareas') +
        (lista.length
          ? '<div class="pila">' + filas + '</div>'
          : pnl({
            cuerpo: U.vacio({
              icono: 'portapapeles', titulo: 'Nada en esta pestaña',
              texto: vacios[activo] || 'Sin registros.'
            })
          }))
    });
  }

  /* ================================================= SECCIÓN · MATERIALES == */

  function seccionMateriales(a) {
    var lista = Q.materialesDeAlumno(a.id);
    var orden = [], grupos = {};
    lista.forEach(function (x) {
      var id = x.materia.id;
      if (!grupos[id]) { grupos[id] = { materia: x.materia, items: [] }; orden.push(id); }
      grupos[id].items.push(x.material);
    });

    var cuerpo = orden.length
      ? '<div class="pila gap-2">' + orden.map(function (id) {
          var g = grupos[id];
          return pnl({
            titulo: '<span class="fila gap-1">' + puntoMateria(g.materia) + U.esc(g.materia.nombre) + '</span>',
            sub: g.items.length + (g.items.length === 1 ? ' material publicado' : ' materiales publicados'),
            acciones: '<a class="btn btn-sm" href="#/alumno/materias?id=' + U.esc(g.materia.id) + '">Ver materia</a>',
            cuerpo: '<div class="pila">' + g.items.map(function (mt) {
              return filaMaterial(mt, null);
            }).join('') + '</div>'
          });
        }).join('') + '</div>'
      : pnl({
        cuerpo: U.vacio({
          icono: 'archivo', titulo: 'Sin materiales',
          texto: 'Todavía no hay material publicado en tus materias.'
        })
      });

    return sec({
      titulo: 'Materiales de clase',
      sub: lista.length + ' archivos y ligas compartidos por tus profesores, agrupados por materia.',
      cuerpo: cuerpo
    });
  }

  /* ====================================================== SECCIÓN · PAGOS == */

  function seccionPagos(a) {
    var pagos = Q.pagosDeAlumno(a.id);
    var ad = Q.adeudo(a.id);
    var deuda = ad && hay(ad.total) ? ad.total : 0;
    var pagados = pagos.filter(function (p) { return p.estado === 'pagado'; });
    var vencidos = pagos.filter(function (p) { return p.estado === 'vencido'; });

    var abiertos = pagos.filter(function (p) { return p.estado !== 'pagado'; })
      .slice().sort(function (x, y) { return x.vence < y.vence ? -1 : 1; });
    var proximo = abiertos[0] || null;

    var totalMonto = 0, totalRecargo = 0;
    pagos.forEach(function (p) { totalMonto += p.monto; totalRecargo += (p.recargo || 0); });

    var kpis =
      '<div class="col-4">' + U.kpi({
        etiqueta: 'Adeudo total', icono: 'dinero',
        valor: deuda > 0 ? U.moneda(deuda) : U.moneda(0),
        variante: deuda > 0 ? (vencidos.length ? 'crit' : 'aviso') : 'ok',
        sub: deuda > 0 ? 'Incluye recargos aplicados' : 'No debes nada al colegio',
        pie: 'Recargo por mora: ' + DB.escuela.recargoPct + '%'
      }) + '</div>' +
      '<div class="col-4">' + U.kpi({
        etiqueta: 'Pagos al corriente', icono: 'cheque',
        valor: pagados.length + ' de ' + pagos.length,
        variante: pagados.length === pagos.length ? 'ok' : 'marca',
        sub: 'Recibos liquidados del ciclo',
        pie: a.becaPct ? 'Beca aplicada del ' + a.becaPct + '%' : 'Sin beca aplicada'
      }) + '</div>' +
      '<div class="col-4">' + U.kpi({
        etiqueta: 'Próximo vencimiento', icono: 'calendario',
        valor: proximo ? U.fecha(proximo.vence, 'corta') : 'Ninguno',
        variante: proximo ? (Q.diasParaEntrega(proximo.vence) < 0 ? 'crit' : 'aviso') : 'ok',
        sub: proximo ? U.esc(proximo.concepto) : 'Sin pagos pendientes',
        pie: proximo ? textoDias(Q.diasParaEntrega(proximo.vence)) : 'Estado de cuenta cerrado'
      }) + '</div>';

    var alerta = '';
    if (vencidos.length) {
      var sv = 0, sr = 0;
      vencidos.forEach(function (p) { sv += p.monto + (p.recargo || 0); sr += (p.recargo || 0); });
      alerta = '<div class="tarjeta mb-2"><div class="franja-riesgo alta">' +
        '<div class="fila gap-1"><span style="color:var(--crit)">' + U.icono('alerta', 16) + '</span>' +
        '<h3>' + (vencidos.length === 1 ? 'Tienes un pago vencido' : 'Tienes ' + vencidos.length + ' pagos vencidos') + '</h3></div>' +
        '<p class="mt-1" style="font-size:.89rem">Suman ' + U.moneda(sv) + ', de los cuales ' + U.moneda(sr) +
        ' corresponden al recargo del ' + DB.escuela.recargoPct + '% previsto en el reglamento. ' +
        'Ponte en contacto con la dirección al ' + U.esc(DB.escuela.telefono) + ' para regularizar tu situación.</p>' +
        '</div></div>';
    }

    var cabeza = '<th>Concepto</th><th>Periodo</th><th class="num">Monto</th><th class="num">Recargo</th>' +
      '<th>Vence</th><th>Estado</th><th>Método</th><th>Referencia</th><th></th>';
    var filas = pagos.map(function (p) {
      var est = ESTADO_PAGO[p.estado] || ESTADO_PAGO.pendiente;
      return '<tr' + (p.estado === 'pagado' ? ' class="fila-atenuada"' : '') + '>' +
        '<td><strong>' + U.esc(p.concepto) + '</strong></td>' +
        '<td class="mono">' + U.esc(p.periodo) + '</td>' +
        '<td class="num mono">' + U.moneda(p.monto) + '</td>' +
        '<td class="num mono' + (p.recargo ? ' nota-baja' : ' silencio') + '">' +
        (p.recargo ? U.moneda(p.recargo) : '—') + '</td>' +
        '<td class="mono">' + U.fecha(p.vence, 'corta') + '</td>' +
        '<td>' + U.badge(est.texto, est.variante) + '</td>' +
        '<td>' + (p.metodo ? U.esc(p.metodo) : '<span class="silencio">—</span>') + '</td>' +
        '<td class="mono">' + U.esc(p.referencia) + '</td>' +
        '<td>' + (p.estado === 'pagado'
          ? '<button type="button" class="btn btn-sm" data-accion="al:recibo" ' + argsAttr({ id: p.id }) + '>' +
            U.icono('ojo', 13) + ' Ver recibo</button>'
          : '') + '</td>' +
        '</tr>';
    }).join('');
    var pie = '<tr><td colspan="2"><strong>Totales del ciclo</strong></td>' +
      '<td class="num mono"><strong>' + U.moneda(totalMonto) + '</strong></td>' +
      '<td class="num mono"><strong>' + U.moneda(totalRecargo) + '</strong></td>' +
      '<td colspan="5"><strong>Saldo por cubrir: ' + U.moneda(deuda) + '</strong></td></tr>';

    return sec({
      titulo: 'Estado de cuenta',
      sub: 'Colegiaturas e inscripción del ciclo ' + U.esc(DB.escuela.ciclo) + '.',
      cuerpo: alerta +
        '<div class="rejilla mb-2">' + kpis + '</div>' +
        pnl({
          titulo: 'Movimientos',
          sub: 'Todos los cargos del ciclo, del más reciente al más antiguo.',
          sinRelleno: true,
          cuerpo: tablaEnv(cabeza, filas, pie),
          pie: 'Los montos ya consideran tu beca' + (a.becaPct ? ' del ' + a.becaPct + '%' : '') +
            '. Atención en caja: ' + U.esc(DB.escuela.horarioAtencion) + '.'
        })
    });
  }

  /* ================================================= SECCIÓN · PROFESORES == */

  function bloqueResena(r) {
    var est = ESTADO_RESENA[r.estado] || ESTADO_RESENA.pendiente;
    var mat = Q.materia(r.materiaId);
    return '<div class="caja-suave">' +
      '<div class="entre envuelve gap-1">' +
      '<span class="etiqueta">Tu reseña</span>' + U.badge(est.texto, est.variante) +
      '</div>' +
      '<div class="fila gap-1 mt-1">' + U.estrellas(r.estrellas) +
      '<span class="silencio" style="font-size:.78rem">' +
      (mat ? U.esc(mat.nombre) + ' · ' : '') + U.fecha(r.fecha, 'corta') +
      (r.anonima ? ' · anónima' : '') + '</span></div>' +
      '<p class="mt-1" style="font-size:.86rem">' + U.esc(r.comentario) + '</p>' +
      '<div class="fila envuelve gap-1" style="font-size:.76rem">' +
      '<span class="chip">Claridad ' + r.criterios.claridad + '</span>' +
      '<span class="chip">Dominio ' + r.criterios.dominio + '</span>' +
      '<span class="chip">Trato ' + r.criterios.trato + '</span>' +
      '<span class="chip">Puntualidad ' + r.criterios.puntualidad + '</span>' +
      '</div>' +
      (r.respuesta
        ? '<div class="resena"><div class="respuesta"><span class="quien">Respuesta de la persona docente</span>' +
          U.esc(r.respuesta.texto) + '</div></div>'
        : '') +
      '<p class="campo-ayuda mt-1">Una reseña sólo aparece en el perfil público cuando la persona docente ' +
      'la autoriza. Mientras tanto la ve únicamente ella y la dirección.</p>' +
      '<div class="form-acciones"><button type="button" class="btn btn-sm" data-accion="al:verResena" ' +
      argsAttr({ profesorId: r.profesorId }) + '>' + U.icono('ojo', 13) + ' Ver mi reseña</button></div>' +
      '</div>';
  }

  function tarjetaProfesor(a, prof, mats) {
    var rating = Q.ratingProfesor(prof.id, true) || { promedio: null, total: 0 };
    var mia = Q.resenaDe(a.id, prof.id);
    return '<div class="tarjeta" style="display:flex;flex-direction:column;gap:.7rem">' +
      '<div class="fila gap-2">' + U.avatar(prof, 'lg') +
      '<div class="crece">' +
      '<div style="font-weight:600;font-size:1.02rem">' + U.esc(prof.nombre) + '</div>' +
      '<div class="silencio" style="font-size:.82rem">' + U.esc(prof.titulo) + '</div>' +
      '<div class="fila gap-1 mt-1">' +
      (rating.total
        ? U.estrellas(rating.promedio) +
          '<span class="silencio" style="font-size:.78rem">' + rating.total +
          (rating.total === 1 ? ' reseña pública' : ' reseñas públicas') + '</span>'
        : '<span class="silencio" style="font-size:.78rem">Aún sin reseñas públicas</span>') +
      '</div></div></div>' +
      '<div class="fila envuelve gap-1">' + mats.map(function (m) {
        return '<span class="chip">' + puntoMateria(m) + ' ' + U.esc(m.nombre) + '</span>';
      }).join('') + '</div>' +
      (mia
        ? bloqueResena(mia)
        : '<div class="caja-suave">' +
          '<p style="font-size:.85rem">Todavía no has calificado a esta persona docente. Tu opinión ayuda ' +
          'a la dirección a dar seguimiento y, si ella lo autoriza, se publica en su perfil.</p>' +
          '<div class="form-acciones"><button type="button" class="btn btn-primario btn-sm" ' +
          'data-accion="al:calificar" ' + argsAttr({ profesorId: prof.id }) + '>' +
          U.icono('estrella', 14) + ' Calificar</button></div></div>') +
      '</div>';
  }

  function seccionProfesores(a) {
    var mats = Q.materiasDeAlumno(a.id);
    var orden = [], grupos = {};
    mats.forEach(function (m) {
      if (!grupos[m.profesorId]) { grupos[m.profesorId] = []; orden.push(m.profesorId); }
      grupos[m.profesorId].push(m);
    });

    var tarjetas = orden.map(function (pid) {
      var prof = Q.profesor(pid);
      if (!prof) return '';
      return '<div class="col-6">' + tarjetaProfesor(a, prof, grupos[pid]) + '</div>';
    }).join('');

    return sec({
      titulo: 'Mis profesores',
      sub: 'Califica a quienes te imparten clase. Toda reseña pasa por moderación antes de publicarse.',
      cuerpo:
        '<div class="caja-suave mb-2"><div class="fila gap-1">' +
        '<span style="color:var(--marca);flex:none">' + U.icono('info', 16) + '</span>' +
        '<span style="font-size:.86rem">Tu reseña se envía a la persona docente y a la dirección. ' +
        'Sólo aparece en el perfil público cuando la persona docente la autoriza. Puedes enviarla de forma anónima: ' +
        'en ese caso tu nombre no se muestra junto al comentario.</span></div></div>' +
        (tarjetas
          ? '<div class="rejilla">' + tarjetas + '</div>'
          : pnl({
            cuerpo: U.vacio({
              icono: 'usuarios', titulo: 'Sin profesores asignados',
              texto: 'Cuando tengas materias inscritas aparecerán aquí.'
            })
          }))
    });
  }

  /* ===================================================== SECCIÓN · AVISOS == */

  function seccionAvisos(a) {
    var avisos = Q.avisosPara('alumno', a.id);
    var altas = avisos.filter(function (x) { return x.prioridad === 'alta'; }).length;
    return sec({
      titulo: 'Avisos',
      sub: avisos.length + ' avisos vigentes' + (altas ? ' · ' + altas + ' de prioridad alta' : '') + '.',
      cuerpo: pnl({
        cuerpo: avisos.length
          ? '<div class="pila">' + avisos.map(filaAviso).join('') + '</div>'
          : U.vacio({ icono: 'campana', titulo: 'Sin avisos', texto: 'No hay avisos publicados para ti.' })
      })
    });
  }

  /* ===================================================== SECCIÓN · PERFIL == */

  function seccionPerfil(a) {
    var est = a.estatus === 'activo'
      ? { texto: 'Activo', variante: 'ok' }
      : (a.estatus === 'condicionado' ? { texto: 'Condicionado', variante: 'aviso' } : { texto: 'Baja', variante: 'crit' });

    var panelFoto = pnl({
      titulo: 'Fotografía',
      sub: 'Se muestra en tu expediente y en las listas de tus profesores.',
      cuerpo:
        '<div class="fila gap-2 envuelve">' +
        '<div id="al-foto-previa">' + U.avatar(a, 'xl') + '</div>' +
        '<div class="crece">' +
        '<div class="campo">' +
        '<label class="campo-etiqueta" for="al-foto">Cambiar fotografía</label>' +
        '<input class="entrada" type="file" id="al-foto" name="foto" accept="image/*" data-cambio="al:foto">' +
        '<span class="campo-ayuda">Formato JPG o PNG. La vista previa se actualiza al elegir el archivo ' +
        'y el cambio se guarda de inmediato en tu expediente.</span>' +
        '</div></div></div>'
    });

    var panelDatos = pnl({
      titulo: 'Datos del expediente',
      sub: 'Los administra la dirección escolar.',
      cuerpo:
        '<div class="datos-rejilla">' +
        dato('Matrícula', U.esc(a.matricula), true) +
        dato('Nombre completo', U.esc(a.nombre)) +
        dato('Correo institucional', U.esc(a.email)) +
        dato('Teléfono', U.esc(a.telefono), true) +
        dato('Fecha de nacimiento', U.fecha(a.nacimiento, 'larga')) +
        dato('Fecha de ingreso', U.fecha(a.ingreso, 'larga')) +
        dato('Estatus', U.badge(est.texto, est.variante)) +
        dato('Beca', a.becaPct ? a.becaPct + '% sobre colegiatura' : 'Sin beca') +
        '</div>' +
        (a.notas ? '<div class="caja-suave mt-2"><span class="etiqueta">Nota de la dirección</span>' +
          '<p class="mt-1" style="font-size:.86rem">' + U.esc(a.notas) + '</p></div>' : ''),
      pie: 'Matrícula, nombre, nacimiento, ingreso, estatus y beca son de sólo lectura: los administra la ' +
        'dirección escolar, porque cualquier cambio afecta el expediente oficial y el estado de cuenta. ' +
        'Si algo está mal, repórtalo al ' + U.esc(DB.escuela.telefono) + '.'
    });

    var panelTutor = pnl({
      titulo: 'Tutor o tutora',
      sub: 'Persona responsable registrada ante el colegio.',
      cuerpo:
        '<div class="datos-rejilla">' +
        dato('Nombre', U.esc(a.tutor.nombre)) +
        dato('Parentesco', U.esc(a.tutor.parentesco)) +
        dato('Teléfono', U.esc(a.tutor.telefono), true) +
        dato('Correo', U.esc(a.tutor.email)) +
        '</div>'
    });

    var panelForm = pnl({
      titulo: 'Datos de contacto editables',
      sub: 'Lo único que puedes modificar por tu cuenta.',
      cuerpo:
        '<form data-envio="al:guardarPerfil">' +
        '<div class="form-rejilla">' +
        '<div class="col-6"><div class="campo">' +
        '<label class="campo-etiqueta" for="al-tel">Tu teléfono <span class="campo-req">*</span></label>' +
        '<input class="entrada mono" type="tel" id="al-tel" name="telefono" value="' + U.esc(a.telefono) + '" required>' +
        '</div></div>' +
        '<div class="col-6"><div class="campo">' +
        '<label class="campo-etiqueta" for="al-mail">Tu correo <span class="campo-req">*</span></label>' +
        '<input class="entrada" type="email" id="al-mail" name="email" value="' + U.esc(a.email) + '" required>' +
        '</div></div>' +
        '<div class="col-6"><div class="campo">' +
        '<label class="campo-etiqueta" for="al-ttel">Teléfono del tutor <span class="campo-req">*</span></label>' +
        '<input class="entrada mono" type="tel" id="al-ttel" name="tutorTelefono" value="' + U.esc(a.tutor.telefono) + '" required>' +
        '</div></div>' +
        '<div class="col-6"><div class="campo">' +
        '<label class="campo-etiqueta" for="al-tmail">Correo del tutor <span class="campo-req">*</span></label>' +
        '<input class="entrada" type="email" id="al-tmail" name="tutorEmail" value="' + U.esc(a.tutor.email) + '" required>' +
        '</div></div>' +
        '</div>' +
        '<div class="form-acciones">' +
        '<button type="submit" class="btn btn-primario">' + U.icono('cheque', 15) + ' Guardar cambios</button>' +
        '</div></form>'
    });

    return sec({
      titulo: 'Mi perfil',
      sub: 'Expediente de ' + U.esc(a.nombre) + ' · matrícula ' + U.esc(a.matricula) + '.',
      cuerpo:
        '<div class="rejilla">' +
        '<div class="col-4">' + panelFoto + '</div>' +
        '<div class="col-8">' + panelDatos + '</div>' +
        '<div class="col-6">' + panelTutor + '</div>' +
        '<div class="col-6">' + panelForm + '</div>' +
        '</div>'
    });
  }

  /* ===================================================== MODALES DEL PANEL == */

  function selectorCriterio(nombre, etiqueta) {
    var ops = '';
    for (var v = 5; v >= 1; v--) {
      ops += '<option value="' + v + '"' + (v === 4 ? ' selected' : '') + '>' +
        v + ' · ' + TEXTO_CRITERIO[v] + '</option>';
    }
    return '<div class="col-6"><div class="campo">' +
      '<label class="campo-etiqueta" for="al-c-' + nombre + '">' + etiqueta + '</label>' +
      '<select class="selec" id="al-c-' + nombre + '" name="' + nombre + '">' + ops + '</select>' +
      '</div></div>';
  }

  function modalCalificar(a, prof, mats) {
    var opciones = mats.map(function (m) {
      return '<option value="' + U.esc(m.id) + '">' + U.esc(m.nombre) + '</option>';
    }).join('');

    U.modal({
      titulo: 'Calificar a ' + U.esc(prof.nombre),
      sub: U.esc(prof.titulo),
      cuerpo:
        '<form id="al-form-resena" data-envio="al:guardarResena" ' + argsAttr({ profesorId: prof.id }) + '>' +
        '<div class="caja-suave mb-2"><div class="fila gap-1">' +
        '<span style="color:var(--marca);flex:none">' + U.icono('escudo', 16) + '</span>' +
        '<span style="font-size:.85rem">Tu reseña se envía a moderación. Aparece en el perfil público de la ' +
        'persona docente únicamente cuando ella la autoriza; mientras tanto sólo la ven ella y la dirección.</span>' +
        '</div></div>' +
        '<div class="campo">' +
        '<span class="campo-etiqueta">Calificación general <span class="campo-req">*</span></span>' +
        U.estrellasInput('estrellas', 0) +
        '<span class="campo-ayuda">De una a cinco estrellas.</span>' +
        '</div>' +
        '<div class="campo">' +
        '<label class="campo-etiqueta" for="al-res-materia">Materia sobre la que opinas</label>' +
        '<select class="selec" id="al-res-materia" name="materiaId">' + opciones + '</select>' +
        '</div>' +
        '<div class="form-rejilla">' +
        selectorCriterio('claridad', 'Claridad al explicar') +
        selectorCriterio('dominio', 'Dominio del tema') +
        selectorCriterio('trato', 'Trato con el grupo') +
        selectorCriterio('puntualidad', 'Puntualidad y devoluciones') +
        '</div>' +
        '<div class="campo">' +
        '<label class="campo-etiqueta" for="al-res-com">Comentario <span class="campo-req">*</span></label>' +
        '<textarea class="area" id="al-res-com" name="comentario" data-entrada="al:contarComentario" ' +
        'placeholder="Cuenta qué funciona en su clase y qué mejorarías. Sé concreto."></textarea>' +
        '<span class="campo-ayuda" id="al-cuenta-comentario">0 de 20 caracteres mínimos</span>' +
        '</div>' +
        '<label class="checa"><input type="checkbox" name="anonima" value="1">' +
        '<span>Enviar de forma anónima. Tu nombre no se muestra junto al comentario, aunque la dirección ' +
        'conserva el registro para evitar duplicados.</span></label>' +
        '<div class="form-acciones mt-2">' +
        '<button type="button" class="btn" data-accion="app:cerrarModal">Cancelar</button>' +
        '<button type="submit" class="btn btn-primario">' + U.icono('estrella', 15) + ' Enviar reseña</button>' +
        '</div></form>'
    });
  }

  function modalResena(r, prof) {
    var est = ESTADO_RESENA[r.estado] || ESTADO_RESENA.pendiente;
    var mat = Q.materia(r.materiaId);
    var explica = {
      pendiente: 'Todavía está en revisión. No aparece en el perfil público hasta que la persona docente la autorice.',
      publica: 'La persona docente la autorizó: cualquiera puede leerla en su perfil público.',
      oculta: 'La persona docente decidió no publicarla. Sigue visible para ella y para la dirección.'
    };
    U.modal({
      titulo: 'Tu reseña',
      sub: U.esc(prof ? prof.nombre : ''),
      cuerpo:
        '<div class="entre envuelve gap-1">' + U.estrellas(r.estrellas, { tam: 'lg' }) +
        U.badge(est.texto, est.variante) + '</div>' +
        '<p class="silencio mt-1" style="font-size:.8rem">' +
        (mat ? U.esc(mat.nombre) + ' · ' : '') + U.fecha(r.fecha, 'larga') +
        (r.anonima ? ' · enviada de forma anónima' : '') + '</p>' +
        '<p class="mt-2">' + U.esc(r.comentario) + '</p>' +
        '<div class="separador"></div>' +
        '<div class="datos-rejilla">' +
        dato('Claridad', r.criterios.claridad + ' de 5') +
        dato('Dominio', r.criterios.dominio + ' de 5') +
        dato('Trato', r.criterios.trato + ' de 5') +
        dato('Puntualidad', r.criterios.puntualidad + ' de 5') +
        '</div>' +
        (r.respuesta
          ? '<div class="resena mt-2"><div class="respuesta"><span class="quien">Respuesta de la persona docente · ' +
            U.fecha(r.respuesta.fecha, 'corta') + '</span>' + U.esc(r.respuesta.texto) + '</div></div>'
          : '') +
        '<div class="caja-suave mt-2"><span style="font-size:.85rem">' +
        (explica[r.estado] || explica.pendiente) + '</span></div>',
      acciones: '<button type="button" class="btn" data-accion="app:cerrarModal">Cerrar</button>'
    });
  }

  function modalBoleta(a) {
    var mats = Q.materiasDeAlumno(a.id);
    U.modal({
      titulo: 'Boleta de calificaciones',
      sub: U.esc(a.nombre) + ' · ' + U.esc(a.matricula) + ' · ciclo ' + U.esc(DB.escuela.ciclo),
      ancho: 'ancho',
      cuerpo:
        '<div class="fila gap-2 mb-2">' +
        '<span class="sello">' + U.esc(DB.escuela.sello) + '</span>' +
        '<div><div class="destacado" style="font-weight:600">' + U.esc(DB.escuela.nombre) + '</div>' +
        '<div class="silencio" style="font-size:.8rem">' + U.esc(DB.escuela.ciudad) + ' · corte al ' +
        U.fecha(isoHoy(), 'larga') + '</div></div></div>' +
        boletaTabla(a, mats) +
        '<div class="caja-suave mt-2"><div class="fila gap-1">' +
        '<span style="color:var(--acento);flex:none">' + U.icono('info', 16) + '</span>' +
        '<span style="font-size:.85rem">En esta demostración no se genera un archivo descargable: ' +
        'la boleta se muestra aquí con la información al día del expediente.</span>' +
        '</div></div>',
      acciones: '<button type="button" class="btn btn-primario" data-accion="app:cerrarModal">Cerrar</button>'
    });
  }

  function modalRecibo(a, p) {
    var total = p.monto + (p.recargo || 0);
    U.modal({
      titulo: 'Recibo de pago',
      sub: U.esc(p.concepto),
      cuerpo:
        '<div class="fila gap-2 mb-2">' +
        '<span class="sello">' + U.esc(DB.escuela.sello) + '</span>' +
        '<div><div class="destacado" style="font-weight:600">' + U.esc(DB.escuela.nombre) + '</div>' +
        '<div class="silencio" style="font-size:.8rem">' + U.esc(DB.escuela.direccion) + '</div></div></div>' +
        '<div class="datos-rejilla">' +
        dato('Alumno', U.esc(a.nombre)) +
        dato('Matrícula', U.esc(a.matricula), true) +
        dato('Concepto', U.esc(p.concepto)) +
        dato('Periodo', U.esc(p.periodo), true) +
        dato('Vencimiento', U.fecha(p.vence, 'larga')) +
        dato('Fecha de pago', p.pagadoEl ? U.fecha(p.pagadoEl, 'larga') : '—') +
        dato('Método', U.esc(p.metodo || '—')) +
        dato('Referencia', U.esc(p.referencia), true) +
        '</div>' +
        '<div class="separador"></div>' +
        '<div class="entre"><span>Monto</span><strong class="mono">' + U.moneda(p.monto) + '</strong></div>' +
        '<div class="entre"><span>Recargo</span><strong class="mono">' + U.moneda(p.recargo || 0) + '</strong></div>' +
        '<div class="entre mt-1"><span class="etiqueta">Total pagado</span>' +
        '<strong class="mono" style="font-size:1.1rem;color:var(--ok)">' + U.moneda(total) + '</strong></div>' +
        '<div class="caja-suave mt-2"><span style="font-size:.85rem">Comprobante informativo de la ' +
        'demostración. No sustituye al recibo fiscal que emite la administración del colegio.</span></div>',
      acciones: '<button type="button" class="btn btn-primario" data-accion="app:cerrarModal">Cerrar</button>'
    });
  }

  /* ======================================================= OBJETO DE VISTA == */

  return {

    titulo: 'Portal del alumno',

    nav: [
      { id: 'resumen',        texto: 'Resumen',        icono: 'casa' },
      { id: 'materias',       texto: 'Materias',       icono: 'libro' },
      { id: 'calificaciones', texto: 'Calificaciones', icono: 'grafica' },
      { id: 'tareas',         texto: 'Tareas',         icono: 'portapapeles' },
      { id: 'materiales',     texto: 'Materiales',     icono: 'archivo' },
      { id: 'pagos',          texto: 'Pagos',          icono: 'tarjeta' },
      { id: 'profesores',     texto: 'Profesores',     icono: 'estrella' },
      { id: 'avisos',         texto: 'Avisos',         icono: 'campana' },
      { id: 'perfil',         texto: 'Perfil',         icono: 'usuario' }
    ],

    render: function (ctx) {
      var c = ctx || {};
      var a = c.persona || Sesion.persona();
      if (!a || a.rol !== 'alumno') {
        return '<div class="contenedor">' + pnl({
          cuerpo: U.vacio({
            icono: 'candado', titulo: 'Sesión no disponible',
            texto: 'Vuelve a entrar con una cuenta de alumno para ver tu expediente.',
            accion: '<a class="btn btn-primario" href="#/acceso">Ir al acceso</a>'
          })
        }) + '</div>';
      }
      var cuerpo;
      switch (c.seccion) {
        case 'materias':       cuerpo = seccionMaterias(a, c); break;
        case 'calificaciones': cuerpo = seccionCalificaciones(a); break;
        case 'tareas':         cuerpo = seccionTareas(a, c); break;
        case 'materiales':     cuerpo = seccionMateriales(a); break;
        case 'pagos':          cuerpo = seccionPagos(a); break;
        case 'profesores':     cuerpo = seccionProfesores(a); break;
        case 'avisos':         cuerpo = seccionAvisos(a); break;
        case 'perfil':         cuerpo = seccionPerfil(a); break;
        default:               cuerpo = seccionResumen(a); break;
      }
      return '<div class="contenedor">' + cuerpo + '</div>';
    },

    acciones: {

      /* pestañas de tareas: la pestaña activa viaja en el hash */
      'al:tabTareas': function (args) {
        var v = args && (args.id || args.tab || args.valor);
        if (!v) return;
        App.ir('#/alumno/tareas?tab=' + v);
      },

      'al:entregar': function (args) {
        var a = Sesion.persona();
        if (!a || !args || !args.tareaId) return;
        var r = M.marcarEntrega(args.tareaId, a.id, 'entregada', null);
        if (r && r.ok === false) {
          U.toast(r.error || 'No se pudo registrar la entrega.', 'crit');
          return;
        }
        U.toast('Entrega registrada. Tu profesor la verá como entregada.', 'ok');
        App.refrescar();
      },

      'al:abrirMaterial': function (args) {
        var a = Sesion.persona();
        if (!a || !args || !args.id) return;
        var mtr = null;
        Q.materialesDeAlumno(a.id).forEach(function (x) {
          if (x.material.id === args.id) mtr = x.material;
        });
        if (!mtr) { U.toast('Ese material ya no está disponible.', 'crit'); return; }
        U.toast('Demostración: el material se abriría en el visor del colegio.', 'aviso');
      },

      'al:boleta': function () {
        var a = Sesion.persona();
        if (!a) return;
        modalBoleta(a);
      },

      'al:recibo': function (args) {
        var a = Sesion.persona();
        if (!a || !args || !args.id) return;
        var pago = null;
        Q.pagosDeAlumno(a.id).forEach(function (p) { if (p.id === args.id) pago = p; });
        if (!pago || pago.estado !== 'pagado') {
          U.toast('Sólo los pagos liquidados tienen recibo.', 'crit');
          return;
        }
        modalRecibo(a, pago);
      },

      'al:calificar': function (args) {
        var a = Sesion.persona();
        if (!a || !args || !args.profesorId) return;
        var prof = Q.profesor(args.profesorId);
        if (!prof) { U.toast('No encontramos a esa persona docente.', 'crit'); return; }
        if (Q.resenaDe(a.id, prof.id)) {
          U.toast('Ya reseñaste a esta persona docente. Sólo puedes hacerlo una vez.', 'aviso');
          return;
        }
        var mats = Q.materiasDeAlumno(a.id).filter(function (m) { return m.profesorId === prof.id; });
        if (!mats.length) { U.toast('No cursas ninguna materia con esta persona docente.', 'crit'); return; }
        modalCalificar(a, prof, mats);
      },

      'al:verResena': function (args) {
        var a = Sesion.persona();
        if (!a || !args || !args.profesorId) return;
        var r = Q.resenaDe(a.id, args.profesorId);
        if (!r) { U.toast('Todavía no has reseñado a esta persona docente.', 'aviso'); return; }
        modalResena(r, Q.profesor(args.profesorId));
      },

      'al:contarComentario': function (args, ev, el) {
        var nodo = document.getElementById('al-cuenta-comentario');
        if (!nodo || !el) return;
        var largo = String(el.value || '').trim().length;
        nodo.textContent = largo < 20
          ? largo + ' de 20 caracteres mínimos'
          : largo + ' caracteres · listo para enviar';
        nodo.style.color = largo < 20 ? 'var(--tinta-3)' : 'var(--ok)';
      },

      'al:guardarResena': function (args) {
        var a = Sesion.persona();
        if (!a || !args || !args.profesorId) return;
        var prof = Q.profesor(args.profesorId);
        if (!prof) { U.toast('No encontramos a esa persona docente.', 'crit'); return; }
        if (Q.resenaDe(a.id, prof.id)) {
          U.toast('Ya existe una reseña tuya para esta persona docente.', 'crit');
          return;
        }
        var d = args.datos || {};
        var estrellas = Number(d.estrellas);
        if (!(estrellas >= 1 && estrellas <= 5)) {
          U.toast('Elige de una a cinco estrellas.', 'crit');
          return;
        }
        var comentario = String(d.comentario || '').trim();
        if (comentario.length < 20) {
          U.toast('El comentario necesita al menos 20 caracteres. Llevas ' + comentario.length + '.', 'crit');
          return;
        }
        var criterios = {
          claridad: Number(d.claridad) || 3,
          dominio: Number(d.dominio) || 3,
          trato: Number(d.trato) || 3,
          puntualidad: Number(d.puntualidad) || 3
        };
        var mats = Q.materiasDeAlumno(a.id).filter(function (m) { return m.profesorId === prof.id; });
        var materiaId = String(d.materiaId || '');
        var valida = false;
        mats.forEach(function (m) { if (m.id === materiaId) valida = true; });
        if (!valida) materiaId = mats.length ? mats[0].id : '';
        if (!materiaId) { U.toast('No cursas ninguna materia con esta persona docente.', 'crit'); return; }

        var r = M.crearResena({
          profesorId: prof.id,
          alumnoId: a.id,
          materiaId: materiaId,
          estrellas: estrellas,
          criterios: criterios,
          comentario: comentario,
          anonima: !!d.anonima
        });
        if (r && r.ok === false) {
          U.toast(r.error || 'No se pudo enviar la reseña.', 'crit');
          return;
        }
        U.cerrarModal();
        U.toast('Reseña enviada. Se publicará si la persona docente la autoriza.', 'ok');
        App.refrescar();
      },

      'al:guardarPerfil': function (args) {
        var a = Sesion.persona();
        if (!a) return;
        var d = (args && args.datos) || {};
        var tel = String(d.telefono || '').trim();
        var correo = String(d.email || '').trim();
        var tutorTel = String(d.tutorTelefono || '').trim();
        var tutorCorreo = String(d.tutorEmail || '').trim();

        if (tel.replace(/\D/g, '').length < 8) {
          U.toast('Escribe un teléfono válido de al menos 8 dígitos.', 'crit');
          return;
        }
        if (!esCorreo(correo)) { U.toast('Tu correo no tiene un formato válido.', 'crit'); return; }
        if (tutorTel.replace(/\D/g, '').length < 8) {
          U.toast('El teléfono del tutor necesita al menos 8 dígitos.', 'crit');
          return;
        }
        if (!esCorreo(tutorCorreo)) { U.toast('El correo del tutor no tiene un formato válido.', 'crit'); return; }

        var r = M.actualizarAlumno(a.id, {
          telefono: tel,
          email: correo,
          tutor: {
            nombre: a.tutor.nombre,
            parentesco: a.tutor.parentesco,
            telefono: tutorTel,
            email: tutorCorreo
          }
        });
        if (r && r.ok === false) {
          U.toast(r.error || 'No se pudieron guardar los cambios.', 'crit');
          return;
        }
        U.toast('Datos de contacto actualizados.', 'ok');
        App.refrescar();
      },

      'al:foto': function (args, ev, el) {
        var a = Sesion.persona();
        if (!a || !el || !el.files || !el.files.length) return;
        U.leerArchivo(el, function (arch) {
          if (!arch || !arch.url) { U.toast('No se pudo leer la imagen.', 'crit'); return; }
          if (arch.tipo && String(arch.tipo).indexOf('image/') !== 0) {
            U.toast('El archivo debe ser una imagen.', 'crit');
            return;
          }
          /* Se guarda primero: así una imagen rechazada nunca queda en la vista previa. */
          var r = M.subirFoto('alumno', a.id, arch.url);
          if (r && r.ok === false) {
            U.toast(r.error || 'No se pudo guardar la fotografía.', 'crit');
            return;
          }
          var previa = document.getElementById('al-foto-previa');
          if (previa) {
            previa.innerHTML = '<span class="avatar avatar-xl">' +
              '<img src="' + U.esc(arch.url) + '" alt="Vista previa de la fotografía"></span>';
          }
          U.toast('Fotografía actualizada.', 'ok');
          App.refrescar();
        });
      }

    }
  };

})();

