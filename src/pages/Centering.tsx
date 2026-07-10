import { useState } from "react";
import UploadImage from "../components/UploadImage";
import EdgeSelector from "../components/EdgeSelector";
import type { CenteringLines } from "../types/centeringLines";
import { defaultCenteringLines } from "../utils/defaultCenteringLines";
import { computeRatios } from "../utils/computeRatios";
import { CENTERING_MAX_WIDTH, CENTERING_MAX_HEIGHT } from "../constants";

interface Props {
    image: HTMLImageElement | null;
    setImage: (img: HTMLImageElement | null) => void;
}

export default function Centering({ image, setImage }: Props) {
    const [prevImage, setPrevImage] = useState<HTMLImageElement | null>(null);
    const [lines, setLines] = useState<CenteringLines | null>(null);

    const scale = image ? Math.min(CENTERING_MAX_WIDTH / image.naturalWidth, CENTERING_MAX_HEIGHT / image.naturalHeight, 1) : 1;
    const stageWidth = image ? image.naturalWidth * scale : 0;
    const stageHeight = image ? image.naturalHeight * scale : 0;

    // Reset centering lines whenever a new image is loaded (or cleared)
    if (image !== prevImage) {
        setPrevImage(image);
        setLines(image ? defaultCenteringLines(stageWidth, stageHeight) : null);
    }

    const ratios = lines ? computeRatios(lines) : null;
    const centeringTier = (value: number) => {
        if (value >= 45 && value <= 55) return 'good';
        if (value >= 40 && value <= 60) return 'warn';
        return 'bad';
    };

    return (
        <>
            <div className="page-intro">
                <p className="page-intro-title"><img src="/center-icon.svg" className="page-intro-icon" alt="" />Centering Tool</p>
                <p className="page-intro-body">Align each pair of lines with the card's outside and inside borders to measure the centering ratio.</p>
            </div>
            <div className="centering-toolbar">
                <UploadImage image={image} setImage={setImage} />
                {ratios && (
                    <div className="centering-stats">
                        <div className={`centering-ratio centering-ratio--${centeringTier(ratios.tb.top)}`}>
                            <span className="centering-ratio-label">T/B:</span>
                            <span className="centering-ratio-value">{ratios.tb.top.toFixed(1)} / {ratios.tb.bottom.toFixed(1)}</span>
                        </div>
                        <div className={`centering-ratio centering-ratio--${centeringTier(ratios.lr.left)}`}>
                            <span className="centering-ratio-label">L/R:</span>
                            <span className="centering-ratio-value">{ratios.lr.left.toFixed(1)} / {ratios.lr.right.toFixed(1)}</span>
                        </div>
                    </div>
                )}
            </div>

            {image && lines && (
                <>
                    <EdgeSelector
                        image={image}
                        stageWidth={stageWidth}
                        stageHeight={stageHeight}
                        lines={lines}
                        setLines={setLines}
                    />
                </>
            )}
        </>
    );
}
