import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "Missing DATABASE_URL environment variable. Make sure .env is loaded.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});
const prisma = new PrismaClient({ adapter });
async function main() {
  const demoUserId = "b1a08d32-d38b-4bfb-85a6-c2d504a44dca";
  await prisma.product.createMany({
    data: Array.from({ length: 25 }).map((_, i) => ({
      userId: demoUserId,
      name: `Product ${i + 1}`,
      price: (Math.random() * 90 + 10).toFixed(2),
      quantity: Math.floor(Math.random() * 20),
      lowStackAt: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 5)),
    })),
  });
  console.log("seed data created successfully");
  console.log(`created 25 products for user with id ${demoUserId}`);
}
main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
