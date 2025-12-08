# Fix POST /app Template - Simple Steps

## What You Need to Do

Update the POST /app Integration Request template in API Gateway Console.

---

## Step-by-Step Instructions

### 1. Open API Gateway Console

Go to: https://console.aws.amazon.com/apigateway/home?region=ap-south-1#/apis/xbj96ig388/resources

Or:
1. Open AWS Console
2. Search for "API Gateway"
3. Click on API: **xbj96ig388**
4. Click **Resources** in left menu

---

### 2. Navigate to POST /app

1. In the Resources tree, find **/app**
2. Click on **POST** method under /app
3. You should see the Method Execution diagram

---

### 3. Open Integration Request

1. Click on **Integration Request** box
2. Scroll down to **Mapping Templates** section
3. Click on **application/json**

---

### 4. Replace the Template

**Delete everything** in the template editor and paste this:

```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "ConditionExpression": "attribute_not_exists(id)",
  "Key": {
    "id": {
      "S": $input.json('$.id')
    }
  },
  "ExpressionAttributeNames": {
    "#u": "url",
    "#o": "owner",
    "#ts": "timestamp",
    "#f": "folder",
    "#r": "remark"
  },
  "ExpressionAttributeValues": {
    ":u": {
      "S": $input.json('$.url')
    },
    ":o": {
      "S": "$context.authorizer.claims.email"
    },
    ":ts": {
      "S": "$context.requestTime"
    },
    ":f": {
      "S": $input.json('$.folder')
    },
    ":r": {
      "S": $input.json('$.remark')
    }
  },
  "UpdateExpression": "SET #u = :u, #o = :o, #ts = :ts, #f = :f, #r = :r",
  "ReturnValues": "ALL_NEW"
}
```

---

### 5. Save the Template

1. Click **Save** button at the bottom
2. You should see a success message

---

### 6. Deploy the API

1. Click **Actions** button (top right of Resources panel)
2. Click **Deploy API**
3. **Deployment stage**: Select **Prod**
4. **Deployment description**: "Fixed POST template for per-user links"
5. Click **Deploy**
6. Wait 30 seconds

---

### 7. Test

1. Open: https://go.wecare.digital
2. Sign in as **r@wecare.digital**
3. You should see your 25 links ✅
4. Click **Create Link**
5. Fill in:
   - **ID**: test123
   - **URL**: https://example.com
   - **Folder**: testing
   - **Remark**: Test link
6. Click **Create**
7. Link should appear immediately ✅

---

## What This Template Does

```json
"owner": "$context.authorizer.claims.email"
```
- Sets owner to the logged-in user's email from JWT token
- r@wecare.digital creates links with owner = "r@wecare.digital"
- vibe@wecare.digital creates links with owner = "vibe@wecare.digital"

```json
"timestamp": "$context.requestTime"
```
- Sets timestamp from API Gateway (consistent format)

```json
"folder": $input.json('$.folder')
"remark": $input.json('$.remark')
```
- Includes folder and remark fields from request body

```json
"ConditionExpression": "attribute_not_exists(id)"
```
- Prevents duplicate IDs (returns error if ID already exists)

---

## Expected Behavior After Fix

### User: r@wecare.digital
- ✅ Sees their 25 existing links
- ✅ Can create new links
- ✅ New links saved with owner = "r@wecare.digital"
- ✅ Cannot see other users' links

### User: vibe@wecare.digital
- ✅ Sees only their own links (0 currently)
- ✅ Can create new links
- ✅ New links saved with owner = "vibe@wecare.digital"
- ✅ Cannot see r@'s links

**Each user has private, isolated links.**

---

## Verification

After deployment, check CloudWatch logs:

1. Create a test link
2. Go to API Gateway Console → Stages → Prod → Logs
3. Click "View logs in CloudWatch"
4. Look for the POST request
5. Find: `Endpoint request body after transformations`
6. Should see:
```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "Key": {"id": {"S": "test123"}},
  "ExpressionAttributeValues": {
    ":o": {"S": "r@wecare.digital"},  ← Should be YOUR email
    ":u": {"S": "https://example.com"},
    ":f": {"S": "testing"},
    ":r": {"S": "Test link"}
  }
}
```

---

## Troubleshooting

### Issue: "Syntax error" when saving
**Solution:** Make sure you copied the ENTIRE template including opening `{` and closing `}`

### Issue: "Duplicate ID error" when creating link
**Solution:** This is CORRECT behavior - the ID already exists. Choose a different ID.

### Issue: Still not working after deployment
**Solution:** 
1. Wait 60 seconds (deployment takes time)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Sign out and sign in again (refresh JWT token)
4. Try again

### Issue: "403 Forbidden"
**Solution:** Token expired - sign out and sign in again

---

## Summary

**What you're fixing:**
- POST /app Integration Request template

**What stays the same:**
- GET /app (already correct)
- Frontend Dashboard.vue (already correct)
- DynamoDB data (no changes needed)

**Time required:** 5 minutes

**Risk level:** Low (only affects creating new links, not viewing existing ones)

**Status after fix:** ✅ System will work exactly like it did originally
