import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import ScanPage from './pages/ScanPage';
import AllocatingSlotPage from './pages/AllocatingSlotPage';
import NavigationPage from './pages/NavigationPage';
import SuccessPage from './pages/SuccessPage';
import FailedPage from './pages/FailedPage';

// Exit Pages
import ExitScanPage from './pages/ExitScanPage';
import ExitSuccessPage from './pages/ExitSuccessPage';
import ExitFailedPage from './pages/ExitFailedPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* === Kiosk Flow === */}
        <Route path="/" element={<ScanPage key="masuk-mobil" jenis="MOBIL" />} />
        <Route path="/motor" element={<ScanPage key="masuk-motor" jenis="MOTOR" />} />
        <Route path="/allocating" element={<AllocatingSlotPage />} />
        <Route path="/navigation" element={<NavigationPage />} />
        
        {/* === Exit Gate Flow === */}
        <Route path="/exit" element={<ExitScanPage key="keluar-mobil" jenis="MOBIL" />} />
        <Route path="/exit/motor" element={<ExitScanPage key="keluar-motor" jenis="MOTOR" />} />
        <Route path="/exit/success" element={<ExitSuccessPage />} />
        <Route path="/exit/failed" element={<ExitFailedPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
