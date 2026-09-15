# The Livingstone — demostración de sistema escolar

Sistema completo para el colegio, con **tres paneles** (alumno, profesor, dirección) más el **sitio
público**. Una sola página, sin servidor, sin dependencias: se abre `index.html` en cualquier navegador
y funciona.

La identidad, los textos institucionales y el escudo son los del colegio
([colegiodlivingstone.edu.mx](https://colegiodlivingstone.edu.mx)). Las personas, las calificaciones,
los pagos y las reseñas son ficticios: existen para mostrar el sistema funcionando con datos reales de
principio a fin.

## Cómo se usa

1. Abre `index.html` con doble clic.
2. En el sitio público, pulsa **Acceder al portal**.
3. Elige cualquiera de las **45 cuentas de demostración**. No hay contraseñas.

Todos los cambios (calificaciones capturadas, materias nuevas, pagos registrados, reseñas autorizadas)
se guardan en el navegador. Para volver al estado inicial:
**Dirección → Colegio → Reiniciar la demostración**.

## Niveles, grados y alumnos

El colegio está armado de preescolar a bachillerato: **4 niveles, 15 grados y 2 alumnos de muestra por
grado**, cada uno con su expediente completo.

| Nivel | Grados | Alumnos | Materias | Colegiatura | Certificación |
|---|---|---|---|---|---|
| Preescolar | 1º a 3º | 6 | 12 | $4,350 | Plataforma Knotion |
| Primaria | 1º a 6º | 12 | 34 | $5,100 | Cambridge Starters, Movers y Flyers |
| Secundaria | 1º a 3º | 6 | 18 | $5,850 | Cambridge Preliminary (B1) o First (B2) |
| Bachillerato | 1º a 3º | 6 | 18 | $6,600 | Oxford y Cambridge hasta C1 |

Cada grado tiene **profesor titular**, **aula**, **grupo** y **plan de estudios propio**. Un alumno
queda inscrito en el plan completo de su grado: al darlo de alta, o al cambiarlo de grado, el sistema
rehace su inscripción, su asistencia y sus entregas pendientes.

Los dos alumnos de cada grado están deliberadamente en situaciones distintas —promedio alto, promedio
medio, entregas atrasadas, pagos vencidos, seguimiento académico— para que se vea cómo responde el
sistema en cada caso: quién dispara alertas, quién aparece en el tablero de riesgo de la dirección y
quién no.

## Las cuentas

| Rol | Cuántas | Detalle |
|---|---|---|
| Dirección | 1 | Mtra. Rebeca Villaseñor Argüelles, directora general |
| Profesores | 14 | De las titulares de preescolar al claustro de bachillerato |
| Alumnos | 30 | Dos por grado, de 1º de preescolar a 3º de bachillerato |

## Qué hace cada panel

**Sitio público** — portada del colegio con su historia, misión, visión y valores; la propuesta
educativa (identidad, valores, idiomas, robótica, arte y ciencias exactas); la oferta por nivel con sus
grados y plan de estudios; el claustro con la valoración de sus alumnos; las alianzas (DBU, Knotion,
Oxford, Cambridge) y las experiencias internacionales; After Class; y los costos por nivel con los
datos de contacto. Cada profesor tiene además su perfil público: semblanza, formación, trayectoria,
grupos, CV y las reseñas que autorizó.

**Alumno** — resumen de rendimiento (promedio, asistencia, grado escolar, estado de cuenta, rendimiento
por materia, tendencia del ciclo, próximas entregas), boleta completa por evaluación, tareas,
materiales subidos por los profesores, estado de cuenta con recibos, avisos, perfil editable, y
**calificar a sus profesores**.

**Profesor** — resumen de sus grupos, alta y edición de materias con su grado, horario y evaluaciones,
**captura de calificaciones** en tabla, asistencia, tareas con revisión de entregas, subida de
materiales, expediente de sus alumnos, avisos, **moderación de las reseñas que recibe**, y su perfil:
foto, CV, semblanza, formación y trayectoria.

**Dirección** — tablero del colegio (KPI, ingresos, alumnos en riesgo, promedio por nivel, actividad
reciente), **grados** con el titular y los resultados de cada grupo, gestión de alumnos con expediente
completo y filtros por nivel y grado, gestión de profesores, plan de estudios por grado con el horario
semanal de cada grupo, finanzas con registro de pagos y generación de colegiaturas por nivel, panorama
académico, todas las reseñas, avisos y la configuración del colegio.

## El flujo de reseñas

Es el requisito con más reglas, así que conviene verlo explícitamente:

1. El **alumno** califica a un profesor que le imparte clase (estrellas generales, cuatro criterios,
   comentario y opción de anonimato). La reseña nace **pendiente**.
2. Solo el **profesor** puede autorizarla. Al hacerlo pasa a **pública** y aparece en su perfil del
   sitio público. También puede ocultarla o responderla.
3. La **dirección** ve todas las reseñas —incluidas pendientes y ocultas— pero **no** puede publicarlas.
   Solo puede ocultar una ya publicada si resulta inapropiada.

El anonimato se respeta en los tres paneles: si el alumno pidió anonimato, ni el profesor ni la
dirección ven su nombre.

## Estructura del código

```
index.html          página completa lista para abrir
publicar.html       el mismo contenido, sin <html>/<head>, para publicar
construir.sh        concatena src/ en las dos salidas anteriores
CONTRATO.md         contrato técnico: modelo de datos, API interna, clases CSS y tokens
src/
  05-icono.html     escudo del colegio como icono de la pestaña (base64)
  10-estilos.css    tokens de diseño, escudo embebido y todos los componentes
  20-datos.js       datos semilla (deterministas: idénticos en cada equipo)
  30-store.js       estado, persistencia, selectores (Q) y mutaciones (M)
  40-ui.js          componentes de interfaz y gráficas SVG, sin librerías
  50-publico.js     sitio público y perfiles docentes
  60-alumno.js      panel del alumno
  70-profesor.js    panel del profesor
  80-direccion.js   panel de dirección
  90-app.js         enrutador, cascarón, pantalla de acceso y arranque
```

Para reconstruir tras editar `src/`:

```bash
bash construir.sh
```

## Notas sobre la demostración

- Los datos institucionales (dirección, teléfonos, misión, niveles, alianzas, After Class) son los
  públicos del colegio. Los nombres de alumnos y profesores, sus matrículas, teléfonos, correos,
  calificaciones y pagos son ficticios y no corresponden a personas reales.
- La identidad visual sale del logotipo del 40 aniversario: el escudo va embebido en la hoja de estilo
  y el azul marino, el azul de enlace y la tipografía con serifa vienen del sitio del colegio.
- La fecha del sistema está fijada al **14 de noviembre de 2025** para que los vencimientos, los días
  restantes y las gráficas se vean iguales siempre.
- Las subidas de foto y de CV son reales dentro del navegador (se leen con `FileReader`), pero no hay
  servidor: nada sale del equipo y las descargas están deshabilitadas a propósito.
- La escala es de 0 a 10 con mínima aprobatoria de 6.0, y el promedio de cada materia es ponderado por
  el peso de sus evaluaciones. En preescolar se usa la misma escala para que la demostración sea
  comparable entre niveles.
- El horario del ciclo se reparte solo: cinco días por seis franjas, sin que se empalmen dos clases del
  mismo grupo, del mismo profesor ni del mismo espacio.
