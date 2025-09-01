import express = require('express');
import { Request, Response, NextFunction } from 'express'; // <-- Added NextFunction
import * as dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import tourRoutes from './routes/tourRoutes';
import publicRoutes from './routes/publicRoutes';

dotenv.config();

const app = express();

// --- START: CUSTOM CORS MIDDLEWARE ---
// We are replacing the `cors` package with this manual configuration.
app.use((req: Request, res: Response, next: NextFunction) => {
    // Set the origin to allow your frontend to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    
    // Set the allowed HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    
    // Set the allowed headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Allow credentials (for cookies, auth headers, etc.)
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Handle the preflight 'OPTIONS' request
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});
// --- END: CUSTOM CORS MIDDLEWARE ---


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/public', publicRoutes);

export default app;