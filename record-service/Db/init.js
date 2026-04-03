import pool from "./connect.js";

const init = async () => {
    try {
        // add forgin key to the finance_records table fron users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS finance_records (
                id SERIAL PRIMARY KEY,
                created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount DECIMAL(10,2) NOT NULL,
                type VARCHAR(255) NOT NULL CHECK (type IN ('income', 'expense')),
                category VARCHAR(255) NOT NULL,
                description VARCHAR(400) NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table created successfully");
    } catch (err) {
        console.log(err.message);
    }
};

export default init;