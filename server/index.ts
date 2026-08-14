import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from '../routers/authRoutes';
import healthScreeningRoutes from '../routers/healthScreeningRoutes';
import appointmentRoutes from '../routers/appointmentRoutes';
import reportRoutes from '../routers/reportRoutes';
import aiRoutes from '../routers/aiRoutes';
import patientRoutes from '../routers/patientRoutes';
import adminRoutes from '../routers/adminRoutes';
import doctorRoutes from '../routers/doctorRoutes';
import prisma from './prisma';

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', healthScreeningRoutes);
app.use('/api', appointmentRoutes);
app.use('/api', reportRoutes);
app.use('/api', aiRoutes);
app.use('/api', patientRoutes);
app.use('/api', adminRoutes);
app.use('/api', doctorRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));