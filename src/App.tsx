import { useState } from 'react';
import './App.css'
import { Routes, Route, NavLink } from 'react-router-dom';
import Perspective from './pages/Perspective';
import Centering from './pages/Centering';

function App() {
  const [centeringImage, setCenteringImage] = useState<HTMLImageElement | null>(null);
  const [perspectiveImage, setPerspectiveImage] = useState<HTMLImageElement | null>(null);
  const [perspectivePrevImage, setPerspectivePrevImage] = useState<HTMLImageElement | null>(null);
  const [perspectiveCorners, setPerspectiveCorners] = useState<{x: number, y: number, label: string}[] | null>(null);
  const [perspectiveWarpedImage, setPerspectiveWarpedImage] = useState<HTMLImageElement | null>(null);

  return (
    <div>
      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
          Perspective Correction
        </NavLink>
        <NavLink to="/centering-tool" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
          Centering Tool
        </NavLink>
      </nav>
      <header>
        <h1>Skewtle</h1>
        <p>Correct and analyze your cards</p>
      </header>
      <main>
        <Routes>
          <Route path="/" element={
            <Perspective
              setCenteringImage={setCenteringImage}
              image={perspectiveImage}
              setImage={setPerspectiveImage}
              prevImage={perspectivePrevImage}
              setPrevImage={setPerspectivePrevImage}
              corners={perspectiveCorners}
              setCorners={setPerspectiveCorners}
              warpedImage={perspectiveWarpedImage}
              setWarpedImage={setPerspectiveWarpedImage}
            />
          } />
          <Route path="/centering-tool" element={<Centering image={centeringImage} setImage={setCenteringImage} />} />
        </Routes>
      </main>

      <div className="footer">
        <p>Skewtle · Open source · Made by Owen Genge</p>
      </div>

    </div>
  )
}

export default App
