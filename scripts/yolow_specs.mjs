// Chapter content for the four yolow cards. Every source, constant and threshold is taken from the
// linked repository (file references in comments); diagrams use small illustrative examples.

export const yolowzstd = {
  slug: 'yolowzstd',
  name: 'yolowzstd',
  tag: 'INFORMATION THEORY × CACHE',
  stat: '1.74× libzstd decode',
  statNote: '64 B frames · repo benchmark',
  chapters: [
    { // src/huff.rs:9-11,148,186-193,445
      chip: 'PAPER', source: 'Moffat & Turpin (1997)', title: 'Two symbols per table lookup',
      formula: 'P = Σ_l m(l) · Σ m(l′) [l + l′ ≤ 12] ≥ 45%', kind: 'window',
      data: { caption: '12-bit window into the Huffman bitstream', codes: [['010', 'a'], ['1101', 'b'], ['01100', null]], result: '1 lookup → 2 symbols · 7 bits', gauge: ['P(pair fits) · example 62%', 0.62, 0.45, 'gate 45%'] },
      take: 'The gate is computed exactly from the code tree; the 16 KiB pair table (4096 × u32) is built lazily and reused by Repeat blocks.',
    },
    { // src/henc.rs:79,134-170,462
      chip: 'PAPER', source: 'Moffat & Katajainen (1995)', title: 'Limit code length, keep Kraft exact',
      formula: 'Σ 2^{L − depth} = 2^L,   L = 11', kind: 'kraft',
      data: { caption: 'Huffman depths before (dashed) and after the limit', limit: 11, depths: [[2, 2], [4, 4], [5, 5], [7, 7], [9, 9], [13, 11], [14, 11], [12, 11], [10, 10], [11, 11], [8, 9]], gauge: ['Kraft budget 2^11', Array(10).fill(1), 10, 'sum = 2¹¹ exactly'] },
      take: 'Clamp every depth, then lengthen and shorten codes until the budget is exactly full — zero heap allocation, tested on deep Fibonacci trees.',
    },
    { // src/entropy.rs:67,98-166
      chip: 'PAPER', source: 'Gross (1956) · Duda (2013) · RFC 8878', title: 'Quantize with the least KL loss',
      formula: 'min −Σ c_i log₂(p_i / 2^L)   s.t.  Σ p_i = 2^L', kind: 'slots',
      data: { caption: 'ideal share c·2^L / n   →   integer table cells', rows: [['A', '8.67', 9, ''], ['B', '4.50', 4, '-'], ['C', '2.17', 2, ''], ['D', '0.67', 1, '']], footer: '2⁴ = 16 cells · Sainte-Laguë start, then greedy KKT moves' },
      take: 'Every move is integer cross-multiplication — no floats, no division. A symbol worth under half a cell gets the RFC “−1” marker.',
    },
    { // src/henc.rs:439-448,471,523
      chip: 'THEORY', source: 'Shannon entropy · KL divergence', title: 'Reuse the old tree when KL is small',
      formula: 'n·D_{KL}(p‖q) = n·H(p,q) − n·H(p) ≤ 280 bit', kind: 'kl',
      data: { caption: 'literal histogram vs the previous block’s tree', labels: ['e', 't', 'a', 'o', 'n', 's', 'r', 'h'], p: [0.9, 0.62, 0.5, 0.44, 0.36, 0.3, 0.26, 0.2], q: [0.84, 0.66, 0.46, 0.46, 0.32, 0.3, 0.3, 0.18], legend: ['this block p', 'previous tree q'], gauge: ['n·D_KL · example', 0.32, 0.62, '≤ 280 bits → Repeat'] },
      take: 'Decide before building: store raw when n·Ĥ cannot beat the bytes; reuse the previous tree when its extra cost stays under 280 bits.',
    },
    { // src/opt/stats.rs:49-149
      chip: 'INSPIRED BY', source: 'Zopfli · Zstd btultra', title: 'An online price list in ⅛-bit units',
      formula: 'cost(s) = 8·(log₂Σc − log₂c_s),  clamp 4…96', kind: 'bars',
      data: { caption: 'symbol frequency → price per symbol (⅛ bit)', rows: [['e', 0.8, '11 ⅛b'], ['t', 0.44, '17 ⅛b'], ['a', 0.24, '24 ⅛b'], ['q', 0.04, '45 ⅛b', true]], footer: 'counts halve each block · +2 per observation · rebuilt every 256 seq' },
      take: 'Priors start at 2× the RFC predefined counts, so the first block already has sane prices; decay ½ keeps the model local.',
    },
    { // src/opt/mod.rs:12-13,74-79,416-438; src/opt/stats.rs:145-149
      chip: 'INSPIRED BY', source: 'Zopfli · btultra · BT4 (Pavlov, Collet)', title: 'Parse for bits, not for length',
      formula: 'D[i+ℓ] = min(D[i] + C_{of} + C_{ml}(ℓ) + C_{ll})', kind: 'dag',
      data: { caption: 'positions with cheapest known cost (⅛ bit)', costs: ['0', '9', '17', '21', '30', '34'], edges: [[0, 2, 'match 17', false], [1, 4, 'match 26', false], [0, 3, 'match 21', true], [3, 5, 'rep 13', true]], footer: 'Pareto pruning · 4096-position chunks sized for a 256 KiB L2' },
      take: 'Literal costs telescope exactly (Δ = C(ll+1) − C(ll)), and each longer candidate only relaxes lengths above the previous one.',
    },
    { // src/row.rs:4-54,124-129,196-200,308,450-470
      chip: 'PAPER', source: 'SwissTable 2017 · Zstd row hash 2021 · Warren', title: 'Eight tag compares in one u64',
      formula: 'x = row ⊕ splat(tag)  →  zero-byte mask', kind: 'swar',
      data: { caption: 'a row of eight one-byte tags vs tag 0x2A', tags: ['2A', '19', '2A', '04', 'B3', '2A', '12', '88'], target: '2A', result: 'mask 10100100 → verify 3 candidates', footer: 'mask = (m · 0x0002040810204081) ≫ 56' },
      take: 'Hash 5-byte prefixes to dodge 4-gram Zipf saturation; a separate exact 4-byte near table has zero false positives.',
    },
    { // src/lz/fast.rs:229-258; README.md:78; CHANGELOG.md:20
      chip: 'MY READING', source: 'Wald (1945) sequential analysis', title: 'Skip faster as the evidence grows',
      formula: 'step = 2 + ((i − anchor) ≫ 4)', kind: 'skip',
      data: { caption: 'match probes after the last match (anchor)', probes: [0, 8, 16, 24, 32, 44, 56, 68, 84, 100, 116, 136, 156, 180, 204, 232, 262, 296, 334], hitLabel: 'match ✓', steps: [['step 2', 8], ['step 3', 12], ['step 4', 16], ['step 5', 20]], footer: 'L1 encode 242.2 → 284.2 MB/s (CHANGELOG)' },
      take: 'Wald’s idea read as a rule of thumb: a longer miss run is stronger evidence of incompressible data, so probe wider.',
    },
  ],
};

