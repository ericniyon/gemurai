import Image from "next/image"
import clsx from "clsx"

type LogoBadgeProps = {
  variant?: "light" | "dark"
  label?: string
  className?: string
}

export function LogoBadge({ variant = "dark", label = "Young Digital Entrepreneurs Network", className }: LogoBadgeProps) {
  const textClasses =
    variant === "dark"
      ? "text-white/90"
      : "text-slate-700"

  const badgeClasses =
    variant === "dark"
      ? "border-white/20 bg-white/10"
      : "border-slate-200 bg-white/70"

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-3 rounded-full px-4 py-2 backdrop-blur-md transition",
        badgeClasses,
        className
      )}
    >
      <div className="relative h-8 w-8 overflow-hidden rounded-2xl bg-white/90 p-1 shadow-sm">
        <Image src="/yden.png" alt="YDEN logo" fill sizes="32px" className="object-contain" priority />
      </div>
      <span className={clsx("text-xs font-semibold uppercase tracking-[0.3em]", textClasses)}>{label}</span>
    </div>
  )
}

