# Configuration History - What Changed and Why

## Timeline of Changes

### ✅ ORIGINAL CONFIGURATION (Working)
**Status:** Was working correctly  
**Owner Strategy:** Per-user links  
**How it worked:**
- User `r@wecare.digital` signs in
- Sees their 25 links with `owner: "r@wecare.digital"`
- Each user sees only their own links
- Frontend: Used `getOwnerEmail()` to extract email from JWT
- Backend: Queried by `$context.authorizer.claims.email`

**This was CORRECT and WORKING!**

---

### ❌ CHANGE 1: Shared Links Attempt (Failed)
**When:** User query #15 - "can we many any owner with domain wecare.digital"  
**What I changed:**
- Tried to implement shared organizational links
- Changed owner to hardcoded `"links@wecare.digital"`
- Goal: All users with @wecare.digital domain see same links

**Why it failed:**
1. User `links@wecare.digital` doesn't exist in Cognito
2. Existing data has `owner: "r@wecare.digital"` (not "links@wecare.digital")
3. API queried for non-existent owner → returned 0 items
4. Dashboard showed empty (network errors)

**Result:** BROKE the working system

---

### ✅ CHANGE 2: Reverted to Per-User (Current)
**When:** User query #17 - "yes" (confirmed to revert)  
**What I changed:**
- Reverted back to original per-user configuration
- Owner: `$context.authorizer.claims.email` (from JWT token)
- Each user sees only their own links

**Current State:**
- Frontend: Uses `getOwnerEmail()` ✅ CORRECT
- GET request: Uses `$context.authorizer.claims.email` ✅ CORRECT
- GET response: Includes folder and remark ✅ CORRECT
- POST request: Just fixed to use correct template ✅ CORRECT

---

## Current Configuration (What You Have Now)

### Owner Strategy: PER-USER LINKS (Same as Original)

**How it works:**
```
User r@wecare.digital signs in
  ↓
JWT token contains: email = "r@wecare.digital"
  ↓
GET /app queries DynamoDB: owner = "r@wecare.digital"
  ↓
Returns 25 links with owner = "r@wecare.digital"
  ↓
Dashboard displays those 25 links
```

```
User vibe@wecare.digital signs in
  ↓
JWT token contains: email = "vibe@wecare.digital"
  ↓
GET /app queries DynamoDB: owner = "vibe@wecare.digital"
  ↓
Returns 0 links (this user has no links yet)
  ↓
Dashboard displays empty (CORRECT - they have no links)
```

**Each user has isolated data - they cannot see each other's links.**

---

## What Needs to Be Changed in API Gateway

### Current Problem:
The POST request template in API Gateway Console is still using the OLD broken template that modifies the ID.

### Solution:
Update POST /app Integration Request template to the correct one.

---

## Option 1: Keep Per-User Links (RECOMMENDED)

**This is what you had originally. It was working.**

### What to do:
1. Update POST /app Integration Request in API Gateway Console
2. Use this template:

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

3. Deploy API to Prod
4. Test: Sign in as r@wecare.digital → See 25 links ✅

**Behavior:**
- ✅ r@wecare.digital sees their 25 links
- ✅ vibe@wecare.digital sees only their own links (0 currently)
- ✅ Each user has private links
- ✅ Data is isolated per user

**No frontend changes needed - Dashboard.vue is already correct!**

---

## Option 2: Shared Links for @wecare.digital Domain

**If you want ALL users with @wecare.digital email to see the SAME links.**

### What needs to change:

#### 1. Update Existing Data in DynamoDB
All 25 existing links need owner changed from `"r@wecare.digital"` to `"links@wecare.digital"`:

```bash
# For each of the 25 links, run:
aws dynamodb update-item \
  --table-name r-wecare-digital-LinkTable-YPF44B2N1ONI \
  --key '{"id": {"S": "google"}}' \
  --update-expression "SET #o = :o" \
  --expression-attribute-names '{"#o": "owner"}' \
  --expression-attribute-values '{":o": {"S": "links@wecare.digital"}}'
```

#### 2. Update Frontend (Dashboard.vue)
Change `getOwnerEmail()` function:

