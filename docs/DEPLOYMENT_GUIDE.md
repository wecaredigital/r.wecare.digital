# WECARE.DIGITAL URL Shortener - Deployment Guide

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Verification & Testing](#verification--testing)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Tools
- **AWS CLI** v2.x or higher
- **Git** v2.x or higher
- **Node.js** v16.x or higher
- **npm** v8.x or higher
- **AWS Account** with admin access

### Required AWS Services Access
- ✅ CloudFormation
- ✅ API Gateway
- ✅ DynamoDB
- ✅ Cognito
- ✅ Amplify
- ✅ CloudFront
- ✅ Route53
- ✅ IAM
- ✅ CloudWatch
- ✅ ACM (Certificate Manager)

### Required Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "apigateway:*",
        "dynamodb:*",
        "cognito-idp:*",
        "amplify:*",
        "cloudfront:*",
        "route53:*",
        "iam:*",
        "logs:*",
        "acm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Initial Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/wecaredigital/r.wecare.digital.git
cd r.wecare.digital

# Check current branch
git branch
# Should show: * master
```

### 2. Configure AWS CLI

```bash
# Configure AWS credentials
aws configure

# Enter your credentials:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: ap-south-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 3. Set Environment Variables

Create a `.env` file in the project root:

```bash
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCOUNT_ID=010526260063

# Application Configuration
APP_NAME=shortener
CUSTOM_DOMAIN_NAME=user.wecare.digital
CUSTOM_DOMAIN=https://go.wecare.digital

# GitHub Configuration (for Amplify)
GITHUB_REPOSITORY=https://github.com/wecaredigital/r.wecare.digital
GITHUB_TOKEN=your_github_personal_access_token

# ACM Certificate ARN (for custom domain)
ACM_CERTIFICATE_ARN=arn:aws:acm:us-east-1:010526260063:certificate/ab0fdc4d-ccbe-4aaf-a2e8-67ba98787223
```

---

## Backend Deployment

### Step 1: Review CloudFormation Template

```bash
# Review the template
cat template.yaml

# Validate the template
aws cloudformation validate-template \
  --template-body file://template.yaml \
  --region ap-south-1
```

### Step 2: Deploy CloudFormation Stack

```bash
# Deploy the stack
aws cloudformation deploy \
  --template-file template.yaml \
  --stack-name wecare-url-shortener \
  --parameter-overrides \
    AppName=shortener \
    CustomDomainName=user.wecare.digital \
    UseLocalClient=false \
    GithubRepository=https://github.com/wecaredigital/r.wecare.digital \
    PersonalAcessToken=YOUR_GITHUB_TOKEN \
    CustomDomain=https://go.wecare.digital \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1

# Monitor deployment progress
aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].StackStatus'
```

**Expected Output:**
```
CREATE_IN_PROGRESS → CREATE_COMPLETE (takes ~10-15 minutes)
```

### Step 3: Get Stack Outputs

```bash
# Get all outputs
aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs'

# Save important values:
# - VueAppAPIRoot (API Gateway URL)
# - VueAppClientId (Cognito Client ID)
# - VueAppAuthDomain (Cognito Domain)
# - AmplifyAppId (Amplify App ID)
```

### Step 4: Configure API Gateway

#### 4.1 Update GET /app Integration Request

```bash
# Navigate to API Gateway Console
# https://console.aws.amazon.com/apigateway

# Or use AWS CLI:
API_ID=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VueAppAPIRoot`].OutputValue' \
  --output text | cut -d'/' -f3 | cut -d'.' -f1)

echo "API Gateway ID: $API_ID"
```

**Manual Steps:**
1. Go to API Gateway Console
2. Select API (ID from above)
3. Click **Resources** → **GET /app** → **Integration Request**
4. Update mapping template:

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

5. Click **Save**

#### 4.2 Update GET /app Integration Response

1. Click **Integration Response** → **200** → **application/json**
2. Update mapping template:

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

3. Click **Save**

#### 4.3 Update POST /app Integration Request

1. Click **POST /app** → **Integration Request** → **application/json**
2. Update mapping template:

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

3. Click **Save**

#### 4.4 Deploy API

```bash
# Deploy via Console:
# Actions → Deploy API → Prod stage → Deploy

