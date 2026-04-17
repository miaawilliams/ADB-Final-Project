# ADB-Final-Project

# Store Management API

A RESTful API built with Node.js, Express, and Sequelize (SQLite) for managing users, stores, and business hours.

---

## 📌 Features

- User management (CRUD)
- Store management (CRUD)
- Business hours tracking per store
- RESTful API design
- SQLite database using Sequelize ORM
- JSON request/response format

---

## ⚙️ Tech Stack

- Node.js
- Express.js
- Sequelize ORM
- SQLite
- bcryptjs (password hashing)
- dotenv

---

## 🚀 Setup Instructions

### 1. Clone the project
```bash
git clone <your-repo-url>
cd ADB-Final-Project
2. Install dependencies
npm install
3. Create environment file

Create a .env file in the root:

DB_NAME=database.sqlite
PORT=4000
4. Initialize database 
node database/seed.js


5. Start the server
node server.js

Server runs at:

http://localhost:4000
📂 Project Structure
ADB-Final-Project/
│
├── database/
│   ├── setup.js
│   └── seed.js
│
├── routes/
│   ├── users.js
│   ├── stores.js
│   └── hours.js
│
├── app.js
├── server.js
├── .env
└── README.md