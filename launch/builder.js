'use strict';
// Fenton Forge early-access RC: browser-only journey from three words to a portable preview and export.
// No accounts, remote AI, payment processing, managed hosting, network API calls or external requests.

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function hashValue(text) {
  const value = String(text ?? '').toLocaleLowerCase('en-GB');
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000000) / 1000000;
}

const PALETTES = {
  ocean: { bg: '#021016', fg: '#f4fbff', accent: '#34d2cf', muted: '#b9fbff', label: 'Ocean' },
  violet: { bg: '#05050c', fg: '#f8f7ff', accent: '#a479ff', muted: '#d9d0ff', label: 'Violet' },
  ember: { bg: '#130706', fg: '#fff4ea', accent: '#ff936c', muted: '#ffe0b5', label: 'Ember' },
  forest: { bg: '#04120d', fg: '#f2fff8', accent: '#8fdaa6', muted: '#d6f5ec', label: 'Forest' },
  dawn: { bg: '#140a11', fg: '#fff8f8', accent: '#ffcc70', muted: '#ffd9d9', label: 'Dawn' },
  graphite: { bg: '#0b0d10', fg: '#f5f6f8', accent: '#d8dde6', muted: '#c3c9d2', label: 'Graphite' },
  amber: { bg: '#170f01', fg: '#fff8e8', accent: '#ffd166', muted: '#ffeab5', label: 'Amber' },
  frost: { bg: '#04101c', fg: '#f6fbff', accent: '#9fd8ff', muted: '#dff0ff', label: 'Frost' }
};

const LAYOUTS = ['waves', 'particles', 'aurora', 'grid'];
const LAYOUT_STYLES = ['centred', 'editorial'];
const MOTIONS = ['standard', 'calm'];

const WORD_PRESETS = {
  nature: { palette: 'forest', layout: 'waves', speed: 0.80 },
  ocean: { palette: 'ocean', layout: 'waves', speed: 0.82 },
  water: { palette: 'frost', layout: 'waves', speed: 0.78 },
  forest: { palette: 'forest', layout: 'particles', speed: 0.86 },
  future: { palette: 'violet', layout: 'grid', speed: 1.20 },
  futuristic: { palette: 'violet', layout: 'grid', speed: 1.24 },
  modern: { palette: 'graphite', layout: 'grid', speed: 1.05 },
  bright: { palette: 'amber', layout: 'particles', speed: 1.10 },
  warm: { palette: 'ember', layout: 'particles', speed: 0.90 },
  calm: { palette: 'frost', layout: 'waves', speed: 0.58 },
  creative: { palette: 'dawn', layout: 'aurora', speed: 1.12 },
  bold: { palette: 'dawn', layout: 'aurora', speed: 1.18 },
  friendly: { palette: 'amber', layout: 'particles', speed: 0.92 },
  professional: { palette: 'graphite', layout: 'grid', speed: 1.00 },
  precise: { palette: 'graphite', layout: 'grid', speed: 0.70 },
  structured: { palette: 'graphite', layout: 'grid', speed: 0.70 },
  playful: { palette: 'amber', layout: 'particles', speed: 1.10 },
  joyful: { palette: 'dawn', layout: 'particles', speed: 1.10 },
  crazy: { palette: 'dawn', layout: 'aurora', speed: 1.25 },
  cool: { palette: 'violet', layout: 'aurora', speed: 1.10 },
  fun: { palette: 'dawn', layout: 'aurora', speed: 1.20 }
};

const WORLD_LABELS = { waves: 'Glass Tide', particles: 'Playful Forms', aurora: 'Colour Current', grid: 'Quiet Structure' };

function pick(list, hash) {
  return list[Math.floor(hash * list.length) % list.length];
}

