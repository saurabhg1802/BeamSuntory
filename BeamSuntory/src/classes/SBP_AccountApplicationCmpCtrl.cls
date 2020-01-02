public without sharing class SBP_AccountApplicationCmpCtrl {

	/**************************************************************************************************************
	Author:         Craig Austgen
	Company:        Slalom, LLC
	Description:	Checks to see if an application has already been submitted for this particular account
	Inputs:         accountId : Id of the account an application is being created for
				   	brand     : selected single barrel program brand
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getAccountStatus(String accountId, String brand) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		Boolean accountPendingApproval = false;
		Boolean accountApproved = false;

		try {
			Account acct = [select Id, ShippingState, BillingState from Account where Id = : Id.valueOf(accountId) limit 1];
			for (Account_Application__c acctApp : [select id, Status__c from Account_Application__c where Account__c = :acct.Id AND Brand__c = :brand]) {
				if (acctApp.Status__c == 'Pending Approval') {
					accountPendingApproval = true;
				}
				if (acctApp.Status__c == 'Approved') {
					accountApproved = true;
				}
			}

			responseMap.put('accountPendingApproval', accountPendingApproval);
			responseMap.put('accountApproved', accountApproved);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage() + ' \n ' + e.getStackTraceString();
			success = false;
		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}

	/**************************************************************************************************************
	Author:         Craig Austgen
	Company:        Slalom, LLC
	Description:	For certain programs users must be appoved before they can participate in the program.  This 
					method inserts the application they fill out which is sent to various people for approval via
					an approval process
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus insertAccountApplication(String questionMap, String jsonApplications) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		Account_Application__c app = new Account_Application__c();
		System.debug(jsonApplications);

		try {
			Account acct = [select id from Account where Name = 'Single Barrel International Account'];
			// build application
			List<Account_Application__c> applications = (List<Account_Application__c>)System.JSON.deserialize(jsonApplications, List<Account_Application__c>.Class);

			app = applications[0];

			app.Name = UserInfo.getName() + ' - ' + System.now();
			app.Status__c = 'New';
			app.Submitter__c = UserInfo.getUserId();
			if (app.Account__c == null) {
				app.Account__c = acct.Id;
				app.Account_Missing__c = true;
			}

			insert app;

			// create responses
			List<Application_Response__c> responses = (List<Application_Response__c>)System.JSON.deserialize(questionMap, List<Application_Response__c>.Class);
			for (Application_Response__c ar : responses) {
				ar.Account_Application__c = app.Id;
			}
			insert responses;

			// update account application to kick of approval process
			app.Status__c = 'Pending Approval';

			update app;

			responseMap.put('accountApplication', app);
			responseMap.put('questionMap', questionMap);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage() + ' \n ' + e.getStackTraceString();
			success = false;

		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}

	/**************************************************************************************************************
	Author:         Craig Austgen
	Company:        Slalom, LLC
	Description:	If the account has already completed an application then they will not have to answer
					the questions again, they will be pulled from the previous application and sent to
					the regional diplomat.
	Inputs:         accountId : Id of the account an application is being created for
				   	brand     : selected single barrel program brand
	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus sendRequestWithPreviousAnswers(String accountId, String brand) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		List<Application_Response__c> responses = new List<Application_Response__c>();

		try {

			List<Application_Question_Set__c> appQuestionSet = [select id, name, Brand__c from Application_Question_Set__c where Brand__c = :brand limit 1];

			Account_Application__c accountApplication = new Account_Application__c();
			accountApplication.Name = UserInfo.getName() + ' - ' + System.now();
			accountApplication.Account__c = Id.valueOf(accountId);
			accountApplication.Submitter__c = UserInfo.getUserId();
			accountApplication.Application_Question_Set__c = appQuestionSet[0].Id;
			accountApplication.Status__c = 'New';
			accountApplication.Brand__c = brand;
			insert accountApplication;

			for (Account_Application__c acctApp : [select id, Status__c, (Select Id, Answer_Text__c, Application_Question__c from Application_Responses__r) from Account_Application__c where Account__c = :Id.valueOf(accountId) AND Brand__c = :brand AND Status__c = 'Approved' limit 1]) {
				for (Application_Response__c appResponse : acctApp.Application_Responses__r) {
					Application_Response__c clonedResponse = appResponse.clone();
					clonedResponse.Account_Application__c = accountApplication.Id;
					responses.add(clonedResponse);
				}
			}

			insert responses;

			accountApplication.Status__c = 'Pending Approval';
			update accountApplication;

			responseMap.put('accountApplication', accountApplication);
			responseMap.put('responses', responses);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage() + ' \n ' + e.getStackTraceString();
			success = false;

		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}

	/**************************************************************************************************************
	Author:         Craig Austgen
	Company:        Slalom, LLC
	Description:	pulls in the application questions
	Inputs:         brand     : selected single barrel program brand

	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus getAccountApplicationData(String brand, Boolean isInternational) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		List<Application_Question_Set__c> appQuestionSet = new List<Application_Question_Set__c>();

		try {

			Map<String, List<String>> picklistValues = SBP_AccountInfoCmpCtrl.getSingleBarrelPicklistValues();

			if (isInternational && brand == 'Makers Mark') {
				appQuestionSet = [select id, name, Brand__c from Application_Question_Set__c where Name = 'Makers Mark International' limit 1];
			} else {
				appQuestionSet = [select id, name, Brand__c from Application_Question_Set__c where Brand__c = :brand limit 1];
			}
			List<Application_Question__c> appQuestions = [select Question__c, Application_Question_Set__c, Order__c, Type__c, (select id, Answer__c, Order__c from Application_Answers__r order by Order__c asc) from Application_Question__c where Application_Question_Set__c = :appQuestionSet[0].Id order by Order__c asc];

			responseMap.put('appQuestionSet', appQuestionSet);
			responseMap.put('appQuestions', appQuestions);
			responseMap.put('questionSetId', appQuestionSet[0].Id);
			responseMap.put('picklistValues', picklistValues);


		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getMessage());
			message = e.getMessage() + ' \n ' + e.getStackTraceString();
			success = false;

		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}

	/**************************************************************************************************************
	Author:         Craig Austgen
	Company:        Slalom, LLC
	Description:	checks to see whether or not the selected brand program is available
	Inputs:         brand     : selected single barrel program brand

	History
	<Date>      <Authors Name>     <Brief Description of Change>
	7/2018     	Craig Austgen       Initial Creation

	***************************************************************************************************************/
	@AuraEnabled
	public static LightningComponentUtility.RequestStatus isProgramAvailable(String brand) {
		Boolean success = true;
		String message = null;
		Map<String, Object> responseMap = new Map<String, Object>();
		Boolean isActiveProgram = true;

		try {
			List<Time_Interval__c> timeIntervals = [select id from Time_Interval__c where Brand__c = :brand and isActive__c = true and Application_Deadline__c > TODAY];
			if (timeIntervals.isEmpty()) {
				isActiveProgram = false;
			}

			responseMap.put('isActiveProgram', isActiveProgram);
		} catch (Exception e) {
			System.debug(LoggingLevel.INFO, e.getStackTraceString());
			message = e.getMessage() + ' \n ' + e.getStackTraceString();
			success = false;
		}

		LightningComponentUtility.RequestStatus requestStatus = new LightningComponentUtility.RequestStatus(success, message, responseMap);
		System.debug(LoggingLevel.INFO, requestStatus);
		return requestStatus;
	}
}