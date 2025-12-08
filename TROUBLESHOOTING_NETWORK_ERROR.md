# Troubleshooting Network Error

## Quick Diagnostics

### Step 1: Check Amplify Deployment Status

```bash
# Check if latest build is deployed
# Go to: https://console.aws.amazon.com/amplify

# Or check via CLI:
aws amplify list-jobs \
  --app-id YOUR_APP_ID \
  --branch-name master \
  --max-results 1 \
  --region ap-south-1
```

**Expected:** Status should be `SUCCEED`

If still `RUNNING`, wait 2-3 more minutes.

---

### Step 2: Check Browser Console

1. Open browser: https://go.wecare.digital
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Try to create a link
5. Look for errors

**Common Errors:**

#### Error: "getOwnerEmail is not defined"
**Cause:** Amplify hasn't deployed the latest code yet  
**Solution:** Wait for deployment to complete, then hard refresh (Ctrl+Shift+R)

#### Error: "Cannot read property 'email' of undefined"
**Cause:** JWT token is malformed or expired  
**Solution:** Sign out and sign in again

#### Error: "Network error"
**Cause:** API Gateway not responding or CORS issue  
**Solution:** Check Network tab for actual error

---

### Step 3: Check Network Tab

1. Open **Network** tab in DevTools
2. Try to create a link
3. Look for the **POST** request to `/app`
4. Click on it
5. Check:
   - **Status code**
   - **Response** tab
   - **Headers** tab (check Authorization header)

**Common Issues:**

#### Status: 403 Forbidden
**Cause:** Token expired or invalid  
**Solution:**
```javascript
// Check token in console:
const token = localStorage.getItem('cognitoIdentityToken');
console.log('Token:', token);

// Check expiration:
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Now:', new Date());

// If expired, sign out and sign in again
```

#### Status: 400 Bad Request
**Cause:** Invalid request body  
**Solution:** Check what's being sent:
```javascript
// In Dashboard.vue, add console.log before fetch:
console.log('Sending payload:', payload);
```

#### Status: 500 Internal Server Error
**Cause:** DynamoDB error or API Gateway misconfiguration  
**Solution:** Check CloudWatch Logs

#### Status: (failed) net::ERR_FAILED
**Cause:** CORS issue or network connectivity  
**Solution:** Check CORS configuration in API Gateway

---

### Step 4: Check CloudWatch Logs

```bash
# Tail API Gateway logs
aws logs tail /aws/apigateway/wecare-url-shortener \
  --follow \
  --region ap-south-1

# Or go to CloudWatch Console:
# https://console.aws.amazon.com/cloudwatch
```

Look for:
- Request details
- DynamoDB errors
- Authorization failures

---

### Step 5: Verify API Gateway Configuration

#### Check GET /app Integration Request

Should be:
```json
":v_owner": {"S": "$context.authorizer.claims.email"}
```

#### Check POST /app Integration Request

Should be:
```json
{
  "ExpressionAttributeValues": {
    ":o": {"S": $input.json('$.owner')}
  }
}
```

#### Check CORS

OPTIONS /app should return:
```
Access-Control-Allow-Origin: https://go.wecare.digital
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

### Step 6: Test API Directly

```bash
# Get your JWT token from browser localStorage
TOKEN="your_token_here"

# Test GET /app
curl -H "Authorization: $TOKEN" \
  https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app

# Expected: JSON array of links

# Test POST /app
curl -X POST \
  -H "Authorization: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test123",
    "url": "https://example.com",
    "owner": "r@wecare.digital",
    "folder": "test",
    "remark": "Test",
    "timestamp": "2025-12-08 20:00:00 +0530"
  }' \
  https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app

# Expected: 200 OK with created item
```

---

## Common Solutions

### Solution 1: Clear Cache and Hard Refresh

```
1. Press Ctrl+Shift+Delete
2. Clear "Cached images and files"
3. Close browser
4. Reopen and go to go.wecare.digital
5. Hard refresh: Ctrl+Shift+R
```

### Solution 2: Sign Out and Sign In Again

```
1. Click "Sign Out"
2. Clear localStorage (F12 → Application → Local Storage → Clear)
3. Sign in again
4. Try creating a link
```

### Solution 3: Wait for Amplify Deployment

```
# Check deployment status
# Go to: https://console.aws.amazon.com/amplify

# Wait until status is "SUCCEED"
# Then hard refresh browser
```

### Solution 4: Redeploy API Gateway

```
1. Go to API Gateway Console
2. Select your API
3. Click Actions → Deploy API
4. Select Prod stage
5. Click Deploy
```

---

## Still Not Working?

### Get Detailed Error Info

Add this to Dashboard.vue temporarily:

```javascript
async createLink() {
  try {
    const ownerEmail = getOwnerEmail();
    console.log('Owner email:', ownerEmail);
    
    if (!ownerEmail) {
      console.error('No owner email!');
      this.errorMsg = "Unable to get owner email. Please sign in again.";
      return;
    }

    const payload = { 
      ...this.model, 
      owner: ownerEmail,
      timestamp: getISTTimestamp()
    };
    
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const token = window.localStorage.getItem("cognitoIdentityToken");
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    
    const response = await fetch("https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod/app", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      console.log('Success!');
      // ... rest of code
    } else {
      console.error('Failed:', response.status, responseText);
      this.errorMsg = `Failed: ${response.status} - ${responseText}`;
    }
  } catch (err) {
    console.error('Catch error:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    this.errorMsg = `Error: ${err.message}`;
  }
}
```

Then check the console output and share it with me.

---

## Contact Support

If none of the above works, provide:
1. Browser console errors (screenshot)
2. Network tab details (screenshot)
3. CloudWatch logs (last 10 lines)
4. Amplify deployment status

Email: devops@wecare.digital
