# 🌌 Antigravity: The $0 Edge AI Server

> **"Turn your old Android phone into a production-grade AI Cloud IDE."**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Hardware](https://img.shields.io/badge/Hardware-Redmi%208A%20(2GB)-orange)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Gemini%20Flash-green)

**Antigravity** is a lightweight, full-stack IDE and Agentic Server designed to run on extreme edge hardware (2GB RAM Android devices). It uses **Termux** as the hostOS and Google's **Gemini 1.5 Flash** as the Neural Core, effectively offloading intelligence to the cloud while keeping the runtime local.

## ⚡ Features

-   **📱 Edge-Native:** Runs on unmodified Android phones (via Termux).
-   **🧠 Neural Core:** Zero-RAM AI integration (Gemini 1.5 Flash) for code generation and chat.
-   **💻 Cloud IDE:** Full Monaco Editor + Terminal accessible via Wi-Fi (`localhost:3000`).
-   **💾 Time Capsule:** Auto-saving sessions and Git integration.
-   **🔧 Wireless:** Deploy code via ADB, then cut the cord.

## 🚀 Quick Start (Installation)

### Prerequisites
1.  An Android Phone (Android 10+ recommended).
2.  [Termux App](https://f-droid.org/en/packages/com.termux/).
3.  A Laptop (for initial setup).

### Step 1: The "Wake Up" Call
Connect your phone via USB and run the setup script (or manually push files):

```bash
# Clone this repo
git clone https://github.com/yourusername/antigravity-edge.git
cd antigravity-edge

# Install dependencies on Phone (Termux)
pkg install nodejs git -y
npm install
```

### Step 2: Ignite the Core
In Termux:
```bash
node server.js
```

### Step 3: Neural Link
Open your laptop browser and visit your phone's IP:
`http://192.168.x.x:3000`

## 🛠️ Architecture

```mermaid
graph TD
    User[Laptop Browser] -->|Wi-Fi| Phone[Redmi 8A Server]
    Phone -->|Node.js| IDE[Antigravity IDE]
    Phone -->|API| Gemini[Google Gemini Cloud]
    IDE -->|Local| FS[File System]
    IDE -->|Exec| Termux[Shell]
```

## 📸 Screenshots

| Wireless IDE | AI Agent |
| :---: | :---: |
<img width="1905" height="499" alt="Screenshot 2026-01-13 113227" src="https://github.com/user-attachments/assets/3dc9f84b-fc93-4cd0-84bd-990e7b04aa5d" /><img width="1907" height="923" alt="Screenshot 2026-01-13 113154" src="https://github.com/user-attachments/assets/d349fb7d-37db-404c-95e8-374bd8ec0251" />



## 🤝 Contributing
Built for the **Edge Computing** community. PRs welcome for optimizing memory usage further!

## 📜 License
MIT © 2026 Shashank 
