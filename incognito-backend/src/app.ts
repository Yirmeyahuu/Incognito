import express, { Application } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration with proper typing
const corsOptions: CorsOptionsDelegate = (req, callback) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, { origin: true });
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;