# CONTRATO — Colegio Altamira (demo escolar)

App de una sola página, **sin frameworks, sin build, sin imports**. Todos los archivos de `src/`
se concatenan **en orden numérico** dentro de un único `<script>`. Por lo tanto:

- Cada archivo declara sus cosas con `var`/`function`/`const` en el **ámbito global compartido**.
- **Prohibido** `import`, `export`, `require`, `module.`, `<script src>`, `fetch()`, red de cualquier tipo.
- **Prohibido** redeclarar un `const` que ya declaró otro archivo. Cada archivo declara SOLO lo que le toca.
- Español de México en toda la interfaz. Moneda MXN. Sin niveles ni grados (nada de "primaria/secundaria/preparatoria").
- Todo el estado vive en `DB` y se persiste en `localStorage`.

## Orden de concatenación

| archivo | declara | quién |
|---|---|---|
| `src/10-estilos.css` | CSS (tokens + componentes) | ya existe |
| `src/20-datos.js` | `const SEMILLA` | ya existe |
| `src/30-store.js` | `var DB`, `const HOY`, `const Store`, `const Sesion`, `const Q`, `const M` | agente |
| `src/40-ui.js` | `const U`, `const ICONOS` | agente |
| `src/50-publico.js` | `const VistaPublica` | agente |
| `src/60-alumno.js` | `const VistaAlumno` | agente |
| `src/70-profesor.js` | `const VistaProfesor` | agente |
| `src/80-direccion.js` | `const VistaDireccion` | agente |
| `src/90-app.js` | `const App`, `const Acciones`, arranque | agente |

---

## 1. Modelo de datos (`DB`)

```js
DB = {
  version: 3,
  contador: 100,   // lo usa Store.uid
  escuela: {
    nombre, lema, ciclo, fundacion, direccion, ciudad, telefono, email, sitio,
    colegiaturaMensual, moneda, horarioAtencion, acercaDe, mision, sello,
    diasHabiles, recargoPct
  },
  direccion: { id:'dir-01', rol:'direccion', nombre, cargo, email, telefono, foto, iniciales, color, desde, bio },
  alumnos: [{
    id, rol:'alumno', matricula, nombre, email, foto, iniciales, color, nacimiento, telefono,
    tutor:{nombre,parentesco,telefono,email}, ingreso, estatus:'activo'|'condicionado'|'baja',
    becaPct, notas
  }],
  profesores: [{
    id, rol:'profesor', clave, nombre, email, foto, iniciales, color, titulo, bio, telefono, oficina,
    horarioAsesoria, formacion:[{grado,institucion,anio}],
    experiencia:[{puesto,lugar,periodo,detalle}], areas:[String],
    cv:{nombre,tamano,actualizado,url}|null, perfilPublico:Boolean, ingreso, estatus
  }],
  materias: [{
    id, codigo, nombre, profesorId, creditos, aula, cupo,
    horario:[{dia,inicio,fin}], descripcion, color, estatus:'activa'|'archivada'
  }],
  inscripciones: [{ id, alumnoId, materiaId }],
  evaluaciones: [{ id, materiaId, nombre, tipo:'parcial'|'tarea'|'proyecto'|'practica', peso, fecha }],
  calificaciones: [{ id, alumnoId, evaluacionId, valor, capturadaEl, capturadaPor }],
  asistencias: [{ id, alumnoId, materiaId, presentes, totales }],
  tareas: [{ id, materiaId, titulo, descripcion, tipo, vence, puntos, publicadaEl, archivo }],
  entregas: [{ id, tareaId, alumnoId, estado:'pendiente'|'entregada'|'revisada'|'atrasada', fecha, calificacion }],
  materiales: [{ id, materiaId, titulo, tipo:'pdf'|'video'|'liga'|'presentacion'|'hoja', descripcion, subidoEl, tamano, autorId, url }],
  avisos: [{ id, autorId, autorRol, ambito:'escuela'|'materia', materiaId, titulo, cuerpo, fecha, prioridad:'normal'|'alta' }],
  pagos: [{ id, alumnoId, concepto, periodo, monto, vence, estado:'pagado'|'pendiente'|'vencido', pagadoEl, metodo, referencia, recargo }],
  resenas: [{ id, profesorId, alumnoId, materiaId, estrellas,
              criterios:{claridad,dominio,trato,puntualidad}, comentario, fecha,
              estado:'pendiente'|'publica'|'oculta', anonima, respuesta }],
  bitacora: [{ id, fecha, actorId, texto }]
}
```

Escala de calificación **0 a 10**, mínima aprobatoria **6.0**. Promedio de materia =
suma(valor × peso) / suma(peso) **solo** sobre evaluaciones ya calificadas para ese alumno.

