import express, { Router } from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import prisma from "../server/prisma";

const router: Router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});

const extractLabValue = (text: string, name: string) => {
  const regex = new RegExp(`${name}[:=\s]*([0-9]+\.?[0-9]*)`, "i");
  const match = text.match(regex);
  return match ? parseFloat(match[1]) : undefined;
};

const extractLabValues = async (filePath: string, originalName: string) => {
  let rawText = originalName;

  if (filePath.endsWith(".pdf")) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      const pdfParser = await import("pdf-parse");
      const data = await (pdfParser.default ?? pdfParser)(fileBuffer as Buffer);
      rawText = data.text || rawText;
    } catch (error) {
      console.warn("Failed to parse PDF text", error);
    }
  }

  return {
    tsh: extractLabValue(rawText, "TSH"),
    t3: extractLabValue(rawText, "T3"),
    t4: extractLabValue(rawText, "T4"),
  };
};

const getAiPrediction = (lab_values: { tsh?: number | null; t3?: number | null; t4?: number | null; tpo_antibodies?: number | null; }) => {
  let prediction = "Normal";
  let confidence = 0;
  let notes = "";
  const { tsh, t3, t4, tpo_antibodies } = lab_values;

  if (tsh !== null && tsh !== undefined) {
    if (tsh > 4.0) {
      prediction = "Hypothyroid";
      confidence = Math.min(95, 70 + (tsh - 4.0) * 5);
      notes = `High TSH (${tsh}) indicates reduced thyroid function. `;
    } else if (tsh < 0.4) {
      prediction = "Hyperthyroid";
      confidence = Math.min(95, 70 + (0.4 - tsh) * 50);
      notes = `Low TSH (${tsh}) indicates excessive thyroid activity. `;
    }
  }

  if (t4 !== null && t4 !== undefined) {
    if (t4 < 0.8) {
      if (prediction === "Normal") {
        prediction = "Hypothyroid";
        confidence = 75;
      } else if (prediction === "Hypothyroid") {
        confidence = Math.min(99, confidence + 10);
      }
      notes += `Low Free T4 (${t4}) supports hypothyroidism diagnosis. `;
    } else if (t4 > 1.8) {
      if (prediction === "Normal") {
        prediction = "Hyperthyroid";
        confidence = 75;
      } else if (prediction === "Hyperthyroid") {
        confidence = Math.min(99, confidence + 10);
      }
      notes += `High Free T4 (${t4}) supports hyperthyroidism diagnosis. `;
    }
  }

  if (t3 !== null && t3 !== undefined) {
    if (t3 < 2.3) {
      if (prediction === "Normal") {
        prediction = "Hypothyroid";
        confidence = 70;
      }
      notes += `Low Free T3 (${t3}) may indicate reduced thyroid conversion. `;
    } else if (t3 > 4.2) {
      if (prediction === "Normal") {
        prediction = "Hyperthyroid";
        confidence = 70;
      }
      notes += `High Free T3 (${t3}) may indicate excessive thyroid activity. `;
    }
  }

  if (tpo_antibodies !== null && tpo_antibodies !== undefined) {
    if (tpo_antibodies > 35) {
      notes += `Elevated TPO antibodies (${tpo_antibodies}) suggest autoimmune thyroiditis. `;
      if (prediction !== "Normal") {
        confidence = Math.min(99, confidence + 15);
      }
    }
  }

  if (confidence === 0) {
    confidence = 60;
    notes = "Thyroid values are within normal range. Regular monitoring recommended.";
  }

  return {
    prediction,
    confidence: Math.round(confidence),
    notes: notes.trim(),
  };
};

