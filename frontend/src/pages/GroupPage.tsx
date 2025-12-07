import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  X,
  MoreVertical,
  Shield,
  User,
} from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";

type Group = { id: string; name: string; description?: string };

type Role = "Group owner" | "Group member";

type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  online: boolean;
  detail?: string;
};

type FileRow = {
  id: string;
  fileName: string;
  member: string; // GroupFilesPage에서 저장하는 member 값 (예: "Name1")
  description: string;
  created: string;
  status: "active" | "editing" | "paused";
};

const GROUPS_KEY = "sharesplit.groups";
const MEMBERS_KEY = (groupId: string) => `sharesplit.groupMembers.${groupId}`;
const GROUP_FILES_KEY = (groupId: string) => `sharesplit.groupFiles.${groupId}`;

// 데모: 존재하는 계정(초대 검증용). 실제론 백엔드에서 검증.
const EXISTING_USERS = new Set([
  "name1@example.com",
  "name2@example.com",
  "name3@example.com",
  "name4@example.com",
  "john@example.com",
  "emily@example.com",
]);

function seedMembers(): Member[] {
  return [
    {
      id: "m1",
      name: "Name1",
      email: "name1@example.com",
      role: "Group owner",
      online: true,
      detail: "Owner of this group.",
    },
    {
      id: "m2",
      name: "Name2",
      email: "name2@example.com",
      role: "Group member",
      online: false,
      detail: "Regular member.",
    },
    {
      id: "m3",
      name: "Name3",
      email: "name3@example.com",
      role: "Group member",
      online: true,
      detail: "Contributes files frequently.",
    },
    {
      id: "m4",
      name: "Name4",
      email: "name4@example.com",
      role: "Group member",
      online: false,
      detail: "Occasional contributor.",
    },
  ];
}

function normalizeMembers(raw: any[]): Member[] {
  return raw
    .map((m) => {
      // 이전 구조: { username, role, online, detail }
      const name = (m?.name ?? m?.username ?? "").toString();
      if (!name) return null;

      const email =
        (m?.email ??
          // 예전 데이터엔 email이 없으니 임시로 만들어줌
          `${name.toLowerCase().replace(/\s+/g, "")}@example.com`).toString();

      const roleRaw = (m?.role ?? "Group member").toString();
      const role: Role =
        roleRaw === "Group owner" || roleRaw === "Group member"
          ? roleRaw
          : // 예전 코드가 다른 문자열이면 여기서 매핑
            roleRaw.toLowerCase().includes("owner")
            ? "Group owner"
            : "Group member";

      return {
        id: (m?.id ?? crypto.randomUUID()).toString(),
        name,
        email,
        role,
        online: Boolean(m?.online),
        detail: m?.detail ? String(m.detail) : undefined,
      } as Member;
    })
    .filter(Boolean) as Member[];
}

function loadMembers(groupId: string): Member[] {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY(groupId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = normalizeMembers(parsed);
        // 변환된 최신 형태로 다시 저장 (한 번만)
        localStorage.setItem(MEMBERS_KEY(groupId), JSON.stringify(normalized));
        return normalized;
      }
    }
  } catch {}

  const seeded = seedMembers();
  try {
    localStorage.setItem(MEMBERS_KEY(groupId), JSON.stringify(seeded));
  } catch {}
  return seeded;
}


