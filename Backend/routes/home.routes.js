// routes/home.routes.js
import express from 'express';
import homeController from '../controllers/home.controller.js';

const router = express.Router();

// GET /api/home/data
router.get('/data', homeController.getHomeData);

export default router;