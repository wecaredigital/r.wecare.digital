# URL Shortener Platform

A serverless, production-grade URL shortening service built on AWS with Vue.js frontend.

## Features

- **Public URL Redirection** – Fast, cached redirects via CloudFront
- **Authenticated Link Management** – Create, update, delete, and organize links
- **Multi-Factor Authentication** – TOTP-based MFA for enhanced security
- **Serverless Architecture** – Zero server management, automatic scaling
- **Per-User Data Isolation** – Each user manages only their own links
- **Folder Organization** – Categorize links with folders
- **Search & Filter** – Find links quickly by ID, URL, folder, or remark

## Architecture

- **Frontend**: Vue.js SPA hosted on AWS Amplify
- **API**: AWS API Gateway with direct DynamoDB integrations (no Lambda)
- **Authentication**: Amazon Cognito User Pool with custom domain and MFA
- **Storage**: DynamoDB with Global Secondary Index for owner-based queries
- **CDN**: CloudFront distribution for low-latency redirects
- **Monitoring**: CloudWatch alarms and logs

## Quick Start

### Prerequisites

- AWS CLI configured with credentials
- AWS SAM CLI installed
- Node.js 14+ and npm
- GitHub account with personal access token

### Deploy to AWS

```bash
# Clone repository
git clone https://github.com/YOUR-USERNAME/r.wecare.digital.git
cd r.wecare.digital

# Deploy infrastructure
sam deploy --guided

# Configure Amplify environment variables (use command from stack outputs)
aws amplify update-app --app-id {app-id} --environment-variables ...

# Trigger Amplify build
aws amplify start-job --app-id {app-id} --branch-name master --job-type RELEASE
```

### Local Development

```bash
# Install dependencies
cd client
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your AWS resource IDs

# Run development server
npm run serve
# Open http://localhost:8080
```

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[00-diagrams-overview.md](docs/00-diagrams-overview.md)** – Complete diagram inventory, rendering guide, export instructions (10 diagrams)
- **[01-architecture.md](docs/01-architecture.md)** – System architecture, components, data model, request flows with 7 diagrams
- **[02-deployment.md](docs/02-deployment.md)** – Step-by-step deployment guide, one-command deployment, troubleshooting with 1 diagram
- **[03-configuration.md](docs/03-configuration.md)** – All configuration options, parameters, environment variables, API Gateway settings with 1 diagram
- **[04-development.md](docs/04-development.md)** – Development environment setup, project structure, common tasks, debugging with 1 diagram

**📊 Total: 10 Mermaid diagrams** (6 graphs + 4 sequence diagrams) covering system architecture, deployment flow, configuration, development workflow, and detailed request flows.

## Technology Stack

**Frontend:**
- Vue.js 2.x
- Vuex (state management)
- Vue Router
- Tailwind CSS
- AWS Amplify Auth

**Backend:**
- AWS API Gateway (REST API)
- Amazon DynamoDB (NoSQL database)
- Amazon Cognito (authentication)
- AWS CloudFront (CDN)
- AWS Amplify (hosting)

**Infrastructure:**
- AWS SAM (Serverless Application Model)
- CloudFormation
- CloudWatch (monitoring)

## Project Structure

```
r.wecare.digital/
├── client/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── views/         # Page components
│   │   ├── store/         # Vuex store
│   │   └── router/        # Vue Router
│   └── public/            # Static assets
├── docs/                   # Documentation
│   ├── 01-architecture.md
│   ├── 02-deployment.md
│   ├── 03-configuration.md
│   └── 04-development.md
├── templates/              # API Gateway VTL templates
├── api.yaml               # OpenAPI 3.0.1 specification
└── template.yaml          # AWS SAM template
```

## API Endpoints

### Public Endpoints

- `GET /{linkId}` – Redirect to target URL (301 response)

### Authenticated Endpoints (require JWT token)

- `GET /app` – List user's links
- `POST /app` – Create new link
- `PUT /app/{linkId}` – Update existing link
- `DELETE /app/{linkId}` – Delete link
- `GET /app/mfa/status` – Check MFA enrollment status
- `POST /app/mfa/setup` – Initialize TOTP MFA setup
- `POST /app/mfa/verify` – Verify and enable TOTP MFA
- `POST /app/mfa/authenticate` – Authenticate with TOTP code
- `POST /app/mfa/disable` – Disable TOTP MFA

