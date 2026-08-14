import express, { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../server/prisma";

const router: Router = express.Router();

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: {
          select: {
            name: true,
          },
        },
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create new user with role
router.post("/users", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !fullName || !role || !password) {
      res.status(400).json({ error: "email, fullName, role, and password are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    // Get role ID
    let roleRecord = await prisma.userRole.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      roleRecord = await prisma.userRole.create({
        data: { name: role },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        roleId: roleRecord.id,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // If role is patient or doctor, create the related profile
    if (role === "patient") {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === "doctor") {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          licenseNumber: `TEMP-${user.id}`,
        },
      });
    } else if (role === "admin") {
      await prisma.admin.create({
        data: {
          userId: user.id,
        },
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName || undefined,
        email: email || undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id },
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get doctors list
router.get("/doctors/list/all", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
});

// Get dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const totalPatients = await prisma.patient.count();
    const totalDoctors = await prisma.doctor.count();
    const totalAppointments = await prisma.appointment.count();
    const totalScreenings = await prisma.healthScreening.count();

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalScreenings,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        password: true,
        roleId: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: {
        name: user.role.name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
});

export default router;
