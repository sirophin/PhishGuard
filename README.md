# PhishGuard — Real-Time Phishing Detection & Awareness Platform

A final-year cybersecurity project built with React, Node.js, Express, and MongoDB.

## Features

### Module 1 — Detection
- URL Scanner with rule-based heuristics (IP detection, homograph attacks, lookalike domains)
- VirusTotal API integration
- OpenPhish feed integration
- File Extension Checker (double extension attacks, dangerous file types)
- Email Header Analyzer (SPF, DKIM, DMARC, spoofing detection)
- Chrome Extension with real-time blocking
- Scan logs with CSV export

### Module 2 — Awareness
- Phishing quiz with 7 questions across 3 difficulty levels
- Security awareness guide
- Email header analysis education

## Tech Stack
- Frontend: React.js + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Extension: Chrome Manifest V3
- APIs: VirusTotal, OpenPhish

## Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally

### Install & Run
```bash
# Backend
cd backend && npm install
cp .env.example .env   # add your API keys
npm run dev

# Frontend
cd frontend && npm install
npm run dev
```

Open http://localhost:5173

### Chrome Extension
1. Open chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked"
4. Select the /extension folder

## Environment Variables
