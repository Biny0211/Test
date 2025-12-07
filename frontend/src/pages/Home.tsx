import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Shield, Cloud, Lock, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
  const nav = useNavigate();

  const cards = [
    { Icon: Shield, title: "Security", desc: "Advanced encryption protects your data at every level." },
    { Icon: Cloud, title: "Multi-Platform Support", desc: "Seamlessly integrate with all major cloud providers." },
    { Icon: Lock, title: "Encrypted Storage", desc: "Your files are encrypted before leaving your device." },
    { Icon: Users, title: "Peer-to-Peer Network", desc: "Distributed storage for maximum redundancy." },
  ];

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/70 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_center,rgba(56,189,248,0.18),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
          <motion.h1
            className="font-arima text-5xl md:text-6xl font-extrabold tracking-tight text-white"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ShareSplit
          </motion.h1>

          <motion.p
            className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-zinc-300"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Secure Data Storage Across Multiple Platforms
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              size="lg"
              className="bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
              onClick={() => nav("/features")}
              type="button"
            >
              Explore Features <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
              onClick={() => nav("/pricing")}
              type="button"
            >
              View pricing
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Unified Data Management */}
      <section className="w-full bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Unified Data Management</h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-zinc-300">
              ShareSplit revolutionizes how you store and recover data by providing a single interface
              to manage files across multiple cloud providers and peer-to-peer networks.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {cards.map(({ Icon, title, desc }, idx) => (
              <motion.div
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:bg-white/10"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/15">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-300">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (✅ Home의 Sign in 버튼 제거됨) */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-indigo-950/45 to-zinc-950" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center">
          <motion.h2
            className="text-3xl font-bold"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
          >
            Ready to Secure Your Data?
          </motion.h2>

          <motion.p
            className="mx-auto mt-3 max-w-2xl text-sm text-zinc-300"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            viewport={{ once: true }}
          >
            Join thousands of users who trust ShareSplit with the most important files.
          </motion.p>

          <motion.div
            className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
              onClick={() => nav("/pricing")}
              type="button"
            >
              View pricing
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
