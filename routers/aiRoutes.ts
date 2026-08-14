import { Router } from 'express';
import prisma from '../server/prisma';

const router = Router();

// AI Thyroid Screening Prediction
router.post('/ai-screening', async (req, res) => {
  try {
    const { lab_values, mode, test_id } = req.body;

    if (!lab_values) {
      return res.status(400).json({ error: 'Lab values are required' });
    }

    const { tsh, t3, t4, tpo_antibodies } = lab_values;

    // AI Prediction Logic
    let prediction = 'Normal';
    let confidence = 0;
    let notes = '';

    // TSH-based prediction (primary indicator)
    if (tsh !== null && tsh !== undefined) {
      if (tsh > 4.0) {
        prediction = 'Hypothyroid';
        confidence = Math.min(95, 70 + (tsh - 4.0) * 5);
        notes = `High TSH (${tsh}) indicates reduced thyroid function. `;
      } else if (tsh < 0.4) {
        prediction = 'Hyperthyroid';
        confidence = Math.min(95, 70 + (0.4 - tsh) * 50);
        notes = `Low TSH (${tsh}) indicates excessive thyroid activity. `;
      }
    }

    // T4 level validation
    if (t4 !== null && t4 !== undefined) {
      if (t4 < 0.8) {
        if (prediction === 'Normal') {
          prediction = 'Hypothyroid';
          confidence = 75;
        } else if (prediction === 'Hypothyroid') {
          confidence = Math.min(99, confidence + 10);
        }
        notes += `Low Free T4 (${t4}) supports hypothyroidism diagnosis. `;
      } else if (t4 > 1.8) {
        if (prediction === 'Normal') {
          prediction = 'Hyperthyroid';
          confidence = 75;
        } else if (prediction === 'Hyperthyroid') {
          confidence = Math.min(99, confidence + 10);
        }
        notes += `High Free T4 (${t4}) supports hyperthyroidism diagnosis. `;
      }
    }

    // T3 level validation
    if (t3 !== null && t3 !== undefined) {
      if (t3 < 2.3) {
        if (prediction === 'Normal') {
          prediction = 'Hypothyroid';
          confidence = 70;
        }
        notes += `Low Free T3 (${t3}) may indicate reduced thyroid conversion. `;
      } else if (t3 > 4.2) {
        if (prediction === 'Normal') {
          prediction = 'Hyperthyroid';
          confidence = 70;
        }
        notes += `High Free T3 (${t3}) may indicate excessive thyroid activity. `;
      }
    }

    // TPO Antibodies (indicates autoimmune thyroid disease)
    if (tpo_antibodies !== null && tpo_antibodies !== undefined) {
      if (tpo_antibodies > 35) {
        notes += `Elevated TPO antibodies (${tpo_antibodies}) suggest autoimmune thyroiditis. `;
        if (prediction !== 'Normal') {
          confidence = Math.min(99, confidence + 15);
        }
      }
    }

    // Default confidence if no prediction was made
    if (confidence === 0) {
      confidence = 60;
      notes = 'Thyroid values are within normal range. Regular monitoring recommended.';
    }

    // Round confidence to nearest integer
    confidence = Math.round(confidence);

    // Update test record with AI results if test_id is provided
    if (test_id) {
      const updatedTest = await prisma.medicalTest.update({
        where: { id: test_id },
        data: {
          ai_prediction: prediction,
          ai_confidence: confidence,
          ai_notes: notes.trim(),
        },
      });

      return res.json({
        success: true,
        prediction,
        confidence,
        notes: notes.trim(),
        test: updatedTest,
      });
    }

    res.json({
      success: true,
      prediction,
      confidence,
      notes: notes.trim(),
    });
  } catch (error) {
    console.error('AI Screening error:', error);
    res.status(500).json({ error: 'AI screening failed' });
  }
});

// Symptom-based AI Screening
router.post('/symptom-screening', async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }

    const age = Number(symptoms.age);
    if (Number.isNaN(age) || age <= 0) {
      return res.status(400).json({ error: 'Valid age is required' });
    }

    const riskFactors: string[] = [];
    let score = 0;

    const addFactor = (flag: boolean, label: string, weight: number) => {
      if (flag) {
        score += weight;
        riskFactors.push(label);
      }
    };

    addFactor(symptoms.neckSwelling === 'yes', 'Neck swelling or lump', 20);
    addFactor(symptoms.previousThyroid === 'yes', 'Previous thyroid diagnosis', 18);
    addFactor(symptoms.weightChange === 'gain', 'Unexplained weight gain', 12);
    addFactor(symptoms.weightChange === 'loss', 'Unexplained weight loss', 12);
    addFactor(symptoms.heartRate === 'slow', 'Slow heart rate', 10);
    addFactor(symptoms.heartRate === 'fast', 'Fast heart rate', 10);
    addFactor(symptoms.temperatureSensitivity === 'cold', 'Cold intolerance', 12);
    addFactor(symptoms.temperatureSensitivity === 'heat', 'Heat intolerance', 12);
    addFactor(symptoms.tirednessLevel?.[0] >= 7, 'High fatigue level', 10);
    addFactor(symptoms.hairLoss === 'yes', 'Hair loss', 10);
    addFactor(symptoms.anxiety === 'yes', 'Anxiety or nervousness', 8);
    addFactor(symptoms.drySkin === 'yes', 'Dry or coarse skin', 8);
    addFactor(symptoms.constipation === 'yes', 'Constipation', 8);
    addFactor(symptoms.diarrhea === 'yes', 'Diarrhea', 6);
    addFactor(symptoms.irregularPeriods === 'yes', 'Irregular menstrual cycles', 8);
    addFactor(symptoms.muscleWeakness === 'yes', 'Muscle weakness', 8);
    addFactor(symptoms.jointPain === 'yes', 'Joint or muscle pain', 6);
    addFactor(symptoms.depression === 'yes', 'Depression or low mood', 6);
    addFactor(age >= 60, 'Age 60 or older', 8);
    addFactor(symptoms.sex === 'female', 'Female sex (higher thyroid risk)', 4);

    const confidence = Math.min(95, Math.max(55, Math.round(45 + score * 0.9)));
    let risk: 'low' | 'moderate' | 'high' = 'low';
    let recommendation = 'Maintain good health habits and watch for any changes. Schedule regular check-ups as needed.';
    let message = 'Your current responses do not strongly indicate thyroid dysfunction.';

    if (score >= 60) {
      risk = 'high';
      message = 'Your responses suggest a higher likelihood of thyroid-related issues.';
      recommendation = 'Consult a healthcare provider soon and request thyroid function tests such as TSH, T3, and T4.';
    } else if (score >= 30) {
      risk = 'moderate';
      message = 'Some of your symptom responses are consistent with thyroid condition risk factors.';
      recommendation = 'Consider discussing these symptoms with your doctor and monitoring thyroid tests.';
    }

    return res.json({
      success: true,
      risk,
      confidence,
      riskScore: score,
      symptoms_noted: riskFactors,
      message,
      recommendation,
    });
  } catch (error) {
    console.error('Symptom screening error:', error);
    res.status(500).json({ error: 'Symptom screening failed' });
  }
});

export default router;
