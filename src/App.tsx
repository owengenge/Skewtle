import './App.css'
import { useState, useEffect } from 'react'
import UploadImage from './components/UploadImage';
import CornerSelector from './components/CornerSelector';
import { PAD, MAX_WIDTH, MAX_HEIGHT, OUTPUT_W } from './constants';
import { transform } from './utils/transform';
import CardRatio from './components/CardRatio';
import ZoomSlider from './components/ZoomSlider';

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
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
  
  // On image load set corner adjustment handles 
  useEffect(() => {
    if (image) {
      const w = stageWidth;
      const h = stageHeight;
  
      setCorners([
        { x: PAD, y: PAD, label: 'TL' },
        { x: w - PAD, y: PAD, label: 'TR' },
        { x: w - PAD, y: h - PAD, label: 'BR' },
        { x: PAD, y: h - PAD, label: 'BL' }
      ]);
    } else {
      setCorners(null);
    }
  }, [image]);

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

  function handleDownload() {
    if (!warpedImage) return;
    const a = document.createElement('a');
    a.href = warpedImage.src;
    a.download = 'card.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div>
      <header>
        <h1>Skewtle</h1>
        <p>Trading card perspective correction tool</p>
      </header>
      <main>
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
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </>
        )}
      </main>

      <div className="footer">
        <p>Skewtle · Open source · Made by Owen Genge</p>
      </div>
      
    </div>
  ) 
}

export default App
