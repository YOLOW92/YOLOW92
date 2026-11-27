"""Render ../assets/how-{dark,light}.svg: four animated "how it works" panels for the profile README.

Each panel animates the core idea of one crate (CSS keyframes, 8 s loop, reduced-motion = static end state):
  yolow64    3 bytes -> four 6-bit fields -> 64-entry alphabet lookup (vpmultishiftqb + vpermb)
  yolowzstd  a 12-bit window over the bitstream; one table hit can return two Huffman symbols
  yolowhtml  score DOM blocks, cut at theta* = F1*/2, then Viterbi smoothing flips isolated blocks
  yolowpdf   a glyph box goes through T_rm = [Tfs*Th 0; 0 Tfs; 0 Trise] x Tm x CTM onto the page,
             glyphs group into lines, lines into columns in reading order
"""
from pathlib import Path

T = {
    "dark": dict(bg="#0d1117", line="#30363d", panel="#161b22", fg="#e6edf3", mute="#8b949e", faint="#30363d",
                 acc="#f0883e", g1="#f0883e", g2="#58a6ff", g3="#3fb950", g4="#bc8cff", off="#484f58"),
    "light": dict(bg="#ffffff", line="#d0d7de", panel="#f6f8fa", fg="#1f2328", mute="#59636e", faint="#d0d7de",
                  acc="#bc4c00", g1="#bc4c00", g2="#0969da", g3="#1a7f37", g4="#8250df", off="#afb8c1"),
}
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif"
MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace"
W, PW, PH, GAP, TOP = 1000, 476, 268, 16, 84
LOOP = 9  # seconds


def style(t):
    return f"""<style>
  .bg{{fill:{t['bg']};stroke:{t['line']}}} .panel{{fill:{t['panel']};stroke:{t['line']}}}
  .h2{{font:700 22px {SANS};fill:{t['fg']}}} .sub{{font:400 14px {SANS};fill:{t['mute']}}}
  .name{{font:700 15px {MONO};fill:{t['acc']}}} .desc{{font:400 12px {SANS};fill:{t['mute']}}}
  .cap{{font:400 11px {SANS};fill:{t['mute']}}} .lab{{font:500 11px {MONO};fill:{t['mute']}}}
  .bit{{font:600 11px {MONO};fill:{t['fg']}}} .chr{{font:700 15px {MONO};fill:{t['fg']}}}
  .num{{font:700 11px {MONO}}} .small{{font:400 10.5px {SANS};fill:{t['mute']}}}
  .cell{{fill:none;stroke:{t['faint']}}} .faint{{fill:{t['faint']}}} .off{{fill:{t['off']}}}
  .acc{{fill:{t['acc']}}} .accs{{stroke:{t['acc']};fill:none;stroke-width:2}}
  .c1{{fill:{t['g1']}}} .c2{{fill:{t['g2']}}} .c3{{fill:{t['g3']}}} .c4{{fill:{t['g4']}}}
  .s1{{stroke:{t['g1']}}} .s2{{stroke:{t['g2']}}} .s3{{stroke:{t['g3']}}} .s4{{stroke:{t['g4']}}}
  .ln{{fill:none;stroke-width:1.5}} .fg{{fill:{t['fg']}}} .mute{{fill:{t['mute']}}}
  .a{{animation-duration:{LOOP}s;animation-iteration-count:infinite;animation-fill-mode:both}}
  @keyframes in1{{0%,8%{{opacity:0}}12%,94%{{opacity:1}}98%,100%{{opacity:0}}}}
  @keyframes in2{{0%,28%{{opacity:0}}32%,94%{{opacity:1}}98%,100%{{opacity:0}}}}
  @keyframes in3{{0%,48%{{opacity:0}}52%,94%{{opacity:1}}98%,100%{{opacity:0}}}}
  @keyframes in4{{0%,66%{{opacity:0}}70%,94%{{opacity:1}}98%,100%{{opacity:0}}}}
  @keyframes out2{{0%,28%{{opacity:1}}32%,100%{{opacity:0}}}}
  @keyframes out4{{0%,66%{{opacity:1}}70%,100%{{opacity:0}}}}
  @keyframes mid{{0%,48%{{opacity:0}}52%,64%{{opacity:1}}68%,100%{{opacity:0}}}}
  .i1{{animation-name:in1}} .i2{{animation-name:in2}} .i3{{animation-name:in3}} .i4{{animation-name:in4}}
  .o2{{animation-name:out2}} .o4{{animation-name:out4}} .mid{{animation-name:mid}}
  @keyframes grow{{0%{{transform:scaleX(0)}}12%,100%{{transform:scaleX(1)}}}}
  .grow{{transform-box:fill-box;transform-origin:left center;animation-name:grow}}
  @keyframes win{{0%,30%{{transform:translateX(0)}}36%,63%{{transform:translateX(80px)}}69%,100%{{transform:translateX(192px)}}}}
  .win{{animation-name:win}}
  @keyframes fly{{0%,8%{{transform:translate(0,0) scale(1)}}40%,100%{{transform:translate(312px,138px) scale(.45)}}}}
  .fly{{animation-name:fly;transform-origin:0 0}}
  @keyframes blink{{0%,100%{{opacity:.35}}50%{{opacity:1}}}}
  @media (prefers-reduced-motion: reduce){{.a{{animation:none!important}} .o2,.o4,.mid{{opacity:0}}}}
</style>"""


