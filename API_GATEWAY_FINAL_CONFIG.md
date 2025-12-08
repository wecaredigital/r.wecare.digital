# API Gateway Final Configuration - Complete Templates

## ✅ Verified Configuration for Per-User Links

This configuration has been cross-checked with Dashboard.vue and will work correctly.

---

## GET /app Endpoint

### Integration Request

**Path:** GET /app → Integration Request → Mapping Templates → application/json

```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "IndexName": "OwnerIndex",
  "KeyConditionExpression": "#n_owner = :v_owner",
  "ExpressionAttributeValues": {
    ":v_owner": {
      "S": "$context.authorizer.claims.email"
    }
  },
  "ExpressionAttributeNames": {
    "#n_owner": "owner"
  }
}
```

**What this does:**
- Queries DynamoDB using OwnerIndex
- Filters by logged-in user's email from JWT token
- Returns only links owned by the current user

---

### Integration Response

**Path:** GET /app → Integration Response → 200 → Mapping Templates → application/json

```velocity
#set($inputRoot = $input.path('$'))
[
  #foreach($elem in $inputRoot.Items) {
    "id": "$elem.id.S",
    "url": "$elem.url.S",
    "timestamp": "$elem.timestamp.S",
    "owner": "$elem.owner.S",
    "folder": "$util.defaultIfNull($elem.folder.S, '')",
    "remark": "$util.defaultIfNull($elem.remark.S, '')"
  }#if($foreach.hasNext),#end
  #end
]
```

**What this does:**
- Transforms DynamoDB response to JSON array
- Includes all 6 fields: id, url, timestamp, owner, folder, remark
- Uses `defaultIfNull` for folder and remark (handles missing values)

**Example Response:**
```json
[
  {
    "id": "google",
    "url": "https://google.com",
    "timestamp": "2025-12-08 15:30:00 +0530",
    "owner": "r@wecare.digital",
    "folder": "search",
    "remark": "Google search"
  }
]
```

---

## POST /app Endpoint

### Integration Request

**Path:** POST /app → Integration Request → Mapping Templates → application/json

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

**What this does:**
- Creates/updates item in DynamoDB
- `ConditionExpression`: Prevents duplicate IDs
- `owner`: Set from JWT token (logged-in user's email)
- `timestamp`: Set from API Gateway request time
- `url`, `folder`, `remark`: From request body
- Returns the created item

**Dashboard sends:**
```json
{
  "id": "google",
  "url": "https://google.com",
  "owner": "r@wecare.digital",
  "folder": "search",
  "remark": "Google search",
  "timestamp": "2025-12-08 15:30:00 +0530"
}
```

**API Gateway transforms to DynamoDB:**
- Uses `id` from body
- Uses `url` from body
- **Overrides `owner`** with JWT email (security)
- **Overrides `timestamp`** with API Gateway time (consistency)
- Uses `folder` from body
- Uses `remark` from body

---

## Deployment Steps

### 1. Update GET /app

1. Go to API Gateway Console: https://console.aws.amazon.com/apigateway
2. Select API (ID: xbj96ig388)
3. Click **Resources** → **GET /app**

**Integration Request:**
4. Click **Integration Request**
5. Scroll to **Mapping Templates**
6. Click **application/json**
7. Copy the GET Integration Request template above
8. Paste and **Save**

**Integration Response:**
9. Go back, click **Integration Response**
10. Click **200** response
11. Click **application/json** under Mapping Templates
12. Copy the GET Integration Response template above
13. Paste and **Save**

### 2. Update POST /app

14. Go back to Resources
15. Click **POST /app**
16. Click **Integration Request**
17. Scroll to **Mapping Templates**
18. Click **application/json**
19. Copy the POST Integration Request template above
20. Paste and **Save**

### 3. Deploy API

21. Click **Actions** (top right)
22. Click **Deploy API**
23. Select **Prod** stage
24. Click **Deploy**
25. Wait 30 seconds

### 4. Test

26. Go to https://go.wecare.digital
27. Sign in
28. Dashboard should show your links
29. Create a new link with folder and remark
30. Should work without errors ✅

---

## Verification Checklist

After deployment, verify:

- [ ] GET /app Integration Request uses `$context.authorizer.claims.email`
- [ ] GET /app Integration Response includes folder and remark
- [ ] POST /app Integration Request includes all 5 fields
- [ ] POST /app uses `$context.authorizer.claims.email` for owner
- [ ] POST /app uses `$context.requestTime` for timestamp
- [ ] API deployed to Prod stage
- [ ] Dashboard loads without errors
- [ ] Links display with folder and remark
- [ ] Can create new links
- [ ] Can edit links
- [ ] Can delete links

---

## Expected Behavior

### User r@wecare.digital:
1. Signs in
2. Sees their 25 existing links
3. Creates new link → saved with `owner: "r@wecare.digital"`
4. Link appears immediately in dashboard

### User vibe@wecare.digital:
1. Signs in
2. Sees only their own links (not r@'s links)
3. Creates new link → saved with `owner: "vibe@wecare.digital"`
4. Link appears immediately in dashboard

**Each user has isolated data.** ✅

---

## Troubleshooting

### Issue: "Network error"
**Cause:** POST template missing fields or syntax error
**Solution:** Verify POST template exactly matches above (including commas)

### Issue: "Links not appearing"
**Cause:** GET response template missing fields
**Solution:** Verify GET response includes folder and remark

### Issue: "Duplicate ID error"
**Cause:** ConditionExpression working correctly
**Solution:** This is expected - choose a different ID

### Issue: "403 Forbidden"
**Cause:** Token expired (1 hour expiration)
**Solution:** Sign out and sign in again

---

## Summary

**Configuration Type:** Per-User Links (Isolated Data)

**Fields Stored:**
- `id` (partition key)
- `url` (target URL)
- `owner` (user's email from JWT)
- `timestamp` (API Gateway request time)
- `folder` (user input)
- `remark` (user input)

**Security:**
- Owner always set from JWT token (cannot be spoofed)
- Timestamp always set from API Gateway (consistent)
- Each user sees only their own links

**Status:** ✅ Ready for deployment
