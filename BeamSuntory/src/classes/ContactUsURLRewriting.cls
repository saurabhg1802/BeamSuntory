global with sharing class ContactUsURLRewriting implements Site.UrlRewriter {

    //Variables to represent the user-friendly URLs for
    //account and contact pages
    String ACCOUNT_PAGE = '/myaccount/';
    String CONTACT_PAGE = '/mycontact/';
    //Variables to represent my custom Visualforce pages
    //that display account and contact information
    String ACCOUNT_VISUALFORCE_PAGE = '/myaccount?id=';
    String CONTACT_VISUALFORCE_PAGE = '/mycontact?id=';

    global PageReference mapRequestUrl(PageReference
            myFriendlyUrl){
        String url = myFriendlyUrl.getUrl();

        if(url.startsWith(CONTACT_PAGE)){
            //Extract the name of the contact from the URL
            //For example: /mycontact/Ryan returns Ryan
            String name = url.substring(CONTACT_PAGE.length(),
                    url.length());

            //Select the ID of the contact that matches
            //the name from the URL
            Contact con = [SELECT Id FROM Contact WHERE Name =:
                    name LIMIT 1];

            //Construct a new page reference in the form
            //of my Visualforce page
            return new PageReference(CONTACT_VISUALFORCE_PAGE + con.id);
        }
        if(url.startsWith(ACCOUNT_PAGE)){
            //Extract the name of the account
            String name = url.substring(ACCOUNT_PAGE.length(),
                    url.length());

            //Query for the ID of an account with this name
            Account acc = [SELECT Id FROM Account WHERE Name =:name LIMIT 1];

           //Return a page in Visualforce format
            return new PageReference(ACCOUNT_VISUALFORCE_PAGE + acc.id);
        }
        //If the URL isn't in the form of a contact or
        //account page, continue with the request
        return null;
    }
    global List<PageReference> generateUrlFor(List<PageReference> 
            mySalesforceUrls){
        //A list of pages to return after all the links 
        //have been evaluated
        List<PageReference> myFriendlyUrls = new List<PageReference>();
        
        //a list of all the ids in the urls
        List<id> accIds = new List<id>();
        
        // loop through all the urls once, finding all the valid ids
        for(PageReference mySalesforceUrl : mySalesforceUrls){
        //Get the URL of the page
        String url = mySalesforceUrl.getUrl();
 
            //If this looks like an account page, transform it
            if(url.startsWith(ACCOUNT_VISUALFORCE_PAGE)){
                //Extract the ID from the query parameter
                //and store in a list
                //for querying later in bulk.
                        String id= url.substring(ACCOUNT_VISUALFORCE_PAGE.length(),
                        url.length());
                        accIds.add(id);
            }
        }

    // Get all the account names in bulk
    List <account> accounts = [SELECT Name FROM Account WHERE Id IN :accIds];

    // make the new urls
    Integer counter = 0;

    // it is important to go through all the urls again, so that the order
    // of the urls in the list is maintained. 
    for(PageReference mySalesforceUrl : mySalesforceUrls) {

       //Get the URL of the page
       String url = mySalesforceUrl.getUrl();

       if(url.startsWith(ACCOUNT_VISUALFORCE_PAGE)){
         myFriendlyUrls.add(new PageReference(ACCOUNT_PAGE + accounts.get(counter).name));
         counter++;
       } else {
         //If this doesn't start like an account page,
         //don't do any transformations
         myFriendlyUrls.add(new PageReference('www.beamsuntory.com/ContactUs'));
       }
    }
   	system.debug('&&' + mySalesforceUrls);
    //Return the full list of pages
    return myFriendlyUrls;
  }

}