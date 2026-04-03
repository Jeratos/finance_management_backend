import express from "express";
import { createRecord, getAllRecords, updateRecord, deleteRecord } from "../controllers/recordController.js";

const router = express.Router();

router.post("/create", createRecord);
router.get("/get", getAllRecords);
router.put("/update/:id", updateRecord);
router.delete("/delete/:id", deleteRecord);


export default router;