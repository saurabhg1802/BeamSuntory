/**************************************************************************************
Apex Class Name     : caseServices
Created Date        : 1/2016
Function            : Methods called from the caseTriggerhandler handlers
*************************************************************************************/

public class caseServices {
    
    public static string testDay;
    public static Integer thirdPartyExecutionCount = 0;
    //A cached stop status set that will not be re-queried if already populated
    public static Set<String> staticStopStatusSet = new Set<String>();
    public static Set<String> closedStatusSet = new Set<String>();
    // added to reduce recursion
    public static Boolean runTrigger = true;
    public static Boolean eskerEmailSent = false;
    public static Entitlement orderClaimEntitlement;
    
    public static Map <String, BusinessHours> businessHoursMap = new Map <String, BusinessHours>();
    public static Map<String, SlaProcess> slaProcessMap = new Map<String, SlaProcess>();
    
    public static Account defaultGBSAccount {
        get {
            if (defaultGBSAccount == null) {
                List<Account> accts = [select id from Account where name = :GBS_Constants.DEFAULT_ACCOUNT_NAME AND RecordTypeId = :GBS_Constants.vendorAccountRecordTypdId limit 1];
                if (!accts.isEmpty()) {
                    defaultGBSAccount = accts[0];
                }
            }
            return defaultGBSAccount;
        }
        set;
    }
    
    public static Map<String, BusinessHours> getBusinessHours() {
        if (businessHoursMap.isEmpty()) {
            for (BusinessHours bh : [select id, Name from BusinessHours]) {
                businessHoursMap.put(bh.Name, bh);
            }
        }
        return businessHoursMap;
    }
    
    /**************************************************************************************************************
Method name:    getSlaProcessMap
Object:         Entitlement Process(SlaProcess)
Date:           2/2018
Details and Notes:
Get map of all the Entitlement processes
***************************************************************************************************************/
    public static Map<String, SlaProcess> getSlaProcessMap() {
        
        if (slaProcessMap.isEmpty()) {
            for (SlaProcess sla : [select id, Name, IsVersionDefault, IsActive from SlaProcess where IsActive = true AND IsVersionDefault = true]) {
                slaProcessMap.put(sla.Name , sla);
            }
        }
        
        return slaProcessMap;
    }
    
    /**************************************************************************************************************
Method name:    calculateBusinessHoursAgesOnInsert
Object:         Case
Date:           1/2016
Details and Notes:
Modification of the Case Age in Business Hours app from Salesforce Labs; calculates Start and End Times
on Case Creation
***************************************************************************************************************/
    
