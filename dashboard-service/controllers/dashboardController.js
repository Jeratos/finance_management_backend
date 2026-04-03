import pool from "../Db/connect.js";
import jwt from "jsonwebtoken";

const secret = 'finance_management_saas_proj';

export const getDashboardData = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decodedToken = jwt.verify(token, secret);
        const userrole = decodedToken.role;
        // Parallel queries for better performance


       if(userrole!="admin" && userrole!="viewer" && userrole!="analyst"){
        return res.status(401).json({ error: "Unauthorized" });
       }

        const [
            incomeRes,
            expenseRes,
            categoryRes,
            recentActivityRes,
            monthlyTrendsRes
        ] = await Promise.all([
            pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM finance_records WHERE type = 'income'"),
            pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM finance_records WHERE type = 'expense'"),
            pool.query("SELECT category, type, SUM(amount) AS total FROM finance_records GROUP BY category, type ORDER BY total DESC"),
            pool.query("SELECT * FROM finance_records ORDER BY date DESC, created_at DESC LIMIT 10"),
            pool.query(`
                SELECT TO_CHAR(date, 'YYYY-MM') AS month, type, SUM(amount) AS total 
                FROM finance_records 
                GROUP BY TO_CHAR(date, 'YYYY-MM'), type 
                ORDER BY month ASC
            `)
        ]);

        // Calculate totals and net balance
        const totalIncome = parseFloat(incomeRes.rows[0].total) || 0;
        const totalExpenses = parseFloat(expenseRes.rows[0].total) || 0;
        const netBalance = totalIncome - totalExpenses;

        // Structure the response payload
        res.status(200).json({
            message: "Dashboard summary fetched successfully",
            summary: {
                totalIncome,
                totalExpenses,
                netBalance
            },
            categoryWiseTotals: categoryRes.rows,
            recentActivity: recentActivityRes.rows,
            monthlyTrends: monthlyTrendsRes.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}

