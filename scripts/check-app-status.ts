import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const app = await prisma.application.findFirst({
    where: {
      OR: [
        { id: 'APP-1751971373611-6iuqvah' },
        { formData: { path: ['ID'], equals: 'APP-1751971373611-6iuqvah' } }
      ]
    },
    select: { id: true, status: true }
  });
  if (app) {
    console.log('ID:', app.id, 'Status:', app.status);
  } else {
    console.log('Not found');
  }
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 