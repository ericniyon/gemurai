import { toast } from 'sonner'

interface SMSMessage {
  to: string;
  message: string;
}

export const sendSMS = async ({ to, message }: SMSMessage): Promise<boolean> => {
  try {
    const response = await fetch('/api/notifications/sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error('Failed to send SMS:', data.message);
      toast.error('Failed to send SMS notification');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    toast.error('Failed to send SMS notification');
    return false;
  }
};

export const formatApplicationStatusSMS = (status: string, applicationId: string): string => {
  return `Your application (ID: ${applicationId}) has been successfully submitted and is now ${status}. We will review it and get back to you soon.`;
}; 