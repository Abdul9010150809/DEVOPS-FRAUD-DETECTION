## 🛡️ DevOps Fraud Detection

A Secure DevSecOps Framework for Detecting Fraudulent Activities in CI/CD Pipelines Using AI/ML

## 🌍 Real-World Problem

Modern organizations rely heavily on CI/CD pipelines to deliver software rapidly. However, this speed introduces a new class of security threats:

## ❗ Growing Challenges in Real-World CI/CD Pipelines

- Malicious code injections by compromised developers or insiders

- Unauthorized production deployments bypassing review

- Stolen developer accounts triggering pipelines

- Dangerous configuration changes hidden among thousands of commits

- Supply-chain attacks injecting malicious dependencies

- Tampering in pipeline logs or test results

- Unapproved access to secrets or environment variables

## Traditional security tools fail because:

- They do not continuously monitor commit behavior

- They cannot detect subtle anomalies

- They react to threats after damage occurs

- They ignore behavioral, contextual, and temporal patterns

# 🔐 Result: Organizations face massive financial loss, reputational damage, and operational failures due to undetected CI/CD fraud.

## 🚀 Our Solution — DevOps Fraud Detection

A powerful AI-driven platform that monitors CI/CD pipelines in real time, detects anomalies, and blocks fraudulent activities before they cause damage.
## 📖 Overview

DevOps Fraud Shield provides real-time monitoring and analysis of DevOps workflows to identify and prevent security threats. The system integrates with GitLab/GitHub webhooks, uses machine learning for anomaly detection, and provides a dashboard for security teams to monitor pipeline integrity.

### Key Features
- **AI-Powered Fraud Detection**: Machine learning models analyze commit patterns and pipeline activities
- **Real-time Webhook Monitoring**: Integrates with GitLab/GitHub for instant threat detection
- **Risk Scoring Engine**: Dynamic scoring based on multiple security indicators
- **Alert Management**: Configurable alerts via Slack and email
- **Interactive Dashboard**: React-based UI for monitoring and analysis
- **Microservices Architecture**: Scalable backend with Python ML service and API layer

## 🏗️ 3. System Architecture
```
                        ┌────────────────────────┐
                        │      Developer         │
                        │   Git Push / MR        │
                        └──────────┬─────────────┘
                                   │
                         GitLab/GitHub Webhooks
                                   │
                   ┌──────────────▼──────────────┐
                   │      Backend API (FastAPI)   │
                   │ - Webhook Handler            │
                   │ - Fraud Detection Engine     │
                   │ - Risk Scoring               │
                   │ - Slack/Email Alerts         │
                   └──────────────┬──────────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   ML Engine (AI)    │
                         │ - Isolation Forest  │
                         │ - Anomaly Detection │
                         │ - Feature Extraction│
                         └─────────┬──────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   Database Layer     │
                         │ - Alerts             │
                         │ - Commits            │
                         │ - Risk Scores        │
                         └─────────┬──────────┘
                                   │
                      ┌────────────▼────────────┐
                      │   Frontend Dashboard     │
                      │ - React UI               │
                      │ - Real-time Metrics      │
                      │ - Charts & Alerts        │
                      └──────────────────────────┘
```

## 🔄 Workflow (End-to-End Fraud Detection Process)
# Step 1 — Developer Pushes Code

- Commit/Merge Request is created

- GitLab/GitHub sends a webhook event

# Step 2 — Backend Receives Webhook

- Event metadata is validated

- Commit information extracted

- File changes + actor behavior collected

# Step 3 — Feature Engineering

- Backend processes:

- Commit frequency

- File size change

- Sensitive keywords

- Pipeline trigger type

- Author history

# Step 4 — AI/ML Model Evaluation

- Features passed through Isolation Forest

- Model generates fraud anomaly score

# Step 5 — Risk Score Calculation

- Combined from:

- ML anomaly score

- Predefined security rules

- Threat patterns (signature-based)

# Step 6 — Alerting

