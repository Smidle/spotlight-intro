---
name: Spotlight Intro
description: >-
  Turn a list into a 6-second animated title open: a waterfall of the list's
  items streams across the frame, then ONE item you choose — the "hero" — slides
  to the centre, holds, and zooms straight up past the edges while a brand-color
  circle blooms beneath it and the frame settles on a solid color. The input is
  any collection (a directory of teams/departments, a product catalog, a member
  roster, a list of cities, customer names, features…) plus the one item to
  spotlight. Renders to a real MP4, landscape (16:9) or vertical (9:16).
when_to_use: >-
  Trigger whenever someone gives a list/directory and wants to highlight or
  introduce one entry from it as a punchy animated opener: "intro video for our
  team out of all the departments", "highlight this product from our catalog",
  "kinetic typography open", "name flies in and zooms to fill the screen", "make
  a brand open that picks one out of a crowd". The defining shape is: many items
  flood in, one wins and takes over the screen.
---

# Spotlight Intro

A 6.2-second animated opener that **picks one item out of a crowd**. You give it
a list and say which entry is the hero; it floods the frame with the whole list,
then makes the hero win — sliding to centre, holding, and zooming past the edges
onto a clean solid-color end frame.

It is rendered frame-by-frame to MP4 with the WebCodecs `VideoEncoder` +
`mp4-muxer` (drawn on a single `<canvas>`), so it exports as a real video at
full quality — not a slide.

**The list can be anything:** a directory of departments or teams, a product
catalog, a member/staff roster, a list of office cities, customer or partner
names, product features, course modules — any collection where one entry should
be singled out and introduced.

## Sample

`docs/sample.mp4` is a finished reference cut: the **Network Department** picked
out of a company's full department directory (orange hero on a blue bloom, white
background, 1920×1080). `docs/preview.png` is a mid-zoom still from it.

![mid-zoom still](docs/preview.png)

## The effect, beat by beat

The animation has one job: bury the hero in a crowd, then make it win.

1. **Empty → flood (0–2.7s).** The frame starts essentially blank. Four outer
   rows of filler items (drawn from the list) and one centre band all begin
   **off-screen to the right** and slide left at different speeds, so the screen
   floods with moving type. Rows travel at different speeds (700–840 px/s) so the
   motion never looks like one rigid block.
2. **Hero locks centre (≈2.7s).** The centre band carries the hero item. It
   slides in with the crowd and **stops dead-centre** while the filler rows keep
   flowing behind it. A soft brand-color glow blooms on the hero as it settles.
3. **Hold (2.7–3.7s).** The hero sits still for ~1 second so the eye locks onto
   it. The glow fades back out *before* the zoom (a glow that scales with the
   text turns into a blur — kill it first).
4. **Zoom + bloom (3.7–5.8s).** The hero zooms **straight up from the centre**
   (no horizontal drift — drift reads as "broken"). Simultaneously a solid
   brand-color circle blooms **from beneath the hero** (rendered *under* it) and
   grows past the screen corners. The filler rows dim to ~7% so only the hero
   reads.
5. **Settle on solid color (5.8–6.2s).** As the giant letters blow past all four
   edges, the hero fades out in the final beat and the frame settles on a clean,
   solid brand color — ready to hard-cut into whatever comes next.

## Hard-won rules (every one of these came from a real revision)

These are not style preferences — they are the difference between "looks
professional" and "looks broken". Honor them.

- **Everything slides in from off-screen. Nothing fades in.** Items enter by
  moving, never by opacity. Set each row's start X *beyond* the right edge
  (`x0 ≥ 1980` for a 1920-wide frame) and verify the frame is near-empty at
  `t=0`. An item already on-screen at `t=0` is a bug.
- **The hero is present the whole time** — it streams in with the crowd, it does
  not pop or fade into existence.
- **The zoom is centered and vertical only.** No translate during the zoom. A
  hero that drifts sideways while growing looks like a mistake ("跑偏").
- **The bloom circle sits *below* the hero text, not on top.** The hero must
  stay readable on the circle (high-contrast complementary colors — e.g. orange
  text on a blue circle). Drawing the circle on top swallows the word too early.
