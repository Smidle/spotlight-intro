// Kinetic Department Intro — standalone MP4 renderer.
//
// Paste this whole file into the `run_script` tool (it relies on that tool's
// helpers: fetch, createCanvas, saveFile, log — plus the browser's VideoEncoder
// and VideoFrame). Edit CONFIG, run, inspect the check frames it writes to
// scraps/, then present the MP4.
//
// The effect: a flood of `DEPTS` names streams in from the right; `HERO` locks
// dead-centre, holds, then zooms straight up from the centre past the edges
// while a `BLOOM` circle grows beneath it and the frame settles on solid color.

/* ───────────────────────── CONFIG — edit me ───────────────────────── */
const CONFIG = {
  HERO: 'Network Department',
  DEPTS: [
    'HR Department', 'Finance Department', 'Legal Affairs Department',
    'Corporate Communications & Analytics Team', 'Marketing Team', 'IT Department',
    'Sales Department', 'Strategic Accounts Sales Team', 'ICT Team',
    'Mobile Team', 'Solutions Department',
  ],
  HERO_COLOR: '#f58426',         // hero text + glow
  BLOOM_COLOR: '#005daa',        // circle that fills the frame (the end color)
  BG: '#ffffff',                 // background
  FILLER: 'rgba(0,0,0,0.5)',    // crowd text — ~rgba(255,255,255,0.5) on dark bg
  W: 1920, H: 1080,              // 1080 x 1920 for vertical 9:16
  FPS: 30,
  DUR: 6.2,                      // seconds
  BITRATE: 16_000_000,           // ~16 Mbps keeps the giant zoom crisp
  OUT: 'Network Intro Sequence (White 16x9).mp4',
  // motion
  HERO_FS: 118,                  // ~78-92 for vertical
  HERO_SPEED: 840,               // px/s the hero travels in
  T_CENTER: 2.7,                 // hero reaches centre
  T_ZOOM: 3.7,                   // zoom begins (T_ZOOM - T_CENTER = hold length)
  ZOOM_END: 5.8,                 // zoom + bloom finish
  ZOOM_MULT: 16.0,               // final scale ≈ 1 + ZOOM_MULT
  // 4 filler rows: y, font-size, speed px/s, start-x (must be > W to start off-screen)
  ROWS: [
    { y: 130, fs: 84, speed: 700, x0: 1980 },
    { y: 320, fs: 116, speed: 820, x0: 2300 },
    { y: 760, fs: 124, speed: 760, x0: 2080 },
    { y: 950, fs: 80, speed: 740, x0: 2450 },
  ],
};
/* ───────────────────────────────────────────────────────────────────── */

const C = CONFIG;
const FF = 'Archivo, system-ui, sans-serif';
const CENTER_Y = C.H / 2, CENTER_GAP = 90;

// load the display font (Archivo 800) so canvas measures + renders it
try {
  const ff = new FontFace('Archivo',
    'url(https://cdn.jsdelivr.net/fontsource/fonts/archivo@latest/latin-800-normal.woff2)',
    { weight: '800' });
  await ff.load(); document.fonts.add(ff);
} catch (e) { log('font load failed, falling back: ' + e); }

// mp4-muxer (UMD) loaded at runtime
const src = await (await fetch('https://cdn.jsdelivr.net/npm/mp4-muxer@5.0.1/build/mp4-muxer.min.js')).text();
const mod = { exports: {} };
const M = (new Function('module', 'exports', 'self', 'window', 'globalThis',
  src + '\n;return module.exports;'))(mod, mod.exports, globalThis, globalThis, globalThis) || mod.exports;

