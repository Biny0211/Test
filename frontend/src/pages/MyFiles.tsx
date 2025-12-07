import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Search, ChevronDown } from "lucide-react";

type Group = { id: string; name: string; description?: string };

type FileRow = {
  id: string;
  fileName: string;
  member: string;
  description: string;
  created: string;
  status: "active" | "editing" | "paused";
  fileBlob?: { name: string; type: string; dataUrl: string };
};

type MyFileRow = FileRow & {
  groupId: string;
  groupName: string;
};

const OWNER_NAME = "Name1";
const GROUPS_KEY = "sharesplit.groups";
const FILES_KEY = (groupId: string) => `sharesplit.groupFiles.${groupId}`;

const PAGE_SIZE = 10;

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function safeWrite(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureDemoData() {
  const groups = safeRead<Group[]>(GROUPS_KEY, []);
  let usedGroups = groups;

  if (usedGroups.length < 3) {
    const toAdd: Group[] = [];
    for (let i = usedGroups.length + 1; i <= 3; i++) {
      toAdd.push({ id: crypto.randomUUID(), name: `Group ${i}`, description: `Demo Group ${i}` });
    }
    usedGroups = [...usedGroups, ...toAdd];
    safeWrite(GROUPS_KEY, usedGroups);
  }

  const top3 = usedGroups.slice(0, 3);

  top3.forEach((g, idx) => {
    const key = FILES_KEY(g.id);
    const existing = safeRead<FileRow[]>(key, []);
    if (existing.length >= 18) return;

    const baseDate = new Date(2025, 0, 1 + idx * 6);
    const make = (n: number, who: string, fileName: string, desc: string, status: FileRow["status"]): FileRow => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + n);
      return { id: crypto.randomUUID(), fileName, member: who, description: desc, created: d.toLocaleDateString(), status };
    };

    const add: FileRow[] = [
      make(0, "Name1", `FYP_${idx + 1}_report.docx`, "FYP report draft", "active"),
      make(1, "Name1", `design_${idx + 1}.fig`, "UI wireframe export", "editing"),
      make(2, "Name1", `research_${idx + 1}.pdf`, "Research notes", "active"),
      make(3, "Name1", `meeting_${idx + 1}.txt`, "Meeting summary", "paused"),
      make(4, "Name1", `slides_${idx + 1}.pptx`, "Presentation slides", "active"),
      make(5, "Name1", `budget_${idx + 1}.xlsx`, "Cost estimation", "active"),
      make(6, "Name1", `api_spec_${idx + 1}.md`, "API endpoints draft", "editing"),
      make(7, "Name1", `testcases_${idx + 1}.csv`, "Test cases list", "active"),
      make(8, "Name1", `notes_${idx + 1}.txt`, "Extra notes", "active"),
      make(9, "Name1", `draft_${idx + 1}.doc`, "Draft document", "editing"),
      make(10, "Name2", `other_${idx + 1}_a.doc`, "Other member file", "active"),
      make(11, "Name3", `other_${idx + 1}_b.doc`, "Other member file", "editing"),
      make(12, "Name4", `other_${idx + 1}_c.doc`, "Other member file", "paused"),
    ];

    safeWrite(key, [...existing, ...add].slice(0, 22));
  });
}

export default function MyFiles() {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    ensureDemoData();
  }, []);

  const groups = useMemo(() => safeRead<Group[]>(GROUPS_KEY, []).slice(0, 3), []);

  const allMyFiles = useMemo(() => {
    const out: MyFileRow[] = [];
    groups.forEach((g) => {
      const rows = safeRead<FileRow[]>(FILES_KEY(g.id), []);
      rows.forEach((r) => {
        if (r.member === OWNER_NAME) out.push({ ...r, groupId: g.id, groupName: g.name });
      });
    });

    out.sort((a, b) => {
      const da = Date.parse(a.created);
      const db = Date.parse(b.created);
      if (!Number.isNaN(da) && !Number.isNaN(db)) return db - da;
      return 0;
    });

    return out;
  }, [groups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allMyFiles.filter((f) => {
      const groupOk = selectedGroupId === "all" ? true : f.groupId === selectedGroupId;
      if (!groupOk) return false;
      if (!q) return true;
      return (
        f.fileName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.groupName.toLowerCase().includes(q)
      );
    });
  }, [allMyFiles, query, selectedGroupId]);

  useEffect(() => setPage(1), [selectedGroupId, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.("[data-group-filter]")) return;
      setFilterOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <DashboardLayout titleTag="My files">
      <div className="max-w-6xl">
        <Panel>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">My files</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Showing all files uploaded by <b>{OWNER_NAME}</b>. Filter by group.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search my files..."
                className="w-full rounded-md border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
              />
            </div>

            <div className="relative self-end" data-group-filter>
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/10 text-[10px]">G</span>
                {selectedGroupId === "all"
                  ? "All Groups"
                  : groups.find((g) => g.id === selectedGroupId)?.name ?? "Group"}
                <ChevronDown className="h-4 w-4 text-zinc-300" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl z-20">
                  <FilterItem
                    label="All Groups"
                    active={selectedGroupId === "all"}
                    onClick={() => {
                      setSelectedGroupId("all");
                      setFilterOpen(false);
                    }}
                  />
                  <div className="h-px bg-white/10" />
                  {groups.map((g) => (
                    <FilterItem
                      key={g.id}
                      label={g.name}
                      active={selectedGroupId === g.id}
                      onClick={() => {
                        setSelectedGroupId(g.id);
                        setFilterOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className="grid grid-cols-[1.2fr_1fr_1.6fr_1fr_.8fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
              <div>File Name</div>
              <div>Group</div>
              <div>Description</div>
              <div>Created</div>
              <div>Status</div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-zinc-400">No files found.</div>
            ) : (
              // ✅ 여기 무조건 paged만 렌더 → 10개 제한 동작
              paged.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1.2fr_1fr_1.6fr_1fr_.8fr] items-center px-4 py-4 text-sm border-b border-white/5 last:border-b-0"
                >
                  <div className="font-semibold">{r.fileName}</div>
                  <div className="text-xs text-zinc-200">{r.groupName}</div>
                  <div className="text-xs text-zinc-300">{r.description}</div>
                  <div className="text-xs text-zinc-300">{r.created}</div>
                  <div>
                    <StatusPill status={r.status} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-400">
              Showing <b className="text-zinc-200">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</b>
              {" - "}
              <b className="text-zinc-200">{Math.min(page * PAGE_SIZE, filtered.length)}</b> of{" "}
              <b className="text-zinc-200">{filtered.length}</b>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                type="button"
              >
                Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(0, 7)
                  .map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={[
                        "h-8 w-8 rounded-md text-xs font-semibold",
                        n === page
                          ? "bg-cyan-400 text-zinc-950"
                          : "border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10",
                      ].join(" ")}
                      type="button"
                    >
                      {n}
                    </button>
                  ))}
                {totalPages > 7 && <span className="px-2 text-xs text-zinc-500">…</span>}
              </div>

              <button
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200 hover:bg-white/10 disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
}

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

function FilterItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full px-4 py-3 text-left text-sm transition",
        active ? "text-white bg-white/10" : "text-zinc-200 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
