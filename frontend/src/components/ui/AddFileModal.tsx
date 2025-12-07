import { useEffect, useState } from "react";
import ConnectionsModal from "./ConnectionsModal";

export type UploadPayload = {
  fileName: string;
  description?: string;
  fileBlob?: {
    name: string;
    type: string;
    dataUrl: string; // base64 data url
  };
};

export default function AddFileModal({
  open,
  onClose,
  groupName,
  onUpload,
}: {
  open: boolean;
  onClose: () => void;
  groupName: string;
  onUpload: (payload: UploadPayload) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [desc, setDesc] = useState("");

  // 실제 파일 선택
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  const [fileShardCount, setFileShardCount] = useState(1);
  const [keyShardCount, setKeyShardCount] = useState(1);

  const [connOpen, setConnOpen] = useState(false);
  const [pickTarget, setPickTarget] = useState<{ kind: "file" | "key"; index: number } | null>(null);

  const [fileShardStorage, setFileShardStorage] = useState<(string | null)[]>([null]);
  const [keyShardStorage, setKeyShardStorage] = useState<(string | null)[]>([null]);

  useEffect(() => {
    if (!open) return;
    setFileName("");
    setDesc("");
    setPickedFile(null);
    setFileShardCount(1);
    setKeyShardCount(1);
    setFileShardStorage([null]);
    setKeyShardStorage([null]);
  }, [open]);

  useEffect(() => setFileShardStorage((p) => resize(p, fileShardCount)), [fileShardCount]);
  useEffect(() => setKeyShardStorage((p) => resize(p, keyShardCount)), [keyShardCount]);

  if (!open) return null;

  const canUpload = fileName.trim().length > 0;

  const onPick = (storageName: string) => {
    if (!pickTarget) return;

    if (pickTarget.kind === "file") {
      setFileShardStorage((prev) => prev.map((v, i) => (i === pickTarget.index ? storageName : v)));
    } else {
      setKeyShardStorage((prev) => prev.map((v, i) => (i === pickTarget.index ? storageName : v)));
    }

    setConnOpen(false);
    setPickTarget(null);
  };

  const pickFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = () => {
      const f = input.files?.[0] ?? null;
      setPickedFile(f);

      // 파일 선택했으면 기본 파일명 자동 채우기
      if (f && !fileName.trim()) setFileName(f.name);
    };
    input.click();
  };

  const handleUpload = async () => {
    if (!canUpload) return;

    let fileBlob: UploadPayload["fileBlob"] = undefined;

    if (pickedFile) {
      const dataUrl = await fileToDataUrl(pickedFile);
      fileBlob = {
        name: pickedFile.name,
        type: pickedFile.type || "application/octet-stream",
        dataUrl,
      };
    }

    onUpload({
      fileName: fileName.trim(),
      description: desc.trim(),
      fileBlob,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <button className="absolute inset-0 bg-black/60" onClick={onClose} aria-label="Close" />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(980px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/55 via-zinc-950 to-zinc-950" />
          <div className="relative">
            <h2 className="text-xl font-extrabold text-white">Upload New file</h2>

            {/* drop area */}
            <button
              type="button"
              onClick={pickFile}
              className="mt-5 w-full rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center text-sm text-zinc-300 hover:bg-white/10"
            >
              <div className="font-semibold">Click to upload or drag and drop</div>
              <div className="mt-1 text-xs text-zinc-400">Any file type supported</div>
              <div className="mt-3 text-xs text-zinc-200">
                {pickedFile ? `Selected: ${pickedFile.name}` : "No file selected"}
              </div>
            </button>

            <div className="mt-6 grid gap-5">
              <div>
                <label className="text-sm font-semibold text-zinc-100">File Name</label>
                <input
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-100">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Enter file description (optional)"
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
                />
              </div>

              <ShardTable
                title="File Shards"
                count={fileShardCount}
                setCount={setFileShardCount}
                storages={fileShardStorage}
                onChoose={(idx) => {
                  setPickTarget({ kind: "file", index: idx });
                  setConnOpen(true);
                }}
              />

              <ShardTable
                title="Key Shards"
                count={keyShardCount}
                setCount={setKeyShardCount}
                storages={keyShardStorage}
                onChoose={(idx) => {
                  setPickTarget({ kind: "key", index: idx });
                  setConnOpen(true);
                }}
              />

              <div className="mt-2 flex items-center gap-4">
                <button
                  className="w-full rounded-full bg-white/15 px-6 py-3 text-sm font-semibold text-zinc-100 hover:bg-white/20"
                  onClick={onClose}
                  type="button"
                >
                  cancel
                </button>
                <button
                  className="w-full rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                  disabled={!canUpload}
                  onClick={handleUpload}
                  type="button"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConnectionsModal
        open={connOpen}
        onClose={() => {
          setConnOpen(false);
          setPickTarget(null);
        }}
        onPickStorage={onPick}
      />
    </div>
  );
}

function ShardTable({
  title,
  count,
  setCount,
  storages,
  onChoose,
}: {
  title: string;
  count: number;
  setCount: (n: number) => void;
  storages: (string | null)[];
  onChoose: (index: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        <div className="text-xs text-zinc-300">
          No. of shards{" "}
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="ml-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs outline-none"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-[.8fr_1.2fr_1fr] border-b border-white/10 bg-white/5 px-4 py-3 text-[11px] text-zinc-300">
          <div>Shard No.</div>
          <div>Storage</div>
          <div className="text-right">choose location</div>
        </div>

        {storages.map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-[.8fr_1.2fr_1fr] items-center px-4 py-3 text-sm border-b border-white/5 last:border-b-0"
          >
            <div className="text-zinc-200">{i + 1}</div>
            <div className="text-xs text-zinc-300">{s ?? "-"}</div>
            <div className="flex justify-end">
              <button
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/15"
                onClick={() => onChoose(i)}
                type="button"
              >
                choose location
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function resize<T>(arr: T[], n: number) {
  if (arr.length === n) return arr;
  if (arr.length < n) return [...arr, ...Array.from({ length: n - arr.length }, () => null as any)];
  return arr.slice(0, n);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(new Error("Failed to read file"));
    fr.readAsDataURL(file);
  });
}
