"use client"

import { FormEvent, useMemo, useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Check, ChevronRight, ChevronLeft, Loader2, Sprout, Factory, Package, Cpu, PlusCircle,
  Briefcase, Lightbulb, Calendar, MapPin, Sparkles, User, Award, TrendingUp, HelpCircle,
  Users, Zap, Target, Rocket, Globe, ArrowRight, CheckCircle2, Info, X, Leaf, Crown, Star
} from "lucide-react"

type Option = { value: string; label: string }

const AGE_GROUPS: Option[] = [
  { value: "below_18", label: "Below 18" },
  { value: "18_24", label: "18-24" },
  { value: "25_30", label: "25-30" },
  { value: "31_35", label: "31-35" },
  { value: "above_35", label: "Above 35" },
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
  { value: "consistent_revenue", label: "I generate consistent monthly revenue" },
  { value: "occasional_income", label: "I generate occasional income" },
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
  { key: "cropProduction", label: "Crop production", placeholder: "Specify crop (e.g. Maize, Rice, Beans)", icon: Sprout },
  { key: "livestock", label: "Livestock", placeholder: "Specify type (dairy, poultry, beef)", icon: Leaf },
  { key: "agroProcessing", label: "Agro-processing", placeholder: "Specify product (e.g. Flour, Honey, Jam)", icon: Factory },
  { key: "inputSupply", label: "Input supply", placeholder: "Specify (feeds, seeds, fertilizers)", icon: Package },
  { key: "agriTech", label: "Agri-tech / digital solutions", placeholder: "Specify (e.g. IoT, App, Drone)", icon: Cpu },
  { key: "other", label: "Other", placeholder: "Specify details", icon: PlusCircle },
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
  companyName: "", applicantName: "", companyDescription: "", ageGroup: "",
  currentSituation: "", engagementLevel: "", valueChains: initialValueChains,
  experienceDuration: "", businessStatus: "", teamSize: "",
  monthlyCustomers: "", monthlyRevenue: "", growthPriorities: [],
  toolsUsed: [], decisionStyle: "", innovationStage: "",
  leadershipLevel: "", groupType: "", primaryReason: "",
  postForumAction: "", weeklyCommitment: "", nyagatareConnection: "",
}

// Components
function CountdownTimer() {
  const targetDate = new Date("2026-03-15T09:00:00").getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetDate - now
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex gap-3">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center min-w-[70px]">
          <div className="text-2xl font-black text-white">{String(value).padStart(2, "0")}</div>
          <div className="text-[10px] text-emerald-300 uppercase font-semibold tracking-wider">{unit}</div>
        </div>
      ))}
    </div>
  )
}

