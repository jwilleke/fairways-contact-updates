# Readme

When someone filles out the form that feeds into this sheet
https://docs.google.com/spreadsheets/d/1RpIyxcpdKETP5BCpc8K6znlhqg82cmACZKxdqnILqSM/edit?gid=873697025#gid=873697025

we wan to send an email to fairwayscondos-administrator@googlegroups.com
 With any new data and if any of them approve it

Update the appropiart filed in

this sheet.

https://docs.google.com/spreadsheets/d/1oygR4binYLEgk6ctm_wuxOfiGAHjepuw35SntwIIdcc/edit?gid=0#gid=0


I see Unterminated template literal error in Code.js locally\
  But google appsscript seems happy.\


I created Test Sheet (DONOTUSE-Shared-Fairways-Directory)
https://docs.google.com/spreadsheets/d/1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8/edit?gid=0#gid=0

Can we create a test function where a rown number fromt he spreadsheet is entered and we send the email but do not update DONOTUSE-Shared-Fairways-Directory
  So we do some tests.

And of course we will need a mapping table as some of the fileds do not match.\

And if the email address does not exist for that address make it stand out that we are adding an entry.\

   

Test Sheet (DONOTUSE-Shared-Fairways-Directory)
https://docs.google.com/spreadsheets/d/1zCbPbvP_hSS4ye02v8olIAYX3Rpbj1PTIPjuop4n0L8/edit?gid=0#gid=0

## Mapping table

| Contact Information - Responses |Shared-Fairways-Directory | Description |
| ---- | ---- | ---- 
| Unit Address | (concatenante ST # ST Name ST Type) |
| Phone number | Home Phone
| First Name | First Name
| Last Name | Last Name
| Business Phone | Business Phone
| Business Addresses | Business Addresses
| Manager | Unit Manager
| Occupant Email Address | Email-1 
| Occupancy First Date | Date Moved In
| Mailing Address | Mailing Address
| Other Phone Number | Cell Phone
| Emergency Contact Name | Emergency Contact Name
| Emergency Contact Phone | Emergency Contact Phone
| Emergency Contact Email | Emergency Contact Email
| Emergency Contact Relationship | Emergency Contact Relationship
| Emergency Contact Address | Emergency Contact ST Address
| Alternate Home Address | Alternate Home Address
| Alternate Home Phone | Alternate Home Phone
| Are you Working | Working?
| Do you have a Alternate Home | Alternate Home?
| Any other Contact Information | Other Contact Information

## Locating records

Each row in Shared-Fairways-Directory has a "Parcel" column. This is a unique ID for each unit.

Each "Parcel" may have more than one occupant or owner
Each "Parcel" MUST have the same "Address"

So we can locate all the occupnats for a unit by looking up the Address and locating the "Parcel"
We can Identity the proper personm by by Email-1 or First Name and  Last Name
If not found by Email-1 or First Name and  Last Name, assume it is a new row.
