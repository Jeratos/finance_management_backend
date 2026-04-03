import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";

const router = express.Router();

// Provide APIs or backend logic that can return summary level data for a dashboard.

// Examples include:

// Total income
// Total expenses
// Net balance
// Category wise totals
// Recent activity
// Monthly or weekly trends

router.route("/get-dashboard-data").get(getDashboardData);

export default router;