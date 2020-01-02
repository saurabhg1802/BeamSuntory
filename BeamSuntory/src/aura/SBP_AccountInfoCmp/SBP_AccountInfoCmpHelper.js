({
    init: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        this.loadLabels(component, event, helper);
        this.loadPicklistValues(component, event, helper);
        this.setBarrelInfoVisibility(component, event, helper);
        this.setAttendeeInfoVisibility(component, event, helper);

        setTimeout(function() {
            component.set('v.isDoneRendering', true);
            component.set("v.Spinner", false);
        }, 500);
    },
    // get images to be used for each program 
    loadLabels: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.getSingleBarrelLabels");
        action.setParams({});
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                //console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {}

                component.set('v.fieldIdLabelMap', responseMap['labelMap']);
            } else if (state == 'ERROR') {
                console.log(data.getError());
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                console.log(data.getError());
            }
            component.set("v.Spinner", false);
        });
        $A.enqueueAction(action);
    },
    // get images to be used for each program 
    loadPicklistValues: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.getSingleBarrelPicklistValues");
        action.setParams({});
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var returnVal = data.getReturnValue();
                console.log(returnVal);
                component.set("v.premiseValues", Object.values(returnVal['premise']));

            } else if (state == 'ERROR') {
                console.log(data.getError());
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                console.log(data.getError());
            }
            component.set("v.Spinner", false);
        });
        $A.enqueueAction(action);
    },
    toggleSpinner: function(component, event, helper) {
        var spinner = component.find("mySpinner");
        $A.util.toggleClass(spinner, "slds-hide");
    }, //A helper method that sets the "Spinner" flag to true
    showSpinner: function(component, event, helper) {
        component.set("v.Spinner", true);
    },
    //A helper method that sets the "Spinner" flag to false
    hideSpinner: function(component, event, helper) {
        component.set("v.Spinner", false);
    },
    onPremiseAccountChange: function(component, event, helper) {
        // auto populate account fields
        var premiseAccount = component.get('v.selectedAccountPremiseLookUpRecord');

        component.set('v.premise', premiseAccount.PremiseType__c);
        component.set('v.premiseAccount', premiseAccount.Id);
    },
    onDistributorAccountChange: function(component, event, helper) {
        var distributorAccount = component.get('v.selectedAccountDistributorLookUpRecord');

        component.set('v.distributorAccount', distributorAccount.Id);
        component.set('v.attention', distributorAccount.Attention__c);
        component.set('v.company', distributorAccount.Name);
        component.set('v.street', distributorAccount.BillingStreet);
        component.set('v.city', distributorAccount.BillingCity);
        component.set('v.state', distributorAccount.BillingState);
        component.set('v.zip', distributorAccount.BillingPostalCode);
        component.set('v.phone', distributorAccount.Phone);

        if (helper.isEmpty(distributorAccount)) {
            var contactLookup = component.find('distributor_contact');
            contactLookup.clearValue();
            component.set('v.selectedContactLookUpRecord', null);
            component.set('v.distributorContact', '');
        }
    },
    onContactLookupChange: function(component, event, helper) {
        var contactRecord = component.get('v.selectedContactLookUpRecord');
        if (!helper.isEmpty(contactRecord)) {
            component.set('v.distributorContact', contactRecord.Id);
        }

    },
    setRegionValue: function(component, event, helper, regionVal) {
        var premiseAccount = component.get('v.selectedAccountPremiseLookUpRecord');
        var regionValues = [];

        regionValues.push({
            label: regionVal,
            value: regionVal
        });
        // set the ControllerField variable values to (controller picklist field)
        //component.set("v.regionValues", regionValues);
        component.set('v.region', regionVal);

        this.setMarketValue(component, event, helper, premiseAccount.Market__c);

    },
    setMarketValue: function(component, event, helper, marketVal) {
        var marketValues = [];

        marketValues.push({
            label: marketVal,
            value: marketVal
        });
        // set the ControllerField variable values to (controller picklist field)
        //component.set("v.marketValues", marketValues);
        component.set('v.market', marketVal);
    },
    setBarrelInfoVisibility: function(component, event, helper) {
        var showBarrelInfoList = component.get('v.showBarrelInfoList');
        var brandsToExcludeBarrelInfo = component.get('v.brandsToExcludeBarrelInfo');
        var programType = component.get('v.programType');
        var brand = component.get('v.brand');

        if (showBarrelInfoList.indexOf(programType) > -1) {
            component.set('v.showBarrelInfo', true);
        }
    },
    setAttendeeInfoVisibility: function(component, event, helper) {
        var showAttendeeInfoList = component.get('v.showAttendeeInfoList');
        var programType = component.get('v.programType');

        if (showAttendeeInfoList.indexOf(programType) > -1) {
            component.set('v.showAttendeeInfo', true);
        }
    },
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },
    updateCaseRecord: function(component, event, helper) {
        var action = component.get("c.updateCase");
        var cases = helper.buildCaseRecord(component, event, helper);

        console.log('JSON ', JSON.stringify(Object.values(cases)));

        action.setParams({
            'jsonCases': JSON.stringify(Object.values(cases))
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    console.log(requestObject);
                    resolve(requestObject);

                } else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            reject(Error("Error message: " + errors[0].message));
                        }
                    } else {
                        reject(Error("Unknown error"));
                    }
                }
            });
            $A.enqueueAction(action);
        });
    },
    validateAccountInfo: function(component, event, helper) {
        var programTypeRequiredMap = component.get('v.programTypeRequiredMap');
        var fieldIdValueMap = component.get('v.fieldIdValueMap');
        var programType = component.get('v.programType');
        var brand = component.get('v.brand');
        var showRetailAccountInfo = component.get('v.showRetailAccountInfo');
        var distributorContact = component.get('v.distributorContact');
        var posLabelAccountName = component.get('v.posLabelAccountName');



        var isValid = true;
        var keys = Object.keys(programTypeRequiredMap);

        return new Promise($A.getCallback(function(resolve, reject) {

            for (var i in programTypeRequiredMap[programType]) {
                var val = programTypeRequiredMap[programType][i];
                if (!showRetailAccountInfo) {
                    continue;
                }

                /*if (distributorContact == '' || distributorContact == undefined || distributorContact == null) {
                    helper.showToast('Please enter a contact for the distributor', 'Error', 'error');
                    resolve(false);
                }
                */
                var currentVal = component.get('v.' + fieldIdValueMap[val]);
                console.log(fieldIdValueMap[val]);
                console.log('value ', currentVal);
                console.log('----------------');
                if (currentVal == null || currentVal == '') {
                    isValid = false;
                    helper.showToast('Please complete missing information or contact customer service to update account information', 'Error', 'error');
                    resolve(isValid);
                    break;
                }
                if (brand == 'Jim Beam' || brand == 'Cruzan') {
                    if (posLabelAccountName == null || posLabelAccountName == '') {
                        isValid = false;
                        helper.showToast('Please complete missing information or contact customer service to update account information', 'Error', 'error');
                        resolve(isValid);
                        break;
                    }
                }
            }

            resolve(isValid);
        }));

        return isValid;
    },
    showToast: function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
    setRenderedValues: function(component, event, helper) {
        var programTypeRenderMap = component.get('v.programTypeRenderMap');
        var programType = component.get('v.programType');
        var fieldList = programTypeRenderMap[programType];
        var renderMap = component.get('v.fieldIdRenderMap');

        for (var i in fieldList) {
            component.set('v.' + renderMap[fieldList[i]], true);
        }
    },
    buildCaseRecord: function(component, event, helper) {
        var cases = [];
        var caseRecord = {};
        var accountLabel = component.get('v.posLabelAccountName');
        caseRecord['Id'] = component.get('v.caseId');
        caseRecord['CcEmail__c'] = component.get('v.correspondingCollaborators');
        caseRecord['Remote_Selection_Date__c'] = component.get('v.selectionDate');
        caseRecord['Type'] = component.get('v.programType');
        if (accountLabel != null && accountLabel != undefined && accountLabel != '') {
            caseRecord['Barrel_Selected__c'] = true;
        }
        caseRecord['POS_Label_Account_Name__c'] = accountLabel;
        caseRecord['Premise__c'] = component.get('v.premise');
        caseRecord['AccountId'] = component.get('v.distributorAccount');
        if (component.get('v.premiseAccount') == undefined || component.get('v.premiseAccount') == '') {
            caseRecord['Retail_Account__c'] = null;
        } else {
            caseRecord['Retail_Account__c'] = component.get('v.premiseAccount');
        }

        caseRecord['Retail_Account_Name__c'] = component.get('v.accountName');
        caseRecord['ContactId'] = component.get('v.distributorContact');
        if (component.get('v.splitOrder') == 'No') {
            caseRecord['Split_Order__c'] = false;
        } else {
            caseRecord['Split_Order__c'] = true;
        }
        console.log('caseeee ', caseRecord);

        cases.push(caseRecord)

        return cases;
    },
    validateAttendeeInfo: function(component, event, helper) {
        var attendee_info = component.find('attendee_info_cmp');

        return new Promise($A.getCallback(function(resolve, reject) {
            if (attendee_info != undefined) {
                attendee_info.createAttendees(function(result) {
                    console.log("result: " + result);
                    resolve(result);
                });
            } else {
                resolve(true);
            }

        }));

    },




})