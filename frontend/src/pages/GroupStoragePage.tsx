import { useMemo, useState, useEffect, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { ChevronDown } from "lucide-react";
import ConnectStorageModal from "../components/ui/ConnectStorageModal";

type Group = { id: string; name: string; description?: string };

// ✅ 4종으로 고정
type StorageType = "Google Drive" | "Dropbox" | "OneDrive" | "AWS";
type StorageFilter = "All Storages" | StorageType;

type StorageRow = {
  id: string;
  name: string;
  type: StorageType;
  usedLabel: string; // "40.00 GB / 1 TB"
  percent: number;   // 40
};

const GROUPS_KEY = "sharesplit.groups";
const STORAGE_KEY = (groupId: string) => `sharesplit.groupStorages.${groupId}`;

export default function GroupStoragePage() {
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

  const [addOpen, setAddOpen] = useState(false);

  const [storages, setStorages] = useState<StorageRow[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(groupId || ""));
      if (raw) return JSON.parse(raw);
    } catch {}

    // ✅ demo seed (4종 포함)
    return [
      { id: "s1", name: "Name box", type: "Dropbox", usedLabel: "40.00 GB / 1 TB", percent: 40 },
      { id: "s2", name: "Name drive", type: "Google Drive", usedLabel: "18.00 GB / 1 TB", percent: 18 },
      { id: "s3", name: "Name onedrive", type: "OneDrive", usedLabel: "6.00 GB / 1 TB", percent: 6 },
      { id: "s4", name: "Name aws", type: "AWS", usedLabel: "5.00 GB / 1 TB", percent: 5 },
    ];
  });

  useEffect(() => {
    if (!groupId) return;
    localStorage.setItem(STORAGE_KEY(groupId), JSON.stringify(storages));
  }, [storages, groupId]);

  // ✅ 필터 상태
  const [filter, setFilter] = useState<StorageFilter>("All Storages");
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ 필터 메뉴는 4종 “항상” 보여주기 (요구사항)
  const FILTER_TYPES: StorageType[] = ["Google Drive", "Dropbox", "OneDrive", "AWS"];

  const filteredStorages = useMemo(() => {
    if (filter === "All Storages") return storages;
    return storages.filter((s) => s.type === filter);
  }, [storages, filter]);

  if (!group) {
    return (
      <DashboardLayout titleTag="Group Storage">
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

  return (
    <DashboardLayout titleTag="View group Storage">
      <div className="max-w-6xl">
        <Panel>
          <button
      type="button"
      onClick={() => nav(`/dashboard/groups/${groupId}`)}
      className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
    >
      ← Back to Group
    </button>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {group.name} Storage
          </h1>
          <p className="mt-2 text-sm text-zinc-300">Manage group connected storage</p>

          <div className="mt-6 flex items-center justify-end gap-2">
            {/* ✅ 필터 드롭다운 */}
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-100 hover:bg-white/10"
                onClick={() => setFilterOpen((v) => !v)}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/10 text-[10px]">
                  Y
                </span>
                {filter}
                <ChevronDown className="h-4 w-4 text-zinc-300" />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl z-50">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-zinc-200 hover:bg-white/10"
                    onClick={() => {
                      setFilter("All Storages");
                      setFilterOpen(false);
                    }}
                  >
                    All Storages
                  </button>

                  {FILTER_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-zinc-200 hover:bg-white/10"
                      onClick={() => {
                        setFilter(t);
                        setFilterOpen(false);
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add */}
            <button
              className="rounded-md bg-cyan-400 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-300"
              onClick={() => setAddOpen(true)}
              type="button"
            >
              + Add storage
            </button>
          </div>

          {/* 리스트 */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-semibold text-zinc-200">Connected Storages</div>

            <div className="mt-4 space-y-4">
              {filteredStorages.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-zinc-300">
                  No storages found.
                </div>
              ) : (
                filteredStorages.map((s) => (
                  <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{s.name}</div>
                        <div className="text-xs text-zinc-400">{s.type}</div>
                      </div>
                      <button
                        className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/15"
                        type="button"
                        onClick={() => alert("disconnect (demo)")}
                      >
                        disconnect
                      </button>
                    </div>

                    <div className="mt-4">
                      <div className="h-2 w-full rounded-full bg-black/40">
                        <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${s.percent}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-300">
                        <span>{s.usedLabel}</span>
                        <span>{s.percent}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Panel>

        {/* ✅ ConnectStorageModal payload.type 도 4종과 동일해야 함 */}
        <ConnectStorageModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onConnect={(payload) => {
            setStorages((prev) => [
              {
                id: crypto.randomUUID(),
                name: payload.name,
                type: payload.type as StorageType, // 모달 타입이 동일하면 as 필요없음
                usedLabel: "0.00 GB / 1 TB",
                percent: 0,
              },
              ...prev,
            ]);
          }}
        />
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

