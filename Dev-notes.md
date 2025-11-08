# Dev Notes

These are notes made during devvelopement and mean nothing.

## Test Deployment

Version 10 on Nov 8, 2025, 3:25 AM
Deployment ID
AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw
Web app
URL
https://script.google.com/macros/s/AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw/exec
Library
URL
https://script.google.com/macros/library/d/1zGmo8ag4KRrdAJzZU7rCvMUUOxqyTZVvcaqXYZmq9qa2BIar6B_EReS9/10


What was inserted
=HYPERLINK(CONCATENATE("<https://www.google.com/search?q=",F155,"+","G155,"+","H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE>))

You insserted this
=HYPERLINK(CONCATENATE("<https://www.google.com/search?q=",F155,"+","G155,"+","H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE>))
But it need to be like
=HYPERLINK(CONCATENATE("<https://www.google.com/search?q=",F155,"+",G155,"+",H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE>))

And make these the defaults assuming the values were not supplied from source and empty in destibation
Email Type-1 = "Home"
Newsletter = "Email"
Status = "Sold"
Entry Type = "Occupant"

=HYPERLINK(CONCATENATE("<https://www.google.com/search?q=",F155,"+",G155,"+",H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE>))
=HYPERLINK(CONCATENATE("<https://www.google.com/search?q=",F154,"+",G154,"+",H154,"+","OH","+43050"),VLOOKUP($A154,Reference!$Q$2:$AD,2,FALSE>))

Version 4 on Nov 7, 2025, 3:36 PM
Deployment ID
AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw

Web app
URL
<https://script.google.com/macros/s/AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw/exec>


66-09960.001	1 FAIRWAY DR, Mount Vernon, OH 43050	Owner	Stuller	Martha	1	FAIRWAY	DR	740-392-0464	740-392-0464	mlstuller@gmail.com	Home			Email		Sold	Map	Knox County Auditor	

> I see in the email,\
  Other Contact Information:\
  Old Value=(empty)\
  New Value=Please update cell number only.\
  \
  Can we update to the new value?\
  \
  And Unit Manager:\
  SELF    Self (So I guess all of SELF is Uppercase) This is just to stop confustion\
  \
  And \
  Address    1 FAIRWAY DR, Mount Vernon, OH 43050    1 FAIRWAY DR <-- We should actually update the sheet correctly when we add a row using\
  =HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F5,"+",G5,"+",H5,"+","OH","+43050"),VLOOKUP($A5,Reference!$Q$2:$AD,2,FALSE))\
  But it is confusing in the email.\
  \