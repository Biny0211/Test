import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { ChevronDown } from "lucide-react";

type Group = { id: string; name: string; description?: string };

type StorageType = "Google Drive" | "Dropbox" | "OneDrive" | "Device" | "P2P";

type StorageRow = {
  id: string;
  groupId: string;
  groupName: string;
  type: StorageType;
  account: string;        // 연결된 계정 표시용
  status: "connected" | "disconnected";
  created: string;
};

const GROUPS_KEY = "sharesplit.groups";
const STORAGES_KEY = (groupId: string) => `sharesplit.groupStorages.${groupId}`;

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

/**
 * ✅ 그룹마다 storage 1개 이상 자동 생성 (필터 테스트용)
 * - Group 1/2/3 각각에 storage 2~3개 정도 생성
 * - 기존 데이터 있으면 덮지 않음
 */
function ensureStorageDemoData() {
  const groups = safeRead<Group[]>(GROUPS_KEY, []).slice(0, 3);
  const types: StorageType[] = ["Google Drive", "Dropbox", "OneDrive", "Device", "P2P"];

  groups.forEach((g, gi) => {
    const key = STORAGES_KEY(g.id);
    const existing = safeRead<StorageRow[]>(key, []);
    if (existing.length >= 6) return;

    const base = new Date(2025, 0, 10 + gi * 3);

    const make = (n: number, type: StorageType, account: string, status: StorageRow["status"]): StorageRow => {
      const d = new Date(base);
      d.setDate(d.getDate() + n);
      return {
        id: crypto.randomUUID(),
        groupId: g.id,
        groupName: g.name,
        type,
        account,
        status,
        created: d.toLocaleDateString(),
      };
    };

    // 그룹마다 최소 1개는 반드시
    const add: StorageRow[] = [
      make(0, types[(gi + 0) % types.length], "name1@account", "connected"),
      make(1, types[(gi + 1) % types.length], "name1@account", "connected"),
      make(2, types[(gi + 2) % types.length], "name1@account", "disconnected"),
    ];

    safeWrite(key, [...existing, ...add].slice(0, 10));
  });
}

export default function MyStorage() {
  const [groupOpen, setGroupOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<StorageType | "all">("all");

  const [page, setPage] = useState(1);

  const groups = useMemo(() => safeRead<Group[]>(GROUPS_KEY, []).slice(0, 3), []);
  const allTypes: StorageType[] = ["Google Drive", "Dropbox", "OneDrive", "Device", "P2P"];

  useEffect(() => {
    ensureStorageDemoData();
  }, []);

  const allStorages = useMemo(() => {
    const out: StorageRow[] = [];
    groups.forEach((g) => {
      const rows = safeRead<StorageRow[]>(STORAGES_KEY(g.id), []);
      out.push(...rows.map((r) => ({ ...r, groupName: g.name })));
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
    return allStorages.filter((s) => {
      const gOk = selectedGroupId === "all" ? true : s.groupId === selectedGroupId;
      const tOk = selectedType === "all" ? true : s.type === selectedType;
      return gOk && tOk;
    });
  }, [allStorages, selectedGroupId, selectedType]);

  useEffect(() => setPage(1), [selectedGroupId, selectedType]);

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
      if (t.closest?.("[data-filter-root]")) return;
      setGroupOpen(false);
      setTypeOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <DashboardLayout titleTag="My storage">
      <div className="max-w-6xl">
        <Panel>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">My storage</h1>
          <p className="mt-2 text-sm text-zinc-300">Filter by group and storage type.</p>

          <div className="mt-6 flex flex-wrap gap-2 justify-end" data-filter-root>
            {/* Group filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setGroupOpen((v) => !v);
                  setTypeOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/10 text-[10px]">G</span>
                {selectedGroupId === "all"
                  ? "All Groups"
                  : groups.find((g) => g.id === selectedGroupId)?.name ?? "Group"}
                <ChevronDown className="h-4 w-4 text-zinc-300" />
              </button>

              {groupOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl z-20">
                  <FilterItem
                    label="All Groups"
                    active={selectedGroupId === "all"}
                    onClick={() => {
                      setSelectedGroupId("all");
                      setGroupOpen(false);
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
                        setGroupOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Type filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTypeOpen((v) => !v);
                  setGroupOpen(false);
                }}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/10 text-[10px]">T</span>
                {selectedType === "all" ? "All Types" : selectedType}
                <ChevronDown className="h-4 w-4 text-zinc-300" />
              </button>

              {typeOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl z-20">
                  <FilterItem
                    label="All Types"
                    active={selectedType === "all"}
                    onClick={() => {
                      setSelectedType("all");
                      setTypeOpen(false);
                    }}
                  />
                  <div className="h-px bg-white/10" />
                  {allTypes.map((t) => (
                    <FilterItem
                      key={t}
                      label={t}
                      active={selectedType === t}
                      onClick={() => {
                        setSelectedType(t);
                        setTypeOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_.8fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
              <div>Group</div>
              <div>Storage Type</div>
              <div>Account</div>
              <div>Created</div>
              <div>Status</div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-zinc-400">No storage found.</div>
            ) : (
              paged.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_1fr_1fr_1fr_.8fr] items-center px-4 py-4 text-sm border-b border-white/5 last:border-b-0"
                >
                  <div className="text-sm font-semibold">{s.groupName}</div>
                  <div className="text-xs text-zinc-200">{s.type}</div>
                  <div className="text-xs text-zinc-300">{s.account}</div>
                  <div className="text-xs text-zinc-300">{s.created}</div>
                  <div>
                    <StoragePill status={s.status} />
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

function StoragePill({ status }: { status: "connected" | "disconnected" }) {
  const cls =
    status === "connected"
      ? "bg-emerald-400/15 text-emerald-200"
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
