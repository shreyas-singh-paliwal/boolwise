import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import MinimizerPage from './pages/MinimizerPage';
import CircuitLibraryPage from './pages/CircuitLibraryPage';

export default function App() {
  return (
    <div className="shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MinimizerPage />} />
          <Route path="/circuits" element={<CircuitLibraryPage />} />
        </Routes>
      </main>
    </div>
  );
}
