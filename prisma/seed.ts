import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.review.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@b2b-driver.com",
      phone: "+218000000000",
      passwordHash,
      role: "admin",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Test Customer",
      email: "customer@example.com",
      phone: "+218000000001",
      passwordHash,
      role: "customer",
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      name: "Ahmed Al-Sarawi",
      email: "driver@example.com",
      phone: "+218912345678",
      passwordHash,
      role: "driver",
    },
  });

  const driverProfile = await prisma.driver.create({
    data: {
      userId: driverUser.id,
      subscriptionStatus: "active",
      subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isAvailable: true,
      currentLat: 32.8872,
      currentLng: 13.1913,
      rating: 4.8,
      idNumber: "119850123456",
      licenseType: "public_light",
    },
  });

  await prisma.vehicle.create({
    data: {
      driverId: driverProfile.id,
      type: "car",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      plateNumber: "5-12345",
    },
  });

  console.log("Database seeded successfully");
  console.log({
    admin: { phone: admin.phone, role: admin.role },
    customer: { phone: customer.phone, role: customer.role },
    driver: { phone: driverUser.phone, role: driverUser.role },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
