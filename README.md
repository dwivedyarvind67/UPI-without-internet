# OfflinePay Mesh (UPI Without Internet)

**Author:** Arvind Dwivedi

Welcome to the **OfflinePay Mesh** monorepo! This project demonstrates a conceptual architecture for routing UPI (Unified Payments Interface) transactions in environments with **zero internet connectivity** (e.g., deep basements, rural areas, disaster zones). 

Instead of requiring a direct connection to the bank, payment instructions are cryptographically signed, encrypted, and broadcasted via Bluetooth to nearby devices (gossip protocol) until a "bridge" device with an active internet connection automatically uploads the packet for secure settlement.

---

## Project Structure

This repository contains two main components:

### 1. [Backend API (`/offlinepay-mesh`)](./offlinepay-mesh)
The core settlement engine and cryptography layer.
*   **Stack:** Java 17, Spring Boot 3.3.5, H2 Database (In-memory)
*   **Features:** Hybrid RSA-OAEP + AES-GCM decryption, atomic deduplication (to prevent double-spending when multiple bridges upload the same packet), and replay attack prevention.

### 2. [Frontend UI & Simulator (`/offlinepay-web`)](./offlinepay-web)
The institutional marketing site and interactive payment simulator.
*   **Stack:** Next.js 16 (App Router), Tailwind CSS v4, React 19
*   **Features:** Real-time visual simulator connecting to the backend to inject, propagate, and settle transactions. Includes full protocol documentation.

---

## Quick Start (Run Locally)

You can run both the frontend and backend locally to test the simulator.

### Step 1: Start the Backend
Open a terminal in the `offlinepay-mesh` directory and run:
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Mac/Linux
./mvnw spring-boot:run
```
*(Runs on `http://localhost:8080`)*

### Step 2: Start the Frontend
Open a second terminal in the `offlinepay-web` directory and run:
```bash
npm install
npm run dev
```
*(Runs on `http://localhost:3000`)*

### Step 3: Launch
Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**. 
Click on **Simulator** in the navbar to test the zero-internet payment routing!

---

## License
Built for learning, architectural demonstration, and portfolio purposes. Use freely.
