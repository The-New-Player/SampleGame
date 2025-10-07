import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// ====== ページ ======
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public/create.html"));
});

app.get("/enter", (req, res) => {
  res.sendFile(path.join(__dirname, "public/enter.html"));
});

app.get("/room/:roomId", (req, res) => {
  res.sendFile(path.join(__dirname, "public/room.html"));
});

// ====== Socket.IO ======
const rooms = {}; // { roomId: [socketId1, socketId2] }

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = [];

    // 部屋が満員なら入れない
    if (rooms[roomId].length >= 2) {
      socket.emit("roomFull");
      return;
    }

    socket.join(roomId);
    rooms[roomId].push(socket.id);

    // O / X を割り当てる
    const playerSymbol = rooms[roomId].length === 1 ? "O" : "X";
    socket.emit("assignSymbol", playerSymbol);

    console.log(`User ${socket.id} joined room ${roomId} as ${playerSymbol}`);
    console.log("Current rooms:", rooms);

    // 2人揃ったらゲーム開始
    if (rooms[roomId].length === 2) {
      io.to(roomId).emit("startGame");
    }
  });

  socket.on("move", (data) => {
    // data = { roomId, x, y, symbol }
    io.to(data.roomId).emit("move", data);
  });

  socket.on("clear", (roomId) => {
    io.to(roomId).emit("clear");
  });

  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);
      if (rooms[roomId].length === 0) delete rooms[roomId];
    }
    console.log("disconnected:", socket.id);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));





// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import { randomBytes } from "crypto";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.static("public"));

// // ルーム作成用
// app.get("/create", (req, res) => {
//   const roomId = randomBytes(3).toString("hex"); // 6桁の部屋ID
//   res.redirect(`/room/${roomId}`);
// });

// // 通常ページ
// app.get("/room/:roomId", (req, res) => {
//   res.sendFile(process.cwd() + "/public/index.html");
// });

// const rooms = {}; // { roomId: [socketId1, socketId2] }

// io.on("connection", (socket) => {
//   console.log("connected:", socket.id);

//   socket.on("joinRoom", (roomId) => {
//     socket.join(roomId);
//     if (!rooms[roomId]) rooms[roomId] = [];
//     rooms[roomId].push(socket.id);

//     console.log(`User ${socket.id} joined room ${roomId}`);
//     console.log("Current rooms:", rooms);

//     // 2人そろったら開始信号
//     if (rooms[roomId].length === 2) {
//       io.to(roomId).emit("startGame");
//     }
//   });

//   // プレイヤーの手をルーム内に送信
//   socket.on("move", (data) => {
//     io.to(data.roomId).emit("move", data);
//   });

//   // クリアボタンもルーム内だけに反映
//   socket.on("clear", (roomId) => {
//     io.to(roomId).emit("clear");
//   });

//   socket.on("disconnect", () => {
//     for (const roomId in rooms) {
//       rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
//       if (rooms[roomId].length === 0) delete rooms[roomId];
//     }
//     console.log("disconnected:", socket.id);
//   });
// });

// const port = process.env.PORT || 3000;
// server.listen(port, () => console.log(`Server running on port ${port}`));





// import express from "express";
// import http from "http";
// import { Server } from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// app.use(express.static("public"));

// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("move", (data) => {
//     io.emit("move", data); // 全員に送信
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });

// const port = process.env.PORT || 3000;
// server.listen(port, () => console.log(`Server running on port ${port}`));
