/**
 * Formats a Rwanda phone number to the international format
 * Accepts numbers starting with '0' or '+250' and formats them to '+250 XXX XXX XXX' format
 * @param phone The phone number to format
 * @returns The formatted phone number or null if invalid
 */
export function formatRwandaPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove any spaces or special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Handle +250 format
  if (cleaned.startsWith('+250')) {
    const digits = cleaned.slice(4); // Remove +250
    if (digits.length === 9) {
      return `+250${digits}`;
    }
  }

  // Handle 07 format
  if (cleaned.startsWith('07')) {
    if (cleaned.length === 10) { // Full number including 07 prefix
      return `+250${cleaned.slice(1)}`; // Remove the 0 and add +250
    }
  }

  return null;
}

/**
 * Validates a Rwanda phone number
 * @param phone The phone number to validate
 * @returns boolean indicating if the phone number is valid
 */
export function isValidRwandaPhoneNumber(phone: string): boolean {
  if (!phone) return false;

  // Remove any spaces or special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for 07XXXXXXXX format (10 digits total)
  if (cleaned.startsWith('07') && cleaned.length === 10) {
    return true;
  }

  // Check for +250XXXXXXXXX format
  if (cleaned.startsWith('+250') && cleaned.length === 13) {
    return true;
  }

  return false;
}

/**
 * Formats a phone number for display
 * @param phone The phone number to format
 * @returns The formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone) return '';

  const formatted = formatRwandaPhoneNumber(phone);
  if (formatted) return formatted;

  // If not a valid phone number yet (user is typing), just return cleaned input
  return phone.replace(/[^\d+\s]/g, '');
}

/**
 * Formats user input while typing
 * @param phone The phone number being typed
 * @returns The formatted phone number
 */
export function formatPhoneInput(phone: string): string {
  if (!phone) return '';

  // Remove any non-digit characters except + and spaces
  let value = phone.replace(/[^\d+\s]/g, '');

  // If starts with 0, convert to +250 format
  if (value.startsWith('0')) {
    value = '+250' + value.slice(1);
  }

  // If not starting with +, add it
  if (!value.startsWith('+')) {
    value = '+250' + value;
  }

  // Clean up any extra +250 prefixes
  if (value.includes('+250', 1)) {
    value = '+250' + value.split('+250').pop();
  }

  return value;
} 