- If risk > defined threshold:

- Slack notification sent

- Email alert triggered

- Alert stored in database

# Step 7 — Dashboard Update

- Frontend fetches latest stats

- Alerts table updates

- Risk graph rendered in real time

### Project Structure

```
├── backend/                 # Python FastAPI backend
│   ├── src/                 # Source code
│   │   ├── api/            # API controllers
│   │   ├── core/           # Core ML and fraud detection logic
│   │   ├── services/       # Database and external services
│   │   └── utils/          # Utilities and configurations
│   ├── tests/              # Unit and integration tests
│   └── requirements.txt    # Python dependencies
├── frontend/                # React frontend dashboard
│   ├── src/                # React components and logic
│   ├── public/             # Static assets
│   └── package.json        # Node.js dependencies
├── infra/                  # Infrastructure as Code
│   ├── docker/             # Dockerfiles
│   ├── k8s/                # Kubernetes manifests
│   └── terraform/          # Terraform configurations
├── ml/                     # Machine learning components
│   ├── models/             # Pre-trained models
│   ├── datasets/           # Training data
│   └── notebooks/          # Jupyter notebooks
├── docs/                   # Documentation
├── scripts/                # Utility scripts
└── security/               # Security configurations
```

### Technology Stack

| Technology | Usage | Component |
|------------|-------|-----------|
| **Python** | Core programming language for backend services | Backend |
| **FastAPI** | High-performance REST API framework | Backend |
| **Pytest** | Unit and integration testing framework | Backend |
| **SQLite** | Lightweight database for data storage | Backend |
| **React** | Component-based UI library for dashboard | Frontend |
| **Axios** | HTTP client for API communication | Frontend |
| **Recharts** | Data visualization library for charts | Frontend |
| **Scikit-learn** | Machine learning algorithms for fraud detection | ML |
| **Pandas** | Data manipulation and analysis | ML |
| **Docker** | Containerization for consistent deployment | Infrastructure |
| **Kubernetes** | Container orchestration for scaling | Infrastructure |
| **Terraform** | Infrastructure as Code for cloud resources | Infrastructure |
| **GitHub Actions** | CI/CD pipeline automation | CI/CD |
| **Git** | Version control and collaboration | Development |
| **Slack API** | Alert notifications and communication | Integration |

For more details, see [GitLab Tools Used](docs/07_GitLab_Tools_Used.pdf).

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.9+
- Node.js 16+

### Setup
1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access the dashboard at `http://localhost:3000`

### Local Development
See [backend/README_BACKEND.md](backend/README_BACKEND.md) and [frontend/README_FRONTEND.md](frontend/README_FRONTEND.md) for detailed setup instructions.

## 🚀 Deployment

The application is deployed on Render with the following services:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend Dashboard | https://devops-fraud-frontend-1.onrender.com/ | React-based UI for monitoring DevOps pipelines and security threats |
| Backend API | https://devops-fraud-backend.onrender.com/ | FastAPI backend providing fraud detection, ML analysis, and webhook handling |

### Deployment Details
- **Frontend**: Static site hosted on Render, built from React application
- **Backend**: Web service on Render, running Python FastAPI with ML models
- **Environment**: Production environment with configured API endpoints
- **CI/CD**: Automated deployments via GitHub integration with Render

## 📚 Documentation

- [API Documentation](docs/04_API_Documentation.md)
- [Architecture Overview](docs/01_Overview.pdf)
- [Threat Model](docs/05_Threat_Model.md)
- [CI/CD Flow](docs/06_CI_CD_Flow.pdf)

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## 🔄 CI/CD

The project uses GitHub Actions for continuous integration and deployment. The CI pipeline includes:

- Automated testing for backend (Python/pytest) and frontend (React/Jest)
- Docker image builds for containerized deployment
- Linting and code quality checks

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for the complete workflow configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 🏆 Hackathon

This project was developed as part of the GitLab Hackathon conducted by IIT Bombay.

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.
