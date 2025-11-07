# Field Mapping Update Summary

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
