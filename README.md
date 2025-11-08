# Fairways Contact Updates

Google Apps Script system for managing contact information updates with an approval workflow. This system automatically processes form submissions, sends approval emails to administrators, and updates a master directory upon approval.

## Features

- 🔄 **Automatic Form Processing** - Monitors Google Form submissions
- 📧 **Email Notifications** - Sends approval requests to administrators
- ✅ **Approval Workflow** - One-click approve/reject from email
- 🔍 **Smart Matching** - Finds existing records by Email-1 or Name
- 📊 **Changes Table** - Shows exactly what will change before approval
- 🔄 **UPDATE or ADD** - Automatically updates existing records or adds new ones
- 🧪 **TEST MODE** - Safe testing without affecting production data
- 🗺️ **Field Mapping** - Maps 22+ fields between forms and master sheet

## System Architecture

```text
Google Form
    ↓
Contact Information (Responses) Sheet
    ↓
Apps Script Trigger
    ↓
Email to Administrators
    ↓
[APPROVE] or [REJECT]
    ↓
Master Directory Sheet
```

## Quick Start

### Prerequisites

- Google Account with access to:
  - Google Forms
  - Google Sheets
  - Google Apps Script
- Node.js and npm (for clasp CLI)
- `clasp` installed globally: `npm install -g @google/clasp`

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/jwilleke/fairways-contact-updates.git
   cd fairways-contact-updates
   ```

2. **Login to clasp:**

   ```bash
   clasp login
   ```

3. **Update configuration:**

   Edit `contactUpdates.js` and update the CONFIG section:

   ```javascript
   const CONFIG = {
     TEST_MODE: true,  // Start in test mode
     adminEmail: 'your-admin@email.com',
     masterSheetId: 'YOUR_MASTER_SHEET_ID',
     testMasterSheetId: 'YOUR_TEST_SHEET_ID',
     formResponsesSheetId: 'YOUR_FORM_RESPONSES_SHEET_ID'
   };
   ```

4. **Push to Google Apps Script:**

   ```bash
   clasp push
   ```

5. **Deploy as Web App:**
   - Open the script in Apps Script editor
   - Click Deploy → New deployment
   - Select "Web app" type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Click Deploy

6. **Set up Form Trigger:**
   - Run the `setupTrigger()` function once in Apps Script
   - This creates an automatic trigger for form submissions

## Configuration

### TEST_MODE Flag

Control whether updates go to test or production:

```javascript
const CONFIG = {
  TEST_MODE: true,  // true = test, false = production
  // ...
}
```

**TEST MODE (recommended for initial setup):**

- Updates go to test master sheet
- Email subject: `[TEST CONTACT UPDATE] ...`
- Safe to test freely

**PRODUCTION MODE:**

- Updates go to production master sheet
- Email subject: `[CONTACT UPDATE] ...`
- Live system

### Field Mapping

The system maps 22+ fields between the form and master sheet. Edit `FIELD_MAPPING` in `contactUpdates.js` to customize:

```javascript
const FIELD_MAPPING = {
  // Form Field -> Master Sheet Field
  'Occupant Email Address': 'Email-1',
  'Phone number': 'Home Phone',
  'Unit Address': 'Address',
  // ... 19 more fields
};
```

See [FIELD_MAPPING_UPDATE.md](FIELD_MAPPING_UPDATE.md) for complete mapping.

## Usage

### For Administrators

1. **Receive Email:**
   - Subject: `[TEST CONTACT UPDATE]` or `[CONTACT UPDATE]`
   - Contains form submission details
   - Shows changes table (for existing records)

2. **Review Request:**
   - Check submission details
   - Review changes (old value → new value)
   - Note if it's a NEW entry or UPDATE

3. **Take Action:**
   - Click **APPROVE** to accept changes
   - Click **REJECT** to decline

4. **Confirmation:**
   - See confirmation page
   - Master sheet is updated automatically (if approved)

### For Developers

#### Test a Specific Form Response

```javascript
testRowEmail(93)  // Test row 93 from form responses
```

This will:

- Read the form response
- Look up matching record
- Calculate changes
- Send test approval email
- Update test master sheet if approved

#### Check Logs

After approval, check execution logs:

```text
Using master sheet: TEST (ID: ...)
Record found by Email-1 at row 47
Calculated 3 changes
Successfully updated 3 fields in row 47
```

## Record Matching Logic

The system uses a comprehensive address-based matching process:

1. **Parse Address:** Extract ST #, ST Name, ST Type from form address
2. **Find Address Matches:** Locate all rows with matching address components
3. **Get Parcel:** Extract Parcel ID from matching addresses
4. **Within Parcel Group:**
   - **Primary Match:** Email-1 address (case-insensitive)
   - **Fallback Match:** First Name + Last Name (both must match)
5. **No Person Match:** Creates new entry with matched Parcel
6. **No Address Match:** Creates new entry without Parcel

This ensures multiple occupants at the same address (same Parcel) are handled correctly.

## Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[TEST_MODE.md](TEST_MODE.md)** - TEST_MODE configuration guide
- **[TESTING.md](TESTING.md)** - Testing procedures
- **[TEST_WORKFLOW_UPDATED.md](TEST_WORKFLOW_UPDATED.md)** - Complete test workflow
- **[FIELD_MAPPING_UPDATE.md](FIELD_MAPPING_UPDATE.md)** - Field mapping reference
- **[UPDATE_LOGIC.md](UPDATE_LOGIC.md)** - How UPDATE vs ADD works

## Project Structure

```text
fairways-contact-updates/
├── contactUpdates.js          # Main Apps Script code
├── appsscript.json           # Apps Script manifest
├── .clasp.json               # Clasp configuration
├── .claspignore              # Files to ignore when pushing
├── README.md                 # Original project README
├── SETUP.md                  # Setup instructions
├── TEST_MODE.md              # TEST_MODE documentation
├── TESTING.md                # Testing guide
├── FIELD_MAPPING_UPDATE.md   # Field mapping reference
├── UPDATE_LOGIC.md           # UPDATE logic explanation
└── TEST_WORKFLOW_UPDATED.md  # Test workflow details
```

## Key Functions

### Production Functions

- `onFormSubmit(e)` - Triggered when form is submitted
- `sendApprovalEmail(formData, rowNumber, sheetId)` - Sends approval request
- `doGet(e)` - Handles approve/reject clicks from email
- `addToMasterSheet(formData)` - Updates or adds to master sheet
- `locateRecordInMaster(formData)` - Finds matching records
- `updateMasterSheetRow(sheet, row, newData, existingData)` - Updates existing record

### Testing Functions

- `testRowEmail(rowNumber)` - Test a specific form response row
- `locateRecordInTestMaster(formData)` - Finds records in test sheet
- `calculateChanges(newData, existingData)` - Calculates field changes
- `sendTestApprovalEmail(formData, rowNumber, sheetId)` - Sends test email

### Utility Functions

- `getMasterSheetId()` - Returns correct sheet ID based on TEST_MODE
- `mapFieldsToMaster(formData)` - Maps form fields to master fields
- `setupTrigger()` - Creates form submission trigger

## Email Format

### Subject Lines

- **Test Mode:** `[TEST CONTACT UPDATE] New Request - Action Required`
- **Production:** `[CONTACT UPDATE] New Request - Action Required`

### Email Contents

- 🧪 TEST MODE banner (if applicable)
- 📝 NEW ENTRY or EXISTING ENTRY indicator
- 📋 Changes table (for updates)
- 📄 All form data
- ✅ APPROVE button
- ❌ REJECT button

## Workflow Examples

### Example 1: Update Existing Record

```text
Form submitted with updated phone number
    ↓
