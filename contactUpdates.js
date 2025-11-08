/**
 * Fairways Contact Updates - Google Apps Script
 * Last Modified: 2025-11-08 06:15:00
 *
 * Monitors form submissions and sends approval emails to administrators
 */

// CONFIGURATION - Update these values
const CONFIG = {
  // ===== MODE SETTING =====
  // Set to true for TESTING (uses test master sheet)
  // Set to false for PRODUCTION (uses real master sheet)
  TEST_MODE: true,

  // Email address to send notifications to
  adminEmail: 'fairwayscondos-administrator@googlegroups.com, fairwaywebevents@gmail.com',

  // PRODUCTION Master sheet ID (Shared-Fairways-Directory)
  masterSheetId: '1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc',

  // TEST Master sheet ID (DONOTUSE-Shared-Fairways-Directory)
  testMasterSheetId: '1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8',

  // Form responses sheet ID (Contact Information - Responses)
  formResponsesSheetId: '1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM',

  // Subject line for notification emails
  emailSubject: '[CONTACT UPDATE] New Request - Action Required',

  // Column name for tracking approval status in form responses sheet
  statusColumnName: 'Approval Status',

  // Column name for tracking who approved
  approvedByColumnName: 'Approved By',

  // Column name for approval timestamp
  approvalTimestampColumnName: 'Approval Timestamp'
};

// Testing function 
function testThisFunction () {
  testRowEmail(94)
}

/**
 * Helper function to get the appropriate master sheet ID based on TEST_MODE
 * @returns {string} The master sheet ID (test or production)
 */
function getMasterSheetId() {
  return CONFIG.TEST_MODE ? CONFIG.testMasterSheetId : CONFIG.masterSheetId;
}

/**
 * This function is triggered when a new form response is submitted
 * To set up: Run setupTrigger() once, or manually create an onFormSubmit trigger
 */
function onFormSubmit(e) {
  try {
    Logger.log('Form submission detected');

    // Get the form response data
    const sheet = e.source.getActiveSheet();
    const row = e.range.getRow();
    const values = e.values;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Create a data object from the form response
    const formData = {};
    headers.forEach((header, index) => {
      formData[header] = values[index];
    });

    // Add timestamp if not present
    if (!formData['Timestamp']) {
      formData['Timestamp'] = new Date();
    }

    // Send notification email to administrators
    sendApprovalEmail(formData, row, sheet.getSheetId());

    // Mark as pending in the form responses sheet
    updateFormResponseStatus(sheet, row, 'Pending Approval');

    Logger.log('Notification email sent successfully');

  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
    // Send error notification to admin
    MailApp.sendEmail(
      CONFIG.adminEmail,
      'Error: Form Submission Processing Failed',
      'An error occurred while processing a form submission:\n\n' + error.toString()
    );
  }
}

/**
 * Sends an approval email to administrators with form data
 */
function sendApprovalEmail(formData, rowNumber, sheetId) {
  // Create approval and rejection URLs
  // Use production deployment URL (executeAs: USER_DEPLOYING)
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw/exec';
  const approveUrl = `${scriptUrl}?action=approve&row=${rowNumber}&sheetId=${sheetId}`;
  const rejectUrl = `${scriptUrl}?action=reject&row=${rowNumber}&sheetId=${sheetId}`;

  // Build email body
  let emailBody = '';
  if (CONFIG.TEST_MODE) {
    emailBody += '🧪 TEST MODE - Updates will go to TEST master sheet 🧪\n\n';
  }
  emailBody += 'A new contact update request has been submitted.\n\n';
  emailBody += '=== SUBMISSION DETAILS ===\n\n';

  // Add all form fields to email
  Object.keys(formData).forEach(key => {
    emailBody += `${key}: ${formData[key]}\n`;
  });

  emailBody += '\n\n=== ACTIONS ===\n\n';
  emailBody += `APPROVE: ${approveUrl}\n\n`;
  emailBody += `REJECT: ${rejectUrl}\n\n`;
  emailBody += '---\n';
  emailBody += 'Click the appropriate link above to approve or reject this request.\n';
  emailBody += 'The master contact sheet will be updated automatically upon approval.';

  // Build HTML email body for better formatting
  let htmlBody = '';
  if (CONFIG.TEST_MODE) {
    htmlBody += '<div style="background-color: #fff3cd; border: 2px solid #856404; padding: 15px; margin-bottom: 20px;">';
    htmlBody += '<h2 style="color: #856404; margin-top: 0;">🧪 TEST MODE</h2>';
    htmlBody += '<p style="margin: 0;">Updates will go to <strong>TEST</strong> master sheet (DONOTUSE-Shared-Fairways-Directory)</p>';
    htmlBody += '</div>';
  }
  htmlBody += '<h2>New Contact Update Request</h2>';
  htmlBody += '<h3>Submission Details</h3>';
  htmlBody += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">';

  Object.keys(formData).forEach(key => {
    htmlBody += `<tr><td><strong>${key}</strong></td><td>${formData[key]}</td></tr>`;
  });

  htmlBody += '</table>';
  htmlBody += '<br><br>';
  htmlBody += '<h3>Actions Required</h3>';
  htmlBody += '<p><a href="' + approveUrl + '" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">✓ APPROVE</a>';
  htmlBody += '<a href="' + rejectUrl + '" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">✗ REJECT</a></p>';
  htmlBody += '<p><em>Click the appropriate button above to approve or reject this request.</em></p>';

  // Send email
  const emailSubject = CONFIG.TEST_MODE
    ? '[TEST CONTACT UPDATE] New Request - Action Required'
    : CONFIG.emailSubject;

  MailApp.sendEmail({
    to: CONFIG.adminEmail,
    subject: emailSubject,
    body: emailBody,
    htmlBody: htmlBody
  });
}

/**
 * Updates the approval status in the form responses sheet
 */
function updateFormResponseStatus(sheet, row, status, approvedBy = '') {
  // Find or create status columns
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  let statusCol = headers.indexOf(CONFIG.statusColumnName) + 1;
  let approvedByCol = headers.indexOf(CONFIG.approvedByColumnName) + 1;
  let timestampCol = headers.indexOf(CONFIG.approvalTimestampColumnName) + 1;

  // Create columns if they don't exist
  if (statusCol === 0) {
    statusCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, statusCol).setValue(CONFIG.statusColumnName);
  }

  if (approvedByCol === 0) {
    approvedByCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, approvedByCol).setValue(CONFIG.approvedByColumnName);
  }

  if (timestampCol === 0) {
    timestampCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, timestampCol).setValue(CONFIG.approvalTimestampColumnName);
  }

  // Update status
  sheet.getRange(row, statusCol).setValue(status);

  // Update approver and timestamp if provided
  if (approvedBy) {
    sheet.getRange(row, approvedByCol).setValue(approvedBy);
    sheet.getRange(row, timestampCol).setValue(new Date());
  }
}

