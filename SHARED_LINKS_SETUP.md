# Shared Links Setup - Organization-Wide Access

## Overview

This configuration makes all links owned by a single organizational account (`links@wecare.digital`) instead of individual users. This means:

✅ **All authenticated users can see ALL links**
✅ **Any user can create, edit, or delete any link**
✅ **Centralized link management for the organization**
✅ **Simpler access control**

---

## Changes Made

### 1. Frontend (Dashboard.vue)
Changed the `getOwnerEmail()` function to return a fixed organizational email:

```javascript
function getOwnerEmail() {
  return "links@wecare.digital";
}
```

### 2. Backend (API Gateway Integration Request)
Need to update the DynamoDB Query to look for the organizational owner instead of the logged-in user's email.

---

## API Gateway Update Required

You need to update the **Integration Request** mapping template:

### Step 1: Go to API Gateway Console
https://console.aws.amazon.com/apigateway

### Step 2: Navigate to GET /app
- Select your API (ID: xbj96ig388)
- Click **Resources**
- Click **GET** under `/app`
- Click **Integration Request**

### Step 3: Update the Mapping Template
- Scroll to **Mapping Templates**
- Click on **application/json**
- Replace the current template with:

```json
{
  "TableName": "r-wecare-digital-LinkTable-YPF44B2N1ONI",
  "IndexName": "OwnerIndex",
  "KeyConditionExpression": "#n_owner = :v_owner",
  "ExpressionAttributeValues": {
    ":v_owner": {
      "S": "links@wecare.digital"
    }
  },
  "ExpressionAttributeNames": {
    "#n_owner": "owner"
  }
}
```

**Key Change:** Changed from:
```json
":v_owner": { "S": "$context.authorizer.claims.email" }
```

To:
```json
":v_owner": { "S": "links@wecare.digital" }
```

### Step 4: Save and Deploy
- Click **Save** (checkmark icon)
- Click **Actions** → **Deploy API**
- Select **Prod** stage
- Click **Deploy**

---

## Migrating Existing Links

If you have existing links with different owners (like `r@wecare.digital`, `vibe@wecare.digital`), you need to update them in DynamoDB:

### Option 1: AWS Console (Manual)

1. Go to DynamoDB Console: https://console.aws.amazon.com/dynamodbv2
2. Select table: `r-wecare-digital-LinkTable-YPF44B2N1ONI`
3. Click **Explore table items**
4. For each item, click **Edit**
5. Change `owner` to `links@wecare.digital`
6. Click **Save changes**

### Option 2: AWS CLI (Bulk Update)

```bash
# List all items with old owner
aws dynamodb query \
  --table-name r-wecare-digital-LinkTable-YPF44B2N1ONI \
  --index-name OwnerIndex \
  --key-condition-expression "#owner = :owner" \
  --expression-attribute-names '{"#owner":"owner"}' \
  --expression-attribute-values '{":owner":{"S":"r@wecare.digital"}}' \
  --region ap-south-1

# Update each item (repeat for each link ID)
aws dynamodb update-item \
  --table-name r-wecare-digital-LinkTable-YPF44B2N1ONI \
  --key '{"id":{"S":"YOUR-LINK-ID"}}' \
  --update-expression "SET #owner = :newowner" \
  --expression-attribute-names '{"#owner":"owner"}' \
  --expression-attribute-values '{":newowner":{"S":"links@wecare.digital"}}' \
  --region ap-south-1
```

### Option 3: Python Script (Automated)

```python
import boto3

dynamodb = boto3.client('dynamodb', region_name='ap-south-1')
table_name = 'r-wecare-digital-LinkTable-YPF44B2N1ONI'

# Query all items with old owner
old_owners = ['r@wecare.digital', 'vibe@wecare.digital']

for old_owner in old_owners:
    response = dynamodb.query(
        TableName=table_name,
        IndexName='OwnerIndex',
        KeyConditionExpression='#owner = :owner',
        ExpressionAttributeNames={'#owner': 'owner'},
        ExpressionAttributeValues={':owner': {'S': old_owner}}
    )
    
    # Update each item
    for item in response['Items']:
        link_id = item['id']['S']
        dynamodb.update_item(
            TableName=table_name,
            Key={'id': {'S': link_id}},
            UpdateExpression='SET #owner = :newowner',
            ExpressionAttributeNames={'#owner': 'owner'},
            ExpressionAttributeValues={':newowner': {'S': 'links@wecare.digital'}}
        )
        print(f"Updated {link_id}")

print("Migration complete!")
```

---

## Testing

After updating API Gateway and migrating data:

1. Sign in as any user (e.g., `r@wecare.digital`, `vibe@wecare.digital`, etc.)
2. You should see ALL links in the organization
3. Create a new link - it will be owned by `links@wecare.digital`
4. All other users will see this link immediately

---

## Switching Back to Per-User Links

If you want to revert to per-user links later:

### 1. Update Dashboard.vue

Uncomment the per-user code in `getOwnerEmail()`:

```javascript
function getOwnerEmail() {
  // Option 2: Use the logged-in user's email
  const token = window.localStorage.getItem("cognitoIdentityToken");
  if (!token || token === 'null') return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.email || null;
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}
```

### 2. Update API Gateway Integration Request

Change back to:
```json
":v_owner": { "S": "$context.authorizer.claims.email" }
```

### 3. Deploy

Commit, push, and deploy the API Gateway changes.

---

## Security Considerations

### Current Setup (Shared Links)
- ✅ All authenticated users can manage all links
- ⚠️ No per-user isolation
- ⚠️ Any user can delete any link
- ✅ Good for small teams with trust

### Per-User Setup
- ✅ Users only see their own links
- ✅ Better data isolation
- ✅ Audit trail per user
- ⚠️ More complex for shared links

Choose based on your organization's needs!

---

## Recommended Owner Emails

Good choices for organizational owner:
- `links@wecare.digital` ✅ (current)
- `admin@wecare.digital`
- `shortener@wecare.digital`
- `team@wecare.digital`

Avoid:
- Personal emails (e.g., `john@wecare.digital`)
- Generic emails (e.g., `info@wecare.digital`)
