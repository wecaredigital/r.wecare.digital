# URL Shortener Platform – Development Guide

## Overview

This guide helps developers set up a local development environment, understand the codebase structure, and contribute to the URL Shortener Platform.

---

## Development Workflow Overview

```mermaid
graph TB
    Start[Start Development] --> Setup{Environment<br/>Setup?}
    
    Setup -->|No| Install[Install Prerequisites:<br/>Node.js, npm, Git,<br/>AWS CLI]
    Install --> Clone[Clone Repository]
    Clone --> Deps[Install Dependencies:<br/>npm install]
    Deps --> Env[Configure .env File]
    Env --> Setup
    
    Setup -->|Yes| Task{Development<br/>Task?}
    
    Task -->|New Feature| Branch[Create Feature Branch:<br/>git checkout -b feature/xyz]
    Task -->|Bug Fix| Branch
    Task -->|Refactor| Branch
    
    Branch --> Code[Write Code:<br/>Edit files in client/src/]
    Code --> DevServer[Run Dev Server:<br/>npm run serve]
    
    DevServer --> Test[Test Locally:<br/>http://localhost:8080]
    Test --> Works{Works?}
    
    Works -->|No| Debug[Debug:<br/>Vue DevTools,<br/>Console, Network Tab]
    Debug --> Code
    
    Works -->|Yes| Commit[Commit Changes:<br/>git commit -m "feat: xyz"]
    Commit --> Push[Push to GitHub:<br/>git push origin feature/xyz]
    
    Push --> PR[Create Pull Request]
    PR --> Review{Code Review<br/>Approved?}
    
    Review -->|No| Feedback[Address Feedback]
    Feedback --> Code
    
    Review -->|Yes| Merge[Merge to Master]
    Merge --> Deploy[Auto-Deploy:<br/>Amplify builds and deploys]
    
    Deploy --> Monitor[Monitor:<br/>CloudWatch Logs,<br/>Alarms, Metrics]
    
    Monitor --> Done[Development Complete!]
    
    style Start fill:#e3f2fd
    style Done fill:#e8f5e9
    style Debug fill:#ffebee
    style Code fill:#fff3e0
```

---

## Development Environment Setup

### Prerequisites

- **Node.js**: 14.x or higher
- **npm**: 6.x or higher
- **Git**: Latest version
- **AWS CLI**: Latest version (for testing against AWS services)
- **Code Editor**: VS Code (recommended) or any editor with Vue.js support

---

### Clone Repository

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/r.wecare.digital.git
cd r.wecare.digital

# Add upstream remote (for syncing with original repo)
git remote add upstream https://github.com/ORIGINAL-OWNER/r.wecare.digital.git
```

---

### Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# Return to root
cd ..
```

---

### Configure Environment Variables

Create `client/.env` file:

```bash
# Application name
VUE_APP_NAME=shortener

# Cognito User Pool Client ID (from AWS deployment)
VUE_APP_CLIENT_ID=your-client-id-here

# API Gateway URL (via CloudFront)
VUE_APP_API_ROOT=https://your-cloudfront-url-here

# Cognito custom domain
VUE_APP_AUTH_DOMAIN=https://user.wecare.digital
```

**How to Get Values**:
```bash
# Deploy to AWS first (see 02-deployment.md)
# Then get values from CloudFormation outputs
aws cloudformation describe-stacks \
  --stack-name url-shortener-prod \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs'
```

---

### Run Development Server

```bash
cd client
npm run serve

# Server will start at http://localhost:8080
# Hot-reload enabled (changes reflect immediately)
```

**Note**: You must deploy to AWS first to have a working API backend. Local development uses the deployed API Gateway endpoint.

---

## Project Structure