/**
 * Web app endpoint - handles approval/rejection clicks from email
 */
function doGet(e) {
  try {
    // Log what we received for debugging
    Logger.log('doGet called with parameters: ' + JSON.stringify(e.parameter));

    const action = e.parameter.action;
    const row = parseInt(e.parameter.row);
    const sheetId = e.parameter.sheetId;

    if (!action || !row || !sheetId) {
      const debugInfo = 'Invalid request parameters.<br><br>' +
                       'Received:<br>' +
                       'action: ' + action + '<br>' +
                       'row: ' + row + '<br>' +
                       'sheetId: ' + sheetId + '<br><br>' +
                       'Raw parameters: ' + JSON.stringify(e.parameter);
      return HtmlService.createHtmlOutput(debugInfo);
    }

    // Get the form responses sheet
    const formSheet = SpreadsheetApp.openById(CONFIG.formResponsesSheetId);
    const sheet = formSheet.getSheets().find(s => s.getSheetId() == sheetId);

    if (!sheet) {
      return HtmlService.createHtmlOutput('Sheet not found.');
    }

    // Get the row data
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

    const formData = {};
    headers.forEach((header, index) => {
      formData[header] = rowData[index];
    });

    // Get current user email
    const userEmail = Session.getActiveUser().getEmail();

    if (action === 'approve') {
      // Update status in form responses sheet
      updateFormResponseStatus(sheet, row, 'Approved', userEmail);

      // Add to master sheet
      addToMasterSheet(formData);

      return HtmlService.createHtmlOutput(
        '<h2>✓ Request Approved</h2>' +
        '<p>The contact update has been approved and added to the master sheet.</p>' +
        '<p>You can close this window.</p>'
      );

    } else if (action === 'reject') {
      // Update status in form responses sheet
      updateFormResponseStatus(sheet, row, 'Rejected', userEmail);

      return HtmlService.createHtmlOutput(
        '<h2>✗ Request Rejected</h2>' +
        '<p>The contact update has been rejected.</p>' +
        '<p>You can close this window.</p>'
      );

    } else {
      return HtmlService.createHtmlOutput('Invalid action.');
    }

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput(
      '<h2>Error</h2>' +
      '<p>An error occurred: ' + error.toString() + '</p>'
    );
  }
}

/**
 * Updates or adds data to the master contact sheet
 * This function:
 * 1. Maps form data fields to master sheet fields
 * 2. Locates existing record (by Email-1 or First Name + Last Name)
 * 3. If found: UPDATES the existing row with changed values
 * 4. If not found: ADDS a new row
 */
function addToMasterSheet(formData) {
  try {
    const masterSheetId = getMasterSheetId();
    Logger.log('Using master sheet: ' + (CONFIG.TEST_MODE ? 'TEST' : 'PRODUCTION') + ' (ID: ' + masterSheetId + ')');

    const masterSpreadsheet = SpreadsheetApp.openById(masterSheetId);
    const masterSheet = masterSpreadsheet.getSheets()[0]; // Use first sheet

    // Map form data to master sheet field names
    const mappedData = mapFieldsToMaster(formData);

    // Locate existing record in master sheet
    const recordInfo = locateRecordInMaster(mappedData);

    if (recordInfo.found) {
      // UPDATE existing record
      Logger.log('Updating existing record at row ' + recordInfo.row);
      updateMasterSheetRow(masterSheet, recordInfo.row, mappedData, recordInfo.existingData);
    } else {
      // ADD new record (possibly with parcel from address match)
      Logger.log('Adding new record to master sheet');
      if (recordInfo.parcel) {
        Logger.log('Using parcel from address match: ' + recordInfo.parcel);
        mappedData['Parcel'] = recordInfo.parcel;
      }
      Logger.log('MappedData before adding new row:');
      Logger.log(JSON.stringify(mappedData, null, 2));
      addNewMasterSheetRow(masterSheet, mappedData);
    }

  } catch (error) {
    Logger.log('Error updating master sheet: ' + error.toString());
    throw error;
  }
}

/**
 * Apply formatting rules to field data (Address uppercase, Unit Manager uppercase, split address components)
 */
function applyFieldFormatting(data) {
  // Parse and format Address as UPPERCASE and populate component fields
  if (data['Address']) {
    const addressParts = parseAddress(data['Address']);

    // Set individual components (all UPPERCASE)
    data['ST #'] = addressParts.stNumber.toUpperCase();
    data['ST Name'] = addressParts.stName.toUpperCase();
    data['ST Type'] = addressParts.stType.toUpperCase();

    // Set full address as concatenation
    if (addressParts.stNumber && addressParts.stName && addressParts.stType) {
      data['Address'] = (addressParts.stNumber + ' ' + addressParts.stName + ' ' + addressParts.stType).toUpperCase();
    } else {
      data['Address'] = data['Address'].toUpperCase();
    }
  }

  // Make Unit Manager UPPERCASE
  if (data['Unit Manager']) {
    data['Unit Manager'] = data['Unit Manager'].toUpperCase();
  }
}

/**
 * Updates an existing row in the master sheet
 * Only updates fields that have changed
 */
function updateMasterSheetRow(masterSheet, rowNumber, newData, existingData) {
  try {
    const headers = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];

    // Apply formatting rules to newData before comparison
    applyFieldFormatting(newData);

    Logger.log('Comparing values for update...');
    const changedFields = [];

    // Compare each field and update if different
    headers.forEach(function(header, colIndex) {
      const newValue = newData[header] || '';
      const existingValue = existingData[header] || '';

      // Convert to strings for comparison
      const newStr = String(newValue).trim();
      const existingStr = String(existingValue).trim();

      if (newStr !== existingStr && newStr !== '') {
        // Value has changed and new value is not empty
        masterSheet.getRange(rowNumber, colIndex + 1).setValue(newValue);
        changedFields.push({
          field: header,
          oldValue: existingValue,
          newValue: newValue
        });
        Logger.log('Updated ' + header + ': "' + existingValue + '" -> "' + newValue + '"');
      }
    });

    if (changedFields.length > 0) {
      Logger.log('Successfully updated ' + changedFields.length + ' fields in row ' + rowNumber);
    } else {
      Logger.log('No changes detected - all fields match existing data');
    }

    return changedFields;

  } catch (error) {
    Logger.log('Error updating row: ' + error.toString());
    throw error;
  }
}