- **Glow only during the still hold; off before the zoom.** A blur radius that
  gets multiplied by the zoom scale becomes a smeared mess. Ramp the glow up as
  the hero settles, ramp it to zero just before `T_ZOOM`.
- **Use a gentle, long zoom easing (`inCubic` over ~2s), not a fast one.** A
  short/steep zoom produces motion blur on the giant glyphs. Slow and long stays
  crisp.
- **End on a solid color.** The last frame should be a flat brand color with no
  leftover text, so the open can cut cleanly into the next segment.
- **All filler items must actually appear.** Rotate the list by a different
  offset per row (`rotate(LIST, rowIdx*3+1)`) so you don't show the same three
  items over and over while the rest never surface. Verify coverage
  programmatically (the render script logs a distinct-items count).
- **High bitrate for the zoom.** The giant flat-color glyphs need ~16 Mbps or
  the codec bands the zoom. 8 Mbps is fine for a deck, not for this.

## Inputs you need from the user

Ask for these before building:

1. **Hero item** — the one entry to spotlight (e.g. "Network Department",
   a product name, a person, a city).
2. **The full list** — every item to flood the frame with. Use the *complete*
   list; don't silently drop entries. If the count looks off, say so.
3. **Two brand colors** — a hero/text color and a bloom color, ideally
   complementary and high-contrast (the sample uses orange `#f58426` text + blue
   `#005daa` bloom).
4. **Background** — light (white) or dark (black). Filler text color follows:
   ~50% black on white, ~white on black.
5. **Orientation** — landscape `1920×1080` and/or vertical `1080×1920` (for
   WeChat Channels / 小红书 etc.). Vertical needs more rows and a smaller hero
   font so a long name fits the narrow width.
6. **What follows the solid-color end frame** — logo, tagline, mission, etc.
   (so the open can be chained into a longer piece later).

## How to build it

1. Read `render.js` — it is the complete, parameterized renderer. Copy it into
   the project and edit the `CONFIG` block at the top (hero, list, colors,
   dimensions, bitrate). `DEPTS` is just the variable name for the list; put any
   collection there.
2. Run it via the `run_script` tool (it uses `fetch` for `mp4-muxer`, the
   `createCanvas` helper, `saveFile`, and the browser `VideoEncoder`).
3. The script also writes a few check frames to `scraps/` and logs a
   distinct-items coverage count. **Always inspect a mid-zoom frame and the final
   frame** with `view_image` before delivering — confirm the hero is centered
   (not drifting), readable on the circle, and the last frame is solid color.
4. Present the MP4 with `present_fs_item_for_download`.

## Tuning notes

- **Vertical (9:16):** drop `HERO_FS` to ~78–92, raise the row count to 6–7,
  shorten row text or reduce `CENTER_GAP`, and re-check that the hero fits the
  1080 width at scale 1 with margin.
- **Different hold length:** move `T_ZOOM` (later = longer hold). Keep at least
  ~0.8s of stillness or the eye never locks on.
- **Snappier vs. grander:** total duration is driven by the zoom end (`5.8`) and
  the encoder `DUR`. Grow the zoom-scale multiplier (`16.0`) for a more explosive
  finish; the fade window (`5.2→5.85`) must end before `DUR`.

## Reference parameters (the sample cut)

```
dimensions   1920 × 1080,  30 fps,  6.2 s,  16 Mbps (avc1.42E028)
colors       hero #f58426 (orange) · bloom #005daa (blue) · bg #ffffff
             filler rgba(0,0,0,0.5)
font         Archivo 800 (Google Fonts / fontsource woff2)
T_CENTER 2.7 · T_ZOOM 3.7 · HERO_SPEED 840 · HERO_FS 118
zoom         scale 1 → 17  (1 + inCubic·16) over 3.7→5.8s, origin centre
bloom        radius 0 → past corners over 3.9→5.8s (Ease.outCubic), drawn UNDER hero
hero fade    1 → 0 over 5.2→5.85s (only to settle on solid color)
glow         blooms T_CENTER-0.25→T_CENTER, off by T_ZOOM
rows (4)     y/fs/speed/x0:
             130/84/700/1980 · 320/116/820/2300 · 760/124/760/2080 · 950/80/740/2450
```
