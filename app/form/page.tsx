"use client"

import MultiStepForm from "@/components/multi-step-form"

export default function FormPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Form with Preview</h1>
      <MultiStepForm />
    </div>
  )
} 