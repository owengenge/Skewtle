import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import EdgeLines from './EdgeLines';

const LOUPE_SIZE = 160;

interface Corner { x: number; y: number; label: string; }

interface Props {
    corner: Corner;
    dragPos: { x: number; y: number };
    stageWidth: number;
    stageHeight: number;
    image: HTMLImageElement;
    corners: Corner[];
    zoom: number;
}

/*
 * Circular magnified overlay shown while dragging a corner.
 * Positions itself above the thumb, flipping below if near the top edge.
 */
export default function Loupe({ corner, dragPos, stageWidth, stageHeight, image, corners, zoom }: Props) {
    const offset = {
        x: LOUPE_SIZE / 2 - corner.x * zoom,
        y: LOUPE_SIZE / 2 - corner.y * zoom,
    };

    const left = Math.min(stageWidth - LOUPE_SIZE, Math.max(0, dragPos.x - LOUPE_SIZE / 2));
    const top = dragPos.y - LOUPE_SIZE - 48 < 0 ? dragPos.y + 48 : dragPos.y - LOUPE_SIZE - 48;

    return (
        <div style={{
            position: 'absolute',
            left,
            top,
            width: LOUPE_SIZE,
            height: LOUPE_SIZE,
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.6)',
            pointerEvents: 'none',
        }}>
            <Stage width={LOUPE_SIZE} height={LOUPE_SIZE}>
                <Layer scaleX={zoom} scaleY={zoom} x={offset.x} y={offset.y}>
                    <KonvaImage image={image} width={stageWidth} height={stageHeight} />
                    <EdgeLines corners={corners} />
                </Layer>
            </Stage>
        </div>
    );
}
