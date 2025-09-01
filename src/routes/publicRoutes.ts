import express = require('express');
import { getPublicTourByUrl } from '../controllers/publicController';
const router = express.Router();

router.get('/tours/:uniqueUrl', getPublicTourByUrl);

export default router;