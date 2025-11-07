# Updated Test Workflow

## What Changed

The `testRowEmail()` function has been completely updated to match your requirements.

## New Workflow

```
testRowEmail(93)
    ↓
1. Read row 93 from REAL form responses sheet
   (Contact Information - Responses)
   Sheet ID: 1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM
    ↓
2. Map fields using FIELD_MAPPING
   (Occupant Email Address → Email-1, etc.)
    ↓
3. Look up in TEST master sheet
   (DONOTUSE-Shared-Fairways-Directory)
   Sheet ID: 1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8
    ↓
4. Calculate CHANGES (field-by-field comparison)
    ↓
5. Send email with CHANGES TABLE
    ↓
6. If approved: Update TEST master sheet
   (not the real Shared-Fairways-Directory)
```

## Email Features

### 🧪 TEST MODE Banner
Shows:
- Form Response Row number (e.g., Row 93)
- Source: Contact Information (Responses)
- Target: TEST master sheet (DONOTUSE-Shared-Fairways-Directory)

### 📝 Match Information
For existing records:
- Row number in test master sheet
- How it matched (Email-1 or First Name + Last Name)
- Existing Parcel ID
- Existing Address

For new records:
- "NEW ENTRY" indicator
- Will ADD a new contact

### 📋 Changes Table

**Visual comparison showing:**

| Field | Old Value | New Value |
|-------|-----------|-----------|
| Home Phone | 555-1234 | 555-5678 |
| Cell Phone | (empty) | 555-9999 |
| Date Moved In | 2020-01-01 | 2023-05-15 |

**Colors:**
- Old values: Red background
- New values: Green background

**If no changes detected:**
- Shows "NO CHANGES DETECTED" message
- Indicates all values match existing data

## Usage

### In Apps Script Editor:

```javascript
testRowEmail(93)  // Test row 93 from Contact Information (Responses)
```

### What It Returns:

**For existing record with changes:**
```
Email sent! Form row 93 would UPDATE test master row 47 (matched by Email-1) with 3 changes
```

**For existing record with no changes:**
```
Email sent! Form row 93 would UPDATE test master row 47 (matched by First Name + Last Name) with 0 changes
```

**For new record:**
```
Email sent! Form row 93 would ADD A NEW entry to test master.
```

## Example Email Content

### Email Subject:
```
[TEST MODE] New Contact Update Request - Action Required
```

### Email Body (Text):
```
=== TEST MODE - UPDATES WILL BE MADE TO TEST MASTER SHEET ===

Form Response Row: 93 (Contact Information - Responses)

*** EXISTING ENTRY ***
*** Record found at row 47 in master sheet ***
*** Matched by: Email-1 ***
*** Existing Parcel: 123-456-789 ***
*** Existing Address: 16 EAGLE DR ***
*** This will UPDATE the existing contact ***

A contact update request has been submitted.

=== CHANGES TO BE MADE (3 fields) ===

Home Phone:
  OLD: 555-1234
  NEW: 740-485-5458

Cell Phone:
  OLD: (empty)
  NEW: 614-555-0123

Date Moved In:
  OLD: 2020-01-01
  NEW: 2023-10-30

=== ALL FORM DATA ===

Timestamp: 10/30/2025 23:16:02
Occupant Email Address: kdweis1@hotmail.com
Unit Address: 16 EAGLE DR
Phone number: 740-485-5458
First Name: Kevin
Last Name: Weis
...

=== ACTIONS ===

[APPROVE Button]  [REJECT Button]
```

### Email Body (HTML):
- Colored banners for TEST MODE, NEW/EXISTING entry
- Visual changes table with red/green highlighting
- Clean formatted tables for all data
- Styled approve/reject buttons

## Execution Log Example

```
Form Response Data from row 93:
{
  "Timestamp": "10/30/2025 23:16:02",
  "Occupant Email Address": "kdweis1@hotmail.com",
  "Unit Address": "16 EAGLE DR",
  "Phone number": "740-485-5458",
  ...
}

Mapped Data for Master Sheet:
{
  "Timestamp": "10/30/2025 23:16:02",
  "Email-1": "kdweis1@hotmail.com",
  "Address": "16 EAGLE DR",
  "Home Phone": "740-485-5458",
  ...
}

Column indices - Email-1: 5, First Name: 1, Last Name: 2
Record found by Email-1 at row 47 in TEST master

Calculated 3 changes

Email sent! Form row 93 would UPDATE test master row 47 (matched by Email-1) with 3 changes
```

## Key Benefits

1. **Uses Real Form Data** - Reads from actual Contact Information (Responses) sheet
2. **Tests Safely** - Updates TEST master sheet, not production
3. **Shows Changes** - Visual comparison of old vs new values
4. **Full Traceability** - Shows form row, master row, match method
5. **Validates Mapping** - Confirms field mapping is correct before production

## Configuration

### To Test:

1. Find a row number from "Contact Information (Responses)" sheet
2. Run `testRowEmail(rowNumber)` in Apps Script
3. Check email for changes table
4. If approved, changes go to TEST master sheet

### Sheet IDs:

```javascript
// Real form responses (source)
CONFIG.formResponsesSheetId = '1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM'

// Test master (destination for testing)
TEST_CONFIG.testMasterSheetId = '1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8'

// Real master (not touched during testing)
CONFIG.masterSheetId = '1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc'
```

## Next Steps

1. **Test with Row 93:**
   ```javascript
   testRowEmail(93)
   ```

2. **Check the email** - Look for:
   - Correct form response data
   - Matching record found
   - Changes table with old vs new values

3. **Verify field mapping** - Ensure all fields are mapped correctly

4. **Test multiple scenarios:**
   - Existing record with changes
   - Existing record with no changes
   - New record (not found in test master)

5. **When ready** - Switch to production by deploying web app
