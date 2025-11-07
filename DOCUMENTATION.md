# Fairways Contact Updates - Technical Documentation

Complete technical reference for the contact updates system.

## Table of Contents

1. [Field Mapping](#field-mapping)
2. [UPDATE Logic](#update-logic)
3. [Test Workflow](#test-workflow)

---

# Field Mapping

## What Was Updated

The `contactUpdates.js` file has been updated with comprehensive field mapping and record matching logic based on README.md requirements.

## 1. Complete Field Mapping

All fields from your mapping table have been added to `FIELD_MAPPING`:

### Form Fields → Master Sheet Fields

| Form Field (Contact Information - Responses) | Master Sheet Field (Shared-Fairways-Directory) |
|-----------------------------------------------|-----------------------------------------------|
| Timestamp | Timestamp |
| Unit Address | Address |
| Phone number | Home Phone |
| First Name | First Name |
| Last Name | Last Name |
| Business Phone | Business Phone |
| Business Addresses | Business Addresses |
| Manager | Unit Manager |
| Occupant Email Address | Email-1 |
| Occupancy First Date | Date Moved In |
| Mailing Address | Mailing Address |
| Other Phone Number | Cell Phone |
| Emergency Contact Name | Emergency Contact Name |
| Emergency Contact Phone | Emergency Contact Phone |
| Emergency Contact Email | Emergency Contact Email |
| Emergency Contact Relationship | Emergency Contact Relationship |
| Emergency Contact Address | Emergency Contact ST Address |
| Alternate Home Address | Alternate Home Address |
| Alternate Home Phone | Alternate Home Phone |
| Are you Working | Working? |
| Do you have a Alternate Home | Alternate Home? |
| Any other Contact Information | Other Contact Information |

## 2. Enhanced Record Matching Logic

New function: `locateRecordInMaster(formData)`

### Matching Priority (as per README.md):

1. **First Priority:** Match by `Email-1`
   - Case-insensitive comparison
   - Returns immediately if match found

2. **Second Priority:** Match by `First Name` + `Last Name`
   - Both fields must match
   - Case-insensitive comparison
   - Only checked if Email-1 match fails

3. **Result:** If no match found → NEW ENTRY

### Return Object Structure:

```javascript
{
  found: boolean,           // true if record found
  row: number,             // Row number in master sheet (1-based)
  matchedBy: string,       // "Email-1" or "First Name + Last Name"
  address: string,         // Existing Address from master sheet
  parcel: string,          // Existing Parcel ID from master sheet
  existingData: Object     // Full row data from master sheet
}
```

## 3. Enhanced Test Email Display

The test email now shows:

### For NEW Entries:
```
┌──────────────────────────────────────────┐
│ ✨ NEW ENTRY                             │
│ Record not found in master sheet.        │
│ This will ADD a new contact.             │
└──────────────────────────────────────────┘
```

### For EXISTING Entries:
```
┌──────────────────────────────────────────┐
│ 📝 EXISTING ENTRY                        │
│ Record found at row 42 in master sheet   │
│ Matched by: Email-1                      │
│ Existing Parcel: 123-456-789             │
│ Existing Address: 123 Main St           │
│ This will UPDATE the existing contact.   │
└──────────────────────────────────────────┘
```

## 4. Improved Logging

The test function now logs:

- Original test form data
- Mapped data (after field mapping)
- Record location result with full details
- Match method used
- Master sheet row number (if found)
- Parcel and Address information

## Usage

### Run Test Function:

```javascript
testRowEmail(2)  // Test row 2 from test sheet
```

### Expected Output in Logs:

```
Test Form Data from row 2:
{
  "Unit Address": "123 Main St",
  "Occupant Email Address": "john@example.com",
  "First Name": "John",
  "Last Name": "Doe",
  ...
}

Mapped Data for Master Sheet:
{
  "Address": "123 Main St",
  "Email-1": "john@example.com",
  "First Name": "John",
  "Last Name": "Doe",
  ...
}

Record Location Result:
{
  "found": true,
  "row": 42,
  "matchedBy": "Email-1",
  "address": "123 Main St",
  "parcel": "123-456-789"
}

Email sent! This would UPDATE an existing entry at row 42 (matched by Email-1)
```

## Important Notes

### Address Matching

The README mentions that Unit Address should map to a concatenation of `(ST # ST Name ST Type)`. Currently, the mapping assumes:

- **Form has:** `Unit Address` (single field)
- **Master has:** `Address` (concatenated field)

The test function will match these directly. If the form has separate fields for ST #, ST Name, and ST Type, the `FIELD_MAPPING` will need to be updated to handle concatenation.

### Parcel Considerations

As noted in README:
- Each Parcel may have multiple occupants/owners
- Each Parcel must have the same Address
- We identify proper person by Email-1 or First Name + Last Name

The current logic:
✅ Matches by Email-1 first
✅ Falls back to First Name + Last Name
✅ Returns Parcel and Address information
✅ Shows this information in test email

### Next Steps for Production Use

When ready to use in production (non-test mode):

1. The `addToMasterSheet()` function should be updated to use `locateRecordInMaster()` instead of simple email checking
2. UPDATE logic should modify the existing row rather than appending
3. NEW entry logic should determine appropriate Parcel value
4. Consider if Address should be validated against existing Parcel addresses

## Files Modified

- `contactUpdates.js` - Updated with full field mapping and enhanced matching logic
- Code has been pushed to Google Apps Script via `clasp push`

## Testing

1. Refresh your Apps Script editor
2. Run `testRowEmail(2)` with a row number from your test sheet
3. Check execution logs for detailed matching information
4. Check email for formatted approval request with NEW/EXISTING indicator
5. Verify all fields are properly mapped
# UPDATE Logic Implementation

## Overview

The system now intelligently **UPDATES existing records** or **ADDS new records** based on matching logic.

## How It Works

### 1. Form Submission Flow

```
Form Submitted
    ↓
onFormSubmit() triggered
    ↓
Send approval email to admin
    ↓
Mark as "Pending Approval"
```

### 2. Approval Flow (When Admin Clicks Approve)

```
Admin clicks APPROVE
    ↓
doGet() receives approval
    ↓
addToMasterSheet(formData)
    ↓
┌─────────────────────────────────────┐
│ 1. Map form fields to master fields │
│    (using FIELD_MAPPING)             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Locate existing record:          │
│    • Try Email-1 match first         │
│    • Then try First Name + Last Name │
└─────────────────────────────────────┘
    ↓
    ├─── FOUND? ────┐         NOT FOUND?
    ↓                ↓              ↓
UPDATE              ADD NEW
existing row        new row
```

## 3. UPDATE Logic Details

When a matching record is found:

### Field-by-Field Comparison

```javascript
For each field in the master sheet:
  1. Get new value from form data
  2. Get existing value from master sheet
  3. Compare (case-sensitive, trimmed)
  4. If different AND new value not empty:
     → Update the field
     → Log the change
```

### Example Log Output

```
Comparing values for update...
Updated Home Phone: "555-1234" -> "555-5678"
Updated Cell Phone: "" -> "555-9999"
Updated Date Moved In: "2020-01-01" -> "2023-05-15"
Successfully updated 3 fields in row 47
```

### What Gets Updated

✅ **Updates applied when:**
- New value is different from existing value
- New value is not empty

❌ **Updates NOT applied when:**
- New value matches existing value (no change)
- New value is empty (preserves existing data)

## 4. ADD Logic Details

When NO matching record is found:

1. Uses master sheet's existing column headers
2. Maps form data to those columns
3. Appends new row with all values
4. Logs "New row added to master sheet"

## Key Functions

### `addToMasterSheet(formData)`
**Main orchestrator function**
- Maps form data to master sheet fields
- Locates existing record
- Calls UPDATE or ADD function accordingly

### `updateMasterSheetRow(sheet, rowNumber, newData, existingData)`
**Updates existing record**
- Compares field by field
- Only updates changed fields
- Preserves existing data when form field is empty
- Returns array of changed fields

### `addNewMasterSheetRow(sheet, mappedData)`
**Adds new record**
- Appends new row to master sheet
- Uses master sheet's column order

### `locateRecordInMaster(formData)`
**Finds matching record**
- Priority 1: Email-1 match
- Priority 2: First Name + Last Name match
- Returns: row number, match method, existing data

## Field Mapping

All form fields are automatically mapped using `FIELD_MAPPING`:

| Form Field | Master Sheet Field |
|------------|-------------------|
| Occupant Email Address | Email-1 |
| Phone number | Home Phone |
| Unit Address | Address |
| First Name | First Name |
| Last Name | Last Name |
| ... | ... |

*See FIELD_MAPPING constant in contactUpdates.js for complete list*

## Testing the UPDATE Logic

### Test Function

```javascript
testRowEmail(2)  // Test with row 2 from test sheet
```

### What It Shows

The test email will indicate:

**For EXISTING records:**
```
┌──────────────────────────────────────────┐
│ 📝 EXISTING ENTRY                        │
│ Record found at row 47                   │
│ Matched by: First Name + Last Name       │
│ Existing Parcel: 123-456-789             │
│ This will UPDATE the existing contact.   │
└──────────────────────────────────────────┘
```

**For NEW records:**
```
┌──────────────────────────────────────────┐
│ ✨ NEW ENTRY                             │
│ Record not found in master sheet.        │
│ This will ADD a new contact.             │
└──────────────────────────────────────────┘
```

## Production Use

### When a form is submitted:

1. **Email sent to admin** with form data
2. **Admin clicks APPROVE** in email
3. **System automatically:**
   - Maps all fields
   - Locates matching record
   - Updates existing record OR adds new record
   - Logs all changes
   - Marks form response as "Approved"

### Logs to Check

After approval, check execution logs for:

```
Updating existing record at row 47
Comparing values for update...
Updated Home Phone: "555-1234" -> "555-5678"
Updated Cell Phone: "" -> "555-9999"
Successfully updated 2 fields in row 47
```

Or for new records:

```
Adding new record to master sheet
New row added to master sheet
```

## Important Notes

### Empty Values
- Empty form fields do NOT overwrite existing master sheet data
- This preserves information that wasn't included in the update

### Timestamp
- Timestamp is preserved from form submission
- Gets mapped automatically

### Matching Priority
1. **Email-1 is checked first** (most reliable)
2. **First Name + Last Name** is fallback (in case email changed)
3. **No match = New entry**

### Parcel and Address
- System shows existing Parcel in test email
- Address should match for same Parcel (per README requirements)
- Consider validating Address matches Parcel when updating

## Next Steps

To enable production approval workflow:

1. ✅ UPDATE logic implemented
2. ✅ Field mapping complete
3. ✅ Record matching working
4. ⚠️ Deploy as Web App (for approval buttons to work)
5. ⚠️ Set up form trigger (for automatic email on submission)

## Files Updated

- `contactUpdates.js` - Added UPDATE logic and helper functions
- Code pushed to Google Apps Script
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
