/* ============================================================================
   50-publico.js — Sitio público de The Livingstone.
   Declara: const VistaPublica
   Portada (#/publico) y perfil docente público (#/publico/profesor?id=pr-01).
   No usa riel: dibuja su propia barra superior y su propio pie.
   ========================================================================== */

const VistaPublica = (function () {

  /* Ancla que quedó pendiente cuando se pidió un bloque desde otra ruta. */
  var anclaPendiente = '';
  /* Última ruta montada, para decidir si conviene subir el scroll. */
  var ultimaClave = '';
  /* En pantalla angosta el claustro abre con tres perfiles; el resto se pide. */
  var CLAUSTRO_VISIBLE = 3;
  var claustroAbierto = false;

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

  function anosDeTrayectoria() { return HOY.getFullYear() - DB.escuela.fundacion; }

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

  /* Una foto del colegio, si está declarada para esa clave. Si no, nada:
     el bloque se dibuja igual sin ella. */
  function foto(clave, clase, alto) {
    var f = (typeof FOTOS === 'object' && FOTOS) ? FOTOS[clave] : null;
    if (!f || !f.archivo) return '';
    return '<img class="' + clase + '" src="' + U.esc(f.archivo) + '" alt="' + U.esc(f.alt || '') + '"' +
      (alto ? ' style="height:' + alto + '"' : '') + ' loading="lazy" decoding="async">';
  }

  /* Las notas para padres: contenido editorial del sitio, de la más nueva a la
     más vieja. Si el archivo de notas no está, el sitio se dibuja sin ellas. */
  function notas() {
    if (typeof NOTAS !== 'object' || !NOTAS || !NOTAS.length) return [];
    return NOTAS.slice().sort(porFechaDesc);
  }

  function nota(id) {
    var todas = notas();
    for (var i = 0; i < todas.length; i++) if (todas[i].id === id) return todas[i];
    return null;
  }

  /* Quien firma la nota: alguien del claustro o la dirección. */
  function autorDe(n) {
    var id = n && n.autorId ? n.autorId : '';
    if (!id) return null;
    if (id === 'dir-01' || (DB.direccion && DB.direccion.id === id)) return DB.direccion;
    return Q.profesor(id) || null;
  }

  /* El único formato que aceptan los textos de una nota: **negritas**.
     Se escapa primero y se marca después, para que nadie inyecte etiquetas. */
  function enfasis(texto) {
    return U.esc(String(texto == null ? '' : texto))
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function enlaceRuta(ruta, texto, clase, estilo) {
    return '<button type="button" class="' + clase + '"' + (estilo ? ' style="' + estilo + '"' : '') +
      ' data-accion="app:ir" ' + U.attr({ 'data-args': { ruta: ruta } }) + '>' +
      U.esc(texto) + '</button>';
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
            <span class="etiqueta lema">${U.esc(e.lema)}</span>
          </span>
        </button>
        <div class="fila gap-1">
          <nav class="enlaces" aria-label="Secciones del sitio">
            ${enlaceAncla('colegio', 'Conócenos', 'opcional')}
            ${enlaceAncla('oferta', 'Oferta educativa', 'opcional')}
            ${enlaceAncla('claustro', 'Claustro', '')}
            ${enlaceRuta('#/publico/notas', 'Notas para padres', '')}
            ${enlaceAncla('alianzas', 'Alianzas', 'opcional')}
            ${enlaceAncla('after', 'After Class', 'opcional')}
            ${enlaceAncla('admisiones', 'Informes', 'opcional')}
          </nav>
          <button type="button" class="btn btn-fantasma btn-sm btn-icono" data-accion="app:tema"
                  aria-label="${U.esc(App.tituloTema())}" title="${U.esc(App.tituloTema())}">
            ${U.icono(App.iconoTema(), 16)}
          </button>
          <button type="button" class="btn btn-primario btn-sm" data-accion="pub:acceder">
            ${U.icono('candado', 15)} Acceder al portal
          </button>
        </div>
      </header>`;
  }

  function pieSitio() {
    var e = DB.escuela;
    return `
      <footer class="sitio-pie">
        <div class="interior">
          <div>
            <div class="fila gap-1 mb-1">
              <span class="sello">${U.esc(e.sello)}</span>
              <span class="destacado" style="font-weight:700;font-size:1.1rem">${U.esc(e.nombre)}</span>
            </div>
            <p>${U.esc(e.lema)}</p>
            <p class="silencio">Ciclo escolar ${U.esc(e.ciclo)} · desde ${e.fundacion}</p>
          </div>
          <div>
            <h4>El colegio</h4>
            <ul>
              <li>${enlaceAncla('colegio', 'Conócenos', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('oferta', 'Oferta educativa', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('claustro', 'Claustro docente', '', RESET_ENLACE)}</li>
              <li>${enlaceRuta('#/publico/notas', 'Notas para padres', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('alianzas', 'Nuestras alianzas', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('after', 'After Class', '', RESET_ENLACE)}</li>
              <li>${enlaceAncla('admisiones', 'Informes y admisiones', '', RESET_ENLACE)}</li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>${U.esc(e.direccion)}</li>
              <li>${U.esc(e.ciudad)}</li>
              <li>${U.esc(e.telefono)} · ${U.esc(e.telefono2)}</li>
              <li>WhatsApp ${U.esc(e.whatsapp)}</li>
              <li>${U.esc(e.email)}</li>
              <li>${U.esc(e.sitio)}</li>
            </ul>
          </div>
          <div>
            <h4>Te escuchamos</h4>
            <ul>
              <li>Buzón directo: ${U.esc(e.buzon)}</li>
              <li>${U.esc(e.horarioAtencion)}</li>
              ${(e.redes || []).map(function (r) {
                return '<li>' + U.esc(r.nombre) + ' · ' + U.esc(r.usuario) + '</li>';
              }).join('')}
            </ul>
          </div>
        </div>
        <p class="legal">
          © ${HOY.getFullYear()} ${U.esc(e.nombre)}. Demostración de producto: el portal, las personas,
          las calificaciones, los pagos y las reseñas son ficticios y se generaron para mostrar cómo
          funciona el sistema escolar. Los datos institucionales del colegio son públicos; ningún alumno,
          docente o importe corresponde a una persona real.
        </p>
      </footer>`;
  }

  /* ------------------------------------------------------------- portada -- */

  function hero() {
    var e = DB.escuela;
    var avisos = avisosEscuela(2);
    return `
      <section class="hero" id="cima" style="${ANCLA}">
        <div>
          <div class="hero-sello">
            <span class="sello sello-lg">${U.esc(e.sello)}</span>
            <div>
              <span class="cinta">${U.icono('sello', 13)} ${anosDeTrayectoria()} años · ciclo ${U.esc(e.ciclo)}</span>
              <div class="etiqueta mt-1">${U.esc(e.ciudad)}</div>
            </div>
          </div>
          <h1 class="hero-tit">Esfuérzate<br><em>y sé valiente</em></h1>
          <p class="hero-sub">${U.esc(e.mision)}</p>
          <div class="fila envuelve gap-1 mb-3">
            <button type="button" class="btn btn-primario" data-accion="pub:acceder">
              ${U.icono('flecha-der', 16)} Entrar al portal
            </button>
            <button type="button" class="btn" data-accion="pub:ancla" ${U.attr({ 'data-args': { id: 'oferta' } })}>
              ${U.icono('birrete', 16)} Ver la oferta educativa
            </button>
          </div>
          <div class="hero-datos">
            <div>
              <div class="v">${alumnosInscritos().length}</div>
              <div class="e">Alumnos en el portal</div>
            </div>
            <div>
              <div class="v">${Q.grados().length}</div>
              <div class="e">Grados, de kínder a bachillerato</div>
            </div>
            <div>
              <div class="v">${materiasActivas().length}</div>
              <div class="e">Materias del ciclo</div>
            </div>
            <div>
              <div class="v">${profesoresPublicos().length}</div>
              <div class="e">Docentes con perfil público</div>
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
            ${lineaContacto('telefono', e.telefono + ' · ' + e.telefono2)}
            ${lineaContacto('chat', 'WhatsApp ' + e.whatsapp)}
            ${lineaContacto('correo', e.email)}
            ${lineaContacto('reloj', e.horarioAtencion)}
          </div>
        </aside>
      </section>`;
  }

  /* La franja de vida escolar: lo primero que se ve del colegio de verdad. */
  function bandaVida() {
    var f = (typeof FOTOS === 'object' && FOTOS) ? FOTOS.vida : null;
    if (!f || !f.archivo) return '';
    return '<figure class="foto-banda">' + foto('vida', 'foto-banda-img') +
      (f.pie ? '<figcaption class="pie">' + U.esc(f.pie) + '</figcaption>' : '') + '</figure>';
  }

  function bloqueColegio() {
    var e = DB.escuela;
    var d = DB.direccion;
    return `
      <section class="bloque" id="colegio" style="${ANCLA}">
        <h2 class="bloque-tit">Nuestro colegio</h2>
        <p class="intro">Quiénes somos, de dónde venimos y quién responde por lo académico.</p>
        <div class="rejilla">
          <div class="col-8">
            <p style="max-width:66ch">${U.esc(e.acercaDe)}</p>
            <p class="silencio" style="max-width:66ch">${U.esc(e.excelencia)}</p>
            <div class="rejilla mt-2">
              <div class="col-6">
                <div class="tarjeta-plana">
                  <span class="etiqueta">Misión</span>
                  <p style="font-size:.88rem;margin:.3rem 0 0">${U.esc(e.mision)}</p>
                </div>
              </div>
              <div class="col-6">
                <div class="tarjeta-plana">
                  <span class="etiqueta">Visión</span>
                  <p style="font-size:.88rem;margin:.3rem 0 0">${U.esc(e.vision)}</p>
                </div>
              </div>
            </div>
            <div class="mt-2">
              <span class="etiqueta">Nuestros valores</span>
              <div class="tira-valores mt-1">
                ${(e.valores || []).map(function (v) { return U.chip(v); }).join('')}
              </div>
            </div>
          </div>
          <div class="col-4">
            <blockquote class="cita">
              “${U.esc(e.cita.texto)}”
              <footer>${U.esc(e.cita.autor)}</footer>
            </blockquote>
            <div class="separador"></div>
            <div class="fila gap-1">
              ${U.avatar(d, 'md')}
              <span style="font-size:.85rem">
                <strong>${U.esc(d.nombre)}</strong><br>
                <span class="silencio">${U.esc(d.cargo)} · desde ${U.fecha(d.desde, 'mes')}</span>
              </span>
            </div>
            <p class="silencio mt-2" style="font-size:.85rem">${U.esc(recortar(d.bio, 210))}</p>
          </div>
        </div>
        <div class="hero-datos mt-3">
          ${(e.indicadores || []).map(function (i) {
            return '<div><div class="v">' + U.esc(i.valor) + '</div>' +
              '<div class="e">' + U.esc(i.etiqueta) + '</div></div>';
          }).join('')}
        </div>
      </section>`;
  }

  function bloquePropuesta() {
    var e = DB.escuela;
    return `
      <section class="bloque" id="propuesta" style="${ANCLA}">
        <h2 class="bloque-tit">Nuestra propuesta</h2>
        <p class="intro">
          Un plan de estudios amplio y equilibrado, con actividades gratificantes y estimulantes que
          preparan a nuestros estudiantes para la mejor vida social y cultural.
        </p>
        <div class="pilares">
          ${(e.pilares || []).map(function (p) {
            return `
            <article class="pilar">
              <div class="cab">
                <span class="ico">${U.icono(p.icono, 18)}</span>
                <div class="t">${U.esc(p.titulo)}</div>
              </div>
              <p>${U.esc(p.texto)}</p>
            </article>`;
          }).join('')}
        </div>
      </section>`;
  }

  /* Tarjeta de nivel: lo que el sitio cuenta de él, más lo que el sistema sabe. */
  function tarjetaNivel(fila) {
    var n = fila.nivel;
    return `
      <article class="nivel-item" style="border-top-color:${U.esc(n.color)}">
        ${foto(n.id, 'nivel-foto')}
        <div class="nivel-cuerpo">
          <div>
            <div class="edades">${U.esc(n.edades)}</div>
            <div class="nom">${U.esc(n.nombre)}</div>
          </div>
        <p class="desc">${U.esc(recortar(n.descripcion, 250))}</p>
        <div class="fila envuelve gap-1">
          ${U.badge(plural(fila.grados, 'grado', 'grados'), 'neutro')}
          ${U.badge(plural(fila.materias, 'materia', 'materias'), 'neutro')}
          ${U.badge(U.moneda(n.colegiatura) + ' al mes', 'marca')}
        </div>
          <div class="pie">
            <span class="etiqueta">Certificación</span>
            <div class="silencio" style="margin-top:.15rem">${U.esc(n.certificacion)}</div>
          </div>
        </div>
      </article>`;
  }

  function bloqueOferta() {
    var e = DB.escuela;
    var filas = Q.resumenNiveles();
    var grados = Q.grados();
    return `
      <section class="bloque" id="oferta" style="${ANCLA}">
        <h2 class="bloque-tit">Oferta educativa</h2>
        <p class="intro">
          De preescolar a bachillerato, un modelo bicultural que integra las artes, la tecnología de punta
          y altos estándares académicos. Ciclo ${U.esc(e.ciclo)}.
        </p>
        <div class="niveles">
          ${filas.map(tarjetaNivel).join('')}
        </div>

        <h3 class="mt-3 mb-1 destacado" style="font-size:1.2rem">Grados y plan de estudios</h3>
        <p class="silencio mb-2" style="font-size:.86rem">
          Cada grado tiene un profesor titular que responde por el grupo y un plan de materias propio.
        </p>
        <div class="panel">
          <div class="panel-cuerpo sin-relleno">
            <div class="tabla-envoltura">
              <table class="tabla tabla-grados">
                <thead>
                  <tr>
                    <th>Grado</th><th>Titular</th><th>Materias del plan</th>
                    <th class="num">Aula</th>
                  </tr>
                </thead>
                <tbody>
                  ${grados.map(function (g) {
                    var tutor = Q.profesor(g.tutorId);
                    var mats = Q.materiasDeGrado(g.id);
                    return `
                    <tr>
                      <td>
                        <strong>${U.esc(g.etiqueta)}</strong>
                        <div class="silencio" style="font-size:.78rem">Grupo ${U.esc(g.grupo)}</div>
                      </td>
                      <td>${tutor
                        ? '<button type="button" style="' + RESET_ENLACE + '" data-accion="pub:profesor" ' +
                          U.attr({ 'data-args': { id: tutor.id } }) + '>' + U.esc(tutor.nombre) + '</button>'
                        : '<span class="silencio">Por asignar</span>'}</td>
                      <td class="silencio" style="font-size:.82rem">
                        <span class="solo-ancho">${mats.map(function (m) { return U.esc(m.nombre); }).join(' · ')}</span>
                        <span class="solo-angosto">${plural(mats.length, 'materia', 'materias')}</span>
                      </td>
                      <td class="num mono">${U.esc(g.aula)}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
          <div class="panel-pie">
            ${plural(grados.length, 'grado', 'grados')} en operación ·
            ${plural(materiasActivas().length, 'materia activa', 'materias activas')} ·
            ${plural(alumnosInscritos().length, 'alumno inscrito', 'alumnos inscritos')} en el portal.
          </div>
        </div>
      </section>`;
  }

  function tarjetaDocente(p) {
    var r = ratingPublico(p.id);
    var grados = Q.gradosDeProfesor(p.id);
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
          <span class="etiqueta">Imparte en</span>
          <div class="silencio" style="margin-top:.2rem">
            ${grados.length
              ? grados.map(function (g) { return U.esc(g.corto); }).join(' · ')
              : 'Sin grupos asignados en este ciclo'}
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
          Cada perfil abre con la formación, la trayectoria, los grupos del ciclo y las reseñas públicas
          que dejaron sus alumnos.
        </p>
        ${docentes.length
          ? '<div class="claustro' + (claustroAbierto ? ' abierto' : '') + '">' +
            docentes.map(tarjetaDocente).join('') + '</div>' +
            /* En teléfono sólo se ven los tres primeros; el resto se pide. */
            (docentes.length > CLAUSTRO_VISIBLE
              ? '<div class="mas-claustro">' +
                '<button type="button" class="btn btn-bloque" data-accion="pub:masClaustro">' +
                U.icono('usuarios', 16) + ' Ver ' +
                plural(docentes.length - CLAUSTRO_VISIBLE, 'docente más', 'docentes más') +
                '</button></div>'
              : '')
          : U.vacio({
              icono: 'usuarios',
              titulo: 'Sin perfiles públicos',
              texto: 'Ninguna persona docente ha publicado su perfil en el sitio por ahora.'
            })}
      </section>`;
  }

  function bloqueAlianzas() {
    var e = DB.escuela;
    return `
      <section class="bloque" id="alianzas" style="${ANCLA}">
        <h2 class="bloque-tit">Nuestras alianzas</h2>
        <p class="intro">
          Alianzas estratégicas que enriquecen el proceso de aprendizaje de alumnos y docentes, con
          tecnología de punta y universidades de prestigio internacional.
        </p>
        <div class="alianzas">
          ${(e.alianzas || []).map(function (a) {
            return `
            <article class="alianza">
              <span class="sigla">${U.esc(a.sigla)}</span>
              <div>
                <div class="nom">${U.esc(a.nombre)}</div>
                <p>${U.esc(a.texto)}</p>
              </div>
            </article>`;
          }).join('')}
        </div>

        <h3 class="mt-3 mb-1 destacado" style="font-size:1.2rem">True International Experience</h3>
        <p class="silencio mb-2" style="font-size:.88rem;max-width:66ch">
          Por más de trece años el colegio ha buscado dar experiencias internacionales a sus alumnos.
        </p>
        <div class="rejilla">
          ${(e.internacional || []).map(function (v, i) {
            return `
            <div class="col-6">
              <div class="tarjeta">
                ${foto(i === 0 ? 'uk1' : 'uk2', 'viaje-foto')}
                <div class="fila gap-1 mb-1">
                  <span style="color:var(--acento);display:flex">${U.icono('pin', 17)}</span>
                  <strong>${U.esc(v.lugar)}</strong>
                </div>
                <p class="silencio" style="font-size:.86rem;margin:0">${U.esc(v.detalle)}</p>
              </div>
            </div>`;
          }).join('')}
        </div>
      </section>`;
  }

  function bloqueAfter() {
    var e = DB.escuela;
    return `
      <section class="bloque" id="after" style="${ANCLA}">
        <h2 class="bloque-tit">After Class</h2>
        <p class="intro">${U.esc(e.afterclassTexto)}</p>
        <div class="after">
          ${(e.afterclass || []).map(function (g) {
            return `
            <article class="after-grupo">
              ${foto(g.grupo, 'after-foto')}
              <div class="after-cuerpo">
                <div class="t">${U.icono(g.icono, 18)} ${U.esc(g.grupo)}</div>
                <div class="fila envuelve gap-1">
                  ${(g.actividades || []).map(function (a) { return U.chip(a); }).join('')}
                </div>
              </div>
            </article>`;
          }).join('')}
        </div>
      </section>`;
  }

  /* --------------------------------------------------- notas para padres -- */

  /* Tarjeta de nota. La primera de una rejilla va ancha, con foto grande. */
  function tarjetaNota(n, destacada) {
    var a = autorDe(n);
    return `
      <button type="button" class="nota-item${destacada ? ' destacada' : ''}" data-accion="pub:nota"
              ${U.attr({ 'data-args': { id: n.id } })}
              aria-label="Leer la nota ${U.esc(n.titulo)}">
        ${foto(n.foto, 'nota-foto')}
        <div class="nota-cuerpo">
          <div class="nota-tema">${U.icono(n.icono, 13)} ${U.esc(n.tema)}</div>
          <h3 class="nota-tit">${U.esc(n.titulo)}</h3>
          <p class="nota-gancho">${U.esc(recortar(n.gancho, destacada ? 200 : 128))}</p>
          <div class="nota-meta">
            ${a ? U.avatar(a, 'sm') : ''}
            <span>${a ? U.esc(a.nombre) : U.esc(DB.escuela.nombre)}</span>
            <span class="punto" aria-hidden="true">·</span>
            <span>${U.fecha(n.fecha, 'corta')}</span>
            <span class="punto" aria-hidden="true">·</span>
            <span>${n.lectura} min de lectura</span>
          </div>
        </div>
      </button>`;
  }

  /* En la portada van las tres más recientes; el resto vive en el índice. */
  function bloqueNotas() {
    var todas = notas();
    if (!todas.length) return '';
    var visibles = todas.slice(0, 3);
    return `
      <section class="bloque" id="notas" style="${ANCLA}">
        <h2 class="bloque-tit">Notas para padres</h2>
        <p class="intro">
          Lo que hemos ido aprendiendo de estar cuarenta y tantos años frente a grupo, puesto por
          escrito: orientación sobre el aprendizaje de los hijos, sobre cómo funciona la escuela
          en México y sobre las decisiones que toca tomar en casa.
        </p>
        <div class="notas">
          ${visibles.map(function (n, i) { return tarjetaNota(n, i === 0); }).join('')}
        </div>
        ${todas.length > visibles.length ? `
          <div class="centro mt-2">
            <button type="button" class="btn" data-accion="app:ir"
                    ${U.attr({ 'data-args': { ruta: '#/publico/notas' } })}>
              ${U.icono('libro', 16)} Ver las ${todas.length} notas
            </button>
          </div>` : ''}
      </section>`;
  }

  /* --------------------------------------------------- índice de las notas - */

  function paginaNotas() {
    var todas = notas();
    return `
      <div class="sitio">
        ${navSitio()}
        <div class="sitio-cuerpo">
          <div class="mt-3">
            ${U.migas([{ texto: 'Inicio', ruta: '#/publico' }, { texto: 'Notas para padres' }])}
          </div>
          <section class="bloque" style="padding-top:1.4rem">
            <h1 class="bloque-tit" style="font-size:2.1rem">Notas para padres</h1>
            <p class="intro" style="max-width:62ch">
              Textos breves sobre aprendizaje, crianza y decisiones escolares, firmados por el
              claustro del colegio. No son recomendaciones sueltas: cada nota dice de dónde sale
              lo que afirma, para que usted pueda ir a la fuente si quiere.
            </p>
            ${todas.length
              ? '<div class="notas">' +
                todas.map(function (n, i) { return tarjetaNota(n, i === 0); }).join('') +
                '</div>'
              : U.vacio({
                  icono: 'libro',
                  titulo: 'Todavía no hay notas publicadas',
                  texto: 'El colegio publicará aquí sus textos de orientación para las familias.'
                })}
          </section>
          <section class="bloque" style="padding-top:0">
            <div class="fila envuelve gap-1">
              <button type="button" class="btn" data-accion="app:ir"
                      ${U.attr({ 'data-args': { ruta: '#/publico' } })}>
                ${U.icono('flecha-izq', 16)} Volver al inicio
              </button>
              <button type="button" class="btn btn-primario" data-accion="pub:ancla"
                      ${U.attr({ 'data-args': { id: 'admisiones' } })}>
                ${U.icono('chat', 16)} Hablar con admisiones
              </button>
            </div>
          </section>
        </div>
        ${pieSitio()}
      </div>`;
  }

  /* ------------------------------------------------------ una nota entera - */

  /* Dibuja un bloque del cuerpo. Lo que no reconoce, lo ignora en silencio. */
  function bloqueDeNota(b) {
    if (!b || !b.t) return '';
    if (b.t === 'p') return '<p>' + enfasis(b.x) + '</p>';
    if (b.t === 'h') return '<h2>' + enfasis(b.x) + '</h2>';
    if (b.t === 'lista') {
      return '<ul class="nota-lista">' + (b.x || []).map(function (i) {
        return '<li>' + enfasis(i) + '</li>';
      }).join('') + '</ul>';
    }
    if (b.t === 'pasos') {
      return '<ol class="nota-pasos">' + (b.x || []).map(function (i) {
        return '<li><span class="t">' + enfasis(i.t) + '</span>' +
               '<span class="d">' + enfasis(i.x) + '</span></li>';
      }).join('') + '</ol>';
    }
    if (b.t === 'dato') {
      return '<aside class="nota-dato">' +
        '<span class="ico">' + U.icono('info', 16) + '</span>' +
        '<div>' + enfasis(b.x) + '</div></aside>';
    }
    if (b.t === 'cita') {
      return '<blockquote class="cita nota-cita">&#8220;' + enfasis(b.x) + '&#8221;' +
        (b.de ? '<footer>' + U.esc(b.de) + '</footer>' : '') + '</blockquote>';
    }
    if (b.t === 'tabla') {
      return '<div class="tabla-envoltura nota-tabla"><table class="tabla"><thead><tr>' +
        (b.cab || []).map(function (c) { return '<th>' + U.esc(c) + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        (b.filas || []).map(function (f) {
          return '<tr>' + f.map(function (c, i) {
            return '<td' + (i ? ' class="num mono"' : '') + '>' + enfasis(c) + '</td>';
          }).join('') + '</tr>';
        }).join('') +
        '</tbody></table></div>';
    }
    return '';
  }

  function firmaDeNota(n) {
    var a = autorDe(n);
    if (!a) return '';
    var esDocente = a.rol === 'profesor';
    return `
      <div class="nota-firma">
        ${U.avatar(a, 'lg')}
        <div class="crece">
          <div class="etiqueta">Escrito por</div>
          <div class="nom">${U.esc(a.nombre)}</div>
          <div class="silencio" style="font-size:.85rem">${U.esc(a.titulo || a.cargo || '')}</div>
        </div>
        ${esDocente ? `
          <button type="button" class="btn btn-suave btn-sm" data-accion="pub:profesor"
                  ${U.attr({ 'data-args': { id: a.id } })}>
            ${U.icono('usuario', 15)} Ver su perfil
          </button>` : ''}
      </div>`;
  }

  function otrasNotas(n) {
    var otras = notas().filter(function (o) { return o.id !== n.id; }).slice(0, 2);
    if (!otras.length) return '';
    return `
      <section class="bloque" style="padding-top:.5rem">
        <h2 class="bloque-tit" style="font-size:1.35rem">Siga leyendo</h2>
        <div class="notas notas-pie">
          ${otras.map(function (o) { return tarjetaNota(o, false); }).join('')}
        </div>
      </section>`;
  }

  function notaNoEncontrada() {
    return `
      <div class="sitio">
        ${navSitio()}
        <div class="sitio-cuerpo">
          <div class="panel mt-3">
            <div class="panel-cuerpo">
              ${U.vacio({
                icono: 'libro',
                titulo: 'No encontramos esa nota',
                texto: 'La liga apunta a un texto que ya no está publicado en el sitio.'
              })}
              <div class="centro">
                <button type="button" class="btn btn-primario" data-accion="app:ir"
                        ${U.attr({ 'data-args': { ruta: '#/publico/notas' } })}>
                  ${U.icono('flecha-izq', 16)} Ver todas las notas
                </button>
              </div>
            </div>
          </div>
        </div>
        ${pieSitio()}
      </div>`;
  }

  function paginaNota(ctx) {
    var id = ctx.params && ctx.params.id ? ctx.params.id : '';
    var n = id ? nota(id) : null;
    if (!n) return notaNoEncontrada();
    var a = autorDe(n);

    return `
      <div class="sitio">
        ${navSitio()}
        <div class="sitio-cuerpo">
          <div class="mt-3">
            ${U.migas([
              { texto: 'Inicio', ruta: '#/publico' },
              { texto: 'Notas para padres', ruta: '#/publico/notas' },
              { texto: recortar(n.titulo, 42) }
            ])}
          </div>

          <article class="nota-hoja">
            <div class="nota-tema">${U.icono(n.icono, 13)} ${U.esc(n.tema)}</div>
            <h1>${U.esc(n.titulo)}</h1>
            <p class="nota-entrada">${U.esc(n.gancho)}</p>
            <div class="nota-meta grande">
              ${a ? U.avatar(a, 'sm') : ''}
              <span>${a ? U.esc(a.nombre) : U.esc(DB.escuela.nombre)}</span>
              <span class="punto" aria-hidden="true">·</span>
              <span>${U.fecha(n.fecha, 'larga')}</span>
              <span class="punto" aria-hidden="true">·</span>
              <span>${n.lectura} min de lectura</span>
            </div>

            ${n.foto ? '<figure class="nota-portada">' + foto(n.foto, 'nota-portada-img') + '</figure>' : ''}

            <div class="nota-texto">
              ${(n.cuerpo || []).map(bloqueDeNota).join('')}
            </div>

            ${(n.fuentes || []).length ? `
              <div class="nota-fuentes">
                <div class="etiqueta">De dónde sale lo que dice esta nota</div>
                <ul>${n.fuentes.map(function (f) { return '<li>' + U.esc(f) + '</li>'; }).join('')}</ul>
              </div>` : ''}

            ${firmaDeNota(n)}
          </article>

          ${otrasNotas(n)}

          <section class="bloque" style="padding-top:0">
            <div class="fila envuelve gap-1">
              <button type="button" class="btn" data-accion="app:ir"
                      ${U.attr({ 'data-args': { ruta: '#/publico/notas' } })}>
                ${U.icono('flecha-izq', 16)} Todas las notas
              </button>
              <button type="button" class="btn btn-primario" data-accion="pub:acceder">
                ${U.icono('candado', 16)} Entrar al portal
              </button>
            </div>
          </section>
        </div>
        ${pieSitio()}
      </div>`;
  }

  function bloqueAdmisiones() {
    var e = DB.escuela;
    var b = becas();
    var filas = Q.resumenNiveles();
    return `
      <section class="bloque" id="admisiones" style="${ANCLA}">
        <h2 class="bloque-tit">Informes y admisiones</h2>
        <p class="intro">
          Continuamos inscripciones y reinscripciones para el ciclo ${U.esc(e.ciclo)}. Visítanos en horario
          de oficina, escríbenos o llámanos: te contestamos a la brevedad.
        </p>
        <div class="rejilla">
          <div class="col-8">
            <div class="panel">
              <div class="panel-cab">
                <div>
                  <h3 class="panel-tit">Costos por nivel</h3>
                  <p class="panel-sub">Montos en ${U.esc(e.moneda)} · colegiatura de diez meses</p>
                </div>
                ${U.badge('Ciclo ' + e.ciclo, 'marca')}
              </div>
              <div class="panel-cuerpo sin-relleno">
                <div class="tabla-envoltura">
                  <table class="tabla">
                    <thead>
                      <tr>
                        <th>Nivel</th><th>Edades</th>
                        <th class="num">Inscripción</th><th class="num">Colegiatura</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filas.map(function (f) {
                        return `
                        <tr>
                          <td><strong>${U.esc(f.nivel.nombre)}</strong>
                            <div class="silencio" style="font-size:.78rem">${plural(f.grados, 'grado', 'grados')}</div>
                          </td>
                          <td class="silencio">${U.esc(f.nivel.edades)}</td>
                          <td class="num mono">${U.moneda(f.nivel.inscripcion)}</td>
                          <td class="num mono">${U.moneda(f.nivel.colegiatura)}</td>
                        </tr>`;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="panel-pie">
                La colegiatura vence el día 5 de cada mes; después del día 10 se aplica el recargo del
                ${e.recargoPct}% previsto en el reglamento. Hay ${plural(b.cuantos, 'beca vigente', 'becas vigentes')}
                ${b.max ? 'de hasta ' + b.max + '% de descuento' : ''}. El estado de cuenta al día se
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
                  ${dato('Dirección', e.direccion)}
                  ${dato('Ciudad', e.ciudad)}
                  ${dato('Teléfonos', e.telefono + ' · ' + e.telefono2)}
                  ${dato('WhatsApp', e.whatsapp)}
                  ${dato('Correo', e.email)}
                  ${dato('Buzón «te escuchamos»', e.buzon)}
                  ${dato('Horario de atención', e.horarioAtencion)}
                  ${dato('Días de clase', e.diasHabiles)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="aviso-demo mt-2">
          <span style="display:flex">${U.icono('info', 16)}</span>
          <div>
            <strong>Esto es una demostración del sistema escolar.</strong> Los datos institucionales son
            los públicos del colegio; los alumnos, docentes, calificaciones, pagos y reseñas se generaron
            para mostrar cómo funciona el portal. Puedes entrar con cualquiera de las cuentas de ejemplo,
            sin contraseña.
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
          ${bandaVida()}
          ${bloqueColegio()}
          ${bloquePropuesta()}
          ${bloqueOferta()}
          ${bloqueClaustro()}
          ${bloqueAlianzas()}
          ${bloqueAfter()}
          ${bloqueNotas()}
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
                    <th>Código</th><th>Materia</th><th>Grado</th><th>Horario</th><th>Aula</th><th class="num">Inscritos</th>
                  </tr>
                </thead>
                <tbody>
                  ${materias.map(function (m) {
                    var n = Q.alumnosDeMateria(m.id).length;
                    var g = Q.grado(m.gradoId);
                    return `
                    <tr>
                      <td class="mono">${U.esc(m.codigo)}</td>
                      <td>
                        <strong>${U.esc(m.nombre)}</strong>
                        <div class="silencio" style="font-size:.79rem">${m.creditos} créditos</div>
                      </td>
                      <td>${g ? '<span class="grado-pin">' + U.esc(g.corto) + '</span>' : '<span class="silencio">—</span>'}</td>
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
    titulo: 'The Livingstone',

    /* El título de la pestaña cambia con la ruta: cada nota tiene el suyo. */
    tituloDe: function (ctx) {
      var c = ctx || {};
      if (c.seccion === 'notas') return 'Notas para padres';
      if (c.seccion === 'nota') {
        var n = nota((c.params && c.params.id) || '');
        return n ? n.titulo : 'Notas para padres';
      }
      if (c.seccion === 'profesor') {
        var pr = Q.profesor((c.params && c.params.id) || '');
        return pr && pr.perfilPublico ? pr.nombre : 'Claustro docente';
      }
      return '';
    },

    render: function (ctx) {
      var c = ctx || {};
      if (c.seccion === 'profesor') return perfil(c);
      if (c.seccion === 'notas') return paginaNotas();
      if (c.seccion === 'nota') return paginaNota(c);
      return portada();
    },

    acciones: {
      /* Abre el perfil público de una persona docente. */
      'pub:profesor': function (args) {
        var id = args && args.id ? args.id : '';
        if (!id) { U.toast('Esa materia todavía no tiene profesor asignado.', 'aviso'); return; }
        App.ir('#/publico/profesor?id=' + encodeURIComponent(id));
      },

      /* Abre una nota para padres. */
      'pub:nota': function (args) {
        var id = args && args.id ? args.id : '';
        if (!id) return;
        App.ir('#/publico/nota?id=' + encodeURIComponent(id));
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

      /* Despliega el resto del claustro en pantalla angosta. */
      'pub:masClaustro': function () {
        claustroAbierto = true;
        App.refrescar();
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
