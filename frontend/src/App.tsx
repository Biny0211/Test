import { useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";

import HomePage from "./pages/Home";
import FeaturesPage from "./pages/Features";
import PricingPage from "./pages/Pricing";

import DashboardPage from "./pages/Dashboard";
import MyFilesPage from "./pages/MyFiles";
import MyStoragePage from "./pages/MyStorage";
import GroupPage from "./pages/GroupPage";

import GroupFilesPage from "./pages/GroupFilesPage";
import GroupStoragePage from "./pages/GroupStoragePage";

function PublicLayout() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* ✅ Nav의 Sign in -> 팝업 열기 */}
      <Navbar onSignIn={() => setAuthOpen(true)} />

      <Outlet />

      <Footer />

      {/* ✅ Public 영역에서만 Sign in 팝업 */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

// Dashboard는 Navbar/Footer 없음
function DashboardLayoutNoTopNav() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
      </Route>

      {/* Dashboard pages */}
      <Route element={<DashboardLayoutNoTopNav />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/files" element={<MyFilesPage />} />
        <Route path="/dashboard/storage" element={<MyStoragePage />} />
        <Route path="/dashboard/groups/:groupId" element={<GroupPage />} />
        <Route path="/dashboard/groups/:groupId/files" element={<GroupFilesPage />} />
        <Route path="/dashboard/groups/:groupId/storage" element={<GroupStoragePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
