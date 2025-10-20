'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ApplicationSuccessPage() {
  const router = useRouter();

  // Prevent accessing this page directly without submission
  useEffect(() => {
    const submittedApps = localStorage.getItem('submitted_applications');
    if (!submittedApps) {
      router.replace('/application');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your application. We have received your submission and will review it shortly.
            You will receive an SMS confirmation shortly.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push('/application')} variant="outline">
              Submit Another Application
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 