# Or via CLI:
aws apigateway create-deployment \
  --rest-api-id $API_ID \
  --stage-name Prod \
  --description "Initial deployment with shared links" \
  --region ap-south-1
```

### Step 5: Configure Cognito

#### 5.1 Update Callback URLs

```bash
# Get Cognito User Pool ID
USER_POOL_ID=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text)

# Get App Client ID
CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VueAppClientId`].OutputValue' \
  --output text)

# Update callback URLs
aws cognito-idp update-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-id $CLIENT_ID \
  --callback-urls \
    "https://go.wecare.digital" \
    "https://go.wecare.digital/login" \
    "http://localhost:8080" \
  --logout-urls \
    "https://go.wecare.digital" \
    "http://localhost:8080" \
  --region ap-south-1
```

#### 5.2 Create Test User

```bash
# Create a test user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username test@wecare.digital \
  --user-attributes \
    Name=email,Value=test@wecare.digital \
    Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region ap-south-1

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username test@wecare.digital \
  --password "SecurePass123!" \
  --permanent \
  --region ap-south-1
```

---

## Frontend Deployment

### Step 1: Configure Amplify Environment Variables

```bash
# Get Amplify App ID
AMPLIFY_APP_ID=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`AmplifyAppId`].OutputValue' \
  --output text)

# Get API Gateway URL
API_ROOT=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VueAppAPIRoot`].OutputValue' \
  --output text)

# Get Cognito details
AUTH_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VueAppAuthDomain`].OutputValue' \
  --output text)

CLIENT_ID=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`VueAppClientId`].OutputValue' \
  --output text)

# Set environment variables
aws amplify update-app \
  --app-id $AMPLIFY_APP_ID \
  --environment-variables \
    VUE_APP_NAME=WECARE.DIGITAL \
    VUE_APP_API_ROOT=$API_ROOT \
    VUE_APP_AUTH_DOMAIN=$AUTH_DOMAIN \
    VUE_APP_CLIENT_ID=$CLIENT_ID \
  --region ap-south-1
```

### Step 2: Trigger Amplify Build

```bash
# Trigger a build
aws amplify start-job \
  --app-id $AMPLIFY_APP_ID \
  --branch-name master \
  --job-type RELEASE \
  --region ap-south-1

# Monitor build progress
aws amplify list-jobs \
  --app-id $AMPLIFY_APP_ID \
  --branch-name master \
  --max-results 1 \
  --region ap-south-1
```

**Build Status:**
- PENDING → PROVISIONING → RUNNING → SUCCEED (takes ~3-5 minutes)

### Step 3: Configure Custom Domain (Optional)

```bash
# Add custom domain to Amplify
aws amplify create-domain-association \
  --app-id $AMPLIFY_APP_ID \
  --domain-name wecare.digital \
  --sub-domain-settings \
    prefix=go,branchName=master \
  --region ap-south-1

# Get DNS records to configure
aws amplify get-domain-association \
  --app-id $AMPLIFY_APP_ID \
  --domain-name wecare.digital \
  --region ap-south-1
```

**Manual DNS Configuration:**
1. Go to your DNS provider (Route53, Cloudflare, etc.)
2. Add CNAME record:
   - Name: `go`
   - Value: (from Amplify output)
   - TTL: 300

---

## Post-Deployment Configuration

### 1. Update Route53 (if using AWS DNS)

```bash
# Get CloudFront distribution domain
CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomain`].OutputValue' \
  --output text)

# Create/Update Route53 record for r.wecare.digital
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "r.wecare.digital",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$CLOUDFRONT_DOMAIN'"}]
      }
    }]
  }'
```

### 2. Configure CloudWatch Alarms

```bash
# Create SNS topic for alerts
aws sns create-topic \
  --name wecare-url-shortener-alerts \
  --region ap-south-1

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:010526260063:wecare-url-shortener-alerts \
  --protocol email \
  --notification-endpoint your-email@wecare.digital \
  --region ap-south-1

# Confirm subscription via email
```

### 3. Enable DynamoDB Point-in-Time Recovery

```bash
# Get table name
TABLE_NAME=$(aws cloudformation describe-stack-resources \
  --stack-name wecare-url-shortener \
  --logical-resource-id LinkTable \
  --region ap-south-1 \
  --query 'StackResources[0].PhysicalResourceId' \
  --output text)

