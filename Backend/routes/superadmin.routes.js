// routes/superadmin.routes.js
import express from 'express';
const router = express.Router();

import dashboardControllers from '../controllers/superAdminControllers/dashboard.controllers.js';
import analyticsControllers from '../controllers/superAdminControllers/analytics.controllers.js';
import userActivitiesControllers from '../controllers/superAdminControllers/userActivities.controllers.js';
import revenueControllers from '../controllers/superAdminControllers/revenue.controllers.js';
import trendsControllers from '../controllers/superAdminControllers/trends.controllers.js';
import profileControllers from '../controllers/superAdminControllers/profile.controllers.js';
import createAdminController from '../controllers/superAdminControllers/createAdmin.controller.js';
import superadminMiddleware from '../middlewares/superAdmin.middleware.js';

// Dashboard - Overview
router.get("/dashboard", superadminMiddleware, dashboardControllers.getDashboard);

// Analytics - Detailed statistics
router.get("/analytics", superadminMiddleware, analyticsControllers.getAnalytics);

// User Activities - Monitor all user activities
router.get("/user-activities", superadminMiddleware, userActivitiesControllers.getUserActivities);
router.get("/user-details/:id", superadminMiddleware, userActivitiesControllers.getUserDetailsById);

// Revenue - Financial insights
router.get("/revenue", superadminMiddleware, revenueControllers.getRevenueDetails);

// Trends - Current trends and growth
router.get("/trends", superadminMiddleware, trendsControllers.getTrends);

// Profile management
router.get("/profile", superadminMiddleware, profileControllers.getProfile);
router.post("/update-password", superadminMiddleware, profileControllers.updatePassword);

// Create Admin
router.post("/create-admin", superadminMiddleware, createAdminController.createAdmin);

export default router;
