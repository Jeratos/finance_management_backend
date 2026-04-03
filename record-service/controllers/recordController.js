import pool from "../Db/connect.js";
import jwt from "jsonwebtoken";

const secret = "finance_management_saas_proj";

export const createRecord = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret);
    const created_by = decodedToken.id;
    if (decodedToken.role == "admin") {
      if (type == "income" || type == "expense") {
        const query =
          "INSERT INTO finance_records (amount,created_by, type, category, description, date) VALUES ($1, $2, $3, $4, $5 , $6) RETURNING *";
        const record = await pool.query(query, [
          amount,
          created_by,
          type,
          category,
          description,
          date,
        ]);
        return res
          .status(200)
          .json({
            message: "Record created successfully",
            record: record.rows[0],
          });
      }
      return res.status(400).json({ message: "Invalid type" });
    }
    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export const getAllRecords = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret);

    if (decodedToken.role == "admin" || decodedToken.role == "analyst") {
      const query = "SELECT * FROM finance_records";
      const get_name_query = "SELECT name FROM users WHERE id = $1";
      const records = await pool.query(query);
      for (let i = 0; i < records.rows.length; i++) {
        const name_of_creater_result = await pool.query(get_name_query, [
          records.rows[i].created_by,
        ]);
        records.rows[i].name_of_creater = name_of_creater_result.rows[0].name;
      }
      return res
        .status(200)
        .json({
          message: "Records fetched successfully",
          records: records.rows,
        });
    }
    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, created_by, type, category, description, date } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret);
    // only admin can update records
    if (decodedToken.role != "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (type == "income" || type == "expense") {
      const query =
        "UPDATE finance_records SET amount = $1,created_by = $2, type = $3, category = $4, description = $5, date = $6 WHERE id = $7 RETURNING *";
      const record = await pool.query(query, [
        amount,
        created_by,
        type,
        category,
        description,
        date,
        id,
      ]);
      return res
        .status(200)
        .json({
          message: "Record updated successfully",
          record: record.rows[0],
        });
    }
    return res.status(400).json({ message: "Invalid type" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secret);
    // only admin can delete
    if (decodedToken.role != "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const query = "DELETE FROM finance_records WHERE id = $1 RETURNING *";
    const record = await pool.query(query, [id]);
    return res
      .status(200)
      .json({ message: "Record deleted successfully", record: record.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};
