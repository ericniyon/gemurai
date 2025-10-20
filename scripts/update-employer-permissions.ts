import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEmployerPermissions() {
  try {
    // Update all EMPLOYER users with the new permissions
    const updatedUsers = await prisma.$executeRaw`
      UPDATE users
      SET permissions = ARRAY[
        'applications.view',
        'applications.evaluate',
        'applications.manage',
        'applications.review',
        'products.view',
        'products.create',
        'products.edit',
        'products.delete',
        'products.manage',
        'orders.view',
        'orders.create',
        'orders.manage',
        'learning.view',
        'learning.enroll',
        'jobs.view',
        'jobs.post',
        'jobs.manage',
        'finance.view',
        'finance.request',
        'dashboard.view'
      ]
      WHERE role = 'EMPLOYER'
      RETURNING id, email, role;
    `

    console.log('Successfully updated employer permissions')
    console.log('Updated users:', updatedUsers)

    // Create the trigger function
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION set_employer_permissions()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.role = 'EMPLOYER' THEN
          NEW.permissions = ARRAY[
            'applications.view',
            'applications.evaluate',
            'applications.manage',
            'applications.review',
            'products.view',
            'products.create',
            'products.edit',
            'products.delete',
            'products.manage',
            'orders.view',
            'orders.create',
            'orders.manage',
            'learning.view',
            'learning.enroll',
            'jobs.view',
            'jobs.post',
            'jobs.manage',
            'finance.view',
            'finance.request',
            'dashboard.view'
          ];
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `

    // Create the trigger
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS set_employer_permissions_trigger ON users;
    `

    await prisma.$executeRaw`
      CREATE TRIGGER set_employer_permissions_trigger
        BEFORE INSERT OR UPDATE OF role ON users
        FOR EACH ROW
        EXECUTE FUNCTION set_employer_permissions();
    `

    console.log('Successfully created trigger for automatic permission updates')
  } catch (error) {
    console.error('Error updating employer permissions:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateEmployerPermissions()
  .catch((error) => {
    console.error('Failed to update employer permissions:', error)
    process.exit(1)
  }) 