function stateFromWords(words) {
  const values = (Array.isArray(words) ? words : [words]).filter(Boolean).slice(0, 3)
    .map(value => String(value).trim().slice(0, 40)).filter(Boolean);
  const matches = values.map(word => {
    const key = word.toLocaleLowerCase('en-GB');
    return Object.hasOwn(WORD_PRESETS, key) ? WORD_PRESETS[key] : null;
  }).filter(Boolean);
  const defaults = ['still', 'balanced', 'modern'];
  const hashes = [0, 1, 2].map(index => hashValue(values[index] || defaults[index]));
  const strongest = key => matches.reduce((best, candidate) => {
    const count = value => matches.filter(match => match[key] === value).length;
    return !best || count(candidate[key]) > count(best[key]) ? candidate : best;
  }, null)?.[key];
  const palette = strongest('palette') || pick(Object.keys(PALETTES), hashes[0]);
  const layout = strongest('layout') || pick(LAYOUTS, hashes[1]);
  const speed = Number((matches.length ? matches.reduce((total, match) => total + match.speed, 0) / matches.length : 0.68 + hashes[2] * 0.72).toFixed(2));
  const seed = Math.round(hashValue(values.join(' ')) * 900000 + 100000);
  return { words: values, palette, layout, layoutStyle: layout === 'grid' || layout === 'waves' ? 'editorial' : 'centred', speed, seed };
}

function validatedState(input = {}) {
  const trimmed = (key, maximum) => String(input[key] ?? '').trim().slice(0, maximum);
  const words = stateFromWords(input.words ?? []).words;
  const email = trimmed('email', 180);
  const accent = trimmed('accent', 7);
  const source = stateFromWords(words);
  const palette = Object.hasOwn(PALETTES, input.palette) ? input.palette : source.palette;
  const layout = LAYOUTS.includes(input.layout) ? input.layout : source.layout;
  const parsedSpeed = Number(input.speed);
  const speed = Number.isFinite(parsedSpeed) && parsedSpeed >= 0.25 && parsedSpeed <= 1.60 ? Math.round(parsedSpeed * 100) / 100 : source.speed;
  const parsedSeed = Number(input.seed);
  const seed = Number.isSafeInteger(parsedSeed) && parsedSeed > 0 && parsedSeed < 1000000 ? parsedSeed : source.seed;
  const layoutStyle = LAYOUT_STYLES.includes(input.layoutStyle) ? input.layoutStyle : source.layoutStyle;
  const motion = MOTIONS.includes(input.motion) ? input.motion : 'standard';

  return {
    name: trimmed('name', 80) || 'Your Organisation',
    headline: trimmed('headline', 130) || 'Welcome to your website',
    about: trimmed('about', 700) || 'Tell visitors what makes your work valuable.',
    services: (Array.isArray(input.services) ? input.services : String(input.services ?? '').split(/\r?\n/)).map(line => String(line).trim().slice(0, 110)).filter(Boolean).slice(0, 8),
    email: /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : '',
    accent: /^#[0-9a-fA-F]{6}$/.test(accent) ? accent : PALETTES[palette].accent,
    palette,
    layout,
    layoutStyle,
    motion,
    speed,
    seed,
    words
  };
}