```
r.wecare.digital/
├── client/                      # Vue.js frontend
│   ├── public/                  # Static assets
│   │   ├── index.html          # HTML template
│   │   └── favicon.ico         # Favicon
│   ├── src/                     # Source code
│   │   ├── assets/             # Images, styles
│   │   │   └── main.scss       # Global styles (Tailwind CSS)
│   │   ├── components/         # Reusable Vue components
│   │   │   ├── LinkCard.vue    # Link display card
│   │   │   ├── LinkForm.vue    # Create/edit link form
│   │   │   └── Navbar.vue      # Navigation bar
│   │   ├── router/             # Vue Router configuration
│   │   │   └── index.js        # Route definitions
│   │   ├── store/              # Vuex state management
│   │   │   ├── index.js        # Store configuration
│   │   │   └── modules/        # Store modules
│   │   │       ├── auth.js     # Authentication state
│   │   │       └── links.js    # Links state
│   │   ├── views/              # Page components
│   │   │   ├── Dashboard.vue   # Main dashboard
│   │   │   ├── Login.vue       # Login page
│   │   │   └── MFA.vue         # MFA enrollment page
│   │   ├── App.vue             # Root component
│   │   └── main.js             # Application entry point
│   ├── .env                     # Environment variables (local)
│   ├── babel.config.js         # Babel configuration
│   ├── package.json            # Dependencies
│   ├── postcss.config.js       # PostCSS configuration
│   └── README.md               # Frontend README
├── docs/                        # Documentation
│   ├── 01-architecture.md      # Architecture documentation
│   ├── 02-deployment.md        # Deployment guide
│   ├── 03-configuration.md     # Configuration reference
│   ├── 04-development.md       # This file
│   └── archive-legacy-md/      # Archived old documentation
├── templates/                   # API Gateway integration templates
│   ├── app/                    # /app endpoint templates
│   │   ├── get-request.json    # GET /app integration request
│   │   ├── get-response.vtl    # GET /app integration response
│   │   ├── post-request.json   # POST /app integration request
│   │   └── post-response.vtl   # POST /app integration response
│   └── linkId/                 # /{linkId} endpoint templates
│       ├── get-request.json    # GET /{linkId} integration request
│       └── get-response.vtl    # GET /{linkId} integration response
├── api.yaml                     # OpenAPI 3.0.1 specification
├── template.yaml               # AWS SAM template (CloudFormation)
├── README.md                   # Project README
└── .gitignore                  # Git ignore rules
```

---

## Frontend Architecture

### Technology Stack

- **Framework**: Vue.js 2.x
- **State Management**: Vuex
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Authentication**: AWS Amplify Auth
- **Styling**: Tailwind CSS
- **Build Tool**: Vue CLI / Webpack

---

### Key Components

#### Dashboard.vue

**Purpose**: Main dashboard for link management

**Features**:
- List all user's links
- Search links by ID, URL, folder, or remark
- Filter links by folder
- Pagination (10 links per page)
- Create new link (modal)
- Edit existing link (modal)
- Delete link (confirmation dialog)
- Copy short link to clipboard

**State Management**:
- Uses Vuex `links` module
- Actions: `fetchLinks`, `createLink`, `updateLink`, `deleteLink`
- Getters: `allLinks`, `filteredLinks`, `paginatedLinks`

**API Calls**:
- GET /app (fetch links)
- POST /app (create link)
- PUT /app/{linkId} (update link)
- DELETE /app/{linkId} (delete link)

---

#### Login.vue

**Purpose**: Authentication page

**Features**:
- Sign in with email and password
- Redirect to Cognito hosted UI
- Handle OAuth callback
- Store JWT tokens in session storage
- Redirect to dashboard after successful login

**State Management**:
- Uses Vuex `auth` module
- Actions: `signIn`, `signOut`, `checkAuth`
- Getters: `isAuthenticated`, `currentUser`

**Authentication Flow**:
1. User clicks "Sign In"
2. Redirect to Cognito hosted UI: `https://user.wecare.digital/login`
3. User enters credentials
4. Cognito redirects back with authorization code
5. Frontend exchanges code for JWT tokens (handled by Amplify)
6. Tokens stored in session storage
7. Redirect to dashboard

---

#### MFA.vue

**Purpose**: TOTP MFA enrollment and management

**Features**:
- Check MFA status
- Generate QR code for TOTP setup
- Verify TOTP code
- Enable/disable MFA
- Authenticate with TOTP code

**API Calls**:
- GET /app/mfa/status (check MFA status)
- POST /app/mfa/setup (generate QR code)
- POST /app/mfa/verify (verify and enable MFA)
- POST /app/mfa/authenticate (authenticate with TOTP)
- POST /app/mfa/disable (disable MFA)

