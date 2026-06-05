import React from 'react';
import { Line } from 'react-konva';
import { pointAlongEdge } from '../utils/geometry';

const STROKE_WIDTH = 2;
const ARM = 40;

interface Corner { x: number; y: number; label: string; }

interface Props {
    corners: Corner[];
}

/*
 * Renders the corner accent lines and dashed edge segments for all four sides.
 * Computes edge geometry from corners internally using pointAlongEdge.
 */
export default function EdgeLines({ corners }: Props) {
    const edges = corners.map((a, i) => {
        const b = corners[(i + 1) % corners.length]!;
        const nearA = pointAlongEdge(a, b, ARM);
        const nearB = pointAlongEdge(b, a, ARM);
        return { a, b, nearA, nearB };
    });

    return (
        <>
            {edges.map(({ a, b, nearA, nearB }, i) => (
                <React.Fragment key={i}>
                    {/* Thin dashed middle segment */}
                    <Line
                        points={[nearA.x, nearA.y, nearB.x, nearB.y]}
                        stroke="white"
                        strokeWidth={STROKE_WIDTH}
                        dash={[6, 3]}
                        opacity={0.7}
                    />
                    {/* Thick corner accent at A */}
                    <Line
                        points={[a.x, a.y, nearA.x, nearA.y]}
                        stroke="red"
                        strokeWidth={STROKE_WIDTH+1}
                        lineCap="round"
                        opacity={0.7}
                    />
                    {/* Thick corner accent at B */}
                    <Line
                        points={[b.x, b.y, nearB.x, nearB.y]}
                        stroke="red"
                        strokeWidth={STROKE_WIDTH+1}
                        lineCap="round"
                        opacity={0.7}
                    />
                </React.Fragment>
            ))}
        </>
    );
}
