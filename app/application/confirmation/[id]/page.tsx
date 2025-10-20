'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { loadFormProgress } from '@/lib/form-storage';

interface ApplicationConfirmation {
  id: string;
  status: string;
  formData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    q1?: string; // First Name
    q2?: string; // Last Name
    q7?: string; // Email
    q8?: string; // Phone
  };
}

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchApplication() {
      try {
        // First try to get the application from the API
        const response = await fetch(`/api/v1/applications/public/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          // If this is a temporary application (starts with APP-), get form data from localStorage
          if (params.id.startsWith('APP-')) {
            const savedData = loadFormProgress();
            if (savedData) {
              setApplication({
                ...data.application,
                formData: savedData.formData
              });
            } else {
              throw new Error('Application data not found in local storage');
            }
          } else {
            setApplication(data.application);
          }
        } else {
          throw new Error(data.message || 'Failed to load application');
        }
      } catch (error) {
        console.error('Error loading application:', error);
        router.push('/application?error=application-not-found');
      } finally {
        setLoading(false);
      }
    }

    fetchApplication();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Application Not Found</h2>
              <p className="text-gray-600 mb-6">We couldn't find the application you're looking for.</p>
              <Button onClick={() => router.push('/application')}>Start New Application</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applicantName = 
    (application.formData.firstName && application.formData.lastName) 
      ? `${application.formData.firstName} ${application.formData.lastName}`
      : (application.formData.q1 && application.formData.q2)
        ? `${application.formData.q1} ${application.formData.q2}`
        : 'Applicant';

  const phoneNumber = application.formData.phone || application.formData.q8;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-center text-2xl">Application Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-600">
              <p className="mb-2">Thank you for your application, {applicantName}!</p>
              <p>Your application ID is: <span className="font-mono font-bold">{application.id}</span></p>
              {phoneNumber && (
                <p className="mt-2">We have sent a confirmation SMS to: {phoneNumber}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Next Steps:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>We will review your application shortly</li>
                <li>You will receive updates via SMS</li>
                <li>You can check your application status using your application ID</li>
              </ul>
            </div>

            <div className="flex justify-center pt-6">
              <Button onClick={() => router.push('/application/status')}>
                Check Application Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 