---

### Vuex Store Structure

#### auth Module

**State**:
```javascript
{
  user: null,           // Current user object
  isAuthenticated: false, // Authentication status
  tokens: {             // JWT tokens
    idToken: null,
    accessToken: null,
    refreshToken: null
  }
}
```

**Actions**:
- `signIn()` – Redirect to Cognito hosted UI
- `signOut()` – Clear tokens and redirect to login
- `checkAuth()` – Verify token validity
- `refreshTokens()` – Refresh expired tokens

**Getters**:
- `isAuthenticated` – Boolean authentication status
- `currentUser` – Current user object
- `userEmail` – User's email address

---

#### links Module

**State**:
```javascript
{
  links: [],            // Array of link objects
  loading: false,       // Loading state
  error: null,          // Error message
  searchQuery: '',      // Search query
  selectedFolder: '',   // Selected folder filter
  currentPage: 1,       // Current pagination page
  itemsPerPage: 10      // Items per page
}
```

**Actions**:
- `fetchLinks()` – GET /app
- `createLink(linkData)` – POST /app
- `updateLink(linkId, linkData)` – PUT /app/{linkId}
- `deleteLink(linkId)` – DELETE /app/{linkId}

**Getters**:
- `allLinks` – All links
- `filteredLinks` – Links filtered by search and folder
- `paginatedLinks` – Links for current page
- `totalPages` – Total number of pages
- `folders` – Unique folder names

---

### API Client

**Location**: `client/src/api/client.js` (if exists) or inline in Vuex actions

