import express, { Router } from "express";
import prisma from "../server/prisma";

const router: Router = express.Router();

// Get admin analytics
router.get("/admin/reports", async (req, res) => {
  try {
    const reports = await prisma.healthReport.findMany({
      select: {
        ai_prediction: true,
        createdAt: true,
      },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get all users for admin
router.get("/admin/users", async (req, res) => {
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

export default router;