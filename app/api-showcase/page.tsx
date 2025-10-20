import { ApiExample } from "@/components/api-example"

export default function ApiShowcasePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Gemurai Platform API Showcase</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">API Overview</h2>
          <p className="mb-4">
            The Gemurai Platform provides a comprehensive RESTful API that allows developers to integrate with our
            platform's features.
          </p>
          <p className="mb-4">
            Our API supports user management, applications, DCCs, and more. All endpoints return standardized JSON
            responses and use JWT for authentication.
          </p>
          <div className="bg-muted p-4 rounded-md mb-4">
            <h3 className="font-medium mb-2">Base URL</h3>
            <code className="text-sm">https://api.Gemurai.rw/api/v1</code>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Key Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>JWT Authentication</li>
              <li>Standardized Response Format</li>
              <li>Comprehensive Error Handling</li>
              <li>Pagination Support</li>
              <li>Filtering and Search</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Try the API</h2>
          <ApiExample />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">API Documentation</h2>
        <p className="mb-4">
          For complete API documentation, please visit our{" "}
          <a href="/api-docs" className="text-primary hover:underline">
            API Documentation
          </a>{" "}
          page.
        </p>
        <p>
          You can also download our{" "}
          <a href="/API_DOCUMENTATION.md" className="text-primary hover:underline">
            API Documentation in Markdown format
          </a>
          .
        </p>
      </div>
    </div>
  )
}
