import express from "express";
import { register, login, editOwnUser, adminControlGetAllUsers, adminControlDeleteUser, adminEditRole, resetPassword } from "../controllers/authController.js";
const router = express.Router();

router.route("/").get((req, res) => {
    res.send("Auth service is running");
});

router.route("/register").post(register);
router.route("/login").post(login);

// edit-own-user
router.route("/edit-own-user").put(editOwnUser);

//reset-password
router.route("/reset-password").put(resetPassword);

// Admin controll 
router.route("/admin/get-all-users").get(adminControlGetAllUsers);

// admin-control-delete-user
router.route("/admin/delete-user").delete(adminControlDeleteUser);

// edit-role
router.route("/admin/edit-role").put(adminEditRole);


export default router;