import { z } from "zod"

export const LoginRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const RegisterRequestSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "DCC", "EMPLOYER", "CONSUMER"]),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  phone: z.string().optional(),
})

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export const ResetPasswordRequestSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}) 