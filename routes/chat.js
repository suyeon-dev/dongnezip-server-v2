const express = require("express");
const authenticateToken = require("../middlewares/jwtAuth");

const router = express.Router();
const controller = require("../controller/Cchat");
const upload = require("../config/s3");

router.get("/rooms/:userId/:itemId", controller.getUserChatRooms);
router.get("/:roomId", controller.chat);
router.post("/chatroom/create", controller.createChatRoom);
router.post("/image", upload.single("image"), controller.image);
router.post("/room/:roomId/read", controller.messageAsRead);
router.delete("/room/:roomId", authenticateToken, controller.chatDelete);
module.exports = router;