def a(cls, extra=""):
    return f'class="a {cls}{(" " + extra) if extra else ""}"'


def panel_head(name, desc):
    return [f'<rect class="panel" x=".5" y=".5" width="{PW-1}" height="{PH-1}" rx="10"/>',
            f'<text x="18" y="28" class="name">{name}</text>',
            f'<text x="18" y="46" class="desc">{desc}</text>']


def yolow64():
    o = panel_head("yolow64", "Base64 · 3 bytes become 4 characters · AVX-512 does 48 → 64 per step")
    bits = "010011010110000101101110"  # 'M' 0x4D, 'a' 0x61, 'n' 0x6E
    x0, y0, cw = 46, 84, 16
    for k, (ch, hx) in enumerate((("M", "0x4D"), ("a", "0x61"), ("n", "0x6E"))):
        cx = x0 + k * 8 * cw + 4 * cw
        o.append(f'<text x="{cx}" y="{y0-10}" class="lab" text-anchor="middle">\'{ch}\' {hx}</text>')
    # byte colouring (fades out) and 6-bit field colouring (fades in)
    for k in range(3):
        o.append(f'<rect {a("o2")} x="{x0+k*8*cw}" y="{y0}" width="{8*cw}" height="22" rx="3" class="c{k+1}" opacity=".22"/>')
    for k in range(4):
        o.append(f'<g {a("i2")}><rect x="{x0+k*6*cw}" y="{y0}" width="{6*cw}" height="22" rx="3" class="c{k+1}" opacity=".28"/></g>')
    for i, b in enumerate(bits):
        o.append(f'<rect class="cell" x="{x0+i*cw}" y="{y0}" width="{cw}" height="22"/>')
        o.append(f'<text x="{x0+i*cw+cw/2}" y="{y0+15}" class="bit" text-anchor="middle">{b}</text>')
    vals = [19, 22, 5, 46]
    alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    ly = 160
    lw = 24 * cw / 64
    for j in range(64):
        o.append(f'<rect x="{x0+j*lw:.1f}" y="{ly}" width="{lw-0.6:.1f}" height="16" class="faint"/>')
    for k, v in enumerate(vals):
        gx = x0 + k * 6 * cw + 3 * cw
        o.append(f'<g {a("i2")}><text x="{gx}" y="{y0+40}" class="num c{k+1}" text-anchor="middle">{v}</text>'
                 f'<path class="ln s{k+1}" d="M{gx} {y0+26} v4"/></g>')
        lx = x0 + v * lw + lw / 2
        o.append(f'<g {a("i3")}><path class="ln s{k+1}" d="M{gx} {y0+46} L{lx:.1f} {ly-3}"/>'
                 f'<rect x="{x0+v*lw:.1f}" y="{ly}" width="{lw:.1f}" height="16" class="c{k+1}"/></g>')
        o.append(f'<g {a("i4")}><path class="ln s{k+1}" d="M{lx:.1f} {ly+19} L{gx} {ly+40}"/>'
                 f'<rect x="{gx-15}" y="{ly+42}" width="30" height="26" rx="5" class="c{k+1}" opacity=".25"/>'
                 f'<text x="{gx}" y="{ly+60}" class="chr" text-anchor="middle">{alpha[v]}</text></g>')
    o.append(f'<text x="{x0-6}" y="{ly+12}" class="lab" text-anchor="end">A…/</text>')
    o.append(f'<text x="18" y="{PH-16}" class="cap">vpmultishiftqb pulls out the 6-bit fields, vpermb looks up all 64 lanes at once</text>')
    return o


