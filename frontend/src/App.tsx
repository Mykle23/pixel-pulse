import { Routes, Route, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { LabelDetail } from "./pages/LabelDetail";
import { Login } from "./pages/Login";
import { BadgePresetProvider } from "./context/badge-preset";

export function App() {
  return (
    <BadgePresetProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/label/:name" element={<LabelDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BadgePresetProvider>
  );
}
