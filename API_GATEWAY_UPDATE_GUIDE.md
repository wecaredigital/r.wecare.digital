# API Gateway Update Guide - Fix Dashboard Display Issue

## Problem
The dashboard was not displaying links because the API Gateway response mapping template was missing the `folder` field.

## Solution
Update the GET /app endpoint's Integration Response mapping template to include the `folder` field.

---

## Step-by-Step Instructions

### 1. Open AWS API Gateway Console
Go to: https://console.aws.amazon.com/apigateway

### 2. Select Your API
- Look for your API (ID: `xbj96ig388`)
- The API name should be something like "URL Shortener API" or "SiteAPI"
- Click on it to open

### 3. Navigate to the GET /app Method
- In the left sidebar, click **Resources**
- Expand the resource tree
- Find and click on **GET** under `/app`

### 4. Open Integration Response
- You'll see a flow diagram showing: Method Request → Integration Request → Integration Response → Method Response
- Click on **Integration Response**

### 5. Edit the Mapping Template
- You'll see a list of HTTP status codes (200, 400, etc.)
- Click on the **200** response to expand it
- Under **Mapping Templates**, you'll see `application/json`
- Click on `application/json` to edit

### 6. Replace the Template
Replace the existing template with this:

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

**Key Change:** Added the line:
```velocity
"folder":    "$util.defaultIfNull($elem.folder.S, '')",
```

### 7. Save the Changes
- Click the **Save** button (checkmark icon)
- You should see a success message

### 8. Deploy the API
- Click the **Actions** dropdown button at the top
- Select **Deploy API**
- In the popup:
  - **Deployment stage:** Select `Prod`
  - **Deployment description:** (optional) "Add folder field to GET /app response"
- Click **Deploy**

### 9. Verify the Deployment
- Wait a few seconds for the deployment to complete
- You should see a success message
- The API is now updated!

---

## Testing

After deployment, test the dashboard:

1. Go to your dashboard: https://go.wecare.digital
2. Sign in if needed
3. The dashboard should now display all your links with folders
4. Try creating a new link with a folder name
5. The link should appear immediately in the dashboard

---

## What This Fix Does

**Before:**
- API returned: `[{ "id": "...", "url": "...", "timestamp": "...", "owner": "...", "remark": "..." }]`
- Missing `folder` field caused folder filtering to fail

**After:**
- API returns: `[{ "id": "...", "url": "...", "timestamp": "...", "owner": "...", "folder": "...", "remark": "..." }]`
- Dashboard can now properly display and filter by folders

---

## Troubleshooting

### If links still don't appear:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Sign out and sign in again
3. Check browser console (F12) for errors
4. Verify the API Gateway deployment was successful

### If you get permission errors:
- Make sure you're signed in to AWS Console with proper permissions
- You need API Gateway update permissions

### If the template doesn't save:
- Check for syntax errors in the template
- Make sure you copied the entire template including the brackets `[]`

---

## Alternative: Update via AWS CLI

If you prefer using AWS CLI (requires AWS CLI to be installed):

```bash
# Get the API resource ID for /app
aws apigateway get-resources --rest-api-id xbj96ig388 --region ap-south-1

# Update the integration response (replace RESOURCE_ID with actual ID from above)
aws apigateway put-integration-response \
  --rest-api-id xbj96ig388 \
  --resource-id RESOURCE_ID \
  --http-method GET \
  --status-code 200 \
  --response-templates file://templates/app/get-response.json \
  --region ap-south-1

# Deploy to Prod stage
aws apigateway create-deployment \
  --rest-api-id xbj96ig388 \
  --stage-name Prod \
  --description "Add folder field to GET /app response" \
  --region ap-south-1
```

---

## Notes

- This is a **backend-only** change
- The frontend code has already been updated and deployed via AWS Amplify
- No code changes needed after this API Gateway update
- The change is immediate after deployment (no cache clearing needed on API side)

---

## Support

If you encounter any issues, check:
1. CloudWatch Logs for API Gateway
2. Browser console for frontend errors
3. Network tab in browser DevTools to see actual API responses
