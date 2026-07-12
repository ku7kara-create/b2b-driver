import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@b2b-driver.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@b2b-driver.com",
      phone: "+218000000000",
      passwordHash,
      role: "admin",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@example.com",
      phone: "+218000000001",
      passwordHash,
      role: "customer",
    },
  });

  const driverUser = await prisma.user.upsert({
    where: { email: "driver@example.com" },
    update: {},
    create: {
      name: "Test Driver",
      email: "driver@example.com",
      phone: "+218000000002",
      passwordHash,
      role: "driver",
    },
  });

  await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      subscriptionStatus: "active",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isAvailable: true,
      currentLat: 32.8872,
      currentLng: 13.1913,
      rating: 4.8,
    },
  });

  console.log("Database seeded successfully");
  console.log({ admin: admin.email, customer: customer.email, driver: driverUser.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
