/* ============================================================================
   30-store.js — Núcleo de datos de Colegio Altamira.
   Declara: var DB, const HOY, const Store, const Sesion, const Q, const M
   Estado, persistencia, sesión, selectores puros y mutaciones validadas.
   ========================================================================== */

/* Fecha fija de la demostración: viernes 14 de noviembre de 2025, 9:00 h.
   Todo cálculo relativo (vencimientos, días restantes, sellos de captura)
   se hace contra HOY para que la demo sea idéntica en cualquier equipo. */
const HOY = new Date(2025, 10, 14, 9, 0, 0);

/* Estado vivo de la aplicación. Lo puebla Store.cargar() al final del archivo. */
var DB;

/* ---------------------------------------------------------------- Store --- */
const Store = (function () {

  var CLAVE_DB = 'altamira.db.v3';
  var suscriptores = [];
  var COLECCIONES = [
    'alumnos', 'profesores', 'materias', 'inscripciones', 'evaluaciones',
    'calificaciones', 'asistencias', 'tareas', 'entregas', 'materiales',
    'avisos', 'pagos', 'resenas', 'bitacora'
  ];

  function clonar(valor) { return JSON.parse(JSON.stringify(valor)); }

  /* Garantiza que DB tenga todas las piezas aunque el respaldo venga incompleto. */
  function sanear(datos) {
    if (!datos.escuela || typeof datos.escuela !== 'object') datos.escuela = clonar(SEMILLA.escuela);
    if (!datos.direccion || typeof datos.direccion !== 'object') datos.direccion = clonar(SEMILLA.direccion);
    if (typeof datos.contador !== 'number' || !isFinite(datos.contador)) datos.contador = SEMILLA.contador;
    datos.version = SEMILLA.version;
    COLECCIONES.forEach(function (llave) {
      if (!Array.isArray(datos[llave])) datos[llave] = clonar(SEMILLA[llave] || []);
    });
    return datos;
  }

  return {

    clave: CLAVE_DB,
    clonar: clonar,

    /* Fecha (Date) a cadena 'AAAA-MM-DD' en hora local. Sin argumento, usa HOY. */
    iso: function (fecha) {
      var d = (fecha instanceof Date && isFinite(fecha.getTime())) ? fecha : HOY;
      var mes = d.getMonth() + 1;
      var dia = d.getDate();
      return d.getFullYear() + '-' + (mes < 10 ? '0' + mes : mes) + '-' + (dia < 10 ? '0' + dia : dia);
    },

    cargar: function () {
      var crudo = null;
      var datos = null;
      try { crudo = window.localStorage.getItem(CLAVE_DB); }
      catch (e) { crudo = null; }               /* modo privado o marco restringido */
      if (crudo) {
        try { datos = JSON.parse(crudo); }
        catch (e) { datos = null; }             /* respaldo corrupto: se re-siembra */
      }
      if (!datos || typeof datos !== 'object' || datos.version !== SEMILLA.version) {
        datos = clonar(SEMILLA);
      }
      DB = sanear(datos);
      return DB;
    },

    guardar: function () {
      try { window.localStorage.setItem(CLAVE_DB, JSON.stringify(DB)); }
      catch (e) { /* sin almacenamiento: la demo sigue funcionando en memoria */ }
      suscriptores.slice().forEach(function (fn) {
        try { fn(DB); }
        catch (e) { /* un suscriptor con error no debe tumbar a los demás */ }
      });
    },

    reiniciar: function () {
      try { window.localStorage.removeItem(CLAVE_DB); }
      catch (e) { /* nada que borrar */ }
      DB = sanear(clonar(SEMILLA));
      Sesion.salir();
      Store.guardar();
      return { ok: true };
    },

    suscribir: function (fn) {
      if (typeof fn !== 'function') return function () {};
      suscriptores.push(fn);
      return function () {
        var i = suscriptores.indexOf(fn);
        if (i >= 0) suscriptores.splice(i, 1);
      };
    },

    uid: function (pfx) {
      return String(pfx || 'id') + '-' + (DB.contador++);
    },

    bitacora: function (texto) {
      var s = Sesion.actual();
      DB.bitacora.unshift({
        id: Store.uid('bit'),
        fecha: Store.iso(HOY),
        actorId: s ? s.id : 'sistema',
        texto: String(texto || '')
      });
      if (DB.bitacora.length > 80) DB.bitacora.length = 80;
    }
  };
})();

/* --------------------------------------------------------------- Sesion --- */
const Sesion = (function () {

  var CLAVE = 'altamira.sesion';
  var cache = null;
  var leida = false;

  function persistir(s) {
    try {
      if (s) window.localStorage.setItem(CLAVE, JSON.stringify(s));
      else window.localStorage.removeItem(CLAVE);
    } catch (e) { /* sin almacenamiento: la sesión vive sólo en memoria */ }
  }

  return {

    actual: function () {
      if (!leida) {
        leida = true;
        cache = null;
        try {
          var crudo = window.localStorage.getItem(CLAVE);
          if (crudo) {
            var s = JSON.parse(crudo);
            if (s && s.rol && s.id) cache = { rol: String(s.rol), id: String(s.id) };
          }
        } catch (e) { cache = null; }
      }
      /* Si la persona ya no existe (demo reiniciada), la sesión se cae sola. */
      if (cache && !Q.persona(cache.rol, cache.id)) {
        cache = null;
        persistir(null);
      }
      return cache;
    },

    entrar: function (rol, id) {
      if (!Q.persona(rol, id)) return false;
      cache = { rol: String(rol), id: String(id) };
      leida = true;
      persistir(cache);
      return true;
    },

    salir: function () {
      cache = null;
      leida = true;
      persistir(null);
      return true;
    },

    persona: function () {
      var s = Sesion.actual();
      return s ? Q.persona(s.rol, s.id) : null;
    }
  };
})();

