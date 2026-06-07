import React from 'react';
import { Line } from 'react-konva';
import { pointAlongEdge } from '../utils/geometry';

const STROKE_WIDTH = 2;
const ARM = 30;
const OPACITY = .6;
const COLOUR = 'red';

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
                        stroke={COLOUR}
                        strokeWidth={STROKE_WIDTH}
                        dash={[6, 3]}
                        opacity={OPACITY}
                    />
                    {/* Thick corner accent at A */}
                    <Line
                        points={[a.x, a.y, nearA.x, nearA.y]}
                        stroke={COLOUR}
                        strokeWidth={STROKE_WIDTH+1}
                        lineCap="round"
                        opacity={OPACITY}
                    />
                    {/* Thick corner accent at B */}
                    <Line
                        points={[b.x, b.y, nearB.x, nearB.y]}
                        stroke={COLOUR}
                        strokeWidth={STROKE_WIDTH+1}
                        lineCap="round"
                        opacity={OPACITY}
                    />
                </React.Fragment>
            ))}
        </>
    );
}
