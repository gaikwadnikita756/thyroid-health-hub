import express, { Router } from "express";
import prisma from "../server/prisma";

const router: Router = express.Router();

// Get patient profile
router.get("/patient/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { userId: id },
      select: {
        fullName: true,
        age: true,
        gender: true,
        phoneNumber: true,
        medical_history: true,
      },
    });
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient profile" });
  }
});

// Update patient profile
router.put("/patient/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, age, gender, phoneNumber, medical_history } = req.body;

    const patient = await prisma.patient.update({
      where: { userId: id },
      data: {
        fullName,
        age,
        gender,
        phoneNumber,
        medical_history,
      },
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: "Failed to update patient profile" });
  }
});

// Get patient reports
router.get("/patient/:id/reports", async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await prisma.healthReport.findMany({
      where: { patientId: id },
      include: {
        aiPrediction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch patient reports" });
  }
});

export default router;