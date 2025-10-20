import { z } from "zod"

// Base response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
})

export const PaginatedMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
})

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string().optional(),
  details: z.any().optional(),
})

// Authentication schemas
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const LoginResponseSchema = ApiResponseSchema.extend({
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      role: z.string(),
    }),
  }),
})

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.string(),
  permissions: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "STAFF", "CONSUMER", "PROVIDER"]),
  permissions: z.array(z.string()).optional(),
})

// Application schemas
export const ApplicationSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string(),
  status: z.string(),
  formData: z.record(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateApplicationRequestSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string(),
  formData: z.record(z.any()),
})

// DCC schemas
export const DCCProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  location: z.object({
    province: z.string(),
    district: z.string(),
    sector: z.string(),
    cell: z.string().optional(),
    village: z.string().optional(),
  }),
  services: z.array(z.string()),
  status: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// API Documentation object
export const apiDocumentation = {
  openapi: "3.0.0",
  info: {
    title: "Gemurai Platform API",
    version: "1.0.0",
    description:
      "API documentation for the Gemurai Platform - A comprehensive platform for Digital Community Centers in Rwanda",
    contact: {
      name: "Gemurai Support",
      email: "support@Gemurai.rw",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "Gemurai API Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "User login",
        description: "Authenticate user and return JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
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
          400: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        description: "Retrieve a paginated list of users",
        security: [{ BearerAuth: [] }],
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
          200: {
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
                          createdAt: { type: "string" },
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
        tags: ["Users"],
        summary: "Create new user",
        description: "Create a new user account",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  password: { type: "string", minLength: 8 },
                  role: {
                    type: "string",
                    enum: ["ADMIN", "STAFF", "CONSUMER", "PROVIDER"],
                  },
                },
                required: ["email", "name", "password", "role"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created successfully",
          },
          400: {
            description: "Invalid input data",
          },
        },
      },
    },
    "/api/v1/applications": {
      get: {
        tags: ["Applications"],
        summary: "Get all applications",
        description: "Retrieve a paginated list of applications",
        security: [{ BearerAuth: [] }],
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
          200: {
            description: "Applications retrieved successfully",
          },
        },
      },
      post: {
        tags: ["Applications"],
        summary: "Submit new application",
        description: "Submit a new DCC application",
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
          201: {
            description: "Application submitted successfully",
          },
        },
      },
    },
  },
}
