// Generates the SAMPLE project artwork used in this prototype (public/work/*.svg).
// Every image here is a placeholder composition for a fictional sample client.
// Replace them with real project photography: drop files into /public/work and
// update the paths in src/content.js. Run with: npm run art

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'work');
mkdirSync(out, { recursive: true });

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Courier New', Courier, monospace";

// Shared defs: film grain + soft shadow + a light falloff.
const defs = (w, h, light = '#ffffff') => `
  <defs>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.10"/></feComponentTransfer>
    </filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="softer" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
    <radialGradient id="light" cx="38%" cy="30%" r="85%">
      <stop offset="0" stop-color="${light}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.22"/>
    </radialGradient>
  </defs>`;

const finish = (w, h) => `
  <rect width="${w}" height="${h}" fill="url(#light)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)"/>`;

const svg = (w, h, body, light) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs(w, h, light)}${body}${finish(w, h)}</svg>`;

const shadow = (shape, dx = 18, dy = 26, o = 0.35) =>
  `<g transform="translate(${dx} ${dy})" opacity="${o}" filter="url(#soft)">${shape.replace(/fill="[^"]*"/g, 'fill="#000"')}</g>`;

const waves = (x, y, w, color, n = 3, gap = 26, amp = 12, sw = 6) =>
  Array.from({ length: n }, (_, i) => {
    const yy = y + i * gap;
    let d = `M ${x} ${yy}`;
    for (let k = 0; k < w; k += 60) d += ` q 30 ${-amp} 60 0`;
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`;
  }).join('');

const art = {};

/* ------------------------------------------------------------------ */
/* Marigold Ferry Co. — identity & wayfinding                          */
/* ------------------------------------------------------------------ */
{
  const navy = '#1E2B45', mari = '#E8A33D', cream = '#F1E7D3', sea = '#6F8FA6';
  const ticket = `
    <g transform="translate(860 300) rotate(-6)">
      <rect x="0" y="0" width="560" height="300" rx="10" fill="${cream}"/>
      <rect x="0" y="0" width="560" height="70" rx="10" fill="${mari}"/>
      <rect x="0" y="50" width="560" height="20" fill="${mari}"/>
      <text x="32" y="46" font-family="${SANS}" font-weight="700" font-size="26" letter-spacing="5" fill="${navy}">MARIGOLD FERRY CO.</text>
      <text x="32" y="122" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${navy}">HARBOUR → NORTH ISLAND</text>
      <text x="28" y="232" font-family="${SERIF}" font-size="120" fill="${navy}">07:40</text>
      <line x1="410" y1="80" x2="410" y2="300" stroke="${navy}" stroke-width="3" stroke-dasharray="4 10"/>
      <circle cx="485" cy="190" r="46" fill="none" stroke="${navy}" stroke-width="5"/>
      <text x="485" y="206" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="44" fill="${navy}">3</text>
      <text x="32" y="276" font-family="${MONO}" font-size="16" letter-spacing="2" fill="${navy}" opacity=".7">SINGLE · ADULT · GANGWAY B</text>
    </g>`;
  const disc = `<circle cx="520" cy="560" r="330" fill="${mari}"/>`;
  const mark = `
    <g fill="none" stroke="${navy}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 330 690 L 330 450 L 520 610 L 710 450 L 710 690"/>
    </g>
    ${waves(330, 760, 400, navy, 2, 40, 14, 12)}`;
  art['marigold-ferry-1'] = svg(1600, 1200, `
    <rect width="1600" height="1200" fill="${navy}"/>
    <rect y="980" width="1600" height="220" fill="#17223A"/>
    ${shadow(disc, 26, 34, 0.5)}${disc}${mark}
    ${shadow(ticket.replace(/<text[^>]*>[^<]*<\/text>/g, ''), 20, 30, 0.55)}${ticket}
    ${waves(80, 1060, 1440, sea, 3, 34, 12, 5)}
  `, '#ffe9c4');

  const poster = (x, bg, fg, time, dest) => `
    <g transform="translate(${x} 170)">
      ${shadow(`<rect width="400" height="640" fill="#000"/>`, 14, 22, 0.28)}
      <rect width="400" height="640" fill="${bg}"/>
      <text x="34" y="70" font-family="${SANS}" font-weight="700" font-size="20" letter-spacing="4" fill="${fg}">MARIGOLD FERRY CO.</text>
      <line x1="34" y1="92" x2="366" y2="92" stroke="${fg}" stroke-width="3"/>
      <text x="30" y="300" font-family="${SERIF}" font-size="132" fill="${fg}">${time}</text>
      <text x="34" y="360" font-family="${MONO}" font-size="22" letter-spacing="3" fill="${fg}">${dest}</text>
      ${waves(34, 470, 330, fg, 3, 34, 12, 8)}
      <text x="34" y="604" font-family="${MONO}" font-size="16" letter-spacing="2" fill="${fg}" opacity=".75">DAILY · ALL TIDES</text>
    </g>`;
  art['marigold-ferry-2'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="#D9CDB7"/>
    <rect y="880" width="1600" height="120" fill="#C9BCA4"/>
    ${poster(150, mari, navy, '07:40', 'NORTH ISLAND')}
    ${poster(600, navy, mari, '09:10', 'OLD QUAY')}
    ${poster(1050, cream, navy, '11:30', 'LIGHTHOUSE')}
  `, '#fff4e0');

  const sign = `
    <g transform="translate(220 250)">
      <rect width="1160" height="420" rx="18" fill="${navy}"/>
      <circle cx="170" cy="210" r="120" fill="${mari}"/>
      <path d="M 105 260 L 105 165 L 170 222 L 235 165 L 235 260" fill="none" stroke="${navy}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="350" y="190" font-family="${SANS}" font-weight="700" font-size="104" fill="${cream}">Ferries 1–4</text>
      <text x="354" y="270" font-family="${MONO}" font-size="30" letter-spacing="4" fill="${mari}">GANGWAY B · TICKETS · WAITING ROOM</text>
      <path d="M 980 330 L 1100 330 M 1060 290 L 1100 330 L 1060 370" fill="none" stroke="${mari}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;
  art['marigold-ferry-3'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${sea}"/>
    <g opacity=".12" stroke="#fff" stroke-width="2">${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${i * 90}" x2="1600" y2="${i * 90}"/>`).join('')}</g>
    ${shadow(`<rect x="220" y="250" width="1160" height="420" rx="18" fill="#000"/>`, 18, 34, 0.45)}${sign}
    <rect x="780" y="670" width="40" height="330" fill="#3c4a5e"/>
  `, '#f3f8ff');
}

/* ------------------------------------------------------------------ */
/* Oda Ceramics — identity & packaging                                 */
/* ------------------------------------------------------------------ */
{
  const terra = '#B8603F', clay = '#E6D3BD', char = '#2B2724', sage = '#9AA48C';
  const vase = (x, y, s, color, kind) => {
    const shapes = {
      a: 'M -60 0 C -150 -40 -150 -230 -70 -300 L -70 -380 L 70 -380 L 70 -300 C 150 -230 150 -40 60 0 Z',
      b: 'M -110 0 C -180 -60 -170 -170 -80 -210 C -40 -230 40 -230 80 -210 C 170 -170 180 -60 110 0 Z',
      c: 'M -70 0 L -95 -420 C -95 -440 95 -440 95 -420 L 70 0 Z',
    };
    return `<g transform="translate(${x} ${y}) scale(${s})">
      <ellipse cx="0" cy="6" rx="150" ry="22" fill="#000" opacity=".25" filter="url(#softer)"/>
      <path d="${shapes[kind]}" fill="${color}"/>
      <path d="${shapes[kind]}" fill="url(#vshade)"/>
    </g>`;
  };
  const vshade = `<defs><linearGradient id="vshade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient></defs>`;
  art['oda-ceramics-1'] = svg(1600, 1200, `${vshade}
    <rect width="1600" height="1200" fill="${clay}"/>
    <rect y="860" width="1600" height="340" fill="#D8C2A8"/>
    ${vase(470, 900, 1.05, terra, 'a')}
    ${vase(820, 900, 1.15, char, 'b')}
    ${vase(1140, 900, 0.95, sage, 'c')}
    <g transform="translate(1180 980) rotate(-8)">
      <rect width="250" height="120" fill="#F4EBDD"/>
      <text x="125" y="78" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="64" fill="${char}">oda</text>
      <circle cx="18" cy="60" r="7" fill="${clay}"/>
    </g>
  `, '#fff6ea');
  art['oda-ceramics-2'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="#CFB79B"/>
    ${shadow(`<rect x="430" y="210" width="740" height="560" fill="#000"/>`, 24, 34, 0.4)}
    <rect x="430" y="210" width="740" height="560" fill="${char}"/>
    <rect x="430" y="210" width="740" height="120" fill="#36302C"/>
    <circle cx="800" cy="520" r="120" fill="none" stroke="${clay}" stroke-width="6"/>
    <text x="800" y="545" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="84" fill="${clay}">oda</text>
    <text x="800" y="700" text-anchor="middle" font-family="${MONO}" font-size="22" letter-spacing="8" fill="${clay}" opacity=".8">HANDMADE · STONEWARE · 01</text>
    <path d="M 430 330 L 1170 330" stroke="${terra}" stroke-width="10"/>
  `, '#fff2e2');
  art['oda-ceramics-3'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${sage}"/>
    <defs><path id="ring" d="M 520 500 m -190 0 a 190 190 0 1 1 380 0 a 190 190 0 1 1 -380 0"/></defs>
    ${shadow(`<circle cx="520" cy="500" r="250" fill="#000"/>`, 16, 24, 0.35)}
    <circle cx="520" cy="500" r="250" fill="${terra}"/>
    <circle cx="520" cy="500" r="150" fill="none" stroke="${clay}" stroke-width="4"/>
    <text font-family="${MONO}" font-size="34" letter-spacing="10" fill="${clay}"><textPath href="#ring">ODA · CERAMICS · SLOW KILN · ODA · CERAMICS ·</textPath></text>
    <text x="520" y="528" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="96" fill="${clay}">oda</text>
    <g transform="translate(900 300) rotate(5)">
      ${shadow(`<rect width="480" height="290" fill="#000"/>`, 12, 18, 0.3)}
      <rect width="480" height="290" fill="#F4EBDD"/>
      <text x="40" y="90" font-family="${SERIF}" font-style="italic" font-size="58" fill="${char}">oda</text>
      <text x="40" y="200" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${char}">STUDIO POTTERY</text>
      <text x="40" y="236" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${char}" opacity=".6">THROWN · GLAZED · FIRED</text>
      <rect x="400" y="40" width="40" height="40" fill="${terra}"/>
    </g>
  `, '#ffffff');
}

