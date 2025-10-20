'use client';

import { useState, useEffect } from 'react';
import { FormStep, FormData, FormField } from '@/types/form';
import { 
  saveFormData, 
  loadFormData, 
  clearFormData, 
  validateStep, 
  isStepValid,
  saveSubmittedApplication,
  getApplicationById
} from '@/lib/form-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { saveFormProgress, loadFormProgress, clearFormProgress } from '@/lib/form-storage';

// Define form steps
const formSteps: FormStep[] = [
  {
    id: 'personal',
    title: 'Personal Information',
    fields: [
      {
        id: 'fullName',
        label: 'Full Name',
        type: 'text',
        required: true,
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone Number',
        type: 'tel',
        required: true,
      },
    ],
  },
  // Add more steps as needed
];

export default function MultiStepForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState<string>(`APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormProgress();
    if (savedData) {
      setCurrentStep(savedData.currentStep);
      setFormData(savedData.formData);
      toast.info('Loaded your saved progress');
    }
  }, []);

  // Save form data when it changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      saveFormProgress(currentStep, formData);
    }
  }, [formData, currentStep]);

  const handleInputChange = (field: FormField, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field.id]: value,
    }));

    // Clear error for this field
    if (errors[field.id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field.id];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentFields = formSteps[currentStep - 1].fields;
    const stepErrors = validateStep(currentFields, formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < formSteps.length) {
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsPreview(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else if (isPreview) {
      setIsPreview(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit the application
      const response = await fetch('/api/v1/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: applicationId,
          formData,
          status: 'SUBMITTED',
          phone: formData.phone || formData.q8,
          email: formData.email || formData.q7,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to submit application');
      }

      // SMS notification is handled server-side by /api/v1/applications/submit

      // Clear form data from storage
      clearFormProgress();

      // Show success message
      toast.success('Application submitted successfully!');
      
      // Redirect to home page
      router.push('/rw');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Input
            type={field.type}
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            className={errors[field.id] ? 'border-red-500' : ''}
          />
        );
      case 'select':
        return (
          <Select
            value={formData[field.id] || ''}
            onValueChange={(value) => handleInputChange(field, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      // Add more field types as needed
      default:
        return null;
    }
  };

  if (isPreview) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Review Your Application</h2>
        {formSteps.map((step) => (
          <div key={step.id} className="space-y-4">
            <h3 className="text-xl font-semibold">{step.title}</h3>
            {step.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="font-medium">{field.label}</label>
                <p>{formData[field.id]}</p>
              </div>
            ))}
          </div>
        ))}
        <div className="flex justify-between pt-6">
          <Button onClick={handlePrevious} variant="outline">
            Back to Edit
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="bg-primary text-white hover:bg-primary/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    );
  }

  const currentStepData = formSteps[currentStep - 1];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
        <p className="text-gray-500">
          Step {currentStep} of {formSteps.length}
        </p>
      </div>

      <div className="space-y-4">
        {currentStepData.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={handlePrevious}
          variant="outline"
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStep === formSteps.length ? 'Review' : 'Next'}
        </Button>
      </div>
    </div>
  );
} 