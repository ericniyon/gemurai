"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { User, FileText, MessageCircle, Star, CheckCircle, Calendar, AlertCircle, BookOpen, Target, Zap, Save, Eye, Clock, RefreshCw, Loader2, Edit3, X } from "lucide-react"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Question {
  id: string
  text: string
  points: number
  category: string
  subQuestions?: Array<{
    text: string
    points: number
  }>
  kinyarwanda?: {
    text: string
    subQuestions?: Array<{
      text: string
      points: number
    }>
  }
}

interface InterviewQuestionsProps {
  application?: any
  onScoresSubmitted?: () => void
}

interface SubmittedScores {
  id: string
  applicationId: string
  totalScore: number
  totalPossibleScore: number
  overallScore: string
  scores: Record<string, number>
  subScores?: Record<string, Record<string, number>>
  comments?: Record<string, string>
  sections: Array<{
    category: string
    totalPoints: number
    scoredPoints: number
    questions: Array<{
      id: string
      text: string
      points: number
      scored: number
    }>
  }>
  submittedAt: string
  createdAt: string
  updatedAt: string
}

const interviewQuestions: Question[] = [
  // I.A. Education and Work Experience (Amashuri n'Ubunararibonye mu Kazi) - 10%
  {
    id: "edu-1",
    text: "Briefly tell us about yourself, your education journey background and any work experience.",
    points: 5,
    category: "I.A. Education and Work Experience (Amashuri n'Ubunararibonye mu Kazi)",
    kinyarwanda: {
      text: "Watwibwira muri make, Amazina, amashuri wize n'akazi waba warigeze gukora."
    }
  },

  // Additional question to make up the full 10 points for this category
  {
    id: "edu-2",
    text: "When did you complete your highest level of schooling? Are you planning to resume school soon?",
    points: 2,
    category: "I.A. Education and Work Experience (Amashuri n'Ubunararibonye mu Kazi)",
    kinyarwanda: {
      text: "Warangije amashuri ku rwego ki? Warangije ryari? Uteganya kongera kwiga mu gihe cya vuba?"
    }
  },
  {
    id: "edu-5",
    text: "Tell us about a time where your work involved interacting with many people or selling products/services.",
    points: 3,
    category: "I.A. Education and Work Experience (Amashuri n'Ubunararibonye mu Kazi)",
    kinyarwanda: {
      text: "Wigeze ukora akazi gasaba kuganira n'abantu benshi cyangwa kugurisha ibintu cyangwa serivisi? Byari bimeze bite? Wabyitwayemo ute?"
    }
  },

  // II. Socio-Economic and Vulnerability Status (Imibereho Rusange) - 20%
  {
    id: "socio-1",
    text: "Do you have ways of earning money on a daily/weekly/monthly basis to support yourself and/or your household? If yes, On average per month, how much?",
    points: 5,
    category: "II. Socio-Economic and Vulnerability Status (Imibereho Rusange)",
    kinyarwanda: {
      text: "Ufite icyo ukora kiguha amafaranga (yaba ari nyakabyizi, ku munsi, buri cyumweru, cyangwa buri kwezi kugira ngo wifashe cyangwa ufashe umuryango wawe? Niba ari yego, ni nk'angahe ugereranyije ku kwezi?"
    }
  },
  {
    id: "socio-2",
    text: "Do you have any family members who depend on your financial support? How many?",
    points: 5,
    category: "II. Socio-Economic and Vulnerability Status (Imibereho Rusange)",
    kinyarwanda: {
      text: "Waba ari wowe ufite mu nshingano gutunga umuryango wawe, cyangwa abandi? If yes, Ni bangahe?"
    }
  },
  {
    id: "socio-3",
    text: "You've shared with us how you currently earn a living and support your family. If you were given the opportunity and resources, what would you do to increase your monthly income and improve your overall well-being?",
    points: 10,
    category: "II. Socio-Economic and Vulnerability Status (Imibereho Rusange)",
    kinyarwanda: {
      text: "Watubwiye imibereho n'amafaranga winjiza kugira ngo ubone ibigutunga cyangwa ibitunga umuryango wawe. Uramutse ubonye ubushobozi, wakora iki kugira ngo wongere ubushobozi n'amafaranga winjiza ku kwezi, uniteze imbere?"
    }
  },

  // III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga) - 10%
  {
    id: "digital-1",
    text: "Tell us about how you currently use digital tools and the internet in your daily life. What do you use them for, and how comfortable do you feel using different mobile applications or online platforms?",
    points: 3,
    category: "III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga)",
    kinyarwanda: {
      text: "Watubwira uko ukoresha ikoranabuhanga n'imbuga nkoranyambaga (internet) mu buzima bwawe bwa buri munsi? Ubikoresha mu biki, kandi wumva byoroshye gukoresha telefone cyangwa imbuga nkoranyambaga?"
    }
  },
  {
    id: "digital-2",
    text: "Do you mostly use your own phone, or a shared one?",
    points: 3,
    category: "III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga)",
    kinyarwanda: {
      text: "Ukoresha telefone yawe bwite cyangwa uratira?"
    }
  },
  {
    id: "digital-3",
    text: "Which apps do you use most often, and what do you like or dislike about them?",
    points: 2,
    category: "III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga)",
    kinyarwanda: {
      text: "Ni izihe mbuga (apps) ukoresha cyane kuri telefone? Kubera iki ari zo zonyine?"
    }
  },
  {
    id: "digital-4",
    text: "If you had consistent access to a smartphone and internet, what would you do with it?",
    points: 2,
    category: "III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga)",
    kinyarwanda: {
      text: "Iyo uza kuba ufite telefone igezweho na internet bihoraho, ni iki wabikoresha?"
    }
  },

  // IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi) - 20%
  {
    id: "community-1",
    text: "Do you belong to any community groups/association/cooperative? And do you participate in any community forums?",
    points: 5,
    category: "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)",
    kinyarwanda: {
      text: "Waba uzwi gute aho utuye, kandi witabira ibikorwa by'iterambere ry'aho utuye ku ruhe rugero? Wumva ufite uruhe ruhare mu bikorwa by'iterambere ry'aho utuye?"
    }
  },
  {
    id: "community-2",
    text: "(a) Do you live in your own (1 point)house? (b) Do you rent? (2 points) Stay with parents (1 point) (c) Stay with other people? (3 points)",points: 3,
    category: "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)",
    kinyarwanda: {
      text: "(a) Uba mu nzu yawe? (b) Urakodesha? (c) Uracumbitse"
    }
  },
  {
    id: "community-3",
    text: "Does the house you live in has access to water, electricity and latrine?",
    points: 2,
    category: "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)",
    kinyarwanda: {
      text: "Inzu ubamo yaba ifite amashanyarazi n'ubwiherero? Aho utuye mwaba mubona amazi mu buryo bworoshye?"
    }
  },
  {
    id: "community-4",
    text: "What do you feel are the biggest health challenges or needs in your direct community?",
    points: 5,
    category: "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)",
    kinyarwanda: {
      text: "Ubona ari ibihe ibibazo bikomeye bijyanye n'ubuzima muri aka gace utuyemo?"
    }
  },
  {
    id: "community-5",
    text: "If you were selected to be a DCC, how would you use this opportunity to address these health challenges or needs in your community and empower yourself?",
    points: 5,
    category: "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)",
    kinyarwanda: {
      text: "Uramutse uhawe amahirwe yo kuba umu DCC, (Digital Community Champions) wumva wabyaza ute ayo mahirwe mu gukemura ibibazo by'ubuzima, n'ibindi bibazo aho utuye umaze kutubwira, kandi nawe witeza imbere"
    }
  }
]

