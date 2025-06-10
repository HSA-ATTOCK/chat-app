const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const sqlite3 = require("sqlite3").verbose();

const io = new Server(server);
const onlineUsers = {}; // Global map of socket.id => username

// Session middleware
const sessionMiddleware = session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true,
  store: new SQLiteStore(),
});

app.use(sessionMiddleware);
app.use(express.static("public"));

// Share session with Socket.io
io.engine.use(sessionMiddleware);

// In-memory data stores
const users = {}; // socket.id -> username
const chatHistory = { public: [] }; // chat histories

io.on("connection", (socket) => {
  const session = socket.request.session;

  let username = session.username || "User" + Math.floor(Math.random() * 1000);

  // Set username from client
  socket.on("setUsername", (newUsername) => {
    username = newUsername || username;
    session.username = username;
    session.save();

    socket.username = username;
    users[socket.id] = username;

    socket.emit("setUsername", username);
    io.emit("onlineUsers", users);

    socket.emit("chatHistory", chatHistory["public"]);
  });

  // Use session if username exists from before
  if (session.username) {
    socket.username = session.username;
    users[socket.id] = socket.username;

    socket.emit("setUsername", socket.username);
    io.emit("onlineUsers", users);
    socket.emit("chatHistory", chatHistory["public"]);
  }

  // Handle chat messages
  socket.on("chatMessage", ({ message, to }) => {
    const msg = {
      from: socket.username,
      to: to || "public",
      message,
      timestamp: Date.now(),
    };

    if (to) {
      // Private chat: to is socket ID, get their username
      const recipientUsername = users[to];
      const key = [socket.username, recipientUsername].sort().join("-");
      chatHistory[key] = chatHistory[key] || [];
      chatHistory[key].push(msg);

      // Send to both sender and recipient
      socket.emit("chatMessage", msg);
      io.to(to).emit("chatMessage", msg);
    } else {
      // Public chat
      chatHistory["public"].push(msg);
      io.emit("chatMessage", msg);
    }
  });

  // Typing indicator
  socket.on("typing", ({ to, stop }) => {
    if (stop) return;
    const from = socket.username;
    if (to) {
      io.to(to).emit("typing", { from });
    } else {
      socket.broadcast.emit("typing", { from });
    }
  });

  // Get chat history
  socket.on("getHistory", ({ to }) => {
    if (to) {
      const recipientUsername = users[to];
      const key = [socket.username, recipientUsername].sort().join("-");
      const history = chatHistory[key] || [];
      socket.emit("chatHistory", history);
    } else {
      socket.emit("chatHistory", chatHistory["public"]);
    }
  });

  // On disconnect
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("onlineUsers", users);
  });

  socket.on("privateAlert", ({ to, from }) => {
    const targetSocket = io.sockets.sockets.get(to);
    if (targetSocket) {
      targetSocket.emit("privateAlert", { from });
    }
  });
});

server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