const range = (n, f) => Array.from({ length: n + 1 }, (_, i) => f(i / n));

export const yolow64 = {
  slug: 'yolow64',
  name: 'yolow64',
  tag: 'BIT ALGEBRA × SIMD',
  stat: '101.4 GB/s decode',
  statNote: '16 KiB · one Zen 5 core (VM)',
  chapters: [
    { // src/avx512/encode_asm.rs:5-8,20,33-42,201-202; README.md:22
      chip: 'SPEC', source: 'RFC 4648 Base64 · AVX-512 VBMI', title: 'One multishift, eight sextets',
      formula: 'sextet_j = (g ≫ s_j) & 63,  s = 42, 36, …, 0', kind: 'bitsplit',
      data: { caption: '“Man” → 24 bits → four 6-bit indices → “TWFu”', bytes: ['M · 0x4D', 'a · 0x61', 'n · 0x6E'], bits: '010011010110000101101110', sextets: [['19', 'T'], ['22', 'W'], ['5', 'F'], ['46', 'u']], footer: 'vpmultishiftqb → vpermb · 48 B in, 64 chars out' },
      take: 'Six bytes per qword are gathered in reverse, and a 192 B block is read as three 64 B loads bridged by vpermi2b — zero read overhang.',
    },
    { // src/avx512/whitespace.rs:3-6,108-135; src/avx2/whitespace.rs:3-55
      chip: 'PAPER', source: 'simdjson (VLDB 2019) · Polychroniou et al. (2015)', title: 'Whitespace in two instructions',
      formula: 'ws(b)  ⇔  LUT[b & 0xF] = b', kind: 'lut',
      data: { caption: 'one 16-entry table, indexed by the low nibble', slots: ['20', '', '', '', '', '', '', '', '', '09', '0A', '', '', '0D', '', ''], checks: [['0x20 ✓', true], ['0x0A ✓', true], ['0x2D ✗', false]], result: 'LUT[0xD] = 0x0D ≠ 0x2D → not whitespace', footer: 'vpshufb zeroes bytes ≥ 0x80, so no extra range check' },
      take: 'Comparing the table to the byte itself replaces a 7-instruction classifier; AVX-512 compacts with register vpcompressb and full 64 B stores.',
    },
    { // src/avx512/whitespace.rs:8; benchmarks/cross-arch.md:48-50
      chip: 'THEORY', source: 'maximum-entropy branch point', title: 'Where a branch becomes a coin flip',
      formula: '(1 − p)^{64} = ½   ⇒   p = 1 − 2^{−1/64} ≈ 1.08%', kind: 'curve',
      data: { caption: 'P(a 64 B block has no whitespace) vs density p', pts: range(40, (u) => [u, Math.pow(1 - u * 0.06, 64)]), mark: [0.18, 0.5, 'p ≈ 1.08%'], xlabel: 'p → 6%', ylabel: '1', row: [['0% ws', '121.7 GB/s'], ['1.5% ws', '120.7 GB/s'], ['10% ws', '119.8 GB/s']] },
      take: 'Real text sits near the coin flip, so the filter is branch-free: throughput stays flat across densities (Zen 5, 4 KiB).',
    },
    { // src/avx2/decode_asm.rs:10-29,47-66; CHANGELOG.md:43
      chip: 'THEORY', source: 'De Morgan · nibble validation (moego)', title: 'Validate with one and-not',
      formula: 'bad = ¬V ∧ H,   sextet = min(c + roll, 63)', kind: 'flow',
      data: { caption: 'two nibble lookups decide validity for 32 bytes', nodes: [[22, 160, 104, 26, 'V = lo[c & 0xF]', false, 0], [22, 200, 104, 26, 'H = hi[c ≫ 4]', false, 1], [158, 180, 84, 26, 'vpandn', true, 2], [272, 180, 90, 26, 'error lanes', true, 3], [22, 246, 340, 24, '“/” → 66 → vpminub 63 → 63', false, 4]], arrows: [[128, 173, 156, 189], [128, 213, 156, 197], [244, 193, 270, 193]], notes: [] },
      take: '5 → 4 vpshufb per 32 B block, 12 uops, 4.0 cycles; errors accumulate with saturating vpaddusb on ports 0/1 instead of vpor.',
    },
    { // src/avx512/decode_vbmi_asm.rs:6-21; decode_bw_asm.rs:7,218
      chip: 'MY PROOF', source: 'exhaustive over all 256 byte values', title: 'One sign bit catches every bad byte',
      formula: 'v = T[c & 0x7F];  err |= c ∨ v;  bad ⇔ MSB(err)', kind: 'grid256',
      data: { notes: [['all 256 inputs, 16 × 16', 'small'], ['green: 64 alphabet bytes', 'small'], ['red: 192 others → MSB set', 'small'], ['T needs only 128 entries;', 'small'], ['c ≥ 0x80 fails on c itself', 'hot'], ['BW: one vpternlogd', 'mono']] },
      take: 'A 128-entry table plus one OR covers the whole byte domain, so validation never needs a second pass over the data.',
    },
    { // research/encode-counters.md:259-261,325-333,508-521; src/cpu.rs:138-140,221-232
      chip: 'MY DERIVATION', source: 'working-set model · research/encode-counters', title: 'Stream when 7N/3 outgrows the LLC',
      formula: 'N + 4N/3 = 7N/3 > C   ⇒   stream at N ≥ 3C/7', kind: 'bars',
      data: { caption: 'DRAM bytes moved per input byte (encode)', rows: [['cached', 1, '3.667 B/B', 'muted'], ['streaming', 0.636, '2.333 B/B', true], ['16 MiB before', 0.57, '7.36 GB/s', 'muted'], ['16 MiB after', 1, '13.0 GB/s', 'blue']], footer: 'floor = max(3/7 · LLC, 64 KiB) → 6.857 MiB on a 16 MiB L3' },
      take: 'Not a tuned constant — it follows from the 4/3 output expansion. Measured 1.77× at 16 MiB, beyond the 1.571× traffic ratio.',
    },
    { // research/decode.md:182-190
      chip: 'MY PROOF', source: 'exhaustive DFS + z3 · research/decode.md', title: 'Proving a shortcut cannot exist',
      formula: '¬∃ T_1, T_2 :  5 offsets ✓  ∧  192 invalid ✗', kind: 'unsat',
      data: { caption: 'every two-shuffle table pair, searched exhaustively', result: 'all branches UNSAT' },
      take: 'Self-validating two-table decode looked tempting; the solver showed it is impossible, so the validation step stays explicit.',
    },
    { // research/experiments.md:7-8; benchmarks/README.md:30
      chip: 'METHOD', source: 'paired bootstrap · 10,000 resamples', title: 'Speedups as intervals, not anecdotes',
      formula: 'Δ = median(new − old),  95% CI from 10^4 resamples', kind: 'hist',
      data: { caption: 'bootstrap distribution of a paired difference', heights: [0.05, 0.1, 0.18, 0.3, 0.45, 0.62, 0.8, 0.95, 1, 0.92, 0.76, 0.58, 0.4, 0.26, 0.15, 0.08, 0.04], ci: [2, 14], zero: 0, ciLabel: '95% CI excludes 0 → real gain', right: 'illustrative' },
      take: 'Paired, interleaved rounds — 3 processes × 7 rotated rounds, median of medians — so a result is a measured interval, not one lucky run.',
    },
  ],
};

