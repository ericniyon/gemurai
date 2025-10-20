import { NextRequest, NextResponse } from "next/server"
import { verifyAuthToken } from "@/lib/token"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/v1/interviews/guide?applicationId=xxx
// Get interview guide questions based on application data
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Interview guide API called")
    
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get("Gemurai_token")

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await verifyAuthToken(token.value)
    console.log("👤 User verified:", user?.role)

    if (!user) {
      console.log("❌ Invalid token")
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const applicationId = url.searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "Application ID is required" },
        { status: 400 }
      )
    }

    // Get application data
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    })

    if (!application) {
      console.log("❌ Application not found")
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      )
    }

    const formData = application.formData as any

    // Generate interview guide based on application data
    const interviewGuide = {
      applicationId: application.id,
      candidateName: formData?.fullName || "Candidate",
      questions: {
        "Personal Background & Vulnerability Assessment": [
          "Can you tell me about your current living situation and household composition?",
          "What challenges do you face in your daily life that might affect your ability to work?",
          "How do you manage your household responsibilities?",
          "What support systems do you have in place?",
          "How would this opportunity impact your family's financial situation?",
          "What barriers have you faced in accessing employment or education opportunities?",
          "How do you handle stress and difficult situations?",
          "What motivates you to overcome personal challenges?"
        ],
        "Education & Academic Background": [
          `Tell me about your educational journey. I see you completed ${formData?.education || 'your education'}.`,
          "What subjects did you enjoy most in school and why?",
          "How has your education prepared you for this role?",
          "What skills did you develop through your studies?",
          "Are you currently pursuing any additional education or training?",
          "How do you stay updated with new information and learning?",
          "What was your biggest academic achievement?",
          "How do you apply what you learned in school to real-world situations?"
        ],
        "Technical Skills & Digital Literacy": [
          "What computer skills do you have? Can you demonstrate basic computer operations?",
          "How comfortable are you with using mobile applications?",
          "What apps do you use regularly and how do you use them?",
          "How do you learn to use new technology or applications?",
          "Have you ever helped others learn to use technology?",
          "What challenges do you face when using digital devices?",
          "How do you ensure the security of your digital information?",
          "What would you do if you encountered a technical problem while working?"
        ],
        "Work Experience & Professional Background": [
          "Tell me about your previous work experience. What roles have you held?",
          "What were your main responsibilities in your previous positions?",
          "What skills did you develop through your work experience?",
          "How did you handle difficult situations at work?",
          "What achievements are you most proud of in your professional life?",
          "How do you work with colleagues and supervisors?",
          "What did you learn from your previous work experiences?",
          "How do you handle feedback and criticism?"
        ],
        "Healthcare Knowledge & Experience": [
          "What experience do you have in healthcare or health-related activities?",
          "What do you understand about community health and wellness?",
          "How would you explain basic health concepts to community members?",
          "What role do you think community health workers play?",
          "How would you handle a situation where someone needs medical attention?",
          "What health issues are most important in your community?",
          "How would you promote health awareness in your community?",
          "What training or education do you have related to health?"
        ],
        "Communication Skills & Languages": [
          `I see you speak ${formData?.languages?.join(', ') || 'multiple languages'}. How do you use these languages in your daily life?`,
          "How do you communicate with people who speak different languages?",
          "Can you give me an example of how you explained something complex to someone?",
          "How do you handle communication with people from different backgrounds?",
          "What communication challenges have you faced and how did you overcome them?",
          "How do you ensure your message is understood clearly?",
          "How do you handle difficult conversations?",
          "What role does listening play in effective communication?"
        ],
        "Community Engagement & Leadership": [
          "Tell me about your involvement in community activities and organizations.",
          "What leadership roles have you taken in your community?",
          "How do you build relationships with community members?",
          "What community issues are most important to you?",
          "How would you mobilize community members for a health initiative?",
          "What challenges have you faced in community work?",
          "How do you handle conflicts within community groups?",
          "What makes you an effective community leader?"
        ],
        "Motivation & Commitment": [
          `I read your motivation statement: "${formData?.motivation || 'You mentioned your motivation'}". Can you elaborate on this?`,
          "What specific goals do you have for your personal and professional development?",
          "How committed are you to serving your community?",
          "What would you do if you face challenges in this role?",
          "How do you stay motivated when things are difficult?",
          "What impact do you hope to make through this opportunity?",
          "How do you prioritize your commitments?",
          "What would success look like for you in this role?"
        ],
        "Problem-Solving & Adaptability": [
          "Tell me about a time when you had to solve a difficult problem.",
          "How do you approach new or unfamiliar situations?",
          "What do you do when your original plan doesn't work?",
          "How do you learn from mistakes or failures?",
          "How do you handle change and uncertainty?",
          "What creative solutions have you come up with in the past?",
          "How do you gather information to solve problems?",
          "What steps do you take when making important decisions?"
        ],
        "Availability & Flexibility": [
          `I see your availability is ${formData?.availability || 'flexible'}. Can you tell me more about your schedule?`,
          "How do you balance work with other responsibilities?",
          "Are you willing to work during evenings or weekends if needed?",
          "How do you handle unexpected schedule changes?",
          "What transportation options do you have for getting to work?",
          "How do you manage your time effectively?",
          "What would you do if you had a family emergency during work hours?",
          "How do you ensure you're punctual and reliable?"
        ],
        "Cultural Sensitivity & Empathy": [
          "How do you work with people from different cultural backgrounds?",
          "What do you do to understand and respect different perspectives?",
          "How do you show empathy to people in difficult situations?",
          "How would you handle cultural misunderstandings?",
          "What role does cultural awareness play in community health work?",
          "How do you build trust with people from different communities?",
          "What biases or assumptions do you need to be aware of?",
          "How do you ensure everyone feels included and respected?"
        ],
        "Digital Access & Technology Readiness": [
          `I see you ${formData?.smartphoneAccess === 'Yes' ? 'have' : 'don\'t have'} access to a smartphone. How do you use technology in your daily life?`,
          "What devices do you have access to and how do you use them?",
          "How do you access the internet and how often?",
          "What challenges do you face with technology access?",
          "How would you handle technology requirements for this role?",
          "What training or support would you need for digital tools?",
          "How do you stay safe online?",
          "What would you do if you had technical difficulties while working?"
        ]
      }
    }

    console.log("✅ Interview guide generated successfully")

    return NextResponse.json({ 
      success: true, 
      guide: interviewGuide
    })

  } catch (error) {
    console.error("❌ Error generating interview guide:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    )
  }
} 