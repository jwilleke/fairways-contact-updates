# Changelog

All notable changes to the Fairways Contact Updates system.

## [1.2.0] - 2025-11-08

### Critical Fixes

#### Fixed: addressColIndex undefined error
- **Issue:** `locateRecordInMaster()` was crashing with "ReferenceError: addressColIndex is not defined"
- **Impact:** ALL approvals were adding new rows instead of updating existing records
- **Fix:** Added `const addressColIndex = headers.indexOf('Address');` at contactUpdates.js:1126
- **Location:** `locateRecordInMaster()` function

#### Fixed: Record matching failure
- **Issue:** Address parsing was happening AFTER record lookup, causing all lookups to fail
- **Impact:** System couldn't find existing records, always created duplicates
- **Fix:** Moved address parsing, Unit Manager uppercase, and default values to `addToMasterSheet()` BEFORE calling `locateRecordInMaster()`
- **Location:** contactUpdates.js:297-334

#### Fixed: Test email preprocessing missing
- **Issue:** Test function didn't preprocess data before calculating changes
- **Impact:** False positives in change detection (e.g., "Self" vs "SELF")
- **Fix:** Added same preprocessing logic to `testRowEmail()` function
- **Location:** contactUpdates.js:754-787

### Enhancements

#### Address Field Normalization
- **What:** Normalize address comparison to handle formula results vs plain text
- **How:** Strip city/state/zip from existing addresses for comparison
- **Where:** `calculateChanges()` at contactUpdates.js:1061-1065 and `updateMasterSheetRow()` at contactUpdates.js:408-430
- **Result:** "1 FAIRWAY DR, Mount Vernon, OH 43050" now matches "1 FAIRWAY DR"

#### Address Formula Preservation
- **What:** Don't overwrite Address column formulas during updates
- **How:** Skip Address field in `updateMasterSheetRow()` even if it differs
- **Where:** contactUpdates.js:420-430
- **Result:** HYPERLINK formulas remain intact after updates

#### Case-Insensitive Unit Manager
- **What:** Uppercase Unit Manager before comparison
- **How:** Apply `.toUpperCase()` during preprocessing
- **Where:** contactUpdates.js:314-316 (addToMasterSheet) and 770-772 (testRowEmail)
- **Result:** "Self" and "SELF" no longer show as different

#### Default Values for Empty Fields
- **What:** Set defaults when form fields are empty
- **Values:**
  - Email Type-1 = "Home"
  - Newsletter = "Email"
  - Status = "Sold"
  - Entry Type = "Occupant"
- **Where:** contactUpdates.js:319-330 (addToMasterSheet) and 775-786 (testRowEmail)

#### Calculated Field Formulas
- **What:** Automatically set formulas for Address, Map, Knox County Link
- **Address Formula:** HYPERLINK with Google search + VLOOKUP from Reference sheet
- **Map Formula:** HYPERLINK to Google Maps
- **Knox County Formula:** HYPERLINK to Knox County Auditor site
- **Where:** `setCalculatedFieldFormulas()` at contactUpdates.js:543-590

#### Enhanced Debug Logging
- **What:** Added detailed logging for troubleshooting
- **Logs:**
  - Pre-parsed address components
  - Column indices found in master sheet
  - Fields in newData vs headers in master sheet
  - Step-by-step record matching progress
- **Where:** Throughout `addToMasterSheet()`, `locateRecordInMaster()`, `updateMasterSheetRow()`

### Code Quality

#### Simplified processNewRowFields()
- **What:** Reduced function to fallback parcel lookup only
- **Why:** Preprocessing now happens in `addToMasterSheet()` before record lookup
- **Where:** contactUpdates.js:488-501

#### Improved Error Handling
- **What:** Better error messages in catch blocks
- **Where:** `locateRecordInMaster()` returns structured error object

## [1.1.0] - 2025-11-07

### Features

- Comprehensive address-based record matching
- ST #, ST Name, ST Type component parsing
- Parcel-aware lookup for multi-occupant addresses
- Email format improvements for new vs existing entries
- Changes table in approval emails

### Bug Fixes

- Fixed deployment caching issues (required new version deployments)
- Fixed executeAs setting (USER_DEPLOYING instead of USER_ACCESSING)

## [1.0.0] - 2025-11-06

### Initial Release

- Form submission monitoring with onFormSubmit trigger
- Email notification to administrators
- Approval workflow with one-click buttons
- Smart record matching by Email-1 or Name
- UPDATE existing records or ADD new records
- Field mapping (22+ fields)
- TEST_MODE for safe testing
- Master sheet updates upon approval
- Comprehensive documentation

---

## Migration Notes

### Upgrading from 1.1.0 to 1.2.0

**IMPORTANT:** Version 1.2.0 fixes a critical bug where ALL updates were adding new rows.

**Steps:**

1. **Clean up duplicate rows:**
   - Open your test master sheet (DONOTUSE-Shared-Fairways-Directory)
   - Delete any duplicate rows that were added during testing
   - Keep only the original records

2. **Deploy new version:**
   ```bash
   clasp push
   ```
   - Open Apps Script editor
   - Deploy → Manage deployments → Edit → New version
   - Description: "v1.2.0 - Fixed addressColIndex and record matching"
   - Deploy

3. **Test thoroughly:**
   - Run `testThisFunction()` with a known existing record
   - Verify it shows "would UPDATE test master row X"
   - Click Approve and confirm it UPDATES (not adds new row)
   - Check that Address, Unit Manager don't show false changes

4. **Monitor logs:**
   - Look for "Pre-parsed address for matching"
   - Look for "Record found by Email-1 at row X"
   - Should NOT see "Error locating record: addressColIndex"

### Upgrading from 1.0.0 to 1.2.0

Follow steps above, plus:

5. **Update appsscript.json:**
   - Ensure `executeAs` is set to "USER_DEPLOYING"
   - Redeploy web app if changed

## Known Issues

None at this time. All critical bugs from 1.1.0 have been resolved in 1.2.0.

## Future Enhancements

- [ ] Bulk approval for multiple pending requests
- [ ] Admin dashboard for viewing all pending approvals
- [ ] Email digest (daily summary instead of per-submission)
- [ ] Audit trail / change history tracking
- [ ] Rollback capability for mistaken approvals
- [ ] Validation rules (e.g., phone number format, email format)
- [ ] Auto-complete for address entry (prevent typos)
