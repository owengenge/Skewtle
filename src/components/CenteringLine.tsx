import { Line, Rect } from 'react-konva';

const STROKE_WIDTH = .7;
const DASH: [number, number] = [3, 1.5];
const HANDLE_SIZE = 20; // square drag handle
const HANDLE_RADIUS = 5;
const HANDLE_STROKE_WIDTH = 1;
const HANDLE_FILL_OPACITY = 0.2;
const HANDLE_OFFSET = 24; // stagger the inner handle off-center so it never overlaps the outer handle

interface Props {
    edge: 'top' | 'bottom' | 'left' | 'right';
    kind: 'outer' | 'inner';
    pos: number;
    min: number;
    max: number;
    stageWidth: number;
    stageHeight: number;
    onChange: (pos: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

// One hue per side; outer is the fully saturated shade, inner is a lighter
// tint of that same hue so each side reads as one colour family.
const EDGE_HUE: Record<Props['edge'], number> = {
    top: 250,    // blue
    right: 20,   // red
    bottom: 140, // green
    left: 300,   // magenta
};

const OPACITY = 0.7;

// Return colour of specific line
function lineColor(edge: Props['edge'], kind: Props['kind']): string {
    const hue = EDGE_HUE[edge];
    return kind === 'outer' ? `oklch(0.58 0.34 ${hue})` : `oklch(0.72 0.28 ${hue})`;
}

// Same colour as lineColor, with alpha applied — used for the handle's fill
// so the border can stay solid while the inside reads as translucent.
function withAlpha(color: string, alpha: number): string {
    return color.replace(')', ` / ${alpha})`);
}

/**
 * Render one line at given location bounded by passed min and max location
 */
export default function CenteringLine({ edge, kind, pos, min, max, stageWidth, stageHeight, onChange, onDragStart, onDragEnd }: Props) {
    const color = lineColor(edge, kind);
    const horizontal = edge === 'top' || edge === 'bottom';

    const points = horizontal
        ? [0, 0, stageWidth, 0]
        : [0, 0, 0, stageHeight];

    // The handle sits at the free axis's center, staggered off-center for
    // inner lines so an outer/inner pair's handles never sit on top of each other.
    const freeAxisCenter = (horizontal ? stageWidth : stageHeight) / 2;
    const handleCenter = freeAxisCenter + (kind === 'inner' ? HANDLE_OFFSET : -HANDLE_OFFSET);

    return (
        <>
            <Line
                points={points}
                x={horizontal ? 0 : pos}
                y={horizontal ? pos : 0}
                stroke={color}
                strokeWidth={STROKE_WIDTH}
                dash={DASH}
                opacity={OPACITY}
                listening={false}
            />
            <Rect
                x={(horizontal ? handleCenter : pos) - HANDLE_SIZE / 2}
                y={(horizontal ? pos : handleCenter) - HANDLE_SIZE / 2}
                width={HANDLE_SIZE}
                height={HANDLE_SIZE}
                cornerRadius={HANDLE_RADIUS}
                fill={withAlpha(color, HANDLE_FILL_OPACITY)}
                stroke={color}
                strokeWidth={HANDLE_STROKE_WIDTH}
                draggable
                onDragStart={() => onDragStart?.()}
                onDragEnd={() => onDragEnd?.()}
                onDragMove={(e) => {
                    // Let Konva's own (tested) absolute-to-local conversion place the
                    // node from the unconstrained drag, then clamp/lock in local
                    // coordinates and write the result straight back before the next
                    // paint — simpler and more robust than re-deriving the ancestor
                    // transform ourselves in a dragBoundFunc.
                    const node = e.target;
                    if (horizontal) {
                        const centerY = Math.min(max, Math.max(min, node.y() + HANDLE_SIZE / 2));
                        node.position({ x: handleCenter - HANDLE_SIZE / 2, y: centerY - HANDLE_SIZE / 2 });
                        onChange(centerY);
                    } else {
                        const centerX = Math.min(max, Math.max(min, node.x() + HANDLE_SIZE / 2));
                        node.position({ x: centerX - HANDLE_SIZE / 2, y: handleCenter - HANDLE_SIZE / 2 });
                        onChange(centerX);
                    }
                }}
            />
        </>
    );
}