// Compact chapter card for the four yolow crates: paper → formula → animated diagram → own take.
// Standard library only; each card cycles through its chapters with CSS keyframes.

const W = 380, H = 400, SECONDS = 7;

export function palette(theme) {
  return theme === 'dark'
    ? { bg: '#0d1117', panel: '#161b22', line: '#30363d', text: '#e6edf3', muted: '#9da7b3', accent: '#f0883e', blue: '#58a6ff', green: '#56d364', red: '#ff7b72', soft: '#1f2a37', chip: '#2d1d0f' }
    : { bg: '#ffffff', panel: '#f6f8fa', line: '#d0d7de', text: '#1f2328', muted: '#57606a', accent: '#bc4c00', blue: '#0969da', green: '#1a7f37', red: '#cf222e', soft: '#eaf1fb', chip: '#fff1e5' };
}

export const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Drawing kit bound to one theme; diagrams receive it so they never hard-code colors.
export function kit(c) {
  const t = (x, y, v, cls = 'body', a = 'start', extra = '') => `<text x="${x}" y="${y}" class="${cls}" text-anchor="${a}"${extra}>${esc(v)}</text>`;
  const rect = (x, y, w, h, fill = c.panel, stroke = c.line, rx = 6, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"${extra}/>`;
  const line = (x1, y1, x2, y2, color = c.line, extra = '') => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" fill="none" stroke-width="1.4" ${extra}/>`;
  const dot = (x, y, r = 4, color = c.accent, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"${extra}/>`;
  const trace = (d, col = c.accent, w = 2.2) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" class="trace" pathLength="1"/>`;
  const arrow = (x1, y1, x2, y2) => line(x1, y1, x2, y2, c.blue, 'class="signal" marker-end="url(#arrow)"');
  // A box that fades in; `d` staggers it (0..5) inside the chapter.
  const box = (x, y, w, h, v, { hot = false, d = 0, cls } = {}) =>
    `<g class="step d${d}">${rect(x, y, w, h, hot ? c.soft : c.panel, hot ? c.accent : c.line, 5)}${t(x + w / 2, y + h / 2 + 4.5, v, cls || (hot ? 'hot' : 'mono'), 'middle')}</g>`;
  const step = (inner, d = 0) => `<g class="step d${d}">${inner}</g>`;
  const meter = (x, y, w, h, fill) => `<g class="meter">${rect(x, y, Math.max(w, 0.01), h, fill, 'none', 3)}</g>`;
  const pulse = (inner) => `<g class="pulse">${inner}</g>`;
  return { c, t, rect, line, dot, trace, arrow, box, step, meter, pulse };
}

function css(c, n) {
  const total = n * SECONDS;
  let s = `.bg{fill:${c.bg};stroke:${c.line}}text{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${c.text}}`
    + `.name{font-size:19px;font-weight:700;letter-spacing:-.4px}.tag{font:600 9.5px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:1.4px;fill:${c.accent}}`
    + `.chip{font:600 10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.6px;fill:${c.accent}}.cite{font-size:11px;fill:${c.muted}}`
    + `.heading{font-size:16.5px;font-weight:650;letter-spacing:-.3px}.formula{font:500 12.5px ui-monospace,SFMono-Regular,Menlo,monospace;fill:${c.text}}`
    + `.body{font-size:12px}.take{font-size:11.6px;fill:${c.text}}.takelabel{font:700 9.5px ui-monospace,monospace;letter-spacing:1.2px;fill:${c.green}}`
    + `.small{font-size:10.5px;fill:${c.muted}}.mono{font:11.5px ui-monospace,SFMono-Regular,Menlo,monospace}.hot{font:600 11.5px ui-monospace,SFMono-Regular,Menlo,monospace;fill:${c.accent}}`
    + `.big{font:650 19px ui-monospace,SFMono-Regular,Menlo,monospace}.stat{font:600 11px ui-monospace,monospace;fill:${c.text}}.statmuted{font:11px ui-monospace,monospace;fill:${c.muted}}`
    + `.scene{opacity:0}.scene0{opacity:1}`;
  const f = 1.2;
  for (let i = 0; i < n; i++) {
    const a = (i * 100) / n, b = ((i + 1) * 100) / n;
    const k = i === 0
      ? `0%,${b - f}%{opacity:1}${b}%{opacity:0}${100 - f}%{opacity:0}100%{opacity:1}`
      : `0%,${a}%{opacity:0}${a + f}%,${b - f}%{opacity:1}${b}%,100%{opacity:0}`;
    s += `@keyframes scene${i}{${k}}.scene${i}{animation:scene${i} ${total}s linear infinite}`;
  }
  // Per-chapter staging: steps fade in one after another, meters grow, traces draw.
  const pct = (sec) => (sec * 100) / total;
  s += `@keyframes signalMove{to{stroke-dashoffset:-18}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}`
    + `.meter{transform-box:fill-box;transform-origin:left center}.trace{stroke-dasharray:1}.signal{stroke-dasharray:5 4;animation:signalMove 2.4s linear infinite}.pulse{animation:pulse 1.6s ease-in-out infinite}`;
  for (let d = 0; d < 6; d++) {
    const st = 0.25 + d * 0.55;
    s += `@keyframes st${d}{0%,${pct(st)}%{opacity:0;transform:translateY(5px)}${pct(st + 0.35)}%,100%{opacity:1;transform:none}}`;
  }
  s += `@keyframes meterGrow{0%,${pct(0.9)}%{transform:scaleX(0)}${pct(2)}%,100%{transform:scaleX(1)}}@keyframes traceDraw{0%,${pct(0.6)}%{stroke-dashoffset:1}${pct(2.6)}%,100%{stroke-dashoffset:0}}`;
  for (let i = 0; i < n; i++) {
    const delay = i * SECONDS;
    for (let d = 0; d < 6; d++) s += `.scene${i} .d${d}{animation:st${d} ${total}s ${delay}s infinite both}`;
    s += `.scene${i} .meter{animation:meterGrow ${total}s ${delay}s infinite both}.scene${i} .trace{animation:traceDraw ${total}s ${delay}s infinite both}`;
  }
  s += `@media(prefers-reduced-motion:reduce){.scene,.scene *{animation:none!important}.scene{opacity:0}.scene0{opacity:1}.trace{stroke-dashoffset:0}.signal{stroke-dasharray:none}}`;
  return s;
}

// Formula mini-markup: x_i / x_{ij} → subscript, x^2 / x^{ij} → superscript, rendered with tspans.
function formulaMarkup(src) {
  let out = '', i = 0, plain = '';
  const flush = () => { if (plain) { out += esc(plain); plain = ''; } };
  while (i < src.length) {
    const ch = src[i];
    if ((ch === '_' || ch === '^') && i + 1 < src.length && src[i + 1] !== ' ') {
      let body;
      if (src[i + 1] === '{') { const j = src.indexOf('}', i + 2); body = src.slice(i + 2, j); i = j + 1; }
      else { body = [...src.slice(i + 1)][0]; i += 1 + body.length; }
      flush();
      const dy = ch === '_' ? 0.3 : -0.42;
      out += `<tspan dy="${dy}em" style="font-size:72%">${esc(body)}</tspan><tspan dy="${(-dy * 0.72).toFixed(3)}em">​</tspan>`;
      continue;
    }
    plain += ch; i += 1;
  }
  flush();
  return out;
}
const visibleLength = (src) => src.replace(/[_^]\{([^}]*)\}/g, '$1').replace(/[_^](\S)/g, '$1').length;

// Wrap long text into at most `max` lines of roughly `width` characters.
function wrap(s, width, max) {
  const words = s.split(' '), out = [''];
  for (const w of words) {
    const cur = out[out.length - 1];
    if ((cur + ' ' + w).trim().length > width && cur) out.push(w); else out[out.length - 1] = (cur + ' ' + w).trim();
  }
  if (out.length > max) throw new Error(`text too long for ${max} lines: ${s}`);
  return out;
}

export function renderCard(spec, theme, diagrams) {
  const c = palette(theme), k = kit(c), { t, rect, line } = k;
  const n = spec.chapters.length;
  const label = `${spec.name}: ${spec.chapters.map((ch) => ch.title).join('; ')}`;
  const desc = spec.chapters.map((ch) => `${ch.title}. ${ch.source}. ${ch.formula.replace(/[{}]/g, '')}. ${ch.take}`).join(' ');
  let out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`
    + `<title>${esc(`${spec.name} — ${spec.tag}`)}</title><desc>${esc(desc)}</desc>`
    + `<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="${c.blue}"/></marker></defs>`
    + `<style>${css(c, n)}</style><rect class="bg" x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="12"/>`
    + t(18, 31, spec.name, 'name') + t(W - 18, 29, spec.tag, 'tag', 'end') + line(18, 44, W - 18, 44);
  const formulaText = (f) => {
    const len = visibleLength(f), size = len > 44 ? (12.5 * 44) / len : 12.5;
    return `<text x="${W / 2}" y="123" class="formula" text-anchor="middle" style="font-size:${size.toFixed(2)}px">${formulaMarkup(f)}</text>`;
  };
  spec.chapters.forEach((ch, i) => {
    const draw = diagrams[ch.kind];
    if (!draw) throw new Error(`unknown diagram kind ${ch.kind}`);
    const chipW = 8 + ch.chip.length * 6.6;
    out += `<g class="scene scene${i}">`
      + rect(18, 55, chipW, 17, c.chip, 'none', 4) + t(18 + chipW / 2, 67.5, ch.chip, 'chip', 'middle') + t(24 + chipW, 67.5, ch.source, 'cite')
      + t(18, 95, ch.title, 'heading')
      + rect(18, 105, W - 36, 27, c.panel, c.line, 5) + formulaText(ch.formula)
      + `<g>${draw(k, ch.data || {})}</g>`
      + t(18, 300, 'MY TAKE', 'takelabel');
    wrap(ch.take, 60, 3).forEach((ln, j) => { out += t(18, 316 + j * 15, ln, 'take'); });
    out += t(W - 24 - n * 15, 300, `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, 'small', 'end');
    for (let j = 0; j < n; j++) out += rect(W - 18 - (n - j) * 15 + 3, 295, 12, 3, j === i ? c.accent : c.line, 'none', 1.5);
    out += '</g>';
  });
  out += line(18, 356, W - 18, 356) + t(18, 384, spec.stat, 'stat') + t(18 + spec.stat.length * 6.7 + 6, 384, spec.statNote, 'statmuted');
  return out + '</svg>\n';
}

export const CARD_SIZE = { W, H, SECONDS };
