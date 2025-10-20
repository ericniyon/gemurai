import { FormData, FormField, FormState } from '@/types/form';
import { isValidRwandaPhoneNumber } from '@/lib/utils/phone-utils';

const FORM_STORAGE_KEY = 'application_form_data';
const SUBMITTED_APPLICATIONS_KEY = 'submitted_applications';

export interface ApplicationData {
  id: string;
  status: 'draft' | 'submitted';
  formData: FormData;
  currentStep: number;
  submittedAt?: string;
}

export const saveFormData = (data: FormData, step: number) => {
  if (typeof window !== 'undefined') {
    const formState: FormState = {
      currentStep: step,
      formData: data,
      isValid: false,
      errors: {}
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formState));
    sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formState));
  }
};

export const loadFormData = (): FormState | null => {
  if (typeof window !== 'undefined') {
    const sessionData = sessionStorage.getItem(FORM_STORAGE_KEY);
    const localData = localStorage.getItem(FORM_STORAGE_KEY);
    
    const data = sessionData || localData;
    return data ? JSON.parse(data) : null;
  }
  return null;
};

export const clearFormData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(FORM_STORAGE_KEY);
    sessionStorage.removeItem(FORM_STORAGE_KEY);
  }
};

export const saveSubmittedApplication = (applicationData: ApplicationData) => {
  if (typeof window !== 'undefined') {
    const submittedApps = getSubmittedApplications();
    submittedApps.push({
      ...applicationData,
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem(SUBMITTED_APPLICATIONS_KEY, JSON.stringify(submittedApps));
    return true;
  }
  return false;
};

export const getSubmittedApplications = (): ApplicationData[] => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(SUBMITTED_APPLICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  }
  return [];
};

export const getApplicationById = (id: string): ApplicationData | null => {
  if (typeof window !== 'undefined') {
    // First check current form data
    const currentForm = loadFormData();
    if (currentForm?.formData) {
      return {
        id,
        status: 'draft',
        formData: currentForm.formData,
        currentStep: currentForm.currentStep
      };
    }

    // Then check submitted applications
    const submittedApps = getSubmittedApplications();
    return submittedApps.find(app => app.id === id) || null;
  }
  return null;
};

export const validateField = (field: FormField, value: any): string | null => {
  if (field.required && (!value || value.trim() === '')) {
    return `${field.label} is required`;
  }

  if (field.validation?.pattern && value) {
    const regex = new RegExp(field.validation.pattern);
    if (!regex.test(value)) {
      return field.validation.message || `Invalid ${field.label}`;
    }
  }

  return null;
};

export const validateStep = (fields: FormField[], formData: FormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  
  fields.forEach(field => {
    const error = validateField(field, formData[field.id]);
    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
};

export const isStepValid = (fields: FormField[], formData: FormData): boolean => {
  const errors = validateStep(fields, formData);
  return Object.keys(errors).length === 0;
}; 