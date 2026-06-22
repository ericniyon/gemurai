"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Loader2,
  Mail,
  Lock,
  Key,
  Globe,
  ShieldAlert,
  Sprout,
  Factory,
  Wheat,
  Store,
  ChevronRight,
  MapPin,
  Leaf,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SOROMA_ROUTES } from "@/lib/soroma/constants"

const TEST_PASSWORD = "Soroma2026!"

const PLATFORM_TEST_ACCOUNTS = [
  { email: "platform.superadmin@soroma.rw", role: "Super Admin" },
  { email: "platform.operator@soroma.rw", role: "Operator" },
  { email: "platform.compliance@soroma.rw", role: "Compliance" },
  { email: "platform.integrations@soroma.rw", role: "Integrations" },
  { email: "platform.me@soroma.rw", role: "M&E Officer" },
  { email: "platform.support@soroma.rw", role: "Support" },
]

const TENANT_TEST_ACCOUNTS = [
  { email: "greenfoods.admin@soroma.rw", role: "Admin" },
  { email: "greenfoods.suppliers@soroma.rw", role: "Suppliers" },
  { email: "greenfoods.procurement@soroma.rw", role: "Procurement" },
  { email: "greenfoods.production@soroma.rw", role: "Production" },
  { email: "greenfoods.warehouse@soroma.rw", role: "Warehouse" },
  { email: "greenfoods.sales@soroma.rw", role: "Sales & Orders" },
  { email: "greenfoods.logistics@soroma.rw", role: "Logistics" },
  { email: "greenfoods.finance@soroma.rw", role: "Finance" },
  { email: "greenfoods.qa@soroma.rw", role: "QA & Quality" },
  { email: "greenfoods.reports@soroma.rw", role: "Reports" },
]

const VALUE_CHAIN = [
  { icon: Sprout, label: "Source" },
  { icon: Factory, label: "Process" },
  { icon: Wheat, label: "Produce" },
  { icon: Store, label: "Perform" },
]

