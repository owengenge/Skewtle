import './App.css'
import { useState, useEffect } from 'react'
import UploadImage from './components/UploadImage';
import DisplayImage from './components/DisplayImage';

const PAD:number = 10; 
const MAX_WIDTH:number = 800;
const MAX_HEIGHT:number = 600;

function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [corners, setCorners] = useState<{x: number, y: number, label: string}[] | null>(null);

  const scale = image ? Math.min(MAX_WIDTH / image.naturalWidth, MAX_HEIGHT / image.naturalHeight, 1) : 1;
  const stageWidth = image ? image.naturalWidth * scale : 0;
  const stageHeight = image ? image.naturalHeight * scale : 0;

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

  return (
    <div>

      <header>
        <h1>Skewtle</h1>
        <p>Pokemon card perspective correction tool</p>
      </header>

      <main>
        <UploadImage image={image} setImage={setImage} />
        {image && corners && (
          <DisplayImage
            image={image}
            stageWidth={stageWidth}
            stageHeight={stageHeight}
            showCorners
            corners={corners}
            setCorners={setCorners}
          />
        )}
      </main>

      <div className="footer">

      </div>
    </div>
  ) 
}

export default App