const categoryIcons = {
  "I.A. Education and Work Experience (Amashuri n'Ubunararibonye mu Kazi)": User,
  "II. Socio-Economic and Vulnerability Status (Imibereho Rusange)": Target,
  "III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga)": Zap,
  "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)": MessageCircle
}

const categoryColors = {
  "I.A. Education and Work Experience (Amashuri n'Ubunararibonye mu Kazi)": {
    bg: "from-blue-50 to-indigo-50",
    border: "border-blue-200/50",
    icon: "text-blue-600",
    card: "border-blue-200/30"
  },
  "II. Socio-Economic and Vulnerability Status (Imibereho Rusange)": {
    bg: "from-green-50 to-emerald-50",
    border: "border-green-200/50",
    icon: "text-green-600",
    card: "border-green-200/30"
  },
  "III. Digital Access and Literacy (Ubumenyi n'Ikoranabuhanga)": {
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-200/50",
    icon: "text-purple-600",
    card: "border-purple-200/30"
  },
  "IV. Living Environment & Community Connections (Aho Utuye n'Imibanire n'Abaturanyi)": {
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-200/50",
    icon: "text-orange-600",
    card: "border-orange-200/30"
  }
}

// Helper function to get colors with fallback
const getCategoryColors = (category: string) => {
  return categoryColors[category as keyof typeof categoryColors] || {
    bg: "from-gray-50 to-slate-50",
    border: "border-gray-200/50",
    icon: "text-gray-600",
    card: "border-gray-200/30"
  }
}

// Helper function to get icon with fallback
const getCategoryIcon = (category: string) => {
  return categoryIcons[category as keyof typeof categoryIcons] || FileText
}

