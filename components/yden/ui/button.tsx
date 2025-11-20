"use client"

import Link from "next/link"
import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  to?: string
  variant?: "primary" | "secondary" | "outline" | "white"
  className?: string
  onClick?: () => void
  type?: "button" | "submit" | "reset"
}

export default function Button({
  children,
  to,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center px-6 py-3 border text-base font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary:
      "border-transparent text-white bg-blue-600 hover:bg-blue-900 hover:shadow-xl focus:ring-blue-600 shadow-lg shadow-blue-900/20",
    secondary:
      "border-transparent text-white bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl focus:ring-emerald-500 shadow-lg shadow-emerald-600/20",
    outline: "border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50 focus:ring-blue-600",
    white: "border-transparent text-blue-600 bg-white hover:bg-gray-50 focus:ring-white shadow-lg hover:shadow-xl",
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link href={to} className={combinedClassName}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  )
}

