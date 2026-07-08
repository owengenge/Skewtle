import { useState } from 'react';
import './App.css'
import { Routes, Route, NavLink } from 'react-router-dom';
import Perspective from './pages/Perspective';
import Centering from './pages/Centering';

function App() {
  const [centeringImage, setCenteringImage] = useState<HTMLImageElement | null>(null);

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
          <Route path="/" element={<Perspective setCenteringImage={setCenteringImage} />} />
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
