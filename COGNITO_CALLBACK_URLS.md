# Cognito App Client Callback URLs Configuration

## What to Check in Cognito Console:

### 1. Go to App Client Settings
1. AWS Console → Cognito → User pools → **wecare-digital-UserPool**
2. Left sidebar → **App clients and analytics**
3. Click on your app client
4. Scroll down to **Hosted UI settings**

### 2. Verify Callback URLs
Make sure these URLs are configured:

**Allowed callback URLs:**
```
https://go.wecare.digital
https://master.d3fic2w2ke17v4.amplifyapp.com
http://localhost:8080
```

**Allowed sign-out URLs:**
```
https://go.wecare.digital
https://master.d3fic2w2ke17v4.amplifyapp.com
http://localhost:8080
```

### 3. Verify OAuth Settings
**Allowed OAuth Flows:**
- ✅ Authorization code grant

**Allowed OAuth Scopes:**
- ✅ email
- ✅ openid

### 4. Identity Providers
- ✅ Cognito User Pool

## If URLs are Missing:
1. Click **Edit** on the app client
2. Add the missing URLs
3. Click **Save changes**

## Current Domain Setup:
- **Login Domain**: user.wecare.digital ✅
- **App Domain**: go.wecare.digital ✅
- **API Domain**: xbj96ig388.execute-api.ap-south-1.amazonaws.com ✅