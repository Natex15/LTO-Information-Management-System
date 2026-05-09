import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';

const app = express();

// Support comma-separated origins, e.g.:
// CLIENT_URL=https://lto-ims.vercel.app,https://lto-abc123-user-projects.vercel.app
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(o => o.trim().replace(/\/$/, ''))
    : []),
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
