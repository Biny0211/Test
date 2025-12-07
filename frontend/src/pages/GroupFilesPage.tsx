import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { Search, MoreVertical, X } from "lucide-react";

import DashboardLayout from "../components/dashboard/DashboardLayout";
import AddFileModal from "../components/ui/AddFileModal";
import type { UploadPayload } from "../components/ui/AddFileModal";

type Group = { id: string; name: string; description?: string };

type FileRow = {
  id: string;
  fileName: string;
  member: string;
  description: string;
  created: string;
  status: "active" | "editing" | "paused";
  fileBlob?: {
    name: string;
    type: string;
    dataUrl: string;
  };
};

const GROUPS_KEY = "sharesplit.groups";
const FILES_KEY = (groupId: string) => `sharesplit.groupFiles.${groupId}`;

// ✅ GroupPage에서 저장하는 멤버 키와 동일해야 함
const MEMBERS_KEY = (groupId: string) => `sharesplit.groupMembers.${groupId}`;

const PER_PAGE = 10;

function norm(s: string) {
  return (s ?? "").toString().trim().toLowerCase();
}

function safeParseArray(raw: string | null) {
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function GroupFilesPage() {
  const { groupId } = useParams();
  const nav = useNavigate();

  const [groups] = useState<Group[]>(() => {
    try {
      const raw = localStorage.getItem(GROUPS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const group = useMemo(() => groups.find((g) => g.id === groupId), [groups, groupId]);

  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState<string>("All Members");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");

  const [addOpen, setAddOpen] = useState(false);

  const [rows, setRows] = useState<FileRow[]>(() => {
    try {
      const raw = localStorage.getItem(FILES_KEY(groupId || ""));
      if (raw) return JSON.parse(raw);
    } catch {}
    // 기본 데모 데이터 (+ 페이지 테스트용)
    return [
      {
        id: "f1",
        fileName: "FYP.doc",
        member: "Name1",
        description: "User Manual for...",
        created: "01/01/2025",
        status: "active",
      },
      {
        id: "f2",
        fileName: "Research.txt",
        member: "Name1",
        description: "Research about...",
        created: "01/03/2025",
        status: "active",
      },
      {
        id: "f3",
        fileName: "Project.doc",
        member: "Name3",
        description: "Report of project...",
        created: "01/05/2025",
        status: "editing",
      },
      {
        id: "f4",
        fileName: "ref.docx",
        member: "Name4",
        description: "Research of AI...",
        created: "01/07/2025",
        status: "paused",
      },
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `fx-${i}`,
        fileName: `DemoFile_${i + 1}.txt`,
        member: i % 2 === 0 ? "Name2" : "Name3",
        description: `Demo description ${i + 1}`,
        created: new Date().toLocaleDateString(),
        status: (i % 3 === 0 ? "active" : i % 3 === 1 ? "editing" : "paused") as FileRow["status"],
      })),
    ];
  });

  // groupId 바뀌면 다시 로드
  useEffect(() => {
    if (!groupId) return;
    try {
      const raw = localStorage.getItem(FILES_KEY(groupId));
      if (raw) setRows(JSON.parse(raw));
    } catch {}
  }, [groupId]);

  // 저장
  useEffect(() => {
    if (!groupId) return;
    localStorage.setItem(FILES_KEY(groupId), JSON.stringify(rows));
  }, [rows, groupId]);

  // ====== ✅ Actions menu: Portal ======
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<FileRow | null>(null);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<FileRow | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<FileRow["status"]>("active");

  // ESC close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(null);
        setDetailOpen(false);
        setEditOpen(false);
        setAddOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!group || !groupId) {
    return (
      <DashboardLayout titleTag="Group Files">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-extrabold">Group not found</h1>
          <button
            className="mt-6 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
            onClick={() => nav("/dashboard")}
          >
            Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ Member options: (1) group members + (2) rows에 등장하는 멤버
  const memberOptions = useMemo(() => {
    // 1) group members에서 name 뽑기 (예전 username 구조도 지원)
    const memberRaw = safeParseArray(localStorage.getItem(MEMBERS_KEY(groupId)));
    const namesFromGroupMembers = memberRaw
      .map((m: any) => (m?.name ?? m?.username ?? "").toString().trim())
      .filter(Boolean);

    // 2) files rows에서 member 뽑기
    const namesFromRows = rows.map((r) => (r.member ?? "").toString().trim()).filter(Boolean);

    // 합치고 uniq + 정렬
    const uniq = Array.from(new Set([...namesFromGroupMembers, ...namesFromRows].map((x) => x.trim()).filter(Boolean)));
    uniq.sort((a, b) => a.localeCompare(b));

    return ["All Members", ...uniq];
  }, [rows, groupId]);

  // ✅ member name filter + status filter + search
  const filtered = useMemo(() => {
    const q = norm(query);

    return rows.filter((r) => {
      const okQuery =
        !q ||
        norm(r.fileName).includes(q) ||
        norm(r.member).includes(q) ||
        norm(r.description).includes(q);

      const okMember =
        memberFilter === "All Members" ? true : norm(r.member) === norm(memberFilter);

      const okStatus =
        statusFilter === "All Status" ? true : r.status === statusFilter;

      return okQuery && okMember && okStatus;
    });
  }, [rows, query, memberFilter, statusFilter]);

  // ✅ pagination (10개씩)
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [query, memberFilter, statusFilter, groupId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, safePage]);

  const removeFile = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setMenu(null);
  };

  const downloadFile = (r: FileRow) => {
    if (r.fileBlob?.dataUrl) {
      const a = document.createElement("a");
      a.href = r.fileBlob.dataUrl;
      a.download = r.fileBlob.name || r.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      const blob = new Blob([`Demo download for: ${r.fileName}\nDescription: ${r.description}`], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${r.fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    setMenu(null);
  };

  const openDetail = (r: FileRow) => {
    setDetailRow(r);
    setDetailOpen(true);
    setMenu(null);
  };

  const openEdit = (r: FileRow) => {
    setEditRow(r);
    setEditDesc(r.description);
    setEditStatus(r.status);
    setEditOpen(true);
    setMenu(null);
  };

  const saveEdit = () => {
    if (!editRow) return;
    setRows((prev) =>
      prev.map((x) =>
        x.id === editRow.id ? { ...x, description: editDesc.trim() || "-", status: editStatus } : x
      )
    );
    setEditOpen(false);
    setEditRow(null);
  };

  return (
    <DashboardLayout titleTag="View Group files">
      <div className="max-w-6xl">
        <Panel>
          <button
            type="button"
            onClick={() => nav(`/dashboard/groups/${groupId}`)}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
          >
            ← Back to Group
          </button>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            {group.name} Files
          </h1>
          <p className="mt-2 text-sm text-zinc-300">View group uploaded files</p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end">
              {/* ✅ Member filter (그룹에 추가한 멤버도 뜸) */}
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 outline-none hover:bg-white/10"
              >
                {memberOptions.map((m) => (
                  <option key={m} value={m} className="bg-zinc-950">
                    {m}
                  </option>
                ))}
              </select>

              {/* ✅ Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 outline-none hover:bg-white/10"
              >
                <option value="All Status" className="bg-zinc-950">
                  All Status
                </option>
                <option value="active" className="bg-zinc-950">
                  active
                </option>
                <option value="editing" className="bg-zinc-950">
                  editing
                </option>
                <option value="paused" className="bg-zinc-950">
                  paused
                </option>
              </select>

              <button
                className="rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-300"
                onClick={() => setAddOpen(true)}
                type="button"
              >
                + Add file
              </button>
            </div>
          </div>

          {/* table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className="grid grid-cols-[1.2fr_1fr_1.6fr_1fr_.8fr_.6fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
              <div>File Name</div>
              <div>Member</div>
              <div>Description</div>
              <div>Created</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {pagedRows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1.2fr_1fr_1.6fr_1fr_.8fr_.6fr] items-center px-4 py-4 text-sm border-b border-white/5 last:border-b-0"
              >
                <div className="font-semibold">{r.fileName}</div>
                <div className="text-xs text-zinc-200">{r.member}</div>
                <div className="text-xs text-zinc-300">{r.description}</div>
                <div className="text-xs text-zinc-300">{r.created}</div>
                <div>
                  <StatusPill status={r.status} />
                </div>

                {/* ✅ Actions(⋮): Portal */}
                <div className="flex justify-end">
                  <button
                    className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();

                      const MENU_W = 224;
                      const MENU_H = 190;
                      const pad = 8;

                      let x = rect.right - MENU_W;
                      let y = rect.bottom + 8;

                      const maxX = window.innerWidth - MENU_W - pad;
                      const maxY = window.innerHeight - MENU_H - pad;

                      if (x < pad) x = pad;
                      if (x > maxX) x = maxX;

                      if (y > maxY) {
                        y = rect.top - MENU_H - 8;
                        if (y < pad) y = pad;
                      }

                      setMenu((prev) => (prev?.id === r.id ? null : { id: r.id, x, y }));
                    }}
                    aria-label="Actions"
                  >
                    <MoreVertical className="h-4 w-4 text-zinc-200" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ pagination UI */}
          <div className="mt-4 flex items-center justify-between text-xs text-zinc-300">
            <div>
              {filtered.length === 0 ? (
                <>Showing 0 of 0</>
              ) : (
                <>
                  Showing {(safePage - 1) * PER_PAGE + 1} -{" "}
                  {Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 disabled:opacity-50"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                Prev
              </button>

              <div className="px-2">
                Page <span className="font-semibold text-zinc-100">{safePage}</span> / {totalPages}
              </div>

              <button
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10 disabled:opacity-50"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </Panel>

        {/* Add file modal */}
        <AddFileModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          groupName={group.name}
          onUpload={(newFile: UploadPayload) => {
            setRows((prev) => [
              {
                id: crypto.randomUUID(),
                fileName: newFile.fileName,
                member: "Name1", // 필요하면 "현재 유저"로 바꿀 수 있음
                description: newFile.description || "-",
                created: new Date().toLocaleDateString(),
                status: "active",
                fileBlob: newFile.fileBlob,
              },
              ...prev,
            ]);
          }}
        />

        {/* View Detail Modal */}
        {detailOpen && detailRow && (
          <ModalShell onClose={() => setDetailOpen(false)} title="View detail">
            <div className="text-2xl font-extrabold text-white">{detailRow.fileName}</div>

            <div className="mt-3 text-sm text-zinc-300">
              <div>
                <b>Member:</b> {detailRow.member}
              </div>
              <div>
                <b>Created:</b> {detailRow.created}
              </div>

              <div className="mt-2">
                <StatusPill status={detailRow.status} />
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-zinc-100">Description</div>
                <div className="mt-2 rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-zinc-200">
                  {detailRow.description}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                className="w-full rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/20"
                onClick={() => setDetailOpen(false)}
                type="button"
              >
                close
              </button>

              <button
                className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400"
                onClick={() => downloadFile(detailRow)}
                type="button"
              >
                Download
              </button>
            </div>
          </ModalShell>
        )}

        {/* Edit Modal */}
        {editOpen && editRow && (
          <ModalShell onClose={() => setEditOpen(false)} title="Edit">
            <div className="text-2xl font-extrabold text-white">Edit file</div>
            <div className="mt-1 text-sm text-zinc-300">{editRow.fileName}</div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-100">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/60"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-100">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as FileRow["status"])}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/60"
                >
                  <option value="active" className="bg-zinc-950">
                    active
                  </option>
                  <option value="editing" className="bg-zinc-950">
                    editing
                  </option>
                  <option value="paused" className="bg-zinc-950">
                    paused
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-7 flex gap-4">
              <button
                className="w-full rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/20"
                onClick={() => setEditOpen(false)}
                type="button"
              >
                cancel
              </button>

              <button
                className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400"
                onClick={saveEdit}
                type="button"
              >
                Save
              </button>
            </div>
          </ModalShell>
        )}

        {/* ✅ Portal Actions Menu */}
        {menu &&
          createPortal(
            <div className="fixed inset-0 z-[9999]">
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                onClick={() => setMenu(null)}
                aria-label="Close menu"
              />

              <div
                ref={(el) => {
                  // ✅ "ref 콜백은 void만 반환" 오류 방지
                  menuRef.current = el;
                }}
                className="absolute w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl"
                style={{ left: menu.x, top: menu.y }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {(() => {
                  const target = rows.find((rr) => rr.id === menu.id);
                  if (!target) return null;

                  return (
                    <>
                      <MenuItem label="Download" onClick={() => downloadFile(target)} />
                      <MenuItem label="View detail" onClick={() => openDetail(target)} />
                      <MenuItem label="Edit" onClick={() => openEdit(target)} />
                      <div className="h-px bg-white/10" />
                      <MenuItem label="Delete" danger onClick={() => removeFile(target.id)} />
                    </>
                  );
                })()}
              </div>
            </div>,
            document.body
          )}
      </div>
    </DashboardLayout>
  );
}

/** ---------- UI helpers ---------- */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950 p-8 shadow-2xl">
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: "active" | "editing" | "paused" }) {
  const cls =
    status === "active"
      ? "bg-emerald-400/15 text-emerald-200"
      : status === "editing"
      ? "bg-amber-400/15 text-amber-200"
      : "bg-red-400/15 text-red-200";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${cls}`}>{status}</span>;
}

function MenuItem({
  label,
  danger,
  onClick,
}: {
  label: string;
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
      {label}
    </button>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[120]">
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />
      <div className="absolute left-1/2 top-1/2 w-[min(900px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-300">{title}</div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                onClick={onClose}
                type="button"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-zinc-200" />
              </button>
            </div>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