export default function SoromaLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAccounts, setShowAccounts] = useState(false)
  const [activeTab, setActiveTab] = useState<"platform" | "tenant">("tenant")

  function fillTestAccount(accountEmail: string) {
    setEmail(accountEmail)
    setPassword(TEST_PASSWORD)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || data.message || "Login failed")
        return
      }
      const token = data.token || data.data?.token
      if (token) {
        document.cookie = `Gemurai_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      }
      await fetch("/api/v1/soroma/auth/audit-login", { method: "POST" })

      const ctx = await fetch("/api/v1/soroma/context")
      const ctxData = await ctx.json()
      if (!ctxData.success || !ctxData.data) {
        setError("No SOROMA workspace assigned to this account.")
        return
      }

      if (ctxData.data.workspaceType === "platform") {
        await fetch("/api/v1/soroma/workspace/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspace: "platform" }),
        })
        router.push(SOROMA_ROUTES.platform.overview)
      } else if (ctxData.data.tenantId) {
        await fetch("/api/v1/soroma/workspace/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspace: "tenant",
            tenantId: ctxData.data.tenantId,
          }),
        })
        router.push(SOROMA_ROUTES.tenant(ctxData.data.tenantId).overview)
      } else {
        setError("No SOROMA workspace assigned to this account.")
      }
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const accounts = activeTab === "tenant" ? TENANT_TEST_ACCOUNTS : PLATFORM_TEST_ACCOUNTS

  return (
    <div className="sf-login-shell">
      {/* Brand panel */}
      <aside className="sf-login-brand">
        <div className="sf-login-brand-bg" aria-hidden />
        <div className="sf-login-brand-inner">
          <div className="sf-login-logo-card">
            <Image
              src="/soroma-logo.png"
              alt="SOROMA FOODS — Agroprocessor OS"
              width={300}
              height={110}
              className="sf-login-logo-img"
              priority
            />
          </div>

          <p className="sf-login-brand-tagline">Source · Process · Produce · Perform</p>

          <h2 className="sf-login-brand-headline">
            Rwanda&apos;s OS for <em>agroprocessors</em>
          </h2>
          <p className="sf-login-brand-intro">
            From cooperative intake and commodity procurement to batch production,
            traceability passports, and market fulfillment — all in one platform.
          </p>

          <div className="sf-login-value-chain">
            {VALUE_CHAIN.map((step, i) => (
              <span key={step.label} className="contents">
                <div className="sf-login-chain-step">
                  <div className="sf-login-chain-icon">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className="sf-login-chain-label">{step.label}</span>
                </div>
                {i < VALUE_CHAIN.length - 1 && (
                  <ChevronRight className="sf-login-chain-arrow h-4 w-4" aria-hidden />
                )}
              </span>
            ))}
          </div>

          <div className="sf-login-commodities">
            {["Maize", "Beans", "Soy", "Dairy", "Cassava"].map((c, i) => (
              <span
                key={c}
                className={cn("sf-login-commodity", i === 0 && "sf-login-commodity--accent")}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="sf-login-main">
        <div className="sf-login-form-wrap">
          <div className="sf-login-mobile-logo">
            <div className="sf-login-logo-card">
              <Image
                src="/soroma-logo.png"
                alt="SOROMA FOODS"
                width={240}
                height={88}
                className="sf-login-logo-img"
                priority
              />
            </div>
          </div>

          <div className="sf-login-card">
            <div className="sf-login-card-header">
              <div className="sf-login-card-badge">
                <Leaf className="h-3.5 w-3.5" />
                Agroprocessor OS
              </div>
              <h1 className="sf-login-card-title">Sign in</h1>
              <p className="sf-login-card-subtitle">
                Access your tenant or platform workspace for suppliers, production,
                traceability, and sales.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="sf-login-form">
              {error && (
                <div className="sf-login-error" role="alert">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="sf-login-field">
                <label htmlFor="email">Work email</label>
                <div className="sf-login-input-wrap">
                  <Mail className="sf-login-input-icon" aria-hidden />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@agroprocessor.rw"
                    className="sf-login-input"
                  />
                </div>
              </div>

              <div className="sf-login-field">
                <label htmlFor="password">Password</label>
                <div className="sf-login-input-wrap">
                  <Lock className="sf-login-input-icon" aria-hidden />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="sf-login-input"
                  />
                </div>
              </div>

              <button type="submit" className="sf-login-submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in to SOROMA FOODS"
                )}
              </button>
            </form>

            <div className="sf-login-footer-links">
              <Link href="/" className="sf-link-brand">
                <Globe className="h-3.5 w-3.5" />
                Back to YDEN
              </Link>
              <Link href="/en/forgot-password">Forgot password?</Link>
            </div>

            <button
              type="button"
              onClick={() => setShowAccounts((v) => !v)}
              className="sf-login-dev-toggle"
            >
              <span className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                Demo credentials
              </span>
              <span>{showAccounts ? "Hide" : "Show"}</span>
            </button>

            {showAccounts && (
              <div className="sf-login-dev-panel">
                <p className="sf-login-dev-hint">
                  Password: <code>{TEST_PASSWORD}</code>
                </p>
                <div className="sf-login-dev-tabs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("tenant")}
                    className={cn(
                      "sf-login-dev-tab",
                      activeTab === "tenant" && "sf-login-dev-tab--active"
                    )}
                  >
                    Tenant
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("platform")}
                    className={cn(
                      "sf-login-dev-tab",
                      activeTab === "platform" && "sf-login-dev-tab--active"
                    )}
                  >
                    Platform
                  </button>
                </div>
                <div className="sf-login-dev-grid">
                  {accounts.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => fillTestAccount(account.email)}
                      className="sf-login-dev-account"
                    >
                      <p className="sf-login-dev-role">{account.role}</p>
                      <p className="sf-login-dev-email">{account.email.split("@")[0]}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className="sf-login-page-footer">
            <span>SOROMA FOODS</span> · Farm-to-market traceability · All amounts in RWF
          </p>
          <div className="flex justify-center">
            <span className="sf-login-rwanda-badge">
              <MapPin className="h-3 w-3" />
              Built for Rwanda&apos;s agriculture sector
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}
