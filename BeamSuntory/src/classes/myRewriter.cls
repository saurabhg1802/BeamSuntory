global with sharing class myRewriter implements Site.UrlRewriter {
    global PageReference mapRequestUrl(PageReference yourFriendlyUrl)
    {
        return null;
    }
    global PageReference[] generateUrlFor(PageReference[] yourSalesforceUrls)
    {
       List<PageReference> myFriendlyUrls = new List<PageReference>();
        //myFriendlyUrls.add('http://www.albertarye.com');
       return myFriendlyUrls;
    }
}