## Data Model

Each link contains:
- `id` – Short link identifier (e.g., "google")
- `url` – Target URL (e.g., "https://google.com")
- `owner` – User email (from JWT token)
- `timestamp` – Creation/update time
- `folder` – Optional category/folder
- `remark` – Optional description/note

## Security

- **Authentication**: Cognito User Pool with JWT tokens
- **MFA**: TOTP-based multi-factor authentication (enforced)
- **Authorization**: API Gateway validates JWT on all authenticated endpoints
- **Data Isolation**: Users can only access their own links
- **Encryption**: All data encrypted at rest (DynamoDB) and in transit (HTTPS/TLS)
- **CORS**: Configured for cross-origin requests
- **Throttling**: Rate limiting to prevent abuse

## Monitoring

- **CloudWatch Logs**: API Gateway execution logs, access logs
- **CloudWatch Metrics**: API Gateway, DynamoDB, CloudFront metrics
- **CloudWatch Alarms**: 4xx/5xx errors, latency, cache hit rate
- **X-Ray Tracing**: End-to-end request tracing
- **SNS Notifications**: Alarm notifications via email

## Cost Estimation

**Low traffic (~10,000 requests/month)**: ~$1.40/month  
**Medium traffic (~1,000,000 requests/month)**: ~$43.65/month

See [02-deployment.md](docs/02-deployment.md) for detailed cost breakdown.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make changes with tests
4. Commit with descriptive messages (`git commit -m "feat: Add feature"`)
5. Push to your fork (`git push origin feature/my-feature`)
6. Create a pull request

See [04-development.md](docs/04-development.md) for development guidelines.

## License

See [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check documentation in `docs/` directory
- Review CloudWatch logs for debugging

## Acknowledgments

Built with AWS Serverless services and Vue.js.

---

## Documentation Highlights

Our comprehensive documentation includes:

### 📐 Architecture (01-architecture.md)
- **5 Mermaid diagrams**: System context, component architecture, 3 sequence flows, MFA flow, error handling
- **Performance benchmarks**: Latency metrics (p50/p95/p99), throughput capacity, cost per 1K requests
- **Real-world use cases**: Marketing campaigns, documentation portals, event registration
- **Security hardening**: 19-point checklist, threat mitigation table
- **Disaster recovery**: Backup strategy, recovery procedures, RTO/RPO targets
- **Architecture Decision Records**: 4 ADRs explaining key design choices

### 🚀 Deployment (02-deployment.md)
- **Deployment flow diagram**: Visual guide from prerequisites to verification
- **4 real-world examples**: First-time deployment, updates, multi-environment, rollback
- **One-command deployment**: Guided, script-based, and manual options
- **Best practices**: 5 deployment best practices with rationale
- **Troubleshooting**: 6 common issues with diagnosis and solutions
- **Cost estimation**: Detailed breakdown for low and medium traffic

### ⚙️ Configuration (03-configuration.md)
- **Configuration overview diagram**: Deployment vs runtime configuration
- **Quick reference tables**: Essential values, environment-specific settings
- **3 use case configurations**: Small team, marketing department, enterprise
- **Advanced patterns**: Multi-region, dev/prod isolation, high-traffic optimization
- **Troubleshooting**: 4 common configuration issues with solutions
- **Validation checklists**: Pre and post-deployment validation steps

### 💻 Development (04-development.md)
- **Development workflow diagram**: From setup to deployment
- **7 productivity tips**: DevTools, HMR, VS Code extensions, snippets, mocking, Git workflow, debugging
- **3 real-world scenarios**: Adding features, fixing bugs, performance optimization
- **Testing strategies**: Unit, integration, E2E testing with examples
- **Code style guidelines**: JavaScript, Vue, Git commit conventions
- **Performance optimization**: Code splitting, lazy loading, caching

---

**Current Deployment:**
- API: `https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod`
- Frontend: `https://go.wecare.digital`
- Auth Domain: `https://user.wecare.digital`
- Region: `ap-south-1` (Mumbai)

---

**Documentation Stats:**
- Total Pages: 4 comprehensive guides
- Total Diagrams: 10+ Mermaid diagrams
- Total Tables: 30+ reference tables
- Total Examples: 15+ real-world scenarios
- Total Lines: ~4,000 lines of documentation
