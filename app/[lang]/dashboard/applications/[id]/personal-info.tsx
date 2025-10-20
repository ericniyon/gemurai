import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PersonalInfoProps {
  formData: any
}

export function PersonalInfo({ formData }: PersonalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Name</label>
            <p>{formData?.full_name || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Email</label>
            <p>{formData?.email || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Phone</label>
            <p>{formData?.phone || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Age</label>
            <p>{formData?.age || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Gender</label>
            <p>{formData?.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Location</label>
            <p>{formData?.location || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Employment Status</label>
            <p>{formData?.employment_status || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Monthly Income</label>
            <p>{formData?.monthly_income ? `RWF ${formData.monthly_income}` : 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Education Level</label>
            <p>{formData?.education_level || 'N/A'}</p>
          </div>
          <div>
            <label className="font-medium">Marital Status</label>
            <p>{formData?.marital_status || 'N/A'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 