**Configuration**:
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_ROOT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Authorization header to all requests
apiClient.interceptors.request.use(config => {
  const token = sessionStorage.getItem('idToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Backend Architecture

### API Gateway Direct Integrations

**No Lambda functions** – API Gateway directly integrates with DynamoDB using VTL (Velocity Template Language) for request/response transformations.

**Advantages**:
- Lower latency (no Lambda cold starts)
- Lower cost (no Lambda invocations)
- Simpler architecture (fewer moving parts)

**Trade-offs**:
- VTL is less flexible than code
- Harder to debug (no breakpoints)
- Complex business logic requires Lambda

---

### VTL Template Development

**Location**: Embedded in `api.yaml` or separate files in `templates/` directory

**Example**: GET /app Integration Request
```velocity
{
  "TableName": "${table_name}",
  "IndexName": "OwnerIndex",
  "KeyConditionExpression": "#n_owner = :v_owner",
  "ExpressionAttributeValues": {
    ":v_owner": {"S": "$context.authorizer.claims.email"}
  },
  "ExpressionAttributeNames": {
    "#n_owner": "owner"
  }
}
```

**Testing VTL Templates**:
1. Deploy to AWS
2. Test via API Gateway console "Test" feature
3. Check CloudWatch logs for request/response transformations
4. Iterate and redeploy

**VTL Utility Functions**:
- `$input.path('$.field')` – Extract field from JSON
- `$input.json('$.field')` – Extract field as JSON string
- `$util.defaultIfNull(value, default)` – Return default if value is null
- `$context.requestTime` – Current request timestamp
- `$context.authorizer.claims.email` – User email from JWT

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout master
git merge upstream/master

# Create feature branch
git checkout -b feature/my-new-feature
```

---

### 2. Make Changes

**Frontend Changes**:
```bash
cd client
npm run serve

# Edit files in client/src/
# Changes reflect immediately (hot-reload)
```

**Backend Changes**:
```bash
# Edit template.yaml or api.yaml
# Deploy to AWS
sam deploy

# Test changes
curl -X GET https://your-api-url/app \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Test Changes

**Frontend Testing**:
```bash
# Run unit tests (if configured)
cd client
npm run test:unit

# Run E2E tests (if configured)
npm run test:e2e

# Manual testing
npm run serve
# Open http://localhost:8080 in browser
```

**Backend Testing**:
```bash
# Test API endpoints with curl
curl -X POST https://your-api-url/app \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","url":"https://example.com","folder":"testing","remark":"Test link"}'

# Check CloudWatch logs
aws logs tail /aws/apigateway/{api-id}/Prod --follow --region ap-south-1
```

---

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: Add folder filter to dashboard"

# Push to your fork
git push origin feature/my-new-feature
```

**Commit Message Convention** (recommended):
- `feat:` – New feature
- `fix:` – Bug fix
- `docs:` – Documentation changes
- `style:` – Code style changes (formatting, no logic change)
- `refactor:` – Code refactoring (no feature change)
- `test:` – Add or update tests
- `chore:` – Build process or tooling changes

---

### 5. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your feature branch
4. Fill in PR description:
   - What changed
   - Why it changed
   - How to test
   - Screenshots (if UI changes)
5. Submit PR for review

---

## Common Development Tasks

### Add New API Endpoint

1. **Update OpenAPI Spec** (`api.yaml`):
```yaml
/app/stats:
  get:
    parameters:
      - name: "Authorization"
        in: "header"
        required: true
        schema:
          type: "string"
    responses:
      "200":
        description: "200 response"
        headers:
          Access-Control-Allow-Origin:
            schema:
              type: "string"
        content: {}
    security:
      - UserAuthorizer: []
```

2. **Add Integration in SAM Template** (`template.yaml`):
```yaml
# Add x-amazon-apigateway-integration to api.yaml
x-amazon-apigateway-integration:
  type: "aws"
  httpMethod: "POST"
  uri: !Sub "arn:aws:apigateway:${AWS::Region}:dynamodb:action/Query"
  credentials: !GetAtt DDBReadRole.Arn
  requestTemplates:
    application/json: |
      {
        "TableName": "${LinkTable}",
        "Select": "COUNT"
      }
  responses:
    default:
      statusCode: "200"
      responseTemplates:
        application/json: |
          {
            "count": $input.path('$.Count')
          }
```

3. **Deploy**:
```bash
sam deploy
```

4. **Add Frontend API Call**:
```javascript
// In Vuex action
async fetchStats({ commit }) {
  const response = await apiClient.get('/app/stats');
  commit('SET_STATS', response.data);
}
```

---

### Add New Vue Component

1. **Create Component File** (`client/src/components/MyComponent.vue`):
```vue
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
.my-component {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
</style>
```

2. **Import and Use**:
```vue
<template>
  <div>
    <MyComponent title="Hello" description="World" />
  </div>
</template>

<script>
import MyComponent from '@/components/MyComponent.vue';

export default {
  components: {
    MyComponent
  }
};
</script>
```

---

### Add New Vuex Module

1. **Create Module File** (`client/src/store/modules/stats.js`):
```javascript
export default {
  namespaced: true,
  state: {
    totalLinks: 0,
    totalClicks: 0
  },
  mutations: {
    SET_STATS(state, stats) {
      state.totalLinks = stats.totalLinks;
      state.totalClicks = stats.totalClicks;
    }
  },
  actions: {
    async fetchStats({ commit }) {
      const response = await apiClient.get('/app/stats');
      commit('SET_STATS', response.data);
    }
  },
  getters: {
    totalLinks: state => state.totalLinks,
    totalClicks: state => state.totalClicks
  }
};
```

2. **Register Module** (`client/src/store/index.js`):
```javascript
import Vue from 'vue';
import Vuex from 'vuex';
import auth from './modules/auth';
import links from './modules/links';
import stats from './modules/stats'; // Add this

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    links,
    stats // Add this
  }
});
```

3. **Use in Component**:
```vue
<template>
  <div>
    <p>Total Links: {{ totalLinks }}</p>
    <p>Total Clicks: {{ totalClicks }}</p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  computed: {
    ...mapGetters('stats', ['totalLinks', 'totalClicks'])
  },
  methods: {
    ...mapActions('stats', ['fetchStats'])
  },
  mounted() {
    this.fetchStats();
  }
};
</script>
```

---

### Update Tailwind CSS Configuration

1. **Edit** `client/tailwind.config.js` (if exists) or `client/postcss.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981'
      }
    }
  },
  plugins: []
};
```

2. **Use in Component**:
```vue
<template>
  <button class="bg-primary text-white px-4 py-2 rounded">
    Click Me
  </button>
