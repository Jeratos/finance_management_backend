import pool from "../DB/connect.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const secret = 'finance_management_saas_proj';

// register
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *";
        const user = await pool.query(query, [name, email, hashedPassword]);

        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, secret, { expiresIn: "1h" });
        const userData = user.rows[0]
        res.status(200).json({ email: userData.email, role: userData.role, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}

// login
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const query = "SELECT * FROM users WHERE email = $1";
        const user = await pool.query(query, [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, secret, { expiresIn: "1h" });
        const userData = user.rows[0]
        res.status(200).json({ email: userData.email, role: userData.role, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}


// reset-password
export async function resetPassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, secret);
        const id = decodedToken.id;
        const query = "SELECT * FROM users WHERE id = $1";
        const user = await pool.query(query, [id]);
        const isPasswordValid = await bcrypt.compare(currentPassword, user.rows[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid current password" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const query1 = "UPDATE users SET password = $1 WHERE id = $2 RETURNING *";
        const user1 = await pool.query(query1, [hashedPassword, id]);
        res.status(200).json({message:"Password reset successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}

// edit-own-user
export async function editOwnUser(req, res) {
    try {
        const { name, email } = req.body;
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, secret);
        const id = decodedToken.id;
        // check email exist or not
        const query1 = "SELECT * FROM users WHERE email = $1";
        const user1 = await pool.query(query1, [email]);
        if (user1.rows.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const query = "UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *";
        const user = await pool.query(query, [name, email, id]);
        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}


// admin-control-get-all-users

export async function adminControlGetAllUsers(req, res) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, secret);
        if (decodedToken.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const query = "SELECT * FROM users";
        const users = await pool.query(query);
        res.status(200).json(users.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}

// admin-control-delete-user

export async function adminControlDeleteUser(req, res) {
    try {
        const { id,delete_user } = req.query;
        

        if(delete_user === "true" && id){
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, secret);
            if (decodedToken.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }
            if(id === decodedToken.id){
                return res.status(400).json({ message: "You cannot delete yourself" });
            }
            const query = "DELETE FROM users WHERE id = $1 RETURNING *";
            const user = await pool.query(query, [id]);
            return res.status(200).json({message:"User deleted successfully",user:user.rows[0]});
        }else{
            return res.status(400).json({ message: "Invalid request" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}


// admin-edit-role

export async function adminEditRole(req, res) {
    try {
        const { id, role } = req.body;
        const {change_role} = req.query;

        if(change_role=="true" && id){
            const token = req.headers.authorization.split(" ")[1];
            const decodedToken = jwt.verify(token, secret);
            if (decodedToken.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" });
            }
            if(id === decodedToken.id){
                return res.status(400).json({ message: "You cannot change your own role" });
            }
            if(role == "viewer" || role == "analyst" || role == "admin"){
                const query = "UPDATE users SET role = $1 WHERE id = $2 RETURNING *";
                const user = await pool.query(query, [role, id]);
                return res.status(200).json({message:"User role updated successfully",user:user.rows[0]});
            }else{
                return res.status(400).json({ message: "Invalid role" });
            }
        }else{
            return res.status(400).json({ message: "Invalid request" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error", message: error.message });
    }
}
