import { useEffect, useState } from "react";

export type Group = {
  id: string;
  name: string;
  description?: string;
};

export default function AddGroupModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (group: Group) => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDesc("");
    setError("");
  }, [open]);

  if (!open) return null;

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Group name is required.");
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      name: trimmed,
      description: desc.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(860px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950" />
          <div className="relative">
            <div className="text-sm text-zinc-400">Add new group</div>
            <h2 className="mt-2 text-2xl font-extrabold text-white">Make new group</h2>

            <div className="mt-7 space-y-5">
              <div>
                <label className="text-sm font-semibold text-zinc-100">Group Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., group 1, group 2..."
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-100">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Enter about group"
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
                />
              </div>

              {error ? <div className="text-sm text-red-300">{error}</div> : null}

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
                  onClick={create}
                  className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400"
                >
                  Create
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-zinc-400">
                The user who creates the group will be assigned the Group Owner role by default.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