export const yolowhtml = {
  slug: 'yolowhtml',
  name: 'yolowhtml',
  tag: 'STATISTICS × DOM',
  stat: '0.24 ms/page HTML→MD',
  statNote: '8.12× Turndown · repo bench',
  chapters: [
    { // crates/yolowhtml/src/lib.rs:61-73,223-228; content_model/mod.rs:32-36
      chip: 'INSPIRED BY', source: 'Viola & Jones (CVPR 2001) cascade', title: 'A cascade: cheap decisions first',
      formula: 'article? → 86-feature model → rule chain', kind: 'flow',
      data: { caption: 'each stage only sees pages the previous one passed on', nodes: [[22, 160, 104, 28, 'article path', false, 0], [138, 160, 104, 28, 'learned model', true, 1], [254, 160, 108, 28, 'rule chain', false, 2]], arrows: [[128, 174, 136, 174], [244, 174, 252, 174]], notes: [[138, 210, 'falls back when:', 'small', 'start', 3], [138, 228, '< 8 blocks or < 20 words', 'mono', 'start', 3], [138, 246, 'top posterior < 0.25', 'mono', 'start', 4], [22, 210, 'declared articles', 'small', 'start', 1], [22, 228, 'stay deterministic', 'small', 'start', 1]] },
      take: 'The model only runs where rules are weak, and it backs off when it is unsure — a cascade in spirit, not a boosted detector.',
    },
    { // content_model/structure.rs:3,71-106; features.rs:669-677
      chip: 'PAPER', source: 'CETD · Sun, Song & Liao (SIGIR 2011)', title: 'Composite text density',
      formula: 'CTD = (C/T) · log_b((C/LC)·(T/LT))', kind: 'heat',
      data: { caption: 'blocks shaded by composite text density', blocks: [[8, 8, 204, 12, 0.15, ''], [8, 26, 140, 10, 0.55, ''], [8, 42, 140, 58, 0.95, 'article'], [156, 26, 56, 74, 0.2, 'aside'], [8, 106, 204, 12, 0.1, 'footer']], legend: [['C, T', 'chars, tags'], ['LC, LT', 'link chars, tags'], ['8 features', 'from CTD'], ['ctd < 4·td', 'bound at t = 1']] },
      take: 'LC and LT clamp at 1 and bad logs fall back to C/T; a proved bound lets pure inline leaves skip three ln calls.',
    },
    { // content_model/features.rs:492-513,632-639
      chip: 'PAPER', source: 'MSS · Pasternack & Roth (WWW 2009)', title: 'Maximum subsequence of prose',
      formula: 's_i = words − 2·linkwords − 3,   max Σ s_i', kind: 'mss',
      data: { caption: 'per-block scores in document order (Kadane, O(n))', scores: [-6, -9, -4, 3, 12, 15, -2, 10, 13, 8, -5, -10, -7, -12, -6, -8], run: [3, 9], runLabel: 'max-sum run → in_mss, mss_dist' },
      take: 'The best run is not the answer: it becomes two features for the tree model, so one long link list cannot fool the extractor.',
    },
    { // content_model/lex.rs:2,133-216,321-325
      chip: 'THEORY', source: 'Shannon entropy · jusText (Pomikálek 2011)', title: 'What the characters look like',
      formula: 'H = −Σ_k p_k log₂ p_k   over 5 character classes', kind: 'bars',
      data: { caption: 'character-class mix of a prose block (example)', rows: [['lower', 0.78], ['upper', 0.05], ['digit', 0.03], ['punct+sym', 0.12], ['non-ASCII', 0.02]], footer: '+ function-word density: 7 languages + CJK particles' },
      take: 'Punctuation and symbols merge into one class; hand-picked function words feed stop density as features, not as jusText’s classifier.',
    },
    { // content_model/weights.rs:1-27; decode.rs:8-31
      chip: 'PAPER', source: 'CatBoost · Prokhorenkova et al. (NeurIPS 2018)', title: 'Five tests become one leaf index',
      formula: 'j = Σ_k 2^{4−k}·[x_{f(k)} ≥ t_k],   z = b + 2^{−15}·Σ v', kind: 'tree',
      data: { caption: 'one oblivious tree: test k is feature f(k) ≥ t_k', tests: ['ctd', 'links', 'in_mss', 'H', 'stop'], bits: ['1', '0', '1', '1', '0'], result: '10110₂ → leaf 22 of 32' },
      take: 'A branch-free loop; index & 0x7F over a 128-wide buffer drops bounds checks in safe Rust; 125 i16 trees ≈ 11 KiB stay in L1.',
    },
    { // content_model/decode.rs:33-66; mod.rs:449-505; weights.rs:14
      chip: 'PAPER', source: 'Lipton, Elkan & Naryanaswamy (2014)', title: 'Pick the F1-optimal cut',
      formula: 'τ* = ½ · max_S 2Σwp / (Σw + s·Σwp)', kind: 'bars',
      data: { caption: 'block posteriors, word-weighted (example)', rows: [['nav', 0.12], ['title', 0.93], ['paragraph', 0.84], ['short p', 0.46], ['aside', 0.18]], threshold: 0.42, thresholdLabel: 'τ*' },
      take: 'Expected positives are scaled by s = 0.85; tables and <pre> blocks are kept or dropped as a whole against τ*.',
    },
    { // content_model/decode.rs:72-93,166-174; structure.rs:301-338; weights.rs:15-16
      chip: 'PAPER', source: 'Web2Text · Vogels et al. (WSDM 2018)', title: 'Decode a coherent sequence',
      formula: 'ψ = λ_0 + λ_1 / (1 + d_{LCA}),   λ_1 = 1.2', kind: 'viterbi',
      data: { caption: 'two-state chain over blocks in reading order', labels: ['nav', 'title', 'short p', 'body', 'footer'], scores: ['0.12', '0.93', '0.38', '0.86', '0.10'], path: [0, 1, 1, 1, 0], note: 'low score, kept by its neighbours' },
      take: 'A closed-form switch penalty instead of a learned CRF: blocks 2 tree edges apart pay 0.4 and stay together; 14 apart pay 0.08.',
    },
    { // CHANGELOG.md:5 (0.1.3); benchmarks/quality/compare.py:9-36
      chip: 'METHOD', source: 'Efron & Tibshirani (1993) · Fisher–Pitman', title: 'Every gain comes with a p-value',
      formula: 'paired bootstrap B = 10^4  ·  sign-flip test', kind: 'delta',
      data: { caption: 'F1 before → after the v0.1.3 model', range: [0.84, 0.91], rows: [['WCXB blind', 0.8843, 0.8992, '0.0011'], ['WCXB 1,842', 0.8614, 0.8823, '0.0001'], ['WebMainBench', 0.8530, 0.8677, '0.0004']] },
      take: 'The out-of-distribution set improved too, and the new model runs at 0.876× the old time.',
    },
  ],
};

