import './App.css'
import { useState, useEffect } from 'react'
import UploadImage from './components/UploadImage';
import CornerSelector from './components/CornerSelector';
import { PAD, MAX_WIDTH, MAX_HEIGHT, OUTPUT_W } from './constants';
import { transform } from './utils/transform';
import CardRatio from './components/CardRatio';

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<{x: number, y: number, label: string}[] | null>(null);
  const [warpedImage, setWarpedImage] = useState<HTMLImageElement | null>(null);
  const [ratioW, setRatioW] = useState(5);
  const [ratioH, setRatioH] = useState(7);
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

  return (
    <div>

      <header>
        <h1>Skewtle</h1>
        <p>Trading card perspective correction tool</p>
      </header>

      <main>
        
        {!warpedImage && (
          <CardRatio
            ratioW={ratioW}
            ratioH={ratioH}
            setRatioW={setRatioW}
            setRatioH={setRatioH}
          />
        )}

        {!warpedImage && <UploadImage image={image} setImage={setImage} />}

        {image && corners && !warpedImage && (
          <div>
            <CornerSelector
              image={image}
              stageWidth={stageWidth}
              stageHeight={stageHeight}
              corners={corners}
              setCorners={setCorners}
            />
            <button onClick={() => transform({ srcPoints, dstPoints, image, setWarpedImage, cardRatio })}>Transform</button>
          </div>
        )}
        {warpedImage && (
          <>
            <button onClick={() => setWarpedImage(null)} className="remove-btn">Undo</button>
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

      </div>
    </div>
  ) 
}

export default App
