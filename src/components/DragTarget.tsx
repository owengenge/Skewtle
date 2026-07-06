import { Rect } from 'react-konva';

const HIT_SIZE = 44; // touch target size (follows Apple HIG 44pt guideline)

interface Corner { x: number; y: number; label: string; }

interface Props {
    corner: Corner;
    index: number;
    corners: Corner[];
    stageWidth: number;
    stageHeight: number;
    setCorners: (corners: Corner[]) => void;
    onDragStart: (corner: Corner, pos: { x: number; y: number }) => void;
    onDragMove: (corner: Corner, pos: { x: number; y: number }) => void;
    onDragEnd: () => void;
}

/*
 * Invisible hit-area rect placed at each corner. Handles drag clamping
 * and fires callbacks to update corner position and loupe state.
 */
export default function DragTarget({ corner, index, corners, stageWidth, stageHeight, setCorners, onDragStart, onDragMove, onDragEnd }: Props) {
    return (
        <Rect
            key={corner.label}
            x={corner.x - HIT_SIZE / 2}
            y={corner.y - HIT_SIZE / 2}
            
            // stroke="red"
            // opacity={0.4}

            width={HIT_SIZE}
            height={HIT_SIZE}
            fill="transparent"
            draggable
            dragBoundFunc={(pos) => {
                const centerX = pos.x + HIT_SIZE / 2;
                const centerY = pos.y + HIT_SIZE / 2;
                const clampedX = Math.min(stageWidth, Math.max(0, centerX));
                const clampedY = Math.min(stageHeight, Math.max(0, centerY));
                return { x: clampedX - HIT_SIZE / 2, y: clampedY - HIT_SIZE / 2 };
            }}
            onDragStart={(e) => {
                const pos = e.target.getStage()!.getPointerPosition()!;
                onDragStart(corner, pos);
            }}
            onDragMove={(e) => {
                const x = e.target.x() + HIT_SIZE / 2;
                const y = e.target.y() + HIT_SIZE / 2;
                const pos = e.target.getStage()!.getPointerPosition()!;
                const newCorners = [...corners];
                const updatedCorner = { ...corner, x, y };
                if (newCorners[index]) {
                    newCorners[index] = updatedCorner;
                }
                setCorners(newCorners);
                onDragMove(updatedCorner, pos);
            }}
            onDragEnd={onDragEnd}
        />
    );
}
