import express from "express";
import { signUp, login, checkAuth } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", login);
router.get("/me", checkAuth);

export default router;
