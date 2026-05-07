"use client"

import { FormEvent, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import Swal from "sweetalert2"

type Option = { value: string; label: string }

const APPLYING_WITH: Option[] = [
  { value: "existing_agribusiness_startup", label: "I have an existing agribusiness/startup" },
  { value: "business_idea_to_develop", label: "I have a business idea I want to develop" },
]

const AGE_GROUPS: Option[] = [
  { value: "below_18", label: "Below 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_30", label: "25-30" },
  { value: "31_35", label: "31-35" },
  { value: "above_35", label: "Above 35" },
]

const ACTIVITY_LEVEL: Option[] = [
  { value: "working_daily", label: "I am already working on my business/activity every day." },
  { value: "side_project", label: "My business/activity is currently a side project." },
  { value: "testing_piloting", label: "I am currently testing or piloting my idea/product/service." },
  { value: "preparing_to_start", label: "I am preparing to officially start soon." },
  { value: "not_currently_active", label: "I am not currently active at the moment." },
]

const VALUE_CHAINS: Option[] = [
  { value: "crop_production", label: "Crop production" },
  { value: "livestock", label: "Livestock" },
  { value: "agro_processing", label: "Agro-processing" },
  { value: "input_supply", label: "Input supply (feeds, seeds, fertilizers)" },
  { value: "agri_tech", label: "Agri-tech / digital solutions" },
  { value: "other", label: "Other" },
]

const EXPERIENCE: Option[] = [
  { value: "lt_3_months", label: "Less than 3 months" },
  { value: "3_6_months", label: "3-6 months" },
  { value: "6_12_months", label: "6-12 months" },
  { value: "1_3_years", label: "1-3 years" },
  { value: "gt_3_years", label: "More than 3 years" },
]

const TEAM_SIZE: Option[] = [
  { value: "just_myself", label: "Just myself" },
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

const TOOLS_USED: Option[] = [
  { value: "mobile_money", label: "Mobile money (MoMo, Airtel Money)" },
  { value: "social_media", label: "Social media for business (WhatsApp, Instagram, etc.)" },
  { value: "record_keeping", label: "Record-keeping tools (Excel, notebooks, apps)" },
  { value: "digital_platforms", label: "Digital platforms (e-commerce, marketplaces)" },
  { value: "iot_tools", label: "Sensors / IoT / automation tools" },
  { value: "none", label: "None" },
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

const PRIMARY_REASON: Option[] = [
  { value: "grow_scale", label: "To grow and scale my business" },
  { value: "funding_partnerships", label: "To access funding or partnerships" },
  { value: "learn_skills", label: "To learn practical skills and technologies" },
  { value: "build_networks", label: "To build networks" },
  { value: "general_interest", label: "General interest only" },
]

const NYAGATARE_CONNECTION: Option[] = [
  { value: "live", label: "I live in Nyagatare" },
  { value: "run_business", label: "I run a business in Nyagatare" },
  { value: "plan_invest", label: "I plan to start/invest in Nyagatare within 6 months" },
  { value: "from_nyagatare", label: "I am originally from Nyagatare" },
  { value: "none", label: "No direct connection" },
]

const RWANDA_DISTRICTS = [
  "Bugesera",
  "Burera",
  "Gakenke",
  "Gasabo",
  "Gatsibo",
  "Gicumbi",
  "Gisagara",
  "Huye",
  "Kamonyi",
  "Karongi",
  "Kayonza",
  "Kicukiro",
  "Kirehe",
  "Muhanga",
  "Musanze",
  "Ngoma",
  "Ngororero",
  "Nyabihu",
  "Nyagatare",
  "Nyamagabe",
  "Nyamasheke",
  "Nyanza",
  "Nyarugenge",
  "Nyaruguru",
  "Rubavu",
  "Ruhango",
  "Rusizi",
  "Rutsiro",
  "Rulindo",
  "Rwamagana",
]

type FormState = {
  currentSituation: string
  email: string
  phoneNumber: string
  companyName: string
  district: string
  ageGroup: string
  engagementLevel: string
  valueChains: string[]
  experienceDuration: string
  teamSize: string
  monthlyCustomers: string
  monthlyRevenue: string
  toolsUsed: string[]
  innovationStage: string
  leadershipLevel: string
  primaryReason: string
  nyagatareConnection: string
}

type FormErrors = Partial<Record<`q${number}`, string>>

const initialForm: FormState = {
  currentSituation: "",
  email: "",
  phoneNumber: "",
  companyName: "",
  district: "",
  ageGroup: "",
  engagementLevel: "",
  valueChains: [],
  experienceDuration: "",
  teamSize: "",
  monthlyCustomers: "",
  monthlyRevenue: "",
  toolsUsed: [],
  innovationStage: "",
  leadershipLevel: "",
  primaryReason: "",
  nyagatareConnection: "",
}

function SingleSelectQuestion({
  title,
  value,
  options,
  onChange,
  error,
  optionsClassName,
  optionClassName,
}: {
  title: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  error?: string
  optionsClassName?: string
  optionClassName?: string
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-800">{title}</Label>
      <div className={cn("space-y-2", optionsClassName)}>
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-md border border-slate-200 bg-white p-3 hover:bg-slate-50",
              optionClassName
            )}
          >
            <input
              type="radio"
              className="mt-1 h-4 w-4"
              name={title}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="text-sm text-slate-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}

function MultiSelectQuestion({
  title,
  selected,
  options,
  onToggle,
  error,
}: {
  title: string
  selected: string[]
  options: Option[]
  onToggle: (value: string) => void
  error?: string
}) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-slate-800">{title}</Label>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3 hover:bg-slate-50"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onCheckedChange={() => onToggle(option.value)}
            />
            <span className="text-sm text-slate-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  )
}

export default function NexgenForumPage() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState("")

  const selectedValueChains = useMemo(
    () =>
      form.valueChains.map((chain) => {
        const matched = VALUE_CHAINS.find((option) => option.value === chain)
        return { label: matched?.label ?? chain, details: matched?.label ?? chain }
      }),
    [form.valueChains]
  )

  const toggleItem = (field: "valueChains" | "toolsUsed", value: string) => {
    setForm((prev) => {
      const current = prev[field]
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return { ...prev, [field]: updated }
    })
  }

  const isValidPhoneNumber = (phone: string) => /^(078|079|072|073)\d{7}$/.test(phone)

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {}
    if (!form.currentSituation) nextErrors.q1 = "Question 1 is required."
    const phone = form.phoneNumber.trim()
    if (!phone) {
      nextErrors.q2 = "Phone Number is required."
    } else if (!isValidPhoneNumber(phone)) {
      nextErrors.q2 = "Phone Number must be 10 digits and start with 078, 079, 072, or 073."
    }
    if (!form.companyName.trim()) nextErrors.q3 = "Question 2 is required."
    if (!form.district.trim()) nextErrors.q4 = "Question 3 is required."
    if (!form.ageGroup) nextErrors.q5 = "Question 4 is required."
    if (!form.engagementLevel) nextErrors.q6 = "Question 5 is required."
    if (form.valueChains.length === 0) nextErrors.q7 = "Question 6 is required."
    if (!form.experienceDuration) nextErrors.q8 = "Question 7 is required."
    if (!form.teamSize) nextErrors.q9 = "Question 8 is required."
    if (!form.monthlyCustomers) nextErrors.q10 = "Question 9 is required."
    if (!form.monthlyRevenue) nextErrors.q11 = "Question 10 is required."
    if (form.toolsUsed.length === 0) nextErrors.q12 = "Question 11 is required."
    if (!form.innovationStage) nextErrors.q13 = "Question 12 is required."
    if (!form.leadershipLevel) nextErrors.q14 = "Question 13 is required."
    if (!form.primaryReason) nextErrors.q15 = "Question 14 is required."
    if (!form.nyagatareConnection) nextErrors.q16 = "Question 15 is required."
    return nextErrors
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) {
      setStatus("Please fix the highlighted questions.")
      return
    }

    setStatus("")
    setSubmitting(true)
    try {
      const payload = {
        companyName: form.companyName.trim(),
        applicantName: "Forum Applicant",
        companyDescription: `District: ${form.district.trim()}${form.email.trim() ? ` | Email: ${form.email.trim()}` : ""}`,
        ageGroup: form.ageGroup,
        currentSituation: form.currentSituation,
        engagementLevel: form.engagementLevel,
        experienceDuration: form.experienceDuration,
        businessStatus: form.currentSituation,
        teamSize: form.teamSize,
        monthlyCustomers: form.monthlyCustomers,
        monthlyRevenue: form.monthlyRevenue,
        growthPriorities: [form.primaryReason, "forum_interest"],
        toolsUsed: form.toolsUsed,
        decisionStyle: "not_specified",
        innovationStage: form.innovationStage,
        leadershipLevel: form.leadershipLevel,
        groupType: "not_specified",
        primaryReason: form.primaryReason,
        postForumAction: "not_specified",
        weeklyCommitment: "not_specified",
        nyagatareConnection: form.nyagatareConnection,
        selectedValueChains,
        districtResidence: form.district.trim(),
        phoneNumber: form.phoneNumber.trim(),
        email: form.email.trim() || null,
      }

      const response = await fetch("/api/nexgen-forum/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit application.")
      }

      setForm(initialForm)
      setErrors({})
      await Swal.fire({
        icon: "success",
        title: "Application Submitted",
        text: "Thank you for applying to the Nyagatare Next-Gen Farmers Business Forum.",
        confirmButtonText: "Close",
        confirmButtonColor: "#059669",
      })
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 pb-12 pt-20">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold text-slate-900">
              NYAGATARE NEXT-GEN FARMERS BUSINESS FORUM 2025-2026
            </CardTitle>
            <p className="text-sm text-slate-700">
              The District of Nyagatare, together with key stakeholders, is organizing the Nyagatare
              Next Gen Youth Business Farmers Forum. This forum aims to connect young people with real
              opportunities in agriculture, agribusiness, and food innovation.
            </p>
            <p className="text-sm font-medium text-slate-800">
              Theme: Bridging Agricultural Opportunities with the Next Generation
            </p>
            <p className="text-sm text-slate-700">Date: 22 May 2026</p>
            <p className="text-sm text-slate-700">Venue: Epic Hotel, Nyagatare District</p>
            <p className="text-sm text-slate-700">
              This forum will bring together youth, innovators, private sector actors, financial
              institutions, and government leaders to explore investment opportunities, showcase
              innovations, and build strong networks in the agricultural sector.
            </p>
            <p className="text-sm font-medium text-slate-800">Contact Info: +250 782 817 454</p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <p className="text-sm text-slate-600">Section 1: Basic Qualification</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <SingleSelectQuestion
                title="1. What are you applying with? (Select one that best applies to you)"
                value={form.currentSituation}
                options={APPLYING_WITH}
                onChange={(value) => setForm((prev) => ({ ...prev, currentSituation: value }))}
                error={errors.q1}
              />

              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-800">
                  Email (optional)
                </Label>
                <Input
                  id="email"
                  type="text"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Enter your email"
                  style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1", borderRadius: "0.5rem" }}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone-number" className="text-sm font-semibold text-slate-800">
                  Phone Number
                </Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(event) => {
                    const next = event.target.value.replace(/\D/g, "").slice(0, 10)
                    setForm((prev) => ({ ...prev, phoneNumber: next }))
                    setErrors((prev) => {
                      if (!next) return { ...prev, q2: "Phone Number is required." }
                      if (next.length >= 3 && !/^(078|079|072|073)/.test(next)) {
                        return {
                          ...prev,
                          q2: "Phone Number must start with 078, 079, 072, or 073.",
                        }
                      }
                      if (next.length === 10 && !isValidPhoneNumber(next)) {
                        return {
                          ...prev,
                          q2: "Phone Number must be 10 digits and start with 078, 079, 072, or 073.",
                        }
                      }
                      const { q2: _removed, ...rest } = prev
                      return rest
                    })
                  }}
                  placeholder="Enter phone number"
                  inputMode="numeric"
                  pattern="(078|079|072|073)[0-9]{7}"
                  autoComplete="tel-national"
                  maxLength={10}
                  style={{ backgroundColor: "#f8fafc", borderColor: "#cbd5e1", borderRadius: "0.5rem" }}
                />
                {errors.q2 ? <p className="text-xs font-medium text-red-600">{errors.q2}</p> : null}
              </div>

              <div className="space-y-3">
                <Label htmlFor="business-name" className="text-sm font-semibold text-slate-800">
                  2. Business Name / Idea Title
                </Label>
                <p className="text-xs text-slate-600">
                  (If applicable and if you do not have a name yet, give a working title)
                </p>
                <Input
                  id="business-name"
                  value={form.companyName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, companyName: event.target.value }))
                  }
                  placeholder="Enter business name or idea title"
                  className="border-slate-300 bg-slate-50 focus-visible:border-emerald-500 focus-visible:ring-0"
                />
                {errors.q3 ? <p className="text-xs font-medium text-red-600">{errors.q3}</p> : null}
              </div>

              <div className="space-y-3">
                <SingleSelectQuestion
                  title="3. Which district do you currently reside in?"
                  value={form.district}
                  options={RWANDA_DISTRICTS.map((district) => ({ label: district, value: district }))}
                  onChange={(value) => setForm((prev) => ({ ...prev, district: value }))}
                  error={errors.q4}
                  optionsClassName="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4"
                  optionClassName="!p-1.5 gap-1 items-center"
                />
              </div>

              <SingleSelectQuestion
                title="4. What is your age group? (Select one)"
                value={form.ageGroup}
                options={AGE_GROUPS}
                onChange={(value) => setForm((prev) => ({ ...prev, ageGroup: value }))}
                error={errors.q5}
              />

              <SingleSelectQuestion
                title="5. What is your current level of activity or commitment in your business or idea? (Select one that best describes your current stage)"
                value={form.engagementLevel}
                options={ACTIVITY_LEVEL}
                onChange={(value) => setForm((prev) => ({ ...prev, engagementLevel: value }))}
                error={errors.q6}
              />

              <MultiSelectQuestion
                title="6. Which specific agricultural value chain do you operate in? (Select all that apply, if applicable to you)"
                selected={form.valueChains}
                options={VALUE_CHAINS}
                onToggle={(value) => toggleItem("valueChains", value)}
                error={errors.q7}
              />

              <SingleSelectQuestion
                title="7. How long have you been actively working on this business or idea? (Select one, if applicable)"
                value={form.experienceDuration}
                options={EXPERIENCE}
                onChange={(value) => setForm((prev) => ({ ...prev, experienceDuration: value }))}
                error={errors.q8}
              />

              <SingleSelectQuestion
                title="8. How many people are currently involved in your activity? (Include team + beneficiaries, if applicable)"
                value={form.teamSize}
                options={TEAM_SIZE}
                onChange={(value) => setForm((prev) => ({ ...prev, teamSize: value }))}
                error={errors.q9}
              />

              <SingleSelectQuestion
                title="9. If applicable, how many customers do you serve per month?"
                value={form.monthlyCustomers}
                options={MONTHLY_CUSTOMERS}
                onChange={(value) => setForm((prev) => ({ ...prev, monthlyCustomers: value }))}
                error={errors.q10}
              />

              <SingleSelectQuestion
                title="10. What is your average monthly revenue (if any)? (Select one, if applicable)"
                value={form.monthlyRevenue}
                options={MONTHLY_REVENUE}
                onChange={(value) => setForm((prev) => ({ ...prev, monthlyRevenue: value }))}
                error={errors.q11}
              />

              <MultiSelectQuestion
                title="11. Which of the following tools do you currently use? (Select all that apply, if applicable to your activity)"
                selected={form.toolsUsed}
                options={TOOLS_USED}
                onToggle={(value) => toggleItem("toolsUsed", value)}
                error={errors.q12}
              />

              <SingleSelectQuestion
                title="12. If you are building an innovation, what stage are you at? (Select one, if applicable)"
                value={form.innovationStage}
                options={INNOVATION_STAGE}
                onChange={(value) => setForm((prev) => ({ ...prev, innovationStage: value }))}
                error={errors.q13}
              />

              <SingleSelectQuestion
                title="13. Do you lead or influence others in agriculture/business? (Select one that best applies to you)"
                value={form.leadershipLevel}
                options={LEADERSHIP_LEVEL}
                onChange={(value) => setForm((prev) => ({ ...prev, leadershipLevel: value }))}
                error={errors.q14}
              />

              <SingleSelectQuestion
                title="14. Why do you want to attend this forum? (Select one primary reason)"
                value={form.primaryReason}
                options={PRIMARY_REASON}
                onChange={(value) => setForm((prev) => ({ ...prev, primaryReason: value }))}
                error={errors.q15}
              />

              <SingleSelectQuestion
                title="15. What is your connection to Nyagatare? (Select one that best applies to you)"
                value={form.nyagatareConnection}
                options={NYAGATARE_CONNECTION}
                onChange={(value) => setForm((prev) => ({ ...prev, nyagatareConnection: value }))}
                error={errors.q16}
              />

              {status ? <p className="text-sm font-medium text-red-600">{status}</p> : null}

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:from-emerald-700 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/40 disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
