# WECARE.DIGITAL URL Shortener - Developer Guide

## 📋 Table of Contents
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Common Tasks](#common-tasks)
- [API Reference](#api-reference)
- [Debugging](#debugging)

---

## Getting Started

### Welcome!

This guide will help you get up and running with the WECARE.DIGITAL URL Shortener project. Whether you're fixing bugs, adding features, or just exploring the codebase, this document has everything you need.

### What You'll Learn
- How to set up your local development environment
- Project structure and architecture
- How to make changes safely
- Testing and debugging techniques
- Best practices and code standards

### Time to Complete
- **Setup:** 30 minutes
- **First contribution:** 1-2 hours

---

## Development Environment Setup

### Step 1: Install Prerequisites

#### Required Software
```bash
# Node.js (v16.x or higher)
node --version  # Should show v16.x.x or higher

# npm (v8.x or higher)
npm --version   # Should show 8.x.x or higher

# Git
git --version   # Should show 2.x.x or higher

# AWS CLI (optional, for backend work)
aws --version   # Should show 2.x.x or higher
```

#### Install Node.js (if needed)
```bash
# Windows: Download from https://nodejs.org
# Mac: brew install node@16
# Linux: 
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Clone Repository

```bash
# Clone the repo
git clone https://github.com/wecaredigital/r.wecare.digital.git
cd r.wecare.digital

# Create your feature branch
git checkout -b feature/your-feature-name
```

### Step 3: Install Dependencies

```bash
# Install frontend dependencies
cd client
npm install

# This will install:
# - Vue.js and related packages
# - Bulma CSS framework
# - Axios for HTTP requests
# - And more...
```

### Step 4: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Environment Variables:**
```bash
# API Configuration
VUE_APP_NAME=WECARE.DIGITAL
VUE_APP_API_ROOT=https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod
VUE_APP_AUTH_DOMAIN=https://user.wecare.digital
VUE_APP_CLIENT_ID=4tjhielf61n43u1kt7gvm3pfup
```

### Step 5: Start Development Server

```bash
# Start the dev server
npm run serve

# Output:
#  App running at:
#  - Local:   http://localhost:8080/
#  - Network: http://192.168.1.x:8080/
```

### Step 6: Verify Setup

1. Open browser: http://localhost:8080
2. You should see the landing page
3. Click "Sign In" - should redirect to Cognito
4. Sign in with test credentials
5. Dashboard should load

**If you see errors, check:**
- Environment variables are set correctly
- API Gateway is accessible
- Cognito is configured
- Network connection is working

---

## Project Structure

```
r.wecare.digital/
├── client/                      # Frontend Vue.js application
│   ├── public/                  # Static assets
│   │   ├── index.html          # HTML template
│   │   └── favicon.ico         # Favicon
│   ├── src/                    # Source code
│   │   ├── App.vue             # Root component
│   │   ├── main.js             # Entry point
│   │   ├── router/             # Vue Router configuration
│   │   │   └── index.js        # Routes + navigation guards
│   │   ├── store/              # Vuex state management
│   │   │   └── index.js        # Store definition
│   │   ├── views/              # Page components
│   │   │   ├── Landing.vue     # Landing page
│   │   │   ├── Login.vue       # Login page
│   │   │   └── Dashboard.vue   # Main dashboard
│   │   ├── components/         # Reusable components
│   │   │   └── MFASettings.vue # MFA configuration
│   │   └── assets/             # Styles and images
│   │       └── main.scss       # Global styles
│   ├── .env                    # Environment variables
│   ├── package.json            # Dependencies
│   └── vue.config.js           # Vue CLI configuration
├── templates/                   # API Gateway mapping templates
│   └── app/                    # /app endpoint templates
│       ├── get-request.json    # GET request mapping
│       ├── get-response.json   # GET response mapping
│       ├── post-request.json   # POST request mapping
│       └── ...
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── DEPLOYMENT_GUIDE.md     # Deployment instructions
│   └── DEVELOPER_GUIDE.md      # This file
├── template.yaml               # CloudFormation template
├── api.yaml                    # OpenAPI specification
└── README.md                   # Project overview
```

### Key Files Explained

#### `client/src/App.vue`
- Root component
- Handles authentication flow
- Manages loading state
- Exchanges OAuth codes for tokens

#### `client/src/router/index.js`
- Defines routes (/, /login, /dashboard)
- Navigation guards (auth checks)
- Redirects based on auth state

#### `client/src/store/index.js`
- Vuex store (centralized state)
- Manages: authorized, loading, links
- Mutations: authorize, hydrateLinks, etc.

#### `client/src/views/Dashboard.vue`
- Main application UI
- Link management (CRUD operations)
- Search, filter, pagination
- Folder organization

#### `template.yaml`
- CloudFormation template
- Defines all AWS resources
- Infrastructure as Code

#### `templates/app/*.json`
- API Gateway mapping templates
- Transform requests/responses
- DynamoDB integration logic

---

## Development Workflow

### Making Changes

#### 1. Create Feature Branch

```bash
# Always work on a feature branch
git checkout -b feature/add-analytics

# Branch naming conventions:
# - feature/description  (new features)
# - fix/description      (bug fixes)
# - docs/description     (documentation)
# - refactor/description (code refactoring)
```

#### 2. Make Your Changes

```bash
# Edit files
nano client/src/views/Dashboard.vue

# Test locally
npm run serve

# Check for errors
npm run lint
```

#### 3. Test Your Changes

```bash
# Run unit tests (if available)
npm run test:unit

# Manual testing:
# 1. Sign in
# 2. Create a link
# 3. Edit a link
# 4. Delete a link
# 5. Search/filter
# 6. Test on mobile (responsive)
```

#### 4. Commit Changes

```bash
# Stage changes
git add client/src/views/Dashboard.vue

# Commit with descriptive message
git commit -m "feat: add analytics dashboard

- Add analytics view component
- Integrate with CloudWatch API
- Display link click statistics
- Add date range filter

Closes #123"

# Commit message format:
# <type>: <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, test, chore
```

#### 5. Push and Create PR

```bash
# Push to GitHub
git push origin feature/add-analytics

# Create Pull Request on GitHub
# - Add description
# - Link related issues
# - Request review
# - Add labels
```

#### 6. Code Review

- Address reviewer comments
- Make requested changes
- Push updates to same branch
- PR auto-updates

#### 7. Merge and Deploy

```bash
# After approval, merge to master
# Amplify auto-deploys on merge

# Monitor deployment
# Check Amplify console for build status
```

---

## Code Standards

### Vue.js Style Guide

Follow the [Official Vue.js Style Guide](https://vuejs.org/style-guide/)

**Key Rules:**

```vue
<!-- ✅ Good: Component names are multi-word -->
<template>
  <div class="link-item">
    ...
  </div>
</template>

<!-- ❌ Bad: Single-word component name -->
<template>
  <div class="item">
    ...
  </div>
</template>
```

```javascript
// ✅ Good: Props with types
props: {
  linkId: {
    type: String,
    required: true
  },
  url: {
    type: String,
    default: ''
  }
}

// ❌ Bad: Props without types
props: ['linkId', 'url']
```

```javascript
// ✅ Good: Computed properties for derived state
computed: {
  filteredLinks() {
    return this.links.filter(link => 
      link.folder === this.selectedFolder
    );
  }
}

// ❌ Bad: Methods for derived state
methods: {
  getFilteredLinks() {
    return this.links.filter(link => 
      link.folder === this.selectedFolder
    );
  }
}
```

### JavaScript Style Guide

```javascript
// ✅ Good: Use const/let, not var
const API_URL = 'https://api.example.com';
let counter = 0;

// ❌ Bad: Using var
var API_URL = 'https://api.example.com';

// ✅ Good: Arrow functions
const double = (x) => x * 2;

// ❌ Bad: Function expressions
const double = function(x) { return x * 2; };

// ✅ Good: Template literals
const message = `Hello, ${name}!`;

// ❌ Bad: String concatenation
const message = 'Hello, ' + name + '!';

// ✅ Good: Destructuring
const { id, url, folder } = link;

// ❌ Bad: Multiple assignments
const id = link.id;
const url = link.url;
const folder = link.folder;

// ✅ Good: Async/await
async fetchLinks() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// ❌ Bad: Promise chains
fetchLinks() {
  return fetch(API_URL)
    .then(response => response.json())
    .then(data => data)
    .catch(error => console.error(error));
}
```

### CSS/SCSS Style Guide

```scss
// ✅ Good: BEM naming convention
.link-item {
  &__title {
    font-size: 1.2rem;
  }
  
  &__url {
    color: #666;
  }
  
  &--active {
    background: #f0f0f0;
  }
}

// ❌ Bad: Generic class names
.item {
  .title {
    font-size: 1.2rem;
  }
}

// ✅ Good: Variables for colors
$primary-color: #667eea;
$text-color: #333;

.button {
  background: $primary-color;
  color: white;
}

// ❌ Bad: Hardcoded colors
.button {
  background: #667eea;
  color: white;
}
```

### Code Comments

```javascript
// ✅ Good: Explain WHY, not WHAT
// Use exponential backoff to avoid overwhelming the API
// during high traffic periods
const delay = Math.pow(2, retryCount) * 1000;

// ❌ Bad: Obvious comments
// Set delay to 2 to the power of retryCount times 1000
const delay = Math.pow(2, retryCount) * 1000;

// ✅ Good: Document complex logic
/**
 * Transforms DynamoDB Query response to flat array.
 * 
 * DynamoDB returns: { Items: [{id: {S: "..."}}] }
 * We need: [{id: "..."}]
 * 
 * @param {Object} data - DynamoDB response
 * @returns {Array} Flat array of links
 */
function transformResponse(data) {
  // ...
}
```

---

## Testing

### Manual Testing Checklist

**Before Every Commit:**
- [ ] Code runs without errors
- [ ] No console warnings
- [ ] Linter passes (`npm run lint`)
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested on mobile (responsive)

**Before Every PR:**
- [ ] All features work as expected
- [ ] No regressions (old features still work)
- [ ] Error handling works
- [ ] Loading states work
- [ ] Success/error messages display
- [ ] Tested with slow network (throttle in DevTools)
- [ ] Tested with no network (offline)

### Unit Testing (Future)

```javascript
// Example unit test (to be implemented)
import { mount } from '@vue/test-utils';
import Dashboard from '@/views/Dashboard.vue';

describe('Dashboard.vue', () => {
  it('renders links table', () => {
    const wrapper = mount(Dashboard, {
      data() {
        return {
          links: [
            { id: 'test', url: 'https://example.com' }
          ]
        };
      }
    });
    
    expect(wrapper.find('.table').exists()).toBe(true);
    expect(wrapper.text()).toContain('test');
  });
});
```

### Integration Testing

```bash
# Test API endpoints
curl -H "Authorization: $TOKEN" \
  https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app

# Test authentication flow
# 1. Clear localStorage
# 2. Visit go.wecare.digital
# 3. Sign in
# 4. Verify redirect to dashboard
# 5. Verify links load

# Test CRUD operations
# 1. Create link
# 2. Verify it appears
# 3. Edit link
# 4. Verify changes
# 5. Delete link
# 6. Verify it's gone
```

---

## Common Tasks

### Task 1: Add a New Field to Links

**Example: Add "tags" field**

#### Step 1: Update DynamoDB Schema

No action needed - DynamoDB is schemaless

#### Step 2: Update API Gateway Templates

Edit `templates/app/get-response.json`:
```velocity
#set($inputRoot = $input.path('$'))
[
  #foreach($elem in $inputRoot.Items) {
    "id":        "$elem.id.S",
    "url":       "$elem.url.S",
    "timestamp": "$elem.timestamp.S",
    "owner":     "$elem.owner.S",
    "folder":    "$util.defaultIfNull($elem.folder.S, '')",
    "remark":    "$util.defaultIfNull($elem.remark.S, '')",
    "tags":      "$util.defaultIfNull($elem.tags.S, '')"
  }#if($foreach.hasNext),#end
  #end
]
```

Edit `templates/app/post-request.json`:
```json
{
  "ExpressionAttributeNames": {
    "#u": "url",
    "#o": "owner",
    "#ts": "timestamp",
    "#f": "folder",
    "#r": "remark",
    "#t": "tags"
  },
  "ExpressionAttributeValues": {
    ":u": {"S": $input.json('$.url')},
    ":o": {"S": $input.json('$.owner')},
    ":ts": {"S": $input.json('$.timestamp')},
    ":f": {"S": $input.json('$.folder')},
    ":r": {"S": $input.json('$.remark')},
    ":t": {"S": $input.json('$.tags')}
  },
  "UpdateExpression": "SET #u = :u, #o = :o, #ts = :ts, #f = :f, #r = :r, #t = :t"
}
```

#### Step 3: Update Frontend

Edit `client/src/views/Dashboard.vue`:

```vue
<template>
  <!-- Add to form -->
  <div class="field">
    <label class="label">Tags</label>
    <input class="input" v-model="model.tags" 
           placeholder="comma, separated, tags" />
  </div>
  
  <!-- Add to table -->
  <td>{{ link.tags }}</td>
</template>

<script>
export default {
  data() {
    return {
      model: { 
        id: "", 
        url: "", 
        folder: "", 
        remark: "",
        tags: ""  // Add here
      }
    };
  }
}
</script>
```

#### Step 4: Deploy

```bash
# Commit changes
git add templates/ client/
git commit -m "feat: add tags field to links"
git push

# Update API Gateway (manual)
# Deploy API to Prod

# Amplify auto-deploys frontend
```

### Task 2: Change Owner Model

**Example: Switch from shared to per-user links**

#### Step 1: Update Dashboard.vue

```javascript
// Change getOwnerEmail() function
function getOwnerEmail() {
  // Option 2: Use the logged-in user's email
  const token = window.localStorage.getItem("cognitoIdentityToken");
  if (!token || token === 'null') return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.email || null;
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}
```

#### Step 2: Update API Gateway

Edit GET /app Integration Request:
```json
{
  "ExpressionAttributeValues": {
    ":v_owner": {"S": "$context.authorizer.claims.email"}
  }
}
```

#### Step 3: Deploy

```bash
git commit -m "feat: switch to per-user link ownership"
git push

# Update API Gateway
# Deploy to Prod
```

### Task 3: Add a New Page

**Example: Add Analytics page**

#### Step 1: Create Component

```bash
# Create new file
touch client/src/views/Analytics.vue
```

```vue
<template>
  <div class="analytics">
    <h1 class="title">Analytics</h1>
    <p>Link statistics coming soon...</p>
  </div>
</template>

<script>
export default {
  name: 'Analytics',
  mounted() {
    console.log('Analytics page loaded');
  }
}
</script>

<style scoped>
.analytics {
  padding: 2rem;
}
</style>
```

#### Step 2: Add Route

Edit `client/src/router/index.js`:
```javascript
import Analytics from '../views/Analytics.vue'

const routes = [
  // ... existing routes
  {
    path: '/analytics',
    name: 'analytics',
    component: Analytics,
    beforeEnter: (to, from, next) => {
      // Same auth guard as dashboard
      if (store.state.authorized) {
        next();
      } else {
        next('/');
      }
    }
  }
]
```

#### Step 3: Add Navigation

Edit `client/src/views/Dashboard.vue`:
```vue
<template>
  <aside class="menu">
    <!-- Add to menu -->
    <ul class="menu-list">
      <li>
        <router-link to="/analytics">
          <span class="icon"><i class="fas fa-chart-bar"></i></span>
          <span>Analytics</span>
        </router-link>
      </li>
    </ul>
  </aside>
</template>
```

#### Step 4: Test and Deploy

```bash
# Test locally
npm run serve

# Visit http://localhost:8080/analytics

# Commit and push
git add client/src/views/Analytics.vue client/src/router/index.js
git commit -m "feat: add analytics page"
git push
```

---

## API Reference

### Authentication

All API requests require a JWT token in the Authorization header:

```javascript
const token = localStorage.getItem('cognitoIdentityToken');

fetch(API_URL, {
  headers: {
    'Authorization': token,
    'Content-Type': 'application/json'
  }
});
```

### Endpoints

#### GET /app - List All Links

**Request:**
```http
GET /app HTTP/1.1
Host: xbj96ig388.execute-api.ap-south-1.amazonaws.com
Authorization: eyJraWQiOiJ...
```

**Response:**
```json
[
  {
    "id": "google",
    "url": "https://google.com",
    "owner": "links@wecare.digital",
    "folder": "search",
    "remark": "Google search",
    "timestamp": "2025-12-08 15:30:00 +0530"
  }
]
```

#### POST /app - Create Link

**Request:**
```http
POST /app HTTP/1.1
Host: xbj96ig388.execute-api.ap-south-1.amazonaws.com
Authorization: eyJraWQiOiJ...
Content-Type: application/json

{
  "id": "google",
  "url": "https://google.com",
  "owner": "links@wecare.digital",
  "folder": "search",
  "remark": "Google search",
  "timestamp": "2025-12-08 15:30:00 +0530"
}
```

**Response:**
```json
{
  "Attributes": {
    "id": "google",
    "url": "https://google.com",
    ...
  }
}
```

#### PUT /app/{linkId} - Update Link

**Request:**
```http
PUT /app/google HTTP/1.1
Host: xbj96ig388.execute-api.ap-south-1.amazonaws.com
Authorization: eyJraWQiOiJ...
Content-Type: application/json

{
  "id": "google",
  "url": "https://google.com",
  "owner": "links@wecare.digital",
  "folder": "updated-folder",
  "remark": "Updated remark",
  "timestamp": "2025-12-08 16:00:00 +0530"
}
```

#### DELETE /app/{linkId} - Delete Link

**Request:**
```http
DELETE /app/google HTTP/1.1
Host: xbj96ig388.execute-api.ap-south-1.amazonaws.com
Authorization: eyJraWQiOiJ...
```

**Response:**
```json
{
  "message": "Link deleted successfully"
}
```

#### GET /{linkId} - Redirect to URL

**Request:**
```http
GET /google HTTP/1.1
Host: r.wecare.digital
```

**Response:**
```http
HTTP/1.1 301 Moved Permanently
Location: https://google.com
Cache-Control: public, max-age=300
```

---

## Debugging

### Browser DevTools

#### Console Tab
```javascript
// Check Vue instance
console.log(this.$store.state);

// Check API responses
console.log('API response:', data);

// Check token
console.log('Token:', localStorage.getItem('cognitoIdentityToken'));
```

#### Network Tab
- Filter by "XHR" to see API calls
- Check request headers (Authorization token)
- Check response status codes
- Check response bodies

#### Application Tab
- Check localStorage for tokens
- Clear storage to test fresh login

### Vue DevTools

Install: https://devtools.vuejs.org/

**Features:**
- Inspect component tree
- View component data
- View Vuex store state
- Time-travel debugging
- Performance profiling

### CloudWatch Logs

```bash
# Tail API Gateway logs
aws logs tail /aws/apigateway/wecare-url-shortener \
  --follow \
  --region ap-south-1

# Filter for errors
aws logs filter-log-events \
  --log-group-name /aws/apigateway/wecare-url-shortener \
  --filter-pattern "ERROR" \
  --region ap-south-1
```

### Common Issues

#### Issue: "Cannot read property 'X' of undefined"

**Cause:** Accessing property before data is loaded

**Solution:**
```vue
<!-- ❌ Bad -->
<div>{{ link.url }}</div>

<!-- ✅ Good -->
<div v-if="link">{{ link.url }}</div>
<div v-else>Loading...</div>
```

#### Issue: "CORS policy blocked"

**Cause:** API Gateway CORS not configured

**Solution:**
- Check API Gateway CORS settings
- Ensure origin matches: https://go.wecare.digital
- Deploy API after changes

#### Issue: "403 Forbidden"

**Cause:** Token expired or invalid

**Solution:**
```javascript
// Check token expiration
const token = localStorage.getItem('cognitoIdentityToken');
const payload = JSON.parse(atob(token.split('.')[1]));
const exp = payload.exp * 1000; // Convert to milliseconds
const now = Date.now();

if (now > exp) {
  console.log('Token expired, need to refresh');
  // Implement token refresh or redirect to login
}
```

#### Issue: "Links not appearing"

**Cause:** Owner mismatch or API response format

**Solution:**
```javascript
// Check API response
console.log('API response:', data);

// Check if array
console.log('Is array?', Array.isArray(data));

// Check owner value
console.log('Owner:', data[0]?.owner);

// Check store
console.log('Store links:', this.$store.state.links);
```

---

## Resources

### Documentation
- [Vue.js Guide](https://vuejs.org/guide/)
- [Vuex Documentation](https://vuex.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Bulma Documentation](https://bulma.io/documentation/)
- [AWS API Gateway](https://docs.aws.amazon.com/apigateway/)
- [AWS DynamoDB](https://docs.aws.amazon.com/dynamodb/)

### Tools
- [Vue DevTools](https://devtools.vuejs.org/)
- [Postman](https://www.postman.com/) - API testing
- [AWS Console](https://console.aws.amazon.com/)

### Community
- [Vue.js Forum](https://forum.vuejs.org/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/vue.js)
- [GitHub Issues](https://github.com/wecaredigital/r.wecare.digital/issues)

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Maintained By:** WECARE.DIGITAL Development Team
