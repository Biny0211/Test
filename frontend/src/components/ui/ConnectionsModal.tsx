import { X } from "lucide-react";

export default function ConnectionsModal({
  open,
  onClose,
  onPickStorage,
}: {
  open: boolean;
  onClose: () => void;
  onPickStorage: (storageName: string) => void;
}) {
  if (!open) return null;

  const storages = [
    { account: "email1@gmail.com", storage: "google drive" },
    { account: "email1@gmail.com", storage: "AWS" },
  ];

  const p2p = [
    { username: "name1", device: "Laptop123456" },
    { username: "name2", device: "myPC" },
  ];

  return (
    <div className="fixed inset-0 z-[110]">
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />

      <div className="absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white">Connections</h2>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
                onClick={onClose}
                type="button"
              >
                <X className="h-4 w-4 text-zinc-200" />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <Section title="My Storages" rows={storages} onPick={onPickStorage} />
              <Section title="P2P devices" rows={p2p} onPick={(s) => onPickStorage(`p2p:${s}`)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  rows,
  onPick,
}: {
  title: string;
  rows: any[];
  onPick: (storageName: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        <button className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-cyan-300">
          add new
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-[1.4fr_1.2fr_.7fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
          <div>Account</div>
          <div>{title.includes("P2P") ? "Device" : "Storage"}</div>
          <div className="text-right"> </div>
        </div>

        {rows.map((r, idx) => (
          <div key={idx} className="grid grid-cols-[1.4fr_1.2fr_.7fr] items-center px-4 py-3 text-sm border-b border-white/5 last:border-b-0">
            <div className="text-xs text-zinc-300">{r.account ?? r.username}</div>
            <div className="text-xs text-zinc-200">{r.storage ?? r.device}</div>
            <div className="flex justify-end">
              <button
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/15"
                onClick={() => onPick(String(r.storage ?? r.device))}
                type="button"
              >
                select
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
