# Dev Notes

These are notes made during devvelopement and mean nothing.

## Test Deployment

What was inserted
=HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F155,"+","G155,"+","H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE))

You insserted this
=HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F155,"+","G155,"+","H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE))
But it need to be like
=HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F155,"+",G155,"+",H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE))

And make these the defaults assuming the values were not supplied from source and empty in destibation
Email Type-1 = "Home"
Newsletter = "Email"
Status = "Sold"
Entry Type = "Occupant"



=HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F155,"+",G155,"+",H155,"+","OH","+43050"),VLOOKUP($A155,Reference!$Q$2:$AD,2,FALSE))
=HYPERLINK(CONCATENATE("https://www.google.com/search?q=",F154,"+",G154,"+",H154,"+","OH","+43050"),VLOOKUP($A154,Reference!$Q$2:$AD,2,FALSE))


Version 4 on Nov 7, 2025, 3:36 PM
Deployment ID
AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw


Web app
URL
https://script.google.com/macros/s/AKfycbxecygdsg6UrQYrh8XPjUtB_LKxMx6s7yAWY1bR9vj0ITZNacBh9obYh1_Dj8GFXaXpGw/exec
