# 🛡️ DevOps Fraud Shield - Backend System

This directory contains the server-side logic for the DevOps Fraud Shield. It utilizes a **Microservices Architecture** to combine high-performance I/O with advanced Machine Learning capability.

## 🏗️ Architecture

The backend consists of two main components:

1.  **Core API (Node.js):** Handles Webhooks (GitLab/GitHub), manages the database, and serves the Frontend dashboard.
2.  **Fraud Engine (Python):** A dedicated service that runs the AI/ML models to detect anomalies in commit data and patterns.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18+
* **Python:** v3.9+
* **MongoDB:** Local or Atlas instance
* **Docker** (Optional)

---

### 1. Core API Setup (Node.js)

The main controller logic and webhook listeners.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the `backend` root:
    ```env
    PORT=8000
    DB_URI=mongodb://localhost:27017/fraud_shield
    WEBHOOK_SECRET=your_webhook_secret
    ML_SERVICE_URL=http://localhost:5000
    ```

3.  **Start the Server:**
    ```bash
    npm start
    # Server runs on http://localhost:8000
    ```

---

### 2. AI Engine Setup (Python)

The Machine Learning service utilized for `aiAnalyzer` logic.

1.  **Create Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Start the ML Service:**
    ```bash
    uvicorn src.core.ai_service:app --reload --port 5000
    # Service runs on http://localhost:5000
    ```

---

## 📚 API Documentation

### Webhooks
* `POST /api/webhook`
    * **Headers:** `X-GitHub-Event: push`
    * **Payload:** Standard Git push JSON.
    * **Description:** Ingests commit data and triggers fraud analysis.

### Dashboard Data
* `GET /api/fraud/stats` - Retreive system integrity scores.
* `GET /api/alerts/recent` - List latest security threats.

### Manual Actions
* `POST /api/fraud/analyze` - Force trigger a scan on a repository.

---

## 🧪 Testing

* **Run Unit Tests (Node):** `npm test`
* **Run ML Tests (Python):** `pytest`

---

## 🔒 Security Notes

* Ensure `WEBHOOK_SECRET` matches the secret configured in your GitHub/GitLab repository settings.
* The `threat_signatures.json` file should be updated regularly with new patterns.