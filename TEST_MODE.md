# TEST MODE Configuration

## Overview

A simple `TEST_MODE` flag has been added to safely test the system without affecting production data.

## Configuration

At the top of `contactUpdates.js`:

```javascript
const CONFIG = {
  // ===== MODE SETTING =====
  // Set to true for TESTING (uses test master sheet)
  // Set to false for PRODUCTION (uses real master sheet)
  TEST_MODE: true,  // <-- Change this to switch modes

  // ... other settings
}
```

## How It Works

### When `TEST_MODE: true` (Current Setting)

**All updates go to TEST master sheet:**
- Sheet: DONOTUSE-Shared-Fairways-Directory
- ID: `1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8`

**Email indicators:**
- Subject: `[TEST CONTACT UPDATE] New Request - Action Required`
- Body includes: 🧪 TEST MODE banner
- HTML shows: Yellow warning banner

**What gets tested:**
- Real form submissions from Contact Information (Responses)
- Field mapping
- Record matching logic
- UPDATE vs ADD decisions
- Approval workflow
- Email notifications

**What's safe:**
- Production master sheet is NEVER touched
- Real data is NEVER modified
- You can test freely

### When `TEST_MODE: false` (Production)

**All updates go to PRODUCTION master sheet:**
- Sheet: Shared-Fairways-Directory
- ID: `1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc`

**Email indicators:**
- Subject: `[CONTACT UPDATE] New Request - Action Required`
- No TEST MODE banners

**What happens:**
- Real form submissions update real directory
- Live production system

## Switching Modes

### To Enable TEST MODE (Safe Testing):

1. Open `contactUpdates.js` in Apps Script
2. Find line 11: `TEST_MODE: true,`
3. Make sure it says `true`
4. Save (Ctrl/Cmd + S)

### To Enable PRODUCTION MODE:

1. Open `contactUpdates.js` in Apps Script
2. Find line 11: `TEST_MODE: true,`
3. Change to: `TEST_MODE: false,`
4. Save (Ctrl/Cmd + S)

⚠️ **IMPORTANT:** After changing modes, the next form submission or approval will use the new setting immediately.

## Email Subjects

### TEST MODE:
```
Subject: [TEST CONTACT UPDATE] New Request - Action Required
```

### PRODUCTION MODE:
```
Subject: [CONTACT UPDATE] New Request - Action Required
```

This makes it easy to identify test vs production emails at a glance!

## Testing Workflow

### 1. With testRowEmail():
```javascript
// Already configured to use TEST master
testRowEmail(93)
```
- Always uses TEST master sheet
- Independent of TEST_MODE flag
- Safe for any testing

### 2. With Real Form Submissions:

**While TEST_MODE = true:**
```
Form Submitted
    ↓
Email: [TEST CONTACT UPDATE] ...
    ↓
Approve
    ↓
Updates TEST master sheet ✅
```

**While TEST_MODE = false:**
```
Form Submitted
    ↓
Email: [CONTACT UPDATE] ...
    ↓
Approve
    ↓
Updates PRODUCTION master sheet ⚠️
```

## Verification

### Check Current Mode:

Look at the logs after approval:
```
Using master sheet: TEST (ID: 1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8)
```
or
```
Using master sheet: PRODUCTION (ID: 1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc)
```

### Check Email Subject:

- `[TEST CONTACT UPDATE]` = TEST MODE active ✅
- `[CONTACT UPDATE]` = PRODUCTION MODE active ⚠️

## Recommended Testing Process

1. **Keep TEST_MODE = true** for initial testing
2. **Submit test forms** and verify:
   - Emails arrive with [TEST CONTACT UPDATE] subject
   - Approvals update TEST master sheet
   - Field mapping is correct
   - Matching logic works
   - Changes table shows correctly
3. **Verify TEST master sheet** has correct updates
4. **When confident**, switch to `TEST_MODE: false`
5. **Test once more** with a safe form submission
6. **Go live!**

## Safety Features

✅ **Clear indicators** - Email subjects and banners show current mode
✅ **Single toggle** - Just change one line to switch modes
✅ **No code changes** - Same code works for both modes
✅ **Logs show mode** - Execution logs indicate which sheet is being used
✅ **Separate sheets** - Test and production data stay completely separate

## Current Status

```
✅ TEST_MODE: true
✅ All approvals go to TEST master sheet
✅ Production data is safe
✅ Ready for testing!
```

## Files Modified

- `contactUpdates.js` - Added TEST_MODE flag and getMasterSheetId() helper
- All functions now respect TEST_MODE setting
- Email subjects updated with [TEST CONTACT UPDATE] and [CONTACT UPDATE]
