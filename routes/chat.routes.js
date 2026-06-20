import { Router } from "express";
import { createTemporaryLobby } from "../controllers/chat.controllers.js";

const router = Router();

router.get("/", (req, res) => {
    res.render("main_chats");
});
router.get("/new/:name", createTemporaryLobby);
router.get("/killed", (req, res) => {
    res.send("The lobby is dead. Goodabye lmao!");
});
router.get("/temp_chats", (req, res) => {
    res.render("temp_chats");
});

export default router;
