import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// Production URL from env (e.g. https://lto-ims.vercel.app)
const CLIENT_URL = (process.env.CLIENT_URL || '').replace(/\/$/, '');

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman)
    if (!origin) return callback(null, true);

    const isLocalhost = origin === 'http://localhost:5173';
    const isProductionURL = CLIENT_URL && origin === CLIENT_URL;
    // Allow ALL Vercel preview deployments for this project automatically
    const isVercelPreview = /\.vercel\.app$/.test(origin);

    if (isLocalhost || isProductionURL || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// All API routes
app.use('/api', routes);

// Only listen when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;