Email sent: [TEST CONTACT UPDATE] ...
Shows: "EXISTING ENTRY - Row 47 - Matched by Email-1"
Changes: Home Phone: "555-1234" → "555-5678"
    ↓
Admin clicks APPROVE
    ↓
Row 47 in test master sheet updated
Only changed fields are modified
```

### Example 2: New Entry

```text
Form submitted with new contact
    ↓
Email sent: [TEST CONTACT UPDATE] ...
Shows: "NEW ENTRY - Record not found"
All form fields listed
    ↓
Admin clicks APPROVE
    ↓
New row added to test master sheet
```

## Security & Permissions

### Required OAuth Scopes

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.container.ui",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/script.send_mail"
  ]
}
```

### Web App Permissions

- **Execute as:** Me (the script owner)
- **Who has access:** Anyone (for email approval links to work)

## Troubleshooting

### Email not sending

- Check OAuth scopes are authorized
- Verify `adminEmail` in CONFIG
- Check execution logs for errors

### Approval links not working

- Ensure web app is deployed
- Check "Who has access" is set to "Anyone"
- Verify script URL in email is correct
- Check `executeAs` is set to "USER_DEPLOYING" in appsscript.json

### Wrong sheet being updated

- Check `TEST_MODE` flag
- Verify sheet IDs in CONFIG
- Check execution logs for "Using master sheet: ..."

