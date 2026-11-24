"""Render the profile's animated SVGs (dark + light) into ../assets/.

Run:  python3 -I scripts/render_svgs.py
Everything is plain SVG + CSS/SMIL, no external fonts or images, so GitHub's
<img> sandbox renders it as-is. Edit the data tables below, then re-run.
"""

from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape

OUT = Path(__file__).resolve().parent.parent / "assets"

THEMES = {
    "dark": {
        "bg": "#0d1117", "panel": "#161b22", "line": "#30363d", "text": "#e6edf3",
        "muted": "#8b949e", "rust": "#f0883e", "blue": "#58a6ff", "green": "#3fb950",
        "violet": "#bc8cff", "glow": "rgba(240,136,62,0.16)",
    },
    "light": {
        "bg": "#ffffff", "panel": "#f6f8fa", "line": "#d0d7de", "text": "#1f2328",
        "muted": "#59636e", "rust": "#bc4c00", "blue": "#0969da", "green": "#1a7f37",
        "violet": "#8250df", "glow": "rgba(188,76,0,0.10)",
    },
}

MONO = "ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace"
SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif"


def t(x, y, s, cls, anchor="start", extra=""):
    return f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}"{extra}>{escape(s)}</text>'


def base_css(c):
    return f"""
  .bg{{fill:{c['bg']};stroke:{c['line']}}}
  .panel{{fill:{c['panel']};stroke:{c['line']};stroke-width:1}}
  .h1{{font:700 28px {SANS};fill:{c['text']}}}
  .h2{{font:700 22px {SANS};fill:{c['text']}}}
  .sub{{font:400 14px {SANS};fill:{c['muted']}}}
  .cap{{font:600 10.5px {MONO};fill:{c['muted']};letter-spacing:.08em}}
  .mono{{font:500 12px {MONO};fill:{c['text']}}}
  .name{{font:700 14px {MONO};fill:{c['rust']}}}
  .desc{{font:400 11px {MONO};fill:{c['muted']}}}
  .big{{font:700 20px {MONO};fill:{c['rust']}}}
  .out{{font:600 12px {MONO};fill:{c['green']}}}
  .note{{font:400 12.5px {SANS};fill:{c['muted']}}}
  .tag{{font:700 13px {MONO};fill:{c['rust']}}}
  .small{{font:400 10.5px {SANS};fill:{c['muted']}}}
  @media (prefers-reduced-motion: reduce){{*{{animation:none!important}}}}
"""


# ---------------------------------------------------------------- pipeline

INPUTS = ["<!DOCTYPE html>", "%PDF-1.7", "PK\\x03\\x04 (docx)", "fn main() {"]
PARSERS = [
    ("yolowhtml", "HTML5 tokenizer · DOM arena · 125 trees"),
    ("yolowpdf", "xref · content streams · layout · OCR"),
    ("yolowdoc", "Office · ODF · EPUB · email · archives"),
    ("yolowsyntax", "tree-sitter runtime · 41 languages"),
]
OUTPUTS = ["Markdown", "JSON", "DataGraph", "MCP · HTTP API"]
ENGINE = ["capture", "parse", "DataGraph", "ContextPack", "Resolve"]


