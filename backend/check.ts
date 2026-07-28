import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const dias = await prisma.diaSinClases.findMany({ orderBy: { fecha: 'asc' } });
  console.log('DiasSinClases:', JSON.stringify(dias, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  const now = new Date();
  console.log('Server now:', now.toISOString(), '| Local:', now.toString());
  console.log('getUTCDay:', now.getUTCDay(), '| getDay:', now.getDay());
  console.log('getUTCDate:', now.getUTCDate(), '| getDate:', now.getDate());
  await prisma.$disconnect();
}
main();