### Field not mapping correctly

- Check `FIELD_MAPPING` constant
- Verify exact column names in both sheets
- Look for typos or extra spaces

### Updates adding new rows instead of updating

**Symptoms:** Every approval creates a new row instead of updating existing record

**Causes:**

1. `locateRecordInMaster()` throwing an error (check logs for "Error locating record:")
2. Address parsing happening after record lookup
3. Missing column index definitions

**Solutions:**

- Check logs for errors during record lookup
- Ensure latest code is deployed (version 2025-11-08 07:10:00 or later)
- Verify Address field is being parsed before `locateRecordInMaster()` is called
- Delete duplicate rows created during testing

### Address showing as changed when it's the same

**Symptoms:** Email shows Address as changed from "1 FAIRWAY DR, Mount Vernon, OH 43050" to "1 FAIRWAY DR"

**Cause:** Address field in master sheet contains formula result with full address, form has just street address

**Solution:** Code normalizes addresses by stripping city/state/zip for comparison (fixed in v1.2.0)

### Unit Manager showing as changed

**Symptoms:** Email shows Unit Manager changed from "SELF" to "Self"

**Cause:** Form has mixed case, master sheet has uppercase

**Solution:** Code now uppercases Unit Manager before comparison (fixed in v1.2.0)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is provided as-is for use by Fairways Condos.

## Support

For issues or questions:

- Check the documentation files
- Review execution logs in Apps Script
- Create an issue on GitHub

## Version History

### v1.2.0 - 2025-11-08 (Current)

**Critical Fixes:**

- Fixed `addressColIndex undefined` error that caused all updates to add new rows
- Fixed record matching to parse address BEFORE lookup (was failing silently)
- Fixed Address field comparison to normalize "1 FAIRWAY DR" vs "1 FAIRWAY DR, Mount Vernon, OH 43050"
- Fixed Unit Manager case sensitivity ("Self" vs "SELF")
- Address formulas now preserved during updates (not overwritten)

**Enhancements:**

- Address-based matching using ST #, ST Name, ST Type components
- Parcel-aware record lookup for multi-occupant addresses
- Preprocessing of all data (address parsing, uppercase, defaults) before record lookup
- Default values: Email Type-1="Home", Newsletter="Email", Status="Sold", Entry Type="Occupant"
- Address formula generation with VLOOKUP and Google Maps hyperlink
- Map and Knox County Link formula generation
- Enhanced debug logging for troubleshooting

### v1.0.0 - Initial Release

- Form submission monitoring
- Email approval workflow
- Smart record matching
- UPDATE/ADD logic
- Field mapping (22 fields)
- TEST_MODE flag
- Changes table
- Comprehensive documentation
