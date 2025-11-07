# Fairways Contact Updates - Setup Instructions

This Google Apps Script automatically monitors form submissions and sends approval emails to administrators. When approved, the data is automatically added to the master contact sheet.

## Prerequisites

- Google account with access to both spreadsheets
- Node.js and npm installed (for clasp)
- clasp CLI tool installed globally: `npm install -g @google/clasp`

## Installation Steps

### 1. Clone or Download This Repository

```bash
git clone <repository-url>
cd fairways-contact-updates
```

### 2. Login to clasp

```bash
clasp login
```

This will open a browser window for you to authenticate with your Google account.

### 3. Create a New Apps Script Project

```bash
clasp create --title "Fairways Contact Updates" --type standalone
```

This will create a new Apps Script project and update the `.clasp.json` file with your `scriptId`.

**Alternative:** If you want to bind the script to the form responses spreadsheet:

```bash
clasp create --title "Fairways Contact Updates" --type sheets --parentId "1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM"
```

### 4. Push the Code

```bash
clasp push
```

This uploads [Code.gs](Code.gs) and [appsscript.json](appsscript.json) to your Apps Script project.

### 5. Configure the Script

Open the script in the Apps Script editor:

```bash
clasp open
```

In the editor:

1. Review the `CONFIG` object at the top of [Code.gs](Code.gs)
2. Verify the spreadsheet IDs and email address are correct:
   - `formResponsesSheetId`: `1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM`
   - `masterSheetId`: `1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc`
   - `adminEmail`: `fairwayscondos-administrator@googlegroups.com`

### 6. Set Up the Form Submit Trigger

In the Apps Script editor:

1. Click on the function dropdown and select `setupTrigger`
2. Click the "Run" button (▶️)
3. Authorize the script when prompted:
   - Review permissions
   - Click "Advanced" if you see a warning
   - Click "Go to Fairways Contact Updates (unsafe)"
   - Click "Allow"

This creates an automatic trigger that runs whenever a new form is submitted.

### 7. Deploy as Web App (for Approval Links)

1. In the Apps Script editor, click "Deploy" > "New deployment"
2. Click the gear icon ⚙️ next to "Select type"
3. Choose "Web app"
4. Configure:
   - **Description:** "Fairways Contact Approval Handler"
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
5. Click "Deploy"
6. Copy the Web App URL (you won't need to paste it anywhere, but save it for reference)
7. Click "Done"

**Important:** The "Anyone" access is safe because the script validates that users must be signed in to a Google account and only shows success/failure messages. No sensitive data is exposed.

### 8. Grant Permissions to the Spreadsheets

Make sure the Google account running the script has edit access to both spreadsheets:
- Form responses sheet: https://docs.google.com/spreadsheets/d/1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM/
- Master sheet: https://docs.google.com/spreadsheets/d/1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc/

## How It Works

### Workflow

1. **Form Submission**: User submits the Google Form
2. **Trigger Fires**: The `onFormSubmit` trigger detects the new submission
3. **Email Sent**: An email is sent to `fairwayscondos-administrator@googlegroups.com` with:
   - All form submission details
   - APPROVE button/link
   - REJECT button/link
4. **Administrator Action**:
   - Admin clicks APPROVE → Data is added to master sheet
   - Admin clicks REJECT → Request is marked as rejected
5. **Status Update**: The form responses sheet is updated with approval status, approver email, and timestamp

### Status Tracking

The script automatically adds three columns to your form responses sheet (if they don't exist):
- **Approval Status**: "Pending Approval", "Approved", or "Rejected"
- **Approved By**: Email address of the person who approved/rejected
- **Approval Timestamp**: Date and time of approval/rejection

## Testing

### Test Email Notification

To test that emails are working without submitting a real form:

1. In Apps Script editor, select the `testEmailNotification` function
2. Click "Run" (▶️)
3. Check the admin email inbox for a test notification

### Test Form Submission

1. Submit a test entry through your Google Form
2. Check that:
   - An email is received at fairwayscondos-administrator@googlegroups.com
   - The form responses sheet shows "Pending Approval" status
3. Click the APPROVE link in the email
4. Verify:
   - You see a success message
   - The form responses sheet shows "Approved" status
   - The data appears in the master sheet

## Troubleshooting

### Emails Not Sending

- Check execution logs: In Apps Script editor, click "Executions" (clock icon on left)
- Verify the admin email address is correct in CONFIG
- Check if the script has email sending permissions

### Trigger Not Firing

- Go to "Triggers" (clock icon) in Apps Script editor
- Verify there's a trigger for `onFormSubmit` on "Form submit" event
- If missing, run `setupTrigger()` again

### Approval Links Not Working

- Verify the web app is deployed with "Anyone" access
- Check that executeAs is set to "USER_DEPLOYING" in [appsscript.json](appsscript.json)
- Redeploy the web app if needed

### Can't Access Master Sheet

- Verify the script owner has edit access to the master sheet
- Check the `masterSheetId` in CONFIG is correct
- Look at execution logs for specific error messages

## Maintenance

### Updating the Code

1. Make changes to [Code.gs](Code.gs)
2. Push changes: `clasp push`
3. Test thoroughly before putting into production

### Viewing Logs

```bash
clasp logs
```

Or view in the Apps Script editor under "Executions"

## Configuration Options

You can customize the following in the `CONFIG` object in [Code.gs](Code.gs):

- `adminEmail`: Who receives approval requests
- `emailSubject`: Subject line of approval emails
- `statusColumnName`: Name of the status tracking column
- `approvedByColumnName`: Name of the approver tracking column
- `approvalTimestampColumnName`: Name of the timestamp column

## Security Notes

- The web app is deployed with "Anyone" access but requires Google sign-in
- Approval actions log the email address of the approver
- Form responses are only sent via email, not exposed publicly
- The script runs with the permissions of the deploying user

## Support

For issues or questions:
1. Check the execution logs in Apps Script
2. Review the troubleshooting section above
3. Test with the `testEmailNotification()` function
