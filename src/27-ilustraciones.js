/* ============================================================================
   27-ilustraciones.js — Ilustraciones de las notas para padres.
   Declara: const ILUSTRACIONES
   Dibujos propios en vectores, uno por nota, con la paleta del colegio. No son
   fotografías: las fotos del colegio son pocas y repetirlas en cada nota se
   nota. Al ser vectores pesan nada, se ven nítidos en cualquier pantalla y no
   hay que salir a pedir ningún archivo.

   Cada entrada guarda sólo el interior del <svg>; la vista pone la etiqueta,
   la clase y el lienzo, que siempre es `0 0 640 240`. Se recortan como una
   foto (`slice`), así que lo importante vive entre x 60 y 580, y entre
   y 20 y 220: lo de más afuera se puede perder en el recorte.

   La clave es el id de la nota. Si una nota no tiene dibujo, se dibuja igual
   sin él.
   ========================================================================== */

const ILUSTRACIONES = {

  /* Noche de estudio: la lámpara, el libro abierto y la luna en la ventana. */
  'habitos-en-casa':
    '<rect width="640" height="240" fill="#16283C"/>' +
    /* ventana */
    '<rect x="392" y="26" width="160" height="118" rx="5" fill="#0F1D2B"/>' +
    '<rect x="470" y="26" width="4" height="118" fill="#35547A"/>' +
    '<rect x="392" y="83" width="160" height="4" fill="#35547A"/>' +
    '<rect x="392" y="26" width="160" height="118" rx="5" fill="none" stroke="#35547A" stroke-width="5"/>' +
    '<circle cx="435" cy="58" r="19" fill="#F0C23C"/>' +
    '<circle cx="426" cy="52" r="17" fill="#0F1D2B"/>' +
    '<circle cx="512" cy="52" r="2.2" fill="#F0C23C" opacity=".65"/>' +
    '<circle cx="424" cy="116" r="2.2" fill="#F0C23C" opacity=".5"/>' +
    '<circle cx="514" cy="118" r="2.6" fill="#F0C23C" opacity=".6"/>' +
    '<circle cx="532" cy="72" r="1.8" fill="#F0C23C" opacity=".45"/>' +
    /* escritorio */
    '<rect x="0" y="186" width="640" height="54" fill="#1E3149"/>' +
    '<rect x="0" y="186" width="640" height="3" fill="#35547A"/>' +
    /* La luz, como resplandor y charco sobre la mesa. Nada de cono: un
       triángulo con la pantalla encima se lee como un cerro, no como luz. */
    '<defs>' +
      '<radialGradient id="foco-hc">' +
        '<stop offset="0" stop-color="#FFE2A0" stop-opacity=".42"/>' +
        '<stop offset="1" stop-color="#FFE2A0" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<radialGradient id="charco-hc">' +
        '<stop offset="0" stop-color="#FFE2A0" stop-opacity=".30"/>' +
        '<stop offset="1" stop-color="#FFE2A0" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<circle cx="196" cy="128" r="78" fill="url(#foco-hc)"/>' +
    '<ellipse cx="206" cy="186" rx="138" ry="28" fill="url(#charco-hc)"/>' +
    /* lámpara */
    '<ellipse cx="96" cy="182" rx="34" ry="8" fill="#31506F"/>' +
    '<path d="M96 180 C 96 128, 140 82, 192 78" stroke="#35547A" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<polygon points="164,74 226,74 246,116 144,116" fill="#F0C23C"/>' +
    '<circle cx="195" cy="118" r="7" fill="#FBF1D7"/>' +
    /* libros apilados */
    '<rect x="70" y="176" width="66" height="10" rx="2" fill="#C25E3F"/>' +
    '<rect x="76" y="166" width="58" height="10" rx="2" fill="#1F6F63"/>' +
    /* libro abierto */
    '<path d="M120 186 C 150 172, 180 172, 206 180 L206 192 C 180 184, 150 186, 120 198 Z" fill="#FBF1D7"/>' +
    '<path d="M292 186 C 262 172, 232 172, 206 180 L206 192 C 232 184, 262 186, 292 198 Z" fill="#EDE3CE"/>' +
    '<rect x="204" y="180" width="4" height="12" fill="#D8CDB4"/>' +
    '<rect x="146" y="183" width="40" height="3" rx="1.5" fill="#A9B8C8" opacity=".55"/>' +
    '<rect x="142" y="189" width="46" height="3" rx="1.5" fill="#A9B8C8" opacity=".45"/>' +
    '<rect x="226" y="183" width="40" height="3" rx="1.5" fill="#A9B8C8" opacity=".55"/>' +
    '<rect x="224" y="189" width="46" height="3" rx="1.5" fill="#A9B8C8" opacity=".45"/>' +
    /* taza */
    '<path d="M346 166 q 12 0 12 9 t -12 9" stroke="#F0C23C" stroke-width="5" fill="none"/>' +
    '<rect x="318" y="158" width="28" height="30" rx="4" fill="#F0C23C"/>' +
    '<path d="M326 148 q 5 -8 0 -16" stroke="#8FA3B8" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>' +
    '<path d="M336 148 q 5 -8 0 -16" stroke="#8FA3B8" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>',

  /* La conversación del dinero: una pila de monedas y un birrete, hablándose. */
  'hablar-de-la-colegiatura':
    '<rect width="640" height="240" fill="#F7EFE0"/>' +
    '<path d="M136 168 C 200 200, 420 208, 500 172" stroke="#DCC9A4" stroke-width="3" ' +
      'stroke-dasharray="2 11" stroke-linecap="round" fill="none"/>' +
    /* globo de la izquierda */
    '<polygon points="96,138 96,172 132,140" fill="#273E55"/>' +
    '<rect x="66" y="34" width="246" height="106" rx="20" fill="#273E55"/>' +
    /* pila de monedas */
    '<rect x="151" y="80" width="76" height="32" fill="#D9A62A"/>' +
    '<ellipse cx="189" cy="112" rx="38" ry="10" fill="#D9A62A"/>' +
    '<ellipse cx="189" cy="101" rx="38" ry="10" fill="none" stroke="#C4901C" stroke-width="2"/>' +
    '<ellipse cx="189" cy="90" rx="38" ry="10" fill="none" stroke="#C4901C" stroke-width="2"/>' +
    '<ellipse cx="189" cy="80" rx="38" ry="10" fill="#F0C23C"/>' +
    '<circle cx="268" cy="96" r="20" fill="#F0C23C"/>' +
    '<circle cx="268" cy="96" r="13" fill="none" stroke="#D9A62A" stroke-width="3"/>' +
    /* globo de la derecha */
    '<polygon points="528,156 528,188 496,158" fill="#F0C23C"/>' +
    '<rect x="356" y="58" width="208" height="100" rx="20" fill="#F0C23C"/>' +
    /* birrete */
    '<path d="M436 106 L436 124 C436 134 484 134 484 124 L484 106 Z" fill="#273E55"/>' +
    '<polygon points="460,80 506,98 460,116 414,98" fill="#273E55"/>' +
    '<path d="M506 98 L512 122" stroke="#273E55" stroke-width="4" stroke-linecap="round" fill="none"/>' +
    '<circle cx="512" cy="127" r="5" fill="#273E55"/>',

  /* Cuatro caminos distintos que llegan al mismo lugar. */
  'todos-aprenden-distinto':
    '<rect width="640" height="240" fill="#E4EBF3"/>' +
    '<rect x="0" y="198" width="640" height="42" fill="#D3DEEA"/>' +
    '<rect x="0" y="198" width="640" height="3" fill="#C2D0E0"/>' +
    /* los cuatro trayectos */
    '<path d="M92 190 C 180 172, 300 148, 400 118 C 452 96, 490 72, 506 60" ' +
      'stroke="#273E55" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>' +
    '<path d="M196 190 L230 156 L200 130 L268 110 L246 84 L356 70 L504 56" ' +
      'stroke="#1F6F63" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>' +
    '<path d="M300 190 C 300 140, 340 110, 420 100 C 462 92, 490 76, 504 56" ' +
      'stroke="#C25E3F" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>' +
    '<path d="M404 190 C 452 190, 476 166, 452 148 C 428 130, 456 112, 486 100 C 508 92, 514 72, 506 58" ' +
      'stroke="#5C3A6E" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".9"/>' +
    /* las cuatro salidas */
    '<circle cx="92" cy="192" r="11" fill="#273E55"/>' +
    '<circle cx="196" cy="192" r="11" fill="#1F6F63"/>' +
    '<circle cx="300" cy="192" r="11" fill="#C25E3F"/>' +
    '<circle cx="404" cy="192" r="11" fill="#5C3A6E"/>' +
    /* la meta, que es la misma para todos */
    '<circle cx="524" cy="52" r="26" fill="#F0C23C" opacity=".25"/>' +
    '<circle cx="524" cy="52" r="19" fill="#F0C23C"/>' +
    '<circle cx="524" cy="52" r="8" fill="#E4EBF3"/>',

  /* La escalera de los quince grados obligatorios, por tramos, y el birrete. */
  'sistema-educativo-mexico':
    '<rect width="640" height="240" fill="#1E3149"/>' +
    '<rect x="100" y="202" width="25" height="12" fill="#7FA7C9"/>' +
    '<rect x="129" y="193" width="25" height="21" fill="#7FA7C9"/>' +
    '<rect x="158" y="184" width="25" height="30" fill="#7FA7C9"/>' +
    '<rect x="187" y="175" width="25" height="39" fill="#4E86B5"/>' +
    '<rect x="216" y="166" width="25" height="48" fill="#4E86B5"/>' +
    '<rect x="245" y="157" width="25" height="57" fill="#4E86B5"/>' +
    '<rect x="274" y="148" width="25" height="66" fill="#4E86B5"/>' +
    '<rect x="303" y="139" width="25" height="75" fill="#4E86B5"/>' +
    '<rect x="332" y="130" width="25" height="84" fill="#4E86B5"/>' +
    '<rect x="361" y="121" width="25" height="93" fill="#2F6690"/>' +
    '<rect x="390" y="112" width="25" height="102" fill="#2F6690"/>' +
    '<rect x="419" y="103" width="25" height="111" fill="#2F6690"/>' +
    '<rect x="448" y="94" width="25" height="120" fill="#F0C23C"/>' +
    '<rect x="477" y="85" width="25" height="129" fill="#F0C23C"/>' +
    '<rect x="506" y="76" width="25" height="138" fill="#F0C23C"/>' +
    /* piso y los cuatro tramos */
    '<rect x="0" y="214" width="640" height="26" fill="#16283C"/>' +
    '<rect x="100" y="222" width="83" height="4" rx="2" fill="#7FA7C9"/>' +
    '<rect x="187" y="222" width="170" height="4" rx="2" fill="#4E86B5"/>' +
    '<rect x="361" y="222" width="83" height="4" rx="2" fill="#2F6690"/>' +
    '<rect x="448" y="222" width="83" height="4" rx="2" fill="#F0C23C"/>' +
    /* birrete en el último escalón */
    '<path d="M506 60 L506 70 C506 76 530 76 530 70 L530 60 Z" fill="#EFE3C6"/>' +
    '<polygon points="518,42 542,54 518,66 494,54" fill="#FBF1D7"/>' +
    '<path d="M542 54 L539 70" stroke="#F0C23C" stroke-width="3" stroke-linecap="round" fill="none"/>' +
    '<circle cx="539" cy="73" r="4" fill="#F0C23C"/>',

  /* Las cuatro de la tarde: el sol bajo y lo que se hace a esa hora. */
  'las-tardes-tambien-educan':
    '<rect width="640" height="240" fill="#F7E3CB"/>' +
    '<circle cx="330" cy="196" r="86" fill="#F5CE62"/>' +
    '<circle cx="330" cy="196" r="56" fill="#F0C23C"/>' +
    '<rect x="0" y="196" width="640" height="44" fill="#D9A96F"/>' +
    '<rect x="0" y="196" width="640" height="3" fill="#C4914F"/>' +
    /* sombras largas de la tarde */
    '<polygon points="126,198 166,198 208,214 168,214" fill="#C08F55" opacity=".5"/>' +
    '<polygon points="214,198 252,198 294,214 256,214" fill="#C08F55" opacity=".5"/>' +
    '<polygon points="370,198 424,198 466,214 412,214" fill="#C08F55" opacity=".5"/>' +
    '<polygon points="462,198 524,198 564,214 502,214" fill="#C08F55" opacity=".5"/>' +
    /* balón */
    '<circle cx="146" cy="170" r="26" fill="#1E3149"/>' +
    '<path d="M120 170 h52" stroke="#F7E3CB" stroke-width="3"/>' +
    '<path d="M146 144 v52" stroke="#F7E3CB" stroke-width="3"/>' +
    '<path d="M127 152 C 138 162, 138 178, 127 188" stroke="#F7E3CB" stroke-width="3" fill="none"/>' +
    '<path d="M165 152 C 154 162, 154 178, 165 188" stroke="#F7E3CB" stroke-width="3" fill="none"/>' +
    /* nota musical */
    '<rect x="241" y="116" width="6" height="64" fill="#1E3149"/>' +
    '<path d="M247 118 C 272 128, 276 150, 261 164 C 270 146, 262 132, 247 139 Z" fill="#1E3149"/>' +
    '<ellipse cx="228" cy="180" rx="17" ry="13" fill="#1E3149" transform="rotate(-18 228 180)"/>' +
    /* robot */
    '<rect x="395" y="126" width="6" height="16" fill="#1E3149"/>' +
    '<circle cx="398" cy="121" r="6" fill="#F0C23C"/>' +
    '<rect x="362" y="158" width="8" height="16" rx="3" fill="#1E3149"/>' +
    '<rect x="426" y="158" width="8" height="16" rx="3" fill="#1E3149"/>' +
    '<rect x="370" y="142" width="56" height="52" rx="10" fill="#1E3149"/>' +
    '<circle cx="386" cy="164" r="6" fill="#F0C23C"/>' +
    '<circle cx="410" cy="164" r="6" fill="#F0C23C"/>' +
    '<rect x="384" y="180" width="28" height="4" rx="2" fill="#F7E3CB" opacity=".75"/>' +
    /* paleta de pintura */
    '<ellipse cx="494" cy="169" rx="36" ry="27" fill="#1E3149"/>' +
    '<ellipse cx="504" cy="180" rx="8" ry="7" fill="#F7E3CB"/>' +
    '<circle cx="478" cy="158" r="6" fill="#C25E3F"/>' +
    '<circle cx="496" cy="152" r="6" fill="#1F6F63"/>' +
    '<circle cx="514" cy="161" r="6" fill="#F0C23C"/>'
};
