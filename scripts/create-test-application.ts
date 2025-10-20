import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const testApplication = await prisma.application.create({
    data: {
      id: "APP-TEST-20250624",
      status: "SUBMITTED",
      phone: "+250780000000",
      formData: {
        // Income & Employment data
        monthlyIncome: "75000",
        employmentStatus: "casual_labor",
        workExperience: ["momo_agent", "retailer"],
        incomeDescription: "I do casual labor and sometimes work as a mobile money agent",
        
        // Digital Access data
        deviceOwnership: "basic_phone",
        internetAccess: "limited",
        digitalSkills: ["basic_phone"],
        literacyLevel: "basic",
        
        // Family Status
        maritalStatus: "single_parent",
        dependents: "3",
        
        // Female Headed Household
        gender: "female",
        isHouseholdHead: "yes",
        supportNetwork: "no",
        
        // Disability/Health
        hasDisability: "no",
        hasChronicIllness: "no",
        hasMildHealthIssues: "yes",
        
        // Housing
        housingType: "semi_permanent",
        housingOwnership: "rented",
        hasElectricity: "yes",
        hasCleanWater: "no",
        
        // Education
        educationYears: "9",
        highestLevel: "primary",
        languages: ["kinyarwanda", "basic_english"],
        
        // Social Capital
        communityInvolvement: "member",
        associations: "member",
        
        // Location
        sector: "target_sector",
        district: "target_district",
        
        // Age
        dateOfBirth: "1998-06-24", // 25 years old

        // Required fields for evaluation
        willingToAttendTraining: "yes",
        canTravelWithinSector: "yes",
        deviceOwnershipStatus: "yes",
        
        // Application metadata
        submissionDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: "1.0",
        source: "test",
        evaluationStatus: "pending",
        evaluationCount: 0,
        lastEvaluationDate: null
      },
      currentStep: 1
    }
  })
  
  console.log('Created test application:', testApplication)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 