</template>
```

---

## Debugging

### Frontend Debugging

**Vue DevTools**:
1. Install Vue DevTools browser extension
2. Open DevTools in browser (F12)
3. Click "Vue" tab
4. Inspect components, Vuex state, events

**Console Logging**:
```javascript
// In component
console.log('Current user:', this.$store.getters['auth/currentUser']);

// In Vuex action
console.log('Fetching links...');
const response = await apiClient.get('/app');
console.log('Response:', response.data);
```

**Network Tab**:
1. Open DevTools (F12)
2. Click "Network" tab
3. Filter by "XHR" or "Fetch"
4. Inspect API requests/responses

---

### Backend Debugging

**CloudWatch Logs**:
```bash
# Tail API Gateway logs
aws logs tail /aws/apigateway/{api-id}/Prod --follow --region ap-south-1

# Filter by error
aws logs tail /aws/apigateway/{api-id}/Prod --follow --filter-pattern "ERROR" --region ap-south-1
```

**API Gateway Test Console**:
1. Go to API Gateway Console
2. Select API → Resources → Method (e.g., GET /app)
3. Click "Test"
4. Enter Authorization header: `Bearer {jwt-token}`
5. Click "Test"
6. View request/response transformations

**X-Ray Tracing**:
1. Go to X-Ray Console
2. Click "Service Map"
3. View request flow: API Gateway → DynamoDB
4. Click on node to see latency breakdown

---

## Development Productivity Tips

### 1. Use Vue DevTools

**Installation**:
- Chrome: [Vue.js devtools](https://chrome.google.com/webstore/detail/vuejs-devtools/)
- Firefox: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

**Features**:
- Inspect component hierarchy
- View Vuex state and mutations
- Time-travel debugging
- Performance profiling

**Usage**:
```javascript
// In component
this.$store.commit('SET_LINKS', links);
// DevTools shows mutation in real-time
```

---

### 2. Hot Module Replacement (HMR)

**What it does**: Updates code without full page reload.

**Configuration** (already enabled in Vue CLI):
```javascript
// webpack.config.js
module.exports = {
  devServer: {
    hot: true,
    port: 8080
  }
};
```

**Usage**:
- Edit `.vue` file
- Save
- Browser updates instantly (no refresh)

---

### 3. VS Code Extensions

**Recommended Extensions**:
- **Vetur**: Vue.js syntax highlighting and IntelliSense
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **GitLens**: Git blame and history
- **AWS Toolkit**: AWS resource management
- **REST Client**: Test API endpoints

**Configuration** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.autoFixOnSave": true,
  "vetur.validation.template": true
}
```

---

### 4. Code Snippets

**Vue Component Snippet** (`.vscode/vue.code-snippets`):
```json
{
  "Vue Component": {
    "prefix": "vcomp",
    "body": [
      "<template>",
      "  <div class=\"${1:component-name}\">",
      "    ${2:<!-- content -->}",
      "  </div>",
      "</template>",
      "",
      "<script>",
      "export default {",
      "  name: '${1:ComponentName}',",
      "  props: {},",
      "  data() {",
      "    return {};",
      "  },",
      "  computed: {},",
      "  methods: {}",
      "};",
      "</script>",
      "",
      "<style scoped>",
      ".${1:component-name} {",
      "  ${3:/* styles */}",
      "}",
      "</style>"
    ]
  }
}
```

**Usage**: Type `vcomp` and press Tab.

---

### 5. Local API Mocking

**Why**: Develop frontend without deploying backend.

**Setup** (`client/src/api/mock.js`):
```javascript
const mockLinks = [
  {
    id: 'google',
    url: 'https://google.com',
    owner: 'dev@example.com',
    timestamp: '2025-12-09T10:00:00Z',
    folder: 'search',
    remark: 'Google search'
  }
];

export default {
  getLinks: () => Promise.resolve(mockLinks),
  createLink: (link) => Promise.resolve({ ...link, timestamp: new Date().toISOString() }),
  updateLink: (id, link) => Promise.resolve(link),
  deleteLink: (id) => Promise.resolve()
};
```

