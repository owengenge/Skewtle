import React from 'react';
import { Stage, Layer, Line, Rect, Image as KonvaImage } from 'react-konva';
import { type Dispatch, type SetStateAction } from 'react';
import { pointAlongEdge } from '../utils/geometry';

const ARM = 30;      // length of thick corner accent
const HIT_SIZE = 44; // invisible drag target size 

interface Corner { x: number; y: number; label: string; }

interface Props {
    image: HTMLImageElement;
    stageWidth: number;
    stageHeight: number;
    showCorners?: boolean;
    corners?: Corner[];
    setCorners?: Dispatch<SetStateAction<Corner[] | null>>;
}

export default function DisplayImage({ image, stageWidth, stageHeight, showCorners, corners, setCorners }: Props) {

    // Build edge segments for each edge A-B, split into thick-thin-thick
    const edges = (corners ?? []).map((a, i) => {
        const b = corners[(i + 1) % corners.length]!;
        const nearA = pointAlongEdge(a, b, ARM);
        const nearB = pointAlongEdge(b, a, ARM);
        return { a, b, nearA, nearB };
    });

    return (
        <Stage
            width={stageWidth}
            height={stageHeight}
            className='display-img-div'
        >
            <Layer>
                <KonvaImage image={image} width={stageWidth} height={stageHeight} />
                {showCorners && (
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
                                    strokeWidth={3}
                                    lineCap="square"
                                />
                                {/* Thick corner accent at B */}
                                <Line
                                    points={[b.x, b.y, nearB.x, nearB.y]}
                                    stroke="white"
                                    strokeWidth={3}
                                    lineCap="square"
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
                )}
            </Layer>
        </Stage>
    );
}
