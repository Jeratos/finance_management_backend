import pool from "./connect.js";

const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'admin')),
                is_active BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table created successfully");
    } catch (err) {
        console.log(err);
    }
};

export default createTable;