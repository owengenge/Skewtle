import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { type Dispatch, type SetStateAction } from 'react';
import { useState } from 'react';
import EdgeLines from './EdgeLines';
import DragTarget from './DragTarget';
import Loupe from './Loupe';

interface Corner { x: number; y: number; label: string; }

interface Props {
    image: HTMLImageElement;
    stageWidth: number;
    stageHeight: number;
    corners: Corner[];
    setCorners: Dispatch<SetStateAction<Corner[] | null>>;
    zoom: number;
}

/*
 * Konva stage for selecting the card corners. Composes EdgeLines,
 * DragTarget, and Loupe into the full interactive corner-picking UI.
 */
export default function CornerSelector({ image, stageWidth, stageHeight, corners, setCorners, zoom }: Props) {
    const [loupeCorner, setLoupeCorner] = useState<Corner | null>(null);
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 });

    return (
        <div className='edit-img-div' style={{ position: 'relative', lineHeight: 0 }}>
            <Stage width={stageWidth} height={stageHeight}>
                <Layer>
                    <KonvaImage image={image} width={stageWidth} height={stageHeight} />
                    <EdgeLines corners={corners} />
                    {corners.map((corner, i) => (
                        <DragTarget
                            key={corner.label}
                            corner={corner}
                            index={i}
                            corners={corners}
                            stageWidth={stageWidth}
                            stageHeight={stageHeight}
                            setCorners={setCorners}
                            onDragStart={(c, pos) => { setLoupeCorner(c); setDragPos(pos); }}
                            onDragMove={(c, pos) => { setLoupeCorner(c); setDragPos(pos); }}
                            onDragEnd={() => setLoupeCorner(null)}
                        />
                    ))}
                </Layer>
            </Stage>

            {loupeCorner && (
                <Loupe
                    corner={loupeCorner}
                    dragPos={dragPos}
                    stageWidth={stageWidth}
                    stageHeight={stageHeight}
                    image={image}
                    corners={corners}
                    zoom={zoom}
                />
            )}
        </div>
    );
}
