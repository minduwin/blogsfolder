import express from 'express';
const app = express();
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import session from 'express-session';
import passport from 'passport';
import 'dotenv/config';
import cors from 'cors';
import myRouter from './routes/myrouter.js';
import configurePassport from './config/passport.js'

const port = process.env.PORT || 5000;

// Adapter to use views directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
].filter(Boolean);

// Enable CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS.'));
  },
  credentials: true,
}));

// Needs to parse incoming body data first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Then set up sessions and passport
app.use(session({ secret: process.env.SESSION_SECRET || 'dev-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);

// Global middleware to access local variable as user
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use('/api', myRouter);

app.listen(port, (error) => {
    if (error) {
        throw error;
    }

    console.log(`Listening on port ${port}`);
});