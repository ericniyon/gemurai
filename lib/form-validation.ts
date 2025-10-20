import { ApplicationData, ValidationResult } from "@/types/application";
import { isValidRwandaPhoneNumber } from "@/lib/utils/phone-utils";

export const validateApplication = (application: ApplicationData): ValidationResult => {
  const missingFields: string[] = [];
  
  // Check for required fields
  const phone = application.formData?.q10 || application.formData?.q8 || application.phone;
  const firstName = application.formData?.q1;
  const lastName = application.formData?.q2;

  // Required fields validation
  if (!phone || phone.trim() === "") {
    missingFields.push("Phone Number");
  }

  if (!firstName || firstName.trim() === "") {
    missingFields.push("First Name");
  }

  if (!lastName || lastName.trim() === "") {
    missingFields.push("Last Name");
  }

  const isValid = missingFields.length === 0;

  return {
    isValid,
    missingFields,
    errorMessage: missingFields.length > 0 
      ? `Required fields missing or invalid: ${missingFields.join(", ")}` 
      : undefined,
  };
};

export const validateRequiredFields = (formData: any): string[] => {
  const missingFields: string[] = [];
  
  // Check for required phone field only
  const phone = formData?.q10 || formData?.q8;

  // Check if phone is missing or empty
  if (!phone || phone.trim() === "") {
    missingFields.push("Phone Number");
  }

  return missingFields;
}; 