export const yolowpdf = {
  slug: 'yolowpdf',
  name: 'yolowpdf',
  tag: 'GEOMETRY × STATISTICS',
  stat: '2,256 pages/s',
  statNote: 'born-digital olmOCR-bench · repo bench',
  chapters: [
    { // crates/yolowpdf/src/layout/columns.rs:1-30,49-110,241-402
      chip: 'PAPER', source: 'Nagy & Seth 1984 · Ha et al. 1995 · Breuel 2002', title: 'Recursive X-Y cut reading order',
      formula: 'cut at an empty projection band, recurse ≤ 5', kind: 'xycut',
      data: { caption: 'spanning rows first, then column gutters' },
      take: 'Full-width title and abstract rows are peeled first; guards stop equation numbers and margin line numbers from faking a column.',
    },
    { // crates/yolowpdf/src/math/segment.rs:1,200-380
      chip: 'PAPER', source: 'Rabiner (1989) · Garain & Chaudhuri (2005)', title: 'Is this word text or math?',
      formula: 's* = argmax Σ E(w_t, s_t) + T(s_{t−1} → s_t)', kind: 'viterbi',
      data: { caption: 'two-state HMM over words, decoded with Viterbi', states: ['math', 'text'], labels: ['let', 'x²', '+', 'y²', 'where'], scores: ['−4', '+8', '+8', '+8', '−12'], path: [0, 1, 1, 1, 0], note: 'switching costs 1.8' },
      take: 'Hand-set log-scores rather than trained ones; staying in Math past a sentence end costs 3.2, and braces may absorb 3 prose words.',
    },
    { // crates/yolowpdf/src/math/spatial.rs:1,21,437-451,593-595; interp/mod.rs:331,587,719
      chip: 'PAPER', source: 'Anderson 1968 · DRACULAE 2002 · TeXbook G', title: 'Rebuild fractions from geometry',
      formula: 'axis = y_bar − 0.25·size,   overlap ≥ 0.50', kind: 'flow',
      data: { caption: 'glyph boxes + a rule → LaTeX', nodes: [[40, 162, 70, 24, 'a + b', false, 0], [40, 212, 70, 24, 'c', false, 1], [196, 186, 166, 26, '\\frac{a+b}{c}', true, 3]], arrows: [[122, 199, 192, 199]], notes: [[30, 205, '──────────', 'hot', 'start', 1], [126, 190, 'bar owns both', 'small', 'start', 2], [22, 262, 'bars recovered from 1×1 ImageMasks stretched by the CTM', 'small', 'start', 4]] },
      take: 'The rebuilt fraction is folded back into one glyph, so the layout stages downstream never see the difference.',
    },
    { // crates/yolowpdf/src/interp/mod.rs:219-272,502-583; orient.rs:17-29; font/mod.rs:689-692
      chip: 'SPEC', source: 'ISO 32000 · PDF text space', title: 'Map glyphs into page space',
      formula: 'T_{rm} = S(T_{fs}, T_h, T_{rise}) · T_m · CTM', kind: 'geometry',
      data: { caption: 'text matrix × current transformation matrix', op: 'T_m · CTM', angle: 12 },
      take: 'Direction snaps to quarter-turns with a 10% skew tolerance; Type3 em size is estimated as 2× median width when off by > 4×.',
    },
    { // crates/yolowpdf/src/layout/furniture.rs:68,149-151,312-367
      chip: 'MY RULE', source: 'self-developed · layout/furniture.rs', title: 'Headers that carry page numbers',
      formula: 'folio − page index = const on ≥ 3 pages', kind: 'pages',
      data: { caption: 'running headers across consecutive pages', pages: [['§2 · 37', 3], ['§2 · 38', 4], ['§2 · 39', 5], ['§2 · 40', 6]], result: '37 − 3 = 38 − 4 = … = 34 → header' },
      take: 'Strip the folio, then match the offset — or the same text at the same height (±1 pt) — inside the top 12% / bottom 20% zones.',
    },
    { // crates/yolowpdf-stat/src/beta.rs:126; lib.rs:49; quality.rs:73-102
      chip: 'PAPER', source: 'Wilson (JASA 1927) · Fisher (1925) δ', title: 'Re-run a page only on evidence',
      formula: 'Wilson_{lower}(k/n) > δ = 0.05   ⇒   re-route', kind: 'intervals',
      data: { caption: 'defect rate k/n per page with its Wilson interval', rows: [['page 1', 0.0, 0.01, 0.04, false], ['page 2', 0.01, 0.05, 0.14, false], ['page 3', 0.09, 0.2, 0.33, true], ['page 4', 0.0, 0.02, 0.06, false]], delta: 0.05, deltaLabel: 'δ' },
      take: 'k counts garbled and unmapped glyphs; a page is re-parsed by another route only when even the pessimistic bound says it is broken.',
    },
    { // crates/yolowpdf/src/timeout.rs:5-41
      chip: 'PAPER', source: 'Pickands (1975) · Balkema & de Haan (1974)', title: 'A timeout from extreme-value theory',
      formula: 'q_{1−ε} = u + m·ln(δ/ε),   ε = δ/n', kind: 'curve',
      data: { caption: 'log tail of parse-time residuals (illustrative)', pts: range(40, (u) => { const x = u * 8; return [u, 1 + (x <= 1.97 ? -1.5 * (x / 1.97) ** 2 : -1.5 - (x - 1.97)) / 8]; }), mark: [6.57 / 8, 1 - 6.1 / 8, 'q ≈ 6.6 σ (n = 100)'], xlabel: 'residual σ →', ylabel: 'ln P', row: [['threshold u', '1.97 σ'], ['scale m', '1.00 σ'], ['prior', '1,859 runs']] },
      take: 'ln t is regressed on ln bytes; beyond the largest file seen the slope is 1, and each thread updates its own copy without locks.',
    },
    { // crates/yolowpdf-stat/src/decide.rs:74; yolowpdf-ocr gpu_run.rs:1-150
      chip: 'PAPER', source: 'Kleinrock (1975) Queueing Systems §3.2', title: 'Wait for one more line?',
      formula: 'wait  ⇔  n/λ < (a/(n+1)) / (1 − ρ)', kind: 'flow',
      data: { caption: 'OCR lines queue for a GPU batch', nodes: [[22, 166, 32, 24, 'L1', false, 0], [58, 166, 32, 24, 'L2', false, 0], [94, 166, 32, 24, 'L3', false, 1], [130, 166, 32, 24, 'L4', true, 2], [218, 160, 144, 36, 'GPU batch', true, 3]], arrows: [[168, 178, 214, 178]], notes: [[22, 220, 'batch time ≈ a + t·N·W  (EWMA 0.1)', 'mono', 'start', 3], [22, 240, 'launch when padding waste > a', 'small', 'start', 4], [22, 258, 'out of memory → halve the batch', 'small', 'start', 5]] },
      take: 'Queueing theory sets the latency/utilisation trade-off instead of a fixed batch size; GPU OCR is capped at 4 workers under cgroup admission.',
    },
  ],
};
