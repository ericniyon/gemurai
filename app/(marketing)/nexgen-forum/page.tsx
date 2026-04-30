"use client"

import { FormEvent, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Option = { value: string; label: string }

const AGE_GROUPS: Option[] = [
  { value: "below_18", label: "Below 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_30", label: "25-30" },
  { value: "31_35", label: "31-35" },
  { value: "above_35", label: "Above 35" },
]
const CURRENT_SITUATION: Option[] = [
  { value: "registered_agribusiness", label: "I run a registered agribusiness" },
  { value: "informal_agribusiness", label: "I run an informal agribusiness" },
  { value: "agri_startup_innovation", label: "I am building an agri-based startup/innovation" },
  { value: "small_income_activity", label: "I run a small income-generating activity" },
  { value: "ready_to_start_3_months", label: "I am not yet engaged but ready to start within 3 months" },
]
const ENGAGEMENT_LEVEL: Option[] = [
  { value: "full_time", label: "I work full-time on my business/activity" },
  { value: "part_time", label: "I work part-time on my business/activity" },
  { value: "piloting", label: "I am actively testing/piloting" },
  { value: "preparing_start", label: "I am preparing to start (within 3 months)" },
  { value: "not_active", label: "I am not currently active" },
]
const EXPERIENCE: Option[] = [
  { value: "lt_3_months", label: "Less than 3 months" },
  { value: "3_6_months", label: "3-6 months" },
  { value: "6_12_months", label: "6-12 months" },
  { value: "1_3_years", label: "1-3 years" },
  { value: "gt_3_years", label: "More than 3 years" },
]
const BUSINESS_STATUS: Option[] = [
  { value: "consistent_revenue", label: "I generate consistent monthly revenue (above RWF ____)" },
  { value: "occasional_income", label: "I generate occasional income (less than RWF ____ per month)" },
  { value: "tested_real_users", label: "I have tested my product/service with real users" },
  { value: "prototype_no_users", label: "I have a prototype but no users yet" },
  { value: "idea_only", label: "I only have an idea (no testing yet)" },
]
const TEAM_SIZE: Option[] = [
  { value: "just_me", label: "Just myself" },
  { value: "2_5", label: "2-5 people" },
  { value: "6_10", label: "6-10 people" },
  { value: "gt_10", label: "More than 10 people" },
]
const MONTHLY_CUSTOMERS: Option[] = [
  { value: "0", label: "0" },
  { value: "1_10", label: "1-10" },
  { value: "11_50", label: "11-50" },
  { value: "51_100", label: "51-100" },
  { value: "gt_100", label: "More than 100" },
]
const MONTHLY_REVENUE: Option[] = [
  { value: "none", label: "No revenue yet" },
  { value: "lt_100k", label: "Below RWF 100,000" },
  { value: "100k_500k", label: "RWF 100,000 - 500,000" },
  { value: "500k_1m", label: "RWF 500,000 - 1,000,000" },
  { value: "gt_1m", label: "Above RWF 1,000,000" },
]
const GROWTH_PRIORITIES: Option[] = [
  { value: "increase_production", label: "Increase production/output" },
  { value: "new_markets", label: "Access new markets/customers" },
  { value: "product_quality", label: "Improve product quality" },
  { value: "raise_funding", label: "Raise funding/investment" },
  { value: "hire_team", label: "Hire and build a team" },
  { value: "adopt_technology", label: "Adopt new technology" },
]
const TOOLS_USED: Option[] = [
  { value: "mobile_money", label: "Mobile money (MoMo, Airtel Money)" },
  { value: "social_media", label: "Social media for business (WhatsApp, Instagram, etc.)" },
  { value: "record_keeping", label: "Record-keeping tools (Excel, notebooks, apps)" },
  { value: "digital_platforms", label: "Digital platforms (e-commerce, marketplaces)" },
  { value: "iot_tools", label: "Sensors / IoT / automation tools" },
  { value: "none", label: "None" },
]
const DECISION_STYLE: Option[] = [
  { value: "data_records", label: "Based on data/records" },
  { value: "experience_observation", label: "Based on experience/observation" },
  { value: "no_structure", label: "I don't have a structured approach yet" },
]
const INNOVATION_STAGE: Option[] = [
  { value: "in_use", label: "Solution is already in use by customers" },
  { value: "mvp_ready", label: "Prototype/MVP ready and tested" },
  { value: "piloting_users", label: "Currently piloting with users" },
  { value: "developing_idea", label: "Still developing the idea" },
]
const LEADERSHIP_LEVEL: Option[] = [
  { value: "gt_20", label: "Yes, I lead a group of more than 20 people" },
  { value: "10_20", label: "Yes, I lead 10-20 people" },
  { value: "lt_10", label: "Yes, I lead less than 10 people" },
  { value: "none", label: "No, I do not lead a group" },
]
const GROUP_TYPES: Option[] = [
  { value: "cooperative", label: "Cooperative" },
  { value: "farmer_group", label: "Farmer group" },
  { value: "youth_group", label: "Youth group" },
  { value: "business_network", label: "Business network" },
]
const PRIMARY_REASON: Option[] = [
  { value: "grow_scale", label: "To grow and scale my business" },
  { value: "funding_partnerships", label: "To access funding or partnerships" },
  { value: "learn_skills", label: "To learn practical skills and technologies" },
  { value: "build_networks", label: "To build networks" },
  { value: "general_interest", label: "General interest only" },
]
const POST_FORUM_ACTION: Option[] = [
  { value: "implement_change", label: "Implement at least one change in my business" },
  { value: "start_idea", label: "Start or launch my idea" },
  { value: "share_knowledge", label: "Share knowledge with my group/community" },
  { value: "not_sure", label: "I am not sure yet" },
]
const WEEKLY_COMMITMENT: Option[] = [
  { value: "lt_5", label: "Less than 5 hours" },
  { value: "5_10", label: "5-10 hours" },
  { value: "10_20", label: "10-20 hours" },
  { value: "gt_20", label: "More than 20 hours" },
]
const NYAGATARE_CONNECTION: Option[] = [
  { value: "live", label: "I live in Nyagatare" },
  { value: "run_business", label: "I run a business in Nyagatare" },
  { value: "plan_invest", label: "I plan to start/invest in Nyagatare within 6 months" },
  { value: "from_nyagatare", label: "I am originally from Nyagatare" },
  { value: "none", label: "No direct connection" },
]
const VALUE_CHAIN_OPTIONS = [
  { key: "cropProduction", label: "Crop production", placeholder: "Specify crop" },
  { key: "livestock", label: "Livestock", placeholder: "Specify type (dairy, poultry, etc.)" },
  { key: "agroProcessing", label: "Agro-processing", placeholder: "Specify product" },
  { key: "inputSupply", label: "Input supply", placeholder: "Specify (feeds, seeds, fertilizers)" },
  { key: "agriTech", label: "Agri-tech / digital solutions", placeholder: "Specify" },
  { key: "other", label: "Other", placeholder: "Specify" },
] as const

type ValueChainKey = (typeof VALUE_CHAIN_OPTIONS)[number]["key"]
type ValueChainState = Record<ValueChainKey, { selected: boolean; details: string }>

type ApplicationFormState = {
  companyName: string
  applicantName: string
  companyDescription: string
  ageGroup: string
  currentSituation: string
  engagementLevel: string
  valueChains: ValueChainState
  experienceDuration: string
  businessStatus: string
  teamSize: string
  monthlyCustomers: string
  monthlyRevenue: string
  growthPriorities: string[]
  toolsUsed: string[]
  decisionStyle: string
  innovationStage: string
  leadershipLevel: string
  groupType: string
  primaryReason: string
  postForumAction: string
  weeklyCommitment: string
  nyagatareConnection: string
}

const initialValueChains = VALUE_CHAIN_OPTIONS.reduce((acc, item) => {
  acc[item.key] = { selected: false, details: "" }
  return acc
}, {} as ValueChainState)

const initialForm: ApplicationFormState = {
  companyName: "",
  applicantName: "",
  companyDescription: "",
  ageGroup: "",
  currentSituation: "",
  engagementLevel: "",
  valueChains: initialValueChains,
  experienceDuration: "",
  businessStatus: "",
  teamSize: "",
  monthlyCustomers: "",
  monthlyRevenue: "",
  growthPriorities: [],
  toolsUsed: [],
  decisionStyle: "",
  innovationStage: "",
  leadershipLevel: "",
  groupType: "",
  primaryReason: "",
  postForumAction: "",
  weeklyCommitment: "",
  nyagatareConnection: "",
}

function RadioQuestion({
  name,
  label,
  value,
  options,
  onChange,
}: {
  name: string
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-semibold text-slate-800">{label}</Label>
      <RadioGroup value={value} onValueChange={onChange} className="grid gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <Label htmlFor={`${name}-${option.value}`} className="font-normal text-slate-700">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default function NexgenForumPage() {
  const [form, setForm] = useState<ApplicationFormState>(initialForm)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "">("")
  const stepTitles: Record<1 | 2 | 3 | 4, string> = {
    1: "Profile",
    2: "Business status",
    3: "Growth and tools",
    4: "Leadership and commitment",
  }

  const selectedValueChains = useMemo(
    () =>
      VALUE_CHAIN_OPTIONS.filter((chain) => form.valueChains[chain.key].selected).map((chain) => ({
        key: chain.key,
        label: chain.label,
        details: form.valueChains[chain.key].details.trim(),
      })),
    [form.valueChains]
  )

  const toggleMultiSelect = (field: "growthPriorities" | "toolsUsed", value: string) => {
    setForm((prev) => {
      const isSelected = prev[field].includes(value)
      const updated = isSelected ? prev[field].filter((item) => item !== value) : [...prev[field], value]
      return { ...prev, [field]: updated }
    })
  }

  const validateStep1 = () => {
    if (!form.companyName.trim() || !form.applicantName.trim() || !form.companyDescription.trim()) return "Please complete basic profile details."
    if (!form.ageGroup || !form.currentSituation || !form.engagementLevel) return "Please complete all qualification choices."
    return ""
  }

  const validateStep2 = () => {
    if (selectedValueChains.length === 0) return "Please select at least one value chain."
    if (selectedValueChains.some((item) => !item.details)) return "Please provide details for each selected value chain."
    if (!form.experienceDuration || !form.businessStatus || !form.teamSize || !form.monthlyCustomers || !form.monthlyRevenue) {
      return "Please complete all business status fields."
    }
    return ""
  }

  const validateStep3 = () => {
    if (form.growthPriorities.length !== 2) return "Please select exactly 2 growth priorities."
    if (!form.decisionStyle || !form.innovationStage) return "Please answer decision style and innovation stage."
    return ""
  }

  const validateStep4 = () => {
    if (!form.decisionStyle || !form.innovationStage || !form.leadershipLevel) return "Please answer the business readiness questions."
    if (!form.groupType || !form.primaryReason || !form.postForumAction || !form.weeklyCommitment || !form.nyagatareConnection) {
      return "Please complete all final section questions."
    }
    return ""
  }

  const onNext = () => {
    const error =
      step === 1 ? validateStep1() :
      step === 2 ? validateStep2() :
      step === 3 ? validateStep3() :
      ""
    if (error) {
      setStatusType("error")
      setStatusMessage(error)
      return
    }
    setStatusType("")
    setStatusMessage("")
    setStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatusMessage("")
    setStatusType("")

    const step4Error = validateStep4()
    if (step4Error) {
      setStatusType("error")
      setStatusMessage(step4Error)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/nexgen-forum/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          selectedValueChains,
          growthPrioritiesLabels: form.growthPriorities,
          toolsUsedLabels: form.toolsUsed,
        }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || "Failed to submit application")

      setStatusType("success")
      setStatusMessage("Your application has been received. Selected participants will be contacted.")
      setForm(initialForm)
      setStep(1)
    } catch (error) {
      setStatusType("error")
      setStatusMessage(error instanceof Error ? error.message : "Submission failed. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border border-slate-200/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-2xl text-slate-900">Application Form</CardTitle>
                <CardDescription>
                  Step {step} of 4 - {stepTitles[step]}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {[1, 2, 3, 4].map((stepNumber) => {
                  const typedStep = stepNumber as 1 | 2 | 3 | 4
                  const isCompleted = typedStep < step
                  const isCurrent = typedStep === step
                  const canJump = isCompleted
                  return (
                    <button
                      key={typedStep}
                      type="button"
                      onClick={() => {
                        if (!canJump) return
                        setStep(typedStep)
                        setStatusMessage("")
                        setStatusType("")
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        isCurrent
                          ? "border-[#0099f2] bg-[#0099f2] text-white"
                          : isCompleted
                            ? "border-[#0099f2]/40 bg-[#0099f2]/10 text-[#007ac7] hover:bg-[#0099f2]/20"
                            : "border-slate-200 bg-slate-100 text-slate-500"
                      } ${canJump ? "cursor-pointer" : "cursor-default"}`}
                      disabled={!canJump}
                      aria-label={`Step ${typedStep}: ${stepTitles[typedStep]}`}
                    >
                      {typedStep}. {stepTitles[typedStep]}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-7">
              {step === 1 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company name</Label>
                      <Input id="companyName" value={form.companyName} onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicantName">Your names</Label>
                      <Input id="applicantName" value={form.applicantName} onChange={(e) => setForm((prev) => ({ ...prev, applicantName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">What does your company do?</Label>
                    <Textarea id="companyDescription" value={form.companyDescription} onChange={(e) => setForm((prev) => ({ ...prev, companyDescription: e.target.value }))} className="min-h-[96px]" />
                  </div>
                  <RadioQuestion name="ageGroup" label="What is your age group?" value={form.ageGroup} options={AGE_GROUPS} onChange={(value) => setForm((prev) => ({ ...prev, ageGroup: value }))} />
                  <RadioQuestion name="currentSituation" label="Which category best describes your current situation?" value={form.currentSituation} options={CURRENT_SITUATION} onChange={(value) => setForm((prev) => ({ ...prev, currentSituation: value }))} />
                  <RadioQuestion name="engagementLevel" label="What best describes your current engagement level?" value={form.engagementLevel} options={ENGAGEMENT_LEVEL} onChange={(value) => setForm((prev) => ({ ...prev, engagementLevel: value }))} />
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-800">Which agricultural value chain do you operate in? (Select all)</Label>
                    <div className="space-y-3">
                      {VALUE_CHAIN_OPTIONS.map((item) => (
                        <div key={item.key} className="rounded-lg border border-slate-200 p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <Checkbox
                              id={`valueChain-${item.key}`}
                              checked={form.valueChains[item.key].selected}
                              onCheckedChange={(checked) =>
                                setForm((prev) => ({
                                  ...prev,
                                  valueChains: { ...prev.valueChains, [item.key]: { ...prev.valueChains[item.key], selected: checked === true } },
                                }))
                              }
                            />
                            <Label htmlFor={`valueChain-${item.key}`} className="font-normal text-slate-700">{item.label}</Label>
                          </div>
                          {form.valueChains[item.key].selected && (
                            <Input
                              placeholder={item.placeholder}
                              value={form.valueChains[item.key].details}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  valueChains: { ...prev.valueChains, [item.key]: { ...prev.valueChains[item.key], details: e.target.value } },
                                }))
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <RadioQuestion name="experienceDuration" label="How long have you been actively working on this business or idea?" value={form.experienceDuration} options={EXPERIENCE} onChange={(value) => setForm((prev) => ({ ...prev, experienceDuration: value }))} />
                  <RadioQuestion name="businessStatus" label="What is your current business status?" value={form.businessStatus} options={BUSINESS_STATUS} onChange={(value) => setForm((prev) => ({ ...prev, businessStatus: value }))} />
                  <RadioQuestion name="teamSize" label="How many people are currently involved in your activity?" value={form.teamSize} options={TEAM_SIZE} onChange={(value) => setForm((prev) => ({ ...prev, teamSize: value }))} />
                  <RadioQuestion name="monthlyCustomers" label="If applicable, how many customers do you serve per month?" value={form.monthlyCustomers} options={MONTHLY_CUSTOMERS} onChange={(value) => setForm((prev) => ({ ...prev, monthlyCustomers: value }))} />
                  <RadioQuestion name="monthlyRevenue" label="What is your average monthly revenue (if any)?" value={form.monthlyRevenue} options={MONTHLY_REVENUE} onChange={(value) => setForm((prev) => ({ ...prev, monthlyRevenue: value }))} />
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-800">Top 2 growth priorities in the next 12 months (select exactly two)</Label>
                    <div className="grid gap-2">
                      {GROWTH_PRIORITIES.map((option) => (
                        <div key={option.value} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                          <Checkbox id={`growth-${option.value}`} checked={form.growthPriorities.includes(option.value)} onCheckedChange={() => toggleMultiSelect("growthPriorities", option.value)} />
                          <Label htmlFor={`growth-${option.value}`} className="font-normal text-slate-700">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Selected: {form.growthPriorities.length}/2</p>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-slate-800">Which tools do you currently use? (Select all that apply)</Label>
                    <div className="grid gap-2">
                      {TOOLS_USED.map((option) => (
                        <div key={option.value} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                          <Checkbox id={`tools-${option.value}`} checked={form.toolsUsed.includes(option.value)} onCheckedChange={() => toggleMultiSelect("toolsUsed", option.value)} />
                          <Label htmlFor={`tools-${option.value}`} className="font-normal text-slate-700">{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <RadioQuestion name="decisionStyle" label="How do you currently make business decisions?" value={form.decisionStyle} options={DECISION_STYLE} onChange={(value) => setForm((prev) => ({ ...prev, decisionStyle: value }))} />
                  <RadioQuestion name="innovationStage" label="If you are building an innovation, what stage are you at?" value={form.innovationStage} options={INNOVATION_STAGE} onChange={(value) => setForm((prev) => ({ ...prev, innovationStage: value }))} />
                </>
              )}

              {step === 4 && (
                <>
                  <RadioQuestion name="leadershipLevel" label="Do you lead or influence others in agriculture/business?" value={form.leadershipLevel} options={LEADERSHIP_LEVEL} onChange={(value) => setForm((prev) => ({ ...prev, leadershipLevel: value }))} />
                  <RadioQuestion name="groupType" label="What type of group are you part of?" value={form.groupType} options={GROUP_TYPES} onChange={(value) => setForm((prev) => ({ ...prev, groupType: value }))} />
                  <RadioQuestion name="primaryReason" label="Why do you want to attend this forum?" value={form.primaryReason} options={PRIMARY_REASON} onChange={(value) => setForm((prev) => ({ ...prev, primaryReason: value }))} />
                  <RadioQuestion name="postForumAction" label="What will you do within 30 days after the forum?" value={form.postForumAction} options={POST_FORUM_ACTION} onChange={(value) => setForm((prev) => ({ ...prev, postForumAction: value }))} />
                  <RadioQuestion name="weeklyCommitment" label="How many hours per week can you commit after the forum?" value={form.weeklyCommitment} options={WEEKLY_COMMITMENT} onChange={(value) => setForm((prev) => ({ ...prev, weeklyCommitment: value }))} />
                  <RadioQuestion name="nyagatareConnection" label="What is your connection to Nyagatare?" value={form.nyagatareConnection} options={NYAGATARE_CONNECTION} onChange={(value) => setForm((prev) => ({ ...prev, nyagatareConnection: value }))} />
                </>
              )}

              {statusMessage && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${statusType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {statusType === "success" && <span className="mr-2">OK</span>}
                  {statusMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div>
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : prev))}>
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {step < 4 ? (
                    <Button type="button" onClick={onNext} className="bg-[#0099f2] hover:bg-[#0082d9]">
                      Continue
                      <span className="ml-2">{"->"}</span>
                    </Button>
                  ) : (
                    <Button type="submit" disabled={submitting} className="bg-[#0099f2] hover:bg-[#0082d9]">
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