def yolowzstd():
    o = panel_head("yolowzstd", "Huffman decode · one 12-bit table hit can return two symbols")
    o.append('<text x="18" y="68" class="lab">codes  e 00 · t 010 · a 011 · o 100 · n 1010 · s 1011</text>')
    bits = "0100001110101011100" + "00000"
    x0, y0, cw = 46, 98, 16
    for i, b in enumerate(bits):
        o.append(f'<rect class="cell" x="{x0+i*cw}" y="{y0}" width="{cw}" height="22"/>')
        o.append(f'<text x="{x0+i*cw+cw/2}" y="{y0+15}" class="bit" text-anchor="middle">{b}</text>')
    o.append(f'<rect {a("win")} x="{x0-1}" y="{y0-4}" width="{12*cw+2}" height="30" rx="5" class="accs"/>')
    o.append(f'<text {a("win")} x="{x0+6*cw}" y="{y0+40}" class="lab" text-anchor="middle">12-bit window</text>')
    steps = [("i1 o_s1", "010 00", "t e", "5 bits"), ("i2 o_s2", "011 1010", "a n", "7 bits"), ("i3", "1011 100", "s o", "7 bits")]
    # one table row per step, each visible only during its step
    rows = [("0%,8%", "12%,30%", "34%,100%"), ("0%,32%", "36%,63%", "67%,100%"), ("0%,65%", "69%,94%", "98%,100%")]
    for k, ((_, code, sym, used), (pre, on, post)) in enumerate(zip(steps, rows)):
        o.append(f'<style>@keyframes row{k}{{{pre}{{opacity:0}}{on}{{opacity:1}}{post}{{opacity:0}}}}</style>')
        o.append(f'<g class="a" style="animation-name:row{k}">'
                 f'<rect x="46" y="150" width="384" height="36" rx="6" class="faint" opacity=".5"/>'
                 f'<text x="60" y="173" class="bit">table[{code}…]</text>'
                 f'<text x="250" y="174" class="chr">→ {sym}</text>'
                 f'<text x="420" y="173" class="lab" text-anchor="end">used {used}</text></g>')
    o.append('<text x="46" y="214" class="lab">out</text>')
    for k, (s, cls) in enumerate((("t e", "i1"), ("a n", "i2"), ("s o", "i3"))):
        o.append(f'<g {a(cls)}><rect x="{80+k*70}" y="196" width="60" height="26" rx="5" class="c{k+1}" opacity=".25"/>'
                 f'<text x="{110+k*70}" y="214" class="chr" text-anchor="middle">{s}</text></g>')
    o.append(f'<text x="18" y="{PH-16}" class="cap">4,096 entries (16 KiB), built only when two short codes are likely to fit in 12 bits</text>')
    return o


def yolowhtml():
    o = panel_head("yolowhtml", "Main content · score every DOM block, cut at θ* = F1*/2, smooth with Viterbi")
    blocks = [("nav", .15), ("h1 title", .82), ("p", .78), ("p (short)", .38), ("aside ad", .58), ("p", .74), ("footer", .10)]
    bx, bw, y0, rh = 110, 232, 78, 22
    thr = .45
    tx = bx + thr * bw
    for k, (lab, s) in enumerate(blocks):
        y = y0 + k * rh
        o.append(f'<text x="18" y="{y+14}" class="lab">{lab}</text>')
        o.append(f'<rect x="{bx}" y="{y+3}" width="{bw}" height="14" rx="3" class="faint" opacity=".5"/>')
        o.append(f'<rect {a("grow")} x="{bx}" y="{y+3}" width="{s*bw:.0f}" height="14" rx="3" class="off"/>')
        kept_first = s > thr
        if lab == "aside ad":
            o.append(f'<rect {a("mid")} x="{bx}" y="{y+3}" width="{s*bw:.0f}" height="14" rx="3" class="acc"/>')
            o.append(f'<text {a("i4")} x="{bx+bw+8}" y="{y+14}" class="lab">dropped</text>')
        elif lab == "p (short)":
            o.append(f'<rect {a("i4")} x="{bx}" y="{y+3}" width="{s*bw:.0f}" height="14" rx="3" class="acc"/>')
            o.append(f'<text {a("i4")} x="{bx+bw+8}" y="{y+14}" class="lab">kept (Viterbi)</text>')
        elif kept_first:
            o.append(f'<rect {a("i3")} x="{bx}" y="{y+3}" width="{s*bw:.0f}" height="14" rx="3" class="acc"/>')
    o.append(f'<g {a("i2")}><path class="ln accs" stroke-dasharray="4 3" d="M{tx:.0f} {y0-4} V{y0+len(blocks)*rh}"/>'
             f'<text x="{tx:.0f}" y="{y0-10}" class="lab" text-anchor="middle">θ* = F1*/2</text></g>')
    o.append(f'<text x="18" y="{PH-16}" class="cap">the cut keeps high scores; Viterbi keeps runs together (scores illustrative)</text>')
    return o


