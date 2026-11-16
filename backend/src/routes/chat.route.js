import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";
import { translateMessage } from "../controllers/translation.controller.js";
import { correctEnglish } from "../controllers/correction.controller.js";
const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.post("/translate", protectRoute, translateMessage);
router.post("/correct", protectRoute, correctEnglish);

export default router;