**Usage**:
```javascript
// In Vuex action
import mockApi from '@/api/mock';

const USE_MOCK = process.env.VUE_APP_USE_MOCK === 'true';
const api = USE_MOCK ? mockApi : realApi;

export const fetchLinks = async ({ commit }) => {
  const links = await api.getLinks();
  commit('SET_LINKS', links);
};
```

---

### 6. Git Workflow Best Practices

**Branch Naming**:
```
feature/add-folder-filter
bugfix/fix-pagination-error
hotfix/security-patch
refactor/improve-performance
docs/update-readme
```

**Commit Message Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Build/tooling

**Example**:
```
feat(dashboard): Add folder filter dropdown

- Add dropdown component to filter links by folder
- Update Vuex getter to filter by selected folder
- Add "All Folders" option to show all links
- Add unit tests for filter functionality

Closes #123
```

---

### 7. Debugging Techniques

**Console Logging**:
```javascript
// Basic logging
console.log('User:', this.user);

// Grouped logging
console.group('API Call');
console.log('URL:', url);
console.log('Headers:', headers);
console.log('Body:', body);
console.groupEnd();

// Table logging
console.table(links);

// Performance timing
console.time('fetchLinks');
await fetchLinks();
console.timeEnd('fetchLinks');
```

**Vue DevTools Debugging**:
```javascript
// In component
mounted() {
  // Breakpoint here
  debugger;
  this.fetchLinks();
}
```

**Network Debugging**:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by XHR
4. Click request to see details
5. Check Request Headers, Response, Timing

---

## Real-World Development Scenarios

### Scenario 1: Adding a New Feature (Bulk Delete)

**Requirement**: Allow users to select multiple links and delete them at once.

**Implementation Steps**:

1. **Create Feature Branch**:
```bash
git checkout -b feature/bulk-delete
```

2. **Update Dashboard Component** (`client/src/views/Dashboard.vue`):
```vue
<template>
  <div class="dashboard">
    <!-- Add checkbox column -->
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
          <th>ID</th>
          <th>URL</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="link in links" :key="link.id">
          <td><input type="checkbox" v-model="selectedLinks" :value="link.id"></td>
          <td>{{ link.id }}</td>
          <td>{{ link.url }}</td>
          <td>...</td>
        </tr>
      </tbody>
    </table>
    
    <!-- Add bulk delete button -->
    <button 
      v-if="selectedLinks.length > 0" 
      @click="bulkDelete"
      class="btn-danger"
    >
      Delete {{ selectedLinks.length }} links
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedLinks: [],
      selectAll: false
    };
  },
  methods: {
    toggleSelectAll() {
      this.selectedLinks = this.selectAll ? this.links.map(l => l.id) : [];
    },
    async bulkDelete() {
      if (!confirm(`Delete ${this.selectedLinks.length} links?`)) return;
      
      try {
        await Promise.all(
          this.selectedLinks.map(id => this.$store.dispatch('links/deleteLink', id))
        );
        this.$toast.success(`Deleted ${this.selectedLinks.length} links`);
        this.selectedLinks = [];
        this.selectAll = false;
      } catch (error) {
        this.$toast.error('Failed to delete links');
      }
    }
  }
};
</script>
```

3. **Test Locally**:
```bash
npm run serve
# Open http://localhost:8080
# Test bulk delete functionality
```

4. **Commit and Push**:
```bash
git add .
git commit -m "feat(dashboard): Add bulk delete functionality"
git push origin feature/bulk-delete
```

5. **Create Pull Request** on GitHub

**Time**: ~2 hours

---

### Scenario 2: Fixing a Bug (Pagination Not Working)

**Bug Report**: Pagination shows wrong page numbers after filtering.

**Investigation**:

1. **Reproduce Bug**:
```bash
npm run serve
# Navigate to dashboard
# Apply filter
# Click pagination
# Observe: Page numbers don't update
```

2. **Check Vuex Getter** (`client/src/store/modules/links.js`):
```javascript
// Bug: totalPages uses allLinks instead of filteredLinks
totalPages: (state, getters) => {
  return Math.ceil(state.links.length / state.itemsPerPage);
  // Should be: getters.filteredLinks.length
}
```

