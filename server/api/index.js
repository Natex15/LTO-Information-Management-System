import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// All API routes
app.use('/api', routes);

// Export for Vercel Serverless Functions
export default app;
