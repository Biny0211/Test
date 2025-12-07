import { useEffect, useState } from "react";

type StorageType = "Google Drive" | "Dropbox" | "OneDrive" | "AWS";

export default function ConnectStorageModal({
  open,
  onClose,
  onConnect,
}: {
  open: boolean;
  onClose: () => void;
  onConnect: (payload: { name: string; type: StorageType }) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<StorageType>("Google Drive");

  useEffect(() => {
    if (!open) return;
    setName("");
    setType("Google Drive");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
        type="button"
      />

      <div className="absolute left-1/2 top-1/2 w-[min(900px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950" />
          <div className="relative">
            <h2 className="text-xl font-extrabold text-white">Connect Storage</h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-100">
                  Storage Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Google Drive"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-100">
                  Storage Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as StorageType)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/60"
                >
                  <option value="Google Drive">Google Drive</option>
                  <option value="Dropbox">Dropbox</option>
                  <option value="OneDrive">OneDrive</option>
                  <option value="AWS">AWS</option>
                </select>

                <p className="mt-2 text-xs text-zinc-400">
                  You&apos;ll be redirected to authorize access.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/20"
                >
                  cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const n = name.trim();
                    if (!n) return;
                    onConnect({ name: n, type });
                    onClose();
                  }}
                  className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
