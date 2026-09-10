import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const api = await prisma.api.findUnique({
    where: { slug: 'jsonplaceholder-test' }
  });
  console.log('API:', api);

  if (api) {
    const keys = await prisma.apiKey.findMany({
      where: { apiId: api.id }
    });
    console.log('Keys:', keys);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
