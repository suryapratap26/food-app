import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://kspkfood.vercel.app',
  process.env.FRONTENDURL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
  exposedHeaders: ['Authorization', 'Content-Type']
};

export default cors(corsOptions);