3. **Fix**:
```javascript
totalPages: (state, getters) => {
  return Math.ceil(getters.filteredLinks.length / state.itemsPerPage);
}
```

4. **Test Fix**:
```bash
# Verify pagination works correctly after filtering
```

5. **Commit**:
```bash
git checkout -b bugfix/pagination-filter
git add .
git commit -m "fix(dashboard): Fix pagination after filtering

- Use filteredLinks.length instead of allLinks.length
- Reset to page 1 when filter changes
- Add unit test for pagination with filters

Fixes #456"
git push origin bugfix/pagination-filter
```

**Time**: ~30 minutes

---

### Scenario 3: Performance Optimization (Slow Dashboard Load)

**Issue**: Dashboard takes 3 seconds to load with 1000 links.

**Investigation**:

1. **Profile Performance**:
```javascript
// In Dashboard.vue
mounted() {
  console.time('Dashboard Mount');
  this.fetchLinks();
  console.timeEnd('Dashboard Mount');
}
```

2. **Identify Bottleneck**:
- Vue DevTools Performance tab shows slow rendering
- 1000 DOM nodes created at once

3. **Implement Virtual Scrolling**:
```bash
npm install vue-virtual-scroller
```

```vue
<template>
  <RecycleScroller
    :items="filteredLinks"
    :item-size="60"
    key-field="id"
    v-slot="{ item }"
  >
    <LinkCard :link="item" />
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  components: { RecycleScroller }
};
</script>
```

4. **Test Performance**:
```javascript
// Before: 3000ms
// After: 200ms
// Improvement: 15x faster
```

5. **Commit**:
```bash
git checkout -b perf/virtual-scrolling
git add .
git commit -m "perf(dashboard): Implement virtual scrolling

- Add vue-virtual-scroller for large lists
- Render only visible items (60px each)
- Reduce initial render time from 3s to 200ms

Closes #789"
git push origin perf/virtual-scrolling
```

**Time**: ~1 hour

---

## Testing

### Unit Testing (Frontend)

**Framework**: Jest + Vue Test Utils

**Example Test** (`client/tests/unit/LinkCard.spec.js`):
```javascript
import { shallowMount } from '@vue/test-utils';
import LinkCard from '@/components/LinkCard.vue';

describe('LinkCard.vue', () => {
  it('renders link data', () => {
    const link = {
      id: 'google',
      url: 'https://google.com',
      folder: 'search',
      remark: 'Google search'
    };
    const wrapper = shallowMount(LinkCard, {
      propsData: { link }
    });
    expect(wrapper.text()).toContain('google');
    expect(wrapper.text()).toContain('https://google.com');
  });
});
```

**Run Tests**:
```bash
cd client
npm run test:unit
```

---

### Integration Testing (API)

**Tool**: Postman or curl

**Example Test Script** (`tests/api-integration.sh`):
```bash
#!/bin/bash

API_URL="https://your-api-url"
JWT_TOKEN="your-jwt-token"

# Test GET /app
echo "Testing GET /app..."
curl -X GET "$API_URL/app" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -w "\nStatus: %{http_code}\n"

# Test POST /app
echo "Testing POST /app..."
curl -X POST "$API_URL/app" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","url":"https://example.com","folder":"testing","remark":"Test"}' \
  -w "\nStatus: %{http_code}\n"

# Test DELETE /app/{linkId}
echo "Testing DELETE /app/test123..."
curl -X DELETE "$API_URL/app/test123" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -w "\nStatus: %{http_code}\n"
```

---

### E2E Testing (Frontend)

**Framework**: Cypress or Playwright

**Example Test** (`client/tests/e2e/dashboard.spec.js`):
```javascript
describe('Dashboard', () => {
  beforeEach(() => {
    // Mock authentication
    cy.visit('/login');
    cy.get('[data-cy=email]').type('test@example.com');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
  });

  it('displays user links', () => {
    cy.get('[data-cy=link-card]').should('have.length.greaterThan', 0);
  });

  it('creates new link', () => {
    cy.get('[data-cy=create-link-btn]').click();
    cy.get('[data-cy=link-id]').type('test123');
    cy.get('[data-cy=link-url]').type('https://example.com');
    cy.get('[data-cy=submit]').click();
    cy.contains('test123').should('be.visible');
  });
});
```

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**:
```javascript
// In router/index.js
const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue');
const Login = () => import(/* webpackChunkName: "login" */ '@/views/Login.vue');
```

