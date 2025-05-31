# 💸 Crypto Trading Simulator

**An immersive cryptocurrency paper trading platform built with the MERN stack.**
This simulator offers a risk-free, real-time trading environment synced to live exchange rates.

---

## 🚀 Overview

The goal of this web application is to provide a realistic and educational experience in crypto trading. Users can explore investment strategies and practice trading with simulated funds, gaining valuable insight into market behavior without risking real money.

Currently, the application supports trading across 10+ cryptocurrencies.

---

## 💰 How It Works

* New users are granted \$10,000 in virtual funds upon registration.
* Trade supported cryptocurrencies through buy/sell operations.
* Access detailed charts and trade history to guide your strategies.
* Learn market behavior and build confidence before trading in real exchanges.

---

## ⚒️ Getting Started

### Prerequisites

Ensure the following software is installed:

* Node.js
* MongoDB

### Installation

There are three main directories:

1. **frontend/** – React-based client
2. **backend/** – Node.js + Express backend
3. **mongodata/** – MongoDB data storage directory

#### Steps:

1. **Install Frontend Dependencies:**

   ```bash
   cd frontend/
   npm ci
   ```

2. **Install Backend Dependencies:**

   ```bash
   cd ../backend/
   npm ci
   ```

---

## ▶️ Running the Application

In separate terminals or process managers:

1. **Start MongoDB:**

   ```bash
   mongod --dbpath mongodata/
   ```

2. **Start Backend Server:**

   ```bash
   cd backend/
   npm run start
   ```

3. **Start Frontend App:**

   ```bash
   cd frontend/
   npm run start
   ```

### Default URLs

* Backend: `http://localhost:8080/`
* Frontend: `http://localhost:3001/` (or any other available port if 3001 is occupied)

---

## ⚙️ Tech Stack

Built with the **MERN** stack:

* **MongoDB** – NoSQL database to store trading data
* **Express** – Backend API server
* **React** – Frontend user interface
* **Node.js** – Backend runtime environment


