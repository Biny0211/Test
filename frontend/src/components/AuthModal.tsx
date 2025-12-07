import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldCheck, Lock, Cloud } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Mode = "login" | "signup";

export default function AuthModal({ open, onClose }: Props) {
  const nav = useNavigate();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Signup fields
  const [suUsername, setSuUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ 데모용 "정답 계정"
  const demoAccount = useMemo(
    () => ({
      username: "admin",
      password: "1234",
      email: "user@mail.com",
      firstName: "User",
      lastName: "Name1",
    }),
    []
  );

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!open) return;
    setMode("login");
    setUsername("");
    setPassword("");
    setError(null);
    setSuccess(null);
  }, [open]);

  // ESC로 닫기
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const validateLogin = () => {
    setError(null);
    setSuccess(null);

    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    // 데모 검증 (나중에 API로 교체)
    if (username !== demoAccount.username || password !== demoAccount.password) {
      setError("Incorrect username or password. Please try again.");
      return;
    }

    // ✅ 로그인 성공: AuthContext 저장 + 대시보드 이동
    login({
      username: demoAccount.username,
      email: demoAccount.email,
      firstName: demoAccount.firstName,
      lastName: demoAccount.lastName,
    });

    setSuccess("Login successful!");
    setTimeout(() => {
      onClose();
      nav("/dashboard");
    }, 300);
  };

  const validateSignup = () => {
    setError(null);
    setSuccess(null);

    if (!suUsername.trim() || !email.trim() || !suPassword.trim() || !suConfirm.trim()) {
      setError("Please fill in required fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email.");
      return;
    }
    if (suPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (suPassword !== suConfirm) {
      setError("Passwords do not match.");
      return;
    }

    // 데모 회원가입 성공 처리 (실제론 서버 요청)
    setSuccess("Account created! You can now sign in.");
    setTimeout(() => {
      setMode("login");
      setUsername(suUsername);
      setPassword("");
      setError(null);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-md p-2 text-zinc-300 hover:bg-white/10 hover:text-white"
            aria-label="Close"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Left: Form */}
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-center justify-center">
                <img src="/sharesplit.png" alt="ShareSplit" className="h-8 w-auto object-contain" />
              </div>

              {mode === "login" ? (
                <>
                  <h2 className="text-center text-xl font-bold">Welcome back</h2>
                  <p className="mt-2 text-center text-xs text-zinc-300">
                    Sign in to access your secure data storage dashboard
                  </p>

                  <div className="mt-6 space-y-3">
                    <Field
                      label="Username"
                      value={username}
                      onChange={setUsername}
                      placeholder="Enter your username"
                    />
                    <Field
                      label="Password"
                      value={password}
                      onChange={setPassword}
                      placeholder="Enter your password"
                      type="password"
                      onEnter={validateLogin}
                    />

                    {error && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                        {success}
                      </div>
                    )}

                    <button
                      className="mt-2 w-full rounded-md bg-cyan-400 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
                      type="button"
                      onClick={validateLogin}
                    >
                      Login
                    </button>

                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-300">
                      <span className="opacity-80">Demo: admin / 1234</span>
                      <button
                        className="hover:text-white"
                        type="button"
                        onClick={() => alert("Forgot password (demo)")}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="mt-5 text-center text-xs text-zinc-300">
                      New to ShareSplit?{" "}
                      <button
                        type="button"
                        className="font-semibold text-cyan-300 hover:text-cyan-200"
                        onClick={() => {
                          setMode("signup");
                          setError(null);
                          setSuccess(null);
                        }}
                      >
                        Create an account
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-center text-xl font-bold">Create Account</h2>
                  <p className="mt-2 text-center text-xs text-zinc-300">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="font-semibold text-cyan-300 hover:text-cyan-200"
                      onClick={() => {
                        setMode("login");
                        setError(null);
                        setSuccess(null);
                      }}
                    >
                      Sign in
                    </button>
                  </p>

                  <div className="mt-6 space-y-3">
                    <Field
                      label="Username"
                      value={suUsername}
                      onChange={setSuUsername}
                      placeholder="username"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="First Name"
                        value={firstName}
                        onChange={setFirstName}
                        placeholder="First Name"
                      />
                      <Field
                        label="Last Name"
                        value={lastName}
                        onChange={setLastName}
                        placeholder="Last Name"
                      />
                    </div>

                    <Field label="Email" value={email} onChange={setEmail} placeholder="email@example.com" />
                    <Field
                      label="Password"
                      value={suPassword}
                      onChange={setSuPassword}
                      placeholder="Password"
                      type="password"
                    />
                    <Field
                      label="Confirm password"
                      value={suConfirm}
                      onChange={setSuConfirm}
                      placeholder="Confirm password"
                      type="password"
                      onEnter={validateSignup}
                    />

                    {error && (
                      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
                        {error}
                      </div>
                    )}
                    {success && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                        {success}
                      </div>
                    )}

                    <button
                      className="mt-2 w-full rounded-md bg-cyan-400 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-cyan-300"
                      type="button"
                      onClick={validateSignup}
                    >
                      Sign up
                    </button>

                    <p className="mt-3 text-center text-[10px] text-zinc-400">
                      By creating an account, you agree to our Terms and Privacy Policy.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Right: Info panel */}
            <div className="hidden md:block bg-gradient-to-b from-indigo-950/60 via-zinc-950 to-zinc-950 p-8 border-l border-white/10">
              <h3 className="text-lg font-bold">
                Your Data, <span className="text-cyan-300">Secured &amp; Synchronized</span>
              </h3>
              <p className="mt-2 text-xs text-zinc-300">
                Access your files from anywhere with military-grade encryption and seamless multi-platform integration.
              </p>

              <div className="mt-6 space-y-3">
                <InfoRow
                  icon={<ShieldCheck className="h-4 w-4 text-cyan-300" />}
                  title="Secure Access"
                  desc="Your account is protected with enterprise-grade security."
                />
                <InfoRow
                  icon={<Lock className="h-4 w-4 text-cyan-300" />}
                  title="Encrypted Data"
                  desc="Your files are encrypted before they leave your device."
                />
                <InfoRow
                  icon={<Cloud className="h-4 w-4 text-cyan-300" />}
                  title="Multi-Platform"
                  desc="Access your data from any device, anywhere."
                />
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-semibold text-zinc-200">What you get:</div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                  <li>• Unlimited file splitting and recovery</li>
                  <li>• Advanced encryption and security features</li>
                  <li>• API access for custom integrations</li>
                </ul>
              </div>
            </div>
          </div>

          {/* bottom safe padding */}
          <div className="h-1 bg-black/50" />
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-zinc-300">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        placeholder={placeholder}
        type={type}
        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-cyan-300/60"
      />
    </label>
  );
}

function InfoRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-semibold text-zinc-100">{title}</div>
        <div className="text-xs text-zinc-300">{desc}</div>
      </div>
    </div>
  );
}
