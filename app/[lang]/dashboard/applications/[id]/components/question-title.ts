// Question title mapping
export const questionTitles: Record<string, string> = {
  businessName: "Business Name",
  businessType: "Type of Business",
  businessDescription: "Business Description",
  businessLocation: "Business Location",
  yearsInOperation: "Years in Operation",
  monthlyRevenue: "Monthly Revenue",
  employeeCount: "Number of Employees",
  businessGoals: "Business Goals",
  challengesFaced: "Challenges Faced",
  marketingStrategy: "Marketing Strategy",
  competitiveAdvantage: "Competitive Advantage",
  financialProjections: "Financial Projections",
  fundingNeeds: "Funding Requirements",
  implementationPlan: "Implementation Plan",
  riskMitigation: "Risk Mitigation Strategy",
}

// Helper function to get formatted question title
export function getQuestionTitle(key: string): string {
  // First check our mapping
  if (questionTitles[key]) {
    return questionTitles[key]
  }
  
  // If not in mapping, format the key
  return key
    // Split on camelCase
    .replace(/([A-Z])/g, ' $1')
    // Split on underscores and remove them
    .split('_').join(' ')
    // Capitalize first letter
    .replace(/^./, str => str.toUpperCase())
    // Remove extra spaces
    .trim()
}