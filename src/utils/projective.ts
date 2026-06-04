/**
 * Projective transform helpers — mirrors the homography library's internal logic
 * for computing the forward transform matrix and output crop offset.
 */

// Solve Ax = b using LU decomposition
export function solveLU(A: number[][], b: number[]): number[] {
    const n = A.length;
    const M = A.map(row => [...row]);
    const x = [...b];
    const P = Array.from({ length: n }, (_, i) => i);

    for (let k = 0; k < n; k++) {
        let max = Math.abs(M[k][k]), pk = k;
        for (let j = k + 1; j < n; j++) {
            if (Math.abs(M[j][k]) > max) { max = Math.abs(M[j][k]); pk = j; }
        }
        [M[k], M[pk]] = [M[pk], M[k]];
        [P[k], P[pk]] = [P[pk], P[k]];
        [x[k], x[pk]] = [x[pk], x[k]];
        for (let i = k + 1; i < n; i++) {
            M[i][k] /= M[k][k];
            for (let j = k + 1; j < n; j++) M[i][j] -= M[i][k] * M[k][j];
        }
    }
    for (let i = 0; i < n; i++)
        for (let j = 0; j < i; j++) x[i] -= M[i][j] * x[j];
    for (let i = n - 1; i >= 0; i--) {
        for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
        x[i] /= M[i][i];
    }
    return x;
}

// Compute 8-parameter projective matrix H that maps srcFlat → dstFlat
export function computeProjectiveMatrix(srcFlat: number[], dstFlat: number[]): number[] {
    const A: number[][] = [];
    const b: number[] = [];
    for (let i = 0; i < 4; i++) {
        const sx = srcFlat[i * 2], sy = srcFlat[i * 2 + 1];
        const dx = dstFlat[i * 2], dy = dstFlat[i * 2 + 1];
        A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
        A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
        b.push(dx, dy);
    }
    return solveLU(A, b);
}

// Apply projective matrix H to a point (x, y)
export function applyProjective(H: number[], x: number, y: number): [number, number] {
    const w = H[6] * x + H[7] * y + 1;
    return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

// Compute how much the library shifted output of the card TL lands at (cropX, cropY) in ImageData
export function getCropOffset( srcPoints: [number, number][], dstPoints: [number, number][], imgW: number, imgH: number): { cropX: number; cropY: number } {
    const H = computeProjectiveMatrix(srcPoints.flat(), dstPoints.flat());
    const corners: [number, number][] = [[0, 0], [0, imgH], [imgW, 0], [imgW, imgH]];
    const transformed = corners.map(([x, y]) => applyProjective(H, x, y));
    const minX = Math.min(...transformed.map(p => p[0]));
    const minY = Math.min(...transformed.map(p => p[1]));
    return { cropX: Math.round(-minX), cropY: Math.round(-minY) };
}
