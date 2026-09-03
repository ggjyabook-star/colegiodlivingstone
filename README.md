# Colegio Altamira — demostración de sistema escolar

Sistema completo para una escuela privada, con **tres paneles** (alumno, profesor, dirección) más el
**sitio público** del colegio. Una sola página, sin servidor, sin dependencias: se abre `index.html`
en cualquier navegador y funciona.

## Cómo se usa

1. Abre `index.html` con doble clic.
2. En el sitio público, pulsa **Acceder al portal**.
3. Elige cualquiera de las **ocho cuentas de demostración**. No hay contraseñas.

Todos los cambios (calificaciones capturadas, materias nuevas, pagos registrados, reseñas
autorizadas) se guardan en el navegador. Para volver al estado inicial:
**Dirección → Colegio → Reiniciar la demostración**.

## Las ocho cuentas

| Rol | Persona | Detalle |
|---|---|---|
| Dirección | Mtra. Lucía Fernanda Bravo Estrada | Directora general |
| Profesor | Mtro. Emilio Cárdenas Rojo | Cálculo, Física, Química, Pensamiento Computacional |
| Profesor | Mtra. Ximena Robles Alcántara | Literatura, Historia, Inglés, Apreciación Artística |
| Alumno | Renata Solís Ibarra (A-2431) | Promedio alto, beca 20%, al corriente |
| Alumno | Diego Alonso Menchaca Ruiz (A-2447) | Promedio medio, colegiatura de noviembre pendiente |
| Alumno | Valeria Nájera Quintanar (A-2452) | Irregular, un pago vencido, ausencias justificadas |
| Alumno | Mateo Ibarra Sandoval (A-2468) | En seguimiento: promedio bajo, dos pagos vencidos, entregas atrasadas |
| Alumno | Camila Ferrer Ochoa (A-2473) | Promedio alto, beca de excelencia 40% |

Los cinco alumnos están deliberadamente en situaciones distintas para que se vea cómo responde el
sistema en cada caso: quién dispara alertas, quién aparece en el tablero de riesgo de la dirección
y quién no.

## Qué hace cada panel

**Sitio público** — portada del colegio con la oferta de materias del ciclo, el claustro docente con
la valoración de sus alumnos, y el perfil público de cada profesor: semblanza, formación, trayectoria,
materias, CV y las reseñas que ese profesor autorizó.

**Alumno** — resumen de rendimiento (promedio, asistencia, créditos, estado de cuenta, rendimiento por
materia, tendencia del ciclo, próximas entregas), boleta completa por evaluación, tareas, materiales
subidos por los profesores, estado de cuenta con recibos, avisos, perfil editable, y **calificar a sus
profesores**.

**Profesor** — resumen de sus grupos, alta y edición de materias con su horario y evaluaciones,
**captura de calificaciones** en tabla, asistencia, tareas con revisión de entregas, subida de
materiales, expediente de sus alumnos, avisos, **moderación de las reseñas que recibe**, y su perfil:
foto, CV, semblanza, formación y trayectoria.

**Dirección** — tablero del colegio (KPI, ingresos, alumnos en riesgo, promedio por materia, actividad
reciente), gestión de alumnos con expediente completo, gestión de profesores, gestión de materias con
el horario semanal del colegio, finanzas con registro de pagos y generación de colegiaturas, panorama
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
  10-estilos.css    tokens de diseño y todos los componentes
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

- Los datos son ficticios. Nombres, matrículas, teléfonos y correos no corresponden a personas reales.
- La fecha del sistema está fijada al **14 de noviembre de 2025** para que los vencimientos, los días
  restantes y las gráficas se vean iguales siempre.
- Las subidas de foto y de CV son reales dentro del navegador (se leen con `FileReader`), pero no hay
  servidor: nada sale del equipo y las descargas están deshabilitadas a propósito.
- La escala es de 0 a 10 con mínima aprobatoria de 6.0, y el promedio de cada materia es ponderado por
  el peso de sus evaluaciones.
- No hay niveles ni grados: solo alumnos, materias y profesores.
