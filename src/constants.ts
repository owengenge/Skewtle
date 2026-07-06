// Output canvas
export const OUTPUT_W = 2000;
export const PAD = 185; // output-space inset for the final crop, to avoid clipping rounded card corners (scaled with OUTPUT_W)

// Input stage
export const MAX_WIDTH = Math.min(800, window.innerWidth - 32);
export const MAX_HEIGHT = Math.max(MAX_WIDTH * (3 / 4), window.innerHeight * 0.65);
export const HANDLE_INSET = 30; // stage-space inset for initial corner handle placement
