import { ReactNode } from "react"
import clsx from "clsx"

interface SectionProps {
  id?: string
  eyebrow?: string
  title?: string
  description?: string
  className?: string
  children: ReactNode
}

export function Section({ id, eyebrow, title, description, className, children }: SectionProps) {
  return (
    <section
      id={id}
      className={clsx(
        "py-16 sm:py-20 lg:py-24",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {(eyebrow || title || description) && (
          <div className="max-w-3xl">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-lg text-slate-600">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={clsx("mt-10", !eyebrow && !title && !description && "mt-0")}>
          {children}
        </div>
      </div>
    </section>
  )
}

