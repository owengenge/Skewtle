import './App.css'
import { Routes, Route, NavLink } from 'react-router-dom';
import Perspective from './pages/Perspective';
import Centering from './pages/Centering';

function App() {
  return (
    <div>
      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
          Perspective Correction
        </NavLink>
        <span className="nav-item nav-item--soon">Centering Tool<span className="nav-badge">Coming Soon</span></span>
      </nav>
      <header>
        <h1>Skewtle</h1>
        <p>Scan, correct, and analyze your cards</p>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Perspective />} />
          <Route path="/centering-tool" element={<Perspective />} />
        </Routes>
      </main>

      <div className="footer">
        <p>Skewtle · Open source · Made by Owen Genge</p>
      </div>

    </div>
  )
}

export default App
