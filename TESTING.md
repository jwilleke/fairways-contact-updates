# Testing Guide for Contact Updates System

## Test Function Overview

A new test function `testRowEmail(rowNumber)` has been added to help you test the approval email workflow without modifying the master directory.

## How to Use

### 1. In Apps Script Editor

1. Refresh your Apps Script editor to see the updated code
2. Open the **contactUpdates.gs** file
3. Select the function: `testRowEmail`
4. Click the "Run" button

### 2. Running the Test

To test a specific row from your test sheet:

```javascript
// In Apps Script Editor, run this function with a row number
testRowEmail(2)  // Tests row 2 from the test sheet
testRowEmail(3)  // Tests row 3 from the test sheet
```

**Note:** Row 1 is the header, so start testing from row 2 onwards.

## What the Test Does

1. **Reads data** from the specified row in your test sheet:
   - Test Sheet ID: `1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8`

2. **Maps fields** from test sheet to master sheet format using `FIELD_MAPPING`:
   ```
   Test Sheet Field    →  Master Sheet Field
   ─────────────────────────────────────────
   First Name          →  First Name
   Last Name           →  Last Name
   Unit Number         →  Address
   Email Address       →  Email
   Phone Number        →  Phone
   Cell Phone          →  Cell
   Request Type        →  Request Type
   Details             →  Details
   ```

3. **Checks if email exists** in the master directory:
   - Searches the master sheet for a matching email address
   - Case-insensitive matching

4. **Sends a test approval email** with:
   - **TEST MODE banner** - clearly indicates no changes will be made
   - **NEW ENTRY or EXISTING ENTRY** indicator:
     - **NEW ENTRY** = Email not found in master sheet (green banner)
     - **EXISTING ENTRY** = Email found in master sheet (blue banner)
   - All mapped form data
   - Approve and Reject buttons (marked as TEST)

5. **Does NOT update** the master directory (DONOTUSE-Shared-Fairways-Directory)

## Email Features

The test email will show:

### For NEW Entries (email doesn't exist):
```
┌──────────────────────────────────────────┐
│ TEST MODE - NO CHANGES WILL BE MADE      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ NEW ENTRY                                │
│ Email does not exist in master sheet.    │
│ This will ADD a new contact.             │
└──────────────────────────────────────────┘
```

### For EXISTING Entries (email found):
```
┌──────────────────────────────────────────┐
│ TEST MODE - NO CHANGES WILL BE MADE      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ EXISTING ENTRY                           │
│ Email found in master sheet.             │
│ This will UPDATE an existing contact.    │
└──────────────────────────────────────────┘
```

## Configuration

### Update Field Mapping

If your test sheet has different column names, update the `FIELD_MAPPING` constant in **contactUpdates.gs**:

```javascript
const FIELD_MAPPING = {
  // Test Sheet Field -> Master Sheet Field
  'Your Column Name': 'Master Sheet Column Name',
  // Add more mappings as needed
};
```

### Update Test Email

By default, test emails go to `fairwayscondos-administrator@googlegroups.com`. To change this, update `TEST_CONFIG`:

```javascript
const TEST_CONFIG = {
  testSheetId: '1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8',
  testEmail: 'your-email@example.com'  // Change this
};
```

## Checking Results

After running `testRowEmail()`:

1. **Check the Execution Log** in Apps Script:
   - View → Logs
   - Shows the original test data and mapped data
   - Shows whether email exists in master sheet

2. **Check your email**:
   - Subject: `[TEST MODE] New Contact Update Request - Action Required`
   - Will clearly indicate if it's a NEW or EXISTING entry

3. **Return value**:
   - `"Email sent! This would UPDATE an existing entry."`
   - `"Email sent! This would ADD A NEW entry."`

## Important Notes

- ✅ **Safe to run** - Will NOT modify the master directory
- ✅ Test emails clearly marked as `[TEST MODE]`
- ✅ Approve/Reject buttons are labeled `(TEST)`
- ⚠️ Make sure the `FIELD_MAPPING` matches your actual column names
- ⚠️ Email checking is case-insensitive
- ⚠️ Requires permissions to access both test sheet and master sheet

## Example Workflow

1. Add test data to row 2 of your test sheet
2. Run `testRowEmail(2)` in Apps Script
3. Check logs to see data mapping
4. Check email to see formatted approval request
5. Note whether it shows NEW or EXISTING entry
6. Adjust field mappings if needed
7. Test additional rows as needed

## Next Steps

Once testing is complete and field mappings are correct:
1. Set up the actual form trigger
2. Configure the production approval workflow
3. Test with a real form submission
