import { useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import CenteringLine from "./CenteringLine";
import type { CenteringLines } from '../types/centeringLines';
import { STAGE_MIN_ZOOM, STAGE_MAX_ZOOM } from '../constants';

interface Props {
    image: HTMLImageElement;
    stageWidth: number;
    stageHeight: number;
    lines: CenteringLines;
    setLines: (lines: CenteringLines) => void;
}

const ZOOM_SPEED = 1.05;

type Point = { x: number; y: number };

function distance(a: Point, b: Point): number {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function midpoint(a: Point, b: Point): Point {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Render image and stage over top to render centering lines
 */
export default function EdgeSelector({ image, stageWidth, stageHeight, lines, setLines }: Props) {
    const [stageScale, setStageScale] = useState(1);
    const [stagePos, setStagePos] = useState<Point>({ x: 0, y: 0 });
    const [isPinching, setIsPinching] = useState(false);
    const [isDraggingLine, setIsDraggingLine] = useState(false);
    const lastPinchDist = useRef(0);
    const lastPinchMidpoint = useRef<Point>({ x: 0, y: 0 });

    // The image is always at least as large as the stage viewport (min zoom
    // is 1x), so clamp stagePos to keep every edge covering the viewport —
    // no panning/zooming past the image's own bounds into empty canvas.
    function clampPos(pos: Point, scale: number): Point {
        const minX = Math.min(0, stageWidth - stageWidth * scale);
        const minY = Math.min(0, stageHeight - stageHeight * scale);
        return {
            x: Math.min(0, Math.max(minX, pos.x)),
            y: Math.min(0, Math.max(minY, pos.y)),
        };
    }

    // Re-solve stagePos so the image point under `anchor` (in container-space)
    // stays under `anchor` after applying `nextScale`, clamped to the zoom bounds.
    function zoomTo(nextScale: number, anchor: Point, imagePointUnderAnchor: Point) {
        const clampedScale = Math.min(STAGE_MAX_ZOOM, Math.max(STAGE_MIN_ZOOM, nextScale));
        setStageScale(clampedScale);
        setStagePos(clampPos({
            x: anchor.x - imagePointUnderAnchor.x * clampedScale,
            y: anchor.y - imagePointUnderAnchor.y * clampedScale,
        }, clampedScale));
    }

    function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        if (!stage) return;

        // Trackpads fire two-finger pan swipes as wheel events too — only a
        // genuine pinch gesture sets ctrlKey, so treat anything else as a pan.
        if (!e.evt.ctrlKey) {
            setStagePos((prev) => clampPos({ x: prev.x - e.evt.deltaX, y: prev.y - e.evt.deltaY }, stageScale));
            return;
        }

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const imagePointUnderPointer = {
            x: (pointer.x - stagePos.x) / stageScale,
            y: (pointer.y - stagePos.y) / stageScale,
        };

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const nextScale = direction > 0 ? stageScale * ZOOM_SPEED : stageScale / ZOOM_SPEED;

        zoomTo(nextScale, pointer, imagePointUnderPointer);
    }

    function handleTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
        const [touch1, touch2] = e.evt.touches;
        if (!touch1 || !touch2) return;
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (!stage) return;
        const rect = stage.container().getBoundingClientRect();
        const p1 = { x: touch1.clientX - rect.left, y: touch1.clientY - rect.top };
        const p2 = { x: touch2.clientX - rect.left, y: touch2.clientY - rect.top };
        const center = midpoint(p1, p2);
        const dist = distance(p1, p2);

        if (!isPinching) {
            setIsPinching(true);
            lastPinchDist.current = dist;
            lastPinchMidpoint.current = center;
            return;
        }

        const imagePointUnderMidpoint = {
            x: (lastPinchMidpoint.current.x - stagePos.x) / stageScale,
            y: (lastPinchMidpoint.current.y - stagePos.y) / stageScale,
        };

        zoomTo(stageScale * (dist / lastPinchDist.current), center, imagePointUnderMidpoint);

        lastPinchDist.current = dist;
        lastPinchMidpoint.current = center;
    }

    function handleTouchEnd(e: Konva.KonvaEventObject<TouchEvent>) {
        if (e.evt.touches.length < 2) {
            setIsPinching(false);
            lastPinchDist.current = 0;
        }
    }

    return (
        <div className="edit-img-div" style={{ position: 'relative', lineHeight: 0 }}>
            <Stage
                width={stageWidth}
                height={stageHeight}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                draggable={!isPinching && !isDraggingLine}
                dragBoundFunc={(pos) => clampPos(pos, stageScale)}
                onDragMove={(e) => {
                    // dragmove bubbles — a handle's own drag fires this too, with
                    // e.target still the handle (not the Stage), which would otherwise
                    // stomp stagePos with the handle's tiny local coordinates.
                    if (e.target !== e.target.getStage()) return;
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                }}
                onWheel={handleWheel}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <Layer>
                    <KonvaImage image={image} width={stageWidth} height={stageHeight} />

                    <CenteringLine
                        edge="top" kind="outer"
                        pos={lines.top.outer}
                        min={0} max={lines.top.inner}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, top: { ...lines.top, outer: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />
                    <CenteringLine
                        edge="top" kind="inner"
                        pos={lines.top.inner}
                        min={lines.top.outer} max={stageHeight}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, top: { ...lines.top, inner: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />

                    <CenteringLine
                        edge="bottom" kind="outer"
                        pos={lines.bottom.outer}
                        min={lines.bottom.inner} max={stageHeight}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, bottom: { ...lines.bottom, outer: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />
                    <CenteringLine
                        edge="bottom" kind="inner"
                        pos={lines.bottom.inner}
                        min={0} max={lines.bottom.outer}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, bottom: { ...lines.bottom, inner: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />

                    <CenteringLine
                        edge="left" kind="outer"
                        pos={lines.left.outer}
                        min={0} max={lines.left.inner}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, left: { ...lines.left, outer: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />
                    <CenteringLine
                        edge="left" kind="inner"
                        pos={lines.left.inner}
                        min={lines.left.outer} max={stageWidth}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, left: { ...lines.left, inner: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />

                    <CenteringLine
                        edge="right" kind="outer"
                        pos={lines.right.outer}
                        min={lines.right.inner} max={stageWidth}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, right: { ...lines.right, outer: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />
                    <CenteringLine
                        edge="right" kind="inner"
                        pos={lines.right.inner}
                        min={0} max={lines.right.outer}
                        stageWidth={stageWidth} stageHeight={stageHeight}
                        onChange={(pos) => setLines({ ...lines, right: { ...lines.right, inner: pos } })}
                        onDragStart={() => setIsDraggingLine(true)}
                        onDragEnd={() => setIsDraggingLine(false)}
                    />
                </Layer>
            </Stage>
        </div>
    );
}