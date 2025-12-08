# Amplify Environment Variables Setup

## Important: .env vs Amplify Environment Variables

The `client/.env` file is only used for **local development**. For **Amplify deployment**, you need to set environment variables in the Amplify console.

## Step 1: Go to Amplify Console
1. Open AWS Console
2. Go to **AWS Amplify** service
3. Click on your app: **Url-Shortener-Client**

## Step 2: Configure Environment Variables
1. In the left sidebar, click **Environment variables**
2. Click **Manage variables**
3. Add these variables:

| Variable Name | Value |
|---------------|-------|
| `VUE_APP_NAME` | `WECARE.DIGITAL` |
| `VUE_APP_API_ROOT` | `https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod` |
| `VUE_APP_AUTH_DOMAIN` | `https://user.wecare.digital` |
| `VUE_APP_CLIENT_ID` | `4tjhielf61n43u1kt7gvm3pfup` |

## Step 3: Save and Redeploy
1. Click **Save**
2. Go to **App settings** → **Build settings**
3. Click **Redeploy this version** (or push new code to trigger build)

## Alternative: Use AWS CLI Command
You can also set these using the AWS CLI command from your CloudFormation template:

```bash
aws amplify update-app --app-id d3fic2w2ke17v4 --environment-variables VUE_APP_NAME=WECARE.DIGITAL,VUE_APP_CLIENT_ID=4tjhielf61n43u1kt7gvm3pfup,VUE_APP_API_ROOT=https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod,VUE_APP_AUTH_DOMAIN=https://user.wecare.digital
```

## Step 4: Verify Configuration
After redeployment:
1. Visit **go.wecare.digital**
2. Click **"Sign In"** button
3. Should redirect to **user.wecare.digital** (your custom Cognito domain)
4. After login, should redirect back to dashboard

## Current Status:
- ✅ Custom domain configured: `user.wecare.digital`
- ✅ Client ID found: `4tjhielf61n43u1kt7gvm3pfup`
- ✅ API endpoint configured: `xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod`
- ❓ Need to verify: Amplify environment variables
- ❓ Need to verify: Cognito callback URLs

## Next Steps:
1. Set Amplify environment variables (this document)
2. Verify Cognito callback URLs (see COGNITO_CALLBACK_URLS.md)
3. Test login flow