## 2. `Store` (30-store.js)

```js
Store.cargar()           // lee localStorage 'altamira.db.v3'; si no hay o cambia version, clona SEMILLA
Store.guardar()          // persiste DB en try/catch y notifica suscriptores
Store.reiniciar()        // borra y re-siembra desde SEMILLA, cierra sesión
Store.suscribir(fn)
Store.uid(pfx)           // pfx + '-' + (DB.contador++)  — determinista, sin Math.random
Store.bitacora(texto)    // agrega entrada usando el actor de la sesión
```

## 3. `Sesion` (30-store.js)

```js
Sesion.actual()   // {rol, id} | null  (persiste en localStorage 'altamira.sesion')
Sesion.entrar(rol, id)
Sesion.salir()
Sesion.persona()  // objeto alumno/profesor/direccion de la sesión, o null
```

## 4. Selectores `Q` (30-store.js) — puros

```js
Q.alumno(id)  Q.profesor(id)  Q.materia(id)  Q.evaluacion(id)  Q.tarea(id)  Q.persona(rol,id)
Q.materiasDeAlumno(alumnoId)          -> [materia]
Q.materiasDeProfesor(profesorId)      -> [materia]
Q.alumnosDeMateria(materiaId)         -> [alumno]
Q.evaluacionesDeMateria(materiaId)    -> [evaluacion] ordenadas por fecha
Q.nota(alumnoId, evaluacionId)        -> calificacion | null
Q.promedioMateria(alumnoId, materiaId)-> Number|null  (1 decimal)
Q.promedioGeneral(alumnoId)           -> Number|null  (promedio de promedios de materia)
Q.promedioGrupo(materiaId)            -> Number|null
Q.avanceMateria(alumnoId, materiaId)  -> {calificadas, total, pct}
Q.asistencia(alumnoId, materiaId)     -> {presentes, totales, pct}   // materiaId opcional = global
Q.pagosDeAlumno(alumnoId)             -> [pago] más reciente primero
Q.adeudo(alumnoId)                    -> {total, vencidos, pendientes, alCorriente}
Q.tareasDeAlumno(alumnoId)            -> [{tarea, materia, entrega}]
Q.proximasEntregas(alumnoId, n)       -> [{tarea, materia, entrega}] sin revisar, por vencimiento
Q.materialesDeAlumno(alumnoId)        -> [{material, materia}] recientes primero
Q.avisosPara(rol, id)                 -> [aviso] recientes primero
Q.resenasDeProfesor(profesorId, estado)-> [resena]
Q.ratingProfesor(profesorId, soloPublicas) -> {promedio, total, distribucion:[c1,c2,c3,c4,c5], criterios:{claridad,dominio,trato,puntualidad}}
Q.resenaDe(alumnoId, profesorId)      -> resena | null
Q.rendimientoPorParcial(alumnoId)     -> [{etiqueta, valor}]  serie de tendencia
Q.kpisEscuela()                       -> {alumnos, profesores, materias, promedioGeneral, asistencia, cobrado, porCobrar, vencido, cumplimientoPct}
Q.ingresosPorMes()                    -> [{etiqueta, cobrado, esperado}]
Q.riesgo()                            -> [{alumno, motivo, severidad}]
Q.diasParaEntrega(iso)                -> Number (negativo = atrasado), contra HOY
```

**`HOY`**: `const HOY = new Date(2025, 10, 14, 9, 0, 0)` (14 de noviembre de 2025). Fecha fija para que
la demo sea determinista. Todo cálculo relativo usa `HOY`.

## 5. Mutaciones `M` (30-store.js) — validan, mutan, guardan; devuelven `{ok:Boolean, error}`

```js
M.guardarNota(alumnoId, evaluacionId, valor)   // '' o null borra la nota; valida 0..10
M.crearEvaluacion(materiaId, datos) / M.actualizarEvaluacion(id, datos) / M.eliminarEvaluacion(id)
M.crearMateria(datos) / M.actualizarMateria(id, datos) / M.archivarMateria(id)
M.inscribir(alumnoId, materiaId) / M.desinscribir(alumnoId, materiaId)
M.crearAlumno(datos) / M.actualizarAlumno(id, datos) / M.cambiarEstatusAlumno(id, estatus)
M.crearProfesor(datos) / M.actualizarProfesor(id, datos)
M.actualizarPerfilProfesor(id, datos)
M.subirFoto(rol, id, dataUrl)
M.subirCV(profesorId, archivo)                 // archivo = {nombre, tamano, url}
M.crearTarea(materiaId, datos)                 // genera entregas 'pendiente' para los inscritos
M.marcarEntrega(tareaId, alumnoId, estado, calificacion)
M.subirMaterial(materiaId, datos) / M.eliminarMaterial(id)
M.publicarAviso(datos)
M.registrarPago(pagoId, datos)                 // datos = {metodo, referencia}; marca pagado con HOY
M.generarColegiaturas(periodo)                 // pago pendiente del periodo a cada alumno activo
M.crearResena(datos)                           // nace 'pendiente'
M.moderarResena(id, estado)                    // 'publica' | 'oculta'
M.responderResena(id, texto)
M.actualizarEscuela(datos)
M.actualizarAsistencia(alumnoId, materiaId, presentes, totales)
```

