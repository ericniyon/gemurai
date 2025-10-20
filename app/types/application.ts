export interface FormData {
  [key: string]: any;
  q1?: string; // First Name
  q2?: string; // Last Name
  q9?: string; // Email
  q10?: string; // Phone
}

export interface ApplicationData {
  id: string;
  status: string;
  formData: FormData;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  notes: string;
  dccCreated: boolean;
  autoCreatedAt?: string;
  lastActivity?: string;
}

export interface FormQuestion {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    pattern?: string;
    message?: string;
    acceptedTypes?: string[];
  };
  dependsOn?: {
    questionId: string;
    value: string;
  };
}

export interface FormSection {
  title: string;
  description?: string;
  questions: FormQuestion[];
}

export interface FormConfig {
  sections: FormSection[];
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  errorMessage?: string;
} 