/**
 * Adds a new row to the master sheet
 */
function addNewMasterSheetRow(masterSheet, mappedData) {
  try {
    // Get headers from master sheet
    const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];

    // If master sheet is empty, add headers
    if (masterHeaders.length === 0 || masterHeaders[0] === '') {
      const headers = Object.keys(mappedData);
      masterSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      Logger.log('Created header row in master sheet');

      // Update masterHeaders array
      masterHeaders.length = 0;
      masterHeaders.push.apply(masterHeaders, headers);
    }

    // Process special fields before adding
    processNewRowFields(masterSheet, mappedData, masterHeaders);

    Logger.log('After processNewRowFields, mappedData contains:');
    Logger.log('Parcel: ' + mappedData['Parcel']);
    Logger.log('ST #: ' + mappedData['ST #']);
    Logger.log('ST Name: ' + mappedData['ST Name']);
    Logger.log('ST Type: ' + mappedData['ST Type']);
    Logger.log('Email-1: ' + mappedData['Email-1']);

    // Create row data matching master sheet columns
    const rowData = masterHeaders.map(function(header) {
      return mappedData[header] || '';
    });

    // Append to master sheet
    const newRowNumber = masterSheet.getLastRow() + 1;
    masterSheet.appendRow(rowData);

    // Set formulas for calculated fields
    setCalculatedFieldFormulas(masterSheet, newRowNumber, masterHeaders);

    Logger.log('New row added to master sheet at row ' + newRowNumber);

  } catch (error) {
    Logger.log('Error adding new row: ' + error.toString());
    throw error;
  }
}

/**
 * Process fields that need special formatting or lookup before adding new row
 */
function processNewRowFields(masterSheet, mappedData, masterHeaders) {
  // Parse the address into components
  const rawAddress = mappedData['Address'] || '';
  const addressParts = parseAddress(rawAddress);

  Logger.log('Parsed address: ST#="' + addressParts.stNumber + '" ST Name="' + addressParts.stName + '" ST Type="' + addressParts.stType + '"');

  // Set the individual address component columns (all UPPERCASE)
  if (masterHeaders.indexOf('ST #') !== -1) {
    mappedData['ST #'] = addressParts.stNumber.toUpperCase();
  }
  if (masterHeaders.indexOf('ST Name') !== -1) {
    mappedData['ST Name'] = addressParts.stName.toUpperCase();
  }
  if (masterHeaders.indexOf('ST Type') !== -1) {
    mappedData['ST Type'] = addressParts.stType.toUpperCase();
  }

  // Set Address as UPPERCASE concatenation
  if (addressParts.stNumber && addressParts.stName && addressParts.stType) {
    mappedData['Address'] = (addressParts.stNumber + ' ' + addressParts.stName + ' ' + addressParts.stType).toUpperCase();
  } else if (rawAddress) {
    mappedData['Address'] = rawAddress.toUpperCase();
  }

  // Make Unit Manager UPPERCASE
  if (mappedData['Unit Manager']) {
    mappedData['Unit Manager'] = mappedData['Unit Manager'].toUpperCase();
  }

  // Try to find Parcel by looking up existing row with same address
  const parcel = findParcelByAddress(masterSheet, mappedData['Address'], masterHeaders);
  if (parcel) {
    mappedData['Parcel'] = parcel;
    Logger.log('Found existing parcel for address: ' + parcel);
  } else {
    Logger.log('No existing parcel found - Parcel field will be empty');
  }

  // Set default values for empty fields
  if (!mappedData['Email Type-1'] || mappedData['Email Type-1'].trim() === '') {
    mappedData['Email Type-1'] = 'Home';
  }
  if (!mappedData['Newsletter'] || mappedData['Newsletter'].trim() === '') {
    mappedData['Newsletter'] = 'Email';
  }
  if (!mappedData['Status'] || mappedData['Status'].trim() === '') {
    mappedData['Status'] = 'Sold';
  }
  if (!mappedData['Entry Type'] || mappedData['Entry Type'].trim() === '') {
    mappedData['Entry Type'] = 'Occupant';
  }
}

/**
 * Set formulas for calculated fields after row is added
 */
function setCalculatedFieldFormulas(masterSheet, rowNumber, headers) {
  // Find column indexes
  const parcelCol = headers.indexOf('Parcel') + 1;
  const addressCol = headers.indexOf('Address') + 1;
  const stNumberCol = headers.indexOf('ST #') + 1;
  const stNameCol = headers.indexOf('ST Name') + 1;
  const stTypeCol = headers.indexOf('ST Type') + 1;
  const mapCol = headers.indexOf('Map') + 1;
  const knoxCountyCol = headers.indexOf('Knox County Link') + 1;

  // Set Address formula
  // =HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F155,"+",G155,"+",H155,"+","OH","+43050"),VLOOKUP(A155,Reference!$Q$2:$AD,2,FALSE))
  if (addressCol > 0 && parcelCol > 0 && stNumberCol > 0 && stNameCol > 0 && stTypeCol > 0) {
    const parcelColLetter = columnToLetter(parcelCol);
    const stNumberColLetter = columnToLetter(stNumberCol);
    const stNameColLetter = columnToLetter(stNameCol);
    const stTypeColLetter = columnToLetter(stTypeCol);

    const addressFormula = '=HYPERLINK(CONCATENATE("https://www.google.com/search?q=",' +
                          stNumberColLetter + rowNumber + ',"+",",' +
                          stNameColLetter + rowNumber + ',"+",",' +
                          stTypeColLetter + rowNumber + ',"+","OH","+43050"),' +
                          'VLOOKUP(' + parcelColLetter + rowNumber + ',Reference!$Q$2:$AD,2,FALSE))';

    Logger.log('Setting Address formula: ' + addressFormula);
    masterSheet.getRange(rowNumber, addressCol).setFormula(addressFormula);
  }

  // Set Map hyperlink formula
  // =HYPERLINK(CONCATENATE("https://www.google.com/maps/place/",B154,", Mount Vernon, OH 43050"),"Map")
  if (mapCol > 0 && addressCol > 0) {
    const addressColLetter = columnToLetter(addressCol);
    const mapFormula = '=HYPERLINK(CONCATENATE("https://www.google.com/maps/place/",' +
                       addressColLetter + rowNumber + ',", Mount Vernon, OH 43050"),"Map")';
    masterSheet.getRange(rowNumber, mapCol).setFormula(mapFormula);
  }

  // Set Knox County Link formula
  // =HYPERLINK(CONCATENATE("https://beacon.schneidercorp.com/Application.aspx?AppID=1124&LayerID=28285&PageTypeID=4&PageID=11642&KeyValue=",A154),"Knox County Auditor")
  if (knoxCountyCol > 0 && parcelCol > 0) {
    const parcelColLetter = columnToLetter(parcelCol);
    const knoxFormula = '=HYPERLINK(CONCATENATE("https://beacon.schneidercorp.com/Application.aspx?AppID=1124&LayerID=28285&PageTypeID=4&PageID=11642&KeyValue=",' +
                        parcelColLetter + rowNumber + '),"Knox County Auditor")';
    masterSheet.getRange(rowNumber, knoxCountyCol).setFormula(knoxFormula);
  }
}

