"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, FileText, User, GraduationCap, Smartphone, Briefcase, Heart, MessageSquare, Users, Target, Lightbulb, Clock, Globe, Monitor } from "lucide-react"

interface InterviewGuideProps {
  application: any
  criteria: any[]
}

const criteriaIcons = {
  "Personal Background & Vulnerability Assessment": User,
  "Education & Academic Background": GraduationCap,
  "Technical Skills & Digital Literacy": Smartphone,
  "Work Experience & Professional Background": Briefcase,
  "Healthcare Knowledge & Experience": Heart,
  "Communication Skills & Languages": MessageSquare,
  "Community Engagement & Leadership": Users,
  "Motivation & Commitment": Target,
  "Problem-Solving & Adaptability": Lightbulb,
  "Availability & Flexibility": Clock,
  "Cultural Sensitivity & Empathy": Globe,
  "Education and Work Experience (Amashuri n’Ubunararibonye mu Kazi)": Monitor
}

export function InterviewGuide({ application, criteria }: InterviewGuideProps) {
  const [expandedCriteria, setExpandedCriteria] = useState<string[]>([])

  const toggleCriteria = (criteriaName: string) => {
    setExpandedCriteria(prev => 
      prev.includes(criteriaName) 
        ? prev.filter(name => name !== criteriaName)
        : [...prev, criteriaName]
    )
  }

  const getQuestionsForCriteria = (criteriaName: string) => {
    const formData = application?.formData || {}
    
    switch (criteriaName) {
      case "Personal Background & Vulnerability Assessment":
        return [
          "Can you tell me about your current living situation and household composition?",
          "What challenges do you face in your daily life that might affect your ability to work?",
          "How do you manage your household responsibilities?",
          "What support systems do you have in place?",
          "How would this opportunity impact your family's financial situation?",
          "What barriers have you faced in accessing employment or education opportunities?",
          "How do you handle stress and difficult situations?",
          "What motivates you to overcome personal challenges?"
        ]

      case "Education & Academic Background":
        return [
          `Tell me about your educational journey. I see you completed ${formData.education || 'your education'}.`,
          "What subjects did you enjoy most in school and why?",
          "How has your education prepared you for this role?",
          "What skills did you develop through your studies?",
          "Are you currently pursuing any additional education or training?",
          "How do you stay updated with new information and learning?",
          "What was your biggest academic achievement?",
          "How do you apply what you learned in school to real-world situations?"
        ]

      case "Technical Skills & Digital Literacy":
        return [
          "What computer skills do you have? Can you demonstrate basic computer operations?",
          "How comfortable are you with using mobile applications?",
          "What apps do you use regularly and how do you use them?",
          "How do you learn to use new technology or applications?",
          "Have you ever helped others learn to use technology?",
          "What challenges do you face when using digital devices?",
          "How do you ensure the security of your digital information?",
          "What would you do if you encountered a technical problem while working?"
        ]

      case "Work Experience & Professional Background":
        return [
          "Tell me about your previous work experience. What roles have you held?",
          "What were your main responsibilities in your previous positions?",
          "What skills did you develop through your work experience?",
          "How did you handle difficult situations at work?",
          "What achievements are you most proud of in your professional life?",
          "How do you work with colleagues and supervisors?",
          "What did you learn from your previous work experiences?",
          "How do you handle feedback and criticism?"
        ]

      case "Healthcare Knowledge & Experience":
        return [
          "What experience do you have in healthcare or health-related activities?",
          "What do you understand about community health and wellness?",
          "How would you explain basic health concepts to community members?",
          "What role do you think community health workers play?",
          "How would you handle a situation where someone needs medical attention?",
          "What health issues are most important in your community?",
          "How would you promote health awareness in your community?",
          "What training or education do you have related to health?"
        ]

      case "Communication Skills & Languages":
        return [
          `I see you speak ${formData.languages?.join(', ') || 'multiple languages'}. How do you use these languages in your daily life?`,
          "How do you communicate with people who speak different languages?",
          "Can you give me an example of how you explained something complex to someone?",
          "How do you handle communication with people from different backgrounds?",
          "What communication challenges have you faced and how did you overcome them?",
          "How do you ensure your message is understood clearly?",
          "How do you handle difficult conversations?",
          "What role does listening play in effective communication?"
        ]

      case "Community Engagement & Leadership":
        return [
          "Tell me about your involvement in community activities and organizations.",
          "What leadership roles have you taken in your community?",
          "How do you build relationships with community members?",
          "What community issues are most important to you?",
          "How would you mobilize community members for a health initiative?",
          "What challenges have you faced in community work?",
          "How do you handle conflicts within community groups?",
          "What makes you an effective community leader?"
        ]

      case "Motivation & Commitment":
        return [
          `I read your motivation statement: "${formData.motivation || 'You mentioned your motivation'}". Can you elaborate on this?`,
          "What specific goals do you have for your personal and professional development?",
          "How committed are you to serving your community?",
          "What would you do if you face challenges in this role?",
          "How do you stay motivated when things are difficult?",
          "What impact do you hope to make through this opportunity?",
          "How do you prioritize your commitments?",
          "What would success look like for you in this role?"
        ]

      case "Problem-Solving & Adaptability":
        return [
          "Tell me about a time when you had to solve a difficult problem.",
          "How do you approach new or unfamiliar situations?",
          "What do you do when your original plan doesn't work?",
          "How do you learn from mistakes or failures?",
          "How do you handle change and uncertainty?",
          "What creative solutions have you come up with in the past?",
          "How do you gather information to solve problems?",
          "What steps do you take when making important decisions?"
        ]

      case "Availability & Flexibility":
        return [
          `I see your availability is ${formData.availability || 'flexible'}. Can you tell me more about your schedule?`,
          "How do you balance work with other responsibilities?",
          "Are you willing to work during evenings or weekends if needed?",
          "How do you handle unexpected schedule changes?",
          "What transportation options do you have for getting to work?",
          "How do you manage your time effectively?",
          "What would you do if you had a family emergency during work hours?",
          "How do you ensure you're punctual and reliable?"
        ]

      case "Cultural Sensitivity & Empathy":
        return [
          "How do you work with people from different cultural backgrounds?",
          "What do you do to understand and respect different perspectives?",
          "How do you show empathy to people in difficult situations?",
          "How would you handle cultural misunderstandings?",
          "What role does cultural awareness play in community health work?",
          "How do you build trust with people from different communities?",
          "What biases or assumptions do you need to be aware of?",
          "How do you ensure everyone feels included and respected?"
        ]

      case "Education and Work Experience (Amashuri n’Ubunararibonye mu Kazi)":
        return [
          `Tell me about your educational journey. I see you completed ${formData.education || 'your education'}.`,
          "What subjects did you enjoy most in school and why?",
          "How has your education prepared you for this role?",
          "What skills did you develop through your studies?",
          "Are you currently pursuing any additional education or training?",
          "How do you stay updated with new information and learning?",
          "What was your biggest academic achievement?",
          "How do you apply what you learned in school to real-world situations?",
          "Tell me about your previous work experience. What roles have you held?",
          "What were your main responsibilities in your previous positions?",
          "What skills did you develop through your work experience?",
          "How did you handle difficult situations at work?",
          "What achievements are you most proud of in your professional life?",
          "How do you work with colleagues and supervisors?",
          "What did you learn from your previous work experiences?",
          "How do you handle feedback and criticism?"
        ]

      default:
        return [
          "Do you have ways of earning money on a daily/weekly/monthly basis to support yourself and/or your household     ?   If yes, How? (Ufite icyo ukora kiguha amafaranga (yaba ari nyakabyizi, ku munsi, buri cyumweru, cyangwa buri kwezi kugira ngo wifashe cyangwa ufashe umuryango wawe? Niba ari yego, ukora iki?)  "
        ]
    }
  }

  const getFollowUpQuestions = (criteriaName: string) => {
    switch (criteriaName) {
      case "Personal Background & Vulnerability Assessment":
        return [
          "How do you think your background will help you relate to community members?",
          "What support would you need to be successful in this role?",
          "How do you maintain resilience in challenging circumstances?"
        ]
      
      case "Healthcare Knowledge & Experience":
        return [
          "How would you explain the importance of preventive healthcare?",
          "What role do you think technology plays in modern healthcare?",
          "How would you handle sensitive health information?"
        ]
      
      case "Community Engagement & Leadership":
        return [
          "How would you measure the success of a community health initiative?",
          "What strategies would you use to engage hard-to-reach populations?",
          "How would you handle resistance to health interventions?"
        ]
      
      default:
        return [
          "Do you have any family members who depend on your financial support? How many? (Hari abo mu muryango wawe bagushingiyeho mu mibereho ya buri munsi? Ni bangahe?)",
          "Can you describe any challenges or circumstances that make it difficult for you or your household to meet your daily needs or achieve financial stability? (Wadusobanurira ibibazo cyangwa ibihe bigoye wowe cyangwa urugo rwawe muhura na byo bikabagora kubona ibikenewe buri munsi cyangwa kugira imibereho irambye?)",
          "Tell us about any local groups or activities you participate in regularly  (Hari amatsinda cyangwa ibikorwa rusange byo mu gace utuyemo witabira buri gihe? Ni ibihe?) ",
          "For Disabled Applicant/Refugee only: You mentioned [disability/refugee status] in your application; how has that impacted your access to education or work opportunities? (Ku bakandida bafite ubumuga cyangwa impunzi gusa]: Wavuze ko ufite [ubumuga/uri impunzi] mu nyandiko yawe – ibyo byagize iki ku mahirwe wabonye yo kwiga cyangwa kubona akazi)",

        ]
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Interview Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Use these questions to guide your interview. Focus on areas where the candidate's application shows strengths or areas for development.
          </p>
          
          <div className="space-y-3">
            {criteria.map((criterion) => {
              const IconComponent = criteriaIcons[criterion.name as keyof typeof criteriaIcons] || FileText
              const isExpanded = expandedCriteria.includes(criterion.name)
              const questions = getQuestionsForCriteria(criterion.name)
              const followUpQuestions = getFollowUpQuestions(criterion.name)

              return (
                <Card key={criterion.id} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{criterion.name}</CardTitle>
                          <p className="text-sm text-gray-600">{criterion.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Max: {criterion.maxScore}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCriteria(criterion.name)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Primary Questions:</h4>
                          <ul className="space-y-2">
                            {questions.map((question, index) => (
                              <li key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                                {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Follow-up Questions:</h4>
                          <ul className="space-y-2">
                            {followUpQuestions.map((question, index) => (
                              <li key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-blue-200">
                                {question}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-sm text-blue-800 mb-1">Scoring Tips:</h4>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• 8-10: Excellent - Demonstrates strong understanding and experience</li>
                            <li>• 6-7: Good - Shows adequate knowledge and potential</li>
                            <li>• 4-5: Fair - Basic understanding, needs development</li>
                            <li>• 0-3: Poor - Limited knowledge or experience</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 