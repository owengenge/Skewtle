export interface Point { x: number; y: number; }

/**
 * Given two points A and B, returns the point ARM pixels along the edge from A toward B.
 */
export function pointAlongEdge(a: Point, b: Point, arm: number): Point {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const t = arm / len;
    return { x: a.x + dx * t, y: a.y + dy * t };
}