/* -------------------------------------------------------------------- Q --- */
const Q = (function () {

  var MESES3 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  var CRITERIOS = ['claridad', 'dominio', 'trato', 'puntualidad'];
  var TIPOS_TENDENCIA = { parcial: true, tarea: true, proyecto: true };

  function red1(n) { return Math.round(n * 10) / 10; }
  function cmp(a, b) { return a < b ? -1 : (a > b ? 1 : 0); }
  function txt(v) { return String(v === null || v === undefined ? '' : v); }
  function porNombre(a, b) { return txt(a.nombre).localeCompare(txt(b.nombre), 'es'); }
  function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }

  /* Une los motivos en una frase corta y la deja capitalizada. */
  function frase(lista) {
    var t;
    if (!lista.length) return '';
    if (lista.length === 1) t = lista[0];
    else if (lista.length === 2) t = lista[0] + ' y ' + lista[1];
    else t = lista.slice(0, lista.length - 1).join(', ') + ' y ' + lista[lista.length - 1];
    return t.charAt(0).toUpperCase() + t.slice(1) + '.';
  }

  var api = {

    red1: red1,

    /* ---------------------------------------------------------- entidades */
    alumno: function (id) {
      return DB.alumnos.filter(function (a) { return a.id === id; })[0] || null;
    },
    profesor: function (id) {
      return DB.profesores.filter(function (p) { return p.id === id; })[0] || null;
    },
    materia: function (id) {
      return DB.materias.filter(function (m) { return m.id === id; })[0] || null;
    },
    evaluacion: function (id) {
      return DB.evaluaciones.filter(function (e) { return e.id === id; })[0] || null;
    },
    tarea: function (id) {
      return DB.tareas.filter(function (t) { return t.id === id; })[0] || null;
    },
    persona: function (rol, id) {
      if (rol === 'alumno') return Q.alumno(id);
      if (rol === 'profesor') return Q.profesor(id);
      if (rol === 'direccion') {
        if (!DB.direccion) return null;
        return (!id || DB.direccion.id === id) ? DB.direccion : null;
      }
      return null;
    },

    alumnosActivos: function () {
      return DB.alumnos.filter(function (a) { return a.estatus !== 'baja'; });
    },

    /* ------------------------------------------------------------ relaciones */
    materiasDeAlumno: function (alumnoId) {
      var ids = {};
      DB.inscripciones.forEach(function (i) {
        if (i.alumnoId === alumnoId) ids[i.materiaId] = true;
      });
      return DB.materias.filter(function (m) { return ids[m.id]; }).sort(porNombre);
    },

    materiasDeProfesor: function (profesorId) {
      return DB.materias.filter(function (m) { return m.profesorId === profesorId; }).sort(porNombre);
    },

    alumnosDeMateria: function (materiaId) {
      var ids = {};
      DB.inscripciones.forEach(function (i) {
        if (i.materiaId === materiaId) ids[i.alumnoId] = true;
      });
      return DB.alumnos.filter(function (a) { return ids[a.id]; }).sort(porNombre);
    },

    evaluacionesDeMateria: function (materiaId) {
      return DB.evaluaciones
        .filter(function (e) { return e.materiaId === materiaId; })
        .sort(function (a, b) { return cmp(txt(a.fecha), txt(b.fecha)); });
    },

    tareasDeMateria: function (materiaId) {
      return DB.tareas
        .filter(function (t) { return t.materiaId === materiaId; })
        .sort(function (a, b) { return cmp(txt(a.vence), txt(b.vence)); });
    },

    materialesDeMateria: function (materiaId) {
      return DB.materiales
        .filter(function (m) { return m.materiaId === materiaId; })
        .sort(function (a, b) { return cmp(txt(b.subidoEl), txt(a.subidoEl)); });
    },

    entrega: function (tareaId, alumnoId) {
      return DB.entregas.filter(function (e) {
        return e.tareaId === tareaId && e.alumnoId === alumnoId;
      })[0] || null;
    },

    entregasDeTarea: function (tareaId) {
      return DB.entregas.filter(function (e) { return e.tareaId === tareaId; });
    },

    /* ------------------------------------------------------------ académico */
    nota: function (alumnoId, evaluacionId) {
      return DB.calificaciones.filter(function (c) {
        return c.alumnoId === alumnoId && c.evaluacionId === evaluacionId;
      })[0] || null;
    },

    promedioMateria: function (alumnoId, materiaId) {
      var suma = 0;
      var pesos = 0;
      Q.evaluacionesDeMateria(materiaId).forEach(function (ev) {
        var c = Q.nota(alumnoId, ev.id);
        if (!c || typeof c.valor !== 'number' || !isFinite(c.valor)) return;
        var peso = (typeof ev.peso === 'number' && ev.peso > 0) ? ev.peso : 1;
        suma += c.valor * peso;
        pesos += peso;
      });
      if (pesos === 0) return null;
      return red1(suma / pesos);
    },

    promedioGeneral: function (alumnoId) {
      var vals = [];
      Q.materiasDeAlumno(alumnoId).forEach(function (m) {
        var p = Q.promedioMateria(alumnoId, m.id);
        if (p !== null) vals.push(p);
      });
      if (!vals.length) return null;
      var suma = vals.reduce(function (a, b) { return a + b; }, 0);
      return red1(suma / vals.length);
    },

    promedioGrupo: function (materiaId) {
      var vals = [];
      Q.alumnosDeMateria(materiaId).forEach(function (a) {
        var p = Q.promedioMateria(a.id, materiaId);
        if (p !== null) vals.push(p);
      });
      if (!vals.length) return null;
      var suma = vals.reduce(function (a, b) { return a + b; }, 0);
      return red1(suma / vals.length);
    },

    avanceMateria: function (alumnoId, materiaId) {
      var evs = Q.evaluacionesDeMateria(materiaId);
      var hechas = 0;
      evs.forEach(function (ev) { if (Q.nota(alumnoId, ev.id)) hechas++; });
      return {
        calificadas: hechas,
        total: evs.length,
        pct: evs.length ? Math.round(hechas / evs.length * 100) : 0
      };
    },

    asistencia: function (alumnoId, materiaId) {
      var presentes = 0;
      var totales = 0;
      DB.asistencias.forEach(function (a) {
        if (a.alumnoId !== alumnoId) return;
        if (materiaId && a.materiaId !== materiaId) return;
        presentes += num(a.presentes);
        totales += num(a.totales);
      });
      return {
        presentes: presentes,
        totales: totales,
        pct: totales > 0 ? Math.round(presentes / totales * 100) : 0
      };
    },

    /* Serie de tendencia: un punto por nombre de evaluación, en orden cronológico. */
    rendimientoPorParcial: function (alumnoId) {
      var suyas = {};
      Q.materiasDeAlumno(alumnoId).forEach(function (m) { suyas[m.id] = true; });

      var grupos = [];
      var indice = {};
      DB.evaluaciones
        .filter(function (ev) { return suyas[ev.materiaId] && TIPOS_TENDENCIA[ev.tipo]; })
        .slice()
        .sort(function (a, b) { return cmp(txt(a.fecha), txt(b.fecha)); })
        .forEach(function (ev) {
          var g = indice[ev.nombre];
          if (!g) {
            g = { etiqueta: ev.nombre, fecha: txt(ev.fecha), suma: 0, n: 0 };
            indice[ev.nombre] = g;
            grupos.push(g);
          }
          if (txt(ev.fecha) < g.fecha) g.fecha = txt(ev.fecha);
          var c = Q.nota(alumnoId, ev.id);
          if (c && typeof c.valor === 'number' && isFinite(c.valor)) {
            g.suma += c.valor;
            g.n++;
          }
        });

      return grupos
        .sort(function (a, b) { return cmp(a.fecha, b.fecha); })
        .filter(function (g) { return g.n > 0; })
        .map(function (g) { return { etiqueta: g.etiqueta, valor: red1(g.suma / g.n) }; });
    },

    /* ---------------------------------------------------------------- pagos */
    pagosDeAlumno: function (alumnoId) {
      return DB.pagos
        .filter(function (p) { return p.alumnoId === alumnoId; })
        .sort(function (a, b) {
          var c = cmp(txt(b.vence), txt(a.vence));
          return c !== 0 ? c : cmp(txt(b.periodo), txt(a.periodo));
        });
    },

    adeudo: function (alumnoId) {
      var total = 0;
      var vencidos = 0;
      var pendientes = 0;
      DB.pagos.forEach(function (p) {
        if (p.alumnoId !== alumnoId || p.estado === 'pagado') return;
        total += num(p.monto) + num(p.recargo);
        if (p.estado === 'vencido') vencidos++;
        else pendientes++;
      });
      return { total: total, vencidos: vencidos, pendientes: pendientes, alCorriente: total === 0 };
    },

    /* --------------------------------------------------------- tareas y aula */
    tareasDeAlumno: function (alumnoId) {
      var suyas = {};
      Q.materiasDeAlumno(alumnoId).forEach(function (m) { suyas[m.id] = m; });
      return DB.tareas
        .filter(function (t) { return suyas[t.materiaId]; })
        .sort(function (a, b) { return cmp(txt(a.vence), txt(b.vence)); })
        .map(function (t) {
          return { tarea: t, materia: suyas[t.materiaId], entrega: Q.entrega(t.id, alumnoId) };
        });
    },

    proximasEntregas: function (alumnoId, n) {
      var lim = (typeof n === 'number' && n > 0) ? n : 5;
      return Q.tareasDeAlumno(alumnoId)
        .filter(function (x) { return !x.entrega || x.entrega.estado !== 'revisada'; })
        .slice(0, lim);
    },

    materialesDeAlumno: function (alumnoId) {
      var suyas = {};
      Q.materiasDeAlumno(alumnoId).forEach(function (m) { suyas[m.id] = m; });
      return DB.materiales
        .filter(function (mt) { return suyas[mt.materiaId]; })
        .sort(function (a, b) { return cmp(txt(b.subidoEl), txt(a.subidoEl)); })
        .map(function (mt) { return { material: mt, materia: suyas[mt.materiaId] }; });
    },

    avisosPara: function (rol, id) {
      var lista;
      if (rol === 'direccion') {
        lista = DB.avisos.slice();
      } else if (rol === 'profesor') {
        var mias = {};
        Q.materiasDeProfesor(id).forEach(function (m) { mias[m.id] = true; });
        lista = DB.avisos.filter(function (av) {
          if (av.ambito === 'escuela') return true;
          if (av.autorId === id) return true;
          return av.ambito === 'materia' && mias[av.materiaId];
        });
      } else if (rol === 'alumno') {
        var inscritas = {};
        Q.materiasDeAlumno(id).forEach(function (m) { inscritas[m.id] = true; });
        lista = DB.avisos.filter(function (av) {
          if (av.ambito === 'escuela') return true;
          return av.ambito === 'materia' && inscritas[av.materiaId];
        });
      } else {
        lista = DB.avisos.filter(function (av) { return av.ambito === 'escuela'; });
      }
      return lista.sort(function (a, b) { return cmp(txt(b.fecha), txt(a.fecha)); });
    },

    /* -------------------------------------------------------------- reseñas */
    resenasDeProfesor: function (profesorId, estado) {
      var filtro = (estado && estado !== 'todas') ? estado : null;
      return DB.resenas
        .filter(function (r) {
          return r.profesorId === profesorId && (!filtro || r.estado === filtro);
        })
        .sort(function (a, b) { return cmp(txt(b.fecha), txt(a.fecha)); });
    },

    resenaDe: function (alumnoId, profesorId) {
      return DB.resenas.filter(function (r) {
        return r.alumnoId === alumnoId && r.profesorId === profesorId;
      })[0] || null;
    },

    ratingProfesor: function (profesorId, soloPublicas) {
      var lista = DB.resenas.filter(function (r) {
        return r.profesorId === profesorId && (!soloPublicas || r.estado === 'publica');
      });
      var distribucion = [0, 0, 0, 0, 0];
      var suma = 0;
      var sumaCrit = { claridad: 0, dominio: 0, trato: 0, puntualidad: 0 };
      var nCrit = { claridad: 0, dominio: 0, trato: 0, puntualidad: 0 };

      lista.forEach(function (r) {
        var e = num(r.estrellas);
        suma += e;
        var caja = Math.round(e);
        if (caja >= 1 && caja <= 5) distribucion[caja - 1]++;
        CRITERIOS.forEach(function (k) {
          var v = r.criterios ? Number(r.criterios[k]) : NaN;
          if (isFinite(v) && v > 0) { sumaCrit[k] += v; nCrit[k]++; }
        });
      });

      var criterios = {};
      CRITERIOS.forEach(function (k) {
        criterios[k] = nCrit[k] ? red1(sumaCrit[k] / nCrit[k]) : 0;
      });

      return {
        promedio: lista.length ? red1(suma / lista.length) : 0,
        total: lista.length,
        distribucion: distribucion,
        criterios: criterios
      };
    },

    /* --------------------------------------------------------------- global */
    kpisEscuela: function () {
      var activos = Q.alumnosActivos();
      var proms = [];
      var presentes = 0;
      var totales = 0;

      activos.forEach(function (a) {
        var g = Q.promedioGeneral(a.id);
        if (g !== null) proms.push(g);
        var s = Q.asistencia(a.id);
        presentes += s.presentes;
        totales += s.totales;
      });

      var cobrado = 0;
      var porCobrar = 0;
      var vencido = 0;
      DB.pagos.forEach(function (p) {
        var monto = num(p.monto);
        var recargo = num(p.recargo);
        if (p.estado === 'pagado') {
          cobrado += monto;
        } else {
          porCobrar += monto + recargo;
          if (p.estado === 'vencido') vencido += monto + recargo;
        }
      });

      var sumaProm = proms.reduce(function (a, b) { return a + b; }, 0);
      var universo = cobrado + porCobrar;

      return {
        alumnos: activos.length,
        profesores: DB.profesores.filter(function (p) { return p.estatus !== 'baja'; }).length,
        materias: DB.materias.filter(function (m) { return m.estatus === 'activa'; }).length,
        promedioGeneral: proms.length ? red1(sumaProm / proms.length) : null,
        asistencia: totales > 0 ? Math.round(presentes / totales * 100) : 0,
        cobrado: cobrado,
        porCobrar: porCobrar,
        vencido: vencido,
        cumplimientoPct: universo > 0 ? Math.round(cobrado / universo * 100) : 0
      };
    },

    /* '2025-08' -> 'Ago'; '2025-08b' -> 'Ago (col.)' */
    etiquetaPeriodo: function (periodo) {
      var t = txt(periodo);
      var m = /^(\d{4})-(\d{2})(.*)$/.exec(t);
      if (!m) return t;
      var mes = MESES3[parseInt(m[2], 10) - 1] || m[2];
      return m[3] ? mes + ' (col.)' : mes;
    },

    ingresosPorMes: function () {
      var indice = {};
      var orden = [];
      DB.pagos.forEach(function (p) {
        var per = txt(p.periodo);
        var g = indice[per];
        if (!g) {
          g = { periodo: per, etiqueta: Q.etiquetaPeriodo(per), cobrado: 0, esperado: 0 };
          indice[per] = g;
          orden.push(g);
        }
        var monto = num(p.monto);
        g.esperado += monto;
        if (p.estado === 'pagado') g.cobrado += monto;
      });
      return orden
        .sort(function (a, b) { return cmp(a.periodo, b.periodo); })
        .map(function (g) {
          return { etiqueta: g.etiqueta, cobrado: g.cobrado, esperado: g.esperado };
        });
    },

    riesgo: function () {
      var filas = [];
      Q.alumnosActivos().forEach(function (a) {
        var prom = Q.promedioGeneral(a.id);
        var asis = Q.asistencia(a.id);
        var deuda = Q.adeudo(a.id);
        var motivos = [];
        var criterios = 0;

        if (prom !== null && prom < 7) {
          motivos.push('promedio general de ' + prom.toFixed(1));
          criterios++;
        }
        if (asis.totales > 0 && asis.pct < 80) {
          motivos.push('asistencia del ' + asis.pct + '%');
          criterios++;
        }
        if (deuda.vencidos > 0) {
          motivos.push(deuda.vencidos === 1 ? 'un pago vencido' : deuda.vencidos + ' pagos vencidos');
          criterios++;
        }
        if (!criterios) return;

        var severidad = 'baja';
        if (criterios >= 2 || (prom !== null && prom < 6)) severidad = 'alta';
        else if (criterios === 1 && prom !== null && prom < 7.5) severidad = 'media';

        filas.push({
          alumno: a,
          motivo: frase(motivos),
          severidad: severidad,
          _orden: prom === null ? 11 : prom
        });
      });

      var rango = { alta: 0, media: 1, baja: 2 };
      filas.sort(function (x, y) {
        var d = rango[x.severidad] - rango[y.severidad];
        return d !== 0 ? d : x._orden - y._orden;
      });
      return filas.map(function (f) {
        return { alumno: f.alumno, motivo: f.motivo, severidad: f.severidad };
      });
    },

    /* Días enteros entre una fecha ISO (00:00 local) y HOY a medianoche. */
    diasParaEntrega: function (iso) {
      var partes = txt(iso).split('-');
      if (partes.length < 3) return 0;
      var anio = parseInt(partes[0], 10);
      var mes = parseInt(partes[1], 10);
      var dia = parseInt(partes[2], 10);
      if (!isFinite(anio) || !isFinite(mes) || !isFinite(dia)) return 0;
      var destino = new Date(anio, mes - 1, dia);
      var base = new Date(HOY.getFullYear(), HOY.getMonth(), HOY.getDate());
      return Math.round((destino.getTime() - base.getTime()) / 86400000);
    }
  };

  return api;
})();