/**
 * Parse address string to extract street components
 * Expected format: "123 Main St" or "123 Main St, Mount Vernon"
 */
function parseAddress(addressStr) {
  if (!addressStr) {
    return { stNumber: '', stName: '', stType: '' };
  }

  // Remove everything after comma (city, state, etc.)
  const streetOnly = addressStr.split(',')[0].trim();

  // Split into parts
  const parts = streetOnly.split(/\s+/);

  if (parts.length >= 3) {
    return {
      stNumber: parts[0],
      stName: parts.slice(1, -1).join(' '),
      stType: parts[parts.length - 1]
    };
  } else if (parts.length === 2) {
    return {
      stNumber: parts[0],
      stName: parts[1],
      stType: ''
    };
  } else {
    return {
      stNumber: parts[0] || '',
      stName: '',
      stType: ''
    };
  }
}

/**
 * Find parcel number by looking up existing row with same address
 */
function findParcelByAddress(masterSheet, address, headers) {
  if (!address) return null;

  const addressCol = headers.indexOf('Address') + 1;
  const parcelCol = headers.indexOf('Parcel') + 1;

  if (addressCol === 0 || parcelCol === 0) return null;

  const data = masterSheet.getDataRange().getValues();

  // Skip header row, search for matching address
  for (let i = 1; i < data.length; i++) {
    const rowAddress = String(data[i][addressCol - 1]).toUpperCase().trim();
    const rowParcel = data[i][parcelCol - 1];

    if (rowAddress === address.toUpperCase().trim() && rowParcel) {
      Logger.log('Found parcel ' + rowParcel + ' for address ' + address);
      return rowParcel;
    }
  }

  Logger.log('No existing parcel found for address ' + address);
  return null;
}

/**
 * Convert column number to letter (1=A, 2=B, etc.)
 */
function columnToLetter(column) {
  let temp;
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/**
 * Setup function - Run this once to create the form submit trigger
 */
function setupTrigger() {
  // Delete existing triggers for this function to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create new form submit trigger
  const formSheet = SpreadsheetApp.openById(CONFIG.formResponsesSheetId);
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(formSheet)
    .onFormSubmit()
    .create();

  Logger.log('Trigger setup complete');
  return 'Trigger has been set up successfully!';
}

/**
 * Test function - Use this to test the email notification without a real form submission
 */
function testEmailNotification() {
  const testData = {
    'Timestamp': new Date(),
    'Name': 'John Doe',
    'Email': 'john.doe@example.com',
    'Phone': '555-1234',
    'Unit Number': '101',
    'Request Type': 'Update Contact Information',
    'Details': 'Please update my phone number'
  };

  sendApprovalEmail(testData, 2, 873697025);
  Logger.log('Test email sent');
}

// ==============================================================================
// TEST FUNCTIONS FOR DEVELOPMENT
// ==============================================================================

/**
 * Field mapping between form/test sheet and master sheet
 * Maps form response column names to master sheet column names
 * Based on README.md mapping table
 */
const FIELD_MAPPING = {
  // Form Field (Contact Information - Responses) -> Master Sheet Field (Shared-Fairways-Directory)
  'Timestamp': 'Timestamp',
  'Unit Address': 'Address', // Note: Master sheet concatenates (ST # ST Name ST Type)
  'Phone number': 'Home Phone',
  'First Name': 'First Name',
  'Last Name': 'Last Name',
  'Business Phone': 'Business Phone',
  'Business Addresses': 'Business Addresses',
  'Manager': 'Unit Manager',
  'Occupant Email Address': 'Email-1',
  'Occupancy First Date': 'Date Moved In',
  'Mailing Address': 'Mailing Address',
  'Other Phone Number': 'Cell Phone',
  'Emergency Contact Name': 'Emergency Contact Name',
  'Emergency Contact Phone': 'Emergency Contact Phone',
  'Emergency Contact Email': 'Emergency Contact Email',
  'Emergency Contact Relationship': 'Emergency Contact Relationship',
  'Emergency Contact Address': 'Emergency Contact ST Address',
  'Alternate Home Address': 'Alternate Home Address',
  'Alternate Home Phone': 'Alternate Home Phone',
  'Are you Working': 'Working?',
  'Do you have a Alternate Home': 'Alternate Home?',
  'Any other Contact Information': 'Other Contact Information'
};

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  // Test master sheet ID (DONOTUSE-Shared-Fairways-Directory)
  // This is where test updates will be made (not the real master sheet)
  testMasterSheetId: '1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8',

  // Your email for testing (change this to your email)
  testEmail: 'fairwayscondos-administrator@googlegroups.com'
};

/**
 * Test function - Send approval email for a specific row from Contact Information (Responses)
 * Tests against DONOTUSE-Shared-Fairways-Directory (test master sheet)
 *
 * @param {number} rowNumber - The row number from Contact Information (Responses) sheet (1-based, where 1 is header)
 *
 * Usage: testRowEmail(93) - tests row 93 from form responses
 */