```javascript
// OLD (per-user):
function getOwnerEmail() {
  const token = window.localStorage.getItem("cognitoIdentityToken");
  if (!token || token === 'null') return null;
  
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.email || null;  // Returns "r@wecare.digital"
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}

// NEW (shared):
function getOwnerEmail() {
  const token = window.localStorage.getItem("cognitoIdentityToken");
  if (!token || token === 'null') return null;
  
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const email = decoded.email || null;
    
    // If user has @wecare.digital domain, use shared owner
    if (email && email.endsWith('@wecare.digital')) {
      return 'links@wecare.digital';
    }
    
    return email;  // Other domains use their own email
  } catch (err) {
    console.error('Error decoding token:', err);
    return null;
  }
}
```

#### 3. Update GET /app Integration Request
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

#### 4. Update POST /app Integration Request
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
      "S": "links@wecare.digital"
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

#### 5. Deploy frontend and API

**Behavior:**
- ✅ r@wecare.digital sees all 25 shared links
- ✅ vibe@wecare.digital sees the SAME 25 shared links
- ✅ Any user with @wecare.digital domain sees shared links
- ✅ Users can create/edit/delete shared links
- ⚠️ All @wecare.digital users share the same link pool

---

## Comparison Table

| Feature | Option 1: Per-User | Option 2: Shared |
|---------|-------------------|------------------|
| **Data Isolation** | ✅ Each user has private links | ❌ All @wecare.digital users share links |
| **Current State** | ✅ Already configured (just need POST fix) | ❌ Needs multiple changes |
| **Existing Data** | ✅ Works with current data | ❌ Need to update all 25 links |
| **Frontend Changes** | ✅ None needed | ❌ Need to modify Dashboard.vue |
| **API Changes** | ⚠️ Only POST template | ❌ GET and POST templates |
| **Complexity** | ✅ Simple (1 change) | ❌ Complex (5 changes) |
| **Risk** | ✅ Low | ⚠️ Medium (data migration) |

---

## My Recommendation

**Use Option 1: Per-User Links**

**Reasons:**
1. ✅ This is what you had originally - it was working
2. ✅ Only 1 change needed (POST template in API Gateway)
3. ✅ No data migration required
4. ✅ No frontend changes required
5. ✅ Lower risk
6. ✅ Better security (data isolation)
7. ✅ Easier to maintain

**The only reason it's not working now is because the POST template in API Gateway Console has the wrong code.**

---

## What I Did Wrong

I apologize for the confusion. Here's what happened:

1. ✅ **Original system was working** with per-user links
2. ❌ **I tried to implement shared links** when you asked "can we many any owner with domain wecare.digital"
3. ❌ **That broke the system** because I hardcoded "links@wecare.digital" without updating the data
4. ✅ **I reverted back to per-user** when you said "yes"
5. ⚠️ **But the POST template still needs to be fixed** in API Gateway Console

---

## Next Steps (Choose One)

### If you want Per-User Links (RECOMMENDED):
1. Go to API Gateway Console
2. Update POST /app Integration Request with Option 1 template
3. Deploy to Prod
4. Test - should work immediately ✅

### If you want Shared Links:
1. Update all 25 links in DynamoDB (change owner to "links@wecare.digital")
2. Update Dashboard.vue with new getOwnerEmail() function
3. Update GET /app Integration Request in API Gateway
4. Update POST /app Integration Request in API Gateway
5. Deploy frontend (npm run build, upload to S3)
6. Deploy API to Prod
7. Test with multiple users

---

## Summary

**Current Status:**
- Frontend: ✅ Correct (per-user)
- GET request: ✅ Correct (per-user)
- GET response: ✅ Correct (includes folder/remark)
- POST request: ❌ WRONG (needs fix)

**What broke:**
- I tried to implement shared links, which broke the working system
- Then reverted to per-user, but POST template still has old code

**What you need to do:**
- Update POST /app Integration Request template in API Gateway Console
- Use the template from Option 1 (per-user) or Option 2 (shared)
- Deploy API

**My recommendation:** Option 1 (per-user) - it's what you had, it was working, and it only needs 1 change.