function sceneStyles(state) {
  const palette = PALETTES[state.palette] || PALETTES.ocean;
  const durations = { waves: ['17.5s', '23.8s'], particles: ['12.8s', '29.2s'], aurora: ['19.6s', '31.1s'], grid: ['24.1s', '18.9s'] };
  return `.scene{position:relative;overflow:hidden;background:radial-gradient(ellipse at 85% 38%,${palette.accent}28,transparent 65%),${palette.bg};color:${palette.fg};padding:50px 0 64px;min-height:0}
.scene-content{position:relative;display:grid;grid-template-columns:1.1fr .9fr;align-items:center;gap:24px;min-height:430px}
.copy{position:relative;z-index:2;width:100%;margin:0;text-align:${state.layoutStyle === 'centred' ? 'center' : 'left'}}
.copy h1{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:clamp(2.8rem,6.3vw,5.4rem);line-height:1.02;letter-spacing:-.055em;overflow-wrap:anywhere}
.copy p{margin-left:${state.layoutStyle === 'centred' ? 'auto' : '0'};margin-right:auto;max-width:34em}
.copy .eyebrow{font-size:.65rem;letter-spacing:.18em}
.scene .button{background:var(--fg);color:var(--bg);border:1px solid var(--accent);border-radius:6px;font-size:.85rem}
.glass-sculpture{position:relative;height:410px;perspective:900px;isolation:isolate}
.glass-sculpture:after{content:'';position:absolute;inset:auto 0 5%;height:18%;background:radial-gradient(ellipse,${palette.accent}35,transparent 65%);transform:scaleY(.4);filter:blur(15px)}
.glass-sculpture span{position:absolute;display:block;inset:9% 8% 10%;border:1px solid ${palette.accent}99;border-radius:48% 48% 42% 42%;background:linear-gradient(128deg,${palette.fg}38,${palette.accent}12 34%,${palette.bg}88 60%,${palette.accent}66);box-shadow:inset 3px 2px 4px ${palette.fg}55,inset -14px -10px 32px ${palette.bg}aa,12px 22px 38px #0006;backdrop-filter:blur(5px);transform:rotate(-22deg) rotateY(-28deg);animation:glassFloat ${parseFloat(durations[state.layout][1]) / state.speed}s ease-in-out infinite alternate}
.glass-sculpture span:nth-child(2){inset:18% 18% 4% 0;transform:rotate(-32deg) rotateY(25deg);animation-delay:-8s;opacity:.8}
.glass-sculpture span:nth-child(3){inset:2% 0 24% 22%;transform:rotate(18deg) rotateY(-18deg);animation-delay:-16s;opacity:.75}
.glass-sculpture .sculpture-label{position:absolute;bottom:0;left:8%;font-size:.6rem;letter-spacing:.2em;color:var(--muted);font-family:system-ui,sans-serif;font-weight:500}
.motion-layer{position:absolute;inset:15% -10%;background:linear-gradient(150deg,transparent 35%,${palette.accent}20 50%,transparent 65%);animation:forgeMotion ${parseFloat(durations[state.layout][0]) / state.speed}s ease-in-out infinite alternate;pointer-events:none}
.motion-layer.secondary{animation-duration:${parseFloat(durations[state.layout][1]) / state.speed}s;opacity:.5;transform:rotate(90deg)}
.scene[data-layout=aurora] .scene-content{grid-template-columns:1fr;min-height:500px}
.scene[data-layout=aurora] .copy{max-width:850px;margin:auto;padding:38px 24px;background:${palette.bg}cc;border:1px solid ${palette.fg}44;border-radius:4px;backdrop-filter:blur(20px)}
.scene[data-layout=aurora] .copy h1{font-family:system-ui,sans-serif;font-weight:850;letter-spacing:-.075em;font-size:clamp(3rem,8vw,6.8rem);line-height:.96}
.scene[data-layout=aurora] .glass-sculpture{position:absolute;inset:0;height:100%;z-index:0}
.scene[data-layout=aurora] .glass-sculpture span{inset:-5% 12%;border-radius:10%;background:linear-gradient(135deg,#ffb65acc,#b148c566 40%,#e64cadbb);transform:rotate(-16deg) rotateY(25deg)}
.scene[data-layout=aurora] .glass-sculpture span:nth-child(2){inset:15% -4% 0 55%;transform:rotate(30deg);background:linear-gradient(40deg,#f9b461cc,#b94fff88)}
.scene[data-layout=aurora] .glass-sculpture span:nth-child(3){inset:10% 60% -10% -5%;transform:rotate(-30deg);background:linear-gradient(90deg,#9c58ffbb,#d649bd88)}
.scene[data-layout=particles] .copy h1{font-family:system-ui,sans-serif;font-weight:800;letter-spacing:-.055em;font-size:clamp(2.8rem,6vw,5rem)}
.scene[data-layout=particles] .glass-sculpture span{inset:9% 10% 15%;border-radius:50%;background:radial-gradient(circle at 30% 22%,${palette.fg}cc,${palette.accent}66 30%,${palette.bg}dd 70%);transform:rotate(-14deg)}
.scene[data-layout=particles] .glass-sculpture span:nth-child(2){inset:42% 38% 0 -2%;transform:rotate(20deg)}
.scene[data-layout=particles] .glass-sculpture span:nth-child(3){inset:0 0 57% 58%}
.scene[data-layout=grid]{background:linear-gradient(90deg,${palette.fg}0c 1px,transparent 1px),linear-gradient(${palette.fg}0c 1px,transparent 1px),${palette.bg};background-size:56px 56px}
.scene[data-layout=grid] .copy{border-left:2px solid var(--accent);padding-left:24px}
.scene[data-layout=grid] .copy h1{font-family:system-ui,sans-serif;font-size:clamp(2.7rem,6vw,5rem);font-weight:350;letter-spacing:-.065em}
.scene[data-layout=grid] .eyebrow{font-family:monospace}
.scene[data-layout=grid] .glass-sculpture span{inset:13% 15%;border-radius:2px;transform:rotate(-12deg) rotateY(-25deg);background:linear-gradient(130deg,${palette.fg}22,${palette.bg}99);animation-name:structureFloat}
.scene[data-layout=grid] .glass-sculpture span:nth-child(2){inset:21% 5% 5% 28%;transform:rotate(8deg) rotateY(-25deg)}
.scene[data-layout=grid] .glass-sculpture span:nth-child(3){inset:0 29% 31% 0;transform:rotate(-25deg) rotateY(-25deg)}
.services-area{padding:36px 0 50px;border-top:1px solid ${palette.fg}22}
.services-area h2{font-size:1.7rem;font-weight:500;letter-spacing:-.035em}
.services-area li{border-top:1px solid ${palette.accent}88;border-radius:3px;font-size:.9rem}
@keyframes glassFloat{from{translate:0 0;rotate:-3deg}to{translate:0 -18px;rotate:5deg}}
@keyframes structureFloat{from{translate:0 0}to{translate:8px -8px}}
@keyframes forgeMotion{from{transform:translateX(-8%) rotate(-8deg)}to{transform:translateX(8%) rotate(8deg)}}
@media(max-width:620px){.scene{padding:28px 0 36px}.scene-content{grid-template-columns:1fr;gap:0;min-height:0}.copy{max-width:none}.copy h1{font-size:clamp(2.8rem,10vw,4.2rem)}.glass-sculpture{height:230px;max-width:360px;width:100%;margin:auto}.scene[data-layout=aurora] .scene-content{min-height:460px}.scene[data-layout=aurora] .copy{padding:32px 18px}.scene[data-layout=aurora] .copy h1{font-size:clamp(3rem,11vw,4.4rem)}}
@media(min-width:480px) and (max-width:620px){.scene-content{grid-template-columns:1.2fr .8fr;gap:10px;min-height:350px}.copy h1{font-size:2.5rem}.glass-sculpture{height:320px}.scene[data-layout=aurora] .scene-content{grid-template-columns:1fr}.scene[data-layout=aurora] .glass-sculpture{height:100%;max-width:none}}
@media(prefers-reduced-motion:reduce){.scene .glass-sculpture span,.scene .motion-layer{animation:none!important;translate:none!important;rotate:none!important}}
.visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}
${state.motion === 'calm' ? '.motion-layer,.glass-sculpture span{animation:none!important}' : ''}`;
}

