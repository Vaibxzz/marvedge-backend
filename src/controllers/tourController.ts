import { Response } from 'express';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '../lib/prisma'; // This is the ONLY prisma import you need
import { AuthRequest } from '../middlewares/authMiddleware';

// ... (The rest of the file is exactly the same as before)

const tourSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
});

const stepSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
});

const isTourAuthor = async (tourId: string, userId: string) => {
    const tour = await prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour) return 'Tour not found';
    if (tour.authorId !== userId) return 'User not authorized';
    return true;
};

// --- TOUR CONTROLLERS ---

export const createTour = async (req: AuthRequest, res: Response) => {
    try {
        const { title } = tourSchema.parse(req.body);
        const tour = await prisma.tour.create({ data: { title, authorId: req.user!.id } });
        res.status(201).json(tour);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0].message });
        res.status(500).json({ message: 'Server error creating tour' });
    }
};

export const getMyTours = async (req: AuthRequest, res: Response) => {
    const tours = await prisma.tour.findMany({
        where: { authorId: req.user!.id },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { steps: true } } },
    });
    res.status(200).json(tours);
};

export const getTourById = async (req: AuthRequest, res: Response) => {
    const authCheck = await isTourAuthor(req.params.id, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });
    
    const tour = await prisma.tour.findUnique({
        where: { id: req.params.id },
        include: { steps: { orderBy: { order: 'asc' } } },
    });
    res.status(200).json(tour);
};

export const updateTour = async (req: AuthRequest, res: Response) => {
    const authCheck = await isTourAuthor(req.params.id, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });

    try {
        const data = tourSchema.partial().parse(req.body);
        const updatedTour = await prisma.tour.update({ where: { id: req.params.id }, data });
        res.status(200).json(updatedTour);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0].message });
        res.status(500).json({ message: 'Server error updating tour' });
    }
};

export const deleteTour = async (req: AuthRequest, res: Response) => {
    const authCheck = await isTourAuthor(req.params.id, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });
    
    await prisma.tour.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Tour deleted successfully' });
};

export const publishTour = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { isPublic } = req.body;

    const authCheck = await isTourAuthor(id, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });

    try {
        let uniqueUrl = null;
        if (isPublic) {
            uniqueUrl = nanoid(10);
        }

        const updatedTour = await prisma.tour.update({
            where: { id },
            data: { isPublic, uniqueUrl },
        });

        res.status(200).json(updatedTour);
    } catch (error) {
        res.status(500).json({ message: 'Server error while updating tour status' });
    }
};

// --- STEP CONTROLLERS ---

export const addStepToTour = async (req: AuthRequest, res: Response) => {
    const { tourId } = req.params;
    const authCheck = await isTourAuthor(tourId, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });
    
    try {
        const { title, content, imageUrl } = stepSchema.parse(req.body);
        const lastStep = await prisma.step.findFirst({ where: { tourId }, orderBy: { order: 'desc' } });
        const newOrder = lastStep ? lastStep.order + 1 : 1;
        
        const newStep = await prisma.step.create({ 
            data: { 
                title,
                content,
                imageUrl,
                tourId, 
                order: newOrder 
            } 
        });
        res.status(201).json(newStep);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0].message });
        res.status(500).json({ message: 'Server error adding step' });
    }
};

export const updateStep = async (req: AuthRequest, res: Response) => {
    const { tourId, stepId } = req.params;
    const authCheck = await isTourAuthor(tourId, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });

    try {
        const data = stepSchema.partial().parse(req.body);
        const updatedStep = await prisma.step.update({ where: { id: stepId }, data });
        res.status(200).json(updatedStep);
    } catch (error) {
        if (error instanceof z.ZodError) return res.status(400).json({ message: error.issues[0].message });
        res.status(500).json({ message: 'Server error updating step' });
    }
};

export const deleteStep = async (req: AuthRequest, res: Response) => {
    const { tourId, stepId } = req.params;
    const authCheck = await isTourAuthor(tourId, req.user!.id);
    if (authCheck !== true) return res.status(authCheck === 'Tour not found' ? 404 : 403).json({ message: authCheck });
    
    await prisma.step.delete({ where: { id: stepId } });
    res.status(200).json({ message: 'Step deleted successfully' });
};