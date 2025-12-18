# SaaS Multi-tenant Realtime Collaboration Platform

A full-stack SaaS platform built with Next.js and NestJS, featuring real-time collaboration, multi-tenancy, and microservices architecture.

## 🚀 Features

- **Multi-tenant Architecture**: Isolated workspaces for different organizations
- **Real-time Collaboration**: Live updates and notifications
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permissions
- **Microservices**: Scalable and maintainable architecture
- **Docker Support**: Easy development and deployment
- **i18n**: Multi-language support (English, Vietnamese)

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS
- **API**: GraphQL & REST
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Message Broker**: Kafka
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Containerization**: Docker
- **CI/CD**: GitHub Actions

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **i18n**: next-i18next
- **Real-time**: Socket.IO Client

## 🚀 Getting Started

### Prerequisites

- Node.js 20.18.1
- Yarn 1.22.19
- Docker & Docker Compose
- Git

### 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/saas-platform.git](https://github.com/your-username/saas-platform.git)
   cd saas-platform
2. **Install dependencies**
   ```bash
   # Install root dependencies
   yarn install
   
   # Install frontend dependencies
   cd frontend
   yarn install
   cd ..
3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
4. **Start the infrastructure**
   ```bash
   yarn docker:up
5. **Start the development servers**
   ```bash
   # In the root directory
   yarn dev

The application will be available at:

Frontend: http://localhost:3000
API Gateway: http://localhost:3001
Kafka UI: http://localhost:8080
PostgreSQL: localhost:5432
Redis: localhost:6379

Project Structure
saas-platform/
├── apps/
│   ├── api-gateway/       # API Gateway (NestJS)
│   ├── auth-service/      # Authentication & Authorization
│   ├── project-service/   # Project Management
│   ├── realtime-service/  # Real-time Communication
│   └── notification-service/ # Notifications
├── frontend/              # Next.js frontend
├── libs/                  # Shared libraries
│   └── shared/            # Shared code between services
└── infra/                 # Infrastructure
    ├── docker/            # Docker configurations
    └── kubernetes/        # Kubernetes configurations

Running Tests
```bash
# Run all tests
yarn test

# Run tests for a specific service
cd apps/auth-service
yarn test
```

Docker
```bash
# Start services
yarn docker:up

# Stop services
yarn docker:down

# View logs
yarn docker:logs
```

Environment Variables
See .env.example for all available environment variables. Create a .env file in the root directory and update the values as needed.

Contributing
Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
NestJS
Next.js
Docker
Kafka
Redis

Made with ❤️ by ZerusNgo (Thanh Ngo Dev)

To complete your README.md:

1. Copy the content above
2. Paste it at the end of your current README.md file
3. Make sure to:
   - Replace `Zerus Ngo` at the bottom with your actual name
   - Update any other details as needed

The README now includes:
- Complete installation instructions
- Project structure
- Testing instructions
- Docker commands
- Environment variables
- Contributing guidelines
- License information
- Acknowledgments

Would you like me to help you set up any specific part of the project next? For example:
1. Setting up the authentication service
2. Configuring the API Gateway
3. Setting up the frontend with Next.js
4. Configuring database migrations
5. Setting up Kafka event bus

Let me know which part you'd like to work on!