function dataAttributes(site) {
  const entries = [
    ['layout', site.layout], ['palette', site.palette], ['words', site.words.join(', ')],
    ['name', site.name], ['headline', site.headline], ['about', site.about],
    ['services', site.services.join('\n')], ['email', site.email], ['accent', site.accent],
    ['layout-style', site.layoutStyle], ['motion', site.motion], ['speed', site.speed], ['seed', site.seed]
  ];
  return entries.map(([key, value]) => `data-${key.replace(/[A-Z]/g, character => '-' + character.toLowerCase())}="${escapeHTML(value)}"`).join(' ');
}

function buildHTML(input) {
  const site = validatedState(input);
  const palette = PALETTES[site.palette] || PALETTES.ocean;
  const name = escapeHTML(site.name);
  const upperName = escapeHTML(site.name.toUpperCase());
  const headline = escapeHTML(site.headline);
  const about = escapeHTML(site.about).replace(/\r?\n/g, '<br>');
  const services = site.services.map(line => '<li>' + escapeHTML(line) + '</li>').join('');
  const contact = site.email ? `<a class="button" href="mailto:${encodeURIComponent(site.email)}">Email ${name}</a>`
    : '';
  const words = site.words.map(word => escapeHTML(word)).join(', ');
  const motionSeconds = Math.round(100 / site.speed) / 100;
  const visualNote = site.motion === 'calm'
    ? 'Motion is deliberately reduced and the same layout works with a system preference for reduced motion.'
    : 'The visual environment is created from the selected words. It is deterministic, portable and can be edited in plain HTML.';

  return [
    '<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data:; connect-src \'none\'; base-uri \'none\'; form-action \'none\'">',
    '<title>' + name + '</title><meta name="description" content="' + escapeHTML(site.headline.slice(0, 160)) + '">',
    '<style>:root{--bg:' + palette.bg + ';--fg:' + palette.fg + ';--muted:' + palette.muted + ';--surface:#ffffff10;--accent:' + site.accent + ';--speed:' + motionSeconds + 's}',
    '*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.62 system-ui,-apple-system,"Segoe UI",sans-serif}',
    'a{color:inherit}:focus-visible{outline:3px solid #ffe1a0;outline-offset:4px}.wrap{width:min(1080px,calc(100% - 40px));margin:auto}',
    '.brand{padding:22px 0;font-weight:850;border-bottom:3px solid var(--accent)}',
    '.scene{position:relative;isolation:isolate;padding:clamp(42px,8vw,94px) 0;min-height:520px}',
    '.copy{max-width:' + (site.layoutStyle === 'centred' ? '820px;margin-left:auto;margin-right:auto;text-align:center' : '780px') + '}',
    '.eyebrow{color:var(--accent);font-size:.76rem;font-weight:850;letter-spacing:.13em}',
    '.copy h1{font-size:clamp(2.4rem,6.5vw,5rem);line-height:1.05;letter-spacing:-.05em;margin:14px 0 18px}',
    '.copy p{font-size:clamp(1rem,2vw,1.25rem);color:var(--muted);max-width:700px}',
    '.button{display:inline-block;background:var(--accent);color:#04121a;padding:12px 22px;text-decoration:none;font-weight:800;border-radius:999px;margin-top:18px}',
    '.services-area{padding:64px 0 80px}.services-area ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;list-style:none;padding:0}',
    '.services-area li{background:var(--surface);border-top:3px solid var(--accent);padding:22px;border-radius:12px}',
    'footer{border-top:1px solid #ffffff26;padding:26px 0;color:var(--muted)}',
    '@media(max-width:620px){.copy{padding:24px;text-align:' + (site.layoutStyle === 'centred' ? 'center' : 'left') + '}}',
    '@media(prefers-reduced-motion:reduce){.motion-layer,.motes span{animation:none!important;transform:none!important}}',
    sceneStyles(site),
    '</style></head><body><header class="wrap brand">' + name + '</header>',
    '<main><div class="scene" ' + dataAttributes(site) + '><div class="motion-layer" aria-hidden="true"></div><div class="motion-layer secondary" aria-hidden="true"></div>',
    '<div class="wrap scene-content"><div class="copy"><p class="eyebrow">' + upperName + ' / ' + WORLD_LABELS[site.layout] + '</p><h1>' + headline + '</h1><p>' + about + '</p>' + contact + '</div><div class="glass-sculpture" aria-hidden="true"><span></span><span></span><span></span><b class="sculpture-label">' + WORLD_LABELS[site.layout].toUpperCase() + ' / 01</b></div></div></div>',
    '<section class="wrap services-area"><p class="eyebrow">WHAT WE OFFER</p><h2>What we can do for you</h2><ul>' + services + '</ul></section>',
    '</main><footer><div class="wrap">&copy; ' + new Date().getFullYear() + ' ' + name + ' · Made with Fenton Forge · Visual words: ' + words + '</div></footer>',
    '<p class="visually-hidden">' + visualNote + '</p>'].join('');
}

