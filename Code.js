/**
 * Fairways Contact Updates - Google Apps Script
 * Monitors form submissions and sends approval emails to administrators
 */

// CONFIGURATION - Update these values
const CONFIG = {
  // Email address to send notifications to
  adminEmail: 'fairwayscondos-administrator@googlegroups.com',

  // Master sheet ID (where approved data goes)
  masterSheetId: '1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc',

  // Form responses sheet ID (where form data comes from)
  formResponsesSheetId: '1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM',

  // Subject line for notification emails
  emailSubject: 'New Contact Update Request - Action Required',

  // Column name for tracking approval status in form responses sheet
  statusColumnName: 'Approval Status',

  // Column name for tracking who approved
  approvedByColumnName: 'Approved By',

  // Column name for approval timestamp
  approvalTimestampColumnName: 'Approval Timestamp'
};

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
  const scriptUrl = ScriptApp.getService().getUrl();
  const approveUrl = `${scriptUrl}?action=approve&row=${rowNumber}&sheetId=${sheetId}`;
  const rejectUrl = `${scriptUrl}?action=reject&row=${rowNumber}&sheetId=${sheetId}`;

  // Build email body
  let emailBody = 'A new contact update request has been submitted.\n\n';
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
  let htmlBody = '<h2>New Contact Update Request</h2>';
  htmlBody += '<h3>Submission Details</h3>';
  htmlBody += '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse;">';

  Object.keys(formData).forEach(key => {
    htmlBody += `<tr><td><strong>${key}</strong></td><td>${formData[key]}</td></tr>`;
  });

  htmlBody += '</table>';
  htmlBody += '<br><br>';
  htmlBody += '<h3>Actions Required</h3>';
  htmlBody += `<p><a href="${approveUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">✓ APPROVE</a>`;
  htmlBody += `<a href="${rejectUrl}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">✗ REJECT</a></p>';
  htmlBody += '<p><em>Click the appropriate button above to approve or reject this request.</em></p>';

  // Send email
  MailApp.sendEmail({
    to: CONFIG.adminEmail,
    subject: CONFIG.emailSubject,
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
    const action = e.parameter.action;
    const row = parseInt(e.parameter.row);
    const sheetId = e.parameter.sheetId;

    if (!action || !row || !sheetId) {
      return HtmlService.createHtmlOutput('Invalid request parameters.');
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
 * Adds approved data to the master contact sheet
 */
function addToMasterSheet(formData) {
  try {
    const masterSpreadsheet = SpreadsheetApp.openById(CONFIG.masterSheetId);
    const masterSheet = masterSpreadsheet.getSheets()[0]; // Use first sheet

    // Get headers from master sheet
    const masterHeaders = masterSheet.getRange(1, 1, 1, masterSheet.getLastColumn()).getValues()[0];

    // If master sheet is empty, add headers from form data
    if (masterHeaders.length === 0 || masterHeaders[0] === '') {
      const headers = Object.keys(formData);
      masterSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      masterHeaders.length = 0;
      masterHeaders.push(...headers);
    }

    // Create row data matching master sheet columns
    const rowData = masterHeaders.map(header => {
      return formData[header] || '';
    });

    // Append to master sheet
    masterSheet.appendRow(rowData);

    Logger.log('Data added to master sheet successfully');

  } catch (error) {
    Logger.log('Error adding to master sheet: ' + error.toString());
    throw error;
  }
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