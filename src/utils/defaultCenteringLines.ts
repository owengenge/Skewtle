import type { CenteringLines } from "../types/centeringLines";
import { EDGE_OUTER_INSET, EDGE_INNER_INSET } from "../constants";

export function defaultCenteringLines(stageWidth: number, stageHeight: number): CenteringLines {
    return {
        top: { outer: EDGE_OUTER_INSET, inner: EDGE_INNER_INSET },
        bottom: { outer: stageHeight - EDGE_OUTER_INSET, inner: stageHeight - EDGE_INNER_INSET },
        left: { outer: EDGE_OUTER_INSET, inner: EDGE_INNER_INSET },
        right: { outer: stageWidth - EDGE_OUTER_INSET, inner: stageWidth - EDGE_INNER_INSET },
    };
}