export default function GroupPage() {
  const { groupId } = useParams();
  const nav = useNavigate();

  // groups load
  const [groups] = useState<Group[]>(() => {
    try {
      const raw = localStorage.getItem(GROUPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const group = useMemo(
    () => groups.find((g) => g.id === groupId),
    [groups, groupId]
  );

  // ✅ 핵심: members를 groupId별로 로드/저장
  const [members, setMembers] = useState<Member[]>(() =>
    groupId ? loadMembers(groupId) : []
  );

  // groupId 바뀌면 해당 그룹 멤버로 교체
  useEffect(() => {
    if (!groupId) return;
    setMembers(loadMembers(groupId));
  }, [groupId]);

  // members 변경 시 해당 groupId에만 저장
  useEffect(() => {
    if (!groupId) return;
    try {
      localStorage.setItem(MEMBERS_KEY(groupId), JSON.stringify(members));
    } catch {}
  }, [members, groupId]);

  // group not found
  if (!group || !groupId) {
    return (
      <DashboardLayout titleTag="Group">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-extrabold">Group not found</h1>
          <p className="mt-2 text-sm text-zinc-300">This group does not exist.</p>
          <button
            className="mt-6 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
            onClick={() => nav("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // search
  const [memberQuery, setMemberQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, memberQuery]);

  // ---- Modals ----
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addError, setAddError] = useState<string>("");

  const [filesOpen, setFilesOpen] = useState(false);
  const [filesUser, setFilesUser] = useState<Member | null>(null);

  // actions menu (⋮)
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  // close menu on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpenFor(null);
        setAddOpen(false);
        setFilesOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // outside click -> close menu
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.("[data-actions-root]")) return;
      setMenuOpenFor(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ---- Handlers ----
  const openMemberFiles = (m: Member) => {
    setFilesUser(m);
    setFilesOpen(true);
    setMenuOpenFor(null);
  };

  const inviteMember = () => {
    const name = addName.trim();
    const email = addEmail.trim().toLowerCase();

    if (!name || !email) {
      setAddError("name and email are required");
      return;
    }
    if (!email.includes("@")) {
      setAddError("invalid email");
      return;
    }

    // demo validation
    if (!EXISTING_USERS.has(email)) {
      setAddError("user does not exist");
      return;
    }

    // already in group
    if (members.some((m) => m.email.toLowerCase() === email)) {
      setAddError("already in group");
      return;
    }

    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name,
        email,
        role: "Group member",
        online: true,
        detail: "Invited member",
      },
    ]);

    setAddOpen(false);
    setAddName("");
    setAddEmail("");
    setAddError("");
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setMenuOpenFor(null);
  };

  const toggleRole = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const nextRole: Role = m.role === "Group owner" ? "Group member" : "Group owner";
        return { ...m, role: nextRole };
      })
    );
    setMenuOpenFor(null);
  };

  const viewDetail = (m: Member) => {
    alert(`${m.name}\n${m.email}\n\n${m.detail ?? "No details"}`);
    setMenuOpenFor(null);
  };

  // ✅ View files 모달: 해당 그룹의 groupFiles에서 읽어오기
  const groupFiles: FileRow[] = useMemo(() => {
    try {
      const raw = localStorage.getItem(GROUP_FILES_KEY(groupId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, [groupId, filesOpen]); // filesOpen 시 새로 읽어서 최신 반영

  const memberFiles = useMemo(() => {
    if (!filesUser) return [];
    return groupFiles.filter(
      (f) => f.member.toLowerCase() === filesUser.name.toLowerCase()
    );
  }, [groupFiles, filesUser]);

  return (
    <DashboardLayout titleTag="Group - group owner">
      <div className="max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{group.name}</h1>
        <p className="mt-2 text-sm text-zinc-300">Manage group members</p>

        {/* top actions */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="Search member..."
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
            />
          </div>

          <div className="flex items-center gap-2 self-end">
            {/* ✅ All roles 필터 제거 */}
            <button
              className="rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-300"
              onClick={() => {
                setAddOpen(true);
                setAddName("");
                setAddEmail("");
                setAddError("");
              }}
            >
              + Add member
            </button>
          </div>
        </div>

        {/* table */}
        {/* ✅ overflow-hidden 제거 -> 메뉴가 잘리지 않음 */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-[.7fr_1.2fr_1.6fr_1.2fr_.9fr_.6fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
            <div>Number</div>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Online</div>
            <div className="text-right">Actions</div>
          </div>

          {filteredMembers.map((m, idx) => (
            <div
              key={m.id}
              className="relative grid grid-cols-[.7fr_1.2fr_1.6fr_1.2fr_.9fr_.6fr] items-center px-4 py-4 text-sm border-b border-white/5 last:border-b-0"
            >
              <div className="text-zinc-300">{idx + 1}</div>

              <div className="font-semibold">{m.name}</div>
              <div className="text-xs text-zinc-300">{m.email}</div>

              <div className="flex items-center gap-2 text-xs text-zinc-300">
                {m.role === "Group owner" ? (
                  <Shield className="h-4 w-4 text-cyan-300" />
                ) : (
                  <User className="h-4 w-4 text-zinc-400" />
                )}
                <span>{m.role}</span>
              </div>

              <div>
                <span
                  className={[
                    "rounded-full px-2 py-1 text-xs font-semibold",
                    m.online ? "bg-emerald-400/15 text-emerald-200" : "bg-red-400/15 text-red-200",
                  ].join(" ")}
                >
                  {m.online ? "Online" : "Offline"}
                </span>
              </div>

              {/* actions */}
              <div className="flex justify-end" data-actions-root>
                <button
                  className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => setMenuOpenFor((prev) => (prev === m.id ? null : m.id))}
                  type="button"
                >
                  <MoreVertical className="h-4 w-4 text-zinc-200" />
                </button>

                {menuOpenFor === m.id && (
                  <div className="absolute right-4 top-14 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl">
                    <MenuItem onClick={() => openMemberFiles(m)} label="View file" />
                    <MenuItem onClick={() => viewDetail(m)} label="View detail" />
                    <MenuItem onClick={() => toggleRole(m.id)} label="Change role" sub="owner ↔ member" />
                    <div className="h-px bg-white/10" />
                    <MenuItem onClick={() => removeMember(m.id)} label="Leave group" danger />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* bottom buttons */}
        <div className="mt-6 flex gap-3">
          <button
            className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10"
            onClick={() => nav(`/dashboard/groups/${group.id}/storage`)}
          >
            View storage
          </button>
          <button
            className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-100 hover:bg-white/10"
            onClick={() => nav(`/dashboard/groups/${group.id}/files`)}
          >
            View files
          </button>
        </div>
      </div>

      {/* ===== Add Member Modal ===== */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)}>
        <div className="text-sm text-zinc-300">Add member</div>
        <div className="mt-2 text-xl font-extrabold text-white">Add Member</div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-zinc-100">Name</label>
            <input
              value={addName}
              onChange={(e) => {
                setAddName(e.target.value);
                setAddError("");
              }}
              placeholder="e.g., John"
              className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-100">Email</label>
            <div className="relative mt-2">
              <input
                value={addEmail}
                onChange={(e) => {
                  setAddEmail(e.target.value);
                  setAddError("");
                }}
                placeholder="e.g., john@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
              />

              {addError ? (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <span className="text-xs text-red-300">{addError}</span>
                  <button
                    className="grid h-5 w-5 place-items-center rounded-full bg-red-500/20"
                    onClick={() => setAddError("")}
                    type="button"
                    aria-label="clear error"
                  >
                    <X className="h-3 w-3 text-red-200" />
                  </button>
                </div>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Demo validation: try <b>john@example.com</b>
            </p>
          </div>
        </div>

        <div className="mt-7 flex gap-4">
          <button
            className="w-full rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/20"
            onClick={() => setAddOpen(false)}
            type="button"
          >
            cancel
          </button>
          <button
            className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400"
            onClick={inviteMember}
            type="button"
          >
            Add
          </button>
        </div>
      </Modal>

      {/* ===== View Member Files Modal ===== */}
      <Modal open={filesOpen} onClose={() => setFilesOpen(false)} wide>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold text-white">
              {filesUser?.name} Files
            </div>
            <div className="mt-1 text-sm text-zinc-300">
              Files uploaded in this group
            </div>
          </div>

          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
            onClick={() => setFilesOpen(false)}
            type="button"
            aria-label="close"
          >
            <X className="h-4 w-4 text-zinc-200" />
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-[1.1fr_1.7fr_.8fr_.8fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
            <div>File Name</div>
            <div>Description</div>
            <div>Status</div>
            <div>Created</div>
          </div>

          {memberFiles.length === 0 ? (
            <div className="px-4 py-6 text-sm text-zinc-300">No files uploaded.</div>
          ) : (
            memberFiles.map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-[1.1fr_1.7fr_.8fr_.8fr] items-center px-4 py-4 text-sm border-b border-white/5 last:border-b-0"
              >
                <div className="font-semibold">{f.fileName}</div>
                <div className="text-xs text-zinc-300">{f.description}</div>
                <div className="text-xs text-zinc-300">{f.status}</div>
                <div className="text-xs text-zinc-300">{f.created}</div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}

/* ---------- small components ---------- */

function MenuItem({
  label,
  sub,
  danger,
  onClick,
}: {
  label: string;
  sub?: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full px-4 py-3 text-left text-sm transition",
        danger ? "text-red-300 hover:bg-red-500/10" : "text-zinc-200 hover:bg-white/10",
      ].join(" ")}
    >
      <div className="font-semibold">{label}</div>
      {sub ? <div className="mt-0.5 text-xs text-zinc-400">{sub}</div> : null}
    </button>
  );
}

/** Modal shell */
function Modal({
  open,
  onClose,
  wide,
  children,
}: {
  open: boolean;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={[
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl",
          wide ? "w-[min(980px,92vw)]" : "w-[min(720px,92vw)]",
        ].join(" ")}
      >
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}
