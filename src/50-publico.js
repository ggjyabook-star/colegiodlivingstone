/* ============================================================================
   50-publico.js — Sitio público del Colegio Altamira.
   Declara: const VistaPublica
   Portada (#/publico) y perfil docente público (#/publico/profesor?id=pr-01).
   No usa riel: dibuja su propia barra superior y su propio pie.
   ========================================================================== */

const VistaPublica = (function () {

  /* Ancla que quedó pendiente cuando se pidió un bloque desde otra ruta. */
  var anclaPendiente = '';
  /* Última ruta montada, para decidir si conviene subir el scroll. */
  var ultimaClave = '';

  /* Reinicios mínimos para usar <button> con apariencia de bloque. */
  var RESET_BOTON  = 'border:0;font:inherit;color:inherit;text-align:left;width:100%;cursor:pointer';
  var RESET_MARCA  = 'border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer';
  var RESET_ENLACE = 'border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer;' +
                     'text-align:left;text-decoration:underline;text-underline-offset:2px';
  /* Compensa la barra superior pegajosa al saltar a un ancla. */
  var ANCLA = 'scroll-margin-top:84px';

  /* ---------------------------------------------------------------- helpers */

  function recortar(texto, limite) {
    var t = String(texto == null ? '' : texto);
    if (t.length <= limite) return t;
    return t.slice(0, limite).replace(/\s+\S*$/, '') + '…';
  }

  function porFechaDesc(a, b) {
    return a.fecha < b.fecha ? 1 : (a.fecha > b.fecha ? -1 : 0);
  }

  function activa(m) { return m.estatus === 'activa'; }

  function desplazar(el) {
    var quieto = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (el.scrollIntoView) el.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
    else window.scrollTo(0, 0);
  }

  function avisosEscuela(n) {
    return DB.avisos
      .filter(function (a) { return a.ambito === 'escuela'; })
      .sort(porFechaDesc)
      .slice(0, n);
  }

  function materiasActivas() { return DB.materias.filter(activa); }

  function profesoresPublicos() {
    return DB.profesores.filter(function (p) { return p.perfilPublico && p.estatus !== 'baja'; });
  }

  function alumnosInscritos() {
    return DB.alumnos.filter(function (a) { return a.estatus !== 'baja'; });
  }

  /* Promedio del colegio: promedio de los promedios generales de cada alumno. */
  function promedioColegio() {
    var suma = 0, n = 0;
    alumnosInscritos().forEach(function (a) {
      var p = Q.promedioGeneral(a.id);
      if (typeof p === 'number' && isFinite(p)) { suma += p; n += 1; }
    });
    return n ? Math.round((suma / n) * 10) / 10 : null;
  }

  function anosDeTrayectoria() { return HOY.getFullYear() - DB.escuela.fundacion; }

  function diasDe(m) {
    return (m.horario || []).map(function (h) { return h.dia; }).join(' · ');
  }

  function horarioLegible(m) {
    return (m.horario || []).map(function (h) { return h.dia + ' ' + h.inicio + '–' + h.fin; }).join(' · ');
  }

  /* Rating público con forma garantizada, aunque el profesor no tenga reseñas. */
  function ratingPublico(id) {
    var r = Q.ratingProfesor(id, true) || {};
    var c = r.criterios || {};
    return {
      promedio: typeof r.promedio === 'number' && isFinite(r.promedio) ? r.promedio : 0,
      total: r.total || 0,
      distribucion: r.distribucion || [0, 0, 0, 0, 0],
      criterios: {
        claridad: typeof c.claridad === 'number' ? c.claridad : 0,
        dominio: typeof c.dominio === 'number' ? c.dominio : 0,
        trato: typeof c.trato === 'number' ? c.trato : 0,
        puntualidad: typeof c.puntualidad === 'number' ? c.puntualidad : 0
      }
    };
  }

  /* La inscripción sale del cobro real más alto registrado (sin descuento). */
  function costoInscripcion() {
    var montos = DB.pagos
      .filter(function (p) { return String(p.concepto).indexOf('Inscripción') === 0; })
      .map(function (p) { return p.monto; });
    if (!montos.length) return DB.escuela.colegiaturaMensual * 2;
    return Math.max.apply(null, montos);
  }

  function becas() {
    var con = alumnosInscritos().filter(function (a) { return a.becaPct > 0; });
    var max = 0;
    con.forEach(function (a) { if (a.becaPct > max) max = a.becaPct; });
    return { cuantos: con.length, max: max };
  }

  function plural(n, uno, muchos) { return n + ' ' + (n === 1 ? uno : muchos); }

  function dato(etiqueta, valor) {
    var v = String(valor == null ? '' : valor).trim();
    return '<div class="dato"><span class="e">' + U.esc(etiqueta) + '</span>' +
           '<span class="v">' + U.esc(v || '—') + '</span></div>';
  }

  function lineaContacto(icono, texto) {
    return '<div class="fila gap-1" style="align-items:flex-start">' +
      '<span style="color:var(--tinta-3);display:flex">' + U.icono(icono, 15) + '</span>' +
      '<span style="font-size:.85rem">' + U.esc(texto) + '</span></div>';
  }

  function enlaceAncla(id, texto, clase, estilo) {
    return '<button type="button" class="' + clase + '"' + (estilo ? ' style="' + estilo + '"' : '') +
      ' data-accion="pub:ancla" ' + U.attr({ 'data-args': { id: id } }) + '>' +
      U.esc(texto) + '</button>';
  }

  /* ------------------------------------------------------- barra y pie ---- */

  function navSitio() {
    var e = DB.escuela;
    return `
      <header class="sitio-nav">
        <button type="button" class="marca" style="${RESET_MARCA}" data-accion="pub:ancla"
                ${U.attr({ 'data-args': { id: 'cima' } })} aria-label="Ir al inicio del sitio">
          <span class="sello">${U.esc(e.sello)}</span>
          <span>
            <span class="nombre">${U.esc(e.nombre)}</span>
            <span class="etiqueta" style="display:block">Ciclo ${U.esc(e.ciclo)}</span>
          </span>
        </button>
        <div class="fila gap-1">
          <nav class="enlaces" aria-label="Secciones del sitio">
            ${enlaceAncla('sobre', 'El colegio', 'opcional')}
            ${enlaceAncla('oferta', 'Oferta', 'opcional')}
            ${enlaceAncla('claustro', 'Claustro', '')}
            ${enlaceAncla('admisiones', 'Admisiones', 'opcional')}
          </nav>
          <button type="button" class="btn btn-primario btn-sm" data-accion="pub:acceder">
            ${U.icono('candado', 15)} Acceder al portal
          </button>
        </div>
      </header>`;
  }

  function pieSitio() {
    var e = DB.escuela;
    var docentes = profesoresPublicos();
    return `
      <footer class="sitio-pie">
        <div class="interior">
          <div>
            <div class="fila gap-1 mb-1">
              <span class="sello">${U.esc(e.sello)}</span>
              <span class="destacado" style="font-weight:600;font-size:1.02rem">${U.esc(e.nombre)}</span>
            </div>
            <p>${U.esc(e.lema)}</p>
            <p class="silencio">Ciclo escolar ${U.esc(e.ciclo)}</p>
          </div>
          <div>
            <h4>El sitio</h4>
            <ul>
              <li>${enlaceAncla('sobre', 'Sobre el colegio', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('oferta', 'Oferta del ciclo', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('claustro', 'Claustro docente', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('admisiones', 'Admisiones y contacto', '', RESET_ENLACE)}</li>
            </ul>
          </div>
          <div>
            <h4>Claustro</h4>
            <ul>
              ${docentes.map(function (d) {
                return `<li><button type="button" style="${RESET_ENLACE}" data-accion="pub:profesor"
                  ${U.attr({ 'data-args': { id: d.id } })}>${U.esc(d.nombre)}</button></li>`;
              }).join('')}
              <li><button type="button" style="${RESET_ENLACE}" data-accion="pub:acceder">Acceder al portal</button></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>${U.esc(e.direccion)}</li>
              <li>${U.esc(e.ciudad)}</li>
              <li>${U.esc(e.telefono)}</li>
              <li>${U.esc(e.email)}</li>
              <li>${U.esc(e.sitio)}</li>
            </ul>
          </div>
        </div>
        <p class="legal">
          © ${HOY.getFullYear()} ${U.esc(e.nombre)}. Demostración de producto: el colegio, las personas,
          las calificaciones, los pagos y las reseñas son ficticios y se generaron para mostrar cómo
          funciona el sistema. Ningún dato corresponde a una persona real.
        </p>
      </footer>`;
  }

  /* ------------------------------------------------------------- portada -- */

  function hero() {
    var e = DB.escuela;
    var prom = promedioColegio();
    var avisos = avisosEscuela(2);
    return `
      <section class="hero" id="cima" style="${ANCLA}">
        <div>
          <div class="hero-sello">
            <span class="sello sello-lg">${U.esc(e.sello)}</span>
            <div>
              <span class="cinta">${U.icono('sello', 13)} Ciclo ${U.esc(e.ciclo)}</span>
              <div class="etiqueta mt-1">${U.esc(e.ciudad)}</div>
            </div>
          </div>
          <h1 class="hero-tit">Rigor y oficio,<br><em>desde ${e.fundacion}</em></h1>
          <p class="hero-sub">${U.esc(e.mision)}</p>
          <div class="fila envuelve gap-1 mb-3">
            <button type="button" class="btn btn-primario" data-accion="pub:acceder">
              ${U.icono('flecha-der', 16)} Entrar al portal
            </button>
            <button type="button" class="btn" data-accion="pub:ancla" ${U.attr({ 'data-args': { id: 'claustro' } })}>
              ${U.icono('usuarios', 16)} Conocer al claustro
            </button>
          </div>
          <div class="hero-datos">
            <div>
              <div class="v">${alumnosInscritos().length}</div>
              <div class="e">Alumnos inscritos</div>
            </div>
            <div>
              <div class="v">${materiasActivas().length}</div>
              <div class="e">Materias del ciclo</div>
            </div>
            <div>
              <div class="v">${prom === null ? '—' : prom.toFixed(1)}</div>
              <div class="e">Promedio general</div>
            </div>
            <div>
              <div class="v">${anosDeTrayectoria()}</div>
              <div class="e">Años de trayectoria</div>
            </div>
          </div>
        </div>

        <aside class="hero-tarjeta">
          <div class="entre mb-2">
            <div>
              <h3>Avisos del colegio</h3>
              <p class="silencio" style="font-size:.8rem;margin:0">Publicados por dirección</p>
            </div>
            <span style="color:var(--tinta-3);display:flex">${U.icono('campana', 18)}</span>
          </div>
          <div class="pila">
            ${avisos.length ? avisos.map(function (a) {
              return `
              <article class="tarjeta-plana">
                <div class="entre" style="gap:.5rem">
                  <span class="etiqueta">${U.fecha(a.fecha, 'corta')}</span>
                  ${a.prioridad === 'alta' ? U.badge('Prioridad alta', 'aviso') : ''}
                </div>
                <div style="font-weight:600;font-size:.9rem;margin-top:.15rem">${U.esc(a.titulo)}</div>
                <p class="silencio" style="font-size:.82rem;margin:.2rem 0 0">${U.esc(recortar(a.cuerpo, 118))}</p>
              </article>`;
            }).join('') : '<p class="silencio" style="font-size:.85rem">No hay avisos publicados en este momento.</p>'}
          </div>
          <div class="separador"></div>
          <div class="pila gap-1">
            ${lineaContacto('pin', e.direccion + ', ' + e.ciudad)}
            ${lineaContacto('telefono', e.telefono)}
            ${lineaContacto('correo', e.email)}
            ${lineaContacto('reloj', e.horarioAtencion)}
          </div>
        </aside>
      </section>`;
  }

  function bloqueSobre() {
    var e = DB.escuela;
    var d = DB.direccion;
    return `
      <section class="bloque" id="sobre" style="${ANCLA}">
        <h2 class="bloque-tit">Sobre el colegio</h2>
        <p class="intro">Quiénes somos, cómo trabajamos y quién responde por lo académico.</p>
        <div class="rejilla">
          <div class="col-8">
            <p style="max-width:64ch">${U.esc(e.acercaDe)}</p>
            <div class="fila envuelve gap-1 mt-2">
              ${U.chip('Fundado en ' + e.fundacion)}
              ${U.chip(e.ciudad)}
              ${U.chip('Clases ' + e.diasHabiles)}
              ${U.chip(plural(materiasActivas().length, 'materia activa', 'materias activas'))}
              ${U.chip(plural(profesoresPublicos().length, 'profesor', 'profesores'))}
            </div>
          </div>
          <div class="col-4">
            <blockquote class="cita">
              “${U.esc(e.lema)}”
              <footer>
                <div class="fila gap-1">
                  ${U.avatar(d, 'sm')}
                  <span>
                    <strong>${U.esc(d.nombre)}</strong><br>
                    ${U.esc(d.cargo)} · desde ${U.fecha(d.desde, 'mes')}
                  </span>
                </div>
              </footer>
            </blockquote>
            <p class="silencio mt-2" style="font-size:.85rem">${U.esc(recortar(d.bio, 190))}</p>
          </div>
        </div>
      </section>`;
  }

  function bloqueOferta() {
    var e = DB.escuela;
    var lista = materiasActivas();
    return `
      <section class="bloque" id="oferta" style="${ANCLA}">
        <h2 class="bloque-tit">Oferta del ciclo ${U.esc(e.ciclo)}</h2>
        <p class="intro">
          ${plural(lista.length, 'materia activa', 'materias activas')}, cada una con profesor titular.
          Toca cualquiera para conocer a quien la imparte.
        </p>
        <div class="oferta">
          ${lista.map(function (m) {
            var pr = Q.profesor(m.profesorId);
            var etiquetaBoton = pr ? 'Ver el perfil de ' + pr.nombre : 'Materia ' + m.nombre;
            return `
            <button type="button" class="oferta-item" style="${RESET_BOTON}" data-accion="pub:profesor"
                    ${U.attr({ 'data-args': { id: m.profesorId } })} aria-label="${U.esc(etiquetaBoton)}">
              <span class="cod">${U.esc(m.codigo)}</span>
              <span class="nom">${U.esc(m.nombre)}</span>
              <span class="desc">${U.esc(recortar(m.descripcion, 128))}</span>
              <span class="fila envuelve gap-1" style="margin-top:.2rem">
                ${U.badge(m.creditos + ' créditos', 'neutro')}
                ${U.badge('Aula ' + m.aula, 'neutro')}
                ${diasDe(m) ? U.badge(diasDe(m), 'neutro') : ''}
              </span>
              <span class="pie">
                ${pr ? U.avatar(pr, 'xs') + '<span class="truncar">' + U.esc(pr.nombre) + '</span>'
                     : '<span>Profesor por asignar</span>'}
              </span>
            </button>`;
          }).join('')}
        </div>
      </section>`;
  }

  function tarjetaDocente(p) {
    var r = ratingPublico(p.id);
    var materias = Q.materiasDeProfesor(p.id).filter(activa);
    var areas = (p.areas || []).slice(0, 4);
    return `
      <button type="button" class="claustro-item" data-accion="pub:profesor" ${U.attr({ 'data-args': { id: p.id } })}
              aria-label="Ver el perfil de ${U.esc(p.nombre)}">
        <div class="fila gap-2">
          ${U.avatar(p, 'lg')}
          <div class="crece">
            <div class="nom">${U.esc(p.nombre)}</div>
            <div class="tit">${U.esc(p.titulo)}</div>
            <div class="fila gap-1 mt-1">
              ${r.total
                ? U.estrellas(r.promedio, {}) +
                  '<span class="silencio" style="font-size:.78rem">' +
                  plural(r.total, 'reseña', 'reseñas') + '</span>'
                : '<span class="silencio" style="font-size:.78rem">Sin reseñas públicas todavía</span>'}
            </div>
          </div>
        </div>
        ${areas.length
          ? '<div class="fila envuelve gap-1">' +
            areas.map(function (a) { return U.chip(a); }).join('') + '</div>'
          : ''}
        <div style="font-size:.82rem">
          <span class="etiqueta">Imparte</span>
          <div class="silencio" style="margin-top:.2rem">
            ${materias.length
              ? materias.map(function (m) { return U.esc(m.codigo + ' · ' + m.nombre); }).join('<br>')
              : 'Sin materias activas en este ciclo'}
          </div>
        </div>
      </button>`;
  }

  function bloqueClaustro() {
    var docentes = profesoresPublicos();
    return `
      <section class="bloque" id="claustro" style="${ANCLA}">
        <h2 class="bloque-tit">Claustro docente</h2>
        <p class="intro">
          Cada perfil abre con la formación, la trayectoria, las materias del ciclo y las reseñas
          públicas que dejaron sus alumnos.
        </p>
        ${docentes.length
          ? '<div class="claustro">' + docentes.map(tarjetaDocente).join('') + '</div>'
          : U.vacio({
              icono: 'usuarios',
              titulo: 'Sin perfiles públicos',
              texto: 'Ninguna persona docente ha publicado su perfil en el sitio por ahora.'
            })}
      </section>`;
  }

  function bloqueAdmisiones() {
    var e = DB.escuela;
    var b = becas();
    return `
      <section class="bloque" id="admisiones" style="${ANCLA}">
        <h2 class="bloque-tit">Admisiones y contacto</h2>
        <p class="intro">Costos del ciclo ${U.esc(e.ciclo)} y datos para comunicarse con la administración.</p>
        <div class="rejilla">
          <div class="col-8">
            <div class="panel">
              <div class="panel-cab">
                <div>
                  <h3 class="panel-tit">Costos del ciclo</h3>
                  <p class="panel-sub">Montos en ${U.esc(e.moneda)}</p>
                </div>
                ${U.badge('Ciclo ' + e.ciclo, 'marca')}
              </div>
              <div class="panel-cuerpo sin-relleno">
                <div class="tabla-envoltura">
                  <table class="tabla">
                    <thead>
                      <tr><th>Concepto</th><th class="num">Monto</th><th>Detalle</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Colegiatura mensual</td>
                        <td class="num mono">${U.moneda(e.colegiaturaMensual)}</td>
                        <td class="silencio">Vence el día 5 de cada mes</td>
                      </tr>
                      <tr>
                        <td>Inscripción anual</td>
                        <td class="num mono">${U.moneda(costoInscripcion())}</td>
                        <td class="silencio">Pago único al abrir el ciclo</td>
                      </tr>
                      <tr>
                        <td>Recargo por pago tardío</td>
                        <td class="num mono">${e.recargoPct}%</td>
                        <td class="silencio">Sobre el saldo vencido</td>
                      </tr>
                      <tr>
                        <td>Becas vigentes</td>
                        <td class="num mono">${b.cuantos}</td>
                        <td class="silencio">${b.max ? 'Hasta ' + b.max + '% de descuento en colegiatura'
                                                    : 'Sin becas asignadas en este ciclo'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="panel-pie">
                El pago se recibe por transferencia, tarjeta o ventanilla. El estado de cuenta al día se
                consulta dentro del portal, en la sección de Pagos.
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="panel">
              <div class="panel-cab">
                <div>
                  <h3 class="panel-tit">Contacto</h3>
                  <p class="panel-sub">Administración escolar</p>
                </div>
              </div>
              <div class="panel-cuerpo">
                <div class="datos-rejilla">
                  ${dato('Horario de atención', e.horarioAtencion)}
                  ${dato('Días de clase', e.diasHabiles)}
                  ${dato('Dirección', e.direccion)}
                  ${dato('Ciudad', e.ciudad)}
                  ${dato('Teléfono', e.telefono)}
                  ${dato('Correo', e.email)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="aviso-demo mt-2">
          <span style="display:flex">${U.icono('info', 16)}</span>
          <div>
            <strong>Esto es una demostración.</strong> Colegio Altamira no existe: alumnos, profesores,
            calificaciones, pagos y reseñas se generaron para mostrar el sistema completo. Puedes entrar
            con cualquiera de las cuentas de ejemplo, sin contraseña.
          </div>
        </div>
      </section>`;
  }

  function portada() {
    return `
      <div class="sitio">
        ${navSitio()}
        <div class="sitio-cuerpo">
          ${hero()}
          ${bloqueSobre()}
          ${bloqueOferta()}
          ${bloqueClaustro()}
          ${bloqueAdmisiones()}
        </div>
        ${pieSitio()}
      </div>`;
  }

  /* ------------------------------------------- perfil público del profesor - */

  function cabeceraPerfil(p, r) {
    return `
      <header class="perfil-cab mt-2">
        ${U.avatar(p, 'xl')}
        <div>
          <div class="nom">${U.esc(p.nombre)}</div>
          <div class="tit">${U.esc(p.titulo)}</div>
          <div class="silencio" style="font-size:.82rem;margin-top:.15rem">
            Clave docente ${U.esc(p.clave)} · en el colegio desde ${U.fecha(p.ingreso, 'mes')}
          </div>
          ${(p.areas || []).length
            ? '<div class="fila envuelve gap-1 mt-2">' +
              (p.areas || []).map(function (a) { return U.chip(a); }).join('') + '</div>'
            : ''}
          <div class="fila envuelve gap-3 mt-2">
            <div class="fila gap-1">
              <span class="destacado" style="font-size:2.2rem;font-weight:600;line-height:1">
                ${r.total ? r.promedio.toFixed(1) : '—'}
              </span>
              <div>
                ${U.estrellas(r.total ? r.promedio : 0, { tam: 'lg' })}
                <div class="silencio" style="font-size:.8rem">
                  ${r.total ? plural(r.total, 'reseña pública', 'reseñas públicas') : 'Sin reseñas públicas'}
                </div>
              </div>
            </div>
            ${p.cv ? `<button type="button" class="btn btn-suave" data-accion="pub:cv" ${U.attr({ 'data-args': { id: p.id } })}>
                ${U.icono('descargar', 16)} Descargar CV${p.cv.tamano ? ' · ' + U.esc(p.cv.tamano) : ''}
              </button>` : ''}
          </div>
          <div class="separador"></div>
          <div class="datos-rejilla">
            ${dato('Oficina', p.oficina)}
            ${dato('Asesorías', p.horarioAsesoria)}
            ${dato('Correo', p.email)}
            ${dato('Teléfono', p.telefono)}
          </div>
        </div>
      </header>`;
  }

  function bloqueSemblanza(p) {
    var bio = String(p.bio == null ? '' : p.bio).trim();
    return `
      <section class="bloque">
        <h2 class="bloque-tit">Semblanza</h2>
        ${bio
          ? '<p style="max-width:66ch">' + U.esc(bio) + '</p>'
          : U.vacio({
              icono: 'chat',
              titulo: 'Sin semblanza todavía',
              texto: 'Esta persona docente aún no ha escrito su presentación para el sitio del colegio.'
            })}
      </section>`;
  }

  function bloqueMaterias(materias) {
    var totalInscritos = materias.reduce(function (s, m) { return s + Q.alumnosDeMateria(m.id).length; }, 0);
    return `
      <section class="bloque">
        <h2 class="bloque-tit">Materias que imparte</h2>
        <p class="intro">
          ${plural(materias.length, 'materia activa', 'materias activas')} en el ciclo
          ${U.esc(DB.escuela.ciclo)} · ${plural(totalInscritos, 'inscripción', 'inscripciones')}.
        </p>
        ${materias.length ? `
        <div class="panel">
          <div class="panel-cuerpo sin-relleno">
            <div class="tabla-envoltura">
              <table class="tabla">
                <thead>
                  <tr>
                    <th>Código</th><th>Materia</th><th>Horario</th><th>Aula</th><th class="num">Inscritos</th>
                  </tr>
                </thead>
                <tbody>
                  ${materias.map(function (m) {
                    var n = Q.alumnosDeMateria(m.id).length;
                    return `
                    <tr>
                      <td class="mono">${U.esc(m.codigo)}</td>
                      <td>
                        <strong>${U.esc(m.nombre)}</strong>
                        <div class="silencio" style="font-size:.79rem">${m.creditos} créditos</div>
                      </td>
                      <td class="silencio nowrap">${U.esc(horarioLegible(m) || '—')}</td>
                      <td>${U.esc(m.aula)}</td>
                      <td class="num mono">${n} <span class="silencio">/ ${m.cupo}</span></td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>` : U.vacio({
          icono: 'libro',
          titulo: 'Sin materias en este ciclo',
          texto: 'No tiene materias activas asignadas en el ciclo escolar en curso.'
        })}
      </section>`;
  }

  function bloqueTrayectoria(p) {
    var formacion = p.formacion || [];
    var experiencia = p.experiencia || [];
    return `
      <section class="bloque">
        <div class="rejilla">
          <div class="col-6">
            <h2 class="bloque-tit">Formación académica</h2>
            ${formacion.length ? `
              <ul class="linea-tiempo mt-2">
                ${formacion.map(function (f) {
                  return `<li>
                    <div class="t">${U.esc(f.grado)}</div>
                    <div class="d">${U.esc(f.institucion)} · ${U.esc(f.anio)}</div>
                  </li>`;
                }).join('')}
              </ul>` : U.vacio({
                icono: 'birrete',
                titulo: 'Sin formación registrada',
                texto: 'Todavía no se ha capturado la formación de esta persona docente.'
              })}
          </div>
          <div class="col-6">
            <h2 class="bloque-tit">Trayectoria</h2>
            ${experiencia.length ? `
              <ul class="linea-tiempo mt-2">
                ${experiencia.map(function (x) {
                  return `<li>
                    <div class="t">${U.esc(x.puesto)}</div>
                    <div class="d">${U.esc(x.lugar)} · ${U.esc(x.periodo)}</div>
                    <div class="x">${U.esc(x.detalle)}</div>
                  </li>`;
                }).join('')}
              </ul>` : U.vacio({
                icono: 'portapapeles',
                titulo: 'Sin trayectoria registrada',
                texto: 'Todavía no se ha capturado la experiencia de esta persona docente.'
              })}
          </div>
        </div>
      </section>`;
  }

  function panelResumenRating(r) {
    var barras = '';
    var i, n, pct;
    for (i = 5; i >= 1; i--) {
      n = r.distribucion[i - 1] || 0;
      pct = r.total ? Math.round((n / r.total) * 100) : 0;
      barras += `
        <div class="barra-criterio">
          <span class="silencio">${i === 1 ? '1 estrella' : i + ' estrellas'}</span>
          ${U.progreso(pct)}
          <span class="n">${n}</span>
        </div>`;
    }
    var criterios = [
      { e: 'Claridad', v: r.criterios.claridad },
      { e: 'Dominio', v: r.criterios.dominio },
      { e: 'Trato', v: r.criterios.trato },
      { e: 'Puntualidad', v: r.criterios.puntualidad }
    ].map(function (c) {
      return `
        <div class="barra-criterio">
          <span class="silencio">${c.e}</span>
          ${U.progreso(Math.round((c.v / 5) * 100))}
          <span class="n">${c.v.toFixed(1)}</span>
        </div>`;
    }).join('');

    return `
      <div class="panel">
        <div class="panel-cuerpo">
          <div class="txt-c">
            <div class="destacado" style="font-size:3rem;font-weight:600;line-height:1">
              ${r.total ? r.promedio.toFixed(1) : '—'}
            </div>
            ${U.estrellas(r.total ? r.promedio : 0, { tam: 'lg' })}
            <div class="silencio mt-1" style="font-size:.82rem">
              ${r.total ? 'Promedio de ' + plural(r.total, 'reseña pública', 'reseñas públicas')
                        : 'Todavía sin reseñas públicas'}
            </div>
          </div>
          <div class="separador"></div>
          <div class="etiqueta mb-1">Distribución</div>
          <div class="pila gap-1">${barras}</div>
          <div class="separador"></div>
          <div class="etiqueta mb-1">Criterios evaluados</div>
          <div class="pila gap-1">${criterios}</div>
        </div>
      </div>`;
  }

  function resenaHTML(p, rs) {
    var materia = Q.materia(rs.materiaId);
    var nombreMateria = materia ? materia.nombre : 'una materia';
    var alumno = rs.anonima ? null : Q.alumno(rs.alumnoId);
    var quien = rs.anonima ? 'Alumno de ' + nombreMateria : (alumno ? alumno.nombre : 'Alumno del colegio');
    var retrato = alumno
      ? U.avatar(alumno, 'sm')
      : '<span class="avatar avatar-sm" style="background:var(--superficie-3);color:var(--tinta-2)">' +
        U.icono('usuario', 15) + '</span>';
    var resp = rs.respuesta;
    var textoResp = resp ? (typeof resp === 'string' ? resp : resp.texto) : '';
    var fechaResp = resp && typeof resp === 'object' && resp.fecha ? resp.fecha : '';
    return `
      <article class="resena">
        <div class="entre">
          <div class="fila gap-1">
            ${retrato}
            <div>
              <div style="font-weight:600;font-size:.9rem">${U.esc(quien)}</div>
              <div class="meta">${U.esc(nombreMateria)} · ${U.fecha(rs.fecha, 'corta')}</div>
            </div>
          </div>
          ${U.estrellas(rs.estrellas, {})}
        </div>
        <p class="cuerpo">${U.esc(rs.comentario)}</p>
        ${textoResp ? `
          <div class="respuesta">
            <span class="quien">
              Respuesta de ${U.esc(p.nombre)}${fechaResp ? ' · ' + U.fecha(fechaResp, 'corta') : ''}
            </span>
            ${U.esc(textoResp)}
          </div>` : ''}
      </article>`;
  }

  function panelResenas(p, resenas) {
    if (!resenas.length) {
      return `
        <div class="panel">
          <div class="panel-cuerpo">
            ${U.vacio({
              icono: 'estrella',
              titulo: 'Todavía no hay reseñas públicas',
              texto: 'Quienes cursan sus materias pueden dejar una reseña desde su portal. Aparecerá aquí ' +
                     'en cuanto la persona docente la publique.'
            })}
          </div>
        </div>`;
    }
    return `
      <div class="panel">
        <div class="panel-cab">
          <div>
            <h3 class="panel-tit">Reseñas públicas</h3>
            <p class="panel-sub">${plural(resenas.length, 'reseña', 'reseñas')} · las más recientes primero</p>
          </div>
        </div>
        <div class="panel-cuerpo">
          ${resenas.map(function (rs) { return resenaHTML(p, rs); }).join('')}
        </div>
      </div>`;
  }

  function bloqueValoracion(p, r, resenas) {
    return `
      <section class="bloque">
        <h2 class="bloque-tit">Valoración de los alumnos</h2>
        <p class="intro">
          Sólo aparecen las reseñas publicadas. Las que están en revisión u ocultas se quedan dentro del
          portal y nunca se muestran en el sitio.
        </p>
        <div class="rejilla">
          <div class="col-4">${panelResumenRating(r)}</div>
          <div class="col-8">${panelResenas(p, resenas)}</div>
        </div>
      </section>`;
  }

  function sinPerfil(p) {
    return `
      <div class="sitio">
        ${navSitio()}
        <div class="sitio-cuerpo">
          <div class="panel mt-3">
            <div class="panel-cuerpo">
              ${U.vacio({
                icono: 'usuario',
                titulo: p ? 'Este perfil no es público' : 'No encontramos ese perfil',
                texto: p
                  ? p.nombre + ' no ha publicado su perfil docente en el sitio del colegio.'
                  : 'La liga apunta a una persona docente que no está en el directorio del colegio.'
              })}
              <div class="centro">
                <button type="button" class="btn btn-primario" data-accion="pub:ancla"
                        ${U.attr({ 'data-args': { id: 'claustro' } })}>
                  ${U.icono('flecha-izq', 16)} Volver al claustro
                </button>
              </div>
            </div>
          </div>
        </div>
        ${pieSitio()}
      </div>`;
  }

  function perfil(ctx) {
    var id = ctx.params && ctx.params.id ? ctx.params.id : '';
    var p = id ? Q.profesor(id) : null;
    if (!p || !p.perfilPublico) return sinPerfil(p);

    var r = ratingPublico(p.id);
    var materias = Q.materiasDeProfesor(p.id).filter(activa);
    var resenas = Q.resenasDeProfesor(p.id, 'publica').slice().sort(porFechaDesc);

    return `
      <div class="sitio">
        ${navSitio()}
        <div class="sitio-cuerpo">
          <div class="mt-3">
            ${U.migas([
              { texto: 'Inicio', ruta: '#/publico' },
              { texto: 'Claustro docente', ruta: '#/publico' },
              { texto: p.nombre }
            ])}
          </div>
          ${cabeceraPerfil(p, r)}
          ${bloqueSemblanza(p)}
          ${bloqueMaterias(materias)}
          ${bloqueTrayectoria(p)}
          ${bloqueValoracion(p, r, resenas)}
          <section class="bloque">
            <div class="fila envuelve gap-1">
              <button type="button" class="btn" data-accion="pub:ancla" ${U.attr({ 'data-args': { id: 'claustro' } })}>
                ${U.icono('flecha-izq', 16)} Volver al claustro
              </button>
              <button type="button" class="btn btn-primario" data-accion="pub:acceder">
                ${U.icono('candado', 16)} Acceder al portal
              </button>
            </div>
          </section>
        </div>
        ${pieSitio()}
      </div>`;
  }

  /* --------------------------------------------------------------- objeto -- */

  return {
    titulo: 'Colegio Altamira',

    render: function (ctx) {
      var c = ctx || {};
      if (c.seccion === 'profesor') return perfil(c);
      return portada();
    },

    acciones: {
      /* Abre el perfil público de una persona docente. */
      'pub:profesor': function (args) {
        var id = args && args.id ? args.id : '';
        if (!id) { U.toast('Esa materia todavía no tiene profesor asignado.', 'aviso'); return; }
        App.ir('#/publico/profesor?id=' + encodeURIComponent(id));
      },

      /* Salta con scroll suave a un bloque de la portada; si no estamos ahí, vuelve primero. */
      'pub:ancla': function (args) {
        var id = args && args.id ? args.id : 'cima';
        var destino = document.getElementById(id);
        if (destino) { desplazar(destino); return; }
        anclaPendiente = id;
        App.ir('#/publico');
      },

      /* El CV es parte de la demostración: no hay archivo que bajar. */
      'pub:cv': function (args) {
        var p = args && args.id ? Q.profesor(args.id) : null;
        var nombre = p && p.cv && p.cv.nombre ? p.cv.nombre : 'el currículum';
        U.toast('Demostración: ' + nombre + ' no se descarga en este entorno.', 'aviso');
      },

      /* Pasa a la pantalla de acceso con las cuentas de ejemplo. */
      'pub:acceder': function () {
        App.ir('#/acceso');
      }
    },

    montado: function (ctx) {
      var c = ctx || {};
      var clave = (c.seccion || '') + ':' + ((c.params && c.params.id) || '');
      var cambioDeRuta = clave !== ultimaClave;
      ultimaClave = clave;

      if (anclaPendiente) {
        var destino = document.getElementById(anclaPendiente);
        anclaPendiente = '';
        if (destino) { desplazar(destino); return; }
      }
      if (cambioDeRuta) window.scrollTo(0, 0);
    }
  };
})();