/* ------------------------------------------------------------------ */
/* Northbank Library — website & digital                               */
/* ------------------------------------------------------------------ */
{
  const forest = '#2E4A3C', paper = '#EFE9DC', coral = '#E07A5F', ink = '#1F1F1F';
  const tiles = ['#E07A5F', '#F2C14E', '#7FA88E', '#3D5A80', '#C9A27E', '#8E6C8A', '#E9D8A6', '#5B8E7D'];
  const browser = `
    <g transform="translate(200 150)">
      <rect width="1200" height="860" rx="16" fill="${paper}"/>
      <rect width="1200" height="56" rx="16" fill="#DCD4C3"/><rect y="40" width="1200" height="16" fill="#DCD4C3"/>
      <circle cx="34" cy="28" r="9" fill="${coral}"/><circle cx="62" cy="28" r="9" fill="#F2C14E"/><circle cx="90" cy="28" r="9" fill="#7FA88E"/>
      <rect x="380" y="16" width="440" height="24" rx="12" fill="${paper}"/>
      <text x="60" y="120" font-family="${SANS}" font-weight="700" font-size="22" letter-spacing="3" fill="${forest}">NORTHBANK LIBRARY</text>
      <text x="840" y="120" font-family="${SANS}" font-size="20" fill="${ink}">Catalogue    Events    Visit</text>
      <line x1="60" y1="146" x2="1140" y2="146" stroke="${ink}" stroke-width="2"/>
      <text x="56" y="300" font-family="${SERIF}" font-size="128" fill="${ink}">Borrow the city.</text>
      <rect x="60" y="350" width="560" height="70" rx="35" fill="none" stroke="${ink}" stroke-width="3"/>
      <text x="96" y="396" font-family="${SANS}" font-size="24" fill="${ink}" opacity=".55">Search books, rooms, events…</text>
      <rect x="640" y="350" width="200" height="70" rx="35" fill="${coral}"/>
      <text x="740" y="396" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="24" fill="${paper}">Search</text>
      ${tiles.slice(0, 6).map((c, i) => `<rect x="${60 + i * 182}" y="480" width="160" height="230" fill="${c}"/><rect x="${60 + i * 182}" y="726" width="${100 + (i % 3) * 20}" height="14" fill="${ink}" opacity=".7"/><rect x="${60 + i * 182}" y="752" width="90" height="12" fill="${ink}" opacity=".35"/>`).join('')}
    </g>`;
  art['northbank-library-1'] = svg(1600, 1200, `
    <rect width="1600" height="1200" fill="${forest}"/>
    ${shadow(`<rect x="200" y="150" width="1200" height="860" rx="16" fill="#000"/>`, 22, 40, 0.5)}${browser}
  `, '#eaffef');
  const phone = (x, rot, screen) => `
    <g transform="translate(${x} 500) rotate(${rot})">
      ${shadow(`<rect x="-170" y="-340" width="340" height="680" rx="44" fill="#000"/>`, 14, 26, 0.35)}
      <rect x="-170" y="-340" width="340" height="680" rx="44" fill="${ink}"/>
      <rect x="-154" y="-324" width="308" height="648" rx="32" fill="${paper}"/>
      ${screen}
    </g>`;
  art['northbank-library-2'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="#DCD3C1"/>
    ${phone(430, -6, `<text x="-124" y="-240" font-family="${SANS}" font-weight="700" font-size="16" letter-spacing="2" fill="${forest}">NORTHBANK</text><text x="-128" y="-150" font-family="${SERIF}" font-size="54" fill="${ink}">Tonight</text><text x="-128" y="-96" font-family="${SERIF}" font-size="54" fill="${ink}">at the</text><text x="-128" y="-42" font-family="${SERIF}" font-size="54" fill="${ink}">library</text><rect x="-128" y="0" width="256" height="190" fill="${coral}"/><rect x="-128" y="214" width="190" height="14" fill="${ink}" opacity=".6"/>`)}
    ${phone(800, 0, `<text x="-124" y="-240" font-family="${SANS}" font-weight="700" font-size="16" letter-spacing="2" fill="${forest}">YOUR LOANS</text>${[0, 1, 2, 3].map((i) => `<rect x="-128" y="${-200 + i * 120}" width="70" height="100" fill="${tiles[i + 1]}"/><rect x="-40" y="${-180 + i * 120}" width="150" height="14" fill="${ink}" opacity=".75"/><rect x="-40" y="${-152 + i * 120}" width="100" height="12" fill="${ink}" opacity=".35"/>`).join('')}`)}
    ${phone(1170, 6, `<rect x="-154" y="-324" width="308" height="300" fill="${forest}"/><text x="-124" y="-120" font-family="${SERIF}" font-size="48" fill="${paper}">Reading</text><text x="-124" y="-70" font-family="${SERIF}" font-size="48" fill="${paper}">room 3</text><rect x="-128" y="20" width="256" height="64" rx="32" fill="${coral}"/><text x="0" y="62" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="20" fill="${paper}">Book a seat</text>`)}
  `, '#ffffff');
  let x = 120;
  let spines = '';
  let i = 0;
  while (x < 1480) {
    const w = 46 + ((i * 37) % 60);
    const h = 520 + ((i * 53) % 220);
    const c = tiles[i % tiles.length];
    spines += `<rect x="${x}" y="${860 - h}" width="${w}" height="${h}" fill="${c}"/><rect x="${x + 10}" y="${880 - h}" width="${w - 20}" height="6" fill="${ink}" opacity=".35"/><rect x="${x + 10}" y="${818}" width="${w - 20}" height="4" fill="${ink}" opacity=".3"/>`;
    x += w + 6;
    i++;
  }
  art['northbank-library-3'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${paper}"/>
    <rect y="860" width="1600" height="30" fill="${forest}"/>
    <rect y="890" width="1600" height="110" fill="#D9D0BE"/>
    ${spines}
  `, '#ffffff');
}

