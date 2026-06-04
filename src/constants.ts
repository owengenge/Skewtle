// Output canvas
export const OUTPUT_W = 400;
export const PAD = 20; // inset from canvas edge to avoid clipping rounded card corners

// Input stage
export const MAX_WIDTH = Math.min(800, window.innerWidth - 32);
export const MAX_HEIGHT = MAX_WIDTH * (3 / 4);

// Corner selector
export const ARM = 30;        // length of the thick corner accent lines
export const ZOOM_SCALE = 2;  // scale applied to the stage while dragging a corner
