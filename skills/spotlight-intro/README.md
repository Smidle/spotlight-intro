# Spotlight Intro — skill

A reusable skill that turns **a list into an animated title open** by spotlighting
one entry from it.

> Give it any collection — a directory of departments, a product catalog, a member
> roster, a list of cities — and the one item to highlight. A waterfall of the
> whole list streams in from the right; the hero item locks dead-centre, holds,
> then zooms straight up past the edges while a brand-color circle blooms beneath
> it and the frame settles on a solid color.

![mid-zoom still](docs/preview.png)

## Sample

`docs/sample.mp4` — a finished reference cut: the **Network Department** singled
out of a company's full department directory (orange hero on blue bloom, white
background, 1920×1080, 6.2s).

## Contents

| File | What it is |
|------|------------|
| `SKILL.md` | The skill prompt — when to use it, the effect beat-by-beat, the hard-won rules, the inputs to ask for, reference parameters. |
| `render.js` | The complete, parameterized renderer. Edit the `CONFIG` block, run it, inspect the check frames, ship the MP4. |
| `docs/sample.mp4` | Finished sample video. |
| `docs/preview.png` | Mid-zoom still from the sample. |

## Quick start

1. Open `render.js`, edit the `CONFIG` block: the hero item, the full list, the
   two brand colors, dimensions (1920×1080 or 1080×1920), and bitrate.
2. Run it in an environment that provides `createCanvas` / `saveFile` / `log`
   plus the browser `VideoEncoder` + `VideoFrame` (it fetches `mp4-muxer` at
   runtime).
3. It writes the MP4 and a handful of check frames, and logs an item-coverage
   count. **Always eyeball a mid-zoom frame and the final frame** before
   delivering.

## The non-negotiable rules

- Everything **slides in from off-screen** — nothing fades in.
- The zoom is **centered and vertical only** — no sideways drift.
- The bloom circle is drawn **under** the hero, so it stays readable.
- **Glow only during the still hold**, off before the zoom (a scaled blur = mush).
- **Gentle long zoom** (`inCubic` over ~2s) + **~16 Mbps** to avoid motion blur
  and banding on the giant glyphs.
- **End on a solid color** so the open can hard-cut into the next segment.
- **Every item in the list actually appears** (rotate the list per row; verify).

See `SKILL.md` for the full reasoning behind each.
