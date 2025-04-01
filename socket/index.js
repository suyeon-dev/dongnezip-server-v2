const socketIO = require("socket.io");
const { ChatMessage } = require("../model/index");
const FRONT = process.env.FRONT_SERVER;
let io;

function socketHandler(server) {
  io = socketIO(server, {
    cors: {
      origin: FRONT, // 통신하는 client
      methods: ["GET", "POST"],
    },
  });

  const nickInfo = {}; // socket.id : nickname

  io.on("connection", (socket) => {
    socket.on("joinRoom", (userNickname, roomId) => {
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      socket.join(roomId);

      nickInfo[socket.id] = userNickname;
      socket.emit("success", userNickname);
      console.log(
        `Sending notice to room ${roomId}: ${
          nickInfo[socket.id]
        }님이 입장했습니다`
      );
      io.to(roomId).emit("notice", nickInfo[socket.id] + "님이 입장했습니다");
    });

    // 퇴장 시 안내문구
    socket.on("disconnect", () => {
      const rooms = Object.keys(socket.rooms);
      rooms.forEach((room) => {
        io.to(room).emit(
          "notice",
          nickInfo[socket.id] + "님이 퇴장하였습니다."
        );
      });
      delete nickInfo[socket.id];
    });

    // 메세지 전송
    socket.on("send", async (msgData) => {
      try {
        const newMessage = await ChatMessage.create({
          roomId: msgData.roomId,
          senderId: msgData.senderId,
          senderNick: msgData.senderNick,
          message: msgData.msg,
          isRead: false,
          msgType: msgData.type,
        });

        io.to(msgData.roomId.toString()).emit("message", {
          type: msgData.type,
          senderId: msgData.senderId,
          senderNick: msgData.senderNick,
          message: msgData.msg,
          isRead: false,
        });
      } catch (err) {
        console.error(err);
      }
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("socket.io가 초기화되지 않았습니다");
  }
  return io;
}

module.exports = { socketHandler, getIO };