function VisualGridQuestion({ label, value, options, onChange, columns = "grid-cols-1 sm:grid-cols-2", themeColor = "emerald" }: {
  label: string, value: string, options: Option[], onChange: (value: string) => void, columns?: string, themeColor?: "emerald" | "blue"
}) {
  const isBlue = themeColor === "blue"
  return (
    <div className="space-y-3">
      <Label className={`text-sm font-semibold flex items-center gap-2 ${isBlue ? "text-blue-700 dark:text-blue-300" : "text-emerald-700 dark:text-emerald-300"}`}>
        <span className={`w-2 h-2 rounded-full ${isBlue ? "bg-blue-500" : "bg-emerald-500"}`} />
        {label}
      </Label>
      <div className={`grid ${columns} gap-3`}>
        {options.map((option) => {
          const isSelected = value === option.value
          return (
            <motion.button
              key={option.value}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(option.value)}
              className={`relative overflow-hidden p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                isSelected
                  ? isBlue
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/10"
                    : "border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-lg shadow-emerald-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${isSelected ? (isBlue ? "text-blue-900 font-semibold" : "text-emerald-900 font-semibold") : "text-slate-600 dark:text-slate-400"}`}>
                  {option.label}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? (isBlue ? "border-blue-500 bg-blue-500" : "border-emerald-500 bg-emerald-500") : "border-slate-300 dark:border-slate-600"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selection-highlight"
                  className={`absolute inset-0 -z-10 opacity-10 ${isBlue ? "bg-blue-500" : "bg-emerald-500"}`}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function FloatingInput({ id, label, value, onChange, placeholder, required = false }: {
  id: string, label: string, value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean
}) {
  const [isFocused, setIsFocused] = useState(false)
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-200 pointer-events-none ${
          isFocused || value ? "top-2 text-xs font-semibold text-emerald-600" : "top-4 text-sm text-slate-400"
        }`}
      >
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`h-14 pt-6 pb-2 px-4 bg-white dark:bg-slate-800 border-2 rounded-xl transition-all ${
          isFocused ? "border-emerald-500 ring-4 ring-emerald-500/10" : "border-slate-200 dark:border-slate-700"
        }`}
      />
    </div>
  )
}

export default function NexgenForumPage() {
  const [form, setForm] = useState<ApplicationFormState>(initialForm)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "">("")
  const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false)

  const stepTitles: Record<1 | 2 | 3 | 4, string> = {
    1: "Your Profile",
    2: "Business Details",
    3: "Growth Plans",
    4: "Final Steps",
  }

  const stepIcons: Record<1 | 2 | 3 | 4, React.ElementType> = {
    1: User, 2: Briefcase, 3: TrendingUp, 4: Crown,
  }

  const selectedValueChains = useMemo(() =>
    VALUE_CHAIN_OPTIONS.filter((chain) => form.valueChains[chain.key].selected).map((chain) => ({
      key: chain.key, label: chain.label, details: form.valueChains[chain.key].details.trim(),
    })), [form.valueChains])

  const toggleMultiSelect = (field: "growthPriorities" | "toolsUsed", value: string) => {
    setForm((prev) => {
      const isSelected = prev[field].includes(value)
      return { ...prev, [field]: isSelected ? prev[field].filter((i) => i !== value) : [...prev[field], value] }
    })
  }

  const validateStep = () => {
    if (step === 1) {
      if (!form.companyName.trim() || !form.applicantName.trim() || !form.companyDescription.trim()) return "Please complete all profile fields."
      if (!form.ageGroup || !form.currentSituation || !form.engagementLevel) return "Please complete all selections."
    }
    if (step === 2) {
      if (selectedValueChains.length === 0) return "Please select at least one value chain."
      if (selectedValueChains.some((i) => !i.details)) return "Please provide details for each selected value chain."
      if (!form.experienceDuration || !form.businessStatus || !form.teamSize || !form.monthlyCustomers || !form.monthlyRevenue) {
        return "Please complete all business fields."
      }
    }
    if (step === 3) {
      if (form.growthPriorities.length !== 2) return "Please select exactly 2 growth priorities."
      if (!form.decisionStyle || !form.innovationStage) return "Please answer all questions."
    }
    return ""
  }

  const onNext = () => {
    const error = validateStep()
    if (error) {
      setStatusType("error")
      setStatusMessage(error)
      return
    }
    setStatusType("")
    setStatusMessage("")
    setStep((p) => (p < 4 ? ((p + 1) as 1 | 2 | 3 | 4) : p))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.groupType || !form.primaryReason || !form.postForumAction || !form.weeklyCommitment || !form.nyagatareConnection) {
      setStatusType("error")
      setStatusMessage("Please complete all final section questions.")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/nexgen-forum/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, selectedValueChains }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to submit")
      setFormSubmittedSuccessfully(true)
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ["#10b981", "#3b82f6", "#f59e0b", "#ec4899"] })
      setForm(initialForm)
      setStep(1)
    } catch (err) {
      setStatusType("error")
      setStatusMessage(err instanceof Error ? err.message : "Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((step - 1) / 3) * 100

  return (
    <div className="min-h-screen bg-slate-950 selection:bg-emerald-500/30 pt-16">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT - HERO SECTION */}
        <div className="lg:w-[42%] w-full relative flex flex-col p-8 lg:p-12 lg:min-h-screen lg:sticky lg:top-0">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image src="/agritech_bg.png" alt="" fill className="object-cover opacity-40" priority />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-emerald-950/80" />
          </div>

          <div className="relative z-10 flex flex-col h-full max-w-lg">
            {/* Top Badge */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium text-white">NexGen Business Forum 2026</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
              <h1 className="text-5xl lg:text-6xl font-black leading-[0.95] mb-4">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent">
                  Shape the
                </span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Future
                </span>
                <br />
                <span className="text-white">of Agri</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Join the movement transforming agriculture. From farm to market, we&apos;re building the next generation of agribusiness leaders.
              </p>
            </motion.div>


            {/* Who Can Apply */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Who Can Apply
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { icon: Sprout, text: "Agribusiness startups & SMEs" },
                    { icon: Users, text: "Young farmers & producers" },
                    { icon: Cpu, text: "Agri-tech innovators" },
                    { icon: Lightbulb, text: "Early-stage entrepreneurs" },
                    { icon: Award, text: "Youth leaders & groups" },
                  ].map((item, i) => (
                    <div key={item.text} className="flex items-center gap-3 text-slate-300">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Event Info Cards */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-3 gap-3 mb-auto">
              {[
                { icon: Calendar, label: "Mar 15-17", sub: "2026" },
                { icon: MapPin, label: "Nyagatare", sub: "Rwanda" },
                { icon: Users, label: "500+", sub: "Seats" },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <item.icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.sub}</p>
                </div>
              ))}
            </motion.div>

          </div>
        </div>

        {/* RIGHT - FORM SECTION */}
        <div className="flex-1 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 relative lg:h-screen lg:overflow-y-auto">
          <div className="min-h-full px-5 sm:px-8 lg:px-10 pt-8 sm:pt-10 lg:pt-12 pb-10">

            <AnimatePresence mode="wait">
              {formSubmittedSuccessfully ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.4 }}
                  className="min-h-[70vh] flex items-center justify-center"
                >
                  <div className="w-full text-center">
                    {/* Glow ring */}
                    <div className="relative inline-flex items-center justify-center mb-8">
                      <div className="absolute w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl animate-pulse" />
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
                        className="relative w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                      >
                        <CheckCircle2 className="w-12 h-12 text-white" />
                      </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-4">
                        <Sparkles className="w-4 h-4" /> Application Submitted
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3">You&apos;re In!</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mx-auto mb-8 leading-relaxed">
                        Our team will review your application and reach out via email or SMS with next steps. Stay ready!
                      </p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                      className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-8"
                    >
                      {[{ icon: Calendar, label: "Mar 15–17" }, { icon: MapPin, label: "Nyagatare" }, { icon: Rocket, label: "Be Ready" }].map((item) => (
                        <div key={item.label} className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-3 flex flex-col items-center gap-1.5">
                          <item.icon className="w-5 h-5 text-emerald-500" />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.label}</span>
                        </div>
                      ))}
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                      <Button
                        onClick={() => setFormSubmittedSuccessfully(false)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-10 h-12 rounded-2xl shadow-lg shadow-emerald-500/25 text-sm"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" /> Submit Another Application
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                  {/* ── Step Progress Header ── */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Top gradient bar */}
                    <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />
                    <div className="p-5">
                      {/* Step label + percentage */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = stepIcons[step]
                            return (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                            )
                          })()}
                          <div>
                            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-0.5">
                              Step {step} of 4
                            </p>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{stepTitles[step]}</h2>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                            {Math.round(progress)}%
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Complete</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                      </div>

                      {/* Step pill trail */}
                      <div className="flex items-center gap-2">
                        {([1, 2, 3, 4] as const).map((s, idx) => {
                          const StepIcon = stepIcons[s]
                          const isDone = s < step
                          const isActive = s === step
                          return (
                            <div key={s} className="flex items-center gap-2 flex-1">
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 whitespace-nowrap ${
                                isDone
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : isActive
                                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}>
                                {isDone
                                  ? <Check className="w-3 h-3" />
                                  : <StepIcon className="w-3 h-3" />
                                }
                                <span className="hidden sm:inline">{stepTitles[s].split(" ")[0]}</span>
                                <span className="sm:hidden">{s}</span>
                              </div>
                              {idx < 3 && <div className={`h-px flex-1 transition-colors duration-300 ${s < step ? "bg-emerald-400/40" : "bg-slate-200 dark:bg-slate-700"}`} />}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── Main Form Card ── */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={step}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -12 }}
                          transition={{ duration: 0.25 }}
                          className="p-6 sm:p-8 space-y-7"
                        >

                          {/* ──────── STEP 1 ──────── */}
                          {step === 1 && (
                            <>
                              {/* Section: Application Type */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Application Type</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {[
                                    { value: "existing_agribusiness_startup", icon: Briefcase, title: "Business / Startup", desc: "Active registered or unregistered operations", gradient: "from-emerald-500 to-teal-500", ring: "ring-emerald-400/30", border: "border-emerald-400", bg: "from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/40 dark:to-teal-950/30" },
                                    { value: "business_idea_to_develop", icon: Lightbulb, title: "Idea Stage", desc: "A promising concept ready to develop", gradient: "from-blue-500 to-indigo-500", ring: "ring-blue-400/30", border: "border-blue-400", bg: "from-blue-50/80 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30" },
                                  ].map((item) => {
                                    const isSelected = form.currentSituation === item.value
                                    const Icon = item.icon
                                    return (
                                      <motion.button
                                        key={item.value}
                                        type="button"
                                        whileHover={{ y: -2, scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setForm((p) => ({ ...p, currentSituation: item.value }))}
                                        className={`relative p-3.5 rounded-xl border-2 text-left transition-all duration-300 overflow-hidden ${
                                          isSelected ? `${item.border} bg-gradient-to-br ${item.bg} shadow-lg ring-4 ${item.ring}` : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                                        }`}
                                      >
                                        {isSelected && (
                                          <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                                          >
                                            <Check className="w-3.5 h-3.5 text-white" />
                                          </motion.div>
                                        )}
                                        <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-lg flex-shrink-0 bg-gradient-to-br ${isSelected ? item.gradient + " text-white shadow-sm" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                            <Icon className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{item.desc}</p>
                                          </div>
                                        </div>
                                      </motion.button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Section: Identity */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Your Identity</p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <FloatingInput
                                    id="companyName"
                                    label={form.currentSituation === "existing_agribusiness_startup" ? "Company / Business Name" : "Idea / Project Name"}
                                    value={form.companyName}
                                    onChange={(v) => setForm((p) => ({ ...p, companyName: v }))}
                                    required
                                  />
                                  <FloatingInput
                                    id="applicantName"
                                    label="Your Full Name"
                                    value={form.applicantName}
                                    onChange={(v) => setForm((p) => ({ ...p, applicantName: v }))}
                                    required
                                  />
                                </div>
                                <div className="relative">
                                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                                  <Textarea
                                    placeholder="Describe what your agribusiness does or what challenge your idea solves..."
                                    value={form.companyDescription}
                                    onChange={(e) => setForm((p) => ({ ...p, companyDescription: e.target.value }))}
                                    className="min-h-[96px] rounded-xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 resize-none text-sm transition-all"
                                  />
                                  <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 font-medium">
                                    {form.companyDescription.length} chars
                                  </div>
                                </div>
                              </div>

                              {/* Section: About You */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">About You</p>
                                </div>
                                <VisualGridQuestion
                                  label="Age Group"
                                  value={form.ageGroup}
                                  options={AGE_GROUPS}
                                  onChange={(v) => setForm((p) => ({ ...p, ageGroup: v }))}
                                  columns="grid-cols-3 sm:grid-cols-5"
                                  themeColor="emerald"
                                />
                                <VisualGridQuestion
                                  label="Current Engagement Level"
                                  value={form.engagementLevel}
                                  options={ENGAGEMENT_LEVEL}
                                  onChange={(v) => setForm((p) => ({ ...p, engagementLevel: v }))}
                                  columns="grid-cols-1 sm:grid-cols-2"
                                  themeColor="emerald"
                                />
                              </div>
                            </>
                          )}

                          {/* ──────── STEP 2 ──────── */}
                          {step === 2 && (
                            <>
                              {/* Value Chains */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Value Chains</p>
                                  <span className="ml-auto text-[10px] text-slate-400 font-medium">Select all that apply</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {VALUE_CHAIN_OPTIONS.map((item) => {
                                    const isSelected = form.valueChains[item.key].selected
                                    const Icon = item.icon
                                    return (
                                      <motion.div
                                        key={item.key}
                                        layout
                                        className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                                          isSelected
                                            ? "border-emerald-400 dark:border-emerald-500 shadow-md shadow-emerald-500/10 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20"
                                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => setForm((p) => ({
                                            ...p,
                                            valueChains: { ...p.valueChains, [item.key]: { ...p.valueChains[item.key], selected: !isSelected } }
                                          }))}
                                          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                                        >
                                          <div className={`p-2 rounded-lg flex-shrink-0 transition-all ${isSelected ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                                            <Icon className="w-4 h-4" />
                                          </div>
                                          <span className={`font-semibold text-sm flex-1 ${isSelected ? "text-emerald-900 dark:text-emerald-100" : "text-slate-600 dark:text-slate-400"}`}>
                                            {item.label}
                                          </span>
                                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                            isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"
                                          }`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                          </div>
                                        </button>
                                        <AnimatePresence>
                                          {isSelected && (
                                            <motion.div
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="border-t border-emerald-100 dark:border-emerald-900/40"
                                            >
                                              <div className="px-4 py-3">
                                                <Input
                                                  placeholder={item.placeholder}
                                                  value={form.valueChains[item.key].details}
                                                  onChange={(e) => setForm((p) => ({
                                                    ...p,
                                                    valueChains: { ...p.valueChains, [item.key]: { ...p.valueChains[item.key], details: e.target.value } }
                                                  }))}
                                                  className="rounded-lg border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm h-9 bg-white dark:bg-slate-800"
                                                />
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </motion.div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Business Details */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Business Details</p>
                                </div>
                                <VisualGridQuestion label="Experience Duration" value={form.experienceDuration} options={EXPERIENCE} onChange={(v) => setForm((p) => ({ ...p, experienceDuration: v }))} columns="grid-cols-2 sm:grid-cols-3" themeColor="emerald" />
                                <VisualGridQuestion label="Current Business Status" value={form.businessStatus} options={BUSINESS_STATUS} onChange={(v) => setForm((p) => ({ ...p, businessStatus: v }))} columns="grid-cols-1 sm:grid-cols-2" themeColor="emerald" />
                                <VisualGridQuestion label="Team Size" value={form.teamSize} options={TEAM_SIZE} onChange={(v) => setForm((p) => ({ ...p, teamSize: v }))} columns="grid-cols-2 sm:grid-cols-4" themeColor="emerald" />
                              </div>

                              {/* Metrics */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Performance Metrics</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <VisualGridQuestion label="Monthly Customers" value={form.monthlyCustomers} options={MONTHLY_CUSTOMERS} onChange={(v) => setForm((p) => ({ ...p, monthlyCustomers: v }))} columns="grid-cols-3" themeColor="emerald" />
                                  <VisualGridQuestion label="Monthly Revenue (RWF)" value={form.monthlyRevenue} options={MONTHLY_REVENUE} onChange={(v) => setForm((p) => ({ ...p, monthlyRevenue: v }))} columns="grid-cols-1" themeColor="emerald" />
                                </div>
                              </div>
                            </>
                          )}

                          {/* ──────── STEP 3 ──────── */}
                          {step === 3 && (
                            <>
                              {/* Growth Priorities */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                    <Target className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Growth Priorities</p>
                                  <div className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                    form.growthPriorities.length === 2
                                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                                  }`}>
                                    {form.growthPriorities.length === 2 ? <Check className="w-3 h-3" /> : null}
                                    {form.growthPriorities.length}/2 selected
                                  </div>
                                </div>
                                <p className="text-xs text-slate-400 -mt-1">Pick exactly 2 priorities that matter most right now</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {GROWTH_PRIORITIES.map((option) => {
                                    const isChecked = form.growthPriorities.includes(option.value)
                                    const isDisabled = !isChecked && form.growthPriorities.length >= 2
                                    return (
                                      <motion.button
                                        key={option.value}
                                        type="button"
                                        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                                        onClick={() => !isDisabled && toggleMultiSelect("growthPriorities", option.value)}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                          isChecked
                                            ? "border-blue-400 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 shadow-md shadow-blue-500/10"
                                            : isDisabled
                                            ? "border-slate-200 dark:border-slate-700 opacity-40 cursor-not-allowed"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
                                        }`}
                                      >
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                          isChecked ? "border-blue-500 bg-blue-500" : "border-slate-300 dark:border-slate-600"
                                        }`}>
                                          {isChecked && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`text-sm font-medium flex-1 ${isChecked ? "text-blue-900 dark:text-blue-100 font-semibold" : "text-slate-600 dark:text-slate-400"}`}>
                                          {option.label}
                                        </span>
                                      </motion.button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Tools */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tools You Use</p>
                                  <span className="ml-auto text-[10px] text-slate-400">Select all that apply</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                  {TOOLS_USED.map((option) => {
                                    const isChecked = form.toolsUsed.includes(option.value)
                                    return (
                                      <motion.button
                                        key={option.value}
                                        type="button"
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleMultiSelect("toolsUsed", option.value)}
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                                          isChecked
                                            ? "border-blue-400 bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                                        }`}
                                      >
                                        {isChecked && <Check className="w-3 h-3" />}
                                        {option.label}
                                      </motion.button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Strategy */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Strategy & Innovation</p>
                                </div>
                                <VisualGridQuestion label="Decision Making Style" value={form.decisionStyle} options={DECISION_STYLE} onChange={(v) => setForm((p) => ({ ...p, decisionStyle: v }))} columns="grid-cols-1 sm:grid-cols-3" themeColor="blue" />
                                <VisualGridQuestion label="Innovation Stage" value={form.innovationStage} options={INNOVATION_STAGE} onChange={(v) => setForm((p) => ({ ...p, innovationStage: v }))} columns="grid-cols-1 sm:grid-cols-2" themeColor="blue" />
                              </div>
                            </>
                          )}

                          {/* ──────── STEP 4 ──────── */}
                          {step === 4 && (
                            <>
                              {/* Leadership */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                                    <Crown className="w-3.5 h-3.5 text-amber-600" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Leadership & Community</p>
                                </div>
                                <VisualGridQuestion label="Leadership Level" value={form.leadershipLevel} options={LEADERSHIP_LEVEL} onChange={(v) => setForm((p) => ({ ...p, leadershipLevel: v }))} columns="grid-cols-1 sm:grid-cols-2" themeColor="blue" />
                                <VisualGridQuestion label="Group Type" value={form.groupType} options={GROUP_TYPES} onChange={(v) => setForm((p) => ({ ...p, groupType: v }))} columns="grid-cols-2 sm:grid-cols-4" themeColor="blue" />
                              </div>

                              {/* Intent */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Rocket className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Your Intent</p>
                                </div>
                                <VisualGridQuestion label="Primary Reason to Attend" value={form.primaryReason} options={PRIMARY_REASON} onChange={(v) => setForm((p) => ({ ...p, primaryReason: v }))} columns="grid-cols-1 sm:grid-cols-2" themeColor="blue" />
                                <VisualGridQuestion label="Post-Forum Action Plan" value={form.postForumAction} options={POST_FORUM_ACTION} onChange={(v) => setForm((p) => ({ ...p, postForumAction: v }))} columns="grid-cols-1 sm:grid-cols-2" themeColor="blue" />
                              </div>

                              {/* Commitment */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Commitment & Location</p>
                                </div>
                                <VisualGridQuestion label="Weekly Time Commitment" value={form.weeklyCommitment} options={WEEKLY_COMMITMENT} onChange={(v) => setForm((p) => ({ ...p, weeklyCommitment: v }))} columns="grid-cols-2 sm:grid-cols-4" themeColor="blue" />
                                <VisualGridQuestion label="Connection to Nyagatare" value={form.nyagatareConnection} options={NYAGATARE_CONNECTION} onChange={(v) => setForm((p) => ({ ...p, nyagatareConnection: v }))} columns="grid-cols-1 sm:grid-cols-2" themeColor="blue" />
                              </div>

                              {/* Submit notice */}
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 rounded-xl p-4 border border-emerald-200/60 dark:border-emerald-800/40 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Almost there!</p>
                                  <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">Review your answers and hit Submit when you're ready. We&apos;ll follow up within 48 hours.</p>
                                </div>
                              </div>
                            </>
                          )}

                        </motion.div>
                      </AnimatePresence>

                      {/* ── Error / Status Banner ── */}
                      <AnimatePresence>
                        {statusMessage && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            className="overflow-hidden px-6 sm:px-8 pb-2"
                          >
                            <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
                              statusType === "success"
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                            }`}>
                              {statusType === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <X className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                              <p className="font-medium">{statusMessage}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* ── Navigation Footer ── */}
                      <div className="flex items-center justify-between px-6 sm:px-8 pt-5 pb-14 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
                        {step > 1 ? (
                          <button
                            type="button"
                            onClick={() => { setStep((p) => (p > 1 ? ((p - 1) as 1|2|3|4) : p)); setStatusMessage(""); }}
                            className="flex items-center gap-2 px-5 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" /> Back
                          </button>
                        ) : <div />}

                        {step < 4 ? (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onNext}
                            className="flex items-center gap-2 px-7 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
                          >
                            Continue <ChevronRight className="w-4 h-4" />
                          </motion.button>
                        ) : (
                          <motion.button
                            type="submit"
                            disabled={submitting}
                            whileHover={{ scale: submitting ? 1 : 1.02 }}
                            whileTap={{ scale: submitting ? 1 : 0.97 }}
                            className="flex items-center gap-2 px-7 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
                          >
                            {submitting ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                            ) : (
                              <><Rocket className="w-4 h-4" /> Submit Application</>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </form>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
