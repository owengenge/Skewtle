# Skewtle

A trading card perspective correction tool. Upload a photo of a card taken at an angle, drag the corner handles to align with the card edges, and Skewtle will straighten and crop it into a clean output image.

## Features

- Drag corner handles to define the card region
- Magnified loupe overlay while dragging for precise placement
- Configurable card aspect ratio (default 5:7 — works for Pokémon, One Piece, Magic: The Gathering, etc.)
- Adjustable zoom level for the loupe
- Download the corrected image

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React + TypeScript
- Vite
- Konva / react-konva (canvas rendering)
- [homography](https://www.npmjs.com/package/homography) (perspective transform)

## Usage

1. Set the card ratio if it differs from the default 5:7
2. Upload or drag and drop a photo of your card
3. Drag the four corner handles to the corners of the card
4. Press **Done** to apply the perspective correction
5. Download the result

> For best results, photograph the card flat with some background visible around all edges.

## License

MIT
