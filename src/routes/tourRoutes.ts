import express = require('express');
import { protect } from '../middlewares/authMiddleware';
import {
    createTour,
    getMyTours,
    getTourById,
    updateTour,
    deleteTour,
    addStepToTour,
    updateStep,
    deleteStep,
    publishTour, // <-- Ensure this is imported
} from '../controllers/tourController';

const router = express.Router();

router.use(protect); // Protect all routes in this file

router.route('/')
    .post(createTour)
    .get(getMyTours);

router.route('/:id')
    .get(getTourById)
    .put(updateTour)
    .delete(deleteTour);

// Add the new route for publishing
router.route('/:id/publish').patch(publishTour);

router.route('/:tourId/steps')
    .post(addStepToTour);

router.route('/:tourId/steps/:stepId')
    .put(updateStep)
    .delete(deleteStep);

export default router;