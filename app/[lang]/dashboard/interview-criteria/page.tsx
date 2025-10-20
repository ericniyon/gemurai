import InterviewCriteriaCards from "@/components/interviews/InterviewCriteriaCards"

export default function InterviewCriteriaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Interview Criteria
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Review the evaluation criteria used for assessing applications. Each criterion has specific scoring guidelines and maximum points.
            </p>
          </div>
          <InterviewCriteriaCards />
        </div>
      </div>
    </div>
  )
} 