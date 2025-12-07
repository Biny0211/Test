// src/components/Navbar.tsx
import { NavLink, useNavigate } from "react-router-dom";

const base = "text-zinc-300 hover:text-white transition-colors";
const active = "text-white font-semibold";

export default function Navbar({ onSignIn }: { onSignIn?: () => void }) {
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/75 backdrop-blur">
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="grid h-16 md:h-18 lg:h-20 grid-cols-[auto_1fr_auto] items-center">
          <button onClick={() => nav("/")} className="flex items-center gap-3" aria-label="Go to Home" type="button">
            <img src="/sharesplit.png" alt="ShareSplit" className="h-9 w-auto md:h-10 lg:h-11" draggable={false} />
          </button>

          <nav className="hidden md:flex items-center justify-center gap-10 lg:gap-12">
            <NavLink to="/" end className={({ isActive }) => `${isActive ? active : base} text-base lg:text-lg`}>
              Home
            </NavLink>
            <NavLink to="/features" className={({ isActive }) => `${isActive ? active : base} text-base lg:text-lg`}>
              Features
            </NavLink>
            <NavLink to="/pricing" className={({ isActive }) => `${isActive ? active : base} text-base lg:text-lg`}>
              Pricing
            </NavLink>
          </nav>

          {/* ✅ 여기: /login 이동 X, 팝업 오픈 */}
          <button
            className="rounded-lg bg-sky-500 px-5 py-2 text-sm md:text-base font-semibold text-white hover:bg-sky-400"
            onClick={() => onSignIn?.()}
            type="button"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  );
}