def pipeline(c):
    W, H = 1000, 430
    rows = [150, 205, 260, 315]
    hub_cy = 233
    outs = [161, 209, 257, 305]
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
         f'aria-label="Yuanchao Wu: a pure-Rust stack from bytes to evidence. Inputs flow through yolowhtml, yolowpdf, '
         f'yolowdoc and yolowsyntax into pagesift, which emits Markdown, JSON, DataGraph and MCP output.">']
    p.append(f"<style>{base_css(c)}"
             f"  .flow{{fill:none;stroke:{c['muted']};stroke-opacity:.55;stroke-width:1.5;stroke-dasharray:3 7;animation:dash 1.2s linear infinite}}\n"
             f"  @keyframes dash{{to{{stroke-dashoffset:-20}}}}\n"
             f"  .cursor{{fill:{c['rust']};animation:blink 1.1s steps(1) infinite}}\n"
             f"  @keyframes blink{{50%{{opacity:0}}}}\n"
             f"  .pulse{{fill:{c['rust']};transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-in-out infinite}}\n"
             f"  @keyframes pulse{{0%,100%{{opacity:.35;transform:scale(.8)}}50%{{opacity:1;transform:scale(1.25)}}}}\n"
             f"  .hub{{fill:{c['glow']};stroke:{c['rust']};stroke-width:1.5}}\n"
             f"  .dot{{fill:{c['rust']}}}\n"
             "</style>")
    p.append(f'<rect class="bg" x=".5" y=".5" width="{W-1}" height="{H-1}" rx="14"/>')

    # header
    p.append(t(28, 52, "吴袁超 · YUANCHAO WU", "h1"))
    p.append(t(28, 80, "bytes → evidence — a pure-Rust stack, built from the byte level up", "sub"))
    p.append(t(940, 52, "~/YOLOW92 $ cargo tree --depth 1", "desc", "end"))
    p.append(f'<rect class="cursor" x="946" y="42" width="8" height="13"/>')

    # column captions
    for x, s in [(28, "BYTES IN"), (240, "PARSERS · yolow*"), (600, "ENGINE"), (824, "EVIDENCE OUT")]:
        p.append(t(x, 120, s, "cap"))

    edges = []
    # inputs -> parsers
    for i, (y, s) in enumerate(zip(rows, INPUTS)):
        p.append(f'<rect class="panel" x="24" y="{y-17}" width="172" height="34" rx="8"/>')
        p.append(t(36, y + 4, s, "mono"))
        edges.append(f"M196 {y} L236 {y}")
    # parsers
    for (y, (name, desc)) in zip(rows, PARSERS):
        p.append(f'<rect class="panel" x="236" y="{y-23}" width="304" height="46" rx="9"/>')
        p.append(t(250, y - 4, name, "name"))
        p.append(t(250, y + 14, desc, "desc"))
        edges.append(f"M540 {y} C570 {y} 570 {hub_cy} 600 {hub_cy}")
    # block-model heartbeat next to yolowhtml
    p.append(f'<circle class="pulse" cx="524" cy="{rows[0]-6}" r="4"/>')

    # hub
    p.append(f'<rect class="hub" x="600" y="128" width="180" height="210" rx="12"/>')
    p.append(t(690, 162, "pagesift", "big", "middle"))
    p.append(t(690, 180, "one binary", "desc", "middle"))
    for k, s in enumerate(ENGINE):
        p.append(t(690, 208 + k * 24, s, "mono", "middle"))

    # outputs
    for (y, s) in zip(outs, OUTPUTS):
        p.append(f'<rect class="panel" x="824" y="{y-15}" width="152" height="30" rx="8"/>')
        p.append(t(900, y + 4, s, "out", "middle"))
        edges.append(f"M780 {hub_cy} C802 {hub_cy} 802 {y} 824 {y}")

    # codec substrate
    p.append(f'<rect class="panel" x="236" y="364" width="268" height="36" rx="9"/>')
    p.append(f'<rect class="panel" x="512" y="364" width="268" height="36" rx="9"/>')
    p.append(t(250, 387, "yolowzstd", "name") + t(338, 387, "zstd · RFC 8878", "desc"))
    p.append(t(526, 387, "yolow64", "name") + t(596, 387, "SIMD Base64", "desc"))
    p.append(t(28, 387, "CODECS UNDERNEATH", "cap"))
    edges.append("M690 364 L690 338")
    edges.append("M370 364 L370 338")

    # flowing edges + travelling dots (SMIL keeps moving even where CSS motion paths are not supported)
    for k, d in enumerate(edges):
        p.append(f'<path class="flow" d="{d}"/>')
        dur = 1.6 if d.startswith("M196") else 2.2
        p.append(f'<circle class="dot" r="2.6"><animateMotion dur="{dur}s" begin="{(k * 0.37) % 2:.2f}s" '
                 f'repeatCount="indefinite" path="{d}"/></circle>')
    p.append("</svg>")
    return "\n".join(p)


# ---------------------------------------------------------------- cpu map

ANNOTATIONS = [
    ("simd", "① SIMD · yolow64", "AVX2 / NEON kernels, picked at runtime;", "20 GB/s Base64 decode with full validation"),
    ("l1", "② L1d · yolowhtml", "block content model: 125 depth-5 oblivious trees,", "≈ 11 KiB of weights that stay L1-resident"),
    ("l2", "③ L2 · yolowzstd", "match tables budgeted from the detected cache;", "generation-stamped, no per-call memset"),
    ("llc", "④ LLC · yolow64", "non-temporal stores past 3/7 of the LLC:", "16 MiB encode 7.36 → 13.0 GB/s"),
    ("core", "⑤ cores · pagesift-flow + yolowzstd", "cgroup-sized NUMA worker pool;", "parallel zstd frames, decoded in parallel"),
]


