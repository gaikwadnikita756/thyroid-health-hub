import express, { Router } from "express";
import prisma from "../server/prisma";

const router: Router = express.Router();

// Get all health screenings
router.get("/screenings", async (req, res) => {
  try {
    const screenings = await prisma.healthScreening.findMany({
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenings" });
  }
});

// Get screenings for a patient
router.get("/patients/:patientId/screenings", async (req, res) => {
  try {
    const { patientId } = req.params;
    const screenings = await prisma.healthScreening.findMany({
      where: { patientId },
    });
    res.json(screenings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch screenings" });
  }
});

// Create new health screening
router.post("/screenings", async (req, res) => {
  try {
    const { patientId, symptoms, riskLevel, recommendation, aiAnalysis } = req.body;

    if (!patientId) {
      res.status(400).json({ error: "patientId is required" });
      return;
    }

    const screening = await prisma.healthScreening.create({
      data: {
        patientId,
        screeningDate: new Date(),
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        riskLevel: riskLevel || "low",
        recommendation,
        aiAnalysis,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });
    res.status(201).json(screening);
  } catch (error) {
    res.status(500).json({ error: "Failed to create screening" });
  }
});

// Get symptoms for a patient
router.get("/patients/:patientId/symptoms", async (req, res) => {
  try {
    const { patientId } = req.params;
    const symptoms = await prisma.symptom.findMany({
      where: { patientId },
    });
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch symptoms" });
  }
});

// Add symptom for a patient
router.post("/symptoms", async (req, res) => {
  try {
    const { patientId, name, severity, duration, startDate, notes } = req.body;

    if (!patientId || !name) {
      res.status(400).json({ error: "patientId and name are required" });
      return;
    }

    const symptom = await prisma.symptom.create({
      data: {
        patientId,
        name,
        severity: severity || "mild",
        duration,
        startDate: startDate ? new Date(startDate) : null,
        notes,
      },
    });
    res.status(201).json(symptom);
  } catch (error) {
    res.status(500).json({ error: "Failed to create symptom" });
  }
});

// Get medical tests for a patient
router.get("/patients/:patientId/tests", async (req, res) => {
  try {
    const { patientId } = req.params;
    const tests = await prisma.medicalTest.findMany({
      where: { patientId },
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tests" });
  }
});

// Add medical test for a patient
router.post("/tests", async (req, res) => {
  try {
    const { patientId, testName, testDate, result, normalRange, unit, notes } = req.body;

    if (!patientId || !testName) {
      res.status(400).json({ error: "patientId and testName are required" });
      return;
    }

    const test = await prisma.medicalTest.create({
      data: {
        patientId,
        testName,
        testDate: new Date(testDate),
        result,
        normalRange,
        unit,
        notes,
      },
    });
    res.status(201).json(test);
  } catch (error) {
    res.status(500).json({ error: "Failed to create test" });
  }
});

export default router;
