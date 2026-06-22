"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SoromaActionModal } from "./action-modal"
import { useSoromaApi } from "@/hooks/soroma/use-soroma-api"

export type ActionField = {
  name: string
  label: string
  type?: "text" | "number" | "select" | "date"
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
}

export function useSoromaModuleAction(tenantId: string) {
  const { request, loading, refresh, exportCsv } = useSoromaApi(tenantId)
  const [open, setOpen] = useState(false)
  const [actionKey, setActionKey] = useState<string | null>(null)
  const [fields, setFields] = useState<ActionField[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [title, setTitle] = useState("")
  const [endpoint, setEndpoint] = useState("")
  const [method, setMethod] = useState<"POST" | "PATCH">("POST")

  const [initialValues, setInitialValues] = useState<Record<string, string>>({})

  function openAction(config: {
    key: string
    title: string
    endpoint: string
    fields: ActionField[]
    method?: "POST" | "PATCH"
    initialValues?: Record<string, string>
  }) {
    setActionKey(config.key)
    setTitle(config.title)
    setEndpoint(config.endpoint)
    setFields(config.fields)
    setMethod(config.method ?? "POST")
    const init = config.initialValues ?? {}
    setInitialValues(init)
    setValues(init)
    setOpen(true)
  }

  async function confirm() {
    const body: Record<string, unknown> = { ...initialValues }
    for (const field of fields) {
      const val = values[field.name]
      if (field.required && !val) return
      if (field.type === "number") body[field.name] = Number(val)
      else if (val) body[field.name] = val
    }

    const result = await request(endpoint, {
      method,
      body: JSON.stringify(body),
    })
    if (result.ok) {
      setOpen(false)
      refresh()
    }
  }

  const modal = (
    <SoromaActionModal
      open={open}
      onOpenChange={setOpen}
      title={title}
      confirmLabel={loading ? "Saving..." : "Confirm"}
      confirmDisabled={loading}
      onConfirm={confirm}
    >
      <div className="grid gap-3 py-2">
        {fields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === "select" ? (
              <select
                id={field.name}
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="mt-1 h-9 w-full rounded-md border border-[var(--sf-border)] bg-[var(--sf-surface)] px-2 text-sm"
              >
                <option value="">Select...</option>
                {field.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={field.name}
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                placeholder={field.placeholder}
                value={values[field.name] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                className="mt-1"
              />
            )}
          </div>
        ))}
      </div>
    </SoromaActionModal>
  )

  return { openAction, modal, request, refresh, exportCsv, loading, actionKey }
}