# Enable PITR
aws dynamodb update-continuous-backups \
  --table-name $TABLE_NAME \
  --point-in-time-recovery-specification \
    PointInTimeRecoveryEnabled=true \
  --region ap-south-1
```

---

## Verification & Testing

### 1. Backend Health Check

```bash
# Test API Gateway endpoint (should return 302 redirect)
curl -I https://r.wecare.digital/test

# Expected: HTTP/1.1 302 Found (if 'test' link exists)
# Or: HTTP/1.1 404 Not Found (if 'test' link doesn't exist)
```

### 2. Frontend Health Check

```bash
# Test Amplify hosting
curl -I https://go.wecare.digital

# Expected: HTTP/1.1 200 OK
```

### 3. Authentication Flow Test

**Manual Test:**
1. Open browser: https://go.wecare.digital
2. Click "Sign In"
3. Should redirect to: https://user.wecare.digital/login
4. Enter credentials: test@wecare.digital / SecurePass123!
5. Should redirect back to: https://go.wecare.digital/dashboard
6. Dashboard should load with empty table

### 4. Create Link Test

**Manual Test:**
1. In dashboard, click "Create Link"
2. Fill form:
   - ID: `test`
   - URL: `https://google.com`
   - Folder: `testing`
   - Remark: `Test link`
3. Click "Create"
4. Link should appear in table immediately
5. Test redirect: https://r.wecare.digital/test
6. Should redirect to Google

### 5. API Integration Test

```bash
# Get JWT token (sign in via browser first, then extract from localStorage)
TOKEN="your_jwt_token_here"

# Test GET /app
curl -H "Authorization: $TOKEN" \
  https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app

# Expected: JSON array of links

# Test POST /app
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "api-test",
    "url": "https://example.com",
    "owner": "links@wecare.digital",
    "folder": "api",
    "remark": "API test",
    "timestamp": "2025-12-08 15:00:00 +0530"
  }' \
  https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app

# Expected: 200 OK with created item
```

---

## Troubleshooting

### Issue 1: CloudFormation Stack Fails

**Symptoms:**
- Stack status: `CREATE_FAILED` or `ROLLBACK_COMPLETE`

**Solution:**
```bash
# Check stack events
aws cloudformation describe-stack-events \
  --stack-name wecare-url-shortener \
  --region ap-south-1 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'

# Common issues:
# 1. IAM permissions - Add required permissions
# 2. Resource limits - Request limit increase
# 3. Invalid parameters - Check template.yaml

# Delete failed stack
aws cloudformation delete-stack \
  --stack-name wecare-url-shortener \
  --region ap-south-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name wecare-url-shortener \
  --region ap-south-1

# Retry deployment
```

### Issue 2: Amplify Build Fails

**Symptoms:**
- Build status: `FAILED`

**Solution:**
```bash
# Check build logs
aws amplify get-job \
  --app-id $AMPLIFY_APP_ID \
  --branch-name master \
  --job-id JOB_ID \
  --region ap-south-1

# Common issues:
# 1. Missing environment variables - Set via Amplify console
# 2. npm install fails - Check package.json
# 3. Build errors - Check client/src code

# Retry build
aws amplify start-job \
  --app-id $AMPLIFY_APP_ID \
  --branch-name master \
  --job-type RELEASE \
  --region ap-south-1
```

### Issue 3: Dashboard Shows No Links

**Symptoms:**
- Dashboard loads but table is empty
- Links created but don't appear

**Solution:**
```bash
# Check CloudWatch Logs
aws logs tail /aws/apigateway/wecare-url-shortener \
  --follow \
  --region ap-south-1

# Look for:
# 1. DynamoDB Query returning empty Items
# 2. Owner mismatch (check Integration Request template)
# 3. 403 Forbidden (token expired)

# Verify DynamoDB data
aws dynamodb scan \
  --table-name $TABLE_NAME \
  --region ap-south-1 \
  --max-items 10

# If data exists but not showing:
# - Check API Gateway Integration Request owner value
# - Should be: "links@wecare.digital"
```

### Issue 4: 403 Forbidden Errors

**Symptoms:**
- API calls return 403
- "Session expired" message