## 6. `U` — componentes que devuelven **cadenas de HTML** (40-ui.js)

Todo se pinta con `innerHTML`. **Siempre** escapar texto de `DB` con `U.esc()`.

```js
U.esc(v)
U.attr(obj)                 // {"data-args": {...}} -> atributos seguros con comillas simples
U.icono(nombre, tam)        // SVG en línea, currentColor
U.avatar(persona, tam)      // 'xs'|'sm'|'md'|'lg'|'xl'; foto si existe, si no iniciales sobre su color
U.badge(texto, variante)    // 'ok'|'aviso'|'crit'|'info'|'marca'|'neutro'
U.chip(texto, variante)
U.kpi({etiqueta, valor, sub, variante, icono, pie})
U.tabla({columnas:[{clave,titulo,align,ancho,mono,html}], filas:[Object], vacio, clase})
U.barras({series:[{etiqueta,valor,color}], max, alto, formato, meta})
U.columnas({series:[{etiqueta,valor}], max, alto, formato})
U.linea({puntos:[{etiqueta,valor}], min, max, alto, meta})
U.anillo(pct, {etiqueta, sub, tam, variante})
U.dona({segmentos:[{etiqueta,valor,color}], centro:{valor,sub}})
U.estrellas(valor, {tam, total})
U.estrellasInput(nombre, valor)
U.moneda(n)                 // "$4,800.00"
U.fecha(iso, formato)       // 'corta' | 'larga' | 'mes' | 'relativa'
U.notaTexto(n)              // "8.7" o "—"
U.claseNota(n)              // 'nota-alta' | 'nota-media' | 'nota-baja'
U.seccion({titulo, sub, acciones, cuerpo, clase})
U.panel({titulo, sub, acciones, cuerpo, clase})
U.vacio({icono, titulo, texto, accion})
U.campo({tipo, nombre, etiqueta, valor, opciones, requerido, ayuda, min, max, paso, placeholder, filas, col})
U.form({id, campos, acciones, accion})
U.pestanas(items, activo, accion)   // items:[{id,texto,conteo}]
U.migas([{texto, ruta}])
U.toast(mensaje, variante)
U.modal({titulo, sub, cuerpo, ancho, acciones})
U.cerrarModal()
U.confirmar({titulo, texto, textoOk, accion, args, peligro})
U.leerArchivo(input, cb)    // FileReader -> cb({nombre, tamano, tipo, url})
U.tamano(bytes)
U.iniciales(nombre)
U.progreso(pct, variante)
```

**Iconos** (`U.icono`): `casa, libro, usuarios, usuario, tarjeta, grafica, estrella, calendario, reloj,
campana, archivo, subir, descargar, mas, lapiz, basura, buscar, filtro, cheque, equis, alerta, info,
engrane, salir, menu, flecha-der, flecha-izq, ojo, ojo-cerrado, correo, telefono, pin, escudo, birrete,
portapapeles, chat, candado, foto, pdf, video, liga, presentacion, hoja, dinero, tendencia-arriba,
tendencia-abajo, punto, sello`. Un nombre desconocido devuelve un punto neutro (nunca rompe).

## 7. Vistas

Cada archivo de vista declara **un objeto**:

```js
const VistaAlumno = {
  nav: [{ id:'resumen', texto:'Resumen', icono:'casa' }, ...],
  titulo: 'Portal del alumno',
  render(ctx) { return 'cadena HTML' },   // ctx = {rol, id, persona, seccion, params}
  acciones: { 'al:verMateria'(args, ev, el) {} },
  montado(ctx) {}   // opcional, tras insertar el HTML
}
```

- `ctx.seccion` = id del nav activo. `ctx.params` = query del hash (`#/alumno/materias?id=mat-01`).
- Prefijos de acción: `al:` `pr:` `dir:` `pub:` `app:`. Nunca colisionan.

### Enrutado y acciones (90-app.js)

