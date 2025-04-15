import express from "express";
import { signUp, login, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/me", getMe);

export default router;