function testRowEmail(rowNumber) {
  try {
    if (!rowNumber || rowNumber < 2) {
      Logger.log('ERROR: Please provide a valid row number (2 or greater)');
      return 'ERROR: Invalid row number';
    }

    // Open REAL form responses sheet (Contact Information - Responses)
    const formSheet = SpreadsheetApp.openById(CONFIG.formResponsesSheetId);
    const sheet = formSheet.getSheets()[0];

    // Get headers and row data from FORM RESPONSES
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Create form data object from form responses
    const formData = {};
    headers.forEach(function(header, index) {
      formData[header] = rowData[index];
    });

    Logger.log('Form Response Data from row ' + rowNumber + ':');
    Logger.log(JSON.stringify(formData, null, 2));

    // Map fields to master sheet format
    const mappedData = mapFieldsToMaster(formData);

    Logger.log('Mapped Data for Master Sheet:');
    Logger.log(JSON.stringify(mappedData, null, 2));

    // Locate record in TEST MASTER sheet using comprehensive matching logic
    const recordInfo = locateRecordInTestMaster(mappedData);

    Logger.log('Record Location Result in TEST master:');
    Logger.log(JSON.stringify(recordInfo, null, 2));

    // Calculate changes
    const changes = calculateChanges(mappedData, recordInfo.existingData);

    // Add metadata about the test
    mappedData['_TEST_MODE'] = true;
    mappedData['_RECORD_FOUND'] = recordInfo.found;
    mappedData['_IS_NEW_ENTRY'] = !recordInfo.found;
    mappedData['_MATCHED_BY'] = recordInfo.matchedBy;
    mappedData['_MASTER_ROW'] = recordInfo.row;
    mappedData['_EXISTING_PARCEL'] = recordInfo.parcel;
    mappedData['_EXISTING_ADDRESS'] = recordInfo.address;
    mappedData['_CHANGES'] = changes;
    mappedData['_FORM_ROW'] = rowNumber;

    // Send test approval email with changes table
    sendTestApprovalEmail(mappedData, rowNumber, sheet.getSheetId());

    let status;
    if (recordInfo.found) {
      status = 'Email sent! Form row ' + rowNumber + ' would UPDATE test master row ' + recordInfo.row +
               ' (matched by ' + recordInfo.matchedBy + ') with ' + changes.length + ' changes';
    } else {
      status = 'Email sent! Form row ' + rowNumber + ' would ADD A NEW entry to test master.';
    }

    Logger.log(status);
    return status;

  } catch (error) {
    Logger.log('Error in testRowEmail: ' + error.toString());
    return 'ERROR: ' + error.toString();
  }
}

/**
 * Maps test sheet fields to master sheet fields using FIELD_MAPPING
 */
function mapFieldsToMaster(testData) {
  const mappedData = {};

  Object.keys(FIELD_MAPPING).forEach(function(testField) {
    const masterField = FIELD_MAPPING[testField];
    mappedData[masterField] = testData[testField] || '';
  });

  // Add timestamp if not present
  if (!mappedData['Timestamp']) {
    mappedData['Timestamp'] = new Date();
  }

  return mappedData;
}

/**
 * Locates an existing record in the TEST master sheet (for testing purposes)
 * Uses TEST_CONFIG.testMasterSheetId instead of CONFIG.masterSheetId
 */
function locateRecordInTestMaster(formData) {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(TEST_CONFIG.testMasterSheetId);
    const masterSheet = masterSpreadsheet.getSheets()[0];

    // Get all data
    const data = masterSheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const emailColIndex = headers.indexOf('Email-1');
    const firstNameColIndex = headers.indexOf('First Name');
    const lastNameColIndex = headers.indexOf('Last Name');
    const parcelColIndex = headers.indexOf('Parcel');
    const stNumberColIndex = headers.indexOf('ST #');
    const stNameColIndex = headers.indexOf('ST Name');
    const stTypeColIndex = headers.indexOf('ST Type');

    Logger.log('TEST - Column indices - ST#: ' + stNumberColIndex + ', ST Name: ' + stNameColIndex + ', ST Type: ' + stTypeColIndex + ', Parcel: ' + parcelColIndex + ', Email-1: ' + emailColIndex + ', First Name: ' + firstNameColIndex + ', Last Name: ' + lastNameColIndex);

    const email = formData['Email-1'];
    const firstName = formData['First Name'];
    const lastName = formData['Last Name'];
    let address = formData['Address'];

    // Parse address into components for matching
    let stNumber = '';
    let stName = '';
    let stType = '';

    if (address) {
      Logger.log('TEST - Original address from form: "' + address + '"');
      const addressParts = parseAddress(address);
      stNumber = addressParts.stNumber.toUpperCase();
      stName = addressParts.stName.toUpperCase();
      stType = addressParts.stType.toUpperCase();
      Logger.log('TEST - Parsed address - ST#: "' + stNumber + '", ST Name: "' + stName + '", ST Type: "' + stType + '"');
    }

    // STEP 1: Find all rows with matching ST #, ST Name, ST Type (to get the Parcel)
    let candidateRows = [];
    let matchedParcel = null;

    if (stNumber && stName && stType && stNumberColIndex !== -1 && stNameColIndex !== -1 && stTypeColIndex !== -1) {
      Logger.log('TEST - Searching for matching address components...');
      for (let i = 1; i < data.length; i++) {
        const rowStNumber = data[i][stNumberColIndex];
        const rowStName = data[i][stNameColIndex];
        const rowStType = data[i][stTypeColIndex];

        if (i <= 3) { // Log first 3 rows for debugging
          Logger.log('TEST - Row ' + (i + 1) + ' - ST#: "' + rowStNumber + '", ST Name: "' + rowStName + '", ST Type: "' + rowStType + '"');
        }

        if (rowStNumber && rowStName && rowStType &&
            rowStNumber.toString().toUpperCase().trim() === stNumber.trim() &&
            rowStName.toString().toUpperCase().trim() === stName.trim() &&
            rowStType.toString().toUpperCase().trim() === stType.trim()) {

          matchedParcel = data[i][parcelColIndex];
          candidateRows.push(i);
          Logger.log('TEST - ✓ Found address component match at row ' + (i + 1) + ' with parcel: ' + matchedParcel);
        }
      }
      if (candidateRows.length === 0) {
        Logger.log('TEST - ✗ No address component match found for: ST#="' + stNumber + '", ST Name="' + stName + '", ST Type="' + stType + '"');
      }
    } else {
      Logger.log('TEST - ⚠ Missing address component columns or address data. Cannot match by address.');
    }

    // If we found address matches, now find all rows with the same parcel
    if (candidateRows.length > 0 && matchedParcel && parcelColIndex !== -1) {
      candidateRows = []; // Reset and find all rows with this parcel
      for (let i = 1; i < data.length; i++) {
        const rowParcel = data[i][parcelColIndex];
        if (rowParcel && rowParcel.toString().trim() === matchedParcel.toString().trim()) {
          candidateRows.push(i);
        }
      }
      Logger.log('TEST - Found ' + candidateRows.length + ' row(s) with parcel ' + matchedParcel);
    }

    // If no address match found, search ALL rows as candidates
    if (candidateRows.length === 0) {
      Logger.log('TEST - No address match found. Will search all rows.');
      for (let i = 1; i < data.length; i++) {
        candidateRows.push(i);
      }
    }

    // STEP 2: Within candidate rows, try to match by Email-1
    if (email && emailColIndex !== -1) {
      for (let j = 0; j < candidateRows.length; j++) {
        const i = candidateRows[j];
        const rowEmail = data[i][emailColIndex];
        if (rowEmail && rowEmail.toString().toLowerCase() === email.toLowerCase()) {
          Logger.log('TEST - Record found by Email-1 at row ' + (i + 1) + ' (within parcel group)');

          // Build existing data object
          const existingData = {};
          headers.forEach(function(header, idx) {
            existingData[header] = data[i][idx];
          });

          return {
            found: true,
            row: i + 1,
            matchedBy: 'Email-1 (within parcel)',
            address: address,
            parcel: data[i][parcelColIndex],
            existingData: existingData
          };
        }
      }
    }

    // STEP 3: Within candidate rows, try to match by First Name + Last Name
    if (firstName && lastName && firstNameColIndex !== -1 && lastNameColIndex !== -1) {
      for (let j = 0; j < candidateRows.length; j++) {
        const i = candidateRows[j];
        const rowFirstName = data[i][firstNameColIndex];
        const rowLastName = data[i][lastNameColIndex];

        if (rowFirstName && rowLastName &&
            rowFirstName.toString().toLowerCase() === firstName.toLowerCase() &&
            rowLastName.toString().toLowerCase() === lastName.toLowerCase()) {
          Logger.log('TEST - Record found by First Name + Last Name at row ' + (i + 1) + ' (within parcel group)');

          // Build existing data object
          const existingData = {};
          headers.forEach(function(header, idx) {
            existingData[header] = data[i][idx];
          });

          return {
            found: true,
            row: i + 1,
            matchedBy: 'First Name + Last Name (within parcel)',
            address: address,
            parcel: data[i][parcelColIndex],
            existingData: existingData
          };
        }
      }
    }

    // STEP 4: Not found - no existing person match, but may have found parcel from address
    if (matchedParcel) {
      Logger.log('TEST - No person match found, but address exists. Will add new row with parcel: ' + matchedParcel);
    } else {
      Logger.log('TEST - WARNING: Address not found in directory. Will add new row without parcel.');
    }
    return {
      found: false,
      row: null,
      matchedBy: null,
      address: address,
      parcel: matchedParcel, // Return the parcel we found from address match (or null)
      existingData: null
    };

  } catch (error) {
    Logger.log('Error locating record in TEST master: ' + error.toString());
    return {
      found: false,
      row: null,
      matchedBy: null,
      address: null,
      parcel: null,
      existingData: null,
      error: error.toString()
    };
  }
}

