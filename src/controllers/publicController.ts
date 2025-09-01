import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getPublicTourByUrl = async (req: Request, res: Response) => {
    try {
        const { uniqueUrl } = req.params;
        const tour = await prisma.tour.findFirst({
            where: {
                uniqueUrl,
                isPublic: true,
            },
            include: {
                steps: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!tour) {
            return res.status(404).json({ message: 'Public tour not found or is no longer available.' });
        }
        res.status(200).json(tour);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching public tour.' });
    }
};