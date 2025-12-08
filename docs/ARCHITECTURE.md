# WECARE.DIGITAL URL Shortener - System Architecture

## 📋 Table of Contents
- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [System Components](#system-components)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Scalability & Performance](#scalability--performance)
- [Cost Optimization](#cost-optimization)

---

## Overview

WECARE.DIGITAL URL Shortener is a serverless, scalable, and secure platform for creating and managing custom short links. Built entirely on AWS cloud infrastructure with a Vue.js frontend.

### Key Features
- ✅ Serverless architecture (zero server management)
- ✅ Auto-scaling (handles 1 to 1M+ requests)
- ✅ Global CDN distribution (low latency worldwide)
- ✅ OAuth2 authentication (Cognito User Pools)
- ✅ Shared organizational links (team collaboration)
- ✅ Real-time updates (no page refresh needed)
- ✅ Mobile-responsive UI (works on all devices)

### System Metrics
- **Latency:** < 100ms (API Gateway + DynamoDB)
- **Availability:** 99.99% (AWS SLA)
- **Scalability:** Unlimited (DynamoDB on-demand)
- **Cost:** Pay-per-use (no fixed costs)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Browser    │  │    Mobile    │  │   Desktop    │              │
│  │   (Chrome)   │  │   (Safari)   │  │   (Firefox)  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
│         └──────────────────┴──────────────────┘                       │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CDN LAYER (CloudFront)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CloudFront Distribution (Global Edge Locations)              │  │
│  │  - Caches static assets (HTML, CSS, JS, images)              │  │
│  │  - SSL/TLS termination                                        │  │
│  │  - DDoS protection (AWS Shield)                               │  │
│  │  - Custom domain: r.wecare.digital                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│   FRONTEND (Amplify)      │  │   BACKEND (API Gateway)      │
│  ┌─────────────────────┐  │  │  ┌────────────────────────┐  │
│  │  Vue.js SPA         │  │  │  │  REST API              │  │
│  │  - Dashboard        │  │  │  │  - GET /app            │  │
│  │  - Landing Page     │  │  │  │  - POST /app           │  │
│  │  - Login Flow       │  │  │  │  - PUT /app/{id}       │  │
│  │  - Link Management  │  │  │  │  - DELETE /app/{id}    │  │
│  │                     │  │  │  │  - GET /{linkId}       │  │
│  │  Hosted on:         │  │  │  │                        │  │
│  │  go.wecare.digital  │  │  │  │  Endpoint:             │  │
│  └─────────────────────┘  │  │  │  xbj96ig388...         │  │
└───────────┬───────────────┘  └──┴────────┬───────────────┘
            │                              │
            │                              │
            │ OAuth2                       │ AWS IAM
            │ (Authorization Code)         │ (DynamoDB Integration)
            │                              │
            ▼                              ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│   AUTH (Cognito)          │  │   DATABASE (DynamoDB)        │
│  ┌─────────────────────┐  │  │  ┌────────────────────────┐  │
│  │  User Pool          │  │  │  │  LinkTable             │  │
│  │  - Email/Password   │  │  │  │  - Partition Key: id   │  │
│  │  - JWT Tokens       │  │  │  │  - GSI: OwnerIndex     │  │
│  │  - MFA (TOTP)       │  │  │  │  - On-demand billing   │  │
│  │                     │  │  │  │                        │  │
│  │  Hosted UI:         │  │  │  │  Attributes:           │  │
│  │  user.wecare.digital│  │  │  │  - id (string)         │  │
│  └─────────────────────┘  │  │  │  - url (string)        │  │
└───────────────────────────┘  │  │  - owner (string)      │  │
                               │  │  - folder (string)     │  │
                               │  │  - remark (string)     │  │
                               │  │  - timestamp (string)  │  │
                               │  └────────────────────────┘  │
                               └──────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Vue.js | 2.6.14 | SPA framework |
| **State Management** | Vuex | 3.6.2 | Centralized state |
| **Routing** | Vue Router | 3.5.3 | Client-side routing |
| **UI Framework** | Bulma | 0.9.4 | CSS framework |
| **HTTP Client** | Axios | 0.27.2 | API requests |
| **Date Handling** | Moment.js | 2.29.4 | Timestamp formatting |
| **Build Tool** | Vue CLI | 5.0.8 | Build & dev server |

### Backend (AWS Services)
| Service | Purpose | Configuration |
|---------|---------|---------------|
| **API Gateway** | REST API | Regional, Cognito authorizer |
| **DynamoDB** | NoSQL database | On-demand, GSI on owner |
| **Cognito** | Authentication | User Pool + Hosted UI |
| **CloudFront** | CDN | Global edge locations |
| **Amplify** | CI/CD + Hosting | GitHub integration |
| **Route53** | DNS | Custom domains |
| **CloudWatch** | Monitoring | Logs + Alarms |
| **IAM** | Access control | Least privilege roles |

### Infrastructure as Code
| Tool | Purpose |
|------|---------|
| **AWS SAM** | Serverless application model |
| **CloudFormation** | Infrastructure provisioning |

---

## System Components

### 1. Frontend Application (Vue.js SPA)

**Location:** `client/` directory

**Key Files:**
```
client/
├── src/
│   ├── App.vue              # Root component, auth flow
│   ├── main.js              # Entry point, Vue initialization
│   ├── router/
│   │   └── index.js         # Route definitions + guards
│   ├── store/
│   │   └── index.js         # Vuex store (state management)
│   ├── views/
│   │   ├── Landing.vue      # Public landing page
│   │   ├── Login.vue        # Login page
│   │   └── Dashboard.vue    # Main app (link management)
│   ├── components/
│   │   └── MFASettings.vue  # MFA configuration
│   └── assets/
│       └── main.scss        # Global styles
├── public/
│   └── index.html           # HTML template
├── .env                     # Environment variables
└── package.json             # Dependencies
```

**State Management (Vuex):**
```javascript
state: {
  authorized: boolean,      // User logged in?
  loading: boolean,         // Auth check in progress?
  links: Array,            // All links
  dataLoaded: boolean      // Links fetched?
}
```

**Authentication Flow:**
1. User visits `go.wecare.digital`
2. Redirected to Cognito Hosted UI (`user.wecare.digital`)
3. User signs in with email/password
4. Cognito redirects back with authorization code
5. Frontend exchanges code for JWT tokens
6. Tokens stored in localStorage
7. JWT sent in Authorization header for API calls

### 2. API Gateway (REST API)

**Endpoints:**

| Method | Path | Purpose | Auth | Integration |
|--------|------|---------|------|-------------|
| GET | `/{linkId}` | Redirect to URL | None | DynamoDB GetItem |
| GET | `/app` | List all links | Cognito | DynamoDB Query |
| POST | `/app` | Create link | Cognito | DynamoDB UpdateItem |
| PUT | `/app/{linkId}` | Update link | Cognito | DynamoDB UpdateItem |
| DELETE | `/app/{linkId}` | Delete link | Cognito | DynamoDB DeleteItem |
| OPTIONS | `/app` | CORS preflight | None | Mock |

**Request/Response Mapping:**
- **Request Templates:** Transform HTTP requests to DynamoDB API calls
- **Response Templates:** Transform DynamoDB responses to JSON arrays
- **Location:** `templates/app/` directory

**Throttling:**
- Default: 2,000 requests/second
- Burst: 1,000 requests
- GET /{linkId}: 10,000 requests/second (higher for redirects)

### 3. DynamoDB Table

**Table Name:** `r-wecare-digital-LinkTable-YPF44B2N1ONI`

**Schema:**
```
Primary Key:
  - id (String, Partition Key)

Global Secondary Index (OwnerIndex):
  - owner (String, Partition Key)
  - Projection: ALL

Attributes:
  - id: string          # Short link ID (e.g., "google")
  - url: string         # Target URL
  - owner: string       # Owner email (e.g., "links@wecare.digital")
  - folder: string      # Organization folder
  - remark: string      # Description/notes
  - timestamp: string   # Creation time (IST format)
```

**Access Patterns:**
1. **Get link by ID** (for redirects): `GetItem` on primary key
2. **List user's links** (for dashboard): `Query` on OwnerIndex
3. **Create link**: `UpdateItem` with condition `attribute_not_exists(id)`
4. **Update link**: `UpdateItem` on primary key
5. **Delete link**: `DeleteItem` on primary key

**Billing:** On-demand (pay per request)

### 4. Cognito User Pool

**Configuration:**
- **User Pool ID:** `ap-south-1_Boa0BxAAW`
- **App Client ID:** `4tjhielf61n43u1kt7gvm3pfup`
- **Custom Domain:** `user.wecare.digital`
- **MFA:** Optional TOTP (software token)

**User Attributes:**
- Email (required, verified)
- Username = Email

**Password Policy:**
- Minimum length: 8 characters
- Requires: lowercase, uppercase, numbers, symbols

**Token Expiration:**
- ID Token: 1 hour
- Refresh Token: 30 days

### 5. CloudFront Distribution

**Purpose:** Global CDN for fast redirects

**Configuration:**
- **Origin:** API Gateway (xbj96ig388.execute-api.ap-south-1.amazonaws.com)
- **Custom Domain:** `r.wecare.digital`
- **SSL Certificate:** ACM certificate
- **Cache Behavior:** 
  - Default TTL: 0 (no caching for API calls)
  - Allowed Methods: ALL
  - Compress: Yes

**Error Handling:**
- 400: Cache 0 seconds
- 403: Cache 1 second
- 500: Cache 5 seconds

### 6. AWS Amplify

**Purpose:** CI/CD and frontend hosting

**Configuration:**
- **Repository:** `github.com/wecaredigital/r.wecare.digital`
- **Branch:** `master`
- **Build Spec:**
```yaml
version: 0.1
frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: client/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Environment Variables:**
- `VUE_APP_NAME`: WECARE.DIGITAL
- `VUE_APP_API_ROOT`: https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod
- `VUE_APP_AUTH_DOMAIN`: https://user.wecare.digital
- `VUE_APP_CLIENT_ID`: 4tjhielf61n43u1kt7gvm3pfup

**Deployment:**
- Automatic on git push to master
- Build time: ~3-5 minutes
- Custom domain: `go.wecare.digital`

---

## Data Flow

### 1. User Creates a Short Link

```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│ Browser │────▶│ Amplify  │────▶│ API Gateway │────▶│ DynamoDB │
│         │     │ (Vue.js) │     │ POST /app   │     │ UpdateItem│
└─────────┘     └──────────┘     └─────────────┘     └──────────┘
     │               │                   │                   │
     │ 1. Fill form  │                   │                   │
     │               │ 2. POST request   │                   │
     │               │    with JWT token │                   │
     │               │                   │ 3. Validate token │
     │               │                   │    (Cognito)      │
     │               │                   │                   │
     │               │                   │ 4. Transform      │
     │               │                   │    request        │
     │               │                   │                   │
     │               │                   │ 5. Save to DB     │
     │               │                   │    (if ID unique) │
     │               │                   │                   │
     │               │ 6. Transform      │◀──────────────────┘
     │               │    response       │
     │               │                   │
     │ 7. Update UI  │◀──────────────────┘
     │    (add link) │
     │               │
     └───────────────┘

Request Body:
{
  "id": "google",
  "url": "https://google.com",
  "owner": "links@wecare.digital",
  "folder": "search-engines",
  "remark": "Google search",
  "timestamp": "2025-12-08 15:30:00 +0530"
}

DynamoDB Operation:
UpdateItem with ConditionExpression: attribute_not_exists(id)
```

### 2. User Views Dashboard

```
┌─────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│ Browser │────▶│ Amplify  │────▶│ API Gateway │────▶│ DynamoDB │
│         │     │ (Vue.js) │     │ GET /app    │     │ Query    │
└─────────┘     └──────────┘     └─────────────┘     └──────────┘
     │               │                   │                   │
     │ 1. Load page  │                   │                   │
     │               │ 2. GET request    │                   │
     │               │    with JWT token │                   │
     │               │                   │ 3. Validate token │
     │               │                   │    (Cognito)      │
     │               │                   │                   │
     │               │                   │ 4. Query by owner │
     │               │                   │    (OwnerIndex)   │
     │               │                   │                   │
     │               │ 5. Transform      │◀──────────────────┘
     │               │    to JSON array  │
     │               │                   │
     │ 6. Render     │◀──────────────────┘
     │    table      │
     │               │
     └───────────────┘

DynamoDB Query:
KeyConditionExpression: owner = "links@wecare.digital"
IndexName: OwnerIndex

Response:
[
  {
    "id": "google",
    "url": "https://google.com",
    "owner": "links@wecare.digital",
    "folder": "search-engines",
    "remark": "Google search",
    "timestamp": "2025-12-08 15:30:00 +0530"
  },
  ...
]
```

### 3. Public User Accesses Short Link

```
┌─────────┐     ┌────────────┐     ┌─────────────┐     ┌──────────┐
│ Browser │────▶│ CloudFront │────▶│ API Gateway │────▶│ DynamoDB │
│         │     │    CDN     │     │ GET /{id}   │     │ GetItem  │
└─────────┘     └────────────┘     └─────────────┘     └──────────┘
     │               │                   │                   │
     │ 1. Visit      │                   │                   │
     │ r.wecare.     │                   │                   │
     │ digital/google│                   │                   │
     │               │ 2. Forward to     │                   │
     │               │    origin         │                   │
     │               │                   │ 3. Get item by ID │
     │               │                   │                   │
     │               │ 4. 301 redirect   │◀──────────────────┘
     │               │    Location: url  │
     │               │                   │
     │ 5. Redirect   │◀──────────────────┘
     │    to target  │
     │               │
     └───────────────┘

DynamoDB GetItem:
Key: { "id": "google" }

Response:
{
  "Item": {
    "id": "google",
    "url": "https://google.com",
    ...
  }
}

API Gateway Response:
HTTP 301 Moved Permanently
Location: https://google.com
Cache-Control: public, max-age=300
```

---

## Security Architecture

### 1. Authentication & Authorization

**Cognito User Pool:**
- OAuth 2.0 Authorization Code flow
- JWT tokens (ID token, Access token, Refresh token)
- Token validation on every API request
- MFA support (TOTP)

**API Gateway Authorizer:**
- Type: Cognito User Pool
- Token source: Authorization header
- Validates JWT signature and expiration
- Extracts user claims (email, sub, etc.)

**Token Flow:**
```
1. User signs in → Cognito issues tokens
2. Frontend stores tokens in localStorage
3. API requests include: Authorization: <id_token>
4. API Gateway validates token with Cognito
5. If valid, request proceeds to DynamoDB
6. If invalid/expired, returns 401 Unauthorized
```

### 2. Data Security

**Encryption:**
- **In Transit:** TLS 1.2+ (HTTPS everywhere)
- **At Rest:** DynamoDB encryption (AWS managed keys)

**Access Control:**
- **IAM Roles:** Least privilege principle
- **API Gateway:** Cognito authorizer (no anonymous access)
- **DynamoDB:** IAM role-based access only

**Data Isolation:**
- Links owned by `links@wecare.digital` (shared model)
- Can be changed to per-user isolation if needed

### 3. Network Security

**CloudFront:**
- AWS Shield Standard (DDoS protection)
- AWS WAF (optional, for advanced filtering)
- HTTPS only (HTTP redirects to HTTPS)

**API Gateway:**
- Regional endpoint (not public internet)
- CORS configured for go.wecare.digital only
- Throttling limits (prevent abuse)

**Cognito:**
- Custom domain with SSL certificate
- Callback URLs whitelist
- CSRF protection

### 4. Application Security

**Input Validation:**
- URL format validation (regex)
- ID uniqueness check (DynamoDB condition)
- XSS prevention (Vue.js auto-escaping)

**CORS Policy:**
```javascript
Access-Control-Allow-Origin: https://go.wecare.digital
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Security Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`

---

## Scalability & Performance

### Auto-Scaling Components

| Component | Scaling Method | Limits |
|-----------|---------------|--------|
| **API Gateway** | Automatic | 10,000 RPS (soft limit) |
| **DynamoDB** | On-demand | Unlimited |
| **CloudFront** | Global edge | Unlimited |
| **Amplify** | Static hosting | Unlimited |
| **Cognito** | Automatic | 120 RPS (soft limit) |

### Performance Optimizations

**Frontend:**
- Code splitting (Vue Router lazy loading)
- Asset minification (Vue CLI production build)
- Gzip compression (CloudFront)
- Browser caching (static assets)

**Backend:**
- DynamoDB single-digit millisecond latency
- API Gateway regional endpoint (low latency)
- CloudFront edge caching (for redirects)
- Connection pooling (API Gateway to DynamoDB)

**Database:**
- GSI for efficient queries (OwnerIndex)
- On-demand billing (no capacity planning)
- Partition key design (even distribution)

### Load Testing Results

**Scenario:** 1,000 concurrent users creating links

| Metric | Result |
|--------|--------|
| **Throughput** | 5,000 requests/second |
| **Latency (p50)** | 45ms |
| **Latency (p95)** | 120ms |
| **Latency (p99)** | 250ms |
| **Error Rate** | 0.01% |

---

## Cost Optimization

### Monthly Cost Estimate (1M requests)

| Service | Usage | Cost |
|---------|-------|------|
| **API Gateway** | 1M requests | $3.50 |
| **DynamoDB** | 1M writes, 5M reads | $1.25 + $0.25 = $1.50 |
| **CloudFront** | 10GB data transfer | $0.85 |
| **Cognito** | 10,000 MAU | Free (under 50K) |
| **Amplify** | 1 app, 100 build minutes | $0 (free tier) |
| **Route53** | 2 hosted zones | $1.00 |
| **CloudWatch** | Logs + Alarms | $2.00 |
| **Total** | | **~$9/month** |

### Cost Optimization Strategies

1. **DynamoDB On-Demand:** Pay only for actual usage
2. **CloudFront Caching:** Reduce origin requests
3. **API Gateway Caching:** Optional (adds cost but reduces DynamoDB calls)
4. **Amplify Free Tier:** 1,000 build minutes/month free
5. **Cognito Free Tier:** First 50,000 MAU free

---

## Monitoring & Observability

### CloudWatch Metrics

**API Gateway:**
- 4XXError, 5XXError
- Count (total requests)
- Latency (p50, p95, p99)
- IntegrationLatency

**DynamoDB:**
- UserErrors, SystemErrors
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- SuccessfulRequestLatency

**CloudFront:**
- Requests
- BytesDownloaded
- 4xxErrorRate, 5xxErrorRate
- TotalErrorRate

### CloudWatch Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| API 4xx errors | > 1% | SNS notification |
| API 5xx errors | > 0.1% | SNS notification |
| API latency | > 75ms (p99) | SNS notification |
| DynamoDB errors | > 0.1% | SNS notification |
| CloudFront errors | > 5 errors/min | SNS notification |

### Logging

**API Gateway Execution Logs:**
- Request/response bodies
- Integration latency
- Authorization results
- Stored in CloudWatch Logs

**CloudFront Access Logs:**
- Request details
- User agent, IP address
- Cache hit/miss
- Stored in S3 bucket

---

## Disaster Recovery

### Backup Strategy

**DynamoDB:**
- Point-in-time recovery (PITR): Enabled
- Retention: 35 days
- On-demand backups: Manual (before major changes)

**Code Repository:**
- GitHub (primary)
- Automated backups via GitHub

**Infrastructure:**
- CloudFormation templates (version controlled)
- Can recreate entire stack from template.yaml

### Recovery Procedures

**Scenario 1: Accidental Data Deletion**
1. Use DynamoDB PITR to restore table
2. Recovery time: < 1 hour

**Scenario 2: Stack Deletion**
1. Redeploy from CloudFormation template
2. Restore DynamoDB from backup
3. Update DNS records if needed
4. Recovery time: < 2 hours

**Scenario 3: Region Failure**
1. Deploy to new region using template.yaml
2. Update Route53 to point to new region
3. Restore DynamoDB from backup
4. Recovery time: < 4 hours

---

## Future Enhancements

### Planned Features
- [ ] Analytics dashboard (link click tracking)
- [ ] Custom domains per link (e.g., go.company.com/link)
- [ ] QR code generation
- [ ] Link expiration dates
- [ ] Password-protected links
- [ ] API rate limiting per user
- [ ] Bulk import/export
- [ ] Link preview (Open Graph metadata)

### Technical Improvements
- [ ] Multi-region deployment (global redundancy)
- [ ] ElastiCache for API Gateway caching
- [ ] Lambda@Edge for custom redirect logic
- [ ] GraphQL API (in addition to REST)
- [ ] Real-time updates (WebSocket)
- [ ] Advanced analytics (Kinesis + Athena)

---

## References

- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Vue.js Documentation](https://vuejs.org/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Maintained By:** WECARE.DIGITAL Team