export function InterviewQuestions({ application, onScoresSubmitted }: InterviewQuestionsProps) {
  const params = useParams()
  const lang = params?.lang as string
  const isEnglish = lang === 'en'
  
  // State to track scores for each question and sub-question
  const [scores, setScores] = useState<Record<string, number | string>>({})
  const [subScores, setSubScores] = useState<Record<string, Record<number, number>>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [submittedScores, setSubmittedScores] = useState<SubmittedScores | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedScores, setEditedScores] = useState<Record<string, number | string>>({})
  const [editedSubScores, setEditedSubScores] = useState<Record<string, Record<number, number>>>({})
  const [editedComments, setEditedComments] = useState<Record<string, string>>({})

  // Function to fetch submitted scores
  const fetchSubmittedScores = async () => {
    if (!application?.id) {
      setError("No application ID found.")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/interview-scores?applicationId=${application.id}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      if (result.data) {
        const data = result.data
        
        // Parse JSON fields if they are strings
        const scores = typeof data.scores === 'string' ? JSON.parse(data.scores) : data.scores
        const subScores = typeof data.subScores === 'string' ? JSON.parse(data.subScores) : (data.subScores || {})
        const comments = typeof data.comments === 'string' ? JSON.parse(data.comments) : (data.comments || {})
        
        setSubmittedScores(data)
        setScores(scores)
        setSubScores(subScores)
        setComments(comments)
      } else {
        // No scores found, allow new submission
        setSubmittedScores(null)
      }
    } catch (err) {
      console.error('Error fetching submitted scores:', err)
      setError("Failed to load submitted interview scores.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmittedScores()
  }, [application?.id])

  const questionsByCategory = interviewQuestions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = []
    }
    acc[question.category].push(question)
    return acc
  }, {} as Record<string, Question[]>)

  // Calculate total points (no cement scoring points)
  const totalPoints = interviewQuestions.reduce((sum, question) => sum + question.points, 0)
  
  // Calculate total scored (excluding cement comments)
  const totalScored = Object.entries(scores).reduce((sum, [key, score]) => {
    // Exclude cement comments from regular scores calculation
    if (typeof score === 'number' && !['cement-comments'].includes(key)) {
      return sum + score
    }
    return sum
  }, 0)

  const handleScoreChange = (questionId: string, value: string) => {
    const question = interviewQuestions.find(q => q.id === questionId)
    const maxPoints = question?.points || 0
    const numValue = parseFloat(value) || 0
    
    // Handle cement comments
    if (questionId === 'cement-comments') {
      // For comments, just store the string value
      setScores(prev => ({
        ...prev,
        [questionId]: value
      }))
    } else {
      // For regular questions, ensure the score doesn't exceed the maximum points
      const clampedValue = Math.min(numValue, maxPoints)
      setScores(prev => ({
        ...prev,
        [questionId]: clampedValue
      }))
    }
  }

  const handleSubScoreChange = (questionId: string, subIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0
    setSubScores(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [subIndex]: numValue
      }
    }))
  }

  const handleCommentChange = (questionId: string, value: string) => {
    setComments(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const getScorePercentage = (questionId: string) => {
    const question = interviewQuestions.find(q => q.id === questionId)
    if (!question || !scores[questionId] || typeof scores[questionId] !== 'number') return 0
    return (scores[questionId] as number / question.points) * 100
  }

  const getSubScorePercentage = (questionId: string, subIndex: number) => {
    const question = interviewQuestions.find(q => q.id === questionId)
    if (!question?.subQuestions?.[subIndex]) return 0
    const subQuestion = question.subQuestions[subIndex]
    const currentScore = subScores[questionId]?.[subIndex] || 0
    return (currentScore / subQuestion.points) * 100
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100 border-green-200"
    if (percentage >= 70) return "text-blue-600 bg-blue-100 border-blue-200"
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100 border-yellow-200"
    return "text-red-600 bg-red-100 border-red-200"
  }

  const isQuestionAnswered = (questionId: string) => {
    const score = scores[questionId]
    return score !== undefined && score !== null && (typeof score !== 'string' || score.trim() !== '')
  }

  const isSubQuestionAnswered = (questionId: string, subIndex: number) => {
    const subScore = subScores[questionId]?.[subIndex]
    return subScore !== undefined && subScore !== null
  }

  const calculateQuestionTotalScore = (questionId: string) => {
    const question = interviewQuestions.find(q => q.id === questionId)
    // For questions without sub-questions, return the direct score
    if (!question?.subQuestions) {
      const score = scores[questionId]
      return typeof score === 'number' ? score : 0
    }
    
    // For questions with sub-questions, calculate from sub-scores
    const subQuestionScores = question.subQuestions.reduce((sum, subQ, index) => {
      return sum + (subScores[questionId]?.[index] || 0)
    }, 0)
    
    return subQuestionScores
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // Function to enter edit mode
  const handleEditMode = () => {
    console.log('✏️ handleEditMode called', { hasSubmittedScores: !!submittedScores })
    if (submittedScores) {
      // Initialize edited scores with current submitted scores
      setEditedScores({ ...submittedScores.scores })
      setEditedSubScores({ ...submittedScores.subScores })
      setEditedComments({ ...submittedScores.comments })
      setIsEditMode(true)
      console.log('✅ Entered edit mode with scores:', submittedScores.scores)
    } else {
      console.log('❌ No submitted scores to edit')
    }
  }

  // Function to cancel edit mode
  const handleCancelEdit = () => {
    console.log('❌ handleCancelEdit called - exiting edit mode')
    setIsEditMode(false)
    setEditedScores({})
    setEditedSubScores({})
    setEditedComments({})
    setSubmitMessage("") // Clear any previous messages
  }

  // Function to handle score changes in edit mode
  const handleEditScoreChange = (questionId: string, score: number | string) => {
    setEditedScores(prev => ({
      ...prev,
      [questionId]: score
    }))
  }

  // Function to handle sub-score changes in edit mode
  const handleEditSubScoreChange = (questionId: string, subIndex: number, score: number) => {
    setEditedSubScores(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [subIndex]: score
      }
    }))
  }

  // Function to handle comment changes in edit mode
  const handleEditCommentChange = (questionId: string, comment: string) => {
    setEditedComments(prev => ({
      ...prev,
      [questionId]: comment
    }))
  }

  const handleSubmitScores = async () => {
    if (!application?.id) {
      setSubmitMessage("Error: No application ID found")
      return
    }

    // Use edited scores if in edit mode, otherwise use regular scores
    const scoresToValidate = isEditMode ? editedScores : scores
    const subScoresToValidate = isEditMode ? editedSubScores : subScores

    // Validate that all questions are answered
    const unansweredQuestions: string[] = []
    
    // Check main questions (including cement-comments)
    interviewQuestions.forEach(question => {
      const score = scoresToValidate[question.id]
      if (score === undefined || score === null || (typeof score === 'string' && score.trim() === '')) {
        unansweredQuestions.push(question.text)
      }
    })
    
    // Check sub-questions
    interviewQuestions.forEach(question => {
      if (question.subQuestions) {
        question.subQuestions.forEach((subQ, subIndex) => {
          const subScore = subScoresToValidate[question.id]?.[subIndex]
          if (subScore === undefined || subScore === null) {
            unansweredQuestions.push(`${question.text} - ${subQ.text}`)
          }
        })
      }
    })

    // If there are unanswered questions, show error and return
    if (unansweredQuestions.length > 0) {
      setSubmitMessage(`Error: Please answer all required questions. Missing: ${unansweredQuestions.slice(0, 3).join(', ')}${unansweredQuestions.length > 3 ? '...' : ''}`)
      return
    }

    // Show preview dialog instead of submitting directly
    setShowPreview(true)
    setSubmitMessage("")
  }

  const handleConfirmSubmit = async () => {
    console.log('🚀 handleConfirmSubmit called', { isEditMode, isSubmitting })
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      // Use edited scores if in edit mode, otherwise use regular scores
      const scoresToSubmit = isEditMode ? editedScores : scores
      const subScoresToSubmit = isEditMode ? editedSubScores : subScores
      const commentsToSubmit = isEditMode ? editedComments : comments
      
      console.log('📊 Scores to submit:', {
        isEditMode,
        scoresToSubmit,
        subScoresToSubmit,
        commentsToSubmit
      })

      // Calculate total scored points based on the scores being submitted
      const calculateTotalScored = () => {
        let total = 0
        interviewQuestions.forEach(question => {
          if (question.subQuestions) {
            // For questions with sub-questions, calculate from sub-scores
            question.subQuestions.forEach((_, subIndex) => {
              const subScore = subScoresToSubmit[question.id]?.[subIndex] || 0
              total += subScore
            })
          } else {
            // For questions without sub-questions, use direct score
            const score = scoresToSubmit[question.id]
            total += typeof score === 'number' ? score : 0
          }
        })
        return total
      }

      const totalScoredToSubmit = calculateTotalScored()

      // Debug logging
      console.log('🔍 Edit Mode Debug:', {
        isEditMode,
        scoresToSubmit,
        subScoresToSubmit,
        commentsToSubmit,
        totalScoredToSubmit,
        totalPoints
      })

      // Prepare the scores data
      const scoresData = {
        applicationId: application.id,
        totalScore: totalScoredToSubmit,
        totalPossibleScore: totalPoints,
        scores: scoresToSubmit,
        subScores: subScoresToSubmit,
        comments: commentsToSubmit,
        submittedAt: new Date().toISOString(),
        isUpdate: isEditMode, // Flag to indicate this is an update
        sections: Object.entries(questionsByCategory).map(([category, questions]) => ({
          category,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
          scoredPoints: questions.reduce((sum, q) => {
            if (q.subQuestions) {
              return sum + q.subQuestions.reduce((subSum, _, subIndex) => {
                return subSum + (subScoresToSubmit[q.id]?.[subIndex] || 0)
              }, 0)
            } else {
              const score = scoresToSubmit[q.id]
              return sum + (typeof score === 'number' ? score : 0)
            }
          }, 0),
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            points: q.points,
            scored: typeof scoresToSubmit[q.id] === 'number' ? scoresToSubmit[q.id] as number : 0
          }))
        }))
      }

      console.log('📤 Sending scores data:', scoresData)

      const response = await fetch('/api/interview-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoresData),
      })

      console.log('📥 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const responseData = await response.json()
        console.log('✅ API Success Response:', responseData)
        
        if (isEditMode) {
          setSubmitMessage("Interview scores updated successfully!")
          // Exit edit mode and refresh submitted scores
          setIsEditMode(false)
          setEditedScores({})
          setEditedSubScores({})
          setEditedComments({})
        } else {
          setSubmitMessage("Interview scores saved successfully!")
          // Update local state with new scores
          setSubmittedScores(null) // Clear existing scores
          setScores({}) // Clear current scores
          setSubScores({}) // Clear current sub-scores
          setComments({}) // Clear current comments
        }
        setShowPreview(false) // Close preview dialog
        
        // Refresh the submitted scores to show updated data
        await fetchSubmittedScores()
        
        // Notify parent component to refresh interview results
        console.log('✅ Scores submitted successfully, triggering refresh...')
        onScoresSubmitted?.()
      } else {
        const errorData = await response.json()
        console.error('❌ API Error Response:', errorData)
        setSubmitMessage(`Error: ${errorData.message || 'Failed to save scores'}`)
      }
    } catch (error) {
      console.error('Error saving interview scores:', error)
      setSubmitMessage("Error: Failed to save interview scores")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-4 text-gray-600">Loading interview scores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    )
  }

  if (submittedScores) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50 via-indigo-100 to-indigo-200 p-6">
            <CardTitle className="flex items-center gap-3 text-indigo-800 text-xl">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              {isEnglish ? "Interview Scores for DCC Candidate" : "Amanota kuri DCC"}
            </CardTitle>
            <div className="mt-2 p-3 bg-green-100 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  {isEnglish ? "✅ Previously Submitted - You can view and update your scores below" : "✅ Byatanzwe - Urashobora kubona no guhindura amanota yawe munsi"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">
                  {isEnglish ? "Total Points Available: " : "Amanota yose: "}
                  <span className="font-bold text-indigo-600">{totalPoints} points</span>
                </p>
                <p className="text-gray-600 mb-2">
                  {isEnglish ? "Points Scored: " : "Amafaranga Yatanzwe: "}
                  <span className="font-bold text-green-600">{totalScored.toFixed(1)} points</span>
                </p>
                <p className="text-sm text-gray-500">
                  {isEnglish 
                    ? "These are the scores you previously submitted for this application."
                    : "Ibyo byose byatanzwe ku munsi kugira ngo ubike muri mibare."
                  }
                </p>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                {submittedScores.sections.length} {isEnglish ? "Sections" : "Ibibazo"}
              </Badge>
            </div>
          </CardContent>
        </Card>

                 {/* Submitted Scores Display */}
         <Card className="border-0 bg-green-50/90 backdrop-blur-sm rounded-2xl overflow-hidden">
           <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 p-6">
             <CardTitle className="flex items-center gap-3 text-green-800 text-xl">
               <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                 <CheckCircle className="h-5 w-5 text-white" />
               </div>
               {isEnglish ? "Submitted Interview Scores" : "Amafaranga Yatanzwe"}
             </CardTitle>
           </CardHeader>
           <CardContent className="p-6">
             <div className="space-y-6">
               {/* Overall Score */}
               <div className="bg-white p-4 rounded-xl border border-green-200">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-bold text-gray-800 mb-2">
                       {isEnglish ? "Overall Score" : "Amanota yose"}
                     </h3>
                     <p className="text-gray-600">
                       {isEnglish ? "Total Points Scored: " : "A Yose Yatanzwe: "}
                       <span className="font-bold text-green-600">{submittedScores.totalScore.toFixed(1)}</span>
                       <span className="text-gray-500"> / {submittedScores.totalPossibleScore}</span>
                     </p>
                     <p className="text-sm text-gray-500 mt-1">
                       {isEnglish ? "Overall Assessment: " : "Ibisuzo Byose: "}
                       <span className="font-semibold text-green-700">{submittedScores.overallScore}</span>
                     </p>
                   </div>
                   <div className="text-right">
                     <Badge className="bg-green-100 text-green-700 border-green-200 text-lg px-4 py-2">
                       {((submittedScores.totalScore / submittedScores.totalPossibleScore) * 100).toFixed(1)}%
                     </Badge>
                   </div>
                 </div>
               </div>

               {/* Submitted Date */}
               <div className="bg-white p-4 rounded-xl border border-green-200">
                 <div className="flex items-center gap-3">
                   <Calendar className="h-5 w-5 text-green-600" />
                   <div>
                     <h4 className="font-semibold text-gray-800">
                       {isEnglish ? "Submitted on:" : "Yatanzwe ku:"}
                     </h4>
                     <p className="text-gray-600">
                       {new Date(submittedScores.submittedAt).toLocaleDateString()} at {new Date(submittedScores.submittedAt).toLocaleTimeString()}
                     </p>
                   </div>
                 </div>
               </div>

               {/* Individual Scores */}
               <div className="bg-white p-4 rounded-xl border border-green-200">
                 <h4 className="font-semibold text-gray-800 mb-4">
                   {isEnglish ? "Detailed Scores" : "Amanota yose"}
                 </h4>
                 <div className="space-y-3">
                   {Object.entries(submittedScores.scores).map(([questionId, score]) => {
                     const question = interviewQuestions.find(q => q.id === questionId)
                     if (!question) return null
                     
                     const displayText = isEnglish ? question.text : (question.kinyarwanda?.text || question.text)
                     const currentScore = isEditMode ? editedScores[questionId] : score
                     const scorePercentage = question.points > 0 && typeof currentScore === 'number' ? (currentScore / question.points) * 100 : 0
                     const currentComment = isEditMode ? editedComments[questionId] : (submittedScores.comments?.[questionId] || '')
                     
                     return (
                       <div key={questionId} className="p-3 bg-gray-50 rounded-lg">
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex-1">
                             <p className="text-sm font-medium text-gray-800">{displayText}</p>
                           </div>
                           <div className="flex items-center gap-3">
                             {isEditMode ? (
                               <div className="flex items-center gap-2">
                                 <Input
                                   type="number"
                                   min="0"
                                   max={question.points}
                                   step="0.1"
                                   value={currentScore || ''}
                                   onChange={(e) => handleEditScoreChange(questionId, parseFloat(e.target.value) || 0)}
                                   className="w-20 h-8 text-sm"
                                 />
                                 <span className="text-sm text-gray-500">/{question.points}</span>
                               </div>
                             ) : (
                               <span className="font-semibold text-gray-700">
                                 {typeof currentScore === 'number' ? currentScore.toFixed(1) : currentScore}/{question.points}
                               </span>
                             )}
                             <Badge className={`${getScoreColor(scorePercentage)} border text-xs`}>
                               {scorePercentage.toFixed(0)}%
                             </Badge>
                           </div>
                         </div>
                         {(currentComment || isEditMode) && (
                           <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                             <p className="text-xs font-medium text-blue-800 mb-1">
                               {isEnglish ? "Comments:" : "Ubusobanuro:"}
                             </p>
                             {isEditMode ? (
                               <Textarea
                                 value={currentComment}
                                 onChange={(e) => handleEditCommentChange(questionId, e.target.value)}
                                 placeholder={isEnglish ? "Add comments..." : "Ongeraho ubusobanuro..."}
                                 className="w-full text-xs min-h-[60px]"
                               />
                             ) : (
                               <p className="text-xs text-blue-700">{currentComment}</p>
                             )}
                           </div>
                         )}
                       </div>
                     )
                   })}
                   
                   {/* Cement Comments Display */}
                   {submittedScores.scores['cement-comments'] && (
                     <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200">
                       <h5 className="font-semibold text-gray-800 mb-3">
                         {isEnglish ? "General Comments" : "Ubusobanuro Bwose"}
                       </h5>
                       {isEditMode ? (
                         <Textarea
                           value={editedScores['cement-comments'] || ''}
                           onChange={(e) => handleEditScoreChange('cement-comments', e.target.value)}
                           placeholder={isEnglish ? "Add general comments..." : "Ongeraho ubusobanuro bwose..."}
                           className="w-full min-h-[100px]"
                         />
                       ) : (
                         <div className="p-3 bg-white rounded border border-gray-200">
                           <span className="text-sm font-medium text-gray-700 block mb-1">
                             {isEnglish ? "Comments:" : "Ubusobanuro:"}
                           </span>
                           <p className="text-sm text-gray-600">
                             {typeof submittedScores.scores['cement-comments'] === 'string' ? submittedScores.scores['cement-comments'] : ''}
                           </p>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>

        {/* Edit Controls */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {isEnglish ? "Edit Interview Scores" : "Hindura Amanota"}
              </h3>
              <p className="text-gray-600 text-sm">
                {isEnglish 
                  ? isEditMode 
                    ? "You are currently editing your scores. Make changes and save when ready."
                    : "Click the edit button to modify your previously submitted interview scores."
                  : isEditMode
                    ? "Urahindura amanota yawe. Hindura ukongere ubike."
                    : "Kanda buto yo guhindura kugira ngo uhindure amanota yawe yatanzwe."
                }
              </p>
              {submitMessage && (
                <p className={`text-sm mt-2 ${submitMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {submitMessage}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isEditMode ? (
                <>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    {isEnglish ? "Cancel" : "Kuraho"}
                  </Button>
                  <Button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting || !application?.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting 
                      ? (isEnglish ? "Saving..." : "Bikwa...") 
                      : (isEnglish ? "Save Changes" : "Bika Ubwihindure")
                    }
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEditMode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEnglish ? "Edit Scores" : "Hindura Amanota"}
                </Button>
              )}
            </div>
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 via-indigo-100 to-indigo-200 p-6">
          <CardTitle className="flex items-center gap-3 text-indigo-800 text-xl">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            {isEnglish ? "Interview Questions for DCC Candidates" : "Ibibazo kuri DCC"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                {isEnglish ? "Total Points Available: " : "Amanota yose: "}
                <span className="font-bold text-indigo-600">{totalPoints} points</span>
              </p>
              <p className="text-gray-600 mb-2">
                {isEnglish ? "Points Scored: " : "Amafaranga Yatanzwe: "}
                <span className="font-bold text-green-600">{totalScored.toFixed(1)} points</span>
              </p>
              <p className="text-sm text-gray-500">
                {isEnglish 
                  ? "Score each question and sub-question based on the candidate's response. You can give partial points (e.g., 1.5/2). All questions are required."
                  : "Gera amafaranga ku kibazo buri kimwe n'ibindi bibazo uhereye ku bisubizo by'umuntu. Urashobora gutanga amanotanze (urugero: 1.5/2). Ibibazo byose birakenewe."
                }
              </p>
              <p className="text-sm text-red-600 font-medium mt-2">
                {isEnglish ? "⚠️ All questions are required" : "⚠️ Ibibazo byose birakenewe"}
              </p>
            </div>
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
              {interviewQuestions.length} {isEnglish ? "Questions" : "Ibibazo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Questions by Category */}
      {Object.entries(questionsByCategory).map(([category, questions]) => {
        const categoryPoints = questions.reduce((sum, q) => sum + q.points, 0)
        const categoryScored = questions.reduce((sum, q) => sum + calculateQuestionTotalScore(q.id), 0)
        const IconComponent = getCategoryIcon(category)
        const colors = getCategoryColors(category)

        return (
          <div key={category} className={`bg-gradient-to-r ${colors.bg} p-6 rounded-2xl border ${colors.border}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <IconComponent className={`h-5 w-5 ${colors.icon}`} />
                {isEnglish ? category : category.split('(')[1]?.replace(')', '') || category}
              </h3>
              <div className="flex items-center gap-4">
                <Badge className={`bg-white/80 text-gray-700 border ${colors.card}`}>
                  {categoryScored.toFixed(1)}/{categoryPoints} points
                </Badge>
                <Badge className={`${getScoreColor((categoryScored / categoryPoints) * 100)} border`}>
                  {((categoryScored / categoryPoints) * 100).toFixed(0)}%
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              {questions.map((question, index) => {
                const displayText = isEnglish ? question.text : (question.kinyarwanda?.text || question.text)
                const displaySubQuestions = isEnglish ? question.subQuestions : question.kinyarwanda?.subQuestions
                const currentScore = calculateQuestionTotalScore(question.id)
                const scorePercentage = question.points > 0 ? (currentScore / question.points) * 100 : 0

                return (
                  <div key={question.id} className="bg-white/80 p-4 pb-2 rounded-xl border border-white/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                          {index + 1}. {displayText}
                          <span className="text-red-500 ml-1">*</span>
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-right">
                          <Label className="text-sm font-medium text-gray-700">
                            {isEnglish ? "Score:" : "Amanota:"}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min="0"
                              max={question.points}
                              step="0.1"
                              value={scores[question.id] || ''}
                              onChange={(e) => handleScoreChange(question.id, e.target.value)}
                              className={`w-20 h-8 text-center text-sm font-medium ${
                                !isQuestionAnswered(question.id) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="0"
                            />
                            <span className="text-gray-500 text-sm">/ {question.points}</span>
                          </div>
                        </div>
                        {currentScore > 0 && (
                          <Badge className={`${getScoreColor(scorePercentage)} border text-xs`}>
                            {scorePercentage.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Comment Section */}
                    <div className="mt-3 mb-2">
                      <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        {isEnglish ? "Comments:" : "Ubusobanuro:"}
                      </Label>
                      <Textarea
                        value={comments[question.id] || ''}
                        onChange={(e) => handleCommentChange(question.id, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg resize-none bg-white text-black text-sm"
                        rows={2}
                        placeholder={isEnglish ? "Add your comments about this question..." : "Bika ibisobanura kuri iki kibazo..."}
                      />
                    </div>
                    
                    {displaySubQuestions && (
                      <div className="space-y-3 mt-4">
                        <h5 className="font-medium text-gray-700 text-sm">
                          {isEnglish ? "Sub-questions:" : "Ibindi bibazo:"}
                        </h5>
                        {displaySubQuestions.map((subQ, subIndex) => {
                          const subCurrentScore = subScores[question.id]?.[subIndex] || 0
                          const subScorePercentage = getSubScorePercentage(question.id, subIndex)
                          
                          return (
                            <div key={subIndex} className="bg-gray-50/80 p-3 rounded-lg border border-gray-200/50">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-gray-700 text-sm">
                                    • {subQ.text}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <div className="text-right">
                                    <Label className="text-xs font-medium text-gray-600">
                                      {isEnglish ? "Score:" : "Amanota:"}
                                    </Label>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={subQ.points}
                                        step="0.1"
                                        value={subCurrentScore}
                                        onChange={(e) => handleSubScoreChange(question.id, subIndex, e.target.value)}
                                        className={`w-16 h-6 text-center text-xs ${
                                          !isSubQuestionAnswered(question.id, subIndex) ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="0"
                                      />
                                      <span className="text-gray-500 text-xs">/ {subQ.points}</span>
                                    </div>
                                  </div>
                                  {subCurrentScore > 0 && (
                                    <Badge className={`${getScoreColor(subScorePercentage)} border text-xs`}>
                                      {subScorePercentage.toFixed(0)}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Cement Comments Field */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  General Comments
                </Label>
                <textarea
                  value={scores['cement-comments'] || ''}
                  onChange={(e) => handleScoreChange('cement-comments', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none bg-white text-black"
                  rows={3}
                  placeholder="Add your general comments about the candidate..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {isEnglish ? "Preview & Save Interview Scores" : "Reba & Bika Amanota"}
            </h3>
            <p className="text-gray-600 text-sm">
              {isEnglish 
                ? "Click the button below to preview all scores before saving to the database."
                : "Kanda buto iri munsi kugira ngo urebe amanota yose mbere yo kubika muri database."
              }
            </p>
            {submitMessage && (
              <p className={`text-sm mt-2 ${submitMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {submitMessage}
              </p>
            )}
          </div>
          <Button
            onClick={handleSubmitScores}
            disabled={isSubmitting || !application?.id}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {isSubmitting 
              ? (isEnglish ? "Saving..." : "Bikwa...") 
              : (isEnglish ? "Preview Scores" : "Reba Amanota")
            }
          </Button>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-2xl">
          <DialogHeader className="bg-gray-50 p-6 rounded-t-lg border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {isEnglish ? "Interview Scores Preview" : "Reba Amanota y'Interview"}
            </DialogTitle>
            <DialogDescription className="text-gray-700 text-base mt-2">
              {isEnglish 
                ? "Please review all your scores before submitting. You can go back to make changes if needed."
                : "Uraza kureba amanota yawe yose mbere yo gutanga. Urashobora kugaruka kugira ngo uhindure."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 p-6 bg-white">
            {/* Summary Section */}
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-xl border-2 border-blue-300 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {isEnglish ? "Score Summary" : "Amafuturo y'Amanota"}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">{isEnglish ? "Total Score:" : "Amanota Yose:"}</p>
                  <p className="text-2xl font-bold text-blue-700">{totalScored.toFixed(1)} / {totalPoints}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">{isEnglish ? "Percentage:" : "Igereranwa:"}</p>
                  <p className="text-2xl font-bold text-green-700">
                    {((totalScored / totalPoints) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Questions by Category */}
            {Object.entries(questionsByCategory).map(([category, questions]) => (
              <div key={category} className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {React.createElement(getCategoryIcon(category), { className: "h-5 w-5 text-blue-600" })}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{category}</h4>
                </div>
                
                <div className="space-y-4">
                  {questions.map(question => {
                    const currentScore = scores[question.id]
                    const scorePercentage = getScorePercentage(question.id)
                    
                    return (
                      <div key={question.id} className="bg-white border-l-4 border-blue-400 pl-6 py-4 rounded-r-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-base font-semibold text-gray-800 mb-2">
                              {isEnglish ? question.text : question.kinyarwanda?.text || question.text}
                            </p>
                            {typeof currentScore === 'string' && currentScore && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-700 italic">
                                  "{currentScore}"
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 px-3 py-2 rounded-lg">
                                <span className="text-base font-bold text-gray-800">
                                  {typeof currentScore === 'number' ? currentScore.toFixed(1) : 'N/A'} / {question.points}
                                </span>
                              </div>
                              {typeof currentScore === 'number' && currentScore > 0 && (
                                <Badge className={`${getScoreColor(scorePercentage)} text-sm font-medium px-3 py-1`}>
                                  {scorePercentage.toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sub-questions */}
                        {question.subQuestions && subScores[question.id] && (
                          <div className="mt-4 ml-6 space-y-2 bg-gray-50 p-4 rounded-lg">
                            {question.subQuestions.map((subQ, subIndex) => {
                              const subScore = subScores[question.id]?.[subIndex]
                              const subScorePercentage = getSubScorePercentage(question.id, subIndex)
                              
                              return (
                                <div key={subIndex} className="flex justify-between items-center bg-white p-3 rounded border">
                                  <span className="text-sm text-gray-700 flex-1">
                                    {isEnglish ? subQ.text : subQ.text}
                                  </span>
                                  <div className="flex items-center gap-2 ml-4">
                                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      {subScore || 0} / {subQ.points}
                                    </span>
                                    {subScore && subScore > 0 && (
                                      <Badge className={`${getScoreColor(subScorePercentage)} text-xs font-medium`}>
                                        {subScorePercentage.toFixed(0)}%
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* General Comments */}
            {scores['cement-comments'] && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {isEnglish ? "General Comments" : "Ibyo Wavuze"}
                </h4>
                <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow-md">
                  <p className="text-base text-gray-800 italic leading-relaxed">
                    "{scores['cement-comments']}"
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8 p-6 bg-gray-50 border-t-2 border-gray-200">
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                disabled={isSubmitting}
                className="flex-1 h-12 text-base font-medium border-2 border-gray-300 hover:border-gray-400"
              >
                {isEnglish ? "Go Back & Edit" : "Garuka & Hindura"}
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 text-base font-medium bg-green-600 hover:bg-green-700 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isEnglish ? "Saving..." : "Bikwa..."}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {isEnglish ? "Confirm & Save Scores" : "Emeza & Bika Amanota"}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
} 