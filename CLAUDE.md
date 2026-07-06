# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Skewtle is a browser-only trading card perspective-correction tool. A user uploads a photo of a card shot at an angle, drags four corner handles onto the card's edges, and the app applies a projective (homography) warp to produce a flat, correctly-proportioned, cropped output image. Everything runs client-side — no backend, no upload to a third party.

## Commands

```bash
npm install     # install deps
npm run dev     # start Vite dev server
npm run build   # tsc -b (project references) + vite build
npm run lint    # eslint .
npm run preview # preview a production build
```

There are no tests in this repo.

## Architecture

### Coordinate systems

The code juggles three distinct coordinate spaces, and most bugs in this area come from mixing them up:

1. **Natural image pixels** — `image.naturalWidth/naturalHeight`, the source photo's real resolution.
2. **Stage pixels** — the on-screen Konva `<Stage>`, scaled down to fit `MAX_WIDTH`/`MAX_HEIGHT` (`src/constants.ts`). Corner handles live in this space.
3. **Output canvas pixels** — the final cropped image, fixed width `OUTPUT_W` with height derived from the card ratio.

`App.tsx` computes `scale = min(MAX_WIDTH/naturalWidth, MAX_HEIGHT/naturalHeight, 1)` once per uploaded image and uses it to convert corner positions (stage space) back to `srcPoints` (natural image space) before handing off to the transform. Don't scale corners directly for rendering — the Konva stage already displays at stage size — only convert when computing `srcPoints`.

### Perspective transform pipeline (`src/utils/`)

- `transform.ts` is the orchestrator: builds a `Homography` instance (from the `homography` npm package) with `srcPoints` (natural-space corners) → `dstPoints` (a straight `OUTPUT_W` × `outputH` rectangle), warps the full image, then crops.
- `projective.ts` **duplicates the homography library's internal math** (LU-decomposition solve, 8-parameter projective matrix, point transform) purely to figure out `getCropOffset` — where the card's top-left actually lands in the warped `ImageData`. The library itself doesn't expose this, so this is a deliberate reimplementation, not redundant code. If the `homography` package's transform math changes, this file must be kept in sync.
- The final crop expands outward by `PAD` px on every side (see below) before scaling down to `OUTPUT_W` × `outputH`.

### PAD (`src/constants.ts`)

`PAD` insets the initial corner handle positions inward from the stage edges, and also expands the output crop region outward by the same amount. This exists because a tight crop right at the card's rectangle clips rounded card corners — see memory `project_pad_design`. Don't remove PAD or treat it as arbitrary padding; it's load-bearing for both the initial handle placement and the final crop math, and the two uses must stay in sync (`App.tsx` initial corners vs. `transform.ts` crop).

### Corner selection UI (`src/components/`)

- `CornerSelector.tsx` composes the Konva `Stage`: the uploaded image, `EdgeLines` (dashed guide lines + corner accents, computed via `pointAlongEdge` in `utils/geometry.ts`), one `DragTarget` per corner, and a conditionally-rendered `Loupe`.
- `DragTarget.tsx` is an invisible 44px hit-area `Rect` (Apple HIG touch target size) per corner. It clamps drag position to the stage bounds and reports both the updated corner and the raw pointer position up to `CornerSelector`, which feeds the pointer position to `Loupe` for positioning.
- `Loupe.tsx` renders a second, small Konva `Stage` showing a zoomed-in circular view centered on the corner being dragged, so users can place handles precisely without their finger/cursor obscuring the target. It flips above/below the drag point depending on proximity to the stage's top edge.
- Corner state (`corners: {x, y, label}[]`) is lifted to `App.tsx` and passed down; there's no separate state management library.

### App state flow (`App.tsx`)

Three phases toggled by state, not routes: upload → corner selection → warped result. `warpedImage` presence gates which phase renders. `CardRatio` and `ZoomSlider` (aspect ratio, loupe zoom level) are only shown pre-warp. Pressing "Done" calls `transform(...)` which is async and calls `setWarpedImage` when finished; there's no loading state during the warp.
