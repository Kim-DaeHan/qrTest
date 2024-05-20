import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on("messageToRoom", ({ roomId, message }) => {
    io.to(roomId).emit("message", message);
    console.log(`Message sent to room ${roomId}: ${message}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

const PORT = 8090;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
