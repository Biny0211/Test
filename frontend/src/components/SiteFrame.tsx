import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteFrame() {
  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-6">
      <div className="mx-auto max-w-[980px] overflow-hidden bg-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.10)]">
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
}
