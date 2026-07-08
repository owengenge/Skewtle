import type { CenteringLines } from "../types/centeringLines";

export function computeRatios(lines: CenteringLines) {
    const topWidth: number = lines.top.inner - lines.top.outer;
    const bottomWidth: number = lines.bottom.outer - lines.bottom.inner;
    const leftWidth: number = lines.left.inner - lines.left.outer;
    const rightWidth: number = lines.right.outer - lines.right.inner;

    const tbTotal = topWidth + bottomWidth;
    const lrTotal = leftWidth + rightWidth;

    const tb = tbTotal === 0
        ? { top: 50, bottom: 50 }
        : { top: (topWidth / tbTotal) * 100, bottom: (bottomWidth / tbTotal) * 100 };

    const lr = lrTotal === 0
        ? { left: 50, right: 50 }
        : { left: (leftWidth / lrTotal) * 100, right: (rightWidth / lrTotal) * 100 };

    return { tb, lr };
}