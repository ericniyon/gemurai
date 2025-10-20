'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function TestSMSPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/test/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test SMS sent successfully!');
        setLastResult(data.data);
      } else {
        throw new Error(data.message || 'Failed to send SMS');
      }
    } catch (error) {
      console.error('Error testing SMS:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send test SMS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Application SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 0788123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Enter a Rwanda phone number (format: 07XXXXXXXX)
                </p>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Test SMS'}
              </Button>
            </form>

            {lastResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Last Test Result:</h3>
                <pre className="text-sm bg-white p-2 rounded border">
                  {JSON.stringify(lastResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">How to test:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Enter a valid Rwanda phone number</li>
              <li>Click "Send Test SMS"</li>
              <li>You should receive an application submission confirmation SMS</li>
              <li>Check the console for SMS delivery logs</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 