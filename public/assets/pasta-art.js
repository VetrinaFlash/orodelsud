// Illustrazioni dei formati di pasta (SVG a tratto), usate quando un prodotto non ha ancora la foto.
// Condiviso tra sito (generato dal Worker), area clienti e pannello.

const S = 'fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';

const tube = (x, y, len, r, ang, ridges = 0, cut = false) => {
  // tubo visto di sbieco: due bordi paralleli e due ellissi alle estremità
  const rad = ang * Math.PI / 180, dx = Math.cos(rad) * len, dy = Math.sin(rad) * len;
  const nx = -Math.sin(rad) * r, ny = Math.cos(rad) * r;
  const x2 = x + dx, y2 = y + dy;
  const e = (cx, cy, k = 1) => `<ellipse cx="${cx}" cy="${cy}" rx="${r * .42 * k}" ry="${r}" transform="rotate(${ang} ${cx} ${cy})" />`;
  let out = `<path d="M${x + nx} ${y + ny} L${x2 + nx} ${y2 + ny} M${x - nx} ${y - ny} L${x2 - nx} ${y2 - ny}" />`;
  out += cut ? `<path d="M${x + nx} ${y + ny} L${x - nx - dx * .12} ${y - ny - dy * .12}" />${e(x2, y2)}` : `${e(x, y)}${e(x2, y2)}`;
  for (let i = 1; i <= ridges; i++) {
    const t = i / (ridges + 1), cx = x + dx * t, cy = y + dy * t;
    out += `<path d="M${cx + nx * .98} ${cy + ny * .98} q ${-Math.cos(rad) * r * .35} 0 ${-nx * 1.96} ${-ny * 1.96}" opacity=".55" stroke-width="2" />`;
  }
  return out;
};

