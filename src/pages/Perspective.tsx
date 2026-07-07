import { useState } from 'react';
import UploadImage from '../components/UploadImage';
import CornerSelector from '../components/CornerSelector';
import { HANDLE_INSET, MAX_WIDTH, MAX_HEIGHT, OUTPUT_W } from '../constants';
import { transform } from '../utils/transform';
import CardRatio from '../components/CardRatio';
import ZoomSlider from '../components/ZoomSlider';

export default function Perspective() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [prevImage, setPrevImage] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<{x: number, y: number, label: string}[] | null>(null);
  const [warpedImage, setWarpedImage] = useState<HTMLImageElement | null>(null);
  const [ratioW, setRatioW] = useState(5);
  const [ratioH, setRatioH] = useState(7);
  const [zoom, setZoom] = useState(1.5);

  const cardRatio = ratioH / ratioW;
  const outputH = OUTPUT_W * cardRatio;

  const scale = image ? Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight, 1) : 1;
  const stageWidth = image ? image.naturalWidth * scale : 0;
  const stageHeight = image ? image.naturalHeight * scale : 0;

  // Reset corner adjustment handles whenever a new image is loaded (or cleared)
  if (image !== prevImage) {
    setPrevImage(image);
    setCorners(image ? [
      { x: HANDLE_INSET, y: HANDLE_INSET, label: 'TL' },
      { x: stageWidth - HANDLE_INSET, y: HANDLE_INSET, label: 'TR' },
      { x: stageWidth - HANDLE_INSET, y: stageHeight - HANDLE_INSET, label: 'BR' },
      { x: HANDLE_INSET, y: stageHeight - HANDLE_INSET, label: 'BL' }
    ] : null);
  }

  // Divide by scale to convert stage coordinates back to original image pixel coordinates
  const srcPoints:[number, number][] = (corners ?? []).map(c => {
    return [c.x / scale, c.y / scale];
  });

  const dstPoints:[number, number][] = [
    [0, 0],              // TL
    [OUTPUT_W, 0],       // TR
    [OUTPUT_W, outputH], // BR
    [0, outputH],        // BL
  ];

  async function handleDownload() {
    if (!warpedImage) return;
    // Convert the data URL to a blob by hand (not via fetch()) — WebKit
    // (Safari and all iOS browsers) throws on fetch() of a data: URL.
    const [header, base64] = warpedImage.src.split(',');
    const mime = header.match(/data:(.*?);base64/)?.[1] ?? 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const file = new File([blob], 'card.png', { type: mime });

    // Prefer the native share sheet (saves straight to Photos on iOS) when available
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] });
        return;
      } catch (err) {
        // User cancelled the share sheet — leave it there, don't force a download too
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'card.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/** Customization */}
      {!warpedImage && (
        <div className='customize-div'>
          <CardRatio
            ratioW={ratioW}
            ratioH={ratioH}
            setRatioW={setRatioW}
            setRatioH={setRatioH}
          />
          <ZoomSlider zoom={zoom} setZoom={setZoom} />
        </div>
      )}

      {/** Prompt image to be uploaded */}
      {!warpedImage && <UploadImage image={image} setImage={setImage} />}

      {/** Image is uploaded and in corner selection */}
      {image && corners && !warpedImage && (
        <>
          <button onClick={() => transform({ srcPoints, dstPoints, image, setWarpedImage, cardRatio })}>Done</button>
          <CornerSelector
            image={image}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            corners={corners}
            setCorners={setCorners}
            zoom={zoom}
          />
        </>
      )}

      {/** Image is transformed */}
      {warpedImage && (
        <>
          <button onClick={() => setWarpedImage(null)} className="edit-btn">Edit</button>
          <button onClick={() => {setWarpedImage(null); setImage(null)}} className='new-card-btn'>New Card</button>
          <span onClick={handleDownload} className="download-btn">
            <span className="material-symbols-outlined">download</span>
          </span>
          <p className="info-callout">
            Not happy with the result? Try refining the corner alignment or using a higher quality source image.
          </p>
          <div className='warped-img-div'>
            <img
              src={warpedImage.src}
              style={{ maxWidth: '100%', width: '280px', height: 'auto' }}
            />
          </div>
        </>
      )}
    </>
  );
}
