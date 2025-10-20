export interface FormData {
  [key: string]: any;
}

export interface FormStep {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';
  options?: { label: string; value: string }[];
  required?: boolean;
  validation?: {
    pattern?: string;
    message?: string;
  };
}

export interface FormState {
  currentStep: number;
  formData: FormData;
  isValid: boolean;
  errors: { [key: string]: string };
} 