const ART = {
  lunga: `<g ${S}>${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${22 + i * 6} ${104 - i * 2} L${78 + i * 6} ${18 - i * 2}" />`).join('')}<path d="M44 66 q 14 8 28 -4" stroke-width="7" opacity=".35" /></g>`,
  nido: `<g ${S}>${[0, 1, 2, 3].map(i => `<path d="M${20 + i * 4} ${60 + i * 3} C ${30 + i * 3} ${20 - i * 2}, ${90 - i * 3} ${20 + i * 3}, ${100 - i * 4} ${58 - i * 2} S ${40 + i * 5} ${104 - i * 3}, ${30 + i * 6} ${70 - i * 2}" />`).join('')}</g>`,
  penne: `<g ${S}>${tube(22, 80, 60, 13, -40, 4, true)}${tube(48, 98, 54, 13, -40, 4, true)}</g>`,
  rigatoni: `<g ${S}>${tube(26, 72, 46, 16, -30, 5)}${tube(52, 98, 46, 16, -30, 5)}</g>`,
  paccheri: `<g ${S}>${tube(24, 58, 34, 24, -18)}${tube(56, 92, 30, 22, -18)}</g>`,
  anelli: `<g ${S}><ellipse cx="44" cy="52" rx="24" ry="14" /><ellipse cx="44" cy="62" rx="24" ry="14" /><path d="M20 52v10M68 52v10" /><ellipse cx="78" cy="82" rx="22" ry="13" /><ellipse cx="78" cy="91" rx="22" ry="13" /><path d="M56 82v9M100 82v9" /></g>`,
  fusilli: `<g ${S}><path d="M36 20 c 30 6 30 14 0 20 c -30 6 -30 14 0 20 c 30 6 30 14 0 20 c -30 6 -30 14 0 20" /><path d="M78 30 c 22 5 22 11 0 16 c -22 5 -22 11 0 16 c 22 5 22 11 0 16 c -22 5 -22 11 0 16" opacity=".8" /></g>`,
  orecchiette: `<g ${S}><ellipse cx="44" cy="50" rx="26" ry="20" /><ellipse cx="46" cy="52" rx="15" ry="10" opacity=".6" /><ellipse cx="80" cy="82" rx="24" ry="18" /><ellipse cx="82" cy="84" rx="13" ry="9" opacity=".6" /></g>`,
  cavatelli: `<g ${S}><path d="M22 54 c 6 -22 46 -24 52 -2 c -10 -10 -40 -10 -52 2 Z" /><path d="M30 50 c 10 -6 30 -6 38 0" opacity=".6" /><path d="M48 90 c 6 -22 46 -24 52 -2 c -10 -10 -40 -10 -52 2 Z" /><path d="M56 86 c 10 -6 30 -6 38 0" opacity=".6" /></g>`,
  conchiglie: `<g ${S}><path d="M24 76 C 20 40, 64 22, 92 40 C 104 50, 100 74, 84 84 C 64 96, 32 96, 24 76 Z" /><path d="M36 74 C 40 56, 62 44, 84 50" opacity=".6" />${[0, 1, 2, 3].map(i => `<path d="M${40 + i * 12} ${88 - i} L${50 + i * 10} ${40 + i * 3}" stroke-width="2" opacity=".5" />`).join('')}</g>`,
  ravioli: `<g ${S}>${[[18, 22], [62, 60]].map(([x, y]) => `<path d="M${x} ${y} ${Array.from({ length: 8 }, (_, i) => `l 5 ${i % 2 ? 3 : -3}`).join(' ')} ${Array.from({ length: 8 }, (_, i) => `l ${i % 2 ? 3 : -3} 5`).join(' ')} ${Array.from({ length: 8 }, (_, i) => `l -5 ${i % 2 ? -3 : 3}`).join(' ')} ${Array.from({ length: 8 }, (_, i) => `l ${i % 2 ? -3 : 3} -5`).join(' ')} Z" /><rect x="${x + 9}" y="${y + 9}" width="22" height="22" rx="9" opacity=".6" />`).join('')}</g>`,
  lasagne: `<g ${S}><path d="M18 38 q 8 -8 16 0 t 16 0 t 16 0 t 16 0 t 16 0 L 98 80 q -8 8 -16 0 t -16 0 t -16 0 t -16 0 t -16 0 Z" /><path d="M26 96 L 102 96 M30 104 L 98 104" opacity=".5" /></g>`,
  nastri: `<g ${S}><path d="M18 30 c 30 0 30 22 0 22 s -2 24 34 24 c 30 0 34 26 60 20" /><path d="M30 22 c 36 2 38 30 4 30 s 0 22 36 22 c 26 0 30 20 44 18" opacity=".6" /></g>`,
  gnocchi: `<g ${S}>${[[34, 44], [70, 40], [50, 78], [86, 78]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="12" />${[-6, 0, 6].map(d => `<path d="M${x + d} ${y - 9} v18" stroke-width="2" opacity=".5" />`).join('')}`).join('')}</g>`,
  spiga: `<g ${S}><path d="M60 108 V 30" />${[0, 1, 2, 3, 4].map(i => `<path d="M60 ${88 - i * 14} c -14 -2 -18 -12 -16 -20 c 10 2 16 8 16 20 Z M60 ${88 - i * 14} c 14 -2 18 -12 16 -20 c -10 2 -16 8 -16 20 Z" />`).join('')}<path d="M60 30 c -2 -8 0 -14 0 -18" /></g>`,
};

const RULES = [
  [/ravioli|tortell|agnolott|mezzelun/i, 'ravioli'],
  [/lasagn|sfoglia|cannellon/i, 'lasagne'],
  [/gnocch/i, 'gnocchi'],
  [/orecchiett/i, 'orecchiette'],
  [/cavatell|strascinat|malloreddus/i, 'cavatelli'],
  [/conchigl/i, 'conchiglie'],
  [/fusill|busiat|eliche|tortiglion|fileja|ferretto/i, 'fusilli'],
  [/calamar|anell/i, 'anelli'],
  [/pacche/i, 'paccheri'],
  [/rigaton|maccheron|tubett|mezze maniche/i, 'rigatoni'],
  [/penne|pennette|ziti tagliati/i, 'penne'],
  [/scialatiell|tagliatell|pappardell|fettuccin|trofie/i, 'nastri'],
  [/linguin|bavett/i, 'nido'],
  [/spagh|vermicell|ziti|bucatin|capellin|lungh/i, 'lunga'],
];
export const artKey = name => (RULES.find(([re]) => re.test(name || '')) || [null, 'spiga'])[1];

/** SVG del formato (stringa). */
export function pastaArt(name, cls = '') {
  return `<svg class="pasta-art ${cls}" viewBox="0 0 120 120" aria-hidden="true">${ART[artKey(name)]}</svg>`;
}
