import { UserRole } from './auth'

export interface TestCredential {
  email: string
  password: string
  name: string
  role: UserRole
  permissions: string[]
}

export const TEST_CREDENTIALS = {
  DCC: {
    email: "dcc@example.com",
    password: "dcc123!",
    name: "DCC User",
    role: "DCC"
  },
  EMPLOYER: {
    email: "employer@example.com",
    password: "employer123!",
    name: "Employer User",
    role: "EMPLOYER"
  },
  CONSUMER: {
    email: "consumer@example.com",
    password: "consumer123!",
    name: "Consumer User",
    role: "CONSUMER"
  }
} as const 