const DEFAULT_SERVICE_STATE = {
  name: 'Tidal Studio',
  headline: 'Room for the extraordinary.',
  about: 'Thoughtful spaces. Unexpected perspectives. Design that leaves a lasting impression.',
  services: 'Art direction\nSpaces & experiences\nCreative partnerships',
  email: 'hello@example.com',
  accent: '#9fd8ff',
  palette: 'frost',
  layout: 'waves',
  motion: 'standard',
  layoutStyle: 'editorial',
  speed: 0.73,
  seed: 229498,
  words: ['ocean', 'calm', 'water']
};

if (typeof module !== 'undefined') module.exports = { DEFAULT_SERVICE_STATE, escapeHTML, validatedState, stateFromWords, buildHTML, sceneStyles, dataAttributes, PALETTES, LAYOUTS, LAYOUT_STYLES, MOTIONS, WORLD_LABELS };

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('site-form');
    const frame = document.getElementById('site-preview');
    const status = document.getElementById('status');
    const download = document.getElementById('download');
    if (!form || !frame || !status || !download) return;

    const readWords = () => [form.elements.word1.value, form.elements.word2.value, form.elements.word3.value];
    let appliedWords = readWords();

    const read = () => ({
      name: form.elements.name?.value ?? '',
      headline: form.elements.headline?.value ?? '',
      about: form.elements.about?.value ?? '',
      services: form.elements.services?.value ?? '',
      email: form.elements.email?.value ?? '',
      accent: form.elements.accent?.value ?? '',
      palette: form.elements.palette?.value ?? '',
      layout: form.elements.layout?.value ?? '',
      layoutStyle: form.elements.layoutStyle?.value ?? '',
      motion: form.elements.motion?.value ?? '',
      speed: form.elements.speed?.value ?? '',
      words: appliedWords
    });

    function preview() {
      const site = validatedState(read());
      frame.srcdoc = buildHTML(site);
      frame.dataset.layout = site.layout;
      frame.dataset.palette = site.palette;
      frame.dataset.words = site.words.join(', ');
      frame.dataset.name = site.name;
      frame.dataset.headline = site.headline;
      frame.dataset.about = site.about;
      frame.dataset.services = site.services.join('\n');
      frame.dataset.email = site.email;
      frame.dataset.accent = site.accent;
      frame.dataset.layoutStyle = site.layoutStyle;
      frame.dataset.motion = site.motion;
      frame.dataset.speed = site.speed;
      frame.dataset.seed = site.seed;
      const worldName = document.getElementById('world-name');
      if (worldName) worldName.textContent = WORLD_LABELS[site.layout];
      status.textContent = 'Preview refreshed. Your content and visual words stay on this device.';
      return frame.srcdoc;
    }

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (form.reportValidity()) preview();
    });

    download.addEventListener('click', () => {
      if (readWords().join('\n') !== appliedWords.join('\n')) {
        status.textContent = 'Your words have changed. Transform the visual before downloading.';
        document.getElementById('imagine-stage').open = true;
        document.getElementById('transform').focus();
        return;
      }
      if (!form.reportValidity()) return;
      const html = buildHTML(read());
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'fenton-forge-website.html';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1800);
      status.textContent = 'HTML downloaded. It is an independent file you can edit or host anywhere.';
    });

    function applyWords(words) {
      const transformed = stateFromWords(words);
      appliedWords = words.slice();
      form.elements.palette.value = transformed.palette;
      form.elements.layout.value = transformed.layout;
      form.elements.layoutStyle.value = transformed.layoutStyle;
      form.elements.speed.value = transformed.speed;
      form.elements.accent.value = PALETTES[transformed.palette].accent;
      preview();
      const known = transformed.words.filter(word => Object.hasOwn(WORD_PRESETS, word.toLocaleLowerCase('en-GB')));
      status.textContent = WORLD_LABELS[transformed.layout] + ' applied. ' + (known.length ? 'Your recognised words guide this design. ' : 'These words create a repeatable variation, rather than a meaning-based interpretation. ') + 'Add your story next.';
    }

    document.getElementById('transform')?.addEventListener('click', event => {
      event.preventDefault();
      if (![form.elements.word1, form.elements.word2, form.elements.word3].every(field => field.reportValidity() && field.value.trim())) return;
      applyWords(readWords());
      document.getElementById('imagine-stage').open = false;
      document.getElementById('customise-stage').open = true;
      form.elements.name.focus({ preventScroll: true });
    });

    form.addEventListener('invalid', event => {
      const section = event.target.closest('details');
      if (section) section.open = true;
    }, true);

    ['name', 'headline', 'about', 'services', 'email', 'palette', 'layout', 'accent', 'layoutStyle', 'motion', 'speed'].forEach(name => {
      const field = form.elements[name];
      if (field) field.addEventListener('input', preview);
    });

    const wordFields = [form.elements.word1, form.elements.word2, form.elements.word3];
    wordFields.filter(Boolean).forEach(field => field.addEventListener('input', () => {
      status.textContent = 'Words ready? Press Transform the visual to apply them.';
    }));

    document.querySelectorAll('[data-words]').forEach(button => {
      button.addEventListener('click', () => {
        const words = button.dataset.words.split(',');
        wordFields.forEach((field, index) => { field.value = words[index]; });
        applyWords(words);
      });
    });

    const starterWords = {
      agency: ['bold', 'creative', 'modern'],
      'small-business': ['friendly', 'simple', 'useful'],
      'public-sector': ['calm', 'accessible', 'professional']
    };

    document.querySelectorAll('.card[data-category]').forEach(card => {
      card.setAttribute('aria-pressed', 'false');
      card.addEventListener('click', () => {
        const words = starterWords[card.dataset.category];
        if (!words) return;
        document.querySelectorAll('.card[data-category]').forEach(starter => starter.setAttribute('aria-pressed', String(starter === card)));
        form.elements.word1.value = words[0];
        form.elements.word2.value = words[1];
        form.elements.word3.value = words[2];
        applyWords(words);
        document.getElementById('imagine-stage').open = true;
        status.textContent = 'Starting idea selected.';
        document.getElementById('builder')?.scrollIntoView({ block: 'start' });
        form.elements.word1.focus({ preventScroll: true });
      });
    });

    const examples = {
      tide: { words: ['ocean', 'calm', 'water'], description: 'Glass Tide: sculpted glass, spacious serif type, a slow tidal drift.' },
      current: { words: ['crazy', 'cool', 'fun'], description: 'Colour Current: oversized bold type and overlapping coloured glass. Same content, a different composition.' },
      structure: { words: ['precise', 'structured', 'professional'], description: 'Quiet Structure: light architectural type, a measured grid and layered glass planes.' }
    };
    function showExample(key) {
      const example = examples[key];
      const exampleFrame = document.getElementById('example-preview');
      if (!example || !exampleFrame) return;
      exampleFrame.srcdoc = buildHTML({ ...DEFAULT_SERVICE_STATE, ...stateFromWords(example.words), name: 'Tidal Studio', headline: 'Room for the extraordinary.', about: 'Thoughtful spaces. Unexpected perspectives. Design that leaves a lasting impression.', services: 'Art direction\nSpaces & experiences\nCreative partnerships', email: '' , accent: undefined });
      document.getElementById('example-description').textContent = example.description;
      document.querySelectorAll('[data-example]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
    }
    document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => showExample(button.dataset.example)));
    applyWords(readWords());
    showExample('tide');
  });
}
