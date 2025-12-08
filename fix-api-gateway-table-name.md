# Fix API Gateway Table Name Issue

## Problem
The API Gateway GET /app integration is querying the wrong DynamoDB table name.

Current hardcoded name in `templates/app/get-request.json`:
```json
"TableName": "SlipLink-LinkTable-A2SD9C321JCE"
```

This is why GET /app returns `[]` even after you create links - it's looking in the wrong table!

---

## Solution: Find Your Actual Table Name

### Option 1: AWS Console (Easiest)

1. Go to DynamoDB Console: https://console.aws.amazon.com/dynamodbv2
2. Click **Tables** in the left menu
3. Look for a table with a name like:
   - `shortener-LinkTable-XXXXX` or
   - `SlipLink-LinkTable-XXXXX` or
   - Something with `LinkTable` in it
4. Copy the **exact table name**

### Option 2: AWS CLI

```bash
aws dynamodb list-tables --region ap-south-1
```

Look for the table with "LinkTable" in the name.

### Option 3: CloudFormation Console

1. Go to CloudFormation: https://console.aws.amazon.com/cloudformation
2. Find your stack (probably named "shortener" or similar)
3. Click on **Resources** tab
4. Find the resource with Logical ID = `LinkTable`
5. Copy the **Physical ID** (that's your actual table name)

---

## Update API Gateway Integration

Once you have the correct table name, update it in API Gateway:

### Step 1: Go to API Gateway Console
https://console.aws.amazon.com/apigateway

### Step 2: Select Your API
- API ID: `xbj96ig388`
- Name: "URL Shortener API" or "SiteAPI"

### Step 3: Navigate to GET /app
- Click **Resources** in left menu
- Find **GET** under `/app`
- Click on it

### Step 4: Edit Integration Request
- Click **Integration Request**
- Scroll down to **Mapping Templates**
- Click on **application/json**
- You'll see the current request template

### Step 5: Update the TableName
Replace the current template with this (using YOUR actual table name):

```json
{
  "TableName": "YOUR-ACTUAL-TABLE-NAME-HERE",
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

**Important:** Replace `YOUR-ACTUAL-TABLE-NAME-HERE` with the exact table name you found.

### Step 6: Save
- Click **Save** (checkmark icon)

### Step 7: Also Update Integration Response (for folder field)
- Go back to the GET /app method
- Click **Integration Response**
- Click on **200** response
- Click on **application/json** under Mapping Templates
- Replace with:

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

- Click **Save**

### Step 8: Deploy API
- Click **Actions** → **Deploy API**
- Select **Prod** stage
- Click **Deploy**

---

## Test the Fix

After deploying:

1. Go to your dashboard: https://go.wecare.digital
2. Sign in
3. Create a new link
4. The link should now appear in the dashboard immediately!
5. Refresh the page - links should persist

---

## Verify Data is in DynamoDB

To confirm your links are actually being saved:

1. Go to DynamoDB Console: https://console.aws.amazon.com/dynamodbv2
2. Click on your table
3. Click **Explore table items**
4. You should see your saved links with:
   - `id` (partition key)
   - `owner` (GSI partition key)
   - `url`, `folder`, `remark`, `timestamp`

If you see items here but the dashboard is empty, it confirms the table name mismatch issue.

---

## Why This Happened

The original sample repository (ebrahimovej/amazon-api-gateway-url-shortener) had a hardcoded table name in the mapping template. When you deployed your stack, CloudFormation created a new table with a different generated name, but the API Gateway mapping template still references the old hardcoded name.

This is a common issue when forking AWS sample projects - the mapping templates need to be updated to match your actual resource names.

---

## Alternative: Use CloudFormation Parameter

For a more robust solution, you can update the API Gateway integration to use a CloudFormation parameter or reference, but that requires redeploying the entire stack with SAM/CloudFormation.

The manual update above is the quickest fix.
