import { twilioClient } from "./services/twilio-service";

export async function sendDCCWelcomeSMS(phoneNumber: string, name: string) {
  try {
    const message = `Hello ${name}, Welcome to DCC! We're excited to have you on board.`;
    
    const result = await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: "Gemurai", // Use Gemurai as sender
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error("Error sending DCC welcome SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

export async function sendApplicationSubmissionSMS(phoneNumber: string, applicationId: string) {
  try {
    const message = `Thank you for submitting your DCC application (ID: ${applicationId}). We will review your application and get back to you soon.`;
    
    const result = await twilioClient.messages.create({
      body: message,
      to: phoneNumber,
      from: "Gemurai", // Use Gemurai as sender
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error("Error sending application submission SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
} 