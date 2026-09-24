import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppProviders from './context/AppProviders.jsx';
import Header from './components/layout/Header.jsx';
import ControlPanel from './components/layout/ControlPanel.jsx';
import SchemaPetriPage from './pages/SchemaPetriPage.jsx';
import Simulation2DPage from './pages/Simulation2DPage.jsx';

/**
 * AnimatedRoutes — enveloppe les <Routes> pour appliquer une animation
 * de transition à chaque changement de route.
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-[fadeUp_280ms_ease-out]">
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/schema" replace />} />
        <Route path="/schema" element={<SchemaPetriPage />} />
        <Route path="/simulation" element={<Simulation2DPage />} />
        <Route path="*" element={<Navigate to="/schema" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProviders>
        <div className="min-h-screen bg-surface text-ink font-sans">
          <Header />
          <main className="pt-16 pb-16 min-h-screen">
            <AnimatedRoutes />
          </main>
          <ControlPanel />
        </div>
      </AppProviders>
    </BrowserRouter>
  );
}