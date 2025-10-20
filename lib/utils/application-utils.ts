import { nanoid } from 'nanoid';

// Generate a unique application ID
export function generateApplicationId(): string {
  return `APP-${nanoid(10)}`;
} 