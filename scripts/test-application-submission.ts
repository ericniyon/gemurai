import { markApplicationAsSubmitted } from '../lib/application-storage'

async function testApplicationSubmission() {
  try {
    console.log('Starting application submission test...')

    // Test case 1: Submit a valid application
    const testApplicationId = 'test-application-id' // Replace with a real application ID
    console.log(`Attempting to submit application with ID: ${testApplicationId}`)
    
    await markApplicationAsSubmitted(testApplicationId)
    console.log('✅ Application submitted successfully')

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

// Run the test
testApplicationSubmission() 