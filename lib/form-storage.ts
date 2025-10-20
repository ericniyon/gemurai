// Types
interface FormData {
  [key: string]: any;
}

interface FormProgress {
  formData: FormData;
  currentStep?: number;
  lastUpdated: string;
}

// Constants
const FORM_STORAGE_KEY = 'Gemurai_form_progress';
const APPLICATION_STORAGE_PREFIX = 'Gemurai_application_';
const SESSION_STORAGE_KEY = 'Gemurai_application_session';
const SUBMITTED_APPLICATIONS_KEY = 'submitted_applications';
const FORM_CONFIG_KEY = 'form_config_dcc-application-form';

// Save form progress to localStorage
export function saveFormProgress(formData: FormData, currentStep?: number): void {
  try {
    const progress: FormProgress = {
      formData,
      currentStep,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving form progress:', error);
  }
}

// Load form progress from localStorage
export function loadFormProgress(): FormProgress | null {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (error) {
    console.error('Error loading form progress:', error);
    return null;
  }
}

// Clear form progress from localStorage
export function clearFormProgress(): void {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing form progress:', error);
  }
}

// Check if form progress exists
export function hasFormProgress(): boolean {
  try {
    return !!localStorage.getItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.error('Error checking form progress:', error);
    return false;
  }
}

// Update specific fields in form progress
export function updateFormFields(fields: Partial<FormData>): void {
  try {
    const current = loadFormProgress();
    if (!current) {
      saveFormProgress(fields);
      return;
    }

    saveFormProgress({
      ...current.formData,
      ...fields
    }, current.currentStep);
  } catch (error) {
    console.error('Error updating form fields:', error);
  }
}

// Clean up all application data from storage
export function cleanupApplicationStorage(applicationId?: string): void {
  try {
    // Remove form progress
    localStorage.removeItem(FORM_STORAGE_KEY);
    
    // Remove application data
    if (applicationId) {
      localStorage.removeItem(`${APPLICATION_STORAGE_PREFIX}${applicationId}`);
    }
    
    // Remove session data
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    
    // Clean up submitted applications list
    const submittedApps = localStorage.getItem(SUBMITTED_APPLICATIONS_KEY);
    if (submittedApps) {
      const apps = JSON.parse(submittedApps);
      if (applicationId) {
        // Remove specific application if ID provided
        const filtered = apps.filter((app: any) => app.id !== applicationId);
        localStorage.setItem(SUBMITTED_APPLICATIONS_KEY, JSON.stringify(filtered));
      } else {
        // Remove all if no ID provided
        localStorage.removeItem(SUBMITTED_APPLICATIONS_KEY);
      }
    }
    
    console.log('✨ Application storage cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up application storage:', error);
  }
} 