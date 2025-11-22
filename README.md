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

### Tools Used

- **Backend**: Python, FastAPI, Pytest, SQLite
- **Frontend**: React, Axios, Recharts
- **ML**: Scikit-learn, Pandas
- **Infrastructure**: Docker, Kubernetes, Terraform
- **CI/CD**: GitHub Actions
- **Version Control**: Git
- **Communication**: Slack API

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