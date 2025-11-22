# 🛡️ DevOps Fraud Shield

A comprehensive DevSecOps solution that leverages AI/ML to detect fraudulent activities in CI/CD pipelines, protecting against code injection, unauthorized access, and malicious commits.

## 📖 Overview

DevOps Fraud Shield provides real-time monitoring and analysis of DevOps workflows to identify and prevent security threats. The system integrates with GitLab/GitHub webhooks, uses machine learning for anomaly detection, and provides a dashboard for security teams to monitor pipeline integrity.

### Key Features
- **AI-Powered Fraud Detection**: Machine learning models analyze commit patterns and pipeline activities
- **Real-time Webhook Monitoring**: Integrates with GitLab/GitHub for instant threat detection
- **Risk Scoring Engine**: Dynamic scoring based on multiple security indicators
- **Alert Management**: Configurable alerts via Slack and email
- **Interactive Dashboard**: React-based UI for monitoring and analysis
- **Microservices Architecture**: Scalable backend with Python ML service and API layer

## 🏗️ Architecture

The system consists of:
- **Backend (Python)**: Core API, ML engine, and database services
- **Frontend (React)**: Dashboard for visualization and monitoring
- **Infrastructure**: Docker containers and Kubernetes manifests
- **ML Models**: Pre-trained anomaly detection models

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.