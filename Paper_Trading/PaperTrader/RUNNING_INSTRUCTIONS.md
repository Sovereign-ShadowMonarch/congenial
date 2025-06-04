# 📋 Running the Crypto Trading Simulator

This document provides detailed instructions on how to run the Crypto Trading Simulator application on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v12.0 or higher recommended)
- **npm** (typically comes with Node.js)
- **MongoDB** (v4.0 or higher)

## 🛠️ Initial Setup (First-Time Only)

### 1. Clone or Download the Repository

If you haven't already, clone or download the repository to your local machine.

### 2. Install Frontend Dependencies

```bash
cd /path/to/PaperTrader/frontend
npm ci
```

### 3. Install Backend Dependencies

```bash
cd /path/to/PaperTrader/backend
npm ci
```

### 4. Create MongoDB Data Directory

```bash
cd /path/to/PaperTrader
mkdir -p mongodata
```

## 🚀 Running the Application

Follow these steps in order to properly run all components of the application:

### 1. Start MongoDB

MongoDB needs to be running before starting the application. If MongoDB is installed as a service on your system, it might already be running.

**Check if MongoDB is already running:**

```bash
mongo --eval "db.adminCommand('ping')"
```

If you see a successful response, MongoDB is already running. If not, start MongoDB with:

```bash
cd /path/to/PaperTrader
mongod --dbpath mongodata/
```

Leave this terminal window open while using the application.

### 2. Start the Backend Server

Open a new terminal window and run:

```bash
cd /path/to/PaperTrader/backend
npm run start
```

You should see:
- "Server is running on port 8080."
- "Successfully connect to MongoDB."

Leave this terminal window open while using the application.

### 3. Start the Frontend Application

Open another new terminal window and run:

```bash
cd /path/to/PaperTrader/frontend
npm run start
```

The React development server will start and automatically open the application in your default web browser. If it doesn't open automatically, you can access it at [http://localhost:3000](http://localhost:3000).

You should see:
- "Compiled successfully!"
- "You can now view react-folder in the browser."
- Local URL: http://localhost:3000

## 📊 Accessing the Application

- **Frontend URL:** [http://localhost:3000](http://localhost:3000)
- **Backend API URL:** [http://localhost:8080](http://localhost:8080)

## ⚠️ Troubleshooting

### MongoDB Already Running

If you see "Address already in use" when trying to start MongoDB, it means MongoDB is already running on your system. You can skip the MongoDB start step.

### Port Conflicts

If either port 3000 or 8080 is already in use:

- For the frontend, React will automatically try to use the next available port (like 3001)
- For the backend, you would need to modify the port in `backend/server.js`

### Connection Issues

If the backend cannot connect to MongoDB:
- Ensure MongoDB is running
- Check backend logs for specific error messages
- Verify MongoDB connection string in the backend configuration

## 🛑 Stopping the Application

To stop any component:
- Press `Ctrl + C` in the respective terminal window
- Confirm by pressing `Y` if prompted

## 🔄 Restarting After Computer Reboot

After rebooting your computer, you'll need to restart all components following the steps in the "Running the Application" section.

## 🧪 Testing the Application

Once all components are running:
1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Register for a new account or login with existing credentials
3. You'll receive $10,000 in virtual currency to start trading
4. Explore cryptocurrency charts and execute trades
5. Track your portfolio performance over time

---

*Happy Trading!* 💹
