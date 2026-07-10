import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadImage from '../components/UploadImage';
import CornerSelector from '../components/CornerSelector';
import { HANDLE_INSET, MAX_WIDTH, MAX_HEIGHT, OUTPUT_W } from '../constants';
import { transform } from '../utils/transform';
import { downloadImage } from '../utils/downloadImage';
import CardRatio from '../components/CardRatio';
import ZoomSlider from '../components/ZoomSlider';
import { Trash, Download } from 'lucide-react';

interface Props {
  setCenteringImage: (img: HTMLImageElement | null) => void;
}

export default function Perspective({ setCenteringImage }: Props) {
  const navigate = useNavigate();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [prevImage, setPrevImage] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<{x: number, y: number, label: string}[] | null>(null);
  const [warpedImage, setWarpedImage] = useState<HTMLImageElement | null>(null);
  const [ratioW, setRatioW] = useState(5);
  const [ratioH, setRatioH] = useState(7);
  const [zoom, setZoom] = useState(2);

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

  return (
    <>
      <div className="page-intro">
        <p className="page-intro-title">Perspective Correction</p>
        <p className="page-intro-body">Drag the handles to the card's corners to align its edges, then click Done to correct the image.</p>
      </div>

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
      {!warpedImage && !corners &&
        <UploadImage image={image} setImage={setImage} />
      }

      {/** Image is uploaded and in corner selection */}
      {image && corners && !warpedImage && (
        <>
          <p className="upload-tip-callout">
            Ensure the card is flat with some background visible around all edges.
          </p>
          <UploadImage image={image} setImage={setImage} />
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
          <p className="info-callout">
            Refining edge alignment will yield better results.
          </p>
          <button onClick={() => {setWarpedImage(null); setImage(null)}} className='new-card-btn clear-btn'><Trash size={18}/></button>
          <button onClick={() => setWarpedImage(null)} className="edit-btn">Edit</button>
          <button onClick={() => { setCenteringImage(warpedImage); navigate('/centering-tool'); }} className='centering-btn'>Center</button>
          <span onClick={() => downloadImage(warpedImage)} className="download-btn"><Download size={18}/></span>
          <img
            src={warpedImage.src}
            className="warped-img"
            style={{ width: stageWidth, maxWidth: '100%', height: 'auto' }}
          />
        </>
      )}
    </>
  );
}
