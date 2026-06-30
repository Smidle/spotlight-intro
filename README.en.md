<p align="right">
  <a href="./README.md">简体中文</a> | English
</p>

<h1 align="center">Spotlight Intro</h1>

<p align="center">
  Turn a list into a 6-second animated title open: a waterfall of every item<br/>
  streams across the frame, then the one "hero" you choose slides to the centre,<br/>
  holds, and zooms straight up past the edges while a brand-color circle blooms<br/>
  beneath it and the frame settles on a solid color.
</p>

<p align="center">
  <img src="skills/spotlight-intro/docs/sample.gif" alt="spotlight-intro effect" width="600" />
</p>

> The clip above is a finished sample: **Network Department** singled out of a
> company's full department directory (orange hero + blue bloom, white background,
> 1920×1080, 6.2s).

## Install

```bash
npx skills add Smidle/spotlight-intro
```

> Note: this is an interactive installer. Follow the prompts to pick the skill and
> select your agent (e.g. Claude Code) — different agents store skills in different
> paths.

You can also clone this repo and copy the `skills/spotlight-intro` directory into
your own skills directory.

## What this skill does

Give it **any collection** — a directory of departments/teams, a product catalog,
a member roster, a list of cities, customer or partner names, product features,
course modules… — plus the one entry to spotlight. It floods the frame with the
whole list, then makes the hero **win**: sliding to centre, holding, and zooming
straight up past the edges onto a clean solid-color end frame.

The output is a **real MP4**, rendered frame-by-frame on a single `<canvas>` with
the WebCodecs `VideoEncoder` + `mp4-muxer` (not a slideshow). Landscape 16:9 and
vertical 9:16 are both supported.

**Trigger phrases:** intro video / kinetic typography open / "name flies in and
zooms to fill the screen" / a brand open that picks one out of a crowd — the
defining shape is *many items flood in, one wins and takes over the screen*.

## The effect, beat by beat

| Time | Action |
|------|--------|
| 0–2.7s | **Empty → flood**: the frame starts near-blank; rows of filler items slide in from off-screen right at different speeds, flooding the frame with moving type. |
| ≈2.7s | **Hero locks centre**: the centre band carries the hero, slides in with the crowd and **stops dead-centre**; a brand-color glow blooms on it. |
| 2.7–3.7s | **Hold**: the hero sits still for ~1s so the eye locks on; the glow fades out *before* the zoom. |
| 3.7–5.8s | **Zoom + bloom**: the hero zooms **straight up** from the centre while a solid brand-color circle blooms beneath it past the corners; filler dims to ~7%. |
| 5.8–6.2s | **Settle on solid color**: the giant glyphs blow past all four edges and fade out, leaving a clean solid color — ready to hard-cut into the next segment. |

## Inputs you need to provide

1. **Hero item** — the one entry to spotlight;
2. **The full list** — every item used to flood the frame (use the complete list; don't silently drop entries);
3. **Two brand colors** — a hero/text color + a bloom color, ideally complementary and high-contrast (sample: orange `#f58426` text + blue `#005daa` bloom);
4. **Background** — light (white) or dark (black);
5. **Orientation** — landscape `1920×1080` and/or vertical `1080×1920` (for WeChat Channels / Xiaohongshu, etc.);
6. **What follows the solid-color end frame** — logo, tagline, mission, etc. (so the open can be chained into a longer piece).

## Repository layout

| File | What it is |
|------|------------|
| `skills/spotlight-intro/SKILL.md` | The skill prompt: when to use it, the effect beat-by-beat, the hard-won rules, the inputs to ask for, reference parameters. |
| `skills/spotlight-intro/render.js` | The complete, parameterized renderer. Edit the `CONFIG` block, run it, inspect the check frames, ship the MP4. |
| `skills/spotlight-intro/docs/sample.mp4` | Finished sample video. |
| `skills/spotlight-intro/docs/sample.gif` | GIF preview of the sample (the clip above). |
| `skills/spotlight-intro/docs/preview.png` | Mid-zoom still from the sample. |

## The non-negotiable rules

- Everything **slides in from off-screen** — nothing fades in;
- The zoom is **centered and vertical only** — no sideways drift;
- The bloom circle is drawn **under** the hero, so the text stays readable;
- **Glow only during the still hold**, off before the zoom (a scaled blur turns to mush);
- **Gentle long zoom** (`inCubic` over ~2s) + **~16 Mbps** to avoid motion blur and banding on the giant glyphs;
- **End on a solid color** so the open can hard-cut into the next segment;
- **Every item in the list actually appears** (rotate the list per row and verify coverage).

See [`SKILL.md`](skills/spotlight-intro/SKILL.md) for the full reasoning behind each.