/**
 * Calculates changes between new data and existing data
 * Returns array of {field, oldValue, newValue} for changed fields
 */
function calculateChanges(newData, existingData) {
  const changes = [];

  if (!existingData) {
    // No existing data, all non-empty fields are "new"
    Object.keys(newData).forEach(function(field) {
      if (!field.startsWith('_') && newData[field] && String(newData[field]).trim() !== '') {
        changes.push({
          field: field,
          oldValue: '',
          newValue: newData[field],
          changeType: 'ADD'
        });
      }
    });
  } else {
    // Compare each field
    Object.keys(newData).forEach(function(field) {
      if (field.startsWith('_')) return; // Skip metadata fields

      const newValue = newData[field] || '';
      const oldValue = existingData[field] || '';

      const newStr = String(newValue).trim();
      const oldStr = String(oldValue).trim();

      if (newStr !== oldStr && newStr !== '') {
        changes.push({
          field: field,
          oldValue: oldValue,
          newValue: newValue,
          changeType: 'UPDATE'
        });
      }
    });
  }

  Logger.log('Calculated ' + changes.length + ' changes');
  return changes;
}

/**
 * Locates an existing record in the master sheet
 * Based on README.md logic:
 * 1. First try to match by Email-1
 * 2. If not found, try to match by First Name + Last Name
 * 3. If still not found, it's a NEW entry
 *
 * @param {Object} formData - Mapped form data with master sheet field names
 * @returns {Object} { found: boolean, row: number, matchedBy: string, existingData: Object }
 */