    public static void calculateBusinessHoursAgesOnInsert(List<Case> cases) {
        
        //Pull the default business hours
        BusinessHours bh = [Select Id, TimeZoneSidKey, SundayStartTime, SundayEndTime, MondayStartTime, MondayEndTime, TuesdayStartTime, TuesdayEndTime, WednesdayStartTime, WednesdayEndTime, ThursdayStartTime, ThursdayEndTime, FridayStartTime, FridayEndTime, SaturdayStartTime, SaturdayEndTime From BusinessHours Where IsDefault = TRUE];
        Time BHStartTime;
        Time BHEndTime;
        
        for (Case updatedCase : cases) {
            updatedCase.Time_With_Customer__c = 0;
            updatedCase.Time_With_Support__c = 0;
            
            //Pull the timezone for the organization
            Timezone tz = Timezone.getTimeZone(bh.TimeZoneSidKey);
            
            //Pull the timezone for the current user
            String uTzId = UserInfo.getTimeZone().getID();
            Timezone tzU = Timezone.getTimeZone(uTzId);
            
            //Calculate the offset between organization's timezone and GMT
            Integer Offset = tz.getOffset(system.now());
            //Calculate the offset between current user's timezone and GMT
            Integer OffsetU = tzU.getOffset(system.now());
            
            //Calculate the offset between organization's and current user's timezones
            //Take ABS(A)-ABS(B); IF NEGATIVE, add the absolute value to formatted time; if POSITIVE, add the value (multiplied by -1)
            Integer tzDiff = math.abs(Offset / 3600000) - math.abs(OffsetU / 3600000);
            if (tzDiff < 1) {
                tzDiff = math.abs(tzDiff);
            } else {
                tzDiff = tzDiff * -1;
            }
            
            //Get next business day
            DateTime todaysDateGMT = system.now();
            DateTime nextStartDateGMT = BusinessHours.nextStartDate(bh.Id, todaysDateGMT);
            DateTime nextStartDate = nextStartDateGMT.addHours(Offset / 3600000);
            
            string day;
            
            if (Test.isRunningTest()) {
                day = testDay;
            } else {
                day = ((nextStartDateGMT).addHours(tzDiff)).format('u');
            }
            
            //Pull the business hours for the next business day
            if (day == '1') {
                BHStartTime = bh.MondayStartTime;
                BHEndTime = bh.MondayEndTime;
            } else if (day == '2') {
                BHStartTime = bh.TuesdayStartTime;
                BHEndTime = bh.TuesdayEndTime;
            } else if (day == '3') {
                BHStartTime = bh.WednesdayStartTime;
                BHEndTime = bh.WednesdayEndTime;
            } else if (day == '4') {
                BHStartTime = bh.ThursdayStartTime;
                BHEndTime = bh.ThursdayEndTime;
            } else if (day == '5') {
                BHStartTime = bh.FridayStartTime;
                BHEndTime = bh.FridayEndTime;
            } else if (day == '6') {
                BHStartTime = bh.SaturdayStartTime;
                BHEndTime = bh.SaturdayEndTime;
            } else {
                BHStartTime = bh.SundayStartTime;
                BHEndTime = bh.SundayEndTime;
            }
            
            if (BHStartTime != null && BHEndTime != null) {
                
                //Build SLA Start and End Times in GMT
                DateTime SLAStartTime = DateTime.newInstanceGMT(nextStartDateGMT.year(), nextStartDateGMT.month(), nextStartDateGMT.day(), BHStartTime.hour(), BHStartTime.minute(), 0);
                DateTime SLAEndTime = DateTime.newInstanceGMT(nextStartDateGMT.year(), nextStartDateGMT.month(), nextStartDateGMT.day(), BHEndTime.hour(), BHEndTime.minute(), 0);
                
                //Build SLA Start and End Times in organization's default timezone
                DateTime SLAStartTimeGMT = SLAStartTime.addHours(math.abs(Offset / 3600000));
                DateTime SLAEndTimeGMT = SLAEndTime.addHours(math.abs(Offset / 3600000));
                
                //Set the Case's SLA Start and End Times
                updatedCase.SLA_Start_Time__c = SLAStartTimeGMT;
                updatedCase.SLA_End_Time__c = SLAEndTimeGMT;
                
                if (system.now() < SLAStartTimeGMT) {
                    updatedCase.Last_Status_Change__c = SLAStartTimeGMT;
                } else {
                    updatedCase.Last_Status_Change__c = system.now();
                }
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    calculateBusinessHoursAgesOnUpdate
Object:         Case
Date:           1/2016
Details and Notes:
Modification of the Case Age in Business Hours app from Salesforce Labs; calculates Start and End Times
on Case Update (end of business day); update SLA clocks on status update.
***************************************************************************************************************/
    
    public static void calculateBusinessHoursAgesOnUpdate(List<Case> cases, Map<Id, Case> oldCases) {
        
        //Get the stop statuses
        Set<String> stopStatusSet = new Set<String>();
        for (Stop_Status__c stopStatus : [Select Name From Stop_Status__c]) {
            stopStatusSet.add(stopStatus.Name);
        }
        
        //Get the default business hours
        BusinessHours defaultHours = [select Id from BusinessHours where IsDefault = true];
        
        //Get the closed statuses
        if (closedStatusSet.isEmpty()) {
            for (CaseStatus status : [Select MasterLabel From CaseStatus where IsClosed = true]) {
                closedStatusSet.add(status.MasterLabel);
            }
        }
        
        //At close of business each night, update the case with the next business day's SLA Start and End Times
        for (Case updatedCase : cases) {
            
            Case oldCase = oldCases.get(updatedCase.Id);
            
            //Is it the end of the business day?
            if (updatedCase.Update_SLA_Times__c == TRUE) {
                
                //Is the case still open?
                if (!oldCase.IsClosed) {
                    
                    //On the off-chance that the business hours on the case are null, use the default ones instead
                    Id hoursToUse = updatedCase.BusinessHoursId != null ? updatedCase.BusinessHoursId : defaultHours.Id;
                    
                    if (updatedCase.SLA_Start_Time__c != null && updatedCase.SLA_End_Time__c != null) {
                        
                        //Find the time in business hours between last status change and tonight's close of business
                        Double timeSinceLastStatus = BusinessHours.diff(hoursToUse, updatedCase.Last_Status_Change__c, updatedCase.SLA_End_Time__c) / 3600000.0;
                        
                        //We decide which clock to add the time to depending on current case status
                        if (stopStatusSet.contains(oldCase.Status)) {
                            updatedCase.Time_With_Customer__c += timeSinceLastStatus;
                        } else {
                            updatedCase.Time_With_Support__c += timeSinceLastStatus;
                        }
                        
                        if (closedStatusSet.contains(updatedCase.Status)) {
                            updatedCase.Case_Age_In_Business_Hours__c = updatedCase.Time_With_Customer__c + updatedCase.Time_With_Support__c;
                        }
                    }
                }
                
                //Pull the default business hours
                BusinessHours bh = [Select Id, TimeZoneSidKey, SundayStartTime, SundayEndTime, MondayStartTime, MondayEndTime, TuesdayStartTime, TuesdayEndTime, WednesdayStartTime, WednesdayEndTime, ThursdayStartTime, ThursdayEndTime, FridayStartTime, FridayEndTime, SaturdayStartTime, SaturdayEndTime From BusinessHours Where IsDefault = TRUE];
                Time BHStartTime;
                Time BHEndTime;
                
                //Pull the timezone for the organization
                Timezone tz = Timezone.getTimeZone(bh.TimeZoneSidKey);
                
                //Pull the timezone for the current user
                String uTzId = UserInfo.getTimeZone().getID();
                Timezone tzU = Timezone.getTimeZone(uTzId);
                
                //Calculate the offset between organization's timezone and GMT
                Integer Offset = tz.getOffset(system.now());
                //Calculate the offset between current user's timezone and GMT
                Integer OffsetU = tzU.getOffset(system.now());
                
                //Calculate the offset between organization's and current user's timezones
                //Take ABS(A)-ABS(B); IF NEGATIVE, add the absolute value to formatted time; if POSITIVE, add the value (multiplied by -1)
                Integer tzDiff = math.abs(Offset / 3600000) - math.abs(OffsetU / 3600000);
                if (tzDiff < 1) {
                    tzDiff = math.abs(tzDiff);
                } else {
                    tzDiff = tzDiff * -1;
                }
                
                //Get next business day
                DateTime todaysDateGMT = system.now();
                DateTime nextStartDateGMT = BusinessHours.nextStartDate(bh.Id, todaysDateGMT);
                DateTime nextStartDate = nextStartDateGMT.addHours(Offset / 3600000);
                
                string day;
                
                if (Test.isRunningTest()) {
                    day = testDay;
                } else {
                    day = ((nextStartDateGMT).addHours(tzDiff)).format('u');
                }
                
                //Pull the business hours for the next business day
                if (day == '1') {
                    BHStartTime = bh.MondayStartTime;
                    BHEndTime = bh.MondayEndTime;
                } else if (day == '2') {
                    BHStartTime = bh.TuesdayStartTime;
                    BHEndTime = bh.TuesdayEndTime;
                } else if (day == '3') {
                    BHStartTime = bh.WednesdayStartTime;
                    BHEndTime = bh.WednesdayEndTime;
                } else if (day == '4') {
                    BHStartTime = bh.ThursdayStartTime;
                    BHEndTime = bh.ThursdayEndTime;
                } else if (day == '5') {
                    BHStartTime = bh.FridayStartTime;
                    BHEndTime = bh.FridayEndTime;
                } else if (day == '6') {
                    BHStartTime = bh.SaturdayStartTime;
                    BHEndTime = bh.SaturdayEndTime;
                } else {
                    BHStartTime = bh.SundayStartTime;
                    BHEndTime = bh.SundayEndTime;
                }
                
                if (BHStartTime != null && BHEndTime != null) {
                    
                    //Build SLA Start and End Times in GMT
                    DateTime SLAStartTime = DateTime.newInstanceGMT(nextStartDateGMT.year(), nextStartDateGMT.month(), nextStartDateGMT.day(), BHStartTime.hour(), BHStartTime.minute(), 0);
                    DateTime SLAEndTime = DateTime.newInstanceGMT(nextStartDateGMT.year(), nextStartDateGMT.month(), nextStartDateGMT.day(), BHEndTime.hour(), BHEndTime.minute(), 0);
                    
                    //Build SLA Start and End Times in organization's default timezone
                    DateTime SLAStartTimeGMT = SLAStartTime.addHours(math.abs(Offset / 3600000));
                    DateTime SLAEndTimeGMT = SLAEndTime.addHours(math.abs(Offset / 3600000));
                    
                    //Set the Case's SLA Start and End Times
                    updatedCase.SLA_Start_Time__c = SLAStartTimeGMT;
                    updatedCase.SLA_End_Time__c = SLAEndTimeGMT;
                    
                    //Set the Case's Last Status Change to the next business day's start time
                    updatedCase.Last_Status_Change__c = SLAStartTimeGMT;
                }
            }
        }
        
        //Whenever there is a status change, update the Case's SLA clocks
        for (Case updatedCase : cases) {
            Case oldCase = oldCases.get(updatedCase.Id);
            
            if (oldCase.Status != updatedCase.Status && updatedCase.Last_Status_Change__c != null) {
                if (!oldCase.IsClosed) {
                    
                    //On the off-chance that the business hours on the case are null, use the default ones instead
                    Id hoursToUse = updatedCase.BusinessHoursId != null ? updatedCase.BusinessHoursId : defaultHours.Id;
                    
                    //Find the time in business hours between last status change and tonight's close of business
                    Double timeSinceLastStatus = BusinessHours.diff(hoursToUse, updatedCase.Last_Status_Change__c, System.now()) / 3600000.0;
                    
                    //We decide which clock to add the time to depending on current case status
                    if (stopStatusSet.contains(oldCase.Status)) {
                        updatedCase.Time_With_Customer__c += timeSinceLastStatus;
                    } else {
                        updatedCase.Time_With_Support__c += timeSinceLastStatus;
                    }
                    
                    if (closedStatusSet.contains(updatedCase.Status)) {
                        updatedCase.Case_Age_In_Business_Hours__c = updatedCase.Time_With_Customer__c + updatedCase.Time_With_Support__c;
                    }
                }
                
                //Set the Case's Last Status Change Date to right now (the time of status change)
                if (system.now() >= updatedCase.SLA_Start_Time__c && system.now() <= updatedCase.SLA_End_Time__c) {
                    updatedCase.Last_Status_Change__c = system.now();
                }
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    setCaseValues
Object:         Case
Date:           4/2016
Details and Notes:
Sets the Case submitter's email to which workflow notifications should be delivered. Also set the case
lanuage
***************************************************************************************************************/
    public static void setCaseValues(List<Case> cases) {
        Set<Id> contactIds = new Set<Id>();
        Map<Id, User> contactIdToUser = new Map<Id, User>();
        
        for (Case c : cases) {
            if (c.ContactId != null) {
                contactIds.add(c.ContactId);
            }
        }
        
        if (!contactIds.isEmpty()) {
            for (User u : [select id, ContactId, Email, LanguageLocaleKey from User where ContactId IN :contactIds]) {
                contactIdToUser.put(u.ContactId, u);
            }
        }
        
        for (Case c : cases) {
            // set case Email
            if (String.isBlank(c.Automated_Notification_Email__c)) {
                if (c.SuppliedEmail != null) {
                    c.Automated_Notification_Email__c = c.SuppliedEmail;
                } else if (c.ContactId == null) {
                    c.Automated_Notification_Email__c = UserInfo.getUserEmail();
                    c.SuppliedEmail = UserInfo.getUserEmail();
                } else {
                    if (contactIdToUser.containsKey(c.ContactId)) {
                        if (String.isNotBlank(contactIdToUser.get(c.ContactId).Email)) {
                            c.Automated_Notification_Email__c = contactIdToUser.get(c.ContactId).Email;
                            c.SuppliedEmail = contactIdToUser.get(c.ContactId).Email;
                        }
                        
                    }
                }
            }
            // set case language
            if (String.isBlank(c.Case_Language__c)) {
                if (c.ContactId == null) {
                    c.Case_Language__c = UserInfo.getLocale();
                } else {
                    if (contactIdToUser.containsKey(c.ContactId)) {
                        c.Case_Language__c = contactIdToUser.get(c.ContactId).LanguageLocaleKey;
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    updateNumTimesIn3rdParty
Object:         Case
Date:           3/2017
Details and Notes:
When Status is changed to any of the 3rd Party statuses, a counter on the Case will be increased
***************************************************************************************************************/
    public static void updateNumTimesIn3rdParty(List<Case> newCases, Map<Id, Case> oldMap) {
        Set<Id> nullCases = new Set<Id>();
        Map<Id, List<CaseHistory>> caseHistoryMap = new Map<Id, List<CaseHistory>>();
        if (staticStopStatusSet.isEmpty()) {
            List<Stop_Status__c> stopStatusList = [SELECT Name FROM Stop_Status__c];
            for (Stop_Status__c stopStatus : stopStatusList) {
                staticStopStatusSet.add(stopStatus.Name);
            }
        }
        for (Case currCase : newCases) {
            if (currCase.Number_of_Times_in_3rd_Party__c == null) {
                nullCases.add(currCase.Id);
            }
        }
        if (nullCases.size() > 0) {
            List<CaseHistory> relatedCaseHistory = [SELECT Id, CaseId, Field, OldValue, NewValue FROM CaseHistory WHERE CaseId IN: nullCases AND (Field = 'Status')];
            for (CaseHistory historyValue : relatedCaseHistory) {
                if (!caseHistoryMap.containsKey(historyValue.CaseId)) {
                    caseHistoryMap.put(historyValue.CaseId, new List<CaseHistory>());
                }
                caseHistoryMap.get(historyValue.CaseId).add(historyValue);
            }
        }
        for (Case currCase : newCases) {
            if (caseHistoryMap.containsKey(currCase.Id)) {
                Integer statusCounter = 0;
                for (CaseHistory historyValue : caseHistoryMap.get(currCase.Id)) {
                    if (!staticStopStatusSet.contains((String) historyValue.OldValue) && staticStopStatusSet.contains((String) historyValue.NewValue)) {
                        statusCounter++;
                    }
                }
                currCase.Number_of_Times_in_3rd_Party__c = statusCounter;
            }
            if (currCase.Number_of_Times_in_3rd_Party__c == null) {
                currCase.Number_of_Times_in_3rd_Party__c = 0;
            }
            if (oldMap.get(currCase.Id).Status != currCase.Status && !staticStopStatusSet.contains(oldMap.get(currCase.Id).Status) && staticStopStatusSet.contains(currCase.Status) && thirdPartyExecutionCount == 0) {
                currCase.Number_of_Times_in_3rd_Party__c = currCase.Number_of_Times_in_3rd_Party__c + 1;
                thirdPartyExecutionCount++;
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    updateCaseTypeAndReassign
Object:         Case
Date:           3/2017
Details and Notes:
- When Record Type changes, Assignment Rules will be re-evaluated.
- Case Type will be changed accordingly
- Runs after update
***************************************************************************************************************/
    public static void updateCaseTypeAndReassign(List<Case> newCases, Map<Id, Case> oldMap) {
        Set<Id> changedRTCaseIds = new Set<Id>();
        Set<Id> rtIdSet = new Set<Id>();
        Set<Id> businessProcessIdSet = new Set<Id>();
        Map<Id, String> rtIdBusinessProcessMap = new Map<Id, String>();
        if (closedStatusSet.isEmpty()) {
            for (CaseStatus status : [Select MasterLabel From CaseStatus where IsClosed = true]) {
                closedStatusSet.add(status.MasterLabel);
            }
        }
        
        for (Case currCase : newCases) {
            if (oldMap.get(currCase.Id).RecordTypeId != currCase.RecordTypeId) {
                changedRTCaseIds.add(currCase.Id);
                rtIdSet.add(currCase.RecordTypeId);
            }
        }
        if (!rtIdSet.isEmpty()) {
            List<RecordType> caseRecordTypes = [SELECT Id, Name, BusinessProcessId FROM RecordType WHERE Id IN: rtIdSet];
            List<AssignmentRule> caseAssignment = [SELECT Id, Name FROM AssignmentRule WHERE SobjectType = 'Case' AND Name = 'Case Transfer Rules' LIMIT 1];
            if (caseAssignment.size() > 0) {
                for (RecordType rt : caseRecordTypes) {
                    businessProcessIdSet.add(rt.BusinessProcessId);
                }
                Map<Id, BusinessProcess> businessProcessMap = new Map<Id, BusinessProcess>([SELECT Id, Name FROM BusinessProcess WHERE Id IN: businessProcessIdSet]);
                for (RecordType rt : caseRecordTypes) {
                    rtIdBusinessProcessMap.put(rt.Id, businessProcessMap.get(rt.BusinessProcessId).Name);
                }
                
                
                Database.DMLOptions dmlOpts = new Database.DMLOptions();
                dmlOpts.assignmentRuleHeader.assignmentRuleId = caseAssignment[0].Id;
                
                Map<String, String> businessProcessTypeMap = new Map<String, String>();
                for (CaseTypeForDept__c val : CaseTypeForDept__c.getAll().values()) {
                    businessProcessTypeMap.put(val.Business_Process_Name__c, val.Default_Type__c);
                }
                
                List<Case> updatedCaseList = [SELECT Id, Status, RecordType.Name, BSI_Function__c FROM Case WHERE Id IN: changedRTCaseIds AND BSI_Function__c = 'GBS'];
                for (Case c : updatedCaseList) {
                    if (businessProcessTypeMap.containsKey(rtIdBusinessProcessMap.get(c.RecordTypeId))) {
                        c.Type = businessProcessTypeMap.get(rtIdBusinessProcessMap.get(c.RecordTypeId));
                    }
                    if (!closedStatusSet.contains(c.Status)) {
                        c.Status = 'Logged';
                    }
                    c.setOptions(dmlOpts);
                }
                update updatedCaseList;
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    updateFlagsOnStatusChange
Object:         Case
Date:           3/2017
Details and Notes:
When Status changes in specific ways, "New Activity" is checked or unchecked
- Any Status --> Closed         = Flag Off
- Any Closed --> Open           = Flag On
- Any Status --> Stop Status    = Flag Off
***************************************************************************************************************/
    public static void updateFlagsOnStatusChange(List<Case> newCases, Map<Id, Case> oldMap) {
        
        if (staticStopStatusSet.isEmpty()) {
            List<Stop_Status__c> stopStatusList = [SELECT Name FROM Stop_Status__c];
            for (Stop_Status__c stopStatus : stopStatusList) {
                staticStopStatusSet.add(stopStatus.Name);
            }
        }
        
        if (closedStatusSet.isEmpty()) {
            for (CaseStatus status : [Select MasterLabel From CaseStatus where IsClosed = true]) {
                closedStatusSet.add(status.MasterLabel);
            }
        }
        
        for (Case currCase : newCases) {
            if (oldMap.get(currCase.Id).Status != currCase.Status) {
                //Any Status --> Closed
                if (!closedStatusSet.contains(oldMap.get(currCase.Id).Status) && closedStatusSet.contains(currCase.Status)) {
                    currCase.New_Activity__c = false;
                }
                //Any Closed --> Open
                else if (closedStatusSet.contains(oldMap.get(currCase.Id).Status) && !closedStatusSet.contains(currCase.Status)) {
                    currCase.New_Activity__c = true;
                }
                //Any Non-Stop-Status to Stop-Status
                else if (!staticStopStatusSet.contains(oldMap.get(currCase.Id).Status) && staticStopStatusSet.contains(currCase.Status)) {
                    currCase.New_Activity__c = false;
                }
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    removeAbandonedCases
Object:         Case
Date:           4/2017
Details and Notes:
When a case's status changes to "Closed - Abandoned", it should be deleted
***************************************************************************************************************/
    public static void removeAbandonedCases(List<Case> newCases, Map<Id, Case> oldMap) {
        List<Id> casesToDelete = new List<Id>();
        
        for (Case currCase : newCases) {
            if (oldMap.get(currCase.Id).Status != currCase.Status) {
                if (currCase.Status == 'Closed - Abandoned') {
                    casesToDelete.add(currCase.Id);
                }
            }
        }
        
        try {
            Database.delete([SELECT Id FROM Case WHERE Id IN: casesToDelete AND BSI_Function__c = 'GBS'], false);
        } catch (Exception e) {
            System.debug('Insufficient Privilege Error: ' + e.getMessage());
        }
    }
    
    /**************************************************************************************************************
Method name:    syncSelfRegistrationOwnership
Object:         Case
Date:           4/2017
Details and Notes:
As part of the Registration Approval Operating Procedure, the user taking the Case must also take Ownership
of the related Contact. This method automatically assigns the Contact to the user that picks up the Case
***************************************************************************************************************/
    
    public static void syncSelfRegistrationOwnership(List<Case> newCases, Map<Id, Case> oldMap) {
        Id registrationApprovalCaseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Registration Approval').getRecordTypeId();
        //Id: ContactId, Id: new OwnerId
        List<Contact> changedContacts = new List<Contact>();
        for (Case currCase : newCases) {
            //Confirm that this is an Update, not an Insert (The Case already exists)
            if (oldMap.containsKey(currCase.Id) && currCase.RecordTypeId == registrationApprovalCaseRecordTypeId) {
                //Determine whether or not the owner is a User without having to query User.Type
                if (((String) currCase.OwnerId).startsWith('005')) {
                    //Owner has changed and we know it's a user. Therefore, assign to the Contact, if it exists
                    if (oldMap.get(currCase.Id).OwnerId != currCase.OwnerId && currCase.ContactId != null) {
                        changedContacts.add(new Contact(Id = currCase.ContactId, OwnerId = currCase.OwnerId));
                    }
                }
            }
        }
        if (!changedContacts.isEmpty()) {
            update changedContacts;
        }
    }
    
    @InvocableMethod(label = 'Send "Cannot be Reopened" email' description = 'Sends an email to the sender of the "REOPEN" email, stating that the case could not be reopened')
    public static void sendEmail(List<Id> emailIdList) {
        String CASE_REF_FORMAT = 'ref:{0}.{1}:ref';
        String orgId = UserInfo.getOrganizationId().substring(0, 15);
        String shortenedOrgId = '';
        Pattern orgPattern = Pattern.compile('^([A-Za-z0-9]{5})([A-Za-z0-9]*)$');
        Pattern casePattern = Pattern.compile('^([A-Za-z0-9]{5})([A-Za-z0-9]*)([A-Za-z0-9]{5})$');
        Matcher orgMatcher = orgPattern.matcher(orgId);
        if (orgMatcher.matches()) {
            shortenedOrgId = '_' + orgMatcher.group(1) + orgMatcher.group(2).replace('0', '');
        }
        
        Map<Id, String> caseSenderAddressMap = new Map<Id, String>();
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        EmailTemplate template = [SELECT Id, Subject, HtmlValue, Body FROM EmailTemplate WHERE DeveloperName = 'Case_Unable_to_Reopen_Template' LIMIT 1];
        List<EmailMessage> emailMessages = [SELECT Id, ParentId, FromAddress FROM EmailMessage WHERE Id IN :emailIdList];
        for (EmailMessage em : emailMessages) {
            if (((String) em.ParentId).startsWith('500')) {
                caseSenderAddressMap.put(em.ParentId, em.FromAddress);
            }
        }
        List<Case> parentCases = [SELECT Id, CaseNumber, Subject, Submitter_First_Name__c FROM Case WHERE Id IN :caseSenderAddressMap.keySet()];
        for (Case parentCase : parentCases) {
            String caseId = ((String) parentCase.Id).substring(0, 15);
            String shortenedCaseId = '';
            Matcher caseMatcher = casePattern.matcher(caseId);
            if (caseMatcher.matches()) {
                shortenedCaseId = '_' + caseMatcher.group(1) + caseMatcher.group(2).replace('0', '') + caseMatcher.group(3);
            }
            String caseThreadId = '';
            if (String.isNotBlank(shortenedCaseId) && String.isNotBlank(shortenedOrgId)) {
                caseThreadId = String.format(CASE_REF_FORMAT, new List<String> {shortenedOrgId, shortenedCaseId});
            }
            
            String subject = template.Subject;
            subject = subject.replace('{!Case.CaseNumber}', parentCase.CaseNumber);
            subject = subject.replace('{!Case.Subject}', parentCase.Subject);
            
            String htmlBody = template.HtmlValue;
            htmlBody = htmlBody.replace('{!Case.Submitter_First_Name__c}', parentCase.Submitter_First_Name__c);
            htmlBody = htmlBody.replace('{!Case.CaseNumber}', parentCase.CaseNumber);
            htmlBody = htmlBody.replace('{!Case.Id}', parentCase.Id);
            htmlBody = htmlBody.replace('{!$Label.Base_Company_Community_URL}', System.Label.Base_Company_Community_URL);
            htmlBody = htmlBody.replace('{!Case.Thread_Id}', caseThreadId);
            
            String plainBody = template.Body;
            plainBody = plainBody.replace('{!Case.Submitter_First_Name__c}', parentCase.Submitter_First_Name__c);
            plainBody = plainBody.replace('{!Case.CaseNumber}', parentCase.CaseNumber);
            plainBody = plainBody.replace('{!Case.Id}', parentCase.Id);
            plainBody = plainBody.replace('{!$Label.Base_Company_Community_URL}', System.Label.Base_Company_Community_URL);
            plainBody = plainBody.replace('{!Case.Thread_Id}', caseThreadId);
            
            Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
            email.setToAddresses(new List<String> {caseSenderAddressMap.get(parentCase.Id)});
            email.setSenderDisplayName('gbs@beamsuntory.com');
            email.setTargetObjectId(UserInfo.getUserId());
            email.setTreatTargetObjectAsRecipient(false);
            email.setSaveAsActivity(false);
            email.setSubject(subject);
            email.setHtmlBody(htmlBody);
            email.setPlainTextBody(plainBody);
            emails.add(email);
            Messaging.reserveSingleEmailCapacity(emails.size());
            Messaging.sendEmail(emails);
        }
    }
    
    /**************************************************************************************************************
Description:     For Order Claims, multiple sub cases will be related to one parent case.  Once all the sub cases are closed a flag
on the parent case will be updated to reflect that all sub cases have been closed.

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateParentCase(List<Case> cases, Map<Id, Case> oldCases) {
        Set<Id> parentIds = new Set<Id>();
        Map<Id, Case> casesToUpdateMap = new Map<Id, Case>();
        List<Case> subCasesClosed = new List<Case>();
        
        for (Case c : cases) {
            if (oldCases != null) {
                Case oldCase = oldcases.get(c.Id);
                if (c.Status != oldCase.Status) {
                    if (c.ParentId != null && (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID || c.RecordTypeId == CSConstants.LOGISTICS_REQUEST_RT_ID
                                               || (c.RecordTypeId == CSConstants.QC_SUBCASE_RT_ID)) && CSConstants.CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                                                   parentIds.add(c.ParentId);
                                               }
                }
            }
        }
        
        if (parentIds.isEmpty()) {
            return;
        }
        
        // pull parent case alang with child cases
        for (Case c : [select Id, Parent.All_Sub_Cases_Closed__c, AccountId, RecordTypeId, SLA_Start__c, EntitlementId, ParentId, Status, (select id, Status from Cases) from Case where Id IN : parentIds]) {
            Boolean allSubCasesAreClosed = true;
            for (Case subCase : c.Cases) {
                
                if (!CSConstants.CLOSED_STATUS_VARIATIONS.contains(subCase.Status)) {
                    allSubCasesAreClosed = false;
                    break;
                }
            }
            
            if (allSubCasesAreClosed) {
                c.All_Sub_Cases_Closed__c = true;
                subCasesClosed.add(c);
            } else {
                c.All_Sub_Cases_Closed__c = false;
            }
            casesToUpdateMap.put(c.Id, c);
        }
        
        if (!subCasesClosed.isEmpty()) {
            addEntitlementToQualityClaimParentCase(subCasesClosed);
        }
        
        if (!casesToUpdateMap.isEmpty()) {
            try {
                update casesToUpdateMap.values();
            } catch (Exception e) {
                String errorMessage = 'Error updating cases ' + e.getMessage() + '\n' + e.getStackTraceString();
                CreateExceptionLog.insertErrorLog('caseServices', 'updateParentCase', String.valueOf(errorMessage), 'Fatal');
                
                // throw so that we can detect issues before deploying
                if (Test.isRunningTest()) {
                    throw new CS_CustomException(e.getMessage());
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Assigns business hours to a case based on the field Product_Destination_Country__c if the record type is Order Claim
And Assigns business hours to a case based on the field Shipping_Plant__c if the record type is Order Claim Sub Case.
The data mapping the country and shipping plant to business hours is store in Custom Metadata.
The business hours drive the Entitlement Process for each Case

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void assignBusinessHoursToCase(List<Case> cases) {
        
        Map<String, CS_Country_Setting__mdt> countryNameToSettingGTR = new Map<String, CS_Country_Setting__mdt>();
        Map<String, CS_Country_Setting__mdt> countryNameToSetting = new Map<String, CS_Country_Setting__mdt>();
        Map<String, CS_Plant_Setting__mdt> plantNameToSetting = new Map<String, CS_Plant_Setting__mdt>();
        
        List<Case> parentCases = new List<Case>();
        List<Case> childCases = new List<Case>();
        
        Map<String, BusinessHours> businessHoursMap = getBusinessHours();
        
        // query custom metatdata for country to business hours
        for (CS_Country_Setting__mdt countrySetting : [Select id, Business_Hours__c, Country__c, isGTR__c, Region__c  from CS_Country_Setting__mdt]) {
            if (countrySetting.isGTR__c) {
                countryNameToSettingGTR.put(countrySetting.Country__c, countrySetting);
            } else {
                countryNameToSetting.put(countrySetting.Country__c, countrySetting);
            }
        }
        
        for (CS_Plant_Setting__mdt plantSetting : [Select id, Plant__c, Country__r.Business_Hours__c, Country__r.Country__c, Country__r.isGTR__c, Country__r.Region__c, External_Third_Party_Plant__c from CS_Plant_Setting__mdt]) {
            plantNameToSetting.put(plantSetting.Plant__c, plantSetting);
        }
        
        // filter out record types
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID) {
                parentCases.add(c);
            } else if (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID) {
                childCases.add(c);
            }
        }
        
        // loop through parent cases
        for (Case c : parentCases) {
            String businessHoursName;
            if (c.Is_GTR_Distributor__c) {
                if (countryNameToSettingGTR.containsKey(c.Product_Destination_Country__c)) {
                    businessHoursName = countryNameToSettingGTR.get(c.Product_Destination_Country__c).Business_Hours__c;
                    // get business hours based on country name
                    if (businessHoursMap.containsKey(businessHoursName)) {
                        c.BusinessHoursId = businessHoursMap.get(businessHoursName).Id;
                    }
                }
            } else if (countryNameToSetting.containsKey(c.Product_Destination_Country__c)) {
                
                // there are certain countries that default to US business hours
                if (CSConstants.COUNTRIES_USING_US_BUSINESS_HOURS.contains(c.Product_Destination_Country__c)) {
                    if (businessHoursMap.containsKey(CSConstants.US_PRODUCT_DESTINATION_COUNTRY_VALUE)) {
                        c.BusinessHoursId = businessHoursMap.get(CSConstants.US_PRODUCT_DESTINATION_COUNTRY_VALUE).Id;
                    }
                } else {
                    businessHoursName = countryNameToSetting.get(c.Product_Destination_Country__c).Business_Hours__c;
                    // get business hours based on country name
                    if (businessHoursMap.containsKey(businessHoursName)) {
                        c.BusinessHoursId = businessHoursMap.get(businessHoursName).Id;
                    }
                }
            }
        }
        
        // loop through child cases
        for (Case c : childCases) {
            if (plantNameToSetting.containsKey(c.Shipping_Plant__c)) {
                String businessHoursName = plantNameToSetting.get(c.Shipping_Plant__c).Country__r.Business_Hours__c;
                if (businessHoursMap.containsKey(businessHoursName)) {
                    c.BusinessHoursId = businessHoursMap.get(businessHoursName).Id;
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Assigns the Entitlement associated with the account on the case record to the case, if there is no entitlement
then one will be created for that account and assigned to the case record

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void addEntitlementToCase(List<Case> cases) {
        Set<Id> accountIds = new Set<Id>();
        Map<Id, Map<String, Entitlement>> accountIdToEntitlementMap = new Map<Id, Map<String, Entitlement>>();
        
        for (Case c : cases) {
            if ((CSConstants.orderClaimRecordTypeIds.contains(c.RecordTypeId)) && !CSConstants.CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                // check for AccountId on Case
                if (c.AccountId != null && c.EntitlementId == null) {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        //accountIdToEntitlementMap = getEntitlementsFromAccount(accountIds, CSConstants.ORDER_CLAIMS_ENTITLEMENT, CSConstants.ORDER_CLAIMS_ENTITLEMENT_PROCESS);
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), CSConstants.ORDER_CLAIMS_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, CSConstants.ORDER_CLAIMS_ENTITLEMENT, CSConstants.ORDER_CLAIMS_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID || c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID) {
                if (c.EntitlementId == null) {
                    if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                        c.SLA_Start__c = System.now();
                        c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(CSConstants.ORDER_CLAIMS_ENTITLEMENT).Id;
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    addEntitlementToSingleBarrelCase
Object:         Case
RecordType:
Date:           7/2018
Details and Notes:
Assigns the Entitlement associated with the account on the case record to the case, if there is no entitlement
then one will be created for that account and assigned to the case record
***************************************************************************************************************/
    public static void addEntitlementToSingleBarrelCase(List<Case> cases) {
        Set<Id> accountIds = new Set<Id>();
        Map<Id, Map<String, Entitlement>> accountIdToEntitlementMap = new Map<Id, Map<String, Entitlement>>();
        
        for (Case c : cases) {
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId)) {
                // check for AccountId on Case
                if (c.AccountId != null && c.EntitlementId == null) {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        // get the entitlements tied to the account
        //accountIdToEntitlementMap = getEntitlementsFromAccount(accountIds, SBP_Constants.SINGLE_BARREL_ENTITLEMENT, SBP_Constants.SINGLE_BARREL_ENTITLEMENT_PROCESS);
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), SBP_Constants.SINGLE_BARREL_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, SBP_Constants.SINGLE_BARREL_ENTITLEMENT, SBP_Constants.SINGLE_BARREL_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        for (Case c : cases) {
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId)) {
                if (c.EntitlementId == null) {
                    if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                        c.SLA_Start__c = System.now();
                        c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(SBP_Constants.SINGLE_BARREL_ENTITLEMENT).Id;
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Checks whether a case was changed from a closed variation status to anything else

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void checkIfCaseWasReopened(List<Case> cases, Map<Id, Case> oldMap) {
        Entitlement caseReOpenEntitlement = new Entitlement();
        Map<Id, Case> casesToUpdateMap = new Map<Id, Case>();
        Set<Id> parentIds = new Set<Id>();
        
        Group subCaseDefaultQueue = [select id, DeveloperName from Group where Type = 'Queue' AND DeveloperName = 'Order_Claim_Sub_Case_Queue'];
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.Status != oldCase.Status && c.ParentId == null) {
                
                if (CSConstants.CLOSED_STATUS_VARIATIONS.contains(oldCase.Status) && !CSConstants.CLOSED_STATUS_VARIATIONS.contains(c.Status) &&
                    (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID || c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID)) {
                        
                        parentIds.add(c.Id);
                    }
            }
        }
        
        if (parentIds.isEmpty()) {
            return;
        }
        
        // reopen child cases if the parent record is reopened
        for (Case c : [select id
                       , Status
                       , isReOpened__c
                       , SLA_Start__c
                       , All_Sub_Cases_Closed__c
                       , RecordTypeId,
                       (Select id
                        , Financial_Disposition__c
                        , Return_SAP_Number__c
                        , ParentId
                        , OwnerId
                        , Assign_Queue_to_Case__c
                        , Status from Cases)
                       from Case where Id IN :parentIds]) {
                           c.isReOpened__c = true;
                           // once the case is reopened the entitlement will restart
                           c.SLA_Start__c = null;
                           c.All_Sub_Cases_Closed__c = false;
                           casesToUpdateMap.put(c.Id, c);
                           
                           
                           for (Case childCase : c.Cases) {
                               childCase.isReOpened__c = true;
                               childCase.Status = CSConstants.NEW_STATUS;
                               childCase.SLA_Start__c = null;
                               childCase.OwnerId = subCaseDefaultQueue.Id;
                               childCase.Assign_Queue_to_Case__c = false;
                               casesToUpdateMap.put(childCase.Id, childCase);
                           }
                       }
        
        if (!casesToUpdateMap.isEmpty()) {
            try {
                update casesToUpdateMap.values();
            } catch (Exception e) {
                String errorMessage = 'Error updating cases ' + e.getMessage() + '\n' + e.getStackTraceString();
                CreateExceptionLog.insertErrorLog('caseServices', 'checkIfCaseWasReopened', String.valueOf(errorMessage), 'Fatal');
                // throw so that we can detect issues before deploying
                if (Test.isRunningTest()) {
                    throw new CS_CustomException(e.getMessage());
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Checks if an account record has any entitlments attached to it and returns the map of entitlements

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static Map < Id, Account > getEntitlementsFromAccount(List < Account > accts, String nameOfEntitlement) {
        Map < Id, Account > defaultEntitlementForAccount = new Map < Id, Account > ();
        Map < Id, Account > allAccounts = new Map < Id, Account > ();
        
        for (Account acct : accts) {
            allAccounts.put(acct.Id, acct);
            if (acct.Entitlements.isEmpty()) {
                // create both entitlements for this account
                defaultEntitlementForAccount.put(acct.Id, acct);
            } else {
                defaultEntitlementForAccount.put(acct.Id, acct);
                for (Entitlement em : acct.Entitlements) {
                    
                    if (em.Name == nameOfEntitlement) {
                        // removed the entitlement because it already exists for this account
                        defaultEntitlementForAccount.remove(acct.Id);
                    }
                }
            }
        }
        
        return defaultEntitlementForAccount;
    }
    
    public static Map <Id, Map <String, Entitlement>> mapAccountToEntitlements(Set <Id> acctIds) {
        Map <Id, Map <String, Entitlement>> accountIdToEntitlements = new Map <Id, Map <String, Entitlement>>();
        
        for (Account acct : [select id, (Select Id, Name from Entitlements) from Account where Id IN: acctIds]) {
            Map <String, Entitlement> entitlementMap = new Map <String, Entitlement>();
            for (Entitlement em : acct.Entitlements) {
                entitlementMap.put(em.Name, em);
            }
            accountIdToEntitlements.put(acct.Id, entitlementMap);
        }
        
        return accountIdToEntitlements;
    }
    
    /**************************************************************************************************************
Description:    Creates default entitlement for accounts that don't have the default entitlement

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void createEntitlementsForAccount(Map<Id, Account> defaultEntitlementMap, Map<Id, Account> allAccounts, String nameOfEntitlement, String nameOfEntitlementProcess ) {
        Map<String, SlaProcess> allSlaProcessesMap = getSlaProcessMap();
        List<Entitlement> entitlementsToInsert = new List<Entitlement>();
        // create default entitlement
        for (Account acct : allAccounts.values()) {
            
            if (defaultEntitlementMap.containsKey(acct.Id)) {
                Entitlement entitlement = new Entitlement();
                
                entitlement.Name = nameOfEntitlement;
                entitlement.AccountId = acct.Id;
                entitlement.SlaProcessId = allSlaProcessesMap.get(nameOfEntitlementProcess).Id;
                entitlement.StartDate = Date.today();
                entitlementsToInsert.add(entitlement);
            }
        }
        if (!entitlementsToInsert.isEmpty()) {
            insert entitlementsToInsert;
        }
    }
    
    /**************************************************************************************************************
Description:    Once a case of record type order claim(parent case) has be set to expedited then the
child cases need to also be set to expedited this will trigger a new milestone to be attached to all cases

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void setChildCaseToExpeditedOrderClaim(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> parentCaseIds = new Set<Id>();
        Map<Id, Case> casesToUpdate = new Map<Id, Case>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (oldCase.Expedited_Claim__c == false && c.Expedited_Claim__c) {
                if (c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID && c.ParentId == null) {
                    parentCaseIds.add(c.Id);
                }
            }
        }
        
        if (parentCaseIds.isEmpty()) {
            return;
        }
        
        for (Case c : [select id, Expedited_Claim__c from Case where ParentId IN :parentCaseIds ]) {
            c.Expedited_Claim__c = true;
            casesToUpdate.put(c.Id, c);
        }
        
        if (!casesToUpdate.isEmpty()) {
            update casesToUpdate.values();
        }
    }
    
    /**************************************************************************************************************
Description:    Once cases of record type order claim sub case(sub case) are created, they need to be hidden from the plant users until
the parent case has been prepared properly by a coordinator.  In order to achieve this sub cases have a default owner
of "Order CLaim Sub Case Queue" which is set by a workflow.  Once the parent case moves the status to "Pending Sub-Case"
a field is updated "Assign_Queue_to_Case__c" which triggers the case assignment rules to assign the case to the correct
queue which gives the plant users access to it.

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void setChildCasesToBePickedUpByAssignmentRules(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> parentCaseIds = new Set<Id>();
        Map<Id, Case> casesToUpdate = new Map<Id, Case>();
        
        for (Case c : cases) {
            
            Case oldCase = oldMap.get(c.Id);
            
            if (c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID
                && c.ParentId == null
                && c.Status == CSConstants.PENDING_SUB_CASE
                && oldCase.Status != CSConstants.PENDING_SUB_CASE) {
                    parentCaseIds.add(c.Id);
                }
        }
        
        if (parentCaseIds.isEmpty()) {
            return;
        }
        
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;
        
        // get all child cases from parent cases
        for (Case c : [select id, Assign_Queue_to_Case__c from Case where ParentId IN : parentCaseIds]) {
            c.Assign_Queue_to_Case__c = true;
            c.SLA_Start__c = null;
            casesToUpdate.put(c.Id, c);
        }
        
        // update all child cases
        if (!casesToUpdate.isEmpty()) {
            Database.update(casesToUpdate.values(), dmo);
        }
    }
    
    /**************************************************************************************************************
Description:    before a case of record type order claim can be closed all of it child cases must be closed
AND have "Financial_Disposition__c" and "Return_SAP_Number__c" filled in.  However if the
child case status is "Closed - Rejected" then it is ignored.  This method updates a field to
indicate that the child fields are missing and that triggers a validation rule to fire and be visible to the user.

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void checkRequiredFieldsOnChildForClosingParentCase(List<Case> cases, Map<Id, Case> oldMap) {
        
        Set<Id> parentIds = new Set<Id>();
        Map<Id, Case> casesToUpdate = new Map<Id, Case>();
        // get parent ids
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID && c.ParentId != null && CSConstants.CLOSED_STATUS_VARIATIONS.contains(c.Status) ||
                ((oldCase.Financial_Disposition__c == null && c.Financial_Disposition__c != null) || (oldCase.Return_SAP_Number__c == null && c.Return_SAP_Number__c != null) || (oldCase.Billing_SAP_Number__c == null && c.Billing_SAP_Number__c != null))) {
                    parentIds.add(c.ParentId);
                }
        }
        
        if (parentIds.isEmpty()) {
            return;
        }
        
        // check all child records
        for (Case c : [select id, Child_case_fields_missing__c, Billing_SAP_number_missing__c, Return_SAP_number_missing__c,  (Select id, Financial_Disposition__c, Return_SAP_Number__c, Billing_SAP_Number__c, Type, ParentId, Status from Cases) from Case where Id IN :parentIds]) {
            Boolean childBillingFieldsMissing = false;
            Boolean childReturnFieldsMissing = false;
            for (Case subCase : c.Cases) {
                
                // if the status is "closed - rejected" Or Claim type is Freight Claim or State Code Claim then it does not need to be validated by the parent case
                if (subCase.Status != CSConstants.DUP_NO_ACTION && subCase.Status != CSConstants.CLOSED_REJECTED && subCase.Type != 'Freight Claim' && subCase.Type != 'State Code Claim') {
                    // if claim type is Shortage claim or Damage claim
                    // then return sap number is required
                    if ((subCase.Type == 'Damage Claim' || subCase.Type == 'Shortage Claim') && subCase.Return_SAP_Number__c == null) {
                        childReturnFieldsMissing = true;
                    }
                    
                    // if overage or mis shipment claim
                    // then billing sap number and financial disposition are required
                    if ((subCase.Type == 'Mis-Shipment Claim' || subCase.Type == 'Overage Claim') && (subCase.Financial_Disposition__c == null || subCase.Billing_SAP_Number__c == null)) {
                        childBillingFieldsMissing = true;
                    }
                }
            }
            
            if (childReturnFieldsMissing) {
                c.Return_SAP_number_missing__c = true;
            } else {
                c.Return_SAP_number_missing__c = false;
            }
            
            if (childBillingFieldsMissing) {
                c.Billing_SAP_number_missing__c = true;
            } else {
                c.Billing_SAP_number_missing__c = false;
            }
            
            casesToUpdate.put(c.Id, c);
        }
        
        if (!casesToUpdate.isEmpty()) {
            update casesToUpdate.values();
        }
    }
    
    /**************************************************************************************************************
Description:    This method updates a custom object that stores identical data from the standard CaseMilestone object.
Once the case is closed then the custom object will be updated to reflect the most recent data.

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateClonedCaseMilestoneOnCaseClosed(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> caseIds = new Set<Id>();
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.Status != oldCase.Status) {
                // only pull in statuses that have moved to the closed status from any other non closed status
                if (!CSConstants.CLOSED_STATUS_VARIATIONS.contains(oldCase.Status) && CSConstants.CLOSED_STATUS_VARIATIONS.contains(c.Status) &&
                    (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID || c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID)) {
                        caseIds.add(c.Id);
                    }
            }
        }
        
        if (caseIds.isEmpty()) {
            return;
        }
        
        // get milestones related to cases
        List<CaseMilestone> caseMilestones = EntitlementsServices.getCaseMilestoneByCaseId(caseIds);
        
        // created/update the Cloned Milestone records
        List<Cloned_Milestone__c> clonedMilestones = ClonedMilestone.buildAndUpdateClonedMilestones(caseMilestones);
        
        if (!clonedMilestones.isEmpty()) {
            upsert clonedMilestones;
        }
    }
    
    /**************************************************************************************************************
Description:    Order Claims and Quality Claims will require an Account so that an Entitlement can be added to the case.

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void setDefaultAccountForCSClaims(List<Case> cases) {
        Account defaultAccount = new Account();
        Set<Id> acceptedRecordTypeIds = new Set<Id>();
        
        acceptedRecordTypeIds.addAll(CSConstants.orderClaimRecordTypeIds);
        acceptedRecordTypeIds.addAll(CSConstants.qualityClaimRecordTypeIds);
        
        List<Account> accts = [select Id, RecordTypeId, Name
                               from Account
                               where Name = :CSConstants.DEFAULT_ACCOUNT_NAME
                               AND RecordTypeId = :CSConstants.DEFAULT_ACCOUNT_RT_ID limit 1];
        
        User u = [select Id, ContactId from User where Id = : UserInfo.getUserId() limit 1];
        
        if (Test.isRunningTest()) {
            Account a = new Account();
            a.Name = CSConstants.DEFAULT_ACCOUNT_NAME;
            a.RecordTypeId = CSConstants.DEFAULT_ACCOUNT_RT_ID;
            insert a;
            defaultAccount = a;
        } else {
            if(!accts.isEmpty()) defaultAccount = accts[0];
        }
        
        for (Case c : cases) {
            if (acceptedRecordTypeIds.contains(c.RecordTypeId)) {
                if (u.ContactId == null) {
                    if (c.AccountId == null) {
                        c.AccountId = defaultAccount.Id;
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    A milestone can be closed manually in the ui, but in case the user forgets, this method will complete the milestone
for them once it matches specific criteria that moves it to the next milestone

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void markPreparePlantMilestoneAsCompleted(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> caseIds = new Set<Id>();
        List<CaseMilestone> caseMilestonesToUpdate = new List<CaseMilestone>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID  && (c.Status == CSConstants.PENDING_SUB_CASE && (oldCase.Status == CSConstants.NEW_STATUS || oldCase.Status == 'Working'))) {
                caseIds.add(c.Id);
            }
        }
        
        if (caseIds.isEmpty()) {
            return;
        }
        
        // find the case milestone attached to the case of the correct milestone type
        for (CaseMilestone caseMilestone : [select id, IsCompleted, MilestoneType.Name from CaseMilestone where CaseId IN :caseIds]) {
            if (CSConstants.PREPARE_FOR_PLANT_MILESTONES.contains(caseMilestone.MilestoneType.Name)) {
                caseMilestone.CompletionDate = System.now();
                caseMilestonesToUpdate.add(caseMilestone);
            }
        }
        
        if (!caseMilestonesToUpdate.isEmpty()) {
            Database.update(caseMilestonesToUpdate, false);
        }
    }
    
    /* Logic for GreatVines process to create a new case for the Sales Order */
    
    public static void CreateCaseFromSalesOrder(List<gvp__Sales_Order__c> salesOrders, Map<Id, gvp__Sales_Order__c> oldOrders ) {
        List <case> casesToCreate = new List <case>();
        List <Group> lstGroup = [SELECT Id, Name, DeveloperName FROM Group where Type = 'Queue' and Name = 'Mexico'];
        Map <id, id> checkExistingCases = getCaseForSalesOrders(salesOrders);
        Set<String> checkDup = new Set<String>();
        
        for (gvp__Sales_Order__c order : salesOrders) {
            system.debug(salesOrders);
            system.debug(order.gvp__ERP_Id__c);
            system.debug(checkExistingCases);
            if (order.gvp__ERP_Id__c != null && checkExistingCases.get(order.id) == null) {
                
                case theCase = new case ();
                theCase.AccountId    = order.gvp__Account__c;
                theCase.recordtypeID = Schema.SObjectType.case.getRecordTypeInfosByName().get('Orders').getRecordTypeId();
                theCase.Claim_Description__c = 'Related to sales order: ' + order.id;
                theCase.Subject =  'Order - ' +  order.id;
                theCase.sales_Order__c  = order.id;
                theCase.type = 'Standard';
                theCase.OwnerID = lstGroup.get(0).Id;
                if (order.gvp__Sold_To__c != null) {
                    theCase.ContactId = order.gvp__Sold_To__c;
                }
                if (!checkDup.contains(order.id)) {
                    System.debug(casesToCreate);
                    casesToCreate.add(theCase);
                    checkDup.add(order.id);
                }
            }
        }
        try {
            insert casesToCreate;
        } catch (Exception e) {
            System.debug('Error creating a case ' + e.getMessage());
            CreateExceptionLog.insertErrorLog('caseServices', 'CreateCaseFromSalesOrder', String.valueOf(e), 'Fatal');
            // throw so that we can detect issues before deploying
            if (Test.isRunningTest()) {
                throw new CS_CustomException(e.getMessage());
            }
        }
    }
    
    
    public  static Map <Id, Id> getCaseForSalesOrders(List<gvp__Sales_Order__c> salesOrders) {
        Map<Id, gvp__Sales_Order__c> mSalesOrders = new Map<Id, gvp__Sales_Order__c>(salesOrders);
        List<Case> lstCases =  [select id, sales_Order__c from Case where sales_Order__c in: mSalesOrders.keySet()];
        
        Map <Id, Id> mapSalesOrderToCase = new Map<Id, Id>();
        for (case theCase : lstCases) {
            mapSalesOrderToCase.put(theCase.sales_Order__c, theCase.id);
        }
        
        return mapSalesOrderToCase;
    }
    
    /**************************************************************************************************************
Description:    When a case moves from any status to "Dup - No Action" , the case milestones attached to the case should be removed
because the case is no longer actionable

History
<Date>      <Authors Name>     <Brief Description of Change>
2/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void removeSLAFromCase(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> parentIds = new Set<Id>();
        Map<Id, Case> casesToUpdate = new Map<Id, Case>();
        
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.ORDER_CLAIM_SUBCASE_RT_ID && c.Status == CSConstants.DUP_NO_ACTION) {
                parentIds.add(c.ParentId);
            } else if (c.RecordTypeId == CSConstants.ORDER_CLAIM_RT_ID && c.Status == CSConstants.DUP_NO_ACTION) {
                parentIds.add(c.Id);
            }
        }
        
        if (parentIds.isEmpty()) {
            return;
        }
        
        // get parent and child ids
        for (Case c : [select id, Status, EntitlementId, (Select id, Status, EntitlementId from Cases) from Case where Id IN :parentIds]) {
            c.EntitlementId = null;
            c.Status = CSConstants.DUP_NO_ACTION;
            c.SlaStartDate = null;
            casesToUpdate.put(c.Id, c);
            for (Case subCase : c.Cases) {
                subCase.Status = CSConstants.DUP_NO_ACTION;
                subCase.EntitlementId = null;
                subCase.SlaStartDate = null;
                casesToUpdate.put(subCase.Id, subCase);
            }
        }
        
        if (!casesToUpdate.isEmpty()) {
            update casesToUpdate.values();
        }
        
        // remove any cloned milestones related to the cases so they do not show up in reports
        delete [select id from Cloned_Milestone__c where Case__c IN :casesToUpdate.keySet()];
    }
    
    /**************************************************************************************************************
Description:    Moves the status of a single barrel order once all items have been completed/uploaded

History
<Date>      <Authors Name>     <Brief Description of Change>
6/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void moveSingleBarrelCaseStatus(List<Case> cases) {
        Set<Id> caseIdsToUpdate = new Set<Id>();
        Map<Id, Case> casesToUpdateMap = new Map<Id, Case>();
        Set<Id> caseIds = new Set<Id>();
        Map<Id, Barrel__c> barrelsToUpdate = new Map<Id, Barrel__c>();
        
        for (Case c : cases) {
            if (c.RecordTypeId == SBP_Constants.SINGLE_BARREL_STANDARD_RT_ID) {
                if (c.Barrel_selected__c &&
                    c.Purchase_Order_Uploaded__c && c.Bottle_Text_Entered__c &&
                    c.POS_Items_Selected__c &&
                    (c.Status == SBP_Constants.PENDING_DOCUMENTATION) &&
                    String.isNotBlank(c.SAP_Number__c)) {
                        c.Status = SBP_Constants.PREPARING_BARREL;
                        caseIds.add(c.Id);
                    }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    auto completes milestones for the single barrel program

History
<Date>      <Authors Name>     <Brief Description of Change>
6/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void markSingleBarrelMilestonesAsComplete(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> caseIds = new Set<Id>();
        List<CaseMilestone> caseMilestonesToUpdate = new List<CaseMilestone>();
        Map<Id, List<String>> caseIdToMilestoneNames = new Map<Id, List<String>>();
        
        for (Case c : cases) {
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId)) {
                Case oldCase = oldMap.get(c.Id);
                if (c.POS_Items_Selected__c && !oldCase.POS_Items_Selected__c) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.POS_ITEM_MILESTONE );
                }
                // complete preparing barrel milestone
                if (c.Barrel_selected__c && !oldCase.Barrel_selected__c) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.SELECT_BARREL_MILESTONE );
                }
                
                if (c.Type == 'Sample Kit' && c.Barrel_selected__c && !oldCase.Barrel_selected__c) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.SELECT_SAMPLE_MILESTONE );
                }
                // complete enter bottle text milestone
                if (c.Bottle_Text_Entered__c && !oldCase.Bottle_Text_Entered__c) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.ENTER_BOTTLE_TEXT_MILESTONE );
                }
                // complete upload PO milestone
                if (c.Purchase_Order_Uploaded__c && !oldCase.Purchase_Order_Uploaded__c) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.UPLOAD_PO_MILESTONE );
                }
                // complete Enter SAP Number milestone
                if (String.isNotBlank(c.SAP_Number__c) && String.isBlank(oldCase.SAP_Number__c)) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.ENTER_SAP_NUMBER_MILESTONE );
                }
                // complete enter barrel detail milestone for makers mark
                // once status moves from preparing barrel => pending purchase order then complete the milestone
                if (c.Status == SBP_Constants.PENDING_PURCHASE_ORDER && oldCase.Status == SBP_Constants.PREPARING_BARREL) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.ENTER_BARREL_DETAIL_MILESTONE );
                }
                
                if (c.Trip_Scheduled__c && !oldCase.Trip_Scheduled__c) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, SBP_Constants.SCHEDULE_TRIP_MILESTONE );
                }
            }
        }
        
        // find the case milestone attached to the case of the correct milestone type
        for (CaseMilestone caseMilestone : [select id, IsCompleted, MilestoneType.Name, CaseId from CaseMilestone where CaseId IN :caseIdToMilestoneNames.keySet()]) {
            if (caseIdToMilestoneNames.containsKey(caseMilestone.CaseId)) {
                for (String milestoneName : caseIdToMilestoneNames.get(caseMilestone.CaseId)) {
                    if (milestoneName == caseMilestone.MilestoneType.Name) {
                        caseMilestone.CompletionDate = System.now();
                        caseMilestonesToUpdate.add(caseMilestone);
                    }
                }
            }
        }
        
        if (!caseMilestonesToUpdate.isEmpty()) {
            Database.update(caseMilestonesToUpdate, false);
        }
    }
    
    public static Map<Id, List<String>> addMilestoneToMap(Id caseId, Map<Id, List<String>> milestoneMap, String milestoneName) {
        if (milestoneMap.containsKey(caseId)) {
            milestoneMap.get(caseId).add(milestoneName);
        } else {
            milestoneMap.put(caseId, new List<String> {milestoneName});
        }
        
        return milestoneMap;
    }
    
    /**************************************************************************************************************
Description:    If the Submitter field is missing then it needs to be updated for emails that go out for the
Single Barrel Program

History
<Date>      <Authors Name>     <Brief Description of Change>
6/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateCaseSubmitterForSingleBarrelCases(List<Case> cases) {
        
        for (Case c : cases) {
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId) && c.Submitter__c == null) {
                c.Submitter__c = Userinfo.getUserId();
            }
        }
    }
    
    /**************************************************************************************************************
Description:    A regional diplomat should exist for the brand Makers Mark for the Single Barrel Program
The regional diplomat field is used in an apporval process for a Remote Selection.

History
<Date>      <Authors Name>     <Brief Description of Change>
6/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateRegionalDiplomat(List<Case> cases) {
        Set<Id> accountIds = new Set<Id>();
        List<String> accountStates = new List<String>();
        Map<Id, Account> accountMap = new Map<Id, Account>();
        Map<String, User> stateToUserMap = new Map<String, User>();
        String accountStatesString;
        
        for (Case c : cases) {
            if (c.Regional_Diplomat__c == null && SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId) && c.Brand__c == 'Makers Mark') {
                // if there is no account found in salesforce then the Account Name field will be populated
                // will need to add missing account's state to list
                if (c.Retail_Account__c != null && String.isBlank(c.Retail_Account_Name__c)) {
                    accountIds.add(c.Retail_Account__c);
                } else if (String.isNotBlank(c.Retail_Account_Name__c) && String.isNotBlank(c.State__c)) {
                    accountStates.add(c.State__c);
                }
            }
        }
        
        for (Account acc : [select id, BillingState, ShippingState from Account where Id IN :accountIds]) {
            if (String.isNotBlank(acc.BillingState)) {
                accountMap.put(acc.Id, acc);
                accountStates.add(SBP_Constants.stateMap.get(acc.BillingState));
            }
        }
        
        accountStatesString = String.join(accountStates, ',');
        if (!accountStates.isEmpty()) {
            for (User u : [select id, Regional_Diplomat_Regions__c from User where Regional_Diplomat_Regions__c includes ( :accountStatesString)]) {
                List<String> userStates = u.Regional_Diplomat_Regions__c.Split(';');
                for (String s : userStates) {
                    stateToUserMap.put(s, u);
                }
            }
        }
        
        for (Case c : cases) {
            String state;
            
            if (c.Retail_Account__c != null && String.isBlank(c.Retail_Account_Name__c)) {
                if (accountMap.containsKey(c.Retail_Account__c)) {
                    String fullStateName = accountMap.get(c.Retail_Account__c).BillingState;
                    state = SBP_Constants.stateMap.get(fullStateName);
                }
            } else if (String.isNotBlank(c.Retail_Account_Name__c) && String.isNotBlank(c.State__c)) {
                state = SBP_Constants.stateMap.get(c.State__c);
            }
            if (stateToUserMap.containsKey(state)) {
                c.Regional_Diplomat__c = stateToUserMap.get(state).Id;
            }
            
        }
    }
    
    /**************************************************************************************************************
Description:    Once the SAP number is entered then the expected ship date for a barrel should be automatically updated
to give the plant an idea of when the barrel is expected to ship.

History
<Date>      <Authors Name>     <Brief Description of Change>
6/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateBarrelExpectedShipDate(List<Case> cases, Map<Id, Case> oldMap) {
        List<Barrel__c> barrels = new List<Barrel__c>();
        Set<Id> caseIds = new Set<Id>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId) && (String.isBlank(oldCase.SAP_Number__c) && String.isNotBlank(c.SAP_Number__c))) {
                caseIds.add(c.Id);
            }
        }
        
        if (caseIds.isEmpty()) {
            return;
        }
        
        for (Barrel__c barrel : [select id, Expected_Ship_Date__c, RecordTypeId from Barrel__c where Case__c IN :caseIds]) {
            if (SBP_Constants.clermontBarrelRtIds.contains(barrel.RecordTypeId)) {
                barrel.Expected_Ship_Date__c = Date.today().addDays(84);
                barrels.add(barrel);
            }
        }
        
        if (!barrels.isEmpty()) {
            try {
                update barrels;
            } catch (Exception e) {
                String errorMessage = 'Error updating barrels ' + e.getMessage() + '\n' + e.getStackTraceString();
                CreateExceptionLog.insertErrorLog('caseServices', 'updateBarrelExpectedShipDate', String.valueOf(errorMessage), 'Fatal');
                // throw so that we can detect issues before deploying
                if (Test.isRunningTest()) {
                    throw new CS_CustomException(e.getMessage());
                }
            }
        }
    }
    
    
    /**************************************************************************************************************
Description:    Once an event is assigned to a case then a field is updated which triggers a milestone to end

History
<Date>      <Authors Name>     <Brief Description of Change>
6/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void tripHasBeenScheduled(List<Case> cases, Map<Id, Case> oldMap) {
        List<Barrel__c> barrels = new List<Barrel__c>();
        Set<Id> caseIds = new Set<Id>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId) && (oldCase.Plant_Event__c == null && c.Plant_Event__c != null)) {
                c.Trip_Scheduled__c = true;
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Once the purchase order is updated then the status should be updated

History
<Date>      <Authors Name>     <Brief Description of Change>
7/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void singleBarrelPurchaseOrderUploaded(List<Case> cases, Map<Id, Case> oldMap) {
        List<Barrel__c> barrels = new List<Barrel__c>();
        Set<Id> caseIds = new Set<Id>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.RecordTypeId == SBP_Constants.SINGLE_BARREL_PROOF_SPECIFIC_RT_ID && (!oldCase.Purchase_Order_Uploaded__c && c.Purchase_Order_Uploaded__c)) {
                c.Status = SBP_Constants.PENDING_SHIP_DATE;
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Once the SAP number is entered for the barrel orders they will be sent out to the Sales Rep,
Distributor Contact and any additional people that are listed in the ccEmail field

History
<Date>      <Authors Name>     <Brief Description of Change>
7/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void emailInitialSAPNumberEntered(List<Case> cases, Map<Id, Case> oldMap) {
        EmailTemplate template = [SELECT Id, Subject, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE DeveloperName = :SBP_Constants.SAP_NUMBER_ENTERED_EMAIL_TEMPLATE_NAME limit 1];
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId)) {
                if (String.isBlank(oldCase.SAP_Number__c) && String.isNotBlank(c.SAP_Number__c)) {
                    List<String> emailsToSendTo = new List<String>();
                    // add submitter email(Sales Rep)
                    if (String.isNotBlank(oldMap.get(c.Id).Submitter__r.Email)) {
                        emailsToSendTo.add(oldMap.get(c.Id).Submitter__r.Email);
                    }
                    // add contact email
                    if (String.isNotBlank(oldMap.get(c.Id).Contact.Email)) {
                        emailsToSendTo.add(oldMap.get(c.Id).Contact.Email);
                    }
                    
                    if (String.isNotBlank(oldMap.get(c.Id).CcEmail__c)) {
                        String ccEmails = oldMap.get(c.Id).CcEmail__c;
                        List<String> emailAddresses = ccEmails.split(';');
                        emailsToSendTo.addAll(emailAddresses);
                    }
                    if (oldMap.get(c.Id).Submitter__c != null) {
                        //Messaging.SingleEmailMessage singleMail = new Messaging.SingleEmailMessage();
                        Messaging.SingleEmailMessage singleMail = Messaging.renderStoredEmailTemplate(template.Id, oldMap.get(c.Id).Submitter__c, c.Id);
                        singleMail.setToAddresses(emailsToSendTo);
                        singleMail.setTargetObjectId(oldMap.get(c.Id).Submitter__c);
                        singleMail.setTemplateId(template.Id);
                        singleMail.setWhatId(c.Id);
                        singleMail.setSaveAsActivity(false);
                        singleMail.setReplyTo('cs@beamsuntory.com');
                        singleMail.setSenderDisplayName('Beam Suntory Customer Service');
                        emails.add(singleMail);
                    }
                }
            }
        }
        // Added this check to avoid (Too Many Email Invocations). <Jai Kumar Garg>
        if(!emails.isEmpty())
            List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emails);
    }
    
    /**************************************************************************************************************
Description:    Update time stamp fields for reporting on when steps were completed

History
<Date>      <Authors Name>     <Brief Description of Change>
10/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateTimeStampsForSingleBarrelTracker(List<Case> cases, Map<Id, Case> oldMap) {
        List<Barrel__c> barrels = new List<Barrel__c>();
        Set<Id> caseIds = new Set<Id>();
        
        for (Case c : cases) {
            
            if (SBP_Constants.caseSingleBarrelRtIds.contains(c.RecordTypeId)) {
                
                if (oldMap != null) {
                    Case oldCase = oldMap.get(c.Id);
                    if (!oldCase.POS_Items_selected__c && c.POS_Items_selected__c) {
                        c.POS_Items_selected_Date__c = Datetime.now();
                    }
                    
                    if (!oldCase.Bottle_Text_Entered__c && c.Bottle_Text_Entered__c) {
                        c.Bottle_Text_Entered_Date__c = Datetime.now();
                    }
                    
                    if (!oldCase.Purchase_Order_Uploaded__c && c.Purchase_Order_Uploaded__c) {
                        c.Purchase_Order_Uploaded_Date__c = Datetime.now();
                    }
                    
                    if (!oldCase.Barrel_Selected__c && c.Barrel_Selected__c) {
                        c.Barrel_Selected_Date__c = Datetime.now();
                    }
                    
                    if (oldCase.POS_Items_selected__c && !c.POS_Items_selected__c) {
                        c.POS_Items_selected_Date__c = null;
                    }
                    
                    if (oldCase.Bottle_Text_Entered__c && !c.Bottle_Text_Entered__c) {
                        c.Bottle_Text_Entered_Date__c = null;
                    }
                    
                    if (oldCase.Purchase_Order_Uploaded__c && !c.Purchase_Order_Uploaded__c) {
                        c.Purchase_Order_Uploaded_Date__c = null;
                    }
                    
                    if (oldCase.Barrel_Selected__c && !c.Barrel_Selected__c) {
                        c.Barrel_Selected_Date__c = null;
                    }
                } else {
                    if (c.POS_Items_selected__c) {
                        c.POS_Items_selected_Date__c = Datetime.now();
                    }
                    
                    if (c.Bottle_Text_Entered__c) {
                        c.Bottle_Text_Entered_Date__c = Datetime.now();
                    }
                    
                    if (c.Purchase_Order_Uploaded__c) {
                        c.Purchase_Order_Uploaded_Date__c = Datetime.now();
                    }
                    
                    if (c.Barrel_Selected__c) {
                        c.Barrel_Selected_Date__c = Datetime.now();
                    }
                }
                
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    emailEskerPDFs
Object:         Case
RecordType:     Orders - Standard
Date:           11/2018
Details and Notes:  Auto-forward email to Esker (beamsuntory.nobailment.us.sop.qa@process.esker.net) from salesforce
when cases are landed in orders queue.

***************************************************************************************************************/
    public static void emailEskerPDFs(List<Case> cases) {
        List<Group> QueueId = new List<Group>();
        QueueId = [select Id from Group where Type = 'Queue' AND NAME = 'Orders Queue'];
        //Map for list of Orders cases
        List<Id> caseIdsList = new List<Id>();
        List<Messaging.SendEmailResult> emailResult = new List<Messaging.SendEmailResult>();
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.ORDERS_RT_ID &&
                c.BSI_Function__c == 'CS' &&
                c.OwnerId == QueueId[0].Id &&
                c.IsClosed == false &&
                (c.Type == 'Standard' || c.Type == null) &&
                (c.Origin == 'Customer Portal' || c.Origin == 'Email') &&
                c.Email_Sent_to_Esker__c == false
               ) {
                   caseIdsList.add(c.Id);
               }
        }
        
        if (eskerEmailSent == false && caseIdsList!=null && !caseIdsList.isEmpty())
            emailEskerPDFsFutureMethod(caseIdsList);
    }
    
    @future
    public static void emailEskerPDFsFutureMethod(List<Id> caseIdsList) {
        runTrigger = false;
        Map<Id, List<Id>> caseToCVMap = new Map<Id, List<Id>>();
        Set<Id> caseIdSet = new Set<Id>(caseIdsList);
        
        Map<Id, Case> actionableCaseMap = new Map<Id, Case>([Select Id, Email_Sent_to_Esker__c, CreatedDate from Case Where CreatedDate > 2018-12-13T00:00:00Z AND Id IN :caseIdSet]);
        Map<Id, ContentDocumentLink> contentDocumentToLinkMap = new Map<Id, ContentDocumentLink>();
        
        if (!caseIdSet.isEmpty() ) {
            List<ContentDocumentLink> cdLinkList = [SELECT Id, LinkedEntityId, ContentDocumentId
                                                    FROM ContentDocumentLink WHERE LinkedEntityId IN: caseIdSet];
            for (ContentDocumentLink cdl : cdLinkList) {
                contentDocumentToLinkMap.put(cdl.ContentDocumentId, cdl);
            }
            
            /*Code for getting list of attachment whose fileextension is Pdf and max size per Pdf is less than 10MB Starts*/
            Map<Id, ContentVersion> cvMap = new Map<Id, ContentVersion>([SELECT Id, ContentDocumentId, ContentSize, FileExtension, FileType FROM ContentVersion WHERE
                                                                         FileExtension = 'pdf' AND ContentSize < 10000000 AND
                                                                         ContentDocumentId IN: contentDocumentToLinkMap.keySet()]);
            for (ContentVersion cv : cvMap.values()) {
                Id entityId = contentDocumentToLinkMap.get(cv.ContentDocumentId).LinkedEntityId;
                if (!caseToCVMap.containsKey(entityId)) {
                    caseToCVMap.put(entityId, new List<Id> {cv.Id});
                } else {
                    caseToCVMap.get(entityId).add(cv.Id);
                }
            }
            /*Code for getting list of attachment whose fileextension is Pdf and max size per Pdf is less than 10MB Ends*/
            
            Integer size = 0;
            /*Getting Esker email address, systemUserId and TemplateName from CSConstants starts*/
            String eskerEmailAddress = CSConstants.Esker_EmailAddress;
            String systemUserId = CSConstants.SYSTEM_EMAIL_USER_ID;
            String OrdersCaseCreationforEskerTemplateName = CSConstants.Orders_Case_Creation_for_Esker;
            EmailTemplate OrdersCaseCreationforEskerTemplate = [SELECT Id FROM EmailTemplate WHERE DeveloperName = : OrdersCaseCreationforEskerTemplateName LIMIT 1];
            /*Getting Esker email address,TemplateName from CSConstants ends*/
            
            /*Code for sending an email to Esker and checking the max size per email is less than 28MB starts*/
            //List<Messaging.SingleEmailMessage> allMails = new List<Messaging.SingleEmailMessage>();
            
            for (Id caseId : actionableCaseMap.keySet()) {
                Messaging.SingleEmailMessage mail = Messaging.renderStoredEmailTemplate(OrdersCaseCreationforEskerTemplate.Id, eskerEmailAddress, caseId);
                mail.setSaveAsActivity(false);
                mail.setToAddresses(new List<String> {eskerEmailAddress});
                mail.setWhatId(caseId);
                
                if (caseToCVMap.containsKey(caseId)) {
                    List<Id> attachmentList = caseToCVMap.get(caseId);
                    size = 0;
                    for (ID cv : attachmentList){
                        size += cvMap.get(cv).ContentSize;
                    }
                    if (size > 28000000) break;
                    mail.setEntityAttachments(attachmentList);
                    //allMails.add(mail);
                    try {
                        Messaging.SingleEmailMessage[] messages = new List<Messaging.SingleEmailMessage> {mail};
                            Messaging.SendEmailResult[] results = Messaging.sendEmail(messages);
                        if (results[0].success) {
                            System.debug('The email was sent successfully.');
                            actionableCaseMap.get(caseId).Email_Sent_to_Esker__c = true;
                            eskerEmailSent = true;
                        }
                    } catch (Exception e) {
                        CreateExceptionLog.insertErrorLog('caseServices', 'emailEskerPDFs', String.valueOf(e), 'Fatal');
                        // throw so that we can detect issues before deploying
                        if (Test.isRunningTest()) {
                            throw new CS_CustomException(e.getMessage());
                        }
                    }
                }
            }
            
            update actionableCaseMap.values();
            /*Code for sending an email to Esker and checking the max size per email is less than 28MB Ends*/
        }
    }
    
    
    /**************************************************************************************************************
Description:    Assigns the Entitlement associated with the account on the case record to the case, if there is no entitlement
then one will be created for that account and assigned to the case record

History
<Date>      <Authors Name>     <Brief Description of Change>
12/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void addEntitlementToGBSCase(List<Case> cases) {
        Set<Id> accountIds = new Set<Id>();
        Map<Id, Map<String, Entitlement>> accountIdToEntitlementMap = new Map<Id, Map<String, Entitlement>>();
        
        for (Case c : cases) {
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId)) {
                // check for AccountId on Case
                if (c.AccountId != null && c.EntitlementId == null) {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        // get the entitlements tied to the account
        //accountIdToEntitlementMap = getEntitlementsFromAccount(accountIds, GBS_Constants.STANDARD_ENTITLEMENT, GBS_Constants.STANDARD_ENTITLEMENT_PROCESS);
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), GBS_Constants.STANDARD_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, GBS_Constants.STANDARD_ENTITLEMENT, GBS_Constants.STANDARD_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        for (Case c : cases) {
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId)) {
                if (c.EntitlementId == null) {
                    if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                        c.SLA_Start__c = System.now();
                        c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(GBS_Constants.STANDARD_ENTITLEMENT).Id;
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Assign a default account for GBS cases if there is not already an account
Accounts are required on a case in order to use an Entitlement Process

History
<Date>      <Authors Name>     <Brief Description of Change>
12/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void assignAccountToGbsCase(List<Case> cases) {
        Account acct;
        User u = [select Id, ContactId from User where Id = : UserInfo.getUserId() limit 1];
        
        if (Test.isRunningTest()) {
            Account a = new Account();
            a.Name = GBS_Constants.DEFAULT_ACCOUNT_NAME;
            a.RecordTypeId = GBS_Constants.vendorAccountRecordTypdId;
            insert a;
            acct = a;
        } else {
            acct = defaultGBSAccount;
        }
        
        for (Case c : cases) {
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId)) {
                if (u.ContactId == null) {
                    if (c.AccountId == null) {
                        c.AccountId = acct.Id;
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Once the case is closed all milestones that have not already been completed will be completed and
if necessary a cloned milestone record will be created/updated

History
<Date>      <Authors Name>     <Brief Description of Change>
12/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void completeGBSMilestones(List<Case> cases, Map<Id, Case> oldMap) {
        Map<Id, List<String>> caseIdToMilestoneNames = new Map<Id, List<String>>();
        Map<Id, CaseMilestone> caseMilestoneMap = new Map<Id, CaseMilestone>();
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId)) {
                if (oldCase.Status.equalsIgnoreCase(GBS_Constants.LOGGED) && !(c.Status.equalsIgnoreCase(GBS_Constants.LOGGED))) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, GBS_Constants.LOGGED_MILESTONE );
                } else if (oldCase.Status.equalsIgnoreCase(GBS_Constants.IN_PROGRESS) && !(c.Status.equalsIgnoreCase(GBS_Constants.IN_PROGRESS))) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, GBS_Constants.IN_PROGRESS_MILESTONE );
                } else if (oldCase.Status.equalsIgnoreCase(GBS_Constants.WAITING) && !(c.Status.equalsIgnoreCase(GBS_Constants.WAITING))) {
                    caseIdToMilestoneNames = addMilestoneToMap(c.Id, caseIdToMilestoneNames, GBS_Constants.WAITING_MILESTONE );
                }
            }
        }
        
        if (caseIdToMilestoneNames.isEmpty()) {
            return;
        }
        
        for (CaseMilestone caseMilestone : [select id, IsCompleted, MilestoneType.Name, CaseId from CaseMilestone where CaseId IN :caseIdToMilestoneNames.keySet()]) {
            if (caseIdToMilestoneNames.containsKey(caseMilestone.CaseId)) {
                for (String milestoneName : caseIdToMilestoneNames.get(caseMilestone.CaseId)) {
                    if (milestoneName == caseMilestone.MilestoneType.Name) {
                        caseMilestone.CompletionDate = System.now();
                        caseMilestoneMap.put(caseMilestone.Id, caseMilestone);
                    }
                }
            }
        }
        
        if (caseMilestoneMap.isEmpty()) {
            return;
        }
        
        EntitlementsServices.updateClonedMilestones(caseMilestoneMap.keySet(), null);
        
        if (!caseMilestoneMap.isEmpty()) {
            try {
                update caseMilestoneMap.values();
            } catch (Exception e) {
                String errorMessage = 'Error updating milestones ' + e.getMessage() + '\n' + e.getStackTraceString();
                CreateExceptionLog.insertErrorLog('caseServices', 'completeGBSMilestones', String.valueOf(errorMessage), 'Fatal');
                // throw so that we can detect issues before deploying
                if (Test.isRunningTest()) {
                    throw new CS_CustomException(e.getMessage());
                }
            }
        }
    }
    
    
    /**************************************************************************************************************
Description:        Once a GBS case has been reOpened, the Entitlement process must be reset

History
<Date>      <Authors Name>     <Brief Description of Change>
12/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void checkForReOpenedGBSCase(List<Case> cases, Map<Id, Case> oldMap) {
        for (Case c : cases) {
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId) && oldMap != null) {
                Case oldCase = oldMap.get(c.Id);
                // case has been reopened for GBS
                if (GBS_Constants.CLOSED_STATUS_VARIATIONS.contains(oldCase.Status) && !GBS_Constants.CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                    // reset Entitlement Process
                    c.SLA_Start__c = null;
                    c.isReOpened__c = true;
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        After a GBS case has been reOpened, a new milestone start and this method updates a flag on the
cloned milestone object indicating that this milestone is the result of a reOpened case
History
<Date>      <Authors Name>     <Brief Description of Change>
12/2018      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateReOpenedMilestones(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> caseIds = new Set<Id>();
        for (Case c : cases) {
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId) && oldMap != null) {
                Case oldCase = oldMap.get(c.Id);
                // only pull in statuses that have moved to the closed status from any other non closed status
                if (GBS_Constants.CLOSED_STATUS_VARIATIONS.contains(oldCase.Status) && !GBS_Constants.CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                    caseIds.add(c.Id);
                }
            }
        }
        
        if (caseIds.isEmpty()) {
            return;
        }
        
        EntitlementsServices.updateClonedMilestonesFuture(null, caseIds);
    }
    
    
    /**************************************************************************************************************
Description:   If a GBS case is reassigned from a User to a Queue, then the status must be reset to "Logged"

History
<Date>      <Authors Name>     <Brief Description of Change>
1/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateGBSStatusOnOwnerChange(List<Case> cases, Map<Id, Case> oldMap) {
        Set<Id> caseIds = new Set<Id>();
        Map<Id, Case> caseMap = new Map<Id, Case>();
        List<Case> casesToUpdate = new List<Case>();
        for (Case c : cases) {
            if (oldMap != null) {
                Case oldCase = oldMap.get(c.Id);
                
                if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId) && (c.OwnerId != oldCase.OwnerId) && !GBS_Constants.CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                    String currentOwnerType = c.OwnerId.getSObjectType().getDescribe().getName();
                    String oldOwnerType = oldCase.OwnerId.getSObjectType().getDescribe().getName();
                    
                    // if the owner goes from a User => Queue
                    if (oldOwnerType != 'Group' && currentOwnerType == 'Group') {
                        c.Status = 'Logged';
                    }
                    // if the owner goes from a Queue => User
                    else if (oldOwnerType == 'Group' && currentOwnerType != 'Group') {
                        c.Status = 'In Progress';
                    }
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Assigns business hours to all GBS cases to drive the case milestone times on the case records

History
<Date>      <Authors Name>     <Brief Description of Change>
1/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void assignGBSBusinessHoursToCase(List<Case> cases, Map<Id, Case> oldMap) {
        Map<String, GBS_Business_Hours_Setting__mdt> gbsCenterToSetting = new Map<String, GBS_Business_Hours_Setting__mdt>();
        Map<String, BusinessHours> businessHoursMap = new Map<String, BusinessHours>();
        List<Case> casesToUpdate = new List<Case>();
        
        for (Case c : cases) {
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId)) {
                if (oldMap != null) {
                    Case oldCase = oldMap.get(c.Id);
                    if (oldCase.GBS_Center__c != c.GBS_Center__c) {
                        casesToUpdate.add(c);
                    }
                } else {
                    casesToUpdate.add(c);
                }
            }
        }
        
        if (!casesToUpdate.isEmpty()) {
            businessHoursMap = getBusinessHours();
        }
        
        for (GBS_Business_Hours_Setting__mdt gbsSetting : [Select id, Business_Hours__c, GBS_Center__c from GBS_Business_Hours_Setting__mdt]) {
            gbsCenterToSetting.put(gbsSetting.GBS_Center__c, gbsSetting);
        }
        
        // filter out record types
        for (Case c : cases) {
            String businessHoursName;
            if (GBS_Constants.gbsRecordTypeIds.contains(c.RecordTypeId)) {
                if (gbsCenterToSetting.containsKey(c.GBS_Center__c)) {
                    businessHoursName = gbsCenterToSetting.get(c.GBS_Center__c).Business_Hours__c;
                    
                    if (businessHoursMap.containsKey(businessHoursName)) {
                        c.BusinessHoursId = businessHoursMap.get(businessHoursName).Id;
                    }
                }
            }
        }
    }
    /**************************************************************************************************************
Method name:    caseSetStatusChangeWithSLA
Object:         Case
Date:           01/04/2019
Details and Notes: SAL-135
Sets the Status Changed Within SLA to true for record type EDI Orders, Orders, Changes, Inquiry, Quality Claim, Order Claim & Escalated Form.
Added by: Priyankar Saha
Company: TCS
*****************************************************************************************************************************/
    /*---Start SAL-135---*/
    public static void caseSetStatusChangeWithSLA(List<Case> newCases, Map<Id, Case> oldMap) {
        System.debug('---Trigger fired---' + newCases);
        for (Case currCase : newCases) {
            String recordtypename = Schema.SObjectType.Case.getRecordTypeInfosById().get(currCase.recordtypeid).getname();
            System.debug('---Record Type Information---' + recordtypename);
            if ((recordtypename == 'EDI Order') || (recordtypename == 'Orders') || (recordtypename == 'Quality Claim') || (recordtypename == 'Order Claim') || (recordtypename == 'Inquiry')) {
                if ((currCase.Running_Case_Time__c > 0) && (currCase.Running_Case_Time__c <= 10)) {
                    String newStatus = currCase.Status;
                    String oldStatus = oldMap.get(currCase.Id).Status;
                    System.debug('---New Status--- ' + newStatus + '---Old Status---' + oldStatus);
                    if (oldStatus == 'New' && newStatus != 'New') {
                        currCase.Status_Changed_Within_SLA__c = true;
                    }
                }
            } else if (recordtypename == 'Changes') {
                if ((currCase.Running_Case_Time__c > 0) && (currCase.Running_Case_Time__c <= 4)) {
                    String newStatus = currCase.Status;
                    String oldStatus = oldMap.get(currCase.Id).Status;
                    System.debug('---New Status--- ' + newStatus + '---Old Status---' + oldStatus);
                    if (oldStatus == 'New' && newStatus != 'New') {
                        currCase.Status_Changed_Within_SLA__c = true;
                    }
                }
            } else if (recordtypename == 'Escalated Form') {
                if ((currCase.Running_Case_Time__c > 0) && (currCase.Running_Case_Time__c <= 2)) {
                    String newStatus = currCase.Status;
                    String oldStatus = oldMap.get(currCase.Id).Status;
                    System.debug('---New Status--- ' + newStatus + '---Old Status---' + oldStatus);
                    if (oldStatus == 'New' && newStatus != 'New') {
                        currCase.Status_Changed_Within_SLA__c = true;
                    }
                }
            }
        }
    }
    /*---End SAL-135---*/
    
    /**************************************************************************************************************
Description:    Once the Recommendation for the sub case of a quality claim has been entered
then an email will go out to the owner of the parent case notifying them
History
<Date>      <Authors Name>     <Brief Description of Change>
2/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void emailQualityRecommendationToParentCaseOwner(List<Case> cases, Map<Id, Case> oldMap) {
        EmailTemplate template = [SELECT Id, Subject, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE DeveloperName = 'Quality_Sub_Case_Recommendation'
                                  limit 1
                                 ];
        List<Messaging.SingleEmailMessage> emails = new List<Messaging.SingleEmailMessage>();
        Map<Id, Case> updatedCaseMap = new Map<Id, Case> ([select Id, Parent.Owner.Email, Parent.OwnerId from Case where Id IN: oldMap.keySet()]);
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.RecordTypeId == CSConstants.QC_SUBCASE_RT_ID) {
                if (String.isBlank(oldCase.Recommendation__c) && String.isNotBlank(c.Recommendation__c)) {
                    List<String> emailsToSendTo = new List<String> ();
                    
                    Messaging.SingleEmailMessage singleMail = Messaging.renderStoredEmailTemplate(template.Id, c.Parent.OwnerId, c.Id);
                    singleMail.setToAddresses(new List <String> {
                        updatedCaseMap.get(c.Id).Parent.Owner.Email
                            });
                    singleMail.setSaveAsActivity(false);
                    singleMail.setReplyTo('cs@beamsuntory.com');
                    singleMail.setSenderDisplayName('Beam Suntory Customer Service');
                    emails.add(singleMail);
                }
            }
        }
        // Added this check to avoid (Too Many Email Invocations). <Jai Kumar Garg>
        if(!emails.isEmpty())
            List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emails);
    }
    
    /**************************************************************************************************************
Description:    Once the Non-Technical response for the sub case of a quality claim has been entered
then an email will go out to the owner of the parent case notifying them that they can
communicate the issue out and close the parent case
History
<Date>      <Authors Name>     <Brief Description of Change>
2/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void emailNonTechnicalResponseToParentCaseOwner(List<Case> cases, Map<Id, Case> oldMap) {
        EmailTemplate template = [SELECT Id, Subject, HtmlValue, DeveloperName, Body FROM EmailTemplate WHERE DeveloperName = 'Quality_Sub_Case_Completed'
                                  limit 1
                                 ];
        List<Messaging.SingleEmailMessage> emails = new List< Messaging.SingleEmailMessage > ();
        Map<Id, Case> updatedCaseMap = new Map<Id, Case> ([select Id, Parent.Owner.Email, Parent.OwnerId from Case where Id IN: oldMap.keySet()]);
        
        for (Case c : cases) {
            Case oldCase = oldMap.get(c.Id);
            if (c.RecordTypeId == CSConstants.QC_SUBCASE_RT_ID) {
                if (String.isBlank(oldCase.Non_Technical_Response__c) && String.isNotBlank(c.Non_Technical_Response__c)) {
                    List<String> emailsToSendTo = new List<String> ();
                    
                    //Messaging.SingleEmailMessage singleMail = new Messaging.SingleEmailMessage();
                    Messaging.SingleEmailMessage singleMail = Messaging.renderStoredEmailTemplate(template.Id, c.Parent.OwnerId, c.Id);
                    singleMail.setToAddresses(new List <String> {
                        updatedCaseMap.get(c.Id).Parent.Owner.Email
                            });
                    singleMail.setSaveAsActivity(false);
                    singleMail.setReplyTo('cs@beamsuntory.com');
                    singleMail.setSenderDisplayName('Beam Suntory Customer Service');
                    emails.add(singleMail);
                }
            }
        }
        // Added this check to avoid (Too Many Email Invocations). <Jai Kumar Garg>
        if(!emails.isEmpty())
            List<Messaging.SendEmailResult> emailResults = Messaging.sendEmail(emails);
    }
    
    /**************************************************************************************************************
Description:    Once a parent case with the record type "Quality Claim" has been created, a sub case needs to be
created.  The Customer Service team will work on the parent case while a Plant team will work
on the sub case.
History
<Date>      <Authors Name>     <Brief Description of Change>
2/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void createQualityClaimSubCase(List < Case > cases) {
        List <Case> casesToInsert = new List < Case > ();
        
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.QC_RT_ID) {
                Case newSubCase = c.clone(false, false, false, false);
                
                newSubCase.ParentId = c.Id;
                newSubCase.RecordTypeId = CSConstants.QC_SUBCASE_RT_ID;
                casesToInsert.add(newSubCase);
            }
        }
        
        if (!casesToInsert.isEmpty()) {
            try {
                addEntitlementToQualityClaimSubCase(casesToInsert);
                insert casesToInsert;
            } catch (Exception e) {
                String errorMessage = 'Error creating cases ' + e.getMessage() + '\n' + e.getStackTraceString();
                CreateExceptionLog.insertErrorLog('caseServices', 'createQualityClaimSubCase', String.valueOf(errorMessage), 'Fatal');
                // throw so that we can detect issues before deploying
                if (Test.isRunningTest()) {
                    throw new CS_CustomException(e.getMessage());
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:    Once a case with the record type of "Quality Claim" moves to the status of "Pending Sub-Case"
then the sub case will be assigned to the correct bottling plant queue so that it can we worked
on by the members of that bottling plant.
History
<Date>      <Authors Name>     <Brief Description of Change>
2/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void updateQualityClaimSubCase(List <Case> cases, Map <Id, Case> oldMap) {
        Set <Id> parentsIds = new Set <Id> ();
        Map <Id, Case> casesToUpdate = new Map <Id, Case> ();
        
        Database.DMLOptions dmo = new Database.DMLOptions();
        dmo.AssignmentRuleHeader.useDefaultRule = true;
        
        for (Case c : cases) {
            if (oldMap != null) {
                Case oldCase = oldMap.get(c.Id);
                if (c.RecordTypeId == CSConstants.QC_RT_ID && (c.Status == CSConstants.PENDING_SUB_CASE && oldCase.Status != CSConstants.PENDING_SUB_CASE)) {
                    parentsIds.add(c.Id);
                }
            }
        }
        
        for (Case c : [select Id, Assign_Queue_to_Case__c, Status from Case where ParentId IN: parentsIds]) {
            c.Assign_Queue_to_Case__c = true;
            c.setOptions(dmo);
            casesToUpdate.put(c.Id, c);
        }
        
        if (!casesToUpdate.isEmpty()) {
            
            try {
                update casesToUpdate.values();
            } catch (Exception e) {
                String errorMessage = 'Error updating cases ' + e.getMessage() + '\n' + e.getStackTraceString();
                CreateExceptionLog.insertErrorLog('caseServices', 'updateQualityClaimSubCase', String.valueOf(errorMessage), 'Fatal');
                // throw so that we can detect issues before deploying
                if (Test.isRunningTest()) {
                    throw new CS_CustomException(e.getMessage());
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Assigns the Entitlement associated with the account on the case record to the case, if there is no entitlement
then one will be created for that account and assigned to the case record
History
<Date>      <Authors Name>     <Brief Description of Change>
2/2019      Craig Austgen       Initial Creation

***************************************************************************************************************/
    public static void addEntitlementToQualityClaimCase(List <Case> cases) {
        Set <Id> accountIds = new Set <Id>();
        Map <Id, Map <String, Entitlement>> accountIdToEntitlementMap = new Map <Id, Map <String, Entitlement>>();
        
        
        for (Case c : cases) {
            if ((CSConstants.qualityClaimRecordTypeIds.contains(c.RecordTypeId)) && !CSConstants.QC_CLOSED_STATUS_VARIATIONS.contains(c.Status)
                && (c.Status != 'New')) {
                    // check for AccountId on Case
                    if (c.AccountId != null) {
                        accountIds.add(c.AccountId);
                    }
                }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), CSConstants.QUALITY_CLAIM_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, CSConstants.QUALITY_CLAIM_ENTITLEMENT, CSConstants.QUALITY_CLAIM_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        
        for (Case c : cases) {
            if (CSConstants.qualityClaimRecordTypeIds.contains(c.RecordTypeId)) {
                //if (c.EntitlementId == null) {
                if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                    c.SLA_Start__c = null;
                    c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(CSConstants.QUALITY_CLAIM_ENTITLEMENT).Id;
                }
                //}
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Assigns the Entitlement associated with the account on the case record to the case, if there is no entitlement
then one will be created for that account and assigned to the case record
History
<Date>      <Authors Name>     <Brief Description of Change>
7/04/2019      Sripal Kotha       Initial Creation

***************************************************************************************************************/
    public static void addEntitlementToLogisticsCase(List <Case> cases) {
        Set <Id> accountIds = new Set <Id>();
        Map <Id, Map <String, Entitlement>> accountIdToEntitlementMap = new Map <Id, Map <String, Entitlement>>();
        
        
        for (Case c : cases) {
            if ((CSConstants.LOGISTICS_REQUEST_RT_ID.equals(c.RecordTypeId)) && !CSConstants.QC_CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                // check for AccountId on Case
                if (c.AccountId != null && c.EntitlementId == null) {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);      
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), CSConstants.LOGISTICS_REQUEST_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, CSConstants.LOGISTICS_REQUEST_ENTITLEMENT, CSConstants.LOGISTICS_REQUEST_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        
        for (Case c : cases) {
            if ((CSConstants.LOGISTICS_REQUEST_RT_ID.equals(c.RecordTypeId))) {
                if (c.EntitlementId == null) {
                    if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                        c.SLA_Start__c = null;
                        c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(CSConstants.LOGISTICS_REQUEST_ENTITLEMENT).Id;
                    }
                }
            }
        }
    }
    /**************************************************************************************************************
Description:        Assigns the Entitlement for qulaity claim sub case associated with the account on the case record, if there is no entitlement
then one will be created for that account and assigned to the case record
History
<Date>      <Authors Name>     <Brief Description of Change>
9/2019      Sripal Kotha       Initial Creation

*************************************************************************************************/
    public static void addEntitlementToQualityClaimSubCase(List <Case> cases) {
        Set <Id> accountIds = new Set <Id>();
        Map <Id, Map <String, Entitlement>> accountIdToEntitlementMap = new Map <Id, Map <String, Entitlement>>();
        for (Case c : cases) {
            if ((CSConstants.QC_SUBCASE_RT_ID.equals(c.RecordTypeId)) && !CSConstants.QC_CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                // check for AccountId on Case;
                if (c.AccountId != null && c.EntitlementId == null) {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);      
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), CSConstants.QUALITY_CLAIM_SUB_CASE_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, CSConstants.QUALITY_CLAIM_SUB_CASE_ENTITLEMENT, CSConstants.QUALITY_CLAIM_SUB_CASE_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        
        for (Case c : cases) {
            if ((CSConstants.QC_SUBCASE_RT_ID.equals(c.RecordTypeId))) {
                if (c.EntitlementId == null) {
                    if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                        c.SLA_Start__c = null;
                        c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(CSConstants.QUALITY_CLAIM_SUB_CASE_ENTITLEMENT).Id;
                    }
                }
            }
        }
    }
    /**************************************************************************************************************
Description:        Assigns the Entitlement for quality claim parent case associated with the account on the case record, if there is no entitlement
then one will be created for that account and assigned to the case record
History
<Date>      <Authors Name>     <Brief Description of Change>
9/2019      Sripal Kotha       Initial Creation

*************************************************************************************************/
    public static void addEntitlementToQualityClaimParentCase(List <Case> cases) {
        Set <Id> accountIds = new Set <Id>();
        Map <Id, Map <String, Entitlement>> accountIdToEntitlementMap = new Map <Id, Map <String, Entitlement>>();
        
        
        for (Case c : cases) {
            if ((CSConstants.QC_RT_ID.equals(c.RecordTypeId)) && !CSConstants.QC_CLOSED_STATUS_VARIATIONS.contains(c.Status)) {
                // check for AccountId on Case
                if (c.AccountId != null) {
                    accountIds.add(c.AccountId);
                }
            }
        }
        
        if (accountIds.isEmpty()) {
            return;
        }
        
        Map <Id, Account> acctMap = new Map <Id, Account> ([select id, (Select Id, Name from Entitlements) from Account where Id IN: accountIds]);
        Map <Id, Account> defaultEntitlementForAccount = getEntitlementsFromAccount(acctMap.values(), CSConstants.QUALITY_CLAIM_PARENT_CASE_ENTITLEMENT);
        createEntitlementsForAccount(defaultEntitlementForAccount, acctMap, CSConstants.QUALITY_CLAIM_PARENT_CASE_ENTITLEMENT, CSConstants.QUALITY_CLAIM_PARENT_CASE_ENTITLEMENT_PROCESS);
        accountIdToEntitlementMap = mapAccountToEntitlements(acctMap.keySet());
        
        
        for (Case c : cases) {
            if (CSConstants.qualityClaimRecordTypeIds.contains(c.RecordTypeId)) {
                if (accountIdToEntitlementMap.containsKey(c.AccountId)) {
                    c.SLA_Start__c = null;
                    c.EntitlementId = accountIdToEntitlementMap.get(c.AccountId).get(CSConstants.QUALITY_CLAIM_PARENT_CASE_ENTITLEMENT).Id;
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Assigns business hours to a case based on the shipping plant selected, to provide accurate
times for case milestones
History
<Date>      <Authors Name>     <Brief Description of Change>
2/2019      Craig Austgen       Initial Creation

*************************************************************************************************/
    public static void assignBusinessHoursToQualityClaimCase(List <Case> cases) {
        Map <String, CS_Plant_Setting__mdt> plantNameToSetting = new Map <String, CS_Plant_Setting__mdt> ();
        List <Case> childCases = new List <Case>();
        Map <String, BusinessHours> businessHoursMap = getBusinessHours();
        
        // query custom metatdata for country to business hours
        for (CS_Plant_Setting__mdt plantSetting : [Select id, Plant__c, Country__r.Business_Hours__c, Country__r.Country__c, Country__r.Region__c, External_Third_Party_Plant__c from CS_Plant_Setting__mdt]) {
            plantNameToSetting.put(plantSetting.Plant__c, plantSetting);
        }
        
        // filter out record types
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.QC_SUBCASE_RT_ID) {
                childCases.add(c);
            }
        }
        
        // loop through child cases
        for (Case c : childCases) {
            if (plantNameToSetting.containsKey(c.Bottling_Plant__c)) {
                String businessHoursName = plantNameToSetting.get(c.Bottling_Plant__c).Country__r.Business_Hours__c;
                if (businessHoursMap.containsKey(businessHoursName)) {
                    c.BusinessHoursId = businessHoursMap.get(businessHoursName).Id;
                }
            }
        }
    }
    
    /**************************************************************************************************************
Description:        Set time stamp for when the non technical response is entered
History
<Date>      <Authors Name>     <Brief Description of Change>
3/2019      Craig Austgen       Initial Creation

*************************************************************************************************/
    public static void setQualityClaimTimeStamp(List <Case> cases, Map<Id,Case> oldMap) {
        
        for (Case c : cases) {
            if (c.RecordTypeId == CSConstants.QC_SUBCASE_RT_ID) {
                Case oldCase = oldMap.get(c.Id);
                
                if(String.isBlank(oldCase.Non_Technical_Response__c) && !String.isBlank(c.Non_Technical_Response__c)){
                    c.Non_Technical_Response_Time_Stamp__c = System.now();
                }
                else if(!String.isBlank(oldCase.Non_Technical_Response__c) && String.isBlank(c.Non_Technical_Response__c)){
                    c.Non_Technical_Response_Time_Stamp__c = null;
                }
            }
        }
    }
    
    /**************************************************************************************************************
Method name:    setGBSOutlookCasestoRecordType
Object:         Case
Date:           07/24/2019
Details and Notes: SR_146951
Salesforce - Updates to case record type: logistics request. Whenever a GBS Outlook Case is created from Outlook Salesforce Addin this method
will move the case to correct record type based on Type
Added by: Priyankar Saha
Company: TCS
*****************************************************************************************************************************/
    /*---Start SR_146951---*/
    public static void setGBSOutlookCasestoRecordType(List<Case> newCases){
        for(Case c1 : newCases){
            string recordtypename = Schema.SObjectType.Case.getRecordTypeInfosById().get(c1.recordtypeid).getname();
            if(recordtypename =='GBS Outlook'){
                if(c1.Type == 'Global Master Data Management'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('GMDM').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
                else if(c1.Type == 'Human Resources'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('HR').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
                else if(c1.Type == 'Order to Cash / Billing'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('OTC Billing').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
                else if(c1.Type == 'Payroll'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('Payroll').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
                else if(c1.Type == 'Procure to Pay / Accounts Payable'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('PTP/AP').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
                else if(c1.Type == 'Record to Report'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('RTR').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
                else if(c1.Type == 'Travel & Entertainment'){
                    Id caseRecordTypeId = Schema.SObjectType.Case.getRecordTypeInfosByName().get('T&E').getRecordTypeId();
                    c1.RecordTypeId = caseRecordTypeId;
                }
            }  
        }
    }
    /*---End SR_146951---*/
    
    /**************************************************************************************************************
Description:        Set case priority to critical or high based on provided commnent
History
<Date>         <Authors Name>     <Brief Description of Change>
4/12/2019      Jai Kumar Garg       Initial Creation

*************************************************************************************************/
    public static void setCasePriority(List<Case> cases) {
        if(!cases.isEmpty()) {
            List<TriggerWords__c> lstTriggerWord = [SELECT Name, Priority__c, Type__c 
                                                    FROM 
                                                    TriggerWords__c 
                                                    WHERE 
                                                    Status__c = 'Active'];
            
            for(Case currentCaseInfo : cases) {
                Integer inquiryCount = 0;
                Integer complaintCount = 0;
                for(TriggerWords__c triggerWord : lstTriggerWord) {
                    if((String.isNotEmpty(currentCaseInfo.Subject) && currentCaseInfo.Subject.containsIgnoreCase(triggerWord.name)) || 
                       (String.isNotEmpty(currentCaseInfo.Description) && currentCaseInfo.Description.containsIgnoreCase(triggerWord.name))) {
                           if(CSConstants.CRITICAL.equalsIgnoreCase(triggerWord.Priority__c)) { 
                               currentCaseInfo.RecordTypeId = CSConstants.QC_RT_ID;
                               currentCaseInfo.Priority = triggerWord.Priority__c;
                               return;
                           }
                           inquiryCount = CSConstants.INQUIRY.equalsIgnoreCase(triggerWord.Type__c) ? ++inquiryCount : inquiryCount;
                           complaintCount = CSConstants.COMPLAINT.equalsIgnoreCase(triggerWord.Type__c) ? ++complaintCount : complaintCount;
                       }
                }
                if(complaintCount > 0 || CSConstants.PRODUCT_PACKAGING_ISSUE.equalsIgnoreCase(currentCaseInfo.How_can_we_help__c)) {
                    currentCaseInfo.RecordTypeId = CSConstants.QC_RT_ID;
                    currentCaseInfo.Priority = CSConstants.HIGH;
                    return;
                } else if(inquiryCount > 0) {
                    currentCaseInfo.RecordTypeId = CSConstants.CONSUMER_INQUIRY_RT_ID;
                    currentCaseInfo.Priority = CSConstants.HIGH;
                    return;
                } else if(String.isNotEmpty(currentCaseInfo.How_can_we_help__c)) {
                    List<Help_Additional_Priority_Mapping__mdt> helpPriorityMdtList = [SELECT Priority__c 
                                                                                       FROM Help_Additional_Priority_Mapping__mdt
                                                                                       WHERE How_Can_We_Help_You__c = :currentCaseInfo.How_can_we_help__c 
                                                                                       AND Additional_Information__c = :currentCaseInfo.AdditionalInformation__c];
                    
                    if(!helpPriorityMdtList.isEmpty()){
                        currentCaseInfo.RecordTypeId = CSConstants.CONSUMER_INQUIRY_RT_ID;
                        currentCaseInfo.Priority = helpPriorityMdtList[0].Priority__c;
                    }
                }
            }
        }
    }
    
}