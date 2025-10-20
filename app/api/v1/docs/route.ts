export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const openApiSpec = {
      openapi: "3.0.0",
      info: {
        title: "Gemurai Platform API",
        version: "1.0.0",
        description: "API for the Gemurai Platform - Digital Community Centers management system",
        contact: {
          name: "Gemurai Support",
          email: "support@Gemurai.com",
        },
      },
      servers: [
        {
          url: "/api/v1",
          description: "Production server",
        },
      ],
      paths: {
        "/auth/login": {
          post: {
            summary: "User login",
            description: "Authenticate user and return JWT token",
            tags: ["Authentication"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      password: { type: "string", minLength: 6 },
                    },
                    required: ["email", "password"],
                  },
                },
              },
            },
            responses: {
              "200": {
                description: "Login successful",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "object",
                          properties: {
                            token: { type: "string" },
                            user: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                email: { type: "string" },
                                name: { type: "string" },
                                role: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              "401": {
                description: "Invalid credentials",
              },
            },
          },
        },
        "/users": {
          get: {
            summary: "Get all users",
            description: "Retrieve a paginated list of users",
            tags: ["Users"],
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10 },
              },
              {
                name: "search",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Users retrieved successfully",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                        data: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              email: { type: "string" },
                              name: { type: "string" },
                              role: { type: "string" },
                              createdAt: { type: "string", format: "date-time" },
                            },
                          },
                        },
                        meta: {
                          type: "object",
                          properties: {
                            page: { type: "integer" },
                            limit: { type: "integer" },
                            total: { type: "integer" },
                            totalPages: { type: "integer" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: "Create new user",
            description: "Create a new user account",
            tags: ["Users"],
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      name: { type: "string" },
                      password: { type: "string", minLength: 6 },
                      role: { type: "string", enum: ["ADMIN", "CONSUMER"] },
                      permissions: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: ["email", "name", "password", "role"],
                  },
                },
              },
            },
            responses: {
              "201": {
                description: "User created successfully",
              },
              "400": {
                description: "Invalid request data",
              },
            },
          },
        },
        "/applications": {
          get: {
            summary: "Get all applications",
            description: "Retrieve a paginated list of applications",
            tags: ["Applications"],
            security: [{ bearerAuth: [] }],
            parameters: [
              {
                name: "page",
                in: "query",
                schema: { type: "integer", default: 1 },
              },
              {
                name: "limit",
                in: "query",
                schema: { type: "integer", default: 10 },
              },
              {
                name: "status",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: {
              "200": {
                description: "Applications retrieved successfully",
              },
            },
          },
          post: {
            summary: "Submit new application",
            description: "Submit a new DCC application",
            tags: ["Applications"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      phone: { type: "string" },
                      formData: { type: "object" },
                    },
                    required: ["email", "phone", "formData"],
                  },
                },
              },
            },
            responses: {
              "201": {
                description: "Application submitted successfully",
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    }

    return NextResponse.json(openApiSpec)
  } catch (error: any) {
    console.error("API docs error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate API documentation",
        message: error.message,
      },
      { status: 500 },
    )
  }
}