def cpu(c):
    W, H = 1000, 470
    cycle = 2.4 * len(ANNOTATIONS)
    p = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" '
         f'aria-label="Where the code lives: each hot path is sized to a level of the CPU memory hierarchy.">']
    css = [base_css(c),
           f"  .unit{{fill:{c['panel']};stroke:{c['line']};stroke-width:1}}\n",
           f"  .ulabel{{font:600 11px {MONO};fill:{c['muted']}}}\n",
           f"  .die{{fill:{c['bg']};stroke:{c['line']};stroke-width:1.5}}\n",
           f"  .ann{{opacity:.45}}\n",
           f"  @keyframes hl{{0%,16%{{fill:{c['glow']};stroke:{c['rust']};stroke-width:2}}19%,100%{{}}}}\n",
           f"  @keyframes on{{0%,16%{{opacity:1}}19%,100%{{opacity:.45}}}}\n"]
    for k, (key, *_rest) in enumerate(ANNOTATIONS):
        delay = k * 2.4
        css.append(f"  .hl-{key}{{animation:hl {cycle}s {delay}s infinite}}\n")
        css.append(f"  .ann-{key}{{animation:on {cycle}s {delay}s infinite}}\n")
    p.append("<style>" + "".join(css) + "</style>")
    p.append(f'<rect class="bg" x=".5" y=".5" width="{W-1}" height="{H-1}" rx="14"/>')
    p.append(t(28, 48, "where the code lives", "h2"))
    p.append(t(28, 74, "Hot paths are sized to a level of the memory hierarchy — detected at runtime, with portable fallbacks.", "sub"))

    # die
    p.append('<rect class="die" x="24" y="96" width="528" height="316" rx="12"/>')
    p.append(t(38, 116, "CPU", "cap"))
    for r in range(2):
        for col in range(2):
            x0, y0 = 40 + col * 252, 126 + r * 116
            n = r * 2 + col
            p.append(f'<rect class="unit hl-core" x="{x0}" y="{y0}" width="244" height="106" rx="9"/>')
            p.append(t(x0 + 12, y0 + 18, f"core {n}", "ulabel"))
            p.append(f'<rect class="unit hl-simd" x="{x0+12}" y="{y0+28}" width="104" height="30" rx="6"/>')
            p.append(t(x0 + 64, y0 + 48, "SIMD", "ulabel", "middle"))
            p.append(f'<rect class="unit hl-l1" x="{x0+124}" y="{y0+28}" width="108" height="30" rx="6"/>')
            p.append(t(x0 + 178, y0 + 48, "L1d", "ulabel", "middle"))
            p.append(f'<rect class="unit hl-l2" x="{x0+12}" y="{y0+66}" width="220" height="30" rx="6"/>')
            p.append(t(x0 + 122, y0 + 86, "L2", "ulabel", "middle"))
            if n == 0:
                for (cx, cy, s) in [(x0 + 26, y0 + 48, "①"), (x0 + 138, y0 + 48, "②"), (x0 + 26, y0 + 86, "③")]:
                    p.append(t(cx, cy, s, "tag", "middle"))
    p.append('<rect class="unit hl-llc" x="40" y="362" width="496" height="38" rx="8"/>')
    p.append(t(288, 386, "L3 / LLC (shared)", "ulabel", "middle"))
    p.append(t(56, 386, "④", "tag", "middle"))
    p.append(t(526, 116, "⑤ all cores", "tag", "end"))
    p.append('<rect class="unit" x="24" y="422" width="528" height="30" rx="8"/>')
    p.append(t(288, 442, "DRAM", "ulabel", "middle"))

    # annotations
    for k, (key, tag, l1, l2) in enumerate(ANNOTATIONS):
        y = 122 + k * 66
        p.append(f'<g class="ann ann-{key}">')
        p.append(t(584, y, tag, "tag"))
        p.append(t(584, y + 20, l1, "note"))
        p.append(t(584, y + 38, l2, "note"))
        p.append("</g>")
    p.append(t(976, 456, "numbers: each repo's own benchmark pages", "small", "end"))
    p.append("</svg>")
    return "\n".join(p)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, c in THEMES.items():
        (OUT / f"pipeline-{name}.svg").write_text(pipeline(c), encoding="utf-8")
        (OUT / f"cpu-{name}.svg").write_text(cpu(c), encoding="utf-8")
    print("wrote", sorted(x.name for x in OUT.glob("*.svg")))


if __name__ == "__main__":
    main()