const TOTAL = Math.round(C.DUR * C.FPS);
const E = {
  inCubic: t => t * t * t,
  inOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  outCubic: t => (--t) * t * t + 1,
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const tween = (t, a, b, f, to, e) => t <= a ? f : t >= b ? to : f + (to - f) * e((t - a) / (b - a));
const rotate = (arr, n) => { const m = ((n % arr.length) + arr.length) % arr.length; return [...arr.slice(m), ...arr.slice(0, m)]; };

const canvas = createCanvas(C.W, C.H), ctx = canvas.getContext('2d');
const mw = txt => { ctx.font = `800 ${C.HERO_FS}px ${FF}`; return ctx.measureText(txt).width; };

// each row rotates the list differently so every name gets screen time
function rowItems(ri) {
  const base = rotate(C.DEPTS, ri * 3 + 1);
  const out = [];
  for (let rep = 0; rep < 7; rep++) for (const d of base) out.push(d);
  return out;
}
// centre band: short filler ahead, HERO, the rest trailing — whole row starts off-screen
const crot = rotate(C.DEPTS, 8);
const CENTER_SEQ = [crot[0], C.HERO, ...crot.slice(1)];
const CR = (() => {
  let cursor = 0, heroCenter = 0; const items = [];
  for (const txt of CENTER_SEQ) {
    const w = mw(txt);
    if (txt === C.HERO) heroCenter = cursor + w / 2;
    else items.push({ txt, x: cursor });
    cursor += w + CENTER_GAP;
  }
  return { items, heroCenter };
})();

function draw(t) {
  // bg + faint brand vignette
  ctx.fillStyle = C.BG; ctx.fillRect(0, 0, C.W, C.H);
  const g = ctx.createRadialGradient(C.W/2, C.H/2, 0, C.W/2, C.H/2, Math.max(C.W, C.H) * 0.57);
  g.addColorStop(0, C.BLOOM_COLOR + '12'); g.addColorStop(0.6, C.BLOOM_COLOR + '00');
  ctx.fillStyle = g; ctx.fillRect(0, 0, C.W, C.H);

  const streamOp = tween(t, C.T_ZOOM, 4.5, 1, 0.07, E.inOutCubic);
  const heroTX = C.HERO_SPEED * (C.T_CENTER - Math.min(t, C.T_CENTER));

  // crowd (filler rows + centre band) — all slide left, dim once the zoom starts
  ctx.save(); ctx.globalAlpha = streamOp; ctx.textBaseline = 'middle'; ctx.fillStyle = C.FILLER;
  C.ROWS.forEach((r, ri) => {
    const items = rowItems(ri); let cx = r.x0 - r.speed * t;
    ctx.font = `800 ${r.fs}px ${FF}`;
    for (const d of items) { const w = ctx.measureText(d).width; if (cx > -w - 100 && cx < C.W + 100) ctx.fillText(d, cx, r.y); cx += w + 80; }
  });
  const centerRowX = (C.W/2 - CR.heroCenter) + heroTX; ctx.font = `800 ${C.HERO_FS}px ${FF}`;
  for (const it of CR.items) { const x = centerRowX + it.x, w = mw(it.txt); if (x > -w - 100 && x < C.W + 100) ctx.fillText(it.txt, x, CENTER_Y); }
  ctx.restore();

  // bloom circle — UNDER the hero, grows past the corners, becomes the end color
  const wipeR = tween(t, 3.9, C.ZOOM_END, 0, Math.hypot(C.W, C.H) * 0.69, E.outCubic);
  if (wipeR > 0) { ctx.fillStyle = C.BLOOM_COLOR; ctx.beginPath(); ctx.arc(C.W/2, C.H/2, wipeR, 0, Math.PI * 2); ctx.fill(); }

  // hero ON TOP — centered vertical zoom; glow only during the hold; fades out at the very end
  const zoomP = E.inCubic(seg(t, C.T_ZOOM, C.ZOOM_END));
  const heroScale = 1 + zoomP * C.ZOOM_MULT;
  const heroOp = tween(t, 5.2, 5.85, 1, 0, E.inOutCubic);
  const glowP = seg(t, C.T_CENTER - 0.25, C.T_CENTER) * (1 - seg(t, C.T_ZOOM - 0.15, C.T_ZOOM));
  if (heroOp > 0.001) {
    ctx.save(); ctx.globalAlpha = heroOp;
    ctx.translate(C.W/2 + heroTX, C.H/2); ctx.scale(heroScale, heroScale);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (glowP > 0.001) { ctx.shadowColor = `rgba(245,132,38,${0.5 * glowP})`; ctx.shadowBlur = 46 * glowP; }
    ctx.fillStyle = C.HERO_COLOR; ctx.font = `800 ${C.HERO_FS}px ${FF}`;
    ctx.fillText(C.HERO, 0, 0); ctx.restore();
  }
}

// encode
const muxer = new M.Muxer({ target: new M.ArrayBufferTarget(), video: { codec: 'avc', width: C.W, height: C.H }, fastStart: 'in-memory' });
const enc = new VideoEncoder({ output: (ch, m) => muxer.addVideoChunk(ch, m), error: e => { throw e; } });
enc.configure({ codec: 'avc1.42E028', width: C.W, height: C.H, bitrate: C.BITRATE, framerate: C.FPS });
for (let i = 0; i < TOTAL; i++) {
  draw(i / C.FPS);
  const fr = new VideoFrame(canvas, { timestamp: Math.round(i * 1e6 / C.FPS), duration: Math.round(1e6 / C.FPS) });
  enc.encode(fr, { keyFrame: i % 60 === 0 }); fr.close();
}
await enc.flush(); muxer.finalize();
await saveFile(C.OUT, new Blob([muxer.target.buffer], { type: 'video/mp4' }));

// coverage check: confirm every filler name appears on-screen at some point
const seen = new Set();
for (let i = 0; i < TOTAL; i++) {
  const t = i / C.FPS;
  C.ROWS.forEach((r, ri) => { let cx = r.x0 - r.speed * t; ctx.font = `800 ${r.fs}px ${FF}`; for (const d of rowItems(ri)) { const w = ctx.measureText(d).width; if (cx > -w && cx < C.W) seen.add(d); cx += w + 80; } });
}
const missing = C.DEPTS.filter(d => !seen.has(d));
log('distinct filler names seen: ' + seen.size + '/' + C.DEPTS.length + ' · missing: ' + (missing.join(', ') || 'none'));

// check frames — ALWAYS view a mid-zoom + final frame before delivering
for (const ts of [0.25, C.T_CENTER, (C.T_ZOOM + C.ZOOM_END) / 2, C.DUR - 0.1]) {
  draw(ts); await saveFile('scraps/check_' + String(ts).replace('.', '_') + '.png', canvas);
}
log('MP4 ' + (muxer.target.buffer.byteLength / 1024).toFixed(0) + 'KB · ' + TOTAL + ' frames · ' + C.W + 'x' + C.H);
