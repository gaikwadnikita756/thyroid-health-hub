import prisma from "../server/prisma";

async function main() {
  console.log("Seeding database...");

  // Create roles first
  const patientRole = await prisma.userRole.upsert({
    where: { name: "patient" },
    update: {},
    create: { name: "patient" },
  });

  const doctorRole = await prisma.userRole.upsert({
    where: { name: "doctor" },
    update: {},
    create: { name: "doctor" },
  });

  const adminRole = await prisma.userRole.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  console.log("Roles created successfully");
  console.log({ patientRole, doctorRole, adminRole });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seeding completed");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
