import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Upload, Download, HardDrive, ShieldCheck, User as UserIcon, Mail, Calendar } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) nav("/", { replace: true });
  }, [user, nav]);

  if (!user) return null;

  return (
    <DashboardLayout titleTag="Dashboard">
      <div className="max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-300">
          Manage your ShareSplit account, subscription, and security settings.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-zinc-200" />
              <div>
                <div className="text-sm font-semibold">Profile Information</div>
                <div className="text-xs text-zinc-400">Your account details and preferences</div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/10" />
              <div>
                <div className="text-sm font-semibold">{user.username}</div>
                <div className="text-xs text-zinc-400">ShareSplit User</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span>Member Since 01/01/2024</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold">Current Plan</div>
              <div className="mt-3 text-2xl font-extrabold">Basic</div>
              <div className="mt-1 text-xs text-zinc-300">
                Securely store and recover essential data with basic features.
              </div>
              <div className="mt-3 text-emerald-300 text-lg font-bold">$2.99/month</div>
              <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-zinc-300">
                <span>Groups</span>
                <span>3</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold">Account Statistics</div>
              <div className="text-xs text-zinc-400">Your usage and activity overview</div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <Stat icon={<Upload className="h-4 w-4 text-emerald-300" />} label="Files Uploaded" value="50" />
                <Stat icon={<Download className="h-4 w-4 text-cyan-300" />} label="Downloads" value="23" />
                <Stat icon={<HardDrive className="h-4 w-4 text-emerald-300" />} label="Storage Used" value="1.2 GB" />
                <Stat icon={<ShieldCheck className="h-4 w-4 text-cyan-300" />} label="Security Score" value="98%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-300">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/40">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="mt-2 text-lg font-extrabold">{value}</div>
    </div>
  );
}