**Lazy Loading Images**:
```vue
<template>
  <img v-lazy="imageUrl" alt="Description">
</template>
```

**Vuex State Persistence**:
```javascript
// Save state to localStorage
store.subscribe((mutation, state) => {
  localStorage.setItem('vuex-state', JSON.stringify(state));
});
```

---

### Backend Optimization

**DynamoDB Query Optimization**:
- Use `ProjectionExpression` to fetch only required attributes
- Use `Limit` for pagination
- Use `FilterExpression` sparingly (applied after query)

**API Gateway Caching**:
```yaml
# In template.yaml
SiteAPI:
  Type: AWS::Serverless::Api
  Properties:
    CacheClusterEnabled: true
    CacheClusterSize: "0.5"
    MethodSettings:
      - HttpMethod: "GET"
        ResourcePath: "/app"
        CachingEnabled: true
        CacheTtlInSeconds: 300
```

---

## Troubleshooting Common Issues

### Issue: "Network Error" in Frontend

**Cause**: CORS not configured or API Gateway URL incorrect

**Solution**:
1. Check `VUE_APP_API_ROOT` in `.env`
2. Verify CORS headers in API Gateway
3. Check browser console for CORS errors

---

### Issue: "403 Forbidden" on API Calls

**Cause**: JWT token expired or invalid

**Solution**:
1. Sign out and sign in again
2. Check token expiration (1 hour)
3. Verify `Authorization` header format: `Bearer {token}`

---

### Issue: "ConditionalCheckFailedException" on POST /app

**Cause**: Link ID already exists

**Solution**:
- This is expected behavior (prevents duplicates)
- Choose a different link ID
- Or delete existing link first

---

### Issue: Hot-reload not working

**Cause**: File watcher limit reached (Linux) or port conflict

**Solution**:
```bash
# Increase file watcher limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use different port
npm run serve -- --port 8081
```

---

## Code Style Guidelines

### JavaScript/Vue.js

- Use ES6+ syntax (arrow functions, destructuring, etc.)
- Use `const` for constants, `let` for variables (avoid `var`)
- Use single quotes for strings
- Use 2 spaces for indentation
- Use semicolons
- Use PascalCase for component names
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

**Example**:
```javascript
const API_URL = 'https://api.example.com';

const fetchLinks = async () => {
  const response = await apiClient.get('/app');
  return response.data;
};
```

---

### Vue Component Structure

**Order**:
1. `<template>`
2. `<script>`
3. `<style>`

**Script Section Order**:
1. `name`
2. `components`
3. `props`
4. `data`
5. `computed`
6. `watch`
7. `methods`
8. `lifecycle hooks` (created, mounted, etc.)

---

### Git Commit Messages

**Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example**:
```
feat(dashboard): Add folder filter

- Add dropdown to filter links by folder
- Update Vuex getter to filter by selected folder
- Add "All Folders" option to show all links

Closes #123
```

---

## Resources

**Vue.js**:
- Official Docs: https://vuejs.org/
- Vue Router: https://router.vuejs.org/
- Vuex: https://vuex.vuejs.org/

**AWS**:
- API Gateway: https://docs.aws.amazon.com/apigateway/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/
- Cognito: https://docs.aws.amazon.com/cognito/
- SAM: https://docs.aws.amazon.com/serverless-application-model/

**Tailwind CSS**:
- Official Docs: https://tailwindcss.com/docs

**VTL (Velocity Template Language)**:
- Apache Velocity: https://velocity.apache.org/engine/devel/user-guide.html
- API Gateway Mapping Templates: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html

---

## Contributing

See `CONTRIBUTING.md` (if exists) or follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Commit with descriptive messages
5. Push to your fork
6. Create a pull request
7. Wait for review and approval

---

**Document Version**: 1.0  
**Last Updated**: December 9, 2025  
**Maintained By**: Development Team
