public class SatisfactionSurveyLandingController {
	
	//The Case Id and Response Rating passed in as URL Parameters
	@TestVisible public String currentCaseId {get;set;}
	@TestVisible public String responseRating {get;set;}
	//Value that signifies whether the page has been loaded. Used in performing DML onload via an Action Function
	@TestVisible public Boolean initialised {get;set;}
	//Indicates that one or more of the parameters were invalid and a message should be displayed
	@TestVisible public Boolean invalidParam {get;set;}

	public SatisfactionSurveyLandingController(){
		currentCaseId = ApexPages.currentPage().getParameters().get('id');
		responseRating = ApexPages.currentPage().getParameters().get('rating');
		initialised = false;
		invalidParam = false;
	}

	public void recordSurveyResponse(){
		Set<String> ratingValues = new Set<String>();
		for(Schema.PicklistEntry rating: Case.Satisfaction_Rating__c.getDescribe().getPicklistValues()){
			ratingValues.add(rating.getLabel());
		}
		if(String.isNotBlank(currentCaseId) && currentCaseId.length() == 15 || currentCaseId.length() == 18){
			//The Case Id parameter was present and a valid length
			if([SELECT COUNT() FROM Case WHERE Id =: currentCaseId] == 1){
				//The Case Id is valid and belongs to a real Case in this Salesforce org
				if(String.isNotBlank(responseRating) && responseRating.length() == 1 && ratingValues.contains(responseRating)){
					//The Response Rating parameter was present, a valid length, and is a valid picklist value
					//We can successfully update the case, now
					Case currentCase = new Case(Id=currentCaseId, Satisfaction_Rating__c=responseRating);
					update currentCase;
				} else {
					//The Response Rating value was invalid
					invalidParam = true;
				}
			} else {
				//The Case Id value does not relate to a real Case in this Salesforce org
				invalidParam = true;
			}
		} else {
			//The Case Id parameter was invalid
			invalidParam = true;
		}
		initialised = true;
	}
}