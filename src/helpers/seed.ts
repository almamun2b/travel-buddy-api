import { UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { env } from "../config/env";
import prisma from "../shared/prisma";

const seedAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (existingAdmin) {
      console.log("Admin already exists!");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      "admin123",
      parseInt(env.bcryptSaltRound)
    );

    const adminData = await prisma.user.create({
      data: {
        email: env.superAdmin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        fullName: env.superAdmin.fullName,
        contactNumber: env.superAdmin.contactNumber,
      },
    });

    console.log("Admin Created Successfully!", adminData);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
};

export default seedAdmin;