- Rutas: `#/publico`, `#/publico/profesor?id=pr-01`, `#/acceso`, `#/alumno/<seccion>`,
  `#/profesor/<seccion>`, `#/direccion/<seccion>`.
- Delegación global en `document`:
  - `click` en `[data-accion]` → `Acciones[nombre](args, ev, el)`
  - `change` en `[data-cambio]`, `input` en `[data-entrada]`
  - `submit` en `form[data-envio]` → `preventDefault()` y `args.datos` = objeto del FormData
- `args` sale de `data-args` (JSON, comillas simples en el atributo). Usa `U.attr()`.
- `App.ir(ruta)`, `App.refrescar()` (conserva scroll), `App.ctx()`.
- Acciones globales obligatorias: `app:ir`, `app:salir`, `app:cerrarModal`, `app:reiniciarDemo`,
  `app:tema`, `app:menu`.

## 8. Cascarón (90-app.js)

- **Sitio público** (`#/publico`): sin riel; encabezado `.sitio-nav` y pie propios.
- **Acceso** (`#/acceso`): tarjetas de las 8 cuentas demo agrupadas por rol; clic = entrar, sin contraseña,
  con nota visible de que es una demostración. Enlace de regreso al sitio.
- **App con sesión**: `.shell` = `.riel` (fijo: sello, nav, persona, salir) + `.principal`
  (`.topbar` + `.contenido`). En < 900 px el riel es cajón deslizable con botón `menu` en la topbar.
- Sin sesión y ruta de panel → `#/acceso`. Sesión de otro rol → redirige a su panel.
- Sin hash al arrancar → `#/publico`.

## 9. Clases CSS disponibles (definidas en 10-estilos.css)

Layout: `.shell .riel .riel-marca .riel-nav .riel-nav-item .riel-pie .principal .topbar .contenido
.contenedor .rejilla .col-3 .col-4 .col-6 .col-8 .col-12 .fila .pila .entre .centro .crece .envuelve`

Superficies: `.panel .panel-cab .panel-tit .panel-sub .panel-acc .panel-cuerpo .panel-pie
.seccion .seccion-cab .tarjeta .tarjeta-plana .lista .lista-item .separador .caja-suave`

Datos: `.tabla .tabla-envoltura .num .mono .nota-alta .nota-media .nota-baja .kpi .kpi-valor
.kpi-etiqueta .kpi-sub .kpi-pie .progreso .progreso-barra .grafica .leyenda .leyenda-item`

Elementos: `.btn .btn-primario .btn-suave .btn-fantasma .btn-peligro .btn-sm .btn-bloque .btn-icono
.badge .badge-ok .badge-aviso .badge-crit .badge-info .badge-marca .badge-neutro .chip
.avatar .avatar-xs .avatar-sm .avatar-md .avatar-lg .avatar-xl .estrellas .estrella-llena
.pestanas .pestana .pestana-activa .campo .campo-etiqueta .campo-ayuda .entrada .selec .area
.checa .vacio .toast .toast-zona .modal-fondo .modal .modal-cab .modal-cuerpo .modal-pie
.migas .etiqueta .silencio .destacado .sello .cinta`

Sitio público: `.sitio .sitio-nav .hero .hero-sello .hero-tit .hero-sub .hero-datos .bloque
.bloque-tit .claustro .claustro-item .oferta .oferta-item .sitio-pie .cita`

Utilidades: `.oculto .txt-c .txt-d .mt-0 .mt-1 .mt-2 .mt-3 .mb-0 .mb-1 .mb-2 .mb-3
.gap-1 .gap-2 .gap-3 .ancho-total .nowrap .truncar`

**No inventes clases si ya existe una equivalente.** Para una variante puntual usa estilo en línea con
`var(--token)` — nunca un color literal.

Tokens: `--fondo --superficie --superficie-2 --superficie-3 --tinta --tinta-2 --tinta-3 --linea
--linea-fuerte --marca --marca-ink --marca-suave --marca-contraste --acento --acento-suave
--ok --ok-suave --aviso --aviso-suave --crit --crit-suave --info --info-suave
--sombra-1 --sombra-2 --r-sm --r-md --r-lg --r-full --serie-1 … --serie-6`

## 10. Reglas de calidad

- Cero `console.log`. Cero `alert`/`prompt`/`confirm` nativos: usa `U.modal`, `U.confirmar`, `U.toast`.
- Toda tabla ancha dentro de `.tabla-envoltura`.
- Todo formulario valida y avisa el error con `U.toast(msg, 'crit')`.
- Nada queda "por implementar": si hay un botón, hace algo real.
- Accesible: `<button>` de verdad, `aria-label` en botones de solo icono, foco visible.
- Cada sección abre ya con datos reales, nunca en estado vacío.
