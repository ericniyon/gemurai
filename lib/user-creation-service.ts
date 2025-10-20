import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"
import { getErrorMessage } from "@/lib/utils"

export interface UserCreationData {
  email: string
  name: string
  phone: string
  role: "DCC" | "CONSUMER"
  applicationId: string
  formData: any
}

export interface UserCreationResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
    tempPassword?: string
  }
  error?: string
  passwordResetToken?: string
}

export class UserCreationService {
  /**
   * Create a user account automatically after application submission
   */
  static async createUserFromApplication(data: UserCreationData): Promise<UserCreationResult> {
    try {
      console.log("Creating user from application:", data.email)

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        console.log("User already exists:", data.email)
        return {
          success: false,
          error: "User account already exists with this email address",
        }
      }

      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword()
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Determine user permissions based on role
      const permissions = this.getUserPermissions(data.role)

      // Create the user
      const newUser = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          password: hashedPassword,
          role: data.role,
          permissions: permissions,
          isActive: true,
        },
      })

      // Update application to link with user
      await prisma.application.update({
        where: { id: data.applicationId },
        data: {
          userId: newUser.id,
          status: "APPROVED", // Mark as approved since user account is created
        },
      })

      // Remove automatic DCC profile creation
      // DCC profiles are only created when manually approved by admin
      // if (data.role === "DCC") {
      //   await this.createDCCProfile(newUser.id, data.applicationId, data.formData)
      // }

      // Generate password reset token for account setup
      const resetToken = await this.generatePasswordResetToken(data.email)

      console.log("User created successfully:", newUser.id)

      return {
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          tempPassword: tempPassword,
        },
        passwordResetToken: resetToken,
      }
    } catch (error) {
      console.error("Error creating user from application:", error)
      return {
        success: false,
        error: getErrorMessage(error),
      }
    }
  }

  /**
   * Generate a secure temporary password
   */
  private static generateTemporaryPassword(): string {
    const length = 12
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let password = ""

    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
    password += "0123456789"[Math.floor(Math.random() * 10)]
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)]
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("")
  }

  /**
   * Get user permissions based on role
   */
  private static getUserPermissions(role: "DCC" | "CONSUMER"): string[] {
    if (role === "DCC") {
      // DCC permissions (only assigned manually by admin)
      return [
        "dashboard.view",
        "products.view",
        "products.purchase",
        "orders.view",
        "orders.create",
        "learning.view",
        "learning.enroll",
        "jobs.view",
        "jobs.apply",
        "finance.view",
        "finance.request",
        "profile.view",
        "profile.edit",
        "dcc.dashboard",
        "dcc.services",
        "stock.create",
        "sales.create",
        "sales.view"
      ]
    } else {
      // Consumer permissions (default for all auto-created accounts)
      return [
        "dashboard.view",
        "products.view",
        "products.purchase",
        "orders.view",
        "orders.create",
        "learning.view",
        "learning.enroll",
        "profile.view",
        "profile.edit",
      ]
    }
  }

  /**
   * Create DCC profile for DCC users
   */
  private static async createDCCProfile(userId: string, applicationId: string, formData: any) {
    try {
      // Extract location from form data
      const location = [formData.province, formData.district, formData.sector, formData.cell, formData.village]
        .filter(Boolean)
        .join(", ")

      // Extract specialties from form data (if available)
      const specialties = formData.specialties || formData.skills || []

      await prisma.dCCProfile.create({
        data: {
          userId: userId,
          applicationId: applicationId,
          location: location || "Not specified",
          level: "LEVEL_C", // Default level
          specialties: Array.isArray(specialties) ? specialties : [],
          performance: {},
          recentActivity: [],
        },
      })

      console.log("DCC profile created for user:", userId)
    } catch (error) {
      console.error("Error creating DCC profile:", error)
      // Don't throw error here as user creation was successful
    }
  }

  /**
   * Generate password reset token
   */
  private static async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

      await prisma.passwordReset.create({
        data: {
          email: email,
          token: token,
          expiresAt: expiresAt,
          used: false,
        },
      })

      return token
    } catch (error) {
      console.error("Error generating password reset token:", error)
      throw error
    }
  }

  /**
   * Send welcome email with account setup instructions
   */
  static async sendWelcomeEmail(
    email: string,
    name: string,
    role: "DCC" | "CONSUMER",
    tempPassword: string,
    resetToken: string,
  ): Promise<boolean> {
    try {
      const setupUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/set-password?email=${encodeURIComponent(email)}&token=${resetToken}`

      const response = await fetch("/api/email/account-created", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          role,
          tempPassword,
          setupUrl,
        }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Error sending welcome email:", error)
      return false
    }
  }

  /**
   * Determine user role based on application data
   * Note: All auto-created accounts get Consumer role
   * DCC role requires manual admin review and approval
   */
  static determineUserRole(formData: any): "DCC" | "CONSUMER" {
    // Always return CONSUMER for auto-created accounts
    // DCC role requires manual admin review
    return "CONSUMER"
  }

  /**
   * Upgrade a Consumer user to DCC role (admin only)
   */
  static async upgradeUserToDCC(userId: string, applicationId: string, formData: any): Promise<UserCreationResult> {
    try {
      console.log("Upgrading user to DCC role:", userId)

      // Update user role and permissions
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: "DCC",
          permissions: this.getUserPermissions("DCC"),
        },
      })

      // Create DCC profile
      await this.createDCCProfile(userId, applicationId, formData)

      // Update application status
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: "APPROVED_DCC",
        },
      })

      console.log("User upgraded to DCC successfully:", userId)

      return {
        success: true,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
        },
      }
    } catch (error) {
      console.error("Error upgrading user to DCC:", error)
      return {
        success: false,
        error: getErrorMessage(error),
      }
    }
  }
}
