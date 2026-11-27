// Compact diagrams for the yolow chapter cards. Drawing area: x 18–362, y 140–285.
// Each function takes the theme kit and the chapter's data and returns SVG markup.

export const diagrams = {
  // A bit window split into codes, then a gauge against a gate threshold.
  window({ c, t, rect, box, step, meter, line, arrow }, d) {
    let p = t(18, 152, d.caption, 'small');
    let x = 28;
    d.codes.forEach(([bits, col], g) => {
      [...bits].forEach((b) => {
        const fill = col ? c.soft : c.panel, stroke = col === 'a' ? c.accent : col === 'b' ? c.blue : c.line;
        p += step(rect(x, 160, 24, 28, fill, stroke, 3) + t(x + 12, 179, b, 'mono', 'middle'), g);
        x += 26;
      });
    });
    p += arrow(190, 194, 190, 210) + box(80, 214, 220, 26, d.result, { hot: true, d: 2 });
    const gx = 28, gw = 324;
    p += t(18, 262, d.gauge[0], 'small') + rect(gx, 268, gw, 10, c.panel, c.line, 3) + meter(gx, 268, gw * d.gauge[1], 10, c.green)
      + line(gx + gw * d.gauge[2], 263, gx + gw * d.gauge[2], 283, c.accent, 'stroke-dasharray="3 3"') + t(gx + gw * d.gauge[2] + 4, 262, d.gauge[3], 'hot');
    return p;
  },

  // Horizontal bars (label, value 0..1, right text); optional dashed threshold.
  bars({ c, t, rect, meter, line }, d) {
    const rows = d.rows, h = rows.length > 4 ? 18 : 22, gap = rows.length > 4 ? 6 : 8, top = d.top ?? 146;
    let p = d.caption ? t(18, top, d.caption, 'small') : '';
    rows.forEach(([label, v, right, hot], i) => {
      const y = top + 8 + i * (h + gap);
      const col = hot === true ? c.accent : hot === 'blue' ? c.blue : hot === 'muted' ? c.muted : d.threshold !== undefined ? (v >= d.threshold ? c.green : c.muted) : c.blue;
      p += t(18, y + h / 2 + 4, label, 'mono') + rect(112, y, 176, h, c.panel, c.line, 3) + meter(112, y, 176 * v, h, col) + t(362, y + h / 2 + 4, right ?? `${Math.round(v * 100)}%`, 'mono', 'end');
    });
    if (d.threshold !== undefined) {
      const x = 112 + 176 * d.threshold, y2 = top + 8 + rows.length * (h + gap);
      p += line(x, top + 2, x, y2, c.accent, 'stroke-dasharray="3 3"') + t(x, y2 + 12, d.thresholdLabel, 'hot', 'middle');
    }
    if (d.footer) p += t(190, 282, d.footer, 'small', 'middle');
    return p;
  },

  // Two distributions side by side with a divergence meter.
  kl({ c, t, rect, meter, line, step }, d) {
    let p = t(18, 150, d.caption, 'small');
    const base = 236, bw = 14;
    d.p.forEach((v, i) => {
      const x = 34 + i * 40;
      p += step(rect(x, base - v * 72, bw, v * 72, c.blue, 'none', 2) + rect(x + bw + 2, base - d.q[i] * 72, bw, d.q[i] * 72, c.accent, 'none', 2), Math.min(i, 5));
      p += t(x + bw, base + 13, d.labels[i], 'small', 'middle');
    });
    p += line(26, base, 362, base);
    p += rect(270, 152, 10, 10, c.blue, 'none', 2) + t(285, 161, d.legend[0], 'small') + rect(270, 168, 10, 10, c.accent, 'none', 2) + t(285, 177, d.legend[1], 'small');
    p += t(18, 270, d.gauge[0], 'small') + rect(150, 262, 160, 10, c.panel, c.line, 3) + meter(150, 262, 160 * d.gauge[1], 10, c.green)
      + line(150 + 160 * d.gauge[2], 257, 150 + 160 * d.gauge[2], 277, c.accent, 'stroke-dasharray="3 3"') + t(362, 271, d.gauge[3], 'hot', 'end');
    return p;
  },

  // Code depths clamped to a limit; Kraft sum shown as a filled budget.
  kraft({ c, t, rect, meter, line, step, dot }, d) {
    let p = t(18, 150, d.caption, 'small');
    const base = 238, unit = 5.2;
    d.depths.forEach(([before, after], i) => {
      const x = 30 + i * 30;
      p += rect(x, base - before * unit, 18, before * unit, 'none', c.muted, 2, ' stroke-dasharray="2 2"');
      p += step(rect(x, base - after * unit, 18, after * unit, before > d.limit ? c.accent : c.blue, 'none', 2), Math.min(i, 5));
    });
    const ly = base - d.limit * unit;
    p += line(24, ly, 362, ly, c.accent, 'stroke-dasharray="4 3"') + t(362, ly - 5, `L = ${d.limit}`, 'hot', 'end') + line(24, base, 362, base);
    p += t(18, 262, d.gauge[0], 'small');
    d.gauge[1].forEach((w, i) => { p += step(rect(150 + i * 17, 254, 15, 12, i < d.gauge[2] ? c.green : c.panel, c.line, 2), Math.min(i, 5)); });
    p += t(362, 281, d.gauge[3], 'hot', 'end');
    return p;
  },

  // Integer slot allocation: counts vs allocated cells with one cell moving.
  slots({ c, t, rect, step, line }, d) {
    let p = t(18, 150, d.caption, 'small');
    d.rows.forEach(([label, ideal, cells, move], i) => {
      const y = 158 + i * 26;
      p += t(18, y + 15, label, 'mono') + t(78, y + 15, ideal, 'small');
      for (let j = 0; j < cells; j++) {
        const isMove = move === '+' && j === cells - 1;
        p += step(rect(138 + j * 18, y + 2, 15, 16, isMove ? c.soft : c.blue, isMove ? c.accent : 'none', 2), isMove ? 4 : Math.min(j, 3));
      }
      if (move === '-') p += step(rect(138 + cells * 18, y + 2, 15, 16, 'none', c.muted, 2, ' stroke-dasharray="2 2"'), 3);
      p += t(362, y + 15, move === '+' ? '+1  argmax c/(p+½)' : move === '-' ? '−1  argmin c/(p−½)' : '', move ? 'hot' : 'small', 'end');
    });
    p += t(190, 280, d.footer, 'small', 'middle');
    return p;
  },

  // Shortest-path parse over positions with candidate match edges.
  dag({ c, t, dot, trace, line, step }, d) {
    const xs = [34, 98, 162, 226, 290, 346];
    let p = t(18, 150, d.caption, 'small');
    xs.forEach((x, i) => {
      p += dot(x, 238, 5, i === 0 || i === xs.length - 1 ? c.green : c.muted) + t(x, 256, d.costs[i], 'mono', 'middle');
      if (i < xs.length - 1) p += line(x + 7, 238, xs[i + 1] - 7, 238, c.line);
    });
    d.edges.forEach(([a, b, label, best], i) => {
      const mx = (xs[a] + xs[b]) / 2, apex = 232 - 16 * (b - a), cy = 2 * apex - 232;
      p += best ? trace(`M${xs[a]} 232 Q${mx} ${cy} ${xs[b]} 232`, c.accent) : step(`<path d="M${xs[a]} 232 Q${mx} ${cy} ${xs[b]} 232" fill="none" stroke="${c.muted}" stroke-width="1.2" stroke-dasharray="3 3"/>`, i);
      p += step(t(mx, apex - 5, label, best ? 'hot' : 'small', 'middle'), i);
    });
    p += t(190, 280, d.footer, 'small', 'middle');
    return p;
  },

  // SWAR: eight tags in one u64, matching lanes produce a bitmask.
  swar({ c, t, box, step, arrow }, d) {
    let p = t(18, 150, d.caption, 'small');
    d.tags.forEach((v, i) => {
      const x = 22 + i * 43, hit = v === d.target;
      p += box(x, 160, 38, 28, v, { hot: hit, d: hit ? 2 : 0 }) + step(t(x + 19, 206, hit ? '1' : '0', hit ? 'hot' : 'mono', 'middle'), hit ? 3 : 1);
    });
    p += arrow(190, 214, 190, 230) + box(48, 234, 284, 26, d.result, { hot: true, d: 4 });
    p += t(190, 280, d.footer, 'small', 'middle');
    return p;
  },

  // Adaptive skipping: probe positions spread out as the miss run grows.
  skip({ c, t, line, dot, step, rect }, d) {
    let p = t(18, 150, d.caption, 'small');
    p += rect(22, 186, 340, 18, c.panel, c.line, 3);
    d.probes.forEach((x, i) => {
      p += step(line(22 + x, 176, 22 + x, 212, i < d.probes.length - 1 ? c.blue : c.green) + dot(22 + x, 176, 3.2, i < d.probes.length - 1 ? c.blue : c.green), Math.min(Math.floor(i / 2), 5));
    });
    p += t(22, 228, 'anchor', 'small') + t(362, 228, d.hitLabel, 'hot', 'end');
    d.steps.forEach(([label, w], i) => { p += step(t(22 + i * 86, 252, label, 'mono') + rect(22 + i * 86, 258, w, 6, c.accent, 'none', 2), i + 1); });
    p += t(190, 282, d.footer, 'small', 'middle');
    return p;
  },

  // Generic positioned boxes and arrows: nodes [x, y, w, h, label, hot, delay], arrows [x1, y1, x2, y2].
  flow({ t, box, arrow, step }, d) {
    let p = d.caption ? t(18, 150, d.caption, 'small') : '';
    d.nodes.forEach(([x, y, w, h, label, hot, dl]) => { p += box(x, y, w, h, label, { hot, d: dl ?? 0 }); });
    (d.arrows || []).forEach((a) => { p += arrow(...a); });
    (d.notes || []).forEach(([x, y, v, cls, anchor, dl]) => { p += step(t(x, y, v, cls || 'small', anchor || 'start'), dl ?? 0); });
    return p;
  },

  // Three bytes → 24 bits → four sextets → four characters.
  bitsplit({ c, t, rect, box, step, arrow }, d) {
    let p = t(18, 150, d.caption, 'small');
    d.bytes.forEach((b, i) => { p += box(30 + i * 110, 157, 100, 22, b, { d: 0 }); });
    const bits = d.bits.replace(/ /g, '');
    [...bits].forEach((b, i) => {
      const g = Math.floor(i / 6);
      p += step(rect(30 + i * 13.33, 186, 12, 18, c.soft, g % 2 ? c.blue : c.accent, 2) + t(36 + i * 13.33, 199, b, 'small', 'middle'), 1);
    });
    d.sextets.forEach(([v, ch], i) => {
      const x = 30 + i * 80 + 40;
      p += step(t(x, 222, v, 'mono', 'middle'), 2) + arrow(x, 227, x, 238) + box(x - 22, 241, 44, 22, ch, { hot: true, d: 3 });
    });
    p += step(t(190, 281, d.footer, 'small', 'middle'), 4);
    return p;
  },

  // 16-entry nibble table with a few occupied slots, then example bytes checked against it.
  lut({ c, t, rect, step, box }, d) {
    let p = t(18, 150, d.caption, 'small');
    for (let i = 0; i < 16; i++) {
      const v = d.slots[i], x = 22 + i * 21.5;
      p += step(rect(x, 158, 19, 30, v ? c.soft : c.panel, v ? c.accent : c.line, 3) + t(x + 9.5, 170, i.toString(16).toUpperCase(), 'small', 'middle') + (v ? t(x + 9.5, 183, v, 'hot', 'middle') : ''), v ? 1 : 0);
    }
    d.checks.forEach(([label, ok], i) => {
      p += box(22 + i * 116, 204, 108, 24, label, { hot: ok, d: 2 + i });
    });
    p += step(t(190, 250, d.result, 'hot', 'middle'), 5) + t(190, 281, d.footer, 'small', 'middle');
    return p;
  },

  // A function curve with a marked point and optional row of numbers under it.
  curve({ c, t, line, trace, dot, step }, d) {
    const x0 = 34, x1 = 356, y0 = 236, y1 = 166;
    const X = (u) => x0 + (x1 - x0) * u, Y = (v) => y0 - (y0 - y1) * v;
    let p = t(18, 150, d.caption, 'small') + line(x0, y0, x1, y0) + line(x0, y1 - 4, x0, y0);
    p += trace(d.pts.map(([u, v], i) => `${i ? 'L' : 'M'}${X(u).toFixed(1)} ${Y(v).toFixed(1)}`).join(' '), c.blue);
    if (d.mark) {
      const [u, v, label] = d.mark;
      p += step(line(X(u), Y(v), X(u), y0, c.accent, 'stroke-dasharray="3 3"') + line(x0, Y(v), X(u), Y(v), c.accent, 'stroke-dasharray="3 3"') + dot(X(u), Y(v), 4.5) + (u > 0.6 ? t(X(u) - 6, Y(v) - 18, label, 'hot', 'end') : t(X(u) + 8, Y(v) - 6, label, 'hot')), 2);
    }
    p += t(x1, y0 + 13, d.xlabel, 'small', 'end') + t(x0 - 4, y1 + 4, d.ylabel, 'small', 'end');
    (d.row || []).forEach(([a, b], i) => { p += step(t(34 + i * 112, 266, a, 'small') + t(34 + i * 112, 281, b, 'stat'), 3 + i); });
    return p;
  },

  // All 256 byte values: valid alphabet, padding and invalid bytes.
  grid256({ c, t, rect, step }, d) {
    let p = '';
    const valid = new Set([...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'].map((ch) => ch.charCodeAt(0)));
    for (let r = 0; r < 16; r++) {
      let row = '';
      for (let col = 0; col < 16; col++) {
        const b = r * 16 + col, fill = valid.has(b) ? c.green : b === 61 ? c.muted : c.red;
        row += rect(22 + col * 8.6, 146 + r * 8.6, 7.4, 7.4, fill, 'none', 1.2, valid.has(b) ? '' : ' opacity=".55"');
      }
      p += step(row, Math.min(Math.floor(r / 3), 5));
    }
    d.notes.forEach(([v, cls], i) => { p += step(t(172, 160 + i * 21, v, cls), Math.min(i + 1, 5)); });
    return p;
  },

  // Exhaustive search tree whose leaves are all unsatisfiable.
  unsat({ c, t, line, dot, step, box }, d) {
    let p = t(18, 150, d.caption, 'small');
    const levels = [[190], [110, 270], [70, 150, 230, 310], [50, 90, 130, 170, 210, 250, 290, 330]], ys = [166, 194, 222, 250];
    levels.forEach((xs, l) => {
      xs.forEach((x, i) => {
        if (l) p += step(line(levels[l - 1][Math.floor(i / 2)], ys[l - 1] + 5, x, ys[l] - 5, c.line), l);
        p += step(l === 3 ? t(x, ys[l] + 4, '✗', 'hot', 'middle') : dot(x, ys[l], 4.5, c.blue), l);
      });
    });
    p += box(110, 263, 160, 22, d.result, { hot: true, d: 4 });
    return p;
  },

  // Bootstrap histogram of a paired difference with its 95% interval.
  hist({ c, t, rect, line, step }, d) {
    let p = t(18, 150, d.caption, 'small');
    const base = 240, bw = 13;
    d.heights.forEach((h, i) => {
      const x = 40 + i * (bw + 2), inCi = i >= d.ci[0] && i <= d.ci[1];
      p += step(rect(x, base - h * 70, bw, h * 70, inCi ? c.blue : c.muted, 'none', 1.5, inCi ? '' : ' opacity=".5"'), Math.min(Math.floor(i / 4), 4));
    });
    const lx = 40 + d.ci[0] * (bw + 2), rx = 40 + d.ci[1] * (bw + 2) + bw, zx = 40 + d.zero * (bw + 2);
    p += line(30, base, 362, base) + line(zx, 158, zx, base, c.muted, 'stroke-dasharray="3 3"') + t(zx, base + 13, '0', 'small', 'middle');
    p += step(line(lx, 252, rx, 252, c.accent) + line(lx, 247, lx, 257, c.accent) + line(rx, 247, rx, 257, c.accent) + t((lx + rx) / 2, 270, d.ciLabel, 'hot', 'middle'), 5);
    p += t(362, 170, d.right, 'small', 'end');
    return p;
  },

  // Page wireframe whose blocks are shaded by a density score.
  heat({ c, t, rect, step }, d) {
    let p = t(18, 150, d.caption, 'small') + rect(22, 158, 220, 124, c.panel, c.line, 4);
    d.blocks.forEach(([x, y, w, h, v, label], i) => {
      p += step(rect(22 + x, 158 + y, w, h, v > 0.6 ? c.green : v > 0.3 ? c.blue : c.muted, 'none', 2, ` opacity="${(0.25 + v * 0.75).toFixed(2)}"`) + (label ? t(22 + x + w / 2, 158 + y + h / 2 + 4, label, 'small', 'middle') : ''), Math.min(i, 5));
    });
    d.legend.forEach(([v, label], i) => { p += step(t(254, 174 + i * 29, v, 'stat') + t(254, 187 + i * 29, label, 'small'), Math.min(i + 1, 5)); });
    return p;
  },

  // Signed per-block scores with the maximum-sum contiguous run highlighted.
  mss({ c, t, rect, line, step }, d) {
    let p = t(18, 150, d.caption, 'small');
    const mid = 212, k = 3.2;
    d.scores.forEach((s, i) => {
      const x = 26 + i * 21, inRun = i >= d.run[0] && i <= d.run[1];
      const h = Math.abs(s) * k, y = s >= 0 ? mid - h : mid;
      p += step(rect(x, y, 16, Math.max(h, 1), inRun ? c.green : s >= 0 ? c.blue : c.red, 'none', 2, inRun ? '' : ' opacity=".6"'), Math.min(Math.floor(i / 3), 4));
    });
    const lx = 26 + d.run[0] * 21, rx = 26 + d.run[1] * 21 + 16;
    p += line(22, mid, 362, mid) + step(rect(lx - 3, 158, rx - lx + 6, 104, 'none', c.accent, 4, ' stroke-dasharray="4 3"') + t((lx + rx) / 2, 276, d.runLabel, 'hot', 'middle'), 5);
    return p;
  },

  // Oblivious tree: five threshold bits address a leaf.
  tree({ t, box, arrow }, d) {
    let p = t(18, 150, d.caption, 'small');
    d.bits.forEach((b, i) => {
      const x = 22 + i * 69;
      p += box(x, 160, 60, 40, `${d.tests[i]}`, { d: i }) + box(x + 18, 206, 24, 20, b, { hot: b === '1', d: i });
    });
    p += arrow(190, 232, 190, 246) + box(90, 250, 200, 26, d.result, { hot: true, d: 5 });
    return p;
  },

  // Two-state Viterbi lattice with the decoded path.
  viterbi({ c, t, line, dot, trace, step }, d) {
    const xs = [70, 142, 214, 286, 352];
    const [s1, s0] = d.states || ['keep', 'drop'];
    let p = t(18, 150, d.caption, 'small') + t(18, 186, s1, 'small') + t(18, 242, s0, 'small');
    xs.forEach((x, i) => {
      if (i < xs.length - 1) for (const y of [182, 238]) for (const z of [182, 238]) p += line(x, y, xs[i + 1], z, c.line);
      p += dot(x, 182, 5, c.muted) + dot(x, 238, 5, c.muted) + t(x, 258, d.labels[i], 'small', 'middle') + t(x, 272, d.scores[i], 'mono', 'middle');
    });
    p += trace(d.path.map((s, i) => `${i ? 'L' : 'M'}${xs[i]} ${s ? 182 : 238}`).join(' '), c.green, 2.6);
    d.path.forEach((s, i) => { p += step(dot(xs[i], s ? 182 : 238, 5, c.green), Math.min(i + 1, 5)); });
    p += step(t(214, 168, d.note, 'hot', 'middle'), 5);
    return p;
  },

  // Before → after rows for an evaluation, with a p-value per row.
  delta({ c, t, rect, meter, step }, d) {
    let p = t(18, 150, d.caption, 'small');
    const lo = d.range[0], span = d.range[1] - d.range[0], X = (v) => 150 + ((v - lo) / span) * 150;
    d.rows.forEach(([label, before, after, pval], i) => {
      const y = 160 + i * 40;
      p += t(18, y + 12, label, 'mono') + rect(150, y, 150, 8, c.panel, c.line, 3) + `<g class="meter">${rect(150, y, X(before) - 150, 8, c.muted, 'none', 3)}</g>`
        + rect(150, y + 12, 150, 8, c.panel, c.line, 3) + meter(150, y + 12, X(after) - 150, 8, c.green)
        + step(t(306, y + 8, before.toFixed(4), 'small') + t(306, y + 21, after.toFixed(4), 'stat'), i + 1) + step(t(18, y + 27, `p = ${pval}`, 'hot'), i + 2);
    });
    return p;
  },

  // A page split by recursive X-Y cuts: spanning row first, then the column gutter.
  xycut({ c, t, rect, line, step }, d) {
    let p = t(18, 150, d.caption, 'small') + rect(90, 156, 200, 128, c.panel, c.line, 4);
    p += step(rect(104, 164, 172, 12, c.soft, c.blue, 2) + rect(118, 181, 144, 7, c.muted, 'none', 2, ' opacity=".5"'), 0);
    for (let col = 0; col < 2; col++) for (let j = 0; j < 7; j++) p += step(rect(104 + col * 90, 200 + j * 11, 82 - (j === 6 ? 30 : 0), 6, c.muted, 'none', 2, ' opacity=".7"'), 1);
    p += step(line(96, 193, 284, 193, c.accent, 'stroke-dasharray="4 3"') + t(296, 197, '① Y-cut', 'hot'), 2);
    p += step(line(190, 197, 190, 280, c.accent, 'stroke-dasharray="4 3"') + t(296, 240, '② gutter', 'hot'), 3);
    p += step(t(84, 172, '1', 'stat', 'end') + t(84, 230, '2', 'stat', 'end') + t(296, 262, '3 → right col', 'small'), 4);
    return p;
  },

  // Several pages whose running header keeps folio − page index constant.
  pages({ c, t, rect, step }, d) {
    let p = t(18, 150, d.caption, 'small');
    d.pages.forEach(([header, idx], i) => {
      const x = 22 + i * 86;
      p += step(rect(x, 158, 76, 88, c.panel, c.line, 3) + rect(x, 158, 76, 16, c.soft, c.accent, 3) + t(x + 38, 170, header, 'hot', 'middle')
        + [0, 1, 2, 3, 4].map((j) => rect(x + 8, 184 + j * 11, 60 - (j === 4 ? 22 : 0), 5, c.muted, 'none', 2, ' opacity=".55"')).join('')
        + t(x + 38, 260, `page ${idx}`, 'small', 'middle'), i);
    });
    p += step(t(190, 280, d.result, 'hot', 'middle'), 5);
    return p;
  },

  // Binomial intervals per page against a threshold δ.
  intervals({ c, t, line, dot, step }, d) {
    let p = t(18, 150, d.caption, 'small');
    const X = (v) => 120 + v * 240;
    d.rows.forEach(([label, lo, est, hi, flag], i) => {
      const y = 172 + i * 28, col = flag ? c.red : c.green;
      p += t(18, y + 4, label, 'mono') + step(line(X(lo), y, X(hi), y, col) + line(X(lo), y - 5, X(lo), y + 5, col) + line(X(hi), y - 5, X(hi), y + 5, col) + dot(X(est), y, 3.5, col) + t(362, y + 4, flag ? 're-route' : 'keep', flag ? 'hot' : 'small', 'end'), i + 1);
    });
    const dx = X(d.delta);
    p += line(dx, 158, dx, 258, c.accent, 'stroke-dasharray="3 3"') + t(dx, 272, d.deltaLabel, 'hot', 'middle');
    return p;
  },

  // A glyph in text space mapped to rotated page space.
  geometry({ c, t, rect, line, arrow, step }, d) {
    let p = t(18, 150, d.caption, 'small') + rect(22, 160, 120, 110, c.panel, c.line, 4) + line(38, 252, 128, 252) + line(38, 252, 38, 172);
    p += step(rect(58, 190, 46, 48, c.soft, c.accent, 3) + t(81, 223, 'A', 'big', 'middle'), 0);
    p += arrow(150, 214, 222, 214) + step(t(186, 204, d.op, 'hot', 'middle'), 1);
    p += rect(230, 160, 130, 110, c.panel, c.line, 4);
    p += step(`<g transform="translate(272 186) rotate(-${d.angle})">${rect(0, 0, 46, 48, c.soft, c.blue, 3)}${t(23, 33, 'A', 'big', 'middle')}</g>`, 2);
    p += t(82, 284, 'text space', 'small', 'middle') + t(295, 284, 'page space', 'small', 'middle');
    return p;
  },
};
