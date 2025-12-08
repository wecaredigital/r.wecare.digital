# WECARE.DIGITAL URL Shortener - Configuration Reference

## 📋 Table of Contents
- [AWS Resources](#aws-resources)
- [DynamoDB Configuration](#dynamodb-configuration)
- [API Gateway Configuration](#api-gateway-configuration)
- [Cognito Configuration](#cognito-configuration)
- [Amplify Configuration](#amplify-configuration)
- [CloudFront Configuration](#cloudfront-configuration)
- [Environment Variables](#environment-variables)
- [IAM Roles](#iam-roles)

---

## AWS Resources

### Region
```
ap-south-1 (Mumbai)
```

### Account ID
```
010526260063
```

### Stack Name
```
wecare-url-shortener
```

---

## DynamoDB Configuration

### Table Details
```yaml
Table Name: r-wecare-digital-LinkTable-YPF44B2N1ONI
Region: ap-south-1
Billing Mode: PAY_PER_REQUEST (On-Demand)
```

### Primary Key
```yaml
Partition Key: id (String)
```

### Global Secondary Index
```yaml
Index Name: OwnerIndex
Partition Key: owner (String)
Projection Type: ALL
```

### Attributes
```yaml
id:        String  # Short link ID (e.g., "google")
url:       String  # Target URL (e.g., "https://google.com")
owner:     String  # Owner email (e.g., "links@wecare.digital")
folder:    String  # Organization folder (e.g., "search-engines")
remark:    String  # Description/notes
timestamp: String  # Creation time (IST format)
```

### Example Item
```json
{
  "id": "google",
  "url": "https://google.com",
  "owner": "links@wecare.digital",
  "folder": "search-engines",
  "remark": "Google search engine",
  "timestamp": "2025-12-08 15:30:00 +0530"
}
```

### Point-in-Time Recovery
```yaml
Status: ENABLED
Retention: 35 days
```

---

## API Gateway Configuration

### API Details
```yaml
API ID: xbj96ig388
Name: URL Shortener API
Type: REST API
Endpoint Type: REGIONAL
Stage: Prod
```

### Base URL
```
https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod
```

### Endpoints

#### GET /{linkId} - Redirect to URL
```yaml
Path: /{linkId}
Method: GET
Auth: None (Public)
Integration: DynamoDB GetItem
Response: 301 Redirect
```

**Integration Request:**
```json
{
  "Key": {
    "id": {"S": "$input.params().path.linkId"}
  },
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI"
}
```

**Integration Response:**
```velocity
#set($inputRoot = $input.path('$'))
#if($inputRoot.toString().contains("Item"))
  #set($context.responseOverride.header.Location = $inputRoot.Item.url.S)
#end
```

#### GET /app - List All Links
```yaml
Path: /app
Method: GET
Auth: Cognito User Pool
Integration: DynamoDB Query
Response: 200 JSON Array
```

**Integration Request:**
```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "IndexName": "OwnerIndex",
  "KeyConditionExpression": "#n_owner = :v_owner",
  "ExpressionAttributeValues": {
    ":v_owner": {"S": "links@wecare.digital"}
  },
  "ExpressionAttributeNames": {
    "#n_owner": "owner"
  }
}
```

**Integration Response:**
```velocity
#set($inputRoot = $input.path('$'))
[
  #foreach($elem in $inputRoot.Items) {
    "id":        "$elem.id.S",
    "url":       "$elem.url.S",
    "timestamp": "$elem.timestamp.S",
    "owner":     "$elem.owner.S",
    "folder":    "$util.defaultIfNull($elem.folder.S, '')",
    "remark":    "$util.defaultIfNull($elem.remark.S, '')"
  }#if($foreach.hasNext),#end
  #end
]
```

#### POST /app - Create Link
```yaml
Path: /app
Method: POST
Auth: Cognito User Pool
Integration: DynamoDB UpdateItem
Response: 200 JSON Object
```

**Integration Request:**
```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "ConditionExpression": "attribute_not_exists(id)",
  "Key": {"id": {"S": $input.json('$.id')}},
  "ExpressionAttributeNames": {
    "#u": "url",
    "#o": "owner",
    "#ts": "timestamp",
    "#f": "folder",
    "#r": "remark"
  },
  "ExpressionAttributeValues": {
    ":u": {"S": $input.json('$.url')},
    ":o": {"S": $input.json('$.owner')},
    ":ts": {"S": $input.json('$.timestamp')},
    ":f": {"S": $input.json('$.folder')},
    ":r": {"S": $input.json('$.remark')}
  },
  "UpdateExpression": "SET #u = :u, #o = :o, #ts = :ts, #f = :f, #r = :r",
  "ReturnValues": "ALL_NEW"
}
```

**Integration Response:**
```velocity
#set($inputRoot = $input.path('$'))
{
  "id": "$inputRoot.Attributes.id.S",
  "url": "$inputRoot.Attributes.url.S",
  "timestamp": "$inputRoot.Attributes.timestamp.S",
  "owner": "$inputRoot.Attributes.owner.S",
  "folder": "$util.defaultIfNull($inputRoot.Attributes.folder.S, '')",
  "remark": "$util.defaultIfNull($inputRoot.Attributes.remark.S, '')"
}
```

#### PUT /app/{linkId} - Update Link
```yaml
Path: /app/{linkId}
Method: PUT
Auth: Cognito User Pool
Integration: DynamoDB UpdateItem
Response: 200 JSON Object
```

**Integration Request:**
```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "Key": {"id": {"S": $input.json('$.id')}},
  "ExpressionAttributeNames": {
    "#u": "url",
    "#owner": "owner",
    "#id": "id",
    "#f": "folder",
    "#r": "remark"
  },
  "ExpressionAttributeValues": {
    ":u": {"S": $input.json('$.url')},
    ":owner": {"S": "links@wecare.digital"},
    ":linkId": {"S": "$input.params().path.linkId"},
    ":f": {"S": $input.json('$.folder')},
    ":r": {"S": $input.json('$.remark')}
  },
  "UpdateExpression": "SET #u = :u, #f = :f, #r = :r",
  "ReturnValues": "ALL_NEW",
  "ConditionExpression": "#owner = :owner AND #id = :linkId"
}
```

#### DELETE /app/{linkId} - Delete Link
```yaml
Path: /app/{linkId}
Method: DELETE
Auth: Cognito User Pool
Integration: DynamoDB DeleteItem
Response: 200 Success
```

**Integration Request:**
```json
{
  "Key": {"id": {"S": "$input.params().path.linkId"}},
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "ConditionExpression": "#owner = :owner",
  "ExpressionAttributeValues": {
    ":owner": {"S": "links@wecare.digital"}
  },
  "ExpressionAttributeNames": {
    "#owner": "owner"
  }
}
```

### CORS Configuration
```yaml
Access-Control-Allow-Origin: "*" (for GET /app, POST /app)
Access-Control-Allow-Origin: "https://master.d3fic2w2ke17v4.amplifyapp.com" (for PUT, DELETE)
Access-Control-Allow-Methods: "GET, POST, PUT, DELETE, OPTIONS"
Access-Control-Allow-Headers: "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token"
```

### Throttling
```yaml
Default Rate Limit: 2,000 requests/second
Default Burst Limit: 1,000 requests
GET /{linkId} Rate Limit: 10,000 requests/second
GET /{linkId} Burst Limit: 4,000 requests
```

---

## Cognito Configuration

### User Pool
```yaml
User Pool ID: ap-south-1_Boa0BxAAW
User Pool Name: shortener-UserPool
Region: ap-south-1
```

### Custom Domain
```yaml
Domain: user.wecare.digital
Type: Custom Domain
Certificate ARN: arn:aws:acm:us-east-1:010526260063:certificate/ab0fdc4d-ccbe-4aaf-a2e8-67ba98787223
Managed Login Version: 2
```

### App Client
```yaml
Client ID: 4tjhielf61n43u1kt7gvm3pfup
Client Name: shortener-UserPoolClient
Generate Secret: false
```

### OAuth Configuration
```yaml
Allowed OAuth Flows: Authorization Code Grant
Allowed OAuth Scopes:
  - email
  - openid

Callback URLs:
  - https://master.d3fic2w2ke17v4.amplifyapp.com
  - https://go.wecare.digital
  - https://go.wecare.digital/login
  - http://localhost:8080 (development)

Logout URLs:
  - https://master.d3fic2w2ke17v4.amplifyapp.com
  - https://go.wecare.digital
  - http://localhost:8080 (development)
```

### MFA Configuration
```yaml
MFA: OPTIONAL (can be enabled per user)
MFA Type: SOFTWARE_TOKEN_MFA (TOTP)
Enabled: true
```

### Password Policy
```yaml
Minimum Length: 8 characters
Require Lowercase: true
Require Uppercase: true
Require Numbers: true
Require Symbols: true
```

### User Attributes
```yaml
Required Attributes:
  - email (verified)

Username Attributes:
  - email
```

### Token Expiration
```yaml
ID Token: 1 hour
Access Token: 1 hour
Refresh Token: 30 days
```

### Hosted UI URLs
```yaml
Login: https://user.wecare.digital/login
Logout: https://user.wecare.digital/logout
OAuth2 Authorize: https://user.wecare.digital/oauth2/authorize
OAuth2 Token: https://user.wecare.digital/oauth2/token
```

---

## Amplify Configuration

### App Details
```yaml
App ID: (from CloudFormation output)
App Name: Url-Shortener-Client
Region: ap-south-1
```

### Repository
```yaml
Repository: https://github.com/wecaredigital/r.wecare.digital
Branch: master
Auto Build: true
```

### Build Spec
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

### Environment Variables
```bash
VUE_APP_NAME=WECARE.DIGITAL
VUE_APP_API_ROOT=https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod
VUE_APP_AUTH_DOMAIN=https://user.wecare.digital
VUE_APP_CLIENT_ID=4tjhielf61n43u1kt7gvm3pfup
```

### Custom Domain
```yaml
Domain: go.wecare.digital
Branch: master
```

### Default Domain
```yaml
Domain: master.d3fic2w2ke17v4.amplifyapp.com
```

---

## CloudFront Configuration

### Distribution
```yaml
Distribution ID: (from CloudFormation)
Origin: xbj96ig388.execute-api.ap-south-1.amazonaws.com
Origin Path: /Prod
Comment: URL Shortener CDN
```

### Custom Domain
```yaml
Domain: r.wecare.digital
```

### Cache Behavior
```yaml
Default TTL: 0 seconds (no caching for API calls)
Allowed Methods: DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT
Cached Methods: GET, HEAD, OPTIONS
Compress: true
Viewer Protocol Policy: redirect-to-https
```

### Forwarded Headers
```yaml
- Access-Control-Request-Headers
- Access-Control-Request-Method
- Origin
- Authorization
```

### Error Responses
```yaml
400 Error: Cache 0 seconds
403 Error: Cache 1 second
500 Error: Cache 5 seconds
```

### Access Logs
```yaml
Enabled: true
Bucket: (CloudFormation managed S3 bucket)
```

---

## Environment Variables

### Frontend (.env)
```bash
# Application Name
VUE_APP_NAME=WECARE.DIGITAL

# API Gateway URL
VUE_APP_API_ROOT=https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod

# Cognito Custom Domain
VUE_APP_AUTH_DOMAIN=https://user.wecare.digital

# Cognito App Client ID
VUE_APP_CLIENT_ID=4tjhielf61n43u1kt7gvm3pfup
```

### Backend (CloudFormation Parameters)
```yaml
AppName: shortener
CustomDomainName: user.wecare.digital
UseLocalClient: false
GithubRepository: https://github.com/wecaredigital/r.wecare.digital
PersonalAccessToken: (GitHub PAT)
CustomDomain: https://go.wecare.digital
```

---

## IAM Roles

### DynamoDB Read Role
```yaml
Role Name: r-wecare-digital-DDBReadRole-nmdTFMoYpzsm
ARN: arn:aws:iam::010526260063:role/r-wecare-digital-DDBReadRole-nmdTFMoYpzsm

Permissions:
  - dynamodb:GetItem
  - dynamodb:Scan
  - dynamodb:Query

Resources:
  - r-wecare-digital-LinkTable-YPF44B2N1ONI
  - r-wecare-digital-LinkTable-YPF44B2N1ONI/index/*

Trust Policy:
  Service: apigateway.amazonaws.com
```

### DynamoDB CRUD Role
```yaml
Role Name: r-wecare-digital-DDBCrudRole-TbN7Ad7FrWFG
ARN: arn:aws:iam::010526260063:role/r-wecare-digital-DDBCrudRole-TbN7Ad7FrWFG

Permissions:
  - dynamodb:DeleteItem
  - dynamodb:UpdateItem

Resources:
  - r-wecare-digital-LinkTable-YPF44B2N1ONI

Trust Policy:
  Service: apigateway.amazonaws.com
```

### Amplify Role
```yaml
Role Name: (CloudFormation managed)

Permissions:
  - amplify:*

Trust Policy:
  Service: amplify.amazonaws.com
```

### CloudWatch Role
```yaml
Role Name: (CloudFormation managed)

Managed Policies:
  - arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs

Trust Policy:
  Service: apigateway.amazonaws.com
```

---

## API Swagger Specification

### Complete OpenAPI 2.0 Spec
```yaml
swagger: "2.0"
info:
  version: "1.0.0"
  title: "URL Shortener API"

host: "xbj96ig388.execute-api.ap-south-1.amazonaws.com"
basePath: "/Prod"
schemes:
  - "https"

securityDefinitions:
  UserAuthorizer:
    type: "apiKey"
    name: "Authorization"
    in: "header"
    x-amazon-apigateway-authtype: "cognito_user_pools"
    x-amazon-apigateway-authorizer:
      providerARNs:
        - "arn:aws:cognito-idp:ap-south-1:010526260063:userpool/ap-south-1_Boa0BxAAW"
      type: "cognito_user_pools"

x-amazon-apigateway-request-validators:
  body:
    validateRequestParameters: false
    validateRequestBody: true
  params:
    validateRequestParameters: true
    validateRequestBody: false

x-amazon-apigateway-gateway-responses:
  DEFAULT_5XX:
    responseParameters:
      gatewayresponse.header.Access-Control-Allow-Methods: "'GET,OPTIONS,POST'"
      gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
      gatewayresponse.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
  DEFAULT_4XX:
    responseParameters:
      gatewayresponse.header.Access-Control-Allow-Methods: "'GET,OPTIONS,POST'"
      gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
      gatewayresponse.header.Access-Control-Allow-Headers: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
```

---

## Shared Links Configuration

### Current Owner Model
```yaml
Model: Shared Links (Organization-wide)
Owner Email: links@wecare.digital
Access: All authenticated users can view/edit all links
```

### To Switch to Per-User Model

**Step 1:** Update Dashboard.vue
```javascript
// Change getOwnerEmail() to return logged-in user's email
function getOwnerEmail() {
  const token = window.localStorage.getItem("cognitoIdentityToken");
  if (!token || token === 'null') return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.email || null;
  } catch (err) {
    return null;
  }
}
```

**Step 2:** Update API Gateway GET /app Integration Request
```json
{
  "ExpressionAttributeValues": {
    ":v_owner": {"S": "$context.authorizer.claims.email"}
  }
}
```

**Step 3:** Update API Gateway PUT /app/{linkId} Integration Request
```json
{
  "ExpressionAttributeValues": {
    ":owner": {"S": "$context.authorizer.claims.email"}
  }
}
```

**Step 4:** Update API Gateway DELETE /app/{linkId} Integration Request
```json
{
  "ExpressionAttributeValues": {
    ":owner": {"S": "$context.authorizer.claims.email"}
  }
}
```

**Step 5:** Deploy API Gateway to Prod stage

---

## Monitoring & Alarms

### CloudWatch Alarms
```yaml
API Gateway 4xx Alarm:
  Metric: 4XXError
  Threshold: > 1%
  Period: 60 seconds

API Gateway 5xx Alarm:
  Metric: 5XXError
  Threshold: > 0.1%
  Period: 60 seconds

API Gateway Latency Alarm:
  Metric: Latency (p99)
  Threshold: > 75ms
  Period: 300 seconds

DynamoDB System Errors:
  Metric: SystemErrors
  Threshold: > 0.01%
  Period: 60 seconds

DynamoDB User Errors:
  Metric: UserErrors
  Threshold: > 0.10%
  Period: 60 seconds

CloudFront Total Error Rate:
  Metric: TotalErrorRate
  Threshold: >= 5 errors
  Period: 60 seconds

CloudFront Cache Hit Rate:
  Metric: CacheHitRate
  Threshold: <= 80%
  Period: 300 seconds
```

### SNS Topic
```yaml
Topic Name: wecare-url-shortener-alerts
Subscriptions: (Configure email subscriptions)
```

---

## DNS Configuration

### Route53 Records
```yaml
r.wecare.digital:
  Type: CNAME
  Value: (CloudFront distribution domain)
  TTL: 300

go.wecare.digital:
  Type: CNAME
  Value: (Amplify default domain)
  TTL: 300

user.wecare.digital:
  Type: CNAME
  Value: (Cognito custom domain target)
  TTL: 300
```

---

## SSL/TLS Certificates

### ACM Certificate
```yaml
ARN: arn:aws:acm:us-east-1:010526260063:certificate/ab0fdc4d-ccbe-4aaf-a2e8-67ba98787223
Region: us-east-1 (required for CloudFront)
Domains:
  - user.wecare.digital
  - *.wecare.digital
Validation: DNS
Status: Issued
```

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Maintained By:** WECARE.DIGITAL Team
