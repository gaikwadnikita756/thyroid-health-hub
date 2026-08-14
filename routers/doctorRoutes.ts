import express, { Router } from "express";
import prisma from "../server/prisma";

const router: Router = express.Router();

// Get reports for doctor
router.get("/doctor/reports", async (req, res) => {
  try {
    const reports = await prisma.healthReport.findMany({
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        aiPrediction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Update report status and notes
router.put("/tests/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctor_notes } = req.body;

    const report = await prisma.healthReport.update({
      where: { id },
      data: {
        status,
        doctor_notes,
      },
    });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to update report" });
  }
});

export default router;