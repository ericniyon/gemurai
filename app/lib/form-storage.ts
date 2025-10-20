const FORM_STORAGE_KEY = 'application_form_data';

export interface StoredFormData {
  currentStep: number;
  formData: Record<string, any>;
  lastUpdated: string;
}

export function saveFormProgress(step: number, data: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  
  const formData: StoredFormData = {
    currentStep: step,
    formData: data,
    lastUpdated: new Date().toISOString(),
  };
  
  localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
}

export function loadFormProgress(): StoredFormData | null {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem(FORM_STORAGE_KEY);
  if (!stored) return null;
  
  try {
    return JSON.parse(stored) as StoredFormData;
  } catch (error) {
    console.error('Error loading form data:', error);
    return null;
  }
}

export function clearFormProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(FORM_STORAGE_KEY);
} 