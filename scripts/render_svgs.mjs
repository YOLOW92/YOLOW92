// Generate all five animations in both themes; Node.js standard library only.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const specs = [
  {
    "slug": "pagesift",
    "name": "PageSift",
    "tag": "FROM BYTES TO EVIDENCE",
    "intro": "A local-first Rust engine for verifiable AI context.",
    "scenes": [
      [
        "One stack, six primitives",
        "Data moves from native parsing into structured evidence.",
        "flow",
        [
          "HTML / PDF / Office / code",
          "6 YOLOW crates",
          "DataGraph / ContextPack",
          "Resolve / Markdown / JSON"
        ],
        "Spec-first · native Rust · provenance"
      ],
      [
        "Learn which route works",
        "Thompson sampling explores alternatives using observed outcomes.",
        "bars",
        [
          [
            "HTTP",
            0.82
          ],
          [
            "Embedded JSON",
            0.63
          ],
          [
            "Browser",
            0.42
          ]
        ],
        "Beta posterior: Beta(α + successes, β + failures) · illustration"
      ],
      [
        "Detect drift, not noise",
        "Two-sided CUSUM accumulates evidence of a change in the mean.",
        "drift",
        [],
        "Page (1954) · Hinkley (1971) · h = σ²/Δμ · ln(1/δ)"
      ],
      [
        "Find the concurrency sweet spot",
        "Fit throughput online; avoid contention and coherence collapse.",
        "curve",
        [],
        "Gunther USL · N* = √((1 − σ)/κ) · schematic"
      ],
      [
        "Fit execution to the machine",
        "cgroup admission and NUMA-aware workers bound live resources.",
        "hardware",
        [
          "NUMA node 0",
          "NUMA node 1",
          "Memory budget",
          "Worker admission"
        ],
        "Adaptive scheduling · bounded memory · local evidence"
      ]
    ]
  },
  {
    "slug": "yolow64",
    "name": "yolow64",
    "tag": "BIT ALGEBRA × SIMD",
    "intro": "Base64 with full validation and hardware-specific kernels.",
    "scenes": [
      [
        "Regroup the bits",
        "Three octets become four independent six-bit indices.",
        "bits",
        [
          "010011",
          "010110",
          "000101",
          "101110"
        ],
        "RFC 4648 · Man → TWFu · 24 = 4 × 6"
      ],
      [
        "Turn a vector into a lookup",
        "AVX-512 VBMI extracts fields and permutes the alphabet.",
        "lanes",
        [
          "48 input bytes",
          "VPMULTISHIFTQB",
          "VPERMB",
          "64 output characters"
        ],
        "512-bit registers · 64 lanes · encode kernel"
      ],
      [
        "Validate while decoding",
        "A full-domain lookup and validity checks reject invalid characters.",
        "flow",
        [
          "ASCII bytes",
          "VPERMT2B",
          "Validity mask",
          "Packed output"
        ],
        "VBMI decoder · strict padding / alphabet semantics"
      ],
      [
        "Choose the hardware path",
        "Runtime dispatch selects a supported kernel, not a universal assumption.",
        "tiles",
        [
          "VBMI2",
          "VBMI",
          "AVX-512 BW",
          "AVX2",
          "NEON",
          "Scalar"
        ],
        "x86 tiers + AArch64 fallback · BMI2 detected independently"
      ],
      [
        "Respect the cache",
        "Streaming stores reduce cache pollution for suitable cold buffers.",
        "hardware",
        [
          "SIMD registers",
          "L1 / L2",
          "Shared LLC",
          "Memory / NT stores"
        ],
        "Zen 5: 101.4 GB/s decode at 16 KiB · repository benchmark"
      ]
    ]
  },
  {
    "slug": "yolowzstd",
    "name": "yolowzstd",
    "tag": "ENTROPY × CACHE",
    "intro": "Safe Rust Zstandard with adaptive entropy and match engines.",
    "scenes": [
      [
        "Entropy sets the target",
        "Frequent symbols receive shorter prefix codes.",
        "bars",
        [
          [
            "e · 2 bits",
            0.48
          ],
          [
            "t · 3 bits",
            0.26
          ],
          [
            "a · 3 bits",
            0.16
          ],
          [
            "n · 4 bits",
            0.1
          ]
        ],
        "H(X) = −Σ p log₂ p · Shannon (1948); Huffman (1952) · illustrative frequencies"
      ],
      [
        "Two symbols, one lookup",
        "A 12-bit window can consume two prefix codes in one table access.",
        "huff",
        [
          "010",
          "00",
          "011",
          "1010"
        ],
        "Moffat & Turpin (1997) · 4096 × 4 B = 16 KiB"
      ],
      [
        "Choose table precision",
        "Quantize symbol frequencies under an exact integer slot budget.",
        "bars",
        [
          [
            "A · 8 slots",
            0.5
          ],
          [
            "B · 5 slots",
            0.3125
          ],
          [
            "C · 3 slots",
            0.1875
          ]
        ],
        "FSE · Σ qᵢ = 2ᴸ · KL-guided normalization / MDL · example"
      ],
      [
        "Filter eight tags at once",
        "SWAR equality masks remove candidates before full comparisons.",
        "swar",
        [
          "2A",
          "19",
          "2A",
          "04",
          "B3",
          "2A",
          "12",
          "88"
        ],
        "Warren, Hacker’s Delight · safe u64 arithmetic · mask 00100101"
      ],
      [
        "Optimize parsing, not just matching",
        "The high-level encoder minimizes estimated bit cost over a chunk.",
        "dag",
        [],
        "Q3 fixed-point entropy · BT4 · 4096-position chunked DP"
      ]
    ]
  },
  {
    "slug": "yolowhtml",
    "name": "yolowhtml",
    "tag": "STATISTICS × DOM",
    "intro": "HTML5 parsing and a learned fallback for main-content recovery.",
    "scenes": [
      [
        "Represent a page as blocks",
        "DOM features describe density, entropy and structural repetition.",
        "tiles",
        [
          "Text density",
          "Link density",
          "Character entropy",
          "Sibling repetition",
          "DOM structure",
          "86 features"
        ],
        "Fallback block model · WCXB development split"
      ],
      [
        "Five tests become one index",
        "An oblivious tree uses identical tests per depth; five bits address a leaf.",
        "tree",
        [
          "1",
          "0",
          "1",
          "1",
          "0"
        ],
        "CatBoost · Prokhorenkova et al. (2018) · 125 depth-5 trees"
      ],
      [
        "Choose the F1-optimal cut",
        "Sort calibrated probabilities and maximize word-weighted expected F1.",
        "bars",
        [
          [
            "nav",
            0.12
          ],
          [
            "title",
            0.93
          ],
          [
            "paragraph",
            0.84
          ],
          [
            "short p",
            0.36
          ],
          [
            "aside",
            0.18
          ]
        ],
        "Lipton et al. (2014) · θ* = F1*/2 · example threshold 0.40",
        0.4
      ],
      [
        "Decode the coherent sequence",
        "A nearby low-score block can survive a global sequence decision.",
        "viterbi",
        [],
        "Web2Text · Vogels et al. (2018) · penalty λ₀ + λ₁/(1 + dLCA)"
      ],
      [
        "Keep the model cache-resident",
        "Compact weights and independent comparisons reduce pointer chasing.",
        "hardware",
        [
          "86 features",
          "125 trees",
          "≈11 KiB weights",
          "32 KiB L1d"
        ],
        "Safe Rust · 128-wide feature buffer · 32 leaves per tree"
      ]
    ]
  },
  {
    "slug": "yolowpdf",
    "name": "yolowpdf",
    "tag": "GEOMETRY × LEARNING",
    "intro": "Native PDF extraction with an optional pure-Rust OCR engine.",
    "scenes": [
      [
        "Map glyphs into page space",
        "Text rendering matrices transform a glyph into physical coordinates.",
        "geometry",
        [],
        "ISO 32000-2 §9.4.4 · Tᵣₘ = Tscale · Tₘ · CTM"
      ],
      [
        "Recover reading order",
        "Recursive X-Y cuts separate spanning rows and local columns.",
        "columns",
        [],
        "Recursive XY-cut · Nagy et al. (1992) · geometric gutters"
      ],
      [
        "Reconstruct two-dimensional math",
        "Glyph rows, delimiters and column cuts recover matrix structure.",
        "matrix",
        [],
        "Native LaTeX reconstruction · HMM text/math segmentation"
      ],
      [
        "Recognize sequences without alignment",
        "CTC collapses adjacent repeated labels, then removes blanks.",
        "ctc",
        [
          "–",
          "A",
          "A",
          "–",
          "B",
          "B",
          "–"
        ],
        "Graves et al. (2006) · illustrative CTC path → AB"
      ],
      [
        "Route models to available compute",
        "Fast uses v2; Accurate uses det_v2 and completed v3 recognizers.",
        "tiles",
        [
          "Native text",
          "OCR · Fast v2",
          "OCR · Accurate v3",
          "CPU fallback",
          "NVIDIA CUDA",
          "BF16 weights"
        ],
        "v0.2.1 · unfinished v3 detection/layout/formula previews are not defaults"
      ]
    ]
  }
];
function render(s,theme){
const c=theme==="dark"?{bg:"#0d1117",panel:"#161b22",line:"#30363d",text:"#e6edf3",muted:"#9da7b3",accent:"#f0883e",blue:"#58a6ff",green:"#56d364",soft:"#242e3a"}:{bg:"#ffffff",panel:"#f6f8fa",line:"#d0d7de",text:"#1f2328",muted:"#57606a",accent:"#a74100",blue:"#0969da",green:"#116329",soft:"#e6edf5"};
const e=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const t=(x,y,v,cls="body",a="start")=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${a}">${e(v)}</text>`;
const rect=(x,y,w,h,fill=c.panel,stroke=c.line,rx=8)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;
const line=(x1,y1,x2,y2,color=c.line,extra="")=>`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" fill="none" stroke-width="1.6" ${extra}/>`;
const dot=(x,y,r=4,color=c.accent)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const path=(d,col=c.accent,extra="")=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const tile=(x,y,w,h,v,accent=false)=>rect(x,y,w,h,accent?c.soft:c.panel,accent?c.accent:c.line)+t(x+w/2,y+h/2+5,v,accent?"accent":"body","middle");
const arrow=(x1,y1,x2,y2)=>line(x1,y1,x2,y2,c.blue,'marker-end="url(#arrow)"');
function graphic(kind,data,threshold){
let p="";
if(kind==="flow"||kind==="lanes"){
  const w=kind==="flow"?176:172, gap=24;data.forEach((v,i)=>{const x=26+i*(w+gap);p+=tile(x,160,w,66,v,i===1||i===2);if(i<3)p+=arrow(x+w+3,193,x+w+gap-4,193);});
  if(kind==="lanes"){for(let j=0;j<16;j++)p+=rect(80+j*40,245,33,12,j%4===0?c.accent:c.soft,c.line,2);p+=t(400,285,"Register lanes shown schematically","small","middle");}
}else if(kind==="bars"){
 const n=data.length, h=n>4?24:29;data.forEach(([label,v],i)=>{let y=135+i*(h+7);p+=t(35,y+17,label,"mono")+rect(220,y,460,h,c.panel,c.line,4)+rect(220,y,460*v,h,typeof threshold==="number"?(v>=threshold?c.green:c.muted):c.blue,"none",4)+t(704,y+18,Math.round(v*100)+"%","mono");});if(typeof threshold==="number")p+=line(220+460*threshold,128,220+460*threshold,295,c.accent,'stroke-dasharray="4 4"');
}else if(kind==="bits"){
 data.forEach((v,i)=>{const x=54+i*181;p+=rect(x,142,160,56,c.panel,i%2?c.blue:c.accent)+t(x+80,177,v,"large","middle")+t(x+80,219,[19,22,5,46][i],"mono","middle")+arrow(x+80,228,x+80,245)+tile(x+49,250,62,44,["T","W","F","u"][i],true);});
}else if(kind==="tiles"){
 const w=234;data.forEach((v,i)=>{const x=26+(i%3)*257,y=139+Math.floor(i/3)*74;p+=tile(x,y,w,56,v,i===0||i===data.length-1);});
}else if(kind==="hardware"){
 data.forEach((v,i)=>{const w=270+i*94,x=400-w/2,y=132+i*39;p+=rect(x,y,w,32,i===2?c.soft:c.panel,i===2?c.accent:c.line,5)+t(400,y+21,v,i===2?"accent":"mono","middle");});
}else if(kind==="drift"){
 p+=line(64,278,750,278)+line(64,133,64,278)+line(64,175,750,175,c.muted,'stroke-dasharray="5 5"');
 const a=[240,243,235,240,245,238,236,239,215,199,180,161,143,138,135];p+=path(a.map((y,i)=>(i?"L":"M")+(72+i*47)+" "+y).join(" "),c.blue);p+=line(72+11*47,134,72+11*47,278,c.accent,'stroke-dasharray="5 5"')+t(575,155,"alarm","accent")+t(740,171,"threshold","small","end")+t(74,298,"observations →","small");
}else if(kind==="curve"){
 p+=line(64,280,742,280)+line(64,126,64,280);let pts=[];for(let n=1;n<=36;n++){let v=n/(1+.045*(n-1)+.005*n*(n-1));pts.push([70+n*18,280-v*24]);}p+=path(pts.map(([x,y],i)=>(i?"L":"M")+x+" "+y).join(" "),c.blue);let peak=pts.reduce((a,b)=>a[1]<b[1]?a:b);p+=line(peak[0],peak[1],peak[0],280,c.accent,'stroke-dasharray="4 5"')+dot(...peak,5)+t(peak[0]+12,peak[1]-8,"fitted peak N*","accent")+t(730,300,"concurrency →","small","end");
}else if(kind==="huff"){
 p+=t(40,135,"12-bit lookahead","small");let str=data.join("");[...str].forEach((b,i)=>{p+=rect(40+i*34,147,32,40,i<5?c.soft:c.panel,i<5?c.accent:c.line,3)+t(56+i*34,173,b,"mono","middle");});
 p+=rect(40,143,408,48,"none",c.blue,4)+arrow(242,198,242,225)+tile(125,232,235,48,"t · e  |  consumed 5 bits",true)+tile(430,232,320,48,"11-bit single table: 4 KiB");
}else if(kind==="swar"){
 data.forEach((v,i)=>{let x=36+i*91,hit=v==="2A";p+=tile(x,144,76,42,v,hit)+t(x+38,211,hit?"1":"0",hit?"accent":"mono","middle");});p+=t(400,255,"target 0x2A  →  compare only matching candidates","body","middle");
}else if(kind==="dag"){
 const xs=[85,245,405,565,725];xs.forEach((x,i)=>{p+=dot(x,235,7,i===0||i===4?c.green:c.muted)+t(x,258,"p"+i,"mono","middle");if(i<4)p+=line(x+9,235,xs[i+1]-9,235,c.muted);});
 p+=path("M85 225 Q245 105 405 225",c.accent)+path("M405 225 Q565 105 725 225",c.accent)+t(245,165,"match edge","small","middle")+t(565,165,"match edge","small","middle")+t(400,290,"shortest estimated bit-cost path","accent","middle");
}else if(kind==="tree"){
 data.forEach((b,i)=>{let x=60+i*145;p+=tile(x,145,110,48,"test "+(i+1)+": "+b,true);if(i<4)p+=arrow(x+112,169,x+141,169);});p+=arrow(400,202,400,226)+tile(260,235,280,50,"10110₂ = leaf 22",true);
}else if(kind==="viterbi"){
 const xs=[140,270,400,530,660];p+=t(32,163,"keep","small")+t(32,248,"drop","small");xs.forEach((x,i)=>{if(i<4){line;for(let y of [160,245])for(let z of [160,245])p+=line(x,y,xs[i+1],z,c.line);}p+=dot(x,160,7,c.muted)+dot(x,245,7,c.muted);p+=t(x,285,["nav","title","short p","body","footer"][i],"small","middle");});p+=path("M140 245L270 160L400 160L530 160L660 245",c.green);[245,160,160,160,245].forEach((y,i)=>p+=dot(xs[i],y,6,c.green));p+=t(400,142,"low score, coherent neighbors","accent","middle");
}else if(kind==="geometry"){
 p+=rect(75,132,180,150,c.panel,c.line)+line(100,250,230,250)+line(100,250,100,148)+rect(120,171,64,65,c.soft,c.accent)+t(152,217,"A","large","middle")+arrow(272,205,470,205)+t(370,188,"Tₘ · CTM","mono","middle")+rect(480,129,220,158,c.panel,c.line);
 p+=`<g transform="translate(544 163) rotate(-14)">${rect(0,0,64,65,c.soft,c.blue)}${t(32,44,"A","large","middle")}</g>`+t(590,275,"page coordinates","small","middle");
}else if(kind==="columns"){
 p+=rect(170,128,460,168,c.panel,c.line);p+=rect(190,141,420,20,c.soft,c.blue,3);for(let col=0;col<2;col++)for(let j=0;j<6;j++)p+=rect(190+col*222,174+j*17,190-(j===5?45:0),7,c.muted,"none",2);p+=line(400,168,400,289,c.accent,'stroke-dasharray="4 4"')+line(180,166,620,166,c.accent,'stroke-dasharray="4 4"')+t(112,153,"1 · title","small")+t(110,213,"2 · left","small")+t(643,213,"3 · right","small");
}else if(kind==="matrix"){
 p+=t(130,165,"glyph boxes","small","middle");for(let i=0;i<2;i++)for(let j=0;j<2;j++)p+=tile(79+j*65,176+i*47,52,38,["a","b","c","d"][i*2+j]);p+=arrow(230,218,395,218)+t(310,201,"row / column cuts","small","middle")+rect(410,145,320,143,c.panel,c.line)+t(570,195,"\\begin{pmatrix}","mono","middle")+t(570,222,"a & b \\\\ c & d","mono","middle")+t(570,249,"\\end{pmatrix}","mono","middle");
}else if(kind==="ctc"){
 data.forEach((v,i)=>{p+=tile(52+i*100,145,80,52,v,v!=="–");});p+=arrow(400,206,400,238)+tile(260,245,280,45,"collapse → remove blanks → AB",true);
}
return p;
}
const n=s.scenes.length,duration=n*7;
let css=`.bg{fill:${c.bg};stroke:${c.line}}text{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;fill:${c.text}}.name{font-size:26px;font-weight:700;letter-spacing:-.5px}.tag{font:600 12px ui-monospace,monospace;letter-spacing:1.8px;fill:${c.accent}}.sub{font-size:15px;fill:${c.muted}}.heading{font-size:24px;font-weight:650;letter-spacing:-.4px}.body{font-size:15px}.small{font-size:13px;fill:${c.muted}}.mono{font:14px ui-monospace,monospace}.accent{font:600 14px ui-monospace,monospace;fill:${c.accent}}.large{font:600 23px ui-monospace,monospace}.scene{opacity:0}.scene0{opacity:1}`;
for(let i=0;i<n;i++){let a=i*100/n,b=(i+1)*100/n, f=1.1;const k=i===0?`0%,${b-f}%{opacity:1;transform:translateY(0)}${b}%{opacity:0;transform:translateY(-5px)}${100-f}%{opacity:0;transform:translateY(5px)}100%{opacity:1;transform:translateY(0)}`:`0%,${a}%{opacity:0;transform:translateY(5px)}${a+f}%,${b-f}%{opacity:1;transform:translateY(0)}${b}%,100%{opacity:0;transform:translateY(-5px)}`;css+=`@keyframes scene${i}{${k}}.scene${i}{animation:scene${i} ${duration}s linear infinite}`;}
css+=`@media(prefers-reduced-motion:reduce){.scene{animation:none!important;opacity:0}.scene0{opacity:1}}`;
let out=`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="365" viewBox="0 0 800 365" role="img" aria-label="${e(s.name+": "+s.scenes.map(x=>x[0]).join("; "))}"><title>${e(s.name+" — "+s.tag)}</title><desc>${e(s.intro+" "+s.scenes.map(x=>x[1]+" "+x[4]).join(" "))}</desc><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="${c.blue}"/></marker></defs><style>${css}</style><rect class="bg" x=".5" y=".5" width="799" height="364" rx="14"/>${t(27,38,s.name,"name")}${t(773,35,s.tag,"tag","end")}${line(26,54,774,54)}`;
s.scenes.forEach(([title,subtitle,kind,data,note,threshold],i)=>{out+=`<g class="scene scene${i}">${t(27,86,title,"heading")}${t(27,108,subtitle,"sub")}${graphic(kind,data,threshold)}${line(26,310,774,310)}${t(27,333,note,"small")}${t(773,351,String(i+1).padStart(2,"0")+" / "+String(n).padStart(2,"0"),"mono","end")}`;for(let j=0;j<n;j++)out+=rect(27+j*42,343,34,4,j===i?c.accent:c.line,"none",2);out+="</g>";});
return out+"</svg>\n";
}
const out=fileURLToPath(new URL('../assets/',import.meta.url));
mkdirSync(out,{recursive:true});
for(const s of specs)for(const theme of ['light','dark'])writeFileSync(join(out,`${s.slug}-${theme}.svg`),render(s,theme),'utf8');
