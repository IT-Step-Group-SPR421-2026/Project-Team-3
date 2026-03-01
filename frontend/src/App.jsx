import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HeroLanding from "./pages/HeroLanding";
import MainAppUI from "./components/main/MainAppUI";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroLanding />} />
        <Route path="/app" element={<MainAppUI />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