function locateRecordInMaster(formData) {
  try {
    const masterSheetId = getMasterSheetId();
    const masterSpreadsheet = SpreadsheetApp.openById(masterSheetId);
    const masterSheet = masterSpreadsheet.getSheets()[0];

    // Get all data
    const data = masterSheet.getDataRange().getValues();
    const headers = data[0];

    // Find column indices
    const emailColIndex = headers.indexOf('Email-1');
    const firstNameColIndex = headers.indexOf('First Name');
    const lastNameColIndex = headers.indexOf('Last Name');
    const parcelColIndex = headers.indexOf('Parcel');
    const stNumberColIndex = headers.indexOf('ST #');
    const stNameColIndex = headers.indexOf('ST Name');
    const stTypeColIndex = headers.indexOf('ST Type');

    Logger.log('Column indices - ST#: ' + stNumberColIndex + ', ST Name: ' + stNameColIndex + ', ST Type: ' + stTypeColIndex + ', Parcel: ' + parcelColIndex + ', Email-1: ' + emailColIndex + ', First Name: ' + firstNameColIndex + ', Last Name: ' + lastNameColIndex);

    const email = formData['Email-1'];
    const firstName = formData['First Name'];
    const lastName = formData['Last Name'];
    let address = formData['Address'];

    // Parse address into components for matching
    let stNumber = '';
    let stName = '';
    let stType = '';

    if (address) {
      Logger.log('Original address from form: "' + address + '"');
      const addressParts = parseAddress(address);
      stNumber = addressParts.stNumber.toUpperCase();
      stName = addressParts.stName.toUpperCase();
      stType = addressParts.stType.toUpperCase();
      Logger.log('Parsed address - ST#: "' + stNumber + '", ST Name: "' + stName + '", ST Type: "' + stType + '"');
    }

    // STEP 1: Find all rows with matching ST #, ST Name, ST Type (to get the Parcel)
    let candidateRows = [];
    let matchedParcel = null;

    if (stNumber && stName && stType && stNumberColIndex !== -1 && stNameColIndex !== -1 && stTypeColIndex !== -1) {
      Logger.log('Searching for matching address components...');
      for (let i = 1; i < data.length; i++) {
        const rowStNumber = data[i][stNumberColIndex];
        const rowStName = data[i][stNameColIndex];
        const rowStType = data[i][stTypeColIndex];

        if (i <= 3) { // Log first 3 rows for debugging
          Logger.log('Row ' + (i + 1) + ' - ST#: "' + rowStNumber + '", ST Name: "' + rowStName + '", ST Type: "' + rowStType + '"');
        }

        if (rowStNumber && rowStName && rowStType &&
            rowStNumber.toString().toUpperCase().trim() === stNumber.trim() &&
            rowStName.toString().toUpperCase().trim() === stName.trim() &&
            rowStType.toString().toUpperCase().trim() === stType.trim()) {

          matchedParcel = data[i][parcelColIndex];
          candidateRows.push(i);
          Logger.log('✓ Found address component match at row ' + (i + 1) + ' with parcel: ' + matchedParcel);
        }
      }
      if (candidateRows.length === 0) {
        Logger.log('✗ No address component match found for: ST#="' + stNumber + '", ST Name="' + stName + '", ST Type="' + stType + '"');
      }
    } else {
      Logger.log('⚠ Missing address component columns or address data. Cannot match by address.');
    }

    // If we found address matches, now find all rows with the same parcel
    if (candidateRows.length > 0 && matchedParcel && parcelColIndex !== -1) {
      candidateRows = []; // Reset and find all rows with this parcel
      for (let i = 1; i < data.length; i++) {
        const rowParcel = data[i][parcelColIndex];
        if (rowParcel && rowParcel.toString().trim() === matchedParcel.toString().trim()) {
          candidateRows.push(i);
        }
      }
      Logger.log('Found ' + candidateRows.length + ' row(s) with parcel ' + matchedParcel);
    }

    // If no address match found, search ALL rows as candidates
    if (candidateRows.length === 0) {
      Logger.log('No address match found. Will search all rows.');
      for (let i = 1; i < data.length; i++) {
        candidateRows.push(i);
      }
    }

    // STEP 2: Within candidate rows, try to match by Email-1
    if (email && emailColIndex !== -1) {
      for (let j = 0; j < candidateRows.length; j++) {
        const i = candidateRows[j];
        const rowEmail = data[i][emailColIndex];
        if (rowEmail && rowEmail.toString().toLowerCase() === email.toLowerCase()) {
          Logger.log('Record found by Email-1 at row ' + (i + 1) + ' (within parcel group)');

          // Build existing data object
          const existingData = {};
          headers.forEach(function(header, idx) {
            existingData[header] = data[i][idx];
          });

          return {
            found: true,
            row: i + 1,
            matchedBy: 'Email-1 (within parcel)',
            address: data[i][addressColIndex],
            parcel: data[i][parcelColIndex],
            existingData: existingData
          };
        }
      }
    }

    // STEP 3: Within candidate rows, try to match by First Name + Last Name as last resort
    if (firstName && lastName && firstNameColIndex !== -1 && lastNameColIndex !== -1) {
      for (let j = 0; j < candidateRows.length; j++) {
        const i = candidateRows[j];
        const rowFirstName = data[i][firstNameColIndex];
        const rowLastName = data[i][lastNameColIndex];

        if (rowFirstName && rowLastName &&
            rowFirstName.toString().toLowerCase() === firstName.toLowerCase() &&
            rowLastName.toString().toLowerCase() === lastName.toLowerCase()) {
          Logger.log('Record found by First Name + Last Name at row ' + (i + 1) + ' (within parcel group)');

          // Build existing data object
          const existingData = {};
          headers.forEach(function(header, idx) {
            existingData[header] = data[i][idx];
          });

          return {
            found: true,
            row: i + 1,
            matchedBy: 'First Name + Last Name (within parcel)',
            address: data[i][addressColIndex],
            parcel: data[i][parcelColIndex],
            existingData: existingData
          };
        }
      }
    }

    // STEP 4: Not found - no existing person match, but may have found parcel from address
    if (matchedParcel) {
      Logger.log('No person match found, but address exists. Will add new row with parcel: ' + matchedParcel);
    } else {
      Logger.log('WARNING: Address not found in directory. Will add new row without parcel.');
    }
    return {
      found: false,
      row: null,
      matchedBy: null,
      address: address,
      parcel: matchedParcel, // Return the parcel we found from address match (or null)
      existingData: null
    };

  } catch (error) {
    Logger.log('Error locating record: ' + error.toString());
    return {
      found: false,
      row: null,
      matchedBy: null,
      address: null,
      parcel: null,
      existingData: null,
      error: error.toString()
    };
  }
}

/**
 * Checks if an email address already exists in the master sheet
 * (Simplified wrapper for backward compatibility)
 */
function checkEmailExistsInMaster(email) {
  try {
    if (!email) return false;

    const masterSheetId = getMasterSheetId();
    const masterSpreadsheet = SpreadsheetApp.openById(masterSheetId);
    const masterSheet = masterSpreadsheet.getSheets()[0];
    const data = masterSheet.getDataRange().getValues();
    const headers = data[0];
    const emailColIndex = headers.indexOf('Email-1');

    if (emailColIndex === -1) {
      Logger.log('WARNING: Email-1 column not found in master sheet');
      return false;
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] &&
          data[i][emailColIndex].toString().toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }

    return false;

  } catch (error) {
    Logger.log('Error checking email: ' + error.toString());
    return false;
  }
}

/**
 * Sends a TEST approval email (modified to highlight new vs existing entries)
 */
