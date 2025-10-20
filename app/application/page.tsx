'use client';

import { Card, CardContent } from '@/components/ui/card';
import MultiStepForm from '@/components/multi-step-form';

export default function ApplicationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Application Form</h1>
            <MultiStepForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 