// Upload medical report
router.post("/reports/upload", upload.single("report"), async (req, res) => {
  try {
    const { patientId, notes } = req.body;
    const tshBody = req.body.tsh ? parseFloat(req.body.tsh) : undefined;
    const t3Body = req.body.t3 ? parseFloat(req.body.t3) : undefined;
    const t4Body = req.body.t4 ? parseFloat(req.body.t4) : undefined;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: patientId }, { userId: patientId }],
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    if (!req.file && tshBody === undefined && t3Body === undefined && t4Body === undefined) {
      return res.status(400).json({ error: "Please upload a report file or provide lab values" });
    }

    let tsh = tshBody ?? null;
    let t3 = t3Body ?? null;
    let t4 = t4Body ?? null;
    let extractedValues = { tsh: null, t3: null, t4: null };
    let filePath: string | null = null;
    let storedFileName = "report";

    if (req.file) {
      filePath = req.file.path;
      storedFileName = req.file.originalname;

      const { tsh: extractedTsh, t3: extractedT3, t4: extractedT4 } = await extractLabValues(filePath, req.file.originalname);

      if (tsh === null && extractedTsh !== undefined) tsh = extractedTsh;
      if (t3 === null && extractedT3 !== undefined) t3 = extractedT3;
      if (t4 === null && extractedT4 !== undefined) t4 = extractedT4;

      extractedValues = {
        tsh: tsh ?? extractedTsh ?? null,
        t3: t3 ?? extractedT3 ?? null,
        t4: t4 ?? extractedT4 ?? null,
      };
    }

    const test = await prisma.medicalTest.create({
      data: {
        patientId: patient.id,
        testType: "Lab Report",
        testDate: new Date(),
        fileName: storedFileName,
        filePath: filePath ? path.relative(process.cwd(), filePath) : null,
        tsh,
        t3,
        t4,
        notes: notes || null,
        ai_prediction: null,
        ai_confidence: null,
        ai_notes: null,
      },
    });

    const fileUrl = test.filePath ? `${req.protocol}://${req.get('host')}/${test.filePath.replace(/\\/g, '/')}` : null;
    const hasLabValues = tsh !== null || t3 !== null || t4 !== null;
    let aiResult = null;

    if (hasLabValues) {
      aiResult = getAiPrediction({ tsh, t3, t4, tpo_antibodies: null });
      const updatedTest = await prisma.medicalTest.update({
        where: { id: test.id },
        data: {
          ai_prediction: aiResult.prediction,
          ai_confidence: aiResult.confidence,
          ai_notes: aiResult.notes,
        },
      });

      return res.status(201).json({
        success: true,
        test: {
          ...updatedTest,
          fileUrl: updatedTest.filePath ? `${req.protocol}://${req.get('host')}/${updatedTest.filePath.replace(/\\/g, '/')}` : null,
        },
        extracted: extractedValues,
        ai: aiResult,
        message: "Report uploaded and analyzed successfully",
      });
    }

    return res.status(201).json({
      success: true,
      test: {
        ...test,
        fileUrl,
      },
      extracted: extractedValues,
      message: "Report uploaded successfully",
    });
  } catch (error) {
    console.error("Report upload error:", error);
    return res.status(500).json({
      error: "Failed to upload report",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get patient's medical tests/reports
router.get("/patient/:patientId/reports", async (req, res) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: patientId }, { userId: patientId }],
      },
    });

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const tests = await prisma.medicalTest.findMany({
      where: { patientId: patient.id },
      orderBy: { testDate: "desc" },
    });

    const response = tests.map((test) => ({
      ...test,
      created_at: test.createdAt.toISOString(),
      fileUrl: test.filePath ? `${req.protocol}://${req.get('host')}/${test.filePath.replace(/\\/g, '/')}` : null,
    }));

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// Get single test
router.get("/tests/:testId", async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await prisma.medicalTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      res.status(404).json({ error: "Test not found" });
      return;
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch test" });
  }
});

// Update test data
router.put("/tests/:testId", async (req, res) => {
  try {
    const { testId } = req.params;
    const { tsh, t3, t4, notes } = req.body;

    const test = await prisma.medicalTest.update({
      where: { id: testId },
      data: {
        tsh: tsh ? parseFloat(tsh) : undefined,
        t3: t3 ? parseFloat(t3) : undefined,
        t4: t4 ? parseFloat(t4) : undefined,
        notes: notes || undefined,
      },
    });

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: "Failed to update test" });
  }
});

// Delete report
router.delete("/tests/:testId", async (req, res) => {
  try {
    const { testId } = req.params;

    await prisma.medicalTest.delete({
      where: { id: testId },
    });

    res.json({ message: "Test deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete test" });
  }
});

export default router;

