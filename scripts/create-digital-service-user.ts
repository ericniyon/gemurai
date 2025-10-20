import { prisma } from '../lib/database'
import bcrypt from "bcryptjs"

const DIGITAL_SERVICE_USER = {
  email: "digital.service@Gemurai.rw",
  password: "digitalservice123!",
  name: "Digital Service Provider",
  phone: "+250780000007",
  avatar: null,
  isActive: true
}

async function main() {
  try {
    console.log("🌱 Creating Digital Service user...")

    const hashedPassword = await bcrypt.hash(DIGITAL_SERVICE_USER.password, 10)
    
    // First, check if the DIGITAL_SERVICE role exists, if not create it
    let digitalServiceRole = await prisma.role.findUnique({
      where: { name: "DIGITAL_SERVICE" }
    })

    if (!digitalServiceRole) {
      console.log("Creating DIGITAL_SERVICE role...")
      digitalServiceRole = await prisma.role.create({
        data: {
          name: "DIGITAL_SERVICE",
          description: "Digital service provider for Irembo, Mobile Money, Canal packages, and other digital solutions",
          isActive: true,
          isSystem: true
        }
      })
      console.log("✅ Created DIGITAL_SERVICE role")
    }

    // Create or update the user
    const user = await prisma.user.upsert({
      where: { email: DIGITAL_SERVICE_USER.email },
      update: {
        name: DIGITAL_SERVICE_USER.name,
        phone: DIGITAL_SERVICE_USER.phone,
        password: hashedPassword,
        isActive: DIGITAL_SERVICE_USER.isActive
      },
      create: {
        ...DIGITAL_SERVICE_USER,
        password: hashedPassword
      }
    })

    console.log(`✅ Created/Updated user:`, user.email)

    // Assign the DIGITAL_SERVICE role to the user
    const roleAssignment = await prisma.userRoleAssignment.upsert({
      where: { userId: user.id },
      update: {
        roleId: digitalServiceRole.id,
        isActive: true
      },
      create: {
        userId: user.id,
        roleId: digitalServiceRole.id,
        isActive: true
      }
    })

    console.log(`✅ Assigned DIGITAL_SERVICE role to user`)

    console.log(`📧 Email: ${DIGITAL_SERVICE_USER.email}`)
    console.log(`🔑 Password: ${DIGITAL_SERVICE_USER.password}`)
    console.log(`📱 Phone: ${DIGITAL_SERVICE_USER.phone}`)
    console.log(`👤 Name: ${DIGITAL_SERVICE_USER.name}`)
    console.log(`🎭 Role: DIGITAL_SERVICE`)
    console.log(`✅ Active: ${DIGITAL_SERVICE_USER.isActive}`)

    console.log("✅ Digital Service user created successfully!")
  } catch (error) {
    console.error("Error creating Digital Service user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
