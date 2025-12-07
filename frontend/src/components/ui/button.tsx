import * as React from "react";

type Variant = "default" | "outline";
type Size = "default" | "lg";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-semibold transition " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const sizes = size === "lg" ? "h-11 px-5 text-sm" : "h-10 px-4 text-sm";

  const variants =
    variant === "outline"
      ? "border border-white/15 bg-white/5 text-zinc-100 hover:bg-white/10"
      : "bg-cyan-400 text-zinc-950 hover:bg-cyan-300";

  return (
    <button className={cx(base, sizes, variants, className)} {...props} />
  );
}