**Solution:**
```bash
# Check Cognito token expiration
# Tokens expire after 1 hour

# Solution 1: Sign out and sign in again
# Solution 2: Implement token refresh (already in App.vue)

# Verify Cognito configuration
aws cognito-idp describe-user-pool-client \
  --user-pool-id $USER_POOL_ID \
  --client-id $CLIENT_ID \
  --region ap-south-1

# Check callback URLs are correct
```

### Issue 5: CORS Errors

**Symptoms:**
- Browser console: "CORS policy blocked"

**Solution:**
```bash
# Verify API Gateway CORS configuration
# Should allow: https://go.wecare.digital

# Update CORS (if needed)
aws apigateway update-integration-response \
  --rest-api-id $API_ID \
  --resource-id RESOURCE_ID \
  --http-method GET \
  --status-code 200 \
  --patch-operations \
    op=replace,path=/responseParameters/method.response.header.Access-Control-Allow-Origin,value="'https://go.wecare.digital'" \
  --region ap-south-1

# Deploy API after changes
```

---

## Rollback Procedures

### Rollback Frontend (Amplify)

```bash
# List recent builds
aws amplify list-jobs \
  --app-id $AMPLIFY_APP_ID \
  --branch-name master \
  --max-results 10 \
  --region ap-south-1

# Rollback to previous commit
git log --oneline -10
git revert HEAD
git push origin master

# Amplify will auto-deploy the reverted version
```

### Rollback Backend (CloudFormation)

```bash
# Update stack to previous version
aws cloudformation update-stack \
  --stack-name wecare-url-shortener \
  --use-previous-template \
  --region ap-south-1

# Or delete and recreate
aws cloudformation delete-stack \
  --stack-name wecare-url-shortener \
  --region ap-south-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name wecare-url-shortener \
  --region ap-south-1

# Redeploy from backup template
aws cloudformation deploy \
  --template-file template.yaml.backup \
  --stack-name wecare-url-shortener \
  --capabilities CAPABILITY_IAM \
  --region ap-south-1
```

### Rollback Database (DynamoDB)

```bash
# Restore from point-in-time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name $TABLE_NAME \
  --target-table-name ${TABLE_NAME}-restored \
  --restore-date-time 2025-12-08T10:00:00Z \
  --region ap-south-1

# Swap tables (requires application downtime)
# 1. Update API Gateway to use restored table
# 2. Delete old table
# 3. Rename restored table
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] AWS CLI configured
- [ ] GitHub token generated
- [ ] ACM certificate created
- [ ] DNS records prepared
- [ ] Environment variables set
- [ ] Template validated

### Backend Deployment
- [ ] CloudFormation stack deployed
- [ ] API Gateway configured
- [ ] DynamoDB table created
- [ ] Cognito user pool created
- [ ] CloudFront distribution created
- [ ] IAM roles created

### Frontend Deployment
- [ ] Amplify app created
- [ ] Environment variables set
- [ ] Build successful
- [ ] Custom domain configured
- [ ] DNS records updated

### Post-Deployment
- [ ] API health check passed
- [ ] Frontend health check passed
- [ ] Authentication flow tested
- [ ] Create link tested
- [ ] Redirect tested
- [ ] CloudWatch alarms configured
- [ ] PITR enabled
- [ ] Backup created

### Documentation
- [ ] Architecture documented
- [ ] Deployment guide updated
- [ ] API endpoints documented
- [ ] Troubleshooting guide updated

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor CloudWatch dashboards
- Check error rates
- Review CloudWatch Logs

**Weekly:**
- Review cost reports
- Check DynamoDB capacity
- Update dependencies (npm audit)

**Monthly:**
- Create DynamoDB backup
- Review security groups
- Update documentation
- Performance testing

**Quarterly:**
- Disaster recovery drill
- Security audit
- Cost optimization review
- Architecture review

---

## Support

### Getting Help

**AWS Support:**
- Console: https://console.aws.amazon.com/support
- Documentation: https://docs.aws.amazon.com

**Community:**
- GitHub Issues: https://github.com/wecaredigital/r.wecare.digital/issues
- Stack Overflow: Tag `aws-amplify`, `aws-api-gateway`

**Internal:**
- Email: devops@wecare.digital
- Slack: #url-shortener

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Maintained By:** WECARE.DIGITAL DevOps Team
