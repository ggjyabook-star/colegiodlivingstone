#!/usr/bin/env bash
# Concatena src/ en dos salidas:
#   index.html    — página completa para abrir en el navegador
#   publicar.html — sólo el cuerpo, para publicar como Artifact
set -euo pipefail
cd "$(dirname "$0")"

FUENTES="src/30-store.js src/40-ui.js src/50-publico.js src/60-alumno.js src/70-profesor.js src/80-direccion.js src/90-app.js"

FUENTE_TITULO='<title>The Livingstone</title>'
FUENTE_FONTS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Abhaya+Libre:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">'

construir () {
  local salida="$1" completa="$2"
  {
    if [ "$completa" = "si" ]; then
      echo '<!doctype html>'
      echo '<html lang="es">'
      echo '<head>'
      echo '<meta charset="utf-8">'
      echo '<meta name="viewport" content="width=device-width, initial-scale=1">'
      echo "$FUENTE_TITULO"
      cat src/05-icono.html
      echo "$FUENTE_FONTS"
      echo '<style>'
      cat src/10-estilos.css
      echo '</style>'
      echo '</head>'
      echo '<body>'
    else
      echo "$FUENTE_TITULO"
      cat src/05-icono.html
      echo "$FUENTE_FONTS"
      echo '<style>'
      cat src/10-estilos.css
      echo '</style>'
    fi

    echo '<div id="raiz"></div>'
    echo '<div class="toast-zona" id="toasts" aria-live="polite" aria-atomic="false"></div>'
    echo '<div id="modales"></div>'
    echo '<script>'
    echo '"use strict";'
    cat src/20-datos.js
    for f in $FUENTES; do
      echo ""
      echo "/* ===== $f ===== */"
      cat "$f"
    done
    echo '</script>'

    if [ "$completa" = "si" ]; then
      echo '</body>'
      echo '</html>'
    fi
  } > "$salida"
  echo "  $salida  —  $(wc -c < "$salida") bytes"
}

for f in src/05-icono.html src/10-estilos.css src/20-datos.js $FUENTES; do
  [ -f "$f" ] || { echo "FALTA: $f" >&2; exit 1; }
done

echo "Construyendo:"
construir index.html si
construir publicar.html no
echo "Listo."
