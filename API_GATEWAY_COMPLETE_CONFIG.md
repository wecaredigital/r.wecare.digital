# API Gateway Complete Configuration Guide

## Table of Contents
1. [GET /app Configuration](#get-app-configuration)
2. [POST /app Configuration](#post-app-configuration)
3. [OPTIONS /app Configuration](#options-app-configuration)
4. [Deployment Steps](#deployment-steps)

---

## GET /app Configuration

### 1. Method Request

**Settings:**
- **Authorization**: Cognito User Pool Authorizer (wtz7ap)
- **Request Validator**: None
- **API Key Required**: false

**URL Query String Parameters:**
- None required

**HTTP Request Headers:**
- `Authorization` (not required - handled by authorizer)

**Request Body:**
- None

---

### 2. Integration Request

**Integration Type:** AWS Service

**Settings:**
- **AWS Region**: ap-south-1
- **AWS Service**: DynamoDB
- **HTTP Method**: POST
- **Action**: Query
- **Execution Role**: (Auto-configured by SAM)
- **Content Handling**: Passthrough
- **Timeout**: Default (29000 ms)

**URL Path Parameters:**
- None

**URL Query String Parameters:**
- None

**HTTP Headers:**
- None (auto-configured)

**Mapping Templates:**
- **Content-Type**: `application/json`
- **Template**:

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
- Queries DynamoDB using the OwnerIndex GSI
- Filters by the logged-in user's email from JWT token
- Returns only links owned by the current user

---

### 3. Integration Response

**Status Code**: 200

**Selection Pattern**: (empty - default)

**HTTP Headers:**
- `Access-Control-Allow-Origin`: `'*'`
- `Cache-Control`: `'no-cache, no-store'`

**Mapping Templates:**
- **Content-Type**: `application/json`
- **Template**:

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
- Uses `defaultIfNull` for optional fields (folder, remark)
- Returns empty array `[]` if no items found

**Example Response:**
```json
[
  {
    "id": "google",
    "url": "https://google.com",
    "timestamp": "2025-12-08 15:30:00 +0530",
    "owner": "r@wecare.digital",
    "folder": "search",
    "remark": "Google search engine"
  }
]
```

---

### 4. Method Response

**Status Code**: 200

**Response Headers:**
- `Access-Control-Allow-Origin`
- `Cache-Control`

**Response Models:**
- None (or `application/json`: Empty)

---

## POST /app Configuration

### 1. Method Request

**Settings:**
- **Authorization**: Cognito User Pool Authorizer (wtz7ap)
- **Request Validator**: None
- **API Key Required**: false

**URL Query String Parameters:**
- None

**HTTP Request Headers:**
- `Authorization` (handled by authorizer)
- `Content-Type`: application/json

**Request Body:**
- **Content-Type**: `application/json`
- **Model**: None

**Expected Request Body:**
```json
{
  "id": "google",
  "url": "https://google.com",
  "folder": "search",
  "remark": "Google search"
}
```

**Note:** `owner` and `timestamp` are set by API Gateway (not from request body)

---

### 2. Integration Request

**Integration Type:** AWS Service

**Settings:**
- **AWS Region**: ap-south-1
- **AWS Service**: DynamoDB
- **HTTP Method**: POST
- **Action**: UpdateItem
- **Execution Role**: (Auto-configured by SAM)
- **Content Handling**: Passthrough
- **Timeout**: Default (29000 ms)

**URL Path Parameters:**
- None

**URL Query String Parameters:**
- None

**HTTP Headers:**
- None (auto-configured)

**Mapping Templates:**
- **Content-Type**: `application/json`
- **Template**:

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
- `ConditionExpression`: Prevents duplicate IDs (returns error if ID exists)
- `id`: From request body
- `url`: From request body
- `owner`: **Overridden** with JWT email (security - cannot be spoofed)
- `timestamp`: **Overridden** with API Gateway request time (consistency)
- `folder`: From request body (optional)
- `remark`: From request body (optional)
- Returns the created/updated item

---

### 3. Integration Response

**Status Code**: 200

**Selection Pattern**: (empty - default)

**HTTP Headers:**
- `Access-Control-Allow-Origin`: `'*'`

**Mapping Templates:**
- **Content-Type**: `application/json`
- **Template**:

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

**What this does:**
- Transforms DynamoDB UpdateItem response to JSON object
- Returns the created item with all fields
- Uses `defaultIfNull` for optional fields

**Example Response:**
```json
{
  "id": "google",
  "url": "https://google.com",
  "timestamp": "08/Dec/2025:15:30:45 +0000",
  "owner": "r@wecare.digital",
  "folder": "search",
  "remark": "Google search"
}
```

---

### 4. Method Response

**Status Code**: 200

**Response Headers:**
- `Access-Control-Allow-Origin`

**Response Models:**
- None (or `application/json`: Empty)

---

## OPTIONS /app Configuration

### 1. Method Request

**Settings:**
- **Authorization**: None (CORS preflight must be unauthenticated)
- **Request Validator**: None
- **API Key Required**: false

**URL Query String Parameters:**
- None

**HTTP Request Headers:**
- None required

**Request Body:**
- None

---

### 2. Integration Request

**Integration Type:** MOCK

**Settings:**
- **Request Templates**: Required

**Mapping Templates:**
- **Content-Type**: `application/json`
- **Template**:

```json
{
  "statusCode": 200
}
```

**What this does:**
- Returns a mock 200 response without calling any backend
- Required for CORS preflight requests

---

### 3. Integration Response

**Status Code**: 200

**Selection Pattern**: (empty - default)

**HTTP Headers:**
- `Access-Control-Allow-Origin`: `'*'`
- `Access-Control-Allow-Headers`: `'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'`
- `Access-Control-Allow-Methods`: `'GET,POST,PUT,DELETE,OPTIONS'`
- `Access-Control-Max-Age`: `'86400'`

**Mapping Templates:**
- **Content-Type**: `application/json`
- **Template**:

```json
{}
```

**What this does:**
- Returns CORS headers for preflight requests
- Allows all origins (`*`)
- Allows required headers (Authorization, Content-Type, etc.)
- Allows all HTTP methods
- Caches preflight response for 24 hours (86400 seconds)

---

### 4. Method Response

**Status Code**: 200

**Response Headers:**
- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Methods`
- `Access-Control-Max-Age`

**Response Models:**
- None (or `application/json`: Empty)

---

## Deployment Steps

### Step 1: Update GET /app

1. Go to **API Gateway Console**: https://console.aws.amazon.com/apigateway
2. Select API: **xbj96ig388**
3. Click **Resources** → **GET /app**

**Method Request:**
4. Click **Method Request**
5. Verify **Authorization**: Cognito User Pool Authorizer
6. Click **← Method Execution** (back arrow)

**Integration Request:**
7. Click **Integration Request**
8. Verify **Integration type**: AWS Service
9. Verify **AWS Service**: DynamoDB
10. Verify **HTTP method**: POST
11. Verify **Action**: Query
12. Scroll to **Mapping Templates**
13. Click **application/json**
14. Paste the GET Integration Request template (from above)
15. Click **Save**
16. Click **← Method Execution** (back arrow)

**Integration Response:**
17. Click **Integration Response**
18. Expand **200** response
19. Expand **Mapping Templates**
20. Click **application/json**
21. Paste the GET Integration Response template (from above)
22. Click **Save**
23. Click **← Method Execution** (back arrow)

**Method Response:**
24. Click **Method Response**
25. Verify **200** status code exists
26. Expand **200**
27. Verify Response Headers:
    - `Access-Control-Allow-Origin`
    - `Cache-Control`
28. Click **← Method Execution** (back arrow)

---

### Step 2: Update POST /app

29. Go back to **Resources**
30. Click **POST /app**

**Method Request:**
31. Click **Method Request**
32. Verify **Authorization**: Cognito User Pool Authorizer
33. Click **← Method Execution** (back arrow)

**Integration Request:**
34. Click **Integration Request**
35. Verify **Integration type**: AWS Service
36. Verify **AWS Service**: DynamoDB
37. Verify **HTTP method**: POST
38. Verify **Action**: UpdateItem
39. Scroll to **Mapping Templates**
40. Click **application/json**
41. Paste the POST Integration Request template (from above)
42. Click **Save**
43. Click **← Method Execution** (back arrow)

**Integration Response:**
44. Click **Integration Response**
45. Expand **200** response
46. Expand **Mapping Templates**
47. Click **application/json**
48. Paste the POST Integration Response template (from above)
49. Click **Save**
50. Click **← Method Execution** (back arrow)

**Method Response:**
51. Click **Method Response**
52. Verify **200** status code exists
53. Expand **200**
54. Verify Response Header: `Access-Control-Allow-Origin`
55. Click **← Method Execution** (back arrow)

---

### Step 3: Update OPTIONS /app

56. Go back to **Resources**
57. Click **OPTIONS /app**

**Method Request:**
58. Click **Method Request**
59. Verify **Authorization**: None
60. Click **← Method Execution** (back arrow)

**Integration Request:**
61. Click **Integration Request**
62. Verify **Integration type**: MOCK
63. Scroll to **Mapping Templates**
64. Click **application/json**
65. Paste the OPTIONS Integration Request template (from above)
66. Click **Save**
67. Click **← Method Execution** (back arrow)

**Integration Response:**
68. Click **Integration Response**
69. Expand **200** response
70. Verify **Header Mappings**:
    - `Access-Control-Allow-Origin`: `'*'`
    - `Access-Control-Allow-Headers`: `'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'`
    - `Access-Control-Allow-Methods`: `'GET,POST,PUT,DELETE,OPTIONS'`
    - `Access-Control-Max-Age`: `'86400'`
71. Expand **Mapping Templates**
72. Click **application/json**
73. Verify template is `{}`
74. Click **Save**
75. Click **← Method Execution** (back arrow)

**Method Response:**
76. Click **Method Response**
77. Verify **200** status code exists
78. Expand **200**
79. Verify Response Headers:
    - `Access-Control-Allow-Origin`
    - `Access-Control-Allow-Headers`
    - `Access-Control-Allow-Methods`
    - `Access-Control-Max-Age`

---

### Step 4: Deploy API

80. Click **Actions** (top right of Resources panel)
81. Click **Deploy API**
82. **Deployment stage**: Select **Prod**
83. **Deployment description**: (optional) "Updated GET/POST templates with folder and remark fields"
84. Click **Deploy**
85. Wait 30-60 seconds for deployment to complete

---

### Step 5: Test

86. Open browser: https://go.wecare.digital
87. Click **Sign In**
88. Sign in with your credentials
89. Dashboard should load and display your links
90. Click **Create Link**
91. Fill in:
    - **ID**: test123
    - **URL**: https://example.com
    - **Folder**: testing
    - **Remark**: Test link
92. Click **Create**
93. Link should appear immediately in dashboard ✅
94. Verify all fields are displayed (ID, URL, Folder, Remark)

---

## Verification Checklist

After deployment, verify:

### GET /app
- [ ] Method Request uses Cognito authorizer
- [ ] Integration Request queries DynamoDB with OwnerIndex
- [ ] Integration Request uses `$context.authorizer.claims.email`
- [ ] Integration Response includes all 6 fields (id, url, timestamp, owner, folder, remark)
- [ ] Integration Response uses `defaultIfNull` for folder and remark
- [ ] Method Response has CORS headers

### POST /app
- [ ] Method Request uses Cognito authorizer
- [ ] Integration Request uses UpdateItem action
- [ ] Integration Request includes ConditionExpression
- [ ] Integration Request uses `$context.authorizer.claims.email` for owner
- [ ] Integration Request uses `$context.requestTime` for timestamp
- [ ] Integration Request includes folder and remark fields
- [ ] Integration Response transforms DynamoDB response correctly
- [ ] Method Response has CORS headers

### OPTIONS /app
- [ ] Method Request has NO authorization
- [ ] Integration Request is MOCK type
- [ ] Integration Response has all CORS headers
- [ ] Method Response defines all CORS headers

### Deployment
- [ ] API deployed to Prod stage
- [ ] No errors in deployment log
- [ ] CloudWatch logs show successful requests

### Frontend Testing
- [ ] Dashboard loads without errors
- [ ] Links display with all fields (folder, remark)
- [ ] Can create new links with folder and remark
- [ ] Can edit existing links
- [ ] Can delete links
- [ ] Search works correctly
- [ ] Folder filter works correctly
- [ ] Pagination works correctly

---

## Expected Behavior

### User: r@wecare.digital
1. Signs in
2. Sees their 25 existing links (if they exist in DynamoDB)
3. Creates new link → saved with `owner: "r@wecare.digital"`
4. Link appears immediately in dashboard
5. All fields display correctly (ID, URL, Folder, Remark)

### User: vibe@wecare.digital
1. Signs in
2. Sees only their own links (isolated from r@'s links)
3. Creates new link → saved with `owner: "vibe@wecare.digital"`
4. Link appears immediately in dashboard
5. Cannot see r@'s links (data isolation working)

---

## Troubleshooting

### Issue: "Network error"
**Cause:** POST template syntax error or missing fields  
**Solution:** 
1. Verify POST Integration Request template exactly matches above
2. Check for missing commas or quotes
3. Verify `$input.json()` syntax is correct

### Issue: "Links not appearing after creation"
**Cause:** GET response template missing fields  
**Solution:** 
1. Verify GET Integration Response includes folder and remark
2. Check `defaultIfNull` syntax
3. Verify array format with proper commas

### Issue: "Duplicate ID error"
**Cause:** ConditionExpression working correctly  
**Solution:** This is expected behavior - choose a different ID

### Issue: "403 Forbidden"
**Cause:** Token expired (1 hour expiration)  
**Solution:** Sign out and sign in again

### Issue: "CORS error"
**Cause:** OPTIONS method not configured or missing headers  
**Solution:** 
1. Verify OPTIONS method exists
2. Check all CORS headers are present
3. Verify OPTIONS has NO authorization
4. Redeploy API

### Issue: "Empty dashboard but links exist in DynamoDB"
**Cause:** Owner field mismatch or GET template error  
**Solution:** 
1. Check DynamoDB: verify owner field matches user's email
2. Verify GET Integration Request uses `$context.authorizer.claims.email`
3. Check CloudWatch logs for DynamoDB query results
4. Verify OwnerIndex GSI exists and is active

---

## CloudWatch Logs Analysis

To debug issues, check CloudWatch logs:

1. Go to **API Gateway Console**
2. Click **Stages** → **Prod**
3. Click **Logs/Tracing** tab
4. Click **View logs in CloudWatch**

**Look for:**
- `Endpoint request body after transformations` - Shows what's sent to DynamoDB
- `Endpoint response body before transformations` - Shows DynamoDB response
- `Method response body after transformations` - Shows final API response

**Example successful GET request:**
```
Endpoint request body: {"TableName":"...","IndexName":"OwnerIndex",...}
Endpoint response body: {"Count":25,"Items":[...],"ScannedCount":25}
Method response body: [{"id":"google","url":"https://google.com",...}]
```

---

## Summary

**Configuration Type:** Per-User Links (Isolated Data)

**Security Features:**
- Owner always set from JWT token (cannot be spoofed)
- Timestamp always set from API Gateway (consistent)
- Each user sees only their own links
- ConditionExpression prevents duplicate IDs

**Fields Stored:**
- `id` (partition key) - User-defined short link ID
- `url` (string) - Target URL
- `owner` (string) - User's email from JWT
- `timestamp` (string) - API Gateway request time
- `folder` (string) - Optional folder/category
- `remark` (string) - Optional description/note

**API Endpoint:** https://xbj96ig388.execute-api.ap-south-1.amazonaws.com/Prod

**Table Name:** r-wecare-digital-LinkTable-YPF44B2N1ONI

**Status:** ✅ Ready for deployment
