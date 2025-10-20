// This file contains server-side only utilities and imports
// It should never be imported directly in client-side code

import { headers } from 'next/headers'

export const isServer = () => {
  try {
    headers()
    return true
  } catch {
    return false
  }
}

export async function loadTwilio() {
  try {
    headers() // Check if we're on the server
    if (process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('Twilio is not supported in Edge Runtime')
    }
    const twilio = await import('twilio')
    return twilio.default
  } catch {
    throw new Error('Twilio can only be loaded on the server side')
  }
}

export async function loadSendGrid() {
  try {
    headers() // Check if we're on the server
    if (process.env.NEXT_RUNTIME === 'edge') {
      throw new Error('SendGrid is not supported in Edge Runtime')
    }
    const sendgrid = await import('@sendgrid/mail')
    return sendgrid.default
  } catch {
    throw new Error('SendGrid can only be loaded on the server side')
  }
}

// Add other server-side only imports here 