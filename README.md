# Chat-App

A real-time text messaging web application built with **Node.js**, **Express**, **Socket.io**, and **SQLite** for session storage and chat history persistence.

---

## Features

- Public chat room visible to all users
- Private messaging between users
- Real-time typing indicators
- Online users list
- Persistent sessions using SQLite session store
- Chat history saved in memory (can be extended to DB)
- Responsive and simple frontend UI

---

## Tech Stack

- **Backend:** Node.js, Express, Socket.io, express-session, connect-sqlite3, SQLite
- **Frontend:** HTML, CSS, JavaScript (Socket.io client)
- **Deployment:** Deployed on Render.com (or any Node.js hosting)

---

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm (comes with Node.js)
- Git (for cloning repository)

---

### Installation

1. Clone the repository

```bash
git clone https://github.com/HSA-ATTOCK/chat-app.git
cd chat-app
````

2. Install dependencies

```bash
npm install
```

3. Run the application locally

```bash
npm start
```

4. Open your browser and navigate to

```
http://localhost:5000
```

---

### Folder Structure

```
chat-app/
├── public/             # Frontend files (HTML, CSS, JS)
│   ├── index.html
│   ├── script.js
│   └── style.css
├── server.js           # Node.js backend server
├── package.json        # Project manifest
└── README.md           # This documentation file
```

---

## How It Works

* The backend server manages WebSocket connections with Socket.io.
* Users connect and can set their username.
* Users can send messages publicly or privately.
* Chat messages and typing indicators are broadcasted in real-time.
* Session middleware persists usernames across reconnects.
* Chat history is stored in-memory for public and private chats.

---

## Deployment on Render.com

1. Push your project to GitHub.
2. Create a new Web Service on Render.com.
3. Connect your GitHub repository.
4. Set the following in Render’s deployment settings:

   * **Build Command:** `npm install`
   * **Start Command:** `node server.js`
5. Deploy and access your app at the provided Render URL.

---

## Configuration

* The server listens on port specified by environment variable `PORT` or defaults to 5000.
* Sessions use SQLite store to persist user sessions (`connect-sqlite3`).

---

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Contact

Created by HSA-ATTOCK.

Feel free to reach out for any questions or collaboration.
