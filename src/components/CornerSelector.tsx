import React from 'react';
import { Stage, Layer, Line, Rect, Image as KonvaImage } from 'react-konva';
import { type Dispatch, type SetStateAction } from 'react';
import { pointAlongEdge } from '../utils/geometry';
import { useState } from 'react';
import { ARM, ZOOM_SCALE } from '../constants';

const HIT_SIZE = 44; // touch target size (follows Apple HIG 44pt guideline)

interface Corner { x: number; y: number; label: string; }

interface Props {
    image: HTMLImageElement;
    stageWidth: number;
    stageHeight: number;
    corners: Corner[];
    setCorners: Dispatch<SetStateAction<Corner[] | null>>;
}

export default function CornerSelector({ image, stageWidth, stageHeight, corners, setCorners }: Props) {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [armLength, setArmLength] = useState(ARM);

    const handleDragStart = () => {
        setScale(ZOOM_SCALE);
        setArmLength(ARM * ZOOM_SCALE);
    };

    const handleDrag = (e) => {
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        setPosition({
            x: -pos.x,
            y: -pos.y,
        });
    };

    const handleDragEnd = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setArmLength(ARM);
    };

    // Build edge segments for each edge A-B, split into thick-thin-thick
    const edges = (corners ?? []).map((a, i) => {
        const b = corners[(i + 1) % corners.length]!;
        const nearA = pointAlongEdge(a, b, armLength);
        const nearB = pointAlongEdge(b, a, armLength);
        return { a, b, nearA, nearB };
    });

    return (
        <div className='edit-img-div'>
            <Stage
                width={stageWidth}
                height={stageHeight}
            >
                <Layer
                    scaleX={scale}
                    scaleY={scale}
                    x={position.x}
                    y={position.y}
                    onDragStart={handleDragStart}
                    onDragMove={handleDrag}
                    onDragEnd={handleDragEnd}
                >
                    <KonvaImage image={image} width={stageWidth} height={stageHeight} />
                    <>
                        {edges.map(({ a, b, nearA, nearB }, i) => (
                            <React.Fragment key={i}>
                                {/* Thin dashed middle segment */}
                                <Line
                                    points={[nearA.x, nearA.y, nearB.x, nearB.y]}
                                    stroke="white"
                                    strokeWidth={1}
                                    dash={[6, 3]}
                                    opacity={0.7}
                                />
                                {/* Thick corner accent at A */}
                                <Line
                                    points={[a.x, a.y, nearA.x, nearA.y]}
                                    stroke="white"
                                    strokeWidth={2}
                                    lineCap="round"
                                />
                                {/* Thick corner accent at B */}
                                <Line
                                    points={[b.x, b.y, nearB.x, nearB.y]}
                                    stroke="white"
                                    strokeWidth={2}
                                    lineCap="round"
                                />
                            </React.Fragment>
                        ))}
                        {/* Invisible drag targets at each corner */}
                        {corners.map((corner, i) => (
                            <Rect
                                key={corner.label}
                                x={corner.x - HIT_SIZE / 2}
                                y={corner.y - HIT_SIZE / 2}
                                width={HIT_SIZE}
                                height={HIT_SIZE}
                                fill="transparent"
                                draggable
                                onDragMove={(e) => {
                                    const newCorners:Corner[] = [...corners];
                                    if (newCorners[i]) {
                                        newCorners[i] = {
                                            ...corner,
                                            x: e.target.x() + HIT_SIZE / 2,
                                            y: e.target.y() + HIT_SIZE / 2,
                                        };
                                    }
                                    setCorners(newCorners);
                                }}
                            />
                        ))}
                    </>
                </Layer>
            </Stage>
        </div>
    );
}
