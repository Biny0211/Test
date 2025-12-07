import { useMemo, useState } from "react";
import { Check, Zap, BadgeCheck } from "lucide-react";

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  const plans = useMemo(
    () => [
      {
        name: "Free",
        icon: <Check className="h-5 w-5 text-cyan-300" />,
        price: { m: 0, y: 0 },
        desc: "Security and recovery essentials to get started.",
        bullets: ["Can create 1 Group", "End-to-end encryption", "API access"],
        highlight: false,
      },
      {
        name: "Basic",
        icon: <Zap className="h-5 w-5 text-cyan-300" />,
        price: { m: 2.99, y: 29.9 },
        desc: "Expanded storage and user access for growing teams.",
        bullets: ["Can create 3 Groups", "End-to-end encryption", "API access"],
        highlight: false,
      },
      {
        name: "Business",
        icon: <BadgeCheck className="h-5 w-5 text-emerald-300" />,
        price: { m: 9.99, y: 99.9 },
        desc: "Comprehensive data security and recovery for teams at scale.",
        bullets: ["Can create 10 Groups", "Priority support", "End-to-end encryption", "API access"],
        highlight: true,
        badge: "Most Popular",
      },
    ],
    []
  );

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="font-arima text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Simple, Transparent
            <br />
            <span className="text-[#00FFC6]">Pricing</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-300">
            Choose the perfect plan for your data storage needs. Start free and scale as you grow.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs ${!yearly ? "text-white" : "text-zinc-400"}`}>Monthly</span>
            <button
              onClick={() => setYearly((v) => !v)}
              className={`relative h-6 w-12 rounded-full border border-white/15 bg-white/5 transition`}
              aria-label="Toggle billing"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-emerald-300 transition ${
                  yearly ? "left-6" : "left-0.5"
                }`}
              />
            </button>
            <span className={`text-xs ${yearly ? "text-white" : "text-zinc-400"}`}>Yearly</span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={[
                "relative rounded-xl border bg-white/5 p-6 transition",
                p.highlight
                  ? "border-emerald-300/60 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                  : "border-white/10 hover:bg-white/10",
              ].join(" ")}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-300 px-3 py-1 text-[10px] font-bold text-zinc-950">
                  {p.badge}
                </div>
              )}

              <div className="mb-4 flex items-center gap-3">
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${p.highlight ? "bg-emerald-400/15" : "bg-cyan-400/15"}`}>
                  {p.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-zinc-300">{p.desc}</div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-3xl font-extrabold">
                  {getPriceLabel(p.price, yearly)}
                </div>
                <div className="mt-1 text-xs text-zinc-400">
                  {p.name === "Free" ? "" : yearly ? "/year" : "/month"}
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-zinc-200/90">
                {p.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${p.highlight ? "bg-emerald-300/80" : "bg-cyan-300/80"}`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* All plans include */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-indigo-950/45 to-zinc-950" />
        <div className="relative mx-auto max-w-6xl px-4 py-14">
          <div className="text-center">
            <h2 className="text-3xl font-bold">All Plans Include</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Every ShareSplit plan comes with our core security and functionality features.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {[
              "Encryption",
              "Zero-Knowledge Architecture",
              "Multi-Platform Support",
              "Automatic Backups",
              "File Versioning",
              "Cross-Device Sync",
              "API Integration",
              "24/7 Monitoring",
            ].map((t) => (
              <div key={t} className="rounded-xl border border-white/10 bg-white/5 p-5 text-center text-xs text-zinc-200/90">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function getPriceLabel(price: { m: number; y: number }, yearly: boolean) {
  const v = yearly ? price.y : price.m;
  if (v === 0) return "Free";
  return `$${v.toFixed(2)}`;
}
