// Simple function to fetch DCC users
// This can be used in your API routes or server-side code

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Fetch all users with DCC role
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name, email, phone, etc.
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Number of items per page
 * @param {boolean} options.includeProfile - Whether to include DCC profile data
 * @returns {Promise<Object>} - DCC users data with pagination info
 */
async function fetchDCCUsers(options = {}) {
  const {
    search = '',
    page = 1,
    limit = 10,
    includeProfile = false
  } = options

  try {
    const skip = (page - 1) * limit

    // Build where clause
    const whereClause = {
      userRole: {
        role: {
          name: "DCC"
        }
      }
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { national_id: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } }
      ]
    }

    // Build select clause
    const selectClause = {
      id: true,
      name: true,
      email: true,
      phone: true,
      national_id: true,
      gender: true,
      district: true,
      isActive: true,
      createdAt: true,
      userRole: {
        select: {
          role: {
            select: {
              name: true,
              description: true
            }
          },
          assignedAt: true,
          isActive: true
        }
      }
    }

    // Include DCC profile if requested
    if (includeProfile) {
      selectClause.dccProfile = {
        select: {
          level: true,
          rating: true,
          totalSales: true,
          monthlySales: true,
          productsAvailable: true,
          status: true,
          location: true,
          specialties: true
        }
      }
    }

    // Fetch users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: selectClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    }

  } catch (error) {
    console.error('Error fetching DCC users:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get a single DCC user by ID
 * @param {string} userId - User ID
 * @param {boolean} includeProfile - Whether to include DCC profile data
 * @returns {Promise<Object>} - DCC user data
 */
async function getDCCUserById(userId, includeProfile = false) {
  try {
    const selectClause = {
      id: true,
      name: true,
      email: true,
      phone: true,
      national_id: true,
      gender: true,
      district: true,
      isActive: true,
      createdAt: true,
      userRole: {
        select: {
          role: {
            select: {
              name: true,
              description: true
            }
          },
          assignedAt: true,
          isActive: true
        }
      }
    }

    if (includeProfile) {
      selectClause.dccProfile = {
        select: {
          level: true,
          rating: true,
          totalSales: true,
          monthlySales: true,
          productsAvailable: true,
          status: true,
          location: true,
          specialties: true
        }
      }
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        userRole: {
          role: {
            name: "DCC"
          }
        }
      },
      select: selectClause
    })

    if (!user) {
      return {
        success: false,
        error: 'DCC user not found'
      }
    }

    return {
      success: true,
      data: user
    }

  } catch (error) {
    console.error('Error fetching DCC user by ID:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Count total DCC users
 * @param {string} search - Optional search term
 * @returns {Promise<Object>} - Count result
 */
async function countDCCUsers(search = '') {
  try {
    const whereClause = {
      userRole: {
        role: {
          name: "DCC"
        }
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { national_id: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } }
      ]
    }

    const count = await prisma.user.count({ where: whereClause })

    return {
      success: true,
      data: { count }
    }

  } catch (error) {
    console.error('Error counting DCC users:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Example usage:
async function example() {
  console.log('=== Example Usage ===\n')

  // 1. Fetch all DCC users
  console.log('1. Fetching all DCC users:')
  const allUsers = await fetchDCCUsers()
  console.log(`Found ${allUsers.data.users.length} users (${allUsers.data.pagination.total} total)`)

  // 2. Search DCC users
  console.log('\n2. Searching DCC users with "test":')
  const searchResults = await fetchDCCUsers({ search: 'test' })
  console.log(`Found ${searchResults.data.users.length} users matching "test"`)

  // 3. Paginated results
  console.log('\n3. Paginated results (page 1, limit 5):')
  const paginatedResults = await fetchDCCUsers({ page: 1, limit: 5 })
  console.log(`Page ${paginatedResults.data.pagination.page} of ${paginatedResults.data.pagination.totalPages}`)
  console.log(`Users: ${paginatedResults.data.users.map(u => u.name).join(', ')}`)

  // 4. Count DCC users
  console.log('\n4. Counting DCC users:')
  const countResult = await countDCCUsers()
  console.log(`Total DCC users: ${countResult.data.count}`)

  // 5. Get specific DCC user
  if (allUsers.data.users.length > 0) {
    console.log('\n5. Getting specific DCC user:')
    const specificUser = await getDCCUserById(allUsers.data.users[0].id, true)
    console.log(`User: ${specificUser.data.name}`)
    console.log(`Email: ${specificUser.data.email}`)
    console.log(`DCC Profile: ${specificUser.data.dccProfile ? 'Available' : 'Not Available'}`)
  }
}

// Export functions
module.exports = {
  fetchDCCUsers,
  getDCCUserById,
  countDCCUsers
}

// Run example if this file is executed directly
if (require.main === module) {
  example().finally(() => prisma.$disconnect())
}





