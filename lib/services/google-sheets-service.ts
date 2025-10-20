export interface GoogleSheetsApplication {
  id: string
  name: string
  email: string
  phone: string
  nationalId: string
  status: string
  createdAt: string
  updatedAt: string
  formData?: any
  notes?: string
  dccCreated?: boolean
  currentStep?: string
}

export interface GoogleSheetsResponse {
  success: boolean
  data: GoogleSheetsApplication[]
  error?: string
}

export class GoogleSheetsService {
  private static readonly GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby98sxBqV-YjFrC3-KHBlxezCy6azUcaB1Cy2aWS2bvqHYC4h9R3AADz5ACm0sG7SXH/exec'

  static async fetchApplications(): Promise<GoogleSheetsResponse> {
    try {
      console.log('🔄 Fetching applications from Google Sheets...')
      console.log('📡 URL:', `${this.GOOGLE_APPS_SCRIPT_URL}?path=Evaluation&action=read`)
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(`${this.GOOGLE_APPS_SCRIPT_URL}?path=Evaluation&action=read`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        redirect: 'follow', // Follow redirects automatically
        mode: 'cors', // Enable CORS
        signal: controller.signal,
        cache: 'no-cache' // Ensure fresh data
      })
      
      clearTimeout(timeoutId)

      console.log('📊 Response status:', response.status)
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Google Sheets response:', data)

      // Transform the data to match our application format
      const transformedData = this.transformGoogleSheetsData(data)
      
      return {
        success: true,
        data: transformedData
      }
    } catch (error) {
      console.error('❌ Error fetching from Google Sheets:', error)
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch from Google Sheets'
      }
    }
  }

  private static transformGoogleSheetsData(rawData: any): GoogleSheetsApplication[] {
    console.log('🔄 Transforming Google Sheets data:', typeof rawData, Array.isArray(rawData), rawData?.length)
    // If the data is wrapped in a { data: [...] } object, extract it
    if (rawData && Array.isArray(rawData.data)) {
      rawData = rawData.data;
    }
    // Handle different data formats from Google Sheets
    if (!rawData) {
      console.warn('⚠️ No data received from Google Sheets')
      return []
    }
    // Handle the actual Google Sheets data format (JSON array of objects)
    if (Array.isArray(rawData) && rawData.length > 0 && typeof rawData[0] === 'object') {
      return rawData.map((app: any, index: number) => {
        const firstName = app['First Name'] || ''
        const lastName = app['Lat Name'] || ''
        const fullName = `${firstName} ${lastName}`.trim()
        return {
          id: app.ID || app.id || `GS-${Date.now()}-${index}`,
          name: fullName,
          email: app.email || app['Applicant email'] || '',
          phone: app.phone || app['Applicant Phone number'] || '',
          nationalId: app.nationalId || app['National ID'] || '',
          status: app.status || 'SUBMITTED',
          createdAt: app.createdAt || new Date().toISOString(),
          updatedAt: app.updatedAt || new Date().toISOString(),
          formData: app,
          notes: app.notes || '',
          dccCreated: app.dccCreated || false,
          currentStep: app.currentStep || '8',
          district: app.District || '',
          province: app.Province || '',
          education: app.Education || '',
          fieldOfStudy: app['Field Of Study'] || app.FIELDOFSTUDY || '',
          skills: app.Skills || '',
          goals: app.Goals || '',
          motivation: app.Motivation || '',
          languages: app.Languages || '',
          workExperience: app['work Experience'] || '',
          previousWorkExperience: app['Previous Work Experience'] || '',
          yearsOfExperience: app['Years of Experience'] || '',
          communityInvolvement: app['Community involvement'] || '',
          whichCommunityInvolvement: app['Which Community involvement'] || '',
          ownHouse: app['Own house'] || '',
          deviceOwner: app['Device Owner'] || '',
          availability: app.Availability || '',
          internetUsage: app['Internet Usage'] || '',
          appFamiliarity: app['App Familiarity'] || '',
          smartphoneAccess: app['Smartphone Access'] || '',
          communityConnection: app['Community Connection'] || '',
          healthcareBackground: app['Healthcare Background'] || '',
          otherEngagement: app['Other Engagement'] || '',
          otherApps: app['Other Apps'] || '',
          otherSkills: app['Other Skills'] || '',
          otherCommunityActivities: app['Other Community Activities'] || '',
          usedApps: app['used Apps'] || '',
          previousRoles: app['Previous Roles'] || '',
          schoolName: app['School Name'] || '',
          cell: app.Cell || '',
          sector: app.Sector || '',
          village: app.Village || '',
          gender: app.Gender || '',
          maritalStatus: app['Marital Status'] || '',
          disability: app.Disability || '',
          disabilityType: app['Disability type'] || '',
          disabilityTypeOther: app['Disability type other'] || '',
          refugee: app.Refugee || '',
          refugeeCamp: app['Refugee camp'] || '',
          householdingHead: app['Householding head'] || '',
          financialProvider: app['Financial provider for your household'] || '',
          otherPhone: app['Other Applicant Phone number'] || '',
          preferredContactMethod: app['Preferred contact method'] || '',
          contactEmail: app['Contact email'] || '',
          consent1: app.Consent1 || '',
          consent2: app.Consent2 || '',
          consent3: app.Consent3 || '',
          dateOfBirth: app['Date of Birth'] || '',
          evaluations: app.evaluations || '',
          dccProfile: app.dccProfile || '',
          userId: app.userId || '',
          user: app.user || null
        }
      })
    }
    // If data is in a different format, try to extract what we can
    console.warn('⚠️ Unknown data format from Google Sheets:', rawData)
    return []
  }

  static async fetchApplicationsWithFallback(): Promise<{
    source: 'google-sheets' | 'database'
    data: any[]
    error?: string
  }> {
    try {
      // Try Google Sheets first
      const googleSheetsResult = await this.fetchApplications()
      
      if (googleSheetsResult.success) {
        console.log('✅ Successfully fetched from Google Sheets:', googleSheetsResult.data.length, 'applications')
        return {
          source: 'google-sheets',
          data: googleSheetsResult.data
        }
      }

      // If Google Sheets fails, return empty array
      console.log('❌ Google Sheets failed, returning empty array')
      return {
        source: 'google-sheets',
        data: [],
        error: googleSheetsResult.error
      }
    } catch (error) {
      console.error('❌ Error in fetchApplicationsWithFallback:', error)
      return {
        source: 'google-sheets',
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  static async fetchSubmittedApplications(): Promise<{
    success: boolean
    data: GoogleSheetsApplication[]
    source: 'google-sheets'
    error?: string
  }> {
    try {
      console.log('🔄 Fetching submitted applications from Google Sheets...')
      console.log('📡 URL:', `${this.GOOGLE_APPS_SCRIPT_URL}?path=Evaluation&action=read&filter=submitted`)
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout for submitted apps
      
      const response = await fetch(`${this.GOOGLE_APPS_SCRIPT_URL}?path=Evaluation&action=read&filter=submitted`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        redirect: 'follow',
        mode: 'cors',
        signal: controller.signal,
        cache: 'no-cache'
      })
      
      clearTimeout(timeoutId)

      console.log('📊 Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Google Sheets submitted applications response:', data)

      // Transform the data to match our application format
      const transformedData = this.transformGoogleSheetsData(data)
      
      // Filter for only submitted applications
      const submittedApplications = transformedData.filter(app => 
        app.status === 'SUBMITTED' || 
        app.status === 'submitted' || 
        !app.status || 
        app.status === ''
      )
      
      console.log(`📊 Found ${submittedApplications.length} submitted applications out of ${transformedData.length} total`)
      
      return {
        success: true,
        data: submittedApplications,
        source: 'google-sheets'
      }
    } catch (error) {
      console.error('❌ Error fetching submitted applications from Google Sheets:', error)
      return {
        success: false,
        data: [],
        source: 'google-sheets',
        error: error instanceof Error ? error.message : 'Failed to fetch submitted applications from Google Sheets'
      }
    }
  }

  static async fetchSubmittedApplicationsWithFallback(): Promise<{
    source: 'google-sheets' | 'database'
    data: any[]
    error?: string
  }> {
    try {
      // Try Google Sheets first for submitted applications
      const googleSheetsResult = await this.fetchSubmittedApplications()
      
      if (googleSheetsResult.success && googleSheetsResult.data.length > 0) {
        console.log('✅ Successfully fetched submitted applications from Google Sheets:', googleSheetsResult.data.length, 'applications')
        return {
          source: 'google-sheets',
          data: googleSheetsResult.data
        }
      }

      // If Google Sheets fails or returns no data, return empty array
      console.log('❌ Google Sheets failed for submitted applications, returning empty array')
      return {
        source: 'google-sheets',
        data: [],
        error: googleSheetsResult.error
      }
    } catch (error) {
      console.error('❌ Error in fetchSubmittedApplicationsWithFallback:', error)
      return {
        source: 'google-sheets',
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
} 