/* ------------------------------------------------------------------ */
/* Sundial Records — sleeves & art direction                           */
/* ------------------------------------------------------------------ */
{
  const orange = '#D2642B', black = '#161412', sun = '#F2C14E', sand = '#E9DCC4';
  const grooves = (cx, cy, r) => Array.from({ length: 16 }, (_, k) => `<circle cx="${cx}" cy="${cy}" r="${r - 12 - k * 18}" fill="none" stroke="#fff" stroke-opacity="${0.04 + (k % 3) * 0.02}" stroke-width="2"/>`).join('');
  const sleeve = (x, y, s, sunY, bg, sunC, stripes) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <rect width="600" height="600" fill="${bg}"/>
      <clipPath id="c${x}${y}"><rect width="600" height="600"/></clipPath>
      <g clip-path="url(#c${x}${y})">
        <circle cx="300" cy="${sunY}" r="200" fill="${sunC}"/>
        ${Array.from({ length: stripes }, (_, k) => `<rect x="0" y="${sunY + 20 + k * 34}" width="600" height="${10 + k * 3}" fill="${bg}"/>`).join('')}
      </g>
      <text x="36" y="70" font-family="${SANS}" font-weight="700" font-size="24" letter-spacing="6" fill="${sunC}">SUNDIAL</text>
      <text x="564" y="566" text-anchor="end" font-family="${MONO}" font-size="18" letter-spacing="3" fill="${sunC}" opacity=".8">SDL-0${Math.round(sunY / 100)}</text>
    </g>`;
  art['sundial-records-1'] = svg(1600, 1200, `
    <rect width="1600" height="1200" fill="${sand}"/>
    ${shadow(`<circle cx="960" cy="590" r="350" fill="#000"/>`, 18, 26, 0.45)}
    <circle cx="960" cy="590" r="350" fill="${black}"/>${grooves(960, 590, 350)}
    <circle cx="960" cy="590" r="110" fill="${orange}"/><circle cx="960" cy="590" r="10" fill="${sand}"/>
    <text x="960" y="560" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="20" letter-spacing="5" fill="${black}">SUNDIAL</text>
    <text x="960" y="640" text-anchor="middle" font-family="${MONO}" font-size="14" letter-spacing="3" fill="${black}">SIDE A · 33⅓</text>
    ${shadow(`<rect x="250" y="240" width="700" height="700" fill="#000"/>`, 24, 30, 0.5)}
    ${sleeve(250, 240, 700 / 600, 360, orange, sun, 6)}
  `, '#fff3df');
  art['sundial-records-2'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="#2A2522"/>
    ${[[160, 110, 300, orange, sun], [820, 110, 420, black, orange], [160, 520, 520, sun, black], [820, 520, 200, sand, orange]].map(([x, y, sy, bg, c], k) => `${shadow(`<rect x="${x}" y="${y}" width="620" height="370" fill="#000"/>`, 10, 16, 0.4)}<g>${sleeve(x, y, 370 / 600, sy, bg, c, 4 + k)}</g><g transform="translate(${x + 390} ${y})"><rect width="230" height="370" fill="${bg}" opacity=".92"/><text x="24" y="60" font-family="${SERIF}" font-style="italic" font-size="40" fill="${c}">${['Dawn', 'Noon', 'Dusk', 'Night'][k]}</text><text x="24" y="330" font-family="${MONO}" font-size="14" letter-spacing="2" fill="${c}">VOL. 0${k + 1}</text></g>`).join('')}
  `, '#ffe9c9');
  art['sundial-records-3'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${orange}"/>
    ${shadow(`<circle cx="800" cy="500" r="430" fill="#000"/>`, 16, 24, 0.45)}
    <circle cx="800" cy="500" r="430" fill="${black}"/>${grooves(800, 500, 430)}
    <circle cx="800" cy="500" r="180" fill="${sun}"/>
    <path d="M 620 500 A 180 180 0 0 1 980 500 Z" fill="${orange}"/>
    <circle cx="800" cy="500" r="14" fill="${black}"/>
    <text x="800" y="580" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="30" letter-spacing="8" fill="${black}">SUNDIAL</text>
    <text x="800" y="620" text-anchor="middle" font-family="${MONO}" font-size="18" letter-spacing="4" fill="${black}">RELEASED AT DUSK · SIDE A</text>
  `, '#fff0d0');
}

/* ------------------------------------------------------------------ */
/* Fieldwork Festival — two-colour campaign                            */
/* ------------------------------------------------------------------ */
{
  const red = '#E2483D', blue = '#2C4FA0', paper = '#F3EEE4';
  const poster = (w, h, k = 0) => `
    <rect width="${w}" height="${h}" fill="${paper}"/>
    <g style="mix-blend-mode:multiply">
      <circle cx="${w * (0.68 - k * 0.05)}" cy="${h * 0.3}" r="${w * 0.24}" fill="${red}"/>
      <text x="${w * 0.06}" y="${h * 0.5}" font-family="${SANS}" font-weight="900" font-size="${w * 0.3}" letter-spacing="-${w * 0.01}" fill="${blue}">FIELD</text>
      <text x="${w * 0.06}" y="${h * 0.76}" font-family="${SANS}" font-weight="900" font-size="${w * 0.3}" letter-spacing="-${w * 0.01}" fill="${red}">WORK</text>
    </g>
    <line x1="${w * 0.06}" y1="${h * 0.85}" x2="${w * 0.94}" y2="${h * 0.85}" stroke="${blue}" stroke-width="${w * 0.006}"/>
    <text x="${w * 0.06}" y="${h * 0.92}" font-family="${MONO}" font-size="${w * 0.035}" letter-spacing="${w * 0.006}" fill="${blue}">JULY · THREE DAYS · OPEN AIR</text>`;
  art['fieldwork-festival-1'] = svg(1600, 1200, `
    <rect width="1600" height="1200" fill="#B9B2A6"/>
    ${shadow(`<rect x="440" y="90" width="720" height="1020" fill="#000"/>`, 22, 30, 0.45)}
    <g transform="translate(440 90)">${poster(720, 1020)}</g>
  `, '#ffffff');
  art['fieldwork-festival-2'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="#8E8A84"/>
    <rect width="1600" height="1000" fill="#000" opacity=".05"/>
    ${Array.from({ length: 8 }, (_, k) => {
      const x = 70 + (k % 4) * 370, y = 60 + Math.floor(k / 4) * 460;
      return `<g transform="translate(${x} ${y}) rotate(${(k % 3) - 1})">${poster(330, 440, k % 3)}</g>`;
    }).join('')}
  `, '#ffffff');
  art['fieldwork-festival-3'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${blue}"/>
    <path d="M 640 130 C 640 40 960 40 960 130" fill="none" stroke="#E8DFCF" stroke-width="26"/>
    ${shadow(`<path d="M 520 160 L 1080 160 L 1120 900 L 480 900 Z" fill="#000"/>`, 18, 26, 0.45)}
    <path d="M 520 160 L 1080 160 L 1120 900 L 480 900 Z" fill="#E8DFCF"/>
    <g transform="translate(560 260)">
      <g style="mix-blend-mode:multiply">
        <circle cx="330" cy="140" r="130" fill="${red}"/>
        <text x="10" y="300" font-family="${SANS}" font-weight="900" font-size="150" fill="${blue}">FIELD</text>
        <text x="10" y="440" font-family="${SANS}" font-weight="900" font-size="150" fill="${red}">WORK</text>
      </g>
      <text x="14" y="530" font-family="${MONO}" font-size="22" letter-spacing="4" fill="${blue}">BRING A BLANKET</text>
    </g>
  `, '#ffffff');
}

/* ------------------------------------------------------------------ */
/* Pale Harbour Tea — packaging & creative direction                   */
/* ------------------------------------------------------------------ */
{
  const pale = '#BCD0D6', navy = '#22314A', cream = '#F3EBDD', rust = '#B5583C';
  const tin = (x, h, body, label, name) => `
    <g transform="translate(${x} ${940 - h})">
      <ellipse cx="150" cy="${h}" rx="170" ry="34" fill="#000" opacity=".3" filter="url(#softer)"/>
      <rect x="0" y="20" width="300" height="${h - 20}" fill="${body}"/>
      <ellipse cx="150" cy="${h}" rx="150" ry="26" fill="${body}"/>
      <rect x="0" y="20" width="300" height="${h - 20}" fill="url(#tinshade)"/>
      <ellipse cx="150" cy="20" rx="150" ry="26" fill="#d9d2c4"/>
      <ellipse cx="150" cy="16" rx="150" ry="26" fill="#ece6da"/>
      <rect x="22" y="${h * 0.32}" width="256" height="${h * 0.44}" fill="${label}"/>
      <rect x="196" y="${h * 0.32 + 14}" width="66" height="78" fill="none" stroke="${rust}" stroke-width="3" stroke-dasharray="5 4"/>
      <circle cx="229" cy="${h * 0.32 + 53}" r="20" fill="${rust}"/>
      <text x="40" y="${h * 0.32 + 52}" font-family="${MONO}" font-size="15" letter-spacing="2" fill="${navy}">PALE HARBOUR</text>
      <text x="38" y="${h * 0.32 + 120}" font-family="${SERIF}" font-style="italic" font-size="46" fill="${navy}">${name}</text>
      <path d="M 40 ${h * 0.32 + 150} q 20 -10 40 0 t 40 0 t 40 0 t 40 0" fill="none" stroke="${navy}" stroke-width="2" opacity=".6"/>
    </g>`;
  const shade = `<defs><linearGradient id="tinshade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset=".25" stop-color="#fff" stop-opacity=".25"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>`;
  art['pale-harbour-tea-1'] = svg(1600, 1200, `${shade}
    <rect width="1600" height="1200" fill="${pale}"/>
    <rect y="920" width="1600" height="280" fill="#A9BEC4"/>
    ${tin(260, 520, navy, cream, 'Fog')}
    ${tin(650, 600, cream, '#E7DCC8', 'Tide')}
    ${tin(1040, 480, rust, cream, 'Ember')}
  `, '#ffffff');
  art['pale-harbour-tea-2'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="#9FB5BC"/>
    <g transform="translate(330 170) rotate(-3)">
      ${shadow(`<rect width="940" height="620" fill="#000"/>`, 18, 28, 0.4)}
      <rect width="940" height="620" fill="${cream}"/>
      <path d="M 0 0 L 470 330 L 940 0" fill="none" stroke="#d8ccb6" stroke-width="4"/>
      <circle cx="470" cy="330" r="62" fill="${rust}"/>
      <text x="470" y="348" text-anchor="middle" font-family="${SERIF}" font-style="italic" font-size="48" fill="${cream}">ph</text>
      <rect x="720" y="40" width="160" height="190" fill="${pale}" stroke="${navy}" stroke-width="3" stroke-dasharray="6 5"/>
      <path d="M 800 80 L 820 190 L 780 190 Z" fill="${navy}"/>
      <rect x="760" y="190" width="80" height="12" fill="${navy}"/>
      <text x="60" y="480" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${navy}">TO: SOMEONE BY THE SEA</text>
      <text x="60" y="530" font-family="${MONO}" font-size="24" letter-spacing="3" fill="${navy}" opacity=".6">LOOSE LEAF · 100 G · FOG</text>
    </g>
  `, '#ffffff');
  art['pale-harbour-tea-3'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${navy}"/>
    ${shadow(`<rect x="500" y="140" width="600" height="720" fill="#000"/>`, 16, 26, 0.5)}
    <rect x="500" y="140" width="600" height="720" fill="${cream}"/>
    ${Array.from({ length: 16 }, (_, k) => `<circle cx="${500 + k * 40}" cy="140" r="11" fill="${navy}"/><circle cx="${500 + k * 40}" cy="860" r="11" fill="${navy}"/>`).join('')}
    ${Array.from({ length: 19 }, (_, k) => `<circle cx="500" cy="${140 + k * 40}" r="11" fill="${navy}"/><circle cx="1100" cy="${140 + k * 40}" r="11" fill="${navy}"/>`).join('')}
    <rect x="560" y="200" width="480" height="520" fill="${pale}"/>
    <rect x="560" y="560" width="480" height="160" fill="#93AEB6"/>
    ${waves(560, 610, 480, cream, 3, 32, 10, 5)}
    <path d="M 770 560 L 790 330 L 830 330 L 850 560 Z" fill="${cream}"/>
    <rect x="782" y="380" width="56" height="26" fill="${rust}"/><rect x="786" y="450" width="48" height="26" fill="${rust}"/>
    <path d="M 776 330 L 810 280 L 844 330 Z" fill="${navy}"/>
    <circle cx="810" cy="304" r="12" fill="#F2C14E"/>
    <text x="800" y="790" text-anchor="middle" font-family="${MONO}" font-size="28" letter-spacing="6" fill="${navy}">PALE HARBOUR · 12</text>
  `, '#ffffff');
}

/* ------------------------------------------------------------------ */
/* Studio photograph placeholder                                       */
/* ------------------------------------------------------------------ */
{
  const desk = '#5C4636';
  const sheet = (x, y, r, w, h, c = '#EFE7D8') => `<g transform="translate(${x} ${y}) rotate(${r})">${shadow(`<rect width="${w}" height="${h}" fill="#000"/>`, 10, 16, 0.4)}<rect width="${w}" height="${h}" fill="${c}"/></g>`;
  art['studio'] = svg(1600, 1000, `
    <rect width="1600" height="1000" fill="${desk}"/>
    ${Array.from({ length: 30 }, (_, k) => `<path d="M 0 ${k * 36 + 8} C 400 ${k * 36 - 6} 900 ${k * 36 + 20} 1600 ${k * 36 + 4}" stroke="#000" stroke-opacity=".08" stroke-width="2" fill="none"/>`).join('')}
    ${sheet(180, 160, -8, 520, 680)}
    <g transform="translate(180 160) rotate(-8)">
      <rect x="50" y="60" width="300" height="40" fill="#1E1C1A"/>
      ${Array.from({ length: 12 }, (_, k) => `<rect x="50" y="${150 + k * 26}" width="${380 - (k % 4) * 40}" height="8" fill="#1E1C1A" opacity=".35"/>`).join('')}
      <rect x="50" y="490" width="420" height="140" fill="#7A2632" opacity=".85"/>
    </g>
    ${sheet(760, 220, 6, 420, 300, '#E8A33D')}
    ${sheet(820, 560, -4, 300, 300, '#2C4FA0')}
    ${sheet(1180, 520, 9, 260, 340, '#F3EEE4')}
    <g transform="translate(1250 230)"><circle r="120" fill="#000" opacity=".35" filter="url(#soft)" transform="translate(14 20)"/><circle r="120" fill="#EDE6DA"/><circle r="86" fill="#3A2416"/><circle r="86" fill="url(#light)" opacity=".5"/></g>
    <g transform="translate(560 860) rotate(-18)"><rect x="0" y="-12" width="520" height="24" fill="#1E1C1A"/><path d="M 520 -12 L 580 0 L 520 12 Z" fill="#D9B98C"/><path d="M 566 -3 L 580 0 L 566 3 Z" fill="#222"/></g>
  `, '#fff1dc');
}

/* ------------------------------------------------------------------ */

for (const [name, data] of Object.entries(art)) {
  writeFileSync(join(out, `${name}.svg`), data.replace(/\n\s+/g, '\n'));
}
console.log(`Wrote ${Object.keys(art).length} sample images to public/work/`);
