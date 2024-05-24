import http from "http";
import express from "express";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

app.use(cors({ origin: "*" }));

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`user left room ${roomId}`);

    // 방이 비어 있는지 확인하고 비어 있으면 자동으로 삭제됨
    if (io.sockets.adapter.rooms.get(roomId) === undefined) {
      console.log(`Room ${roomId} is empty and will be destroyed`);
    }
  });

  socket.on("requestMessage", (roomId, message) => {
    io.to(roomId).emit("requestMessage", message);
    console.log(`requestMessage sent to room ${roomId}: ${message}`);
  });

  socket.on("sendMessage", (roomId, message) => {
    io.to(roomId).emit("sendMessage", message);
    console.log(`sendMessage sent to room ${roomId}: ${message}`);
  });

  socket.on("cryptoInfo", (roomId, message) => {
    console.log(
      `Received walletPublicKey for room ${roomId}: ${JSON.stringify(message)}`
    );
    io.to(roomId).emit("cryptoInfo", message);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = 8090;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