/* -------------------------------------------------------------------- M --- */
const M = (function () {

  /* Paleta que ya usan los datos semilla (serie 1 a 6). */
  var PALETA = ['#1B4B7A', '#16704F', '#A9762A', '#6E3A63', '#2C7793', '#9C4A3D'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var TIPOS_EVAL = ['parcial', 'tarea', 'proyecto', 'practica'];
  var TIPOS_MATERIAL = ['pdf', 'video', 'liga', 'presentacion', 'hoja'];
  var ESTADOS_ENTREGA = ['pendiente', 'entregada', 'revisada', 'atrasada'];
  var ESTATUS_ALUMNO = ['activo', 'condicionado', 'baja'];
  var CRITERIOS = ['claridad', 'dominio', 'trato', 'puntualidad'];

  function mal(mensaje) { return { ok: false, error: mensaje }; }

  function bien(extra) {
    var r = { ok: true };
    if (extra) Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
    return r;
  }

  function texto(v) { return String(v === null || v === undefined ? '' : v).trim(); }
  function vacio(v) { return texto(v) === ''; }
  function esISO(v) { return /^\d{4}-\d{2}-\d{2}$/.test(texto(v)); }
  function hoyISO() { return Store.iso(HOY); }

  /* Acepta coma decimal: '8,5' -> 8.5. Devuelve NaN si no es número. */
  function aNumero(v) {
    if (typeof v === 'number') return isFinite(v) ? v : NaN;
    var t = texto(v).replace(',', '.');
    if (t === '') return NaN;
    var n = Number(t);
    return isFinite(n) ? n : NaN;
  }

  function aBool(v) {
    return v === true || v === 1 || v === '1' || v === 'on' ||
      v === 'si' || v === 'sí' || v === 'true';
  }

  function aLista(v) {
    if (Array.isArray(v)) {
      return v.map(function (x) { return texto(x); }).filter(Boolean);
    }
    if (typeof v === 'string') {
      return v.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    }
    return null;
  }

  function aFormacion(v) {
    if (!Array.isArray(v)) return null;
    return v.map(function (f) {
      return {
        grado: texto(f && f.grado),
        institucion: texto(f && f.institucion),
        anio: texto(f && f.anio)
      };
    }).filter(function (f) { return f.grado !== ''; });
  }

  function aExperiencia(v) {
    if (!Array.isArray(v)) return null;
    return v.map(function (e) {
      return {
        puesto: texto(e && e.puesto),
        lugar: texto(e && e.lugar),
        periodo: texto(e && e.periodo),
        detalle: texto(e && e.detalle)
      };
    }).filter(function (e) { return e.puesto !== ''; });
  }

  function aHorario(v) {
    if (!Array.isArray(v)) return null;
    return v.map(function (h) {
      return { dia: texto(h && h.dia), inicio: texto(h && h.inicio), fin: texto(h && h.fin) };
    }).filter(function (h) { return h.dia !== '' && h.inicio !== ''; });
  }

  /* Acentos por letra precompuesta: sin rangos Unicode frágiles. */
  var ACENTOS = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ü': 'U', 'Ñ': 'N'
  };

  function sinAcentos(t) {
    return String(t || '').replace(/[áéíóúüñÁÉÍÓÚÜÑ]/g, function (c) { return ACENTOS[c] || c; });
  }

  /* Palabras útiles del nombre: descarta tratamientos como «Mtro.» o «Dra.». */
  function palabrasNombre(nombre) {
    var partes = texto(nombre).split(/\s+/).filter(Boolean);
    var utiles = partes.filter(function (p) { return p.indexOf('.') < 0; });
    return utiles.length ? utiles : partes;
  }

  function iniciales(nombre) {
    var partes = palabrasNombre(nombre);
    if (!partes.length) return 'NA';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  function correoDe(nombre, dominio) {
    var partes = palabrasNombre(sinAcentos(texto(nombre)).toLowerCase());
    var base = partes.length > 1 ? partes[0] + '.' + partes[1] : (partes[0] || 'persona');
    return base.replace(/[^a-z0-9.]/g, '') + '@' + dominio;
  }

  function dominio() { return texto(DB.escuela.sitio) || 'colegioaltamira.mx'; }

  function siguienteFolio(lista, campo, prefijo) {
    var max = 0;
    lista.forEach(function (x) {
      var n = parseInt(texto(x[campo]).replace(prefijo, ''), 10);
      if (isFinite(n) && n > max) max = n;
    });
    return max + 1;
  }

  function colorDe(indice) { return PALETA[indice % PALETA.length]; }

  function quitar(coleccion, prueba) {
    var fuera = 0;
    for (var i = coleccion.length - 1; i >= 0; i--) {
      if (prueba(coleccion[i])) { coleccion.splice(i, 1); fuera++; }
    }
    return fuera;
  }

  function actorId(alterno) {
    var s = Sesion.actual();
    return s ? s.id : (alterno || 'dir-01');
  }

  var api = {

    /* ------------------------------------------------------- calificaciones */
    guardarNota: function (alumnoId, evaluacionId, valor) {
      var alumno = Q.alumno(alumnoId);
      var ev = Q.evaluacion(evaluacionId);
      if (!alumno) return mal('No se encontró a esa persona inscrita.');
      if (!ev) return mal('No se encontró la evaluación.');
      var materia = Q.materia(ev.materiaId);

      /* Vacío borra la calificación existente. */
      if (valor === '' || valor === null || valor === undefined) {
        var fuera = quitar(DB.calificaciones, function (c) {
          return c.alumnoId === alumnoId && c.evaluacionId === evaluacionId;
        });
        if (fuera) {
          Store.bitacora('Borró la calificación de «' + ev.nombre + '» de ' +
            (materia ? materia.nombre : 'la materia') + ' a ' + alumno.nombre + '.');
          Store.guardar();
        }
        return bien({ valor: null });
      }

      var n = aNumero(valor);
      if (isNaN(n)) return mal('La calificación debe ser un número entre 0 y 10.');
      if (n < 0 || n > 10) return mal('La calificación debe estar entre 0 y 10.');
      n = Q.red1(n);

      var quien = actorId(materia ? materia.profesorId : 'dir-01');
      var cal = Q.nota(alumnoId, evaluacionId);
      if (cal) {
        cal.valor = n;
        cal.capturadaEl = hoyISO();
        cal.capturadaPor = quien;
      } else {
        DB.calificaciones.push({
          id: Store.uid('cal'),
          alumnoId: alumnoId,
          evaluacionId: evaluacionId,
          valor: n,
          capturadaEl: hoyISO(),
          capturadaPor: quien
        });
      }
      Store.bitacora('Capturó ' + n.toFixed(1) + ' en «' + ev.nombre + '» de ' +
        (materia ? materia.nombre : 'la materia') + ' a ' + alumno.nombre + '.');
      Store.guardar();
      return bien({ valor: n });
    },

    /* ---------------------------------------------------------- evaluaciones */
    crearEvaluacion: function (materiaId, datos) {
      var d = datos || {};
      var materia = Q.materia(materiaId);
      if (!materia) return mal('No se encontró la materia.');
      if (vacio(d.nombre)) return mal('Escribe el nombre de la evaluación.');

      var tipo = texto(d.tipo) || 'parcial';
      if (TIPOS_EVAL.indexOf(tipo) < 0) return mal('El tipo de evaluación no es válido.');

      var peso = aNumero(d.peso);
      if (isNaN(peso)) return mal('Escribe el peso de la evaluación.');
      if (peso > 1) peso = peso / 100;           /* admite 25 además de 0.25 */
      if (peso <= 0 || peso > 1) return mal('El peso debe ser mayor que 0 y hasta 100%.');

      var fecha = esISO(d.fecha) ? texto(d.fecha) : hoyISO();

      var ev = {
        id: Store.uid('ev'),
        materiaId: materiaId,
        nombre: texto(d.nombre),
        tipo: tipo,
        peso: Math.round(peso * 100) / 100,
        fecha: fecha
      };
      DB.evaluaciones.push(ev);
      Store.bitacora('Creó la evaluación «' + ev.nombre + '» en ' + materia.nombre + '.');
      Store.guardar();
      return bien({ id: ev.id });
    },

    actualizarEvaluacion: function (id, datos) {
      var d = datos || {};
      var ev = Q.evaluacion(id);
      if (!ev) return mal('No se encontró la evaluación.');

      if (d.nombre !== undefined) {
        if (vacio(d.nombre)) return mal('El nombre de la evaluación no puede quedar vacío.');
        ev.nombre = texto(d.nombre);
      }
      if (d.tipo !== undefined) {
        var tipo = texto(d.tipo);
        if (TIPOS_EVAL.indexOf(tipo) < 0) return mal('El tipo de evaluación no es válido.');
        ev.tipo = tipo;
      }
      if (d.peso !== undefined) {
        var peso = aNumero(d.peso);
        if (isNaN(peso)) return mal('El peso debe ser un número.');
        if (peso > 1) peso = peso / 100;
        if (peso <= 0 || peso > 1) return mal('El peso debe ser mayor que 0 y hasta 100%.');
        ev.peso = Math.round(peso * 100) / 100;
      }
      if (d.fecha !== undefined) {
        if (!esISO(d.fecha)) return mal('La fecha debe tener el formato AAAA-MM-DD.');
        ev.fecha = texto(d.fecha);
      }

      var materia = Q.materia(ev.materiaId);
      Store.bitacora('Actualizó la evaluación «' + ev.nombre + '» de ' +
        (materia ? materia.nombre : 'una materia') + '.');
      Store.guardar();
      return bien({ id: ev.id });
    },

    eliminarEvaluacion: function (id) {
      var ev = Q.evaluacion(id);
      if (!ev) return mal('No se encontró la evaluación.');
      var materia = Q.materia(ev.materiaId);
      quitar(DB.calificaciones, function (c) { return c.evaluacionId === id; });
      quitar(DB.evaluaciones, function (e) { return e.id === id; });
      Store.bitacora('Eliminó la evaluación «' + ev.nombre + '» de ' +
        (materia ? materia.nombre : 'una materia') + ' y sus calificaciones.');
      Store.guardar();
      return bien();
    },

    /* --------------------------------------------------------------- materias */
    crearMateria: function (datos) {
      var d = datos || {};
      if (vacio(d.nombre)) return mal('Escribe el nombre de la materia.');
      var codigo = texto(d.codigo).toUpperCase();
      if (codigo === '') return mal('Escribe la clave de la materia.');
      var repetida = DB.materias.filter(function (m) {
        return texto(m.codigo).toUpperCase() === codigo;
      })[0];
      if (repetida) return mal('Ya existe una materia con la clave ' + codigo + '.');

      var profesor = Q.profesor(texto(d.profesorId));
      if (!profesor) return mal('Elige una persona docente válida.');

      var creditos = aNumero(d.creditos);
      if (isNaN(creditos) || creditos <= 0) creditos = 5;
      var cupo = aNumero(d.cupo);
      if (isNaN(cupo) || cupo <= 0) cupo = 24;

      var horario = aHorario(d.horario);
      if (!horario && !vacio(d.dia) && !vacio(d.inicio)) {
        horario = [{ dia: texto(d.dia), inicio: texto(d.inicio), fin: texto(d.fin) }];
      }

      var materia = {
        id: Store.uid('mat'),
        codigo: codigo,
        nombre: texto(d.nombre),
        profesorId: profesor.id,
        creditos: Math.round(creditos),
        aula: texto(d.aula) || 'Por asignar',
        cupo: Math.round(cupo),
        horario: horario || [],
        descripcion: texto(d.descripcion),
        color: texto(d.color) || colorDe(DB.materias.length),
        estatus: 'activa'
      };
      DB.materias.push(materia);
      Store.bitacora('Dio de alta la materia ' + materia.codigo + ' — ' + materia.nombre + '.');
      Store.guardar();
      return bien({ id: materia.id });
    },

    actualizarMateria: function (id, datos) {
      var d = datos || {};
      var materia = Q.materia(id);
      if (!materia) return mal('No se encontró la materia.');

      if (d.codigo !== undefined) {
        var codigo = texto(d.codigo).toUpperCase();
        if (codigo === '') return mal('La clave de la materia no puede quedar vacía.');
        var choque = DB.materias.filter(function (m) {
          return m.id !== id && texto(m.codigo).toUpperCase() === codigo;
        })[0];
        if (choque) return mal('Ya existe otra materia con la clave ' + codigo + '.');
        materia.codigo = codigo;
      }
      if (d.nombre !== undefined) {
        if (vacio(d.nombre)) return mal('El nombre de la materia no puede quedar vacío.');
        materia.nombre = texto(d.nombre);
      }
      if (d.profesorId !== undefined) {
        var profesor = Q.profesor(texto(d.profesorId));
        if (!profesor) return mal('Elige una persona docente válida.');
        materia.profesorId = profesor.id;
      }
      if (d.creditos !== undefined) {
        var creditos = aNumero(d.creditos);
        if (isNaN(creditos) || creditos <= 0) return mal('Los créditos deben ser un número mayor que 0.');
        materia.creditos = Math.round(creditos);
      }
      if (d.cupo !== undefined) {
        var cupo = aNumero(d.cupo);
        if (isNaN(cupo) || cupo <= 0) return mal('El cupo debe ser un número mayor que 0.');
        var inscritos = Q.alumnosDeMateria(id).length;
        if (cupo < inscritos) return mal('El cupo no puede ser menor que las ' + inscritos + ' personas ya inscritas.');
        materia.cupo = Math.round(cupo);
      }
      if (d.aula !== undefined) materia.aula = texto(d.aula);
      if (d.descripcion !== undefined) materia.descripcion = texto(d.descripcion);
      if (d.color !== undefined && !vacio(d.color)) materia.color = texto(d.color);
      if (d.estatus !== undefined) {
        var estatus = texto(d.estatus);
        if (['activa', 'archivada'].indexOf(estatus) < 0) return mal('El estatus de la materia no es válido.');
        materia.estatus = estatus;
      }
      var horario = aHorario(d.horario);
      if (horario) materia.horario = horario;

      Store.bitacora('Actualizó la materia ' + materia.codigo + ' — ' + materia.nombre + '.');
      Store.guardar();
      return bien({ id: materia.id });
    },

    archivarMateria: function (id) {
      var materia = Q.materia(id);
      if (!materia) return mal('No se encontró la materia.');
      if (materia.estatus === 'archivada') return mal('Esa materia ya está archivada.');
      materia.estatus = 'archivada';
      Store.bitacora('Archivó la materia ' + materia.codigo + ' — ' + materia.nombre + '.');
      Store.guardar();
      return bien();
    },

    /* ---------------------------------------------------------- inscripciones */
    inscribir: function (alumnoId, materiaId) {
      var alumno = Q.alumno(alumnoId);
      var materia = Q.materia(materiaId);
      if (!alumno) return mal('No se encontró a esa persona.');
      if (!materia) return mal('No se encontró la materia.');
      if (materia.estatus !== 'activa') return mal('Esa materia está archivada.');
      if (alumno.estatus === 'baja') return mal('No se puede inscribir a alguien dado de baja.');

      var ya = DB.inscripciones.filter(function (i) {
        return i.alumnoId === alumnoId && i.materiaId === materiaId;
      })[0];
      if (ya) return mal(alumno.nombre + ' ya está inscrita o inscrito en ' + materia.nombre + '.');

      var inscritos = Q.alumnosDeMateria(materiaId).length;
      if (materia.cupo && inscritos >= materia.cupo) {
        return mal('La materia ya alcanzó su cupo de ' + materia.cupo + '.');
      }

      DB.inscripciones.push({ id: Store.uid('ins'), alumnoId: alumnoId, materiaId: materiaId });

      var tieneAsistencia = DB.asistencias.filter(function (a) {
        return a.alumnoId === alumnoId && a.materiaId === materiaId;
      })[0];
      if (!tieneAsistencia) {
        DB.asistencias.push({
          id: Store.uid('as'), alumnoId: alumnoId, materiaId: materiaId, presentes: 0, totales: 0
        });
      }

      /* Entregas pendientes sólo de lo que todavía no vence. */
      var hoy = hoyISO();
      DB.tareas.forEach(function (t) {
        if (t.materiaId !== materiaId || texto(t.vence) < hoy) return;
        if (Q.entrega(t.id, alumnoId)) return;
        DB.entregas.push({
          id: Store.uid('ent'), tareaId: t.id, alumnoId: alumnoId,
          estado: 'pendiente', fecha: null, calificacion: null
        });
      });

      Store.bitacora('Inscribió a ' + alumno.nombre + ' en ' + materia.nombre + '.');
      Store.guardar();
      return bien();
    },

    desinscribir: function (alumnoId, materiaId) {
      var alumno = Q.alumno(alumnoId);
      var materia = Q.materia(materiaId);
      if (!alumno) return mal('No se encontró a esa persona.');
      if (!materia) return mal('No se encontró la materia.');

      var fuera = quitar(DB.inscripciones, function (i) {
        return i.alumnoId === alumnoId && i.materiaId === materiaId;
      });
      if (!fuera) return mal(alumno.nombre + ' no está inscrita o inscrito en ' + materia.nombre + '.');

      var evs = {};
      DB.evaluaciones.forEach(function (e) { if (e.materiaId === materiaId) evs[e.id] = true; });
      var tars = {};
      DB.tareas.forEach(function (t) { if (t.materiaId === materiaId) tars[t.id] = true; });

      quitar(DB.calificaciones, function (c) { return c.alumnoId === alumnoId && evs[c.evaluacionId]; });
      quitar(DB.entregas, function (e) { return e.alumnoId === alumnoId && tars[e.tareaId]; });
      quitar(DB.asistencias, function (a) { return a.alumnoId === alumnoId && a.materiaId === materiaId; });

      Store.bitacora('Dio de baja a ' + alumno.nombre + ' de ' + materia.nombre + '.');
      Store.guardar();
      return bien();
    },

    /* --------------------------------------------------------------- alumnos */
    crearAlumno: function (datos) {
      var d = datos || {};
      if (vacio(d.nombre)) return mal('Escribe el nombre completo.');
      if (!vacio(d.email)) {
        if (texto(d.email).indexOf('@') < 0) return mal('El correo no tiene un formato válido.');
      }
      var beca = aNumero(d.becaPct);
      if (isNaN(beca)) beca = 0;
      if (beca < 0 || beca > 100) return mal('La beca debe estar entre 0 y 100%.');

      var estatus = texto(d.estatus) || 'activo';
      if (ESTATUS_ALUMNO.indexOf(estatus) < 0) estatus = 'activo';

      var nombre = texto(d.nombre);
      var tutor = d.tutor || {};
      var alumno = {
        id: Store.uid('al'),
        rol: 'alumno',
        matricula: 'A-' + siguienteFolio(DB.alumnos, 'matricula', 'A-'),
        nombre: nombre,
        email: texto(d.email) || correoDe(nombre, 'alumnos.' + dominio()),
        foto: null,
        iniciales: iniciales(nombre),
        color: colorDe(DB.alumnos.length),
        nacimiento: esISO(d.nacimiento) ? texto(d.nacimiento) : '',
        telefono: texto(d.telefono),
        tutor: {
          nombre: texto(tutor.nombre) || texto(d.tutorNombre),
          parentesco: texto(tutor.parentesco) || texto(d.tutorParentesco),
          telefono: texto(tutor.telefono) || texto(d.tutorTelefono),
          email: texto(tutor.email) || texto(d.tutorEmail)
        },
        ingreso: esISO(d.ingreso) ? texto(d.ingreso) : hoyISO(),
        estatus: estatus,
        becaPct: Math.round(beca),
        notas: texto(d.notas)
      };
      DB.alumnos.push(alumno);
      Store.bitacora('Dio de alta a ' + alumno.nombre + ' con matrícula ' + alumno.matricula + '.');
      Store.guardar();
      return bien({ id: alumno.id, matricula: alumno.matricula });
    },

    actualizarAlumno: function (id, datos) {
      var d = datos || {};
      var alumno = Q.alumno(id);
      if (!alumno) return mal('No se encontró a esa persona.');

      if (d.nombre !== undefined) {
        if (vacio(d.nombre)) return mal('El nombre no puede quedar vacío.');
        alumno.nombre = texto(d.nombre);
        alumno.iniciales = iniciales(alumno.nombre);
      }
      if (d.email !== undefined) {
        if (vacio(d.email) || texto(d.email).indexOf('@') < 0) return mal('El correo no tiene un formato válido.');
        alumno.email = texto(d.email);
      }
      if (d.telefono !== undefined) alumno.telefono = texto(d.telefono);
      if (d.nacimiento !== undefined) {
        if (!vacio(d.nacimiento) && !esISO(d.nacimiento)) return mal('La fecha de nacimiento debe ser AAAA-MM-DD.');
        alumno.nacimiento = texto(d.nacimiento);
      }
      if (d.ingreso !== undefined) {
        if (!esISO(d.ingreso)) return mal('La fecha de ingreso debe ser AAAA-MM-DD.');
        alumno.ingreso = texto(d.ingreso);
      }
      if (d.becaPct !== undefined) {
        var beca = aNumero(d.becaPct);
        if (isNaN(beca) || beca < 0 || beca > 100) return mal('La beca debe estar entre 0 y 100%.');
        alumno.becaPct = Math.round(beca);
      }
      if (d.estatus !== undefined) {
        var estatus = texto(d.estatus);
        if (ESTATUS_ALUMNO.indexOf(estatus) < 0) return mal('El estatus no es válido.');
        alumno.estatus = estatus;
      }
      if (d.notas !== undefined) alumno.notas = texto(d.notas);

      var t = d.tutor;
      if (t || d.tutorNombre !== undefined || d.tutorTelefono !== undefined ||
        d.tutorEmail !== undefined || d.tutorParentesco !== undefined) {
        t = t || {};
        var previo = alumno.tutor || {};
        alumno.tutor = {
          nombre: texto(t.nombre !== undefined ? t.nombre : (d.tutorNombre !== undefined ? d.tutorNombre : previo.nombre)),
          parentesco: texto(t.parentesco !== undefined ? t.parentesco : (d.tutorParentesco !== undefined ? d.tutorParentesco : previo.parentesco)),
          telefono: texto(t.telefono !== undefined ? t.telefono : (d.tutorTelefono !== undefined ? d.tutorTelefono : previo.telefono)),
          email: texto(t.email !== undefined ? t.email : (d.tutorEmail !== undefined ? d.tutorEmail : previo.email))
        };
      }

      Store.bitacora('Actualizó el expediente de ' + alumno.nombre + '.');
      Store.guardar();
      return bien({ id: alumno.id });
    },

    cambiarEstatusAlumno: function (id, estatus) {
      var alumno = Q.alumno(id);
      if (!alumno) return mal('No se encontró a esa persona.');
      var nuevo = texto(estatus);
      if (ESTATUS_ALUMNO.indexOf(nuevo) < 0) return mal('El estatus no es válido.');
      if (alumno.estatus === nuevo) return mal(alumno.nombre + ' ya tiene ese estatus.');
      alumno.estatus = nuevo;
      Store.bitacora('Cambió a «' + nuevo + '» el estatus de ' + alumno.nombre + '.');
      Store.guardar();
      return bien();
    },

    /* ------------------------------------------------------------ profesores */
    crearProfesor: function (datos) {
      var d = datos || {};
      if (vacio(d.nombre)) return mal('Escribe el nombre completo.');
      if (!vacio(d.email) && texto(d.email).indexOf('@') < 0) return mal('El correo no tiene un formato válido.');

      var nombre = texto(d.nombre);
      var profesor = {
        id: Store.uid('pr'),
        rol: 'profesor',
        clave: 'D-' + siguienteFolio(DB.profesores, 'clave', 'D-'),
        nombre: nombre,
        email: texto(d.email) || correoDe(nombre, dominio()),
        foto: null,
        iniciales: iniciales(nombre),
        color: colorDe(DB.profesores.length),
        titulo: texto(d.titulo),
        bio: texto(d.bio),
        telefono: texto(d.telefono),
        oficina: texto(d.oficina) || 'Por asignar',
        horarioAsesoria: texto(d.horarioAsesoria),
        formacion: aFormacion(d.formacion) || [],
        experiencia: aExperiencia(d.experiencia) || [],
        areas: aLista(d.areas) || [],
        cv: null,
        perfilPublico: d.perfilPublico === undefined ? true : aBool(d.perfilPublico),
        ingreso: esISO(d.ingreso) ? texto(d.ingreso) : hoyISO(),
        estatus: 'activo'
      };
      DB.profesores.push(profesor);
      Store.bitacora('Dio de alta a ' + profesor.nombre + ' con clave ' + profesor.clave + '.');
      Store.guardar();
      return bien({ id: profesor.id, clave: profesor.clave });
    },

    actualizarProfesor: function (id, datos) {
      var d = datos || {};
      var profesor = Q.profesor(id);
      if (!profesor) return mal('No se encontró a esa persona docente.');

      if (d.nombre !== undefined) {
        if (vacio(d.nombre)) return mal('El nombre no puede quedar vacío.');
        profesor.nombre = texto(d.nombre);
        profesor.iniciales = iniciales(profesor.nombre);
      }
      if (d.email !== undefined) {
        if (vacio(d.email) || texto(d.email).indexOf('@') < 0) return mal('El correo no tiene un formato válido.');
        profesor.email = texto(d.email);
      }
      if (d.telefono !== undefined) profesor.telefono = texto(d.telefono);
      if (d.titulo !== undefined) profesor.titulo = texto(d.titulo);
      if (d.oficina !== undefined) profesor.oficina = texto(d.oficina);
      if (d.horarioAsesoria !== undefined) profesor.horarioAsesoria = texto(d.horarioAsesoria);
      if (d.bio !== undefined) profesor.bio = texto(d.bio);
      if (d.ingreso !== undefined) {
        if (!esISO(d.ingreso)) return mal('La fecha de ingreso debe ser AAAA-MM-DD.');
        profesor.ingreso = texto(d.ingreso);
      }
      if (d.estatus !== undefined) {
        var estatus = texto(d.estatus);
        if (['activo', 'baja'].indexOf(estatus) < 0) return mal('El estatus no es válido.');
        profesor.estatus = estatus;
      }
      var areas = aLista(d.areas);
      if (areas) profesor.areas = areas;
      if (d.perfilPublico !== undefined) profesor.perfilPublico = aBool(d.perfilPublico);

      Store.bitacora('Actualizó el expediente de ' + profesor.nombre + '.');
      Store.guardar();
      return bien({ id: profesor.id });
    },

    actualizarPerfilProfesor: function (id, datos) {
      var d = datos || {};
      var profesor = Q.profesor(id);
      if (!profesor) return mal('No se encontró a esa persona docente.');

      if (d.titulo !== undefined) profesor.titulo = texto(d.titulo);
      if (d.bio !== undefined) {
        if (texto(d.bio).length > 900) return mal('La semblanza no debe pasar de 900 caracteres.');
        profesor.bio = texto(d.bio);
      }
      if (d.telefono !== undefined) profesor.telefono = texto(d.telefono);
      if (d.oficina !== undefined) profesor.oficina = texto(d.oficina);
      if (d.horarioAsesoria !== undefined) profesor.horarioAsesoria = texto(d.horarioAsesoria);
      if (d.perfilPublico !== undefined) profesor.perfilPublico = aBool(d.perfilPublico);

      var areas = aLista(d.areas);
      if (areas) profesor.areas = areas;
      var formacion = aFormacion(d.formacion);
      if (formacion) profesor.formacion = formacion;
      var experiencia = aExperiencia(d.experiencia);
      if (experiencia) profesor.experiencia = experiencia;

      Store.bitacora('Actualizó su perfil público docente.');
      Store.guardar();
      return bien({ id: profesor.id });
    },

    subirFoto: function (rol, id, dataUrl) {
      var persona = Q.persona(rol, id);
      if (!persona) return mal('No se encontró a esa persona.');
      if (dataUrl === null || dataUrl === '' || dataUrl === undefined) {
        persona.foto = null;
        Store.bitacora('Quitó la fotografía de ' + persona.nombre + '.');
        Store.guardar();
        return bien();
      }
      var url = String(dataUrl);
      if (url.indexOf('data:image') !== 0) return mal('El archivo debe ser una imagen.');
      if (url.length > 4000000) return mal('La imagen es demasiado grande: elige una de menos de 3 MB.');
      persona.foto = url;
      Store.bitacora('Actualizó la fotografía de ' + persona.nombre + '.');
      Store.guardar();
      return bien();
    },

    subirCV: function (profesorId, archivo) {
      var profesor = Q.profesor(profesorId);
      if (!profesor) return mal('No se encontró a esa persona docente.');
      if (!archivo || vacio(archivo.nombre)) return mal('Elige un archivo antes de guardar.');
      profesor.cv = {
        nombre: texto(archivo.nombre),
        tamano: texto(archivo.tamano) || '—',
        actualizado: hoyISO(),
        url: archivo.url || null
      };
      Store.bitacora('Subió el currículum «' + profesor.cv.nombre + '».');
      Store.guardar();
      return bien();
    },

    /* ---------------------------------------------------------------- tareas */
    crearTarea: function (materiaId, datos) {
      var d = datos || {};
      var materia = Q.materia(materiaId);
      if (!materia) return mal('No se encontró la materia.');
      if (vacio(d.titulo)) return mal('Escribe el título de la tarea.');
      if (!esISO(d.vence)) return mal('Elige la fecha de entrega (AAAA-MM-DD).');

      var puntos = aNumero(d.puntos);
      if (isNaN(puntos) || puntos <= 0) puntos = 10;

      var tarea = {
        id: Store.uid('tar'),
        materiaId: materiaId,
        titulo: texto(d.titulo),
        descripcion: texto(d.descripcion),
        tipo: texto(d.tipo) || 'tarea',
        vence: texto(d.vence),
        puntos: Math.round(puntos),
        publicadaEl: hoyISO(),
        archivo: d.archivo && !vacio(d.archivo.nombre)
          ? { nombre: texto(d.archivo.nombre), tamano: texto(d.archivo.tamano) || '—' }
          : null
      };
      DB.tareas.push(tarea);

      var inscritos = Q.alumnosDeMateria(materiaId);
      inscritos.forEach(function (a) {
        DB.entregas.push({
          id: Store.uid('ent'),
          tareaId: tarea.id,
          alumnoId: a.id,
          estado: 'pendiente',
          fecha: null,
          calificacion: null
        });
      });

      Store.bitacora('Publicó la tarea «' + tarea.titulo + '» en ' + materia.nombre +
        ' para ' + inscritos.length + ' personas.');
      Store.guardar();
      return bien({ id: tarea.id, entregas: inscritos.length });
    },

    marcarEntrega: function (tareaId, alumnoId, estado, calificacion) {
      var tarea = Q.tarea(tareaId);
      var alumno = Q.alumno(alumnoId);
      if (!tarea) return mal('No se encontró la tarea.');
      if (!alumno) return mal('No se encontró a esa persona.');

      var nuevo = texto(estado);
      if (ESTADOS_ENTREGA.indexOf(nuevo) < 0) return mal('El estado de la entrega no es válido.');

      var cal = calificacion;
      if (cal === '' || cal === null || cal === undefined) {
        cal = null;
      } else {
        var n = aNumero(cal);
        if (isNaN(n)) return mal('La calificación debe ser un número entre 0 y 10.');
        if (n < 0 || n > 10) return mal('La calificación debe estar entre 0 y 10.');
        cal = Q.red1(n);
      }

      var entrega = Q.entrega(tareaId, alumnoId);
      if (!entrega) {
        entrega = {
          id: Store.uid('ent'), tareaId: tareaId, alumnoId: alumnoId,
          estado: 'pendiente', fecha: null, calificacion: null
        };
        DB.entregas.push(entrega);
      }

      entrega.estado = nuevo;
      entrega.calificacion = cal;
      if (nuevo === 'entregada' || nuevo === 'revisada') {
        if (!entrega.fecha) entrega.fecha = hoyISO();
      } else if (nuevo === 'pendiente') {
        entrega.fecha = null;
      }

      Store.bitacora('Marcó como «' + nuevo + '» la entrega de «' + tarea.titulo +
        '» de ' + alumno.nombre + (cal === null ? '' : ' con ' + cal.toFixed(1)) + '.');
      Store.guardar();
      return bien();
    },

    /* ------------------------------------------------------------- materiales */
    subirMaterial: function (materiaId, datos) {
      var d = datos || {};
      var materia = Q.materia(materiaId);
      if (!materia) return mal('No se encontró la materia.');
      if (vacio(d.titulo)) return mal('Escribe el título del material.');

      var tipo = texto(d.tipo) || 'pdf';
      if (TIPOS_MATERIAL.indexOf(tipo) < 0) return mal('El tipo de material no es válido.');

      var material = {
        id: Store.uid('mtr'),
        materiaId: materiaId,
        titulo: texto(d.titulo),
        tipo: tipo,
        descripcion: texto(d.descripcion),
        subidoEl: hoyISO(),
        tamano: texto(d.tamano) || '—',
        autorId: actorId(materia.profesorId),
        url: d.url || null
      };
      DB.materiales.push(material);
      Store.bitacora('Subió «' + material.titulo + '» a ' + materia.nombre + '.');
      Store.guardar();
      return bien({ id: material.id });
    },

    eliminarMaterial: function (id) {
      var material = DB.materiales.filter(function (m) { return m.id === id; })[0];
      if (!material) return mal('No se encontró el material.');
      var materia = Q.materia(material.materiaId);
      quitar(DB.materiales, function (m) { return m.id === id; });
      Store.bitacora('Eliminó «' + material.titulo + '» de ' +
        (materia ? materia.nombre : 'una materia') + '.');
      Store.guardar();
      return bien();
    },

    /* ----------------------------------------------------------------- avisos */
    publicarAviso: function (datos) {
      var d = datos || {};
      if (vacio(d.titulo)) return mal('Escribe el título del aviso.');
      if (vacio(d.cuerpo)) return mal('Escribe el contenido del aviso.');

      var ambito = texto(d.ambito) || 'escuela';
      if (['escuela', 'materia'].indexOf(ambito) < 0) return mal('El ámbito del aviso no es válido.');

      var materiaId = null;
      if (ambito === 'materia') {
        var materia = Q.materia(texto(d.materiaId));
        if (!materia) return mal('Elige la materia del aviso.');
        materiaId = materia.id;
      }

      var prioridad = texto(d.prioridad) || 'normal';
      if (['normal', 'alta'].indexOf(prioridad) < 0) prioridad = 'normal';

      var s = Sesion.actual();
      var aviso = {
        id: Store.uid('av'),
        autorId: s ? s.id : DB.direccion.id,
        autorRol: s ? s.rol : 'direccion',
        ambito: ambito,
        materiaId: materiaId,
        titulo: texto(d.titulo),
        cuerpo: texto(d.cuerpo),
        fecha: hoyISO(),
        prioridad: prioridad
      };
      DB.avisos.unshift(aviso);
      Store.bitacora('Publicó el aviso «' + aviso.titulo + '».');
      Store.guardar();
      return bien({ id: aviso.id });
    },

    /* ------------------------------------------------------------------ pagos */
    registrarPago: function (pagoId, datos) {
      var d = datos || {};
      var pago = DB.pagos.filter(function (p) { return p.id === pagoId; })[0];
      if (!pago) return mal('No se encontró el pago.');
      if (pago.estado === 'pagado') return mal('Ese pago ya está registrado como pagado.');

      pago.estado = 'pagado';
      pago.pagadoEl = hoyISO();
      pago.metodo = texto(d.metodo) || 'Transferencia SPEI';
      if (!vacio(d.referencia)) pago.referencia = texto(d.referencia);
      pago.recargo = 0;

      var alumno = Q.alumno(pago.alumnoId);
      Store.bitacora('Registró el pago de «' + pago.concepto + '»' +
        (alumno ? ' de ' + alumno.nombre : '') + '.');
      Store.guardar();
      return bien({ id: pago.id });
    },

    generarColegiaturas: function (periodo) {
      var per = texto(periodo);
      var m = /^(\d{4})-(\d{2})([a-z]?)$/.exec(per);
      if (!m) return mal('El periodo debe tener el formato AAAA-MM.');
      var mesIndice = parseInt(m[2], 10) - 1;
      if (mesIndice < 0 || mesIndice > 11) return mal('El mes del periodo no es válido.');

      var concepto = 'Colegiatura de ' + MESES[mesIndice] + ' ' + m[1];
      var vence = m[1] + '-' + m[2] + '-05';
      var base = Number(DB.escuela.colegiaturaMensual) || 0;
      if (base <= 0) return mal('Define primero la colegiatura mensual en los datos de la escuela.');

      var generados = 0;
      Q.alumnosActivos().forEach(function (a) {
        var ya = DB.pagos.filter(function (p) {
          return p.alumnoId === a.id && texto(p.periodo) === per;
        })[0];
        if (ya) return;
        var beca = Number(a.becaPct) || 0;
        DB.pagos.push({
          id: Store.uid('pag'),
          alumnoId: a.id,
          concepto: concepto,
          periodo: per,
          monto: Math.round(base * (1 - beca / 100)),
          vence: vence,
          estado: 'pendiente',
          pagadoEl: null,
          metodo: null,
          referencia: 'ALT-' + per.replace('-', '') + '-' + texto(a.matricula).replace('A-', ''),
          recargo: 0
        });
        generados++;
      });

      if (!generados) return mal('Ese periodo ya está generado para todas las personas activas.');
      Store.bitacora('Generó ' + generados + ' recibos de «' + concepto + '».');
      Store.guardar();
      return bien({ generados: generados, concepto: concepto });
    },

    /* ---------------------------------------------------------------- reseñas */
    crearResena: function (datos) {
      var d = datos || {};
      var profesor = Q.profesor(texto(d.profesorId));
      var alumno = Q.alumno(texto(d.alumnoId));
      if (!profesor) return mal('No se encontró a esa persona docente.');
      if (!alumno) return mal('No se encontró a esa persona inscrita.');
      if (Q.resenaDe(alumno.id, profesor.id)) {
        return mal('Ya escribiste una reseña para ' + profesor.nombre + '.');
      }

      var estrellas = aNumero(d.estrellas);
      if (isNaN(estrellas)) return mal('Elige cuántas estrellas das.');
      estrellas = Math.round(estrellas);
      if (estrellas < 1 || estrellas > 5) return mal('Las estrellas van de 1 a 5.');

      var comentario = texto(d.comentario);
      if (comentario.length < 10) return mal('Escribe un comentario de al menos 10 caracteres.');
      if (comentario.length > 800) return mal('El comentario no debe pasar de 800 caracteres.');

      var materiaId = null;
      if (!vacio(d.materiaId)) {
        var materia = Q.materia(texto(d.materiaId));
        if (!materia) return mal('Elige una materia válida.');
        materiaId = materia.id;
      }

      var entrada = d.criterios || d;
      var criterios = {};
      var errorCriterio = null;
      CRITERIOS.forEach(function (k) {
        var v = aNumero(entrada[k]);
        if (isNaN(v)) v = estrellas;
        v = Math.round(v);
        if (v < 1 || v > 5) errorCriterio = 'Los criterios se califican del 1 al 5.';
        criterios[k] = v;
      });
      if (errorCriterio) return mal(errorCriterio);

      var resena = {
        id: Store.uid('res'),
        profesorId: profesor.id,
        alumnoId: alumno.id,
        materiaId: materiaId,
        estrellas: estrellas,
        criterios: criterios,
        comentario: comentario,
        fecha: hoyISO(),
        estado: 'pendiente',
        anonima: aBool(d.anonima),
        respuesta: null
      };
      DB.resenas.push(resena);
      Store.bitacora('Envió una reseña de ' + profesor.nombre + '; queda pendiente de moderación.');
      Store.guardar();
      return bien({ id: resena.id });
    },

    moderarResena: function (id, estado) {
      var resena = DB.resenas.filter(function (r) { return r.id === id; })[0];
      if (!resena) return mal('No se encontró la reseña.');
      var nuevo = texto(estado);
      if (['publica', 'oculta'].indexOf(nuevo) < 0) return mal('Sólo se puede publicar u ocultar una reseña.');
      if (resena.estado === nuevo) return mal('La reseña ya está en ese estado.');
      resena.estado = nuevo;
      var profesor = Q.profesor(resena.profesorId);
      Store.bitacora((nuevo === 'publica' ? 'Publicó' : 'Ocultó') + ' una reseña de ' +
        (profesor ? profesor.nombre : 'una persona docente') + '.');
      Store.guardar();
      return bien();
    },

    responderResena: function (id, texto_) {
      var resena = DB.resenas.filter(function (r) { return r.id === id; })[0];
      if (!resena) return mal('No se encontró la reseña.');
      var cuerpo = texto(texto_);
      if (cuerpo === '') return mal('Escribe una respuesta antes de enviarla.');
      if (cuerpo.length > 600) return mal('La respuesta no debe pasar de 600 caracteres.');
      resena.respuesta = { texto: cuerpo, fecha: hoyISO() };
      var profesor = Q.profesor(resena.profesorId);
      Store.bitacora('Respondió una reseña de ' +
        (profesor ? profesor.nombre : 'una persona docente') + '.');
      Store.guardar();
      return bien();
    },

    /* ---------------------------------------------------------------- escuela */
    actualizarEscuela: function (datos) {
      var d = datos || {};
      var cadenas = ['nombre', 'lema', 'ciclo', 'direccion', 'ciudad', 'telefono', 'email',
        'sitio', 'horarioAtencion', 'acercaDe', 'mision', 'sello', 'diasHabiles', 'moneda'];
      if (d.nombre !== undefined && vacio(d.nombre)) return mal('El nombre de la escuela no puede quedar vacío.');

      if (d.colegiaturaMensual !== undefined) {
        var cuota = aNumero(d.colegiaturaMensual);
        if (isNaN(cuota) || cuota <= 0) return mal('La colegiatura debe ser un número mayor que 0.');
        DB.escuela.colegiaturaMensual = Math.round(cuota);
      }
      if (d.recargoPct !== undefined) {
        var recargo = aNumero(d.recargoPct);
        if (isNaN(recargo) || recargo < 0 || recargo > 50) return mal('El recargo debe estar entre 0 y 50%.');
        DB.escuela.recargoPct = Math.round(recargo);
      }
      if (d.fundacion !== undefined) {
        var anio = aNumero(d.fundacion);
        if (isNaN(anio) || anio < 1800 || anio > 2100) return mal('El año de fundación no es válido.');
        DB.escuela.fundacion = Math.round(anio);
      }
      cadenas.forEach(function (k) {
        if (d[k] !== undefined) DB.escuela[k] = texto(d[k]);
      });

      Store.bitacora('Actualizó los datos generales del colegio.');
      Store.guardar();
      return bien();
    },

    /* ------------------------------------------------------------- asistencia */
    actualizarAsistencia: function (alumnoId, materiaId, presentes, totales) {
      var alumno = Q.alumno(alumnoId);
      var materia = Q.materia(materiaId);
      if (!alumno) return mal('No se encontró a esa persona.');
      if (!materia) return mal('No se encontró la materia.');

      var p = aNumero(presentes);
      var t = aNumero(totales);
      if (isNaN(p) || isNaN(t)) return mal('Las sesiones deben ser números.');
      p = Math.round(p);
      t = Math.round(t);
      if (p < 0 || t < 0) return mal('Las sesiones no pueden ser negativas.');
      if (p > t) return mal('Las asistencias no pueden ser más que las sesiones impartidas.');

      var fila = DB.asistencias.filter(function (a) {
        return a.alumnoId === alumnoId && a.materiaId === materiaId;
      })[0];
      if (fila) {
        fila.presentes = p;
        fila.totales = t;
      } else {
        DB.asistencias.push({
          id: Store.uid('as'), alumnoId: alumnoId, materiaId: materiaId, presentes: p, totales: t
        });
      }

      Store.bitacora('Ajustó la asistencia de ' + alumno.nombre + ' en ' + materia.nombre +
        ' a ' + p + ' de ' + t + '.');
      Store.guardar();
      return bien({ pct: t > 0 ? Math.round(p / t * 100) : 0 });
    }
  };

  /* Ninguna mutación lanza: un error inesperado se devuelve como {ok:false}. */
  Object.keys(api).forEach(function (nombre) {
    var original = api[nombre];
    api[nombre] = function () {
      try {
        var r = original.apply(api, arguments);
        return (r && typeof r === 'object') ? r : { ok: true };
      } catch (e) {
        return { ok: false, error: 'No se pudo completar la operación. Inténtalo de nuevo.' };
      }
    };
  });

  return api;
})();

/* La base queda lista antes de que se cargue cualquier vista. */
Store.cargar();
