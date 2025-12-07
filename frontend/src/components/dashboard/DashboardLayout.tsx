import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import AddGroupModal, { type Group } from "./AddGroupModal";

export default function DashboardLayout({
  titleTag,
  children,
}: {
  titleTag?: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [groupsOpen, setGroupsOpen] = useState(false);

  // ---- Groups (persist to localStorage) ----
  const STORAGE_KEY = "sharesplit.groups";

  const [groups, setGroups] = useState<Group[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [
          { id: "g1", name: "Group 1", description: "" },
          { id: "g2", name: "Group 2", description: "" },
        ];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Invalid groups");
      return parsed;
    } catch {
      return [
        { id: "g1", name: "Group 1", description: "" },
        { id: "g2", name: "Group 2", description: "" },
      ];
    }
  });

  const [addGroupOpen, setAddGroupOpen] = useState(false);

  const addGroup = (g: Group) => {
    setGroups((prev) => {
      const next = [g, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };
  // -----------------------------------------

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username;
  }, [user]);

  if (!user) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block w-full rounded-md px-3 py-2 text-left text-sm transition",
      isActive ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
    ].join(" ");

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      {/* 배경 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-950/45 via-zinc-950 to-zinc-950" />

      {/* Top bar + 로고 */}
      <header className="h-14 w-full bg-black/80 border-b border-white/10">
        <div className="flex h-full items-center justify-between px-6">
          <img
            src="/sharesplit.png"
            alt="ShareSplit"
            className="h-8 w-auto object-contain"
            draggable={false}
          />
          {titleTag ? <div className="text-xs text-zinc-400">{titleTag}</div> : null}
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-56px)] grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="flex flex-col border-r border-white/10 bg-zinc-950/60 backdrop-blur">
          {/* user */}
          <div className="px-5 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-100">{displayName}</div>
                <div className="truncate text-xs text-zinc-400">{user.email}</div>
              </div>
            </div>
          </div>

          {/* 메뉴: 세로로 한 줄씩 고정 */}
          <nav className="flex flex-col gap-1 p-4">
            {/* ✅ end: /dashboard에서만 active */}
            <NavLink to="/dashboard" end className={linkClass}>
              Dashboard
            </NavLink>

            <NavLink to="/dashboard/files" className={linkClass}>
              My Files
            </NavLink>

            <NavLink to="/dashboard/storage" className={linkClass}>
              My Storage
            </NavLink>

            <NavLink to="/dashboard/p2p" className={linkClass}>
              P2P Devices
            </NavLink>

            <div className="my-3 border-t border-white/10" />

            {/* My Groups toggle */}
            <button
              type="button"
              onClick={() => setGroupsOpen((v) => !v)}
              className={[
                "w-full rounded-xl px-4 py-3 text-left transition flex items-center justify-between",
                "border border-cyan-300/40",
                groupsOpen
                  ? "bg-cyan-400/15 text-white"
                  : "bg-white/5 text-zinc-200 hover:bg-white/10",
              ].join(" ")}
            >
              <span className="text-base font-semibold">My Groups</span>
              {groupsOpen ? (
                <ChevronUp className="h-5 w-5 text-zinc-100" />
              ) : (
                <ChevronDown className="h-5 w-5 text-zinc-100" />
              )}
            </button>

            {groupsOpen && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                {groups.map((g) => (
                  <GroupItem
                    key={g.id}
                    label={g.name}
                    onClick={() => nav(`/dashboard/groups/${g.id}`)}
                  />
                ))}

                <GroupItem label="+ New Group" onClick={() => setAddGroupOpen(true)} accent />
              </div>
            )}

            <div className="flex-1" />

            {/* Sign out */}
            <div className="border-t border-white/10 pt-4 px-1 pb-4">
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-300 hover:bg-white/5 hover:text-red-200"
                type="button"
                onClick={() => {
                  logout();
                  nav("/", { replace: true });
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="p-8 md:p-10">
          {children}

          <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-zinc-400">
            © 2025 ShareSplit. All rights reserved.
          </div>
        </main>
      </div>

      {/* Add group modal */}
      <AddGroupModal
        open={addGroupOpen}
        onClose={() => setAddGroupOpen(false)}
        onCreate={addGroup}
      />
    </div>
  );
}

function GroupItem({
  label,
  onClick,
  accent,
}: {
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full px-4 py-3 text-left text-sm transition",
        accent ? "text-cyan-300 hover:bg-white/10" : "text-zinc-200 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
