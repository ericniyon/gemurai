import { prisma } from "@/lib/database"
import bcrypt from "bcryptjs"

// User Service
export class UserService {
  static async getAllUsers(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit

    const filter: any = {}
    if (search) {
      filter.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filter,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: filter }),
    ])

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async createUser(data: {
    email: string
    name: string
    password: string
    role?: string
    permissions?: string[]
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    return await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        role: (data.role as any) || "CONSUMER",
        permissions: data.permissions || [],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        createdAt: true,
      },
    })
  }

  static async updateUser(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10)
    }

    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        updatedAt: true,
      },
    })
  }

  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    })
  }

  static async getUsersByRole(role: string) {
    return await prisma.user.findMany({
      where: { role: role as any },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })
  }
}

// Application Service
export class ApplicationService {
  static async getAllApplications(page = 1, limit = 10, status?: string, search = "") {
    const skip = (page - 1) * limit

    const filter: any = {}
    if (status) {
      filter.status = status
    }
    if (search) {
      filter.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: filter,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.count({ where: filter }),
    ])

    return {
      applications,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  static async getApplicationById(id: string) {
    return await prisma.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evaluations: true,
        dccProfile: true,
      },
    })
  }

  static async createApplication(data: {
    email: string
    phone: string
    formData: any
    userId?: string
  }) {
    return await prisma.application.create({
      data: {
        ...data,
        status: "TEMPORARY",
      },
    })
  }

  static async updateApplication(id: string, data: any) {
    return await prisma.application.update({
      where: { id },
      data,
    })
  }

  static async deleteApplication(id: string) {
    return await prisma.application.delete({
      where: { id },
    })
  }

  static async getApplicationsByStatus(status: string) {
    return await prisma.application.findMany({
      where: { status: status as any },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}

// DCC Service
export class DCCService {
  static async getAllDCCs(page = 1, limit = 10, search = "") {
    const skip = (page - 1) * limit

    const filter: any = {}
    if (search) {
      filter.OR = [
        { location: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [dccs, total] = await Promise.all([
      prisma.dccProfile.findMany({
        where: filter,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          application: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.dccProfile.count({ where: filter }),
    ])

    return {
      dccs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  static async getDCCById(id: string) {
    return await prisma.dccProfile.findUnique({
      where: { id },
      include: {
        user: true,
        application: true,
      },
    })
  }

  static async createDCCProfile(data: {
    userId: string
    applicationId: string
    location: string
    level?: string
    specialties?: string[]
  }) {
    return await prisma.dccProfile.create({
      data: {
        ...data,
        level: (data.level as any) || "LEVEL_C",
        specialties: data.specialties || [],
        performance: {},
        recentActivity: [],
      },
    })
  }

  static async updateDCCProfile(id: string, data: any) {
    return await prisma.dccProfile.update({
      where: { id },
      data,
    })
  }
}

// Job Service
export class JobService {
  static async getAllJobs(page = 1, limit = 10, category?: string, search = "") {
    const skip = (page - 1) * limit

    const filter: any = { isActive: true }
    if (category) {
      filter.category = category
    }
    if (search) {
      filter.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.job.count({ where: filter }),
    ])

    return {
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  static async getJobById(id: string) {
    return await prisma.job.findUnique({
      where: { id },
    })
  }

  static async createJob(data: {
    title: string
    description: string
    company: string
    location: string
    salary?: string
    type: string
    category: string
    requirements: any
    benefits?: any
    postedBy: string
  }) {
    return await prisma.job.create({
      data,
    })
  }
}

// Product Service
export class ProductService {
  static async getAllProducts(page = 1, limit = 10, category?: string, search = "", userId?: string, userRole?: string) {
    console.log("ProductService.getAllProducts called with:", { page, limit, category, search, userId, userRole })
    
    try {
      const skip = (page - 1) * limit

      const filter: any = { isActive: true }
      
      // If user is EMPLOYER, only show their products
      if (userRole === "EMPLOYER") {
        filter.sellerId = userId
      }
      
      if (category) {
        filter.category = category
      }
      if (search) {
        filter.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      console.log("Applying database filter:", filter)

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where: filter,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            images: true,
            category: true,
            subcategory: true,
            stock: true,
            status: true,
            sellerId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          }
        }),
        prisma.product.count({ where: filter }),
      ])

      console.log("Successfully fetched products:", {
        count: products.length,
        total,
        pages: Math.ceil(total / limit)
      })

      return {
        products,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      }
    } catch (error) {
      console.error("Error in ProductService.getAllProducts:", error)
      throw error
    }
  }

  static async getProductById(id: string, userId?: string, userRole?: string) {
    console.log("ProductService.getProductById called with:", { id, userId, userRole })
    
    try {
      const filter: any = { id }
      
      // If user is EMPLOYER, only allow access to their products
      if (userRole === "EMPLOYER") {
        filter.sellerId = userId
      }

      const product = await prisma.product.findFirst({
        where: filter,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          images: true,
          category: true,
          subcategory: true,
          stock: true,
          status: true,
          sellerId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      console.log("Product found:", { found: !!product })
      return product
    } catch (error) {
      console.error("Error in ProductService.getProductById:", error)
      throw error
    }
  }

  static async createProduct(data: {
    name: string
    description?: string
    price: number
    category: string
    subcategory?: string
    images?: string[]
    stock?: number
    status?: string
    sellerId: string
  }) {
    console.log("ProductService.createProduct called with:", data)
    
    try {
      const product = await prisma.product.create({
        data: {
          ...data,
          stock: data.stock || 0,
          status: data.status || "active",
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          images: true,
          category: true,
          subcategory: true,
          stock: true,
          status: true,
          sellerId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      console.log("Successfully created product:", { id: product.id, name: product.name })
      return product
    } catch (error) {
      console.error("Error in ProductService.createProduct:", error)
      throw error
    }
  }

  static async updateProduct(id: string, data: {
    name?: string
    description?: string
    price?: number
    category?: string
    subcategory?: string
    images?: string[]
    stock?: number
    status?: string
    isActive?: boolean
  }, userId?: string, userRole?: string) {
    console.log("ProductService.updateProduct called with:", { id, data, userId, userRole })
    
    try {
      const filter: any = { id }
      
      // If user is EMPLOYER, only allow updating their products
      if (userRole === "EMPLOYER") {
        filter.sellerId = userId
      }

      const product = await prisma.product.update({
        where: filter,
        data,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          image: true,
          images: true,
          category: true,
          subcategory: true,
          stock: true,
          status: true,
          sellerId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      })

      console.log("Successfully updated product:", { id: product.id, name: product.name })
      return product
    } catch (error) {
      console.error("Error in ProductService.updateProduct:", error)
      throw error
    }
  }

  static async deleteProduct(id: string, userId?: string, userRole?: string) {
    console.log("ProductService.deleteProduct called with:", { id, userId, userRole })
    
    try {
      const filter: any = { id }
      
      // If user is EMPLOYER, only allow deleting their products
      if (userRole === "EMPLOYER") {
        filter.sellerId = userId
      }

      const product = await prisma.product.delete({
        where: filter,
      })

      console.log("Successfully deleted product:", { id: product.id })
      return product
    } catch (error) {
      console.error("Error in ProductService.deleteProduct:", error)
      throw error
    }
  }
}

// Course Service
export class CourseService {
  static async getAllCourses(page = 1, limit = 10, category?: string, level?: string) {
    const skip = (page - 1) * limit

    const filter: any = { isActive: true }
    if (category) {
      filter.category = category
    }
    if (level) {
      filter.level = level
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where: filter }),
    ])

    return {
      courses,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  static async getCourseById(id: string) {
    return await prisma.course.findUnique({
      where: { id },
    })
  }

  static async createCourse(data: {
    title: string
    description: string
    instructor: string
    duration: string
    level: string
    category: string
    price?: number
  }) {
    return await prisma.course.create({
      data,
    })
  }
}