def yolowpdf():
    o = panel_head("yolowpdf", "Born-digital PDF · every glyph box comes straight from the text matrix")
    # page with two columns of text lines
    px, py, pw, ph = 236, 62, 220, 150
    o.append(f'<rect x="{px}" y="{py}" width="{pw}" height="{ph}" rx="4" class="faint" opacity=".35"/>')
    cols = [(px + 12, 92), (px + 116, 92)]
    for c, (cx, w) in enumerate(cols):
        for r in range(6):
            ly = py + 14 + r * 21
            o.append(f'<rect x="{cx}" y="{ly}" width="{w - (30 if r == 5 and c == 0 else 18 if r == 5 else 0)}" height="7" rx="2" class="off" opacity=".7"/>')
            o.append(f'<rect {a("i3")} x="{cx-3}" y="{ly-4}" width="{w+6 - (18 if r == 5 else 0)}" height="15" rx="3" class="ln s2" fill="none"/>')
        o.append(f'<g {a("i4")}><circle cx="{cx+w/2}" cy="{py+ph+14}" r="9" class="c3" opacity=".9"/>'
                 f'<text x="{cx+w/2}" y="{py+ph+18}" class="num" fill="#fff" text-anchor="middle">{c+1}</text></g>')
    o.append(f'<path {a("i4")} class="ln s3" d="M{cols[0][0]+cols[0][1]+4} {py+ph-6} C {px+108} {py+ph+20}, {px+108} {py-10}, {cols[1][0]-4} {py+12}" marker-end="url(#ar)"/>')
    # glyph space box and the flying glyph
    gx, gy = 24, 84
    o.append(f'<rect x="{gx}" y="{gy}" width="46" height="46" rx="4" class="cell" stroke-dasharray="3 3"/>')
    o.append(f'<text x="{gx+23}" y="{gy+62}" class="lab" text-anchor="middle">glyph space</text>')
    o.append(f'<g {a("fly")}><rect x="{gx}" y="{gy}" width="46" height="46" rx="4" class="ln accs"/>'
             f'<text x="{gx+23}" y="{gy+35}" class="chr" style="font-size:30px" text-anchor="middle">g</text></g>')
    chain = [("× [Tfs·Th 0; 0 Tfs; 0 Trise]", "i1"), ("× Tm   (text → user)", "i2"), ("× CTM  (user → page)", "i2")]
    for k, (txt, cls) in enumerate(chain):
        o.append(f'<text {a(cls)} x="{gx}" y="{gy+86+k*16}" class="lab">{txt}</text>')
    o.append(f'<text x="18" y="{PH-16}" class="cap">glyphs → lines → columns → reading order, without rasterising the page</text>')
    return o


def build(theme):
    t = T[theme]
    H = TOP + 2 * PH + GAP + 30
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
           'aria-label="How it works, animated: yolow64 Base64 field extraction, yolowzstd two-symbol Huffman lookup, '
           'yolowhtml block scoring with threshold and Viterbi smoothing, yolowpdf glyph boxes from the text matrix.">',
           style(t),
           f'<defs><marker id="ar" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">'
           f'<path d="M0 0L8 4L0 8z" fill="{t["g3"]}"/></marker></defs>',
           f'<rect class="bg" x=".5" y=".5" width="{W-1}" height="{H-1}" rx="14"/>',
           '<text x="28" y="46" class="h2">how it works</text>',
           '<text x="28" y="70" class="sub">The one idea that makes each crate fast or right, played out step by step.</text>']
    for i, fn in enumerate((yolow64, yolowzstd, yolowhtml, yolowpdf)):
        px = 24 + (i % 2) * (PW + GAP)
        py = TOP + (i // 2) * (PH + GAP)
        out.append(f'<g transform="translate({px},{py})">')
        out += fn()
        out.append("</g>")
    out.append("</svg>")
    return merge_classes("\n".join(out) + "\n")


def merge_classes(svg_text):
    """Fold a second class="..." on the same tag into the first (XML forbids repeated attributes)."""
    import re
    def fix(m):
        tag = m.group(0)
        cl = re.findall(r'\sclass="([^"]*)"', tag)
        if len(cl) < 2:
            return tag
        tag = re.sub(r'\sclass="[^"]*"', "", tag)
        return tag.replace(m.group(1), m.group(1) + f' class="{" ".join(cl)}"', 1)
    return re.sub(r"<(\w+)[^<>]*>", fix, svg_text)


if __name__ == "__main__":
    d = Path(__file__).resolve().parent.parent / "assets"
    for th in T:
        (d / f"how-{th}.svg").write_text(build(th))
