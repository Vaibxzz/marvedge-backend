import express = require('express');
import { Request, Response, NextFunction } from 'express';
import * as dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import tourRoutes from './routes/tourRoutes';
import publicRoutes from './routes/publicRoutes';

dotenv.config();

const app = express();

// --- START: CORRECTED CORS MIDDLEWARE ---
app.use((req: Request, res: Response, next: NextFunction) => {
    // This now reads the correct URL from your Render Environment Variables
    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', origin);
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});
// --- END: CORRECTED CORS MIDDLEWARE ---


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/public', publicRoutes);

export default app;