import OpenAI from 'openai';

// Check if the OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

// Create and export the OpenAI client instance
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}); 