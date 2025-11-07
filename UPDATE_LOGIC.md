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