function sendTestApprovalEmail(formData, rowNumber, sheetId) {
  // Use production deployment URL (executeAs: USER_DEPLOYING)
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw/exec';
  const approveUrl = scriptUrl + '?action=approve&row=' + rowNumber + '&sheetId=' + sheetId + '&test=true';
  const rejectUrl = scriptUrl + '?action=reject&row=' + rowNumber + '&sheetId=' + sheetId + '&test=true';

  const isNewEntry = formData['_IS_NEW_ENTRY'];
  const matchedBy = formData['_MATCHED_BY'];
  const masterRow = formData['_MASTER_ROW'];
  const existingParcel = formData['_EXISTING_PARCEL'];
  const existingAddress = formData['_EXISTING_ADDRESS'];
  const changes = formData['_CHANGES'] || [];
  const formRow = formData['_FORM_ROW'];

  // Build email body with TEST MODE warning
  let emailBody = '=== TEST MODE - UPDATES WILL BE MADE TO TEST MASTER SHEET ===\n\n';
  emailBody += 'Form Response Row: ' + formRow + ' (Contact Information - Responses)\n\n';

  if (isNewEntry) {
    emailBody += '*** NEW ENTRY ***\n';
    emailBody += '*** Record not found in master sheet ***\n';
    emailBody += '*** This will ADD a new contact ***\n\n';
  } else {
    emailBody += '*** EXISTING ENTRY ***\n';
    emailBody += '*** Record found at row ' + masterRow + ' in master sheet ***\n';
    emailBody += '*** Matched by: ' + matchedBy + ' ***\n';
    if (existingParcel) {
      emailBody += '*** Existing Parcel: ' + existingParcel + ' ***\n';
    }
    if (existingAddress) {
      emailBody += '*** Existing Address: ' + existingAddress + ' ***\n';
    }
    emailBody += '*** This will UPDATE the existing contact ***\n\n';
  }

  emailBody += 'A contact update request has been submitted.\n\n';

  // Add CHANGES TABLE
  if (changes.length > 0) {
    emailBody += '=== CHANGES TO BE MADE (' + changes.length + ' fields) ===\n\n';
    changes.forEach(function(change) {
      emailBody += change.field + ':\n';
      emailBody += '  OLD: ' + (change.oldValue || '(empty)') + '\n';
      emailBody += '  NEW: ' + change.newValue + '\n\n';
    });
  } else if (!isNewEntry) {
    emailBody += '=== NO CHANGES DETECTED ===\n\n';
    emailBody += 'All form values match existing master sheet data.\n\n';
  }

  emailBody += '=== ALL FORM DATA ===\n\n';

  // Add all form fields to email (excluding internal metadata)
  Object.keys(formData).forEach(function(key) {
    if (!key.startsWith('_')) {
      emailBody += key + ': ' + formData[key] + '\n';
    }
  });

  emailBody += '\n\n=== ACTIONS ===\n\n';
  emailBody += 'APPROVE: ' + approveUrl + '\n\n';
  emailBody += 'REJECT: ' + rejectUrl + '\n\n';
  emailBody += '---\n';
  emailBody += 'Click the appropriate link above to approve or reject this request.\n';
  emailBody += 'NOTE: In TEST MODE, approval will update the TEST master sheet (DONOTUSE-Shared-Fairways-Directory).';

  // Build HTML email body with highlighting
  let htmlBody = '<div style="background-color: #fff3cd; border: 2px solid #856404; padding: 15px; margin-bottom: 20px;">';
  htmlBody += '<h2 style="color: #856404; margin-top: 0;">🧪 TEST MODE</h2>';
  htmlBody += '<p style="margin: 5px 0 0 0;"><strong>Form Response Row: ' + formRow + '</strong> (Contact Information - Responses)</p>';
  htmlBody += '<p style="margin: 5px 0 0 0;">Updates will be made to <strong>TEST</strong> master sheet (DONOTUSE-Shared-Fairways-Directory)</p>';
  htmlBody += '</div>';

  if (isNewEntry) {
    htmlBody += '<div style="background-color: #d4edda; border: 2px solid #28a745; padding: 15px; margin-bottom: 20px;">';
    htmlBody += '<h3 style="color: #155724; margin-top: 0;">✨ NEW ENTRY</h3>';
    htmlBody += '<p style="margin: 0;"><strong>Record not found in test master sheet.</strong></p>';
    htmlBody += '<p style="margin: 5px 0 0 0;">This will <strong>ADD</strong> a new contact to the directory.</p>';
    htmlBody += '</div>';
  } else {
    htmlBody += '<div style="background-color: #d1ecf1; border: 2px solid #0c5460; padding: 15px; margin-bottom: 20px;">';
    htmlBody += '<h3 style="color: #0c5460; margin-top: 0;">📝 EXISTING ENTRY</h3>';
    htmlBody += '<p style="margin: 0;"><strong>Record found at row ' + masterRow + ' in test master sheet</strong></p>';
    htmlBody += '<p style="margin: 5px 0 0 0;">Matched by: <strong>' + matchedBy + '</strong></p>';
    if (existingParcel) {
      htmlBody += '<p style="margin: 5px 0 0 0;">Existing Parcel: <code>' + existingParcel + '</code></p>';
    }
    if (existingAddress) {
      htmlBody += '<p style="margin: 5px 0 0 0;">Existing Address: <code>' + existingAddress + '</code></p>';
    }
    htmlBody += '<p style="margin: 5px 0 0 0;">This will <strong>UPDATE</strong> the existing contact.</p>';
    htmlBody += '</div>';
  }

  // Add CHANGES TABLE (HTML version)
  // For new entries, show all form data; for updates, show only changed fields
  if (isNewEntry) {
    // Count non-internal fields
    const fieldCount = Object.keys(formData).filter(k => !k.startsWith('_')).length;
    htmlBody += '<h3>📋 Form Data to be Added (' + fieldCount + ' fields)</h3>';
    htmlBody += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">';
    htmlBody += '<tr style="background-color: #f0f0f0;"><th>Field</th><th>Value</th></tr>';
    Object.keys(formData).forEach(function(key) {
      if (!key.startsWith('_')) {
        htmlBody += '<tr>';
        htmlBody += '<td><strong>' + key + '</strong></td>';
        htmlBody += '<td style="background-color: #e6ffe6;">' + (formData[key] || '<em>(empty)</em>') + '</td>';
        htmlBody += '</tr>';
      }
    });
    htmlBody += '</table>';
  } else if (changes.length > 0) {
    htmlBody += '<h3>📋 Changes to be Made (' + changes.length + ' fields)</h3>';
    htmlBody += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">';
    htmlBody += '<tr style="background-color: #f0f0f0;"><th>Field</th><th>Old Value</th><th>New Value</th></tr>';
    changes.forEach(function(change) {
      htmlBody += '<tr>';
      htmlBody += '<td><strong>' + change.field + '</strong></td>';
      htmlBody += '<td style="background-color: #ffe6e6;">' + (change.oldValue || '<em>(empty)</em>') + '</td>';
      htmlBody += '<td style="background-color: #e6ffe6;">' + change.newValue + '</td>';
      htmlBody += '</tr>';
    });
    htmlBody += '</table>';
  } else {
    htmlBody += '<div style="background-color: #e7f3ff; border: 2px solid #0066cc; padding: 15px; margin-bottom: 20px;">';
    htmlBody += '<h3 style="color: #0066cc; margin-top: 0;">ℹ️ NO CHANGES DETECTED</h3>';
    htmlBody += '<p style="margin: 0;">All form values match existing test master sheet data.</p>';
    htmlBody += '</div>';
  }

  htmlBody += '<br>';
  htmlBody += '<h3>Actions Required</h3>';
  htmlBody += '<p><a href="' + approveUrl + '" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">✓ APPROVE (TEST)</a>';
  htmlBody += '<a href="' + rejectUrl + '" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">✗ REJECT (TEST)</a></p>';
  htmlBody += '<p><em>Click the appropriate button above to approve or reject this request.</em></p>';
  htmlBody += '<p><strong>NOTE: In TEST MODE, approval will update the TEST master sheet (DONOTUSE-Shared-Fairways-Directory).</strong></p>';

  // Send email
  MailApp.sendEmail({
    to: TEST_CONFIG.testEmail,
    subject: '[TEST CONTACT UPDATE] New Request - Action Required',
    body: emailBody,
    htmlBody: htmlBody
  });

  Logger.log('Test email sent to: ' + TEST_CONFIG.testEmail);
}
