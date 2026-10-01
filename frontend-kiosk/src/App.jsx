import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import ScanPage from './pages/ScanPage';
import AllocatingSlotPage from './pages/AllocatingSlotPage';
import NavigationPage from './pages/NavigationPage';
import SuccessPage from './pages/SuccessPage';
import FailedPage from './pages/FailedPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === Kiosk Flow === */}
        <Route path="/" element={<ScanPage />} />
        <Route path="/allocating" element={<AllocatingSlotPage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        
        {/* === Exit Gate Flow === */}
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/failed" element={<FailedPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
