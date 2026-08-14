import express, { Router } from "express";
import prisma from "../server/prisma";

const router: Router = express.Router();

// Get all appointments
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
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
        doctor: {
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
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get appointments for a patient
router.get("/patients/:patientId/appointments", async (req, res) => {
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

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
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
      orderBy: { appointmentDate: 'desc' },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get appointments for a doctor
router.get("/doctors/:doctorId/appointments", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await prisma.doctor.findFirst({
      where: {
        OR: [{ id: doctorId }, { userId: doctorId }],
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { doctorId: doctor.id },
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
      orderBy: { appointmentDate: 'desc' },
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Create new appointment
router.post("/appointments", async (req, res) => {
  try {
    const { patientId, appointmentDate, reason } = req.body;

    if (!patientId || !appointmentDate) {
      res.status(400).json({ error: "patientId and appointmentDate are required" });
      return;
    }

    const patient = await prisma.patient.findFirst({
      where: {
        OR: [{ id: patientId }, { userId: patientId }],
      },
    });

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const defaultDoctor = await prisma.doctor.findFirst();
    if (!defaultDoctor) {
      res.status(400).json({ error: "No doctors available" });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: defaultDoctor.id,
        appointmentDate: new Date(appointmentDate),
        reason,
        status: "requested",
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
        doctor: {
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
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// Update appointment status and schedule details
router.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, appointmentDate } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
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
        doctor: {
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
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Delete appointment
router.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({
      where: { id },
    });
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

export default router;
