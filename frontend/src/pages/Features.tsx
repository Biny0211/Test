import { ShieldCheck, Cloud, Lock, Users, Activity, FileKey2, ClipboardCheck } from "lucide-react";

export default function Features() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_center,rgba(34,197,94,0.14),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="font-arima text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Powerful Features for
            <br />
            <span className="text-[#00FFC6]">Secure Data Management</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-zinc-300 md:text-base">
            Discover how ShareSplit revolutionizes data storage with cutting-edge security,
            seamless integration, and unparalleled reliability.
          </p>
        </div>
      </section>

      {/* Core Functionality */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Core Functionality</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Everything you need to manage your data across multiple platforms with confidence.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <FeatureCard
            Icon={Cloud}
            title="Secure Split Storage"
            subtitle="Split your file and key into encrypted fragments and store them across multiple clouds and devices."
            bullets={[
              "File encryption & decryption",
              "File split & reconstruction",
              "Distributed storage backend (Google Drive, Dropbox)",
            ]}
          />
          <FeatureCard
            Icon={Activity}
            title="Smart Recovery & Health Monitoring"
            subtitle="Collect required fragments and rebuild your files with confidence—track integrity and availability."
            bullets={[
              "Recovery wizard",
              "Integrity verification (ACL-based recovery)",
              "Version management",
            ]}
          />
          <FeatureCard
            Icon={ClipboardCheck}
            title="Compliance-Ready Security & Audit"
            subtitle="Built-in logs and activity tracking to support transparency and governance."
            bullets={[
              "Log / audit tracking",
              "Integrity verification (checksum / digital signature)",
              "Legal / safety mode and consent record",
            ]}
          />
          <FeatureCard
            Icon={Users}
            title="Team Sharing & Fine-Grained Access Control"
            subtitle="Create groups, manage roles, and control who can view, edit, or delete shared files."
            bullets={[
              "Grouping (invite users, group share)",
              "Access-control + permission delegation",
              "Multi-account support",
            ]}
          />
        </div>
      </section>

      {/* Security First */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-indigo-950/45 to-zinc-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <div className="text-center">
            <h3 className="text-2xl font-bold">Security First</h3>
            <p className="mt-2 text-sm text-zinc-300">
              Your data security is our top priority. Every feature is designed with privacy and protection in mind.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <MiniCard
              Icon={ShieldCheck}
              title="End-to-end encryption for every fragment"
              desc="All file pieces and metadata are encrypted in transit and at rest, with integrity checks to detect tampering."
            />
            <MiniCard
              Icon={Lock}
              title="Strong authentication & access control"
              desc="Password + 2FA login, secure session handling, and fine-grained permissions ensure only the right people can access or recover your data."
            />
            <MiniCard
              Icon={FileKey2}
              title="Compliance-ready audit & legal safety mode"
              desc="Immutable audit logs, suspicious activity detection, and a dedicated legal/safety mode to protect you."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  Icon,
  title,
  subtitle,
  bullets,
}: {
  Icon: any;
  title: string;
  subtitle: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/15">
        <Icon className="h-5 w-5 text-emerald-300" />
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{subtitle}</p>
      <ul className="mt-4 space-y-1 text-xs text-zinc-200/90">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniCard({
  Icon,
  title,
  desc,
}: {
  Icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/15">
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{desc}</p>
    </div>
  );
}
