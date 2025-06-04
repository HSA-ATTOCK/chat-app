const socket = io();

const usernameModal = document.getElementById("usernameModal");
const usernameInput = document.getElementById("usernameInput");
const enterChatBtn = document.getElementById("enterChatBtn");
const chatContainer = document.querySelector(".chat-container");

const userList = document.getElementById("userList");
const messages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatTitle =
  document.getElementById("currentChatTitle") ||
  document.getElementById("chatTitle");
const typingIndicator = document.getElementById("typingStatus");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

// ✅ Hamburger toggle
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

let username = null;
let currentRecipient = null;
let typingTimeout;

// Handle Enter Chat button
enterChatBtn.addEventListener("click", () => {
  const enteredUsername = usernameInput.value.trim();
  if (!enteredUsername) {
    alert("Please enter a username");
    return;
  }
  username = enteredUsername;

  // Send username to server
  socket.emit("setUsername", username);

  // Hide modal and show chat container
  usernameModal.style.display = "none";
  chatContainer.style.display = "flex";

  // Focus message input
  messageInput.focus();
});

// Typing indicator logic
messageInput.addEventListener("input", () => {
  socket.emit("typing", { to: currentRecipient });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("typing", { to: currentRecipient, stop: true });
  }, 1000);
});

// Send message logic
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message === "") return;
  socket.emit("chatMessage", { message, to: currentRecipient });
  messageInput.value = "";
  socket.emit("typing", { to: currentRecipient, stop: true });
}

// Display a message
function addMessage(msg, isMe = false) {
  const div = document.createElement("div");
  div.classList.add("message");
  if (isMe) div.classList.add("me");
  div.innerHTML = `
    <div class="meta"><strong>${msg.from}</strong> - ${new Date(
    msg.timestamp
  ).toLocaleTimeString()}</div>
    <div class="text">${msg.message}</div>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Incoming chat message
socket.on("chatMessage", (msg) => {
  const isMe = msg.from === username;
  addMessage(msg, isMe);
});

// Load chat history
socket.on("chatHistory", (history) => {
  messages.innerHTML = "";
  history.forEach((msg) => {
    const isMe = msg.from === username;
    addMessage(msg, isMe);
  });
});

// Update user list
socket.on("onlineUsers", (users) => {
  userList.innerHTML = "";

  const publicLi = document.createElement("li");
  publicLi.textContent = "Public Chat";
  publicLi.onclick = () => {
    currentRecipient = null;
    chatTitle.textContent = "Public Chat";
    socket.emit("getHistory", {});
  };
  userList.appendChild(publicLi);

  Object.entries(users).forEach(([id, name]) => {
    if (name === username) return;

    const li = document.createElement("li");
    li.textContent = name;
    li.onclick = () => {
      currentRecipient = id;
      chatTitle.textContent = `Chat with ${name}`;
      socket.emit("getHistory", { to: id });
    };
    userList.appendChild(li);
  });
});

// Show typing
socket.on("typing", ({ from }) => {
  typingIndicator.textContent = `${from} is typing...`;
  setTimeout(() => {
    typingIndicator.textContent = "";
  }, 1000);
});

// Server confirms username
socket.on("setUsername", (serverUsername) => {
  username = serverUsername;
});
