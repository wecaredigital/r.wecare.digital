# How to Get Your Cognito Client ID

## Step 1: Go to AWS Cognito Console
1. Open AWS Console
2. Go to **Cognito** service
3. Click **User pools**

## Step 2: Find Your User Pool
1. Click on **wecare-digital-UserPool** (ID: ap-south-1_Boa0BxAAW)

## Step 3: Get the Client ID
1. In the left sidebar, click **App clients and analytics**
2. You'll see your app client listed
3. **Copy the Client ID** (it looks like: `1a2b3c4d5e6f7g8h9i0j1k2l3m`)

## Step 4: Update Your .env File
Replace this line in `client/.env`:
```
VUE_APP_CLIENT_ID=<PUT-YOUR-APP-CLIENT-ID-HERE>
```

With:
```
VUE_APP_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

## Step 5: Verify Other Settings
Make sure these are correct in `client/.env`:
```
VUE_APP_NAME=WECARE.DIGITAL
VUE_APP_API_ROOT=https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod
VUE_APP_AUTH_DOMAIN=https://user.wecare.digital
VUE_APP_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

## Step 6: Test the Login Flow
After updating:
1. Save the file
2. Push to GitHub (Amplify will redeploy)
3. Test login at go.wecare.digital