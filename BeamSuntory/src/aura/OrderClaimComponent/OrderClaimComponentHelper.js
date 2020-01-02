({
    //Label example
    //var label = $A.get("$Label.c.Step_2_Order_Subheader_Intl");

    init: function(component, event, helper) {
        this.populateFieldIdMap(component, event, helper, false);
        this.populateRequiredIdMap(component, event, helper, false);
        this.populateLabelIdMap(component, event, helper);
        this.getPicklistValues(component, event, helper);
        this.loadPreExistingParentCase(component, event, helper);
        this.loadPreExistingChildCases(component, event, helper);
        this.validateParentInputFields(component, event, helper);
        this.focusOnPurchaseOrderInput(component, event, helper);

    },

    //This method extracts the current Claim Type's fields, packages it up, and returns it
    generateCaseRecord: function(component, event, helper) {
        var claimType = component.get('v.selectedClaimType');
        var claimMap = component.get('v.claimTypeMap');
        var fieldIdList = claimMap[claimType];
        var fieldAPIMap = component.get('v.fieldIdAPINameMap');
        var fieldValueMap = component.get('v.fieldIdValueMap');
        var parentId = component.get('v.caseId');
        var parentCaseFields = component.get('v.parentCaseFields');

        var newCaseRecord = {
            'sobjectType': "Case",
            'ParentId': parentId
        };

        for (var i in fieldIdList) {
            var fieldId = fieldIdList[i];
            var fieldValue = component.get('v.' + fieldValueMap[fieldId]);
            var fieldAPIName = fieldAPIMap[fieldId];
            newCaseRecord[fieldAPIName] = fieldValue;
        }
        // apply master purchase order and beam suntory order number to all cases
        for (var x in parentCaseFields) {
            var fieldId = parentCaseFields[x];

            var fieldValue = component.get('v.' + fieldId);
            var fieldAPIName = fieldAPIMap[x];
            newCaseRecord[fieldAPIName] = fieldValue;
        }
        return newCaseRecord;
    },

    //APEX CALLBACK METHOD
    insertCase: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var acctId = component.get('v.acctId');

        var newCaseRecord = this.generateCaseRecord(component, event, helper);

        var action = component.get("c.upsertClaimSubCase");
        action.setParams({
            caseRec: newCaseRecord,
            acctId: acctId
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var claimsList = component.get('v.claimsList');
                //console.log(claimsList);
                var claimsMap = component.get('v.claimsMap');
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];

                //console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                //Assign the Case Id to the local record after insertion
                newCaseRecord['Id'] = responseMap['caseId'];
                //Add the inserted case to the Map and List
                claimsMap[newCaseRecord.Id] = newCaseRecord;
                claimsList.push(newCaseRecord);
                //Set the variables back to their attributes
                component.set('v.claimsMap', claimsMap);
                component.set('v.claimsList', claimsList);
                component.set('v.numberOfClaims', claimsList.length);
                //Spawn the "Case Added" page message
                this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Case Added', 1000);
            } else if (state == 'ERROR') {
                this.createUIMessageComponent(component, event, helper, 'error', 'Error', 'An unexpected error occurred, the Case was not created.', 2000);
                console.log(data.getError());
            } else {
                this.createUIMessageComponent(component, event, helper, 'info', 'Warning', 'Callback did not complete successfully.', 2000);
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },

    updateCase: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var editCaseId = component.get('v.editCaseId');
        var claimType = component.get('v.selectedClaimType');
        var claimTypeMap = component.get('v.claimTypeMap');
        var fieldIdList = claimTypeMap[claimType];
        var fieldAPIMap = component.get('v.fieldIdAPINameMap');
        var fieldValueMap = component.get('v.fieldIdValueMap');
        var claimsMap = component.get('v.claimsMap');
        var claimsList = component.get('v.claimsList');
        var acctId = component.get('v.acctId');

        var updatedCaseRec = claimsMap[editCaseId];
        for (var i in fieldIdList) {
            var fieldId = fieldIdList[i];
            var fieldValue = component.get('v.' + fieldValueMap[fieldId]);
            var fieldAPIName = fieldAPIMap[fieldId];
            updatedCaseRec[fieldAPIName] = fieldValue;
        }
        for (var i in claimsList) {
            if (claimsList[i].Id == updatedCaseRec.Id) {
                claimsList[i] = updatedCaseRec;
            }
        }
        claimsMap[updatedCaseRec.Id] = updatedCaseRec;
        component.set('v.claimsList', claimsList);
        component.set('v.numberOfClaims', claimsList.length);
        component.set('v.claimsMap', claimsMap);

        var action = component.get("c.upsertClaimSubCase");
        action.setParams({
            caseRec: updatedCaseRec,
            acctId: acctId
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];

                //console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                //this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Case Updated', 2000);
            } else if (state == 'ERROR') {
                this.createUIMessageComponent(component, event, helper, 'error', 'Error', 'An unexpected error occurred, the Case was not created.', 2000);
            } else {
                this.createUIMessageComponent(component, event, helper, 'info', 'Warning', 'Callback did not complete successfully.', 2000);
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },

    //APEX CALLBACK METHOD
    loadPreExistingChildCases: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.getRelatedCases");
        var caseId = component.get('v.caseId');
        action.setParams({
            caseId: caseId
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                if ('success' in requestObject && !requestObject['success']) {
                    this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                var caseMap = responseMap['caseMap'];
                var caseList = [];
                for (var id in caseMap) {
                    caseList.push(caseMap[id]);
                }
                component.set('v.claimsList', caseList);
                component.set('v.numberOfClaims', caseList.length);
                component.set('v.claimsMap', caseMap);
                this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Loaded Cases', 2000);
            } else if (state == 'ERROR') {
                this.createUIMessageComponent(component, event, helper, 'error', 'Error', 'An error occurred', 2000);
            } else {
                this.createUIMessageComponent(component, event, helper, 'error', 'Error', 'Callback did not complete successfully.', 2000);
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },
    loadPreExistingParentCase: function(component, event, helper) {
        //this.showParentSpinner(component, event, helper);
        var action = component.get("c.getParentCase");
        var caseId = component.get('v.caseId');
        action.setParams({
            caseId: caseId
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                //console.log('loading existing cases', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                var parentCase = responseMap['parentCase'];
                try {
                    component.set("v.purchaseOrderNumber", parentCase[caseId]['Purchase_Order_Number__c']);
                    component.set("v.beamSuntoryOrderNumber", parentCase[caseId]['Beam_Suntory_Order_Number__c']);
                    component.set("v.productDestinationCountryParent", parentCase[caseId]['Product_Destination_Country__c']);
                    component.set("v.carrierVal", parentCase[caseId]['Carrier__c']);
                    component.set("v.stateVal", parentCase[caseId]['State__c']);
                } catch (err) {
                    console.log(err);
                    this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Loaded Cases', 2000);
                }
            } else if (state == 'ERROR') {
                this.createUIMessageComponent(component, event, helper, 'error', 'Error', 'An error occurred', 2000);
            } else {
                this.createUIMessageComponent(component, event, helper, 'error', 'Error', 'Callback did not complete successfully.', 2000);
            }
            //this.hideParentSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },

    //APEX CALLBACK METHOD
    removeCase: function(component, event, helper, caseId) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.removeClaimSubCase");
        action.setParams({
            caseId: caseId
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                //console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                var claimsList = component.get('v.claimsList');
                var claimsMap = component.get('v.claimsMap');
                for (var i in claimsList) {
                    if (claimsList[i].Id == caseId) {
                        claimsList.splice(i, 1);
                    }
                }
                delete claimsMap[caseId];
                component.set('v.claimsMap', claimsMap);
                component.set('v.claimsList', claimsList);
                component.set('v.numberOfClaims', claimsList.length);
                this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Case Removed', 2000);
            } else if (state == 'ERROR') {
                this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },

    //This is a general utility method to create UI Messages dynamically. The message will appear either
    //within the main component or within the modal, depending on the "inModal" attribute.
    //The component will automatically be destroyed after half a second.
    //There is a bug in releases prior to Spring'18, preventing component.find from working on dynamically 
    //created components. After non-preview sandboxes are moved to Spring'18 on February 9th/10th, the commented
    //out "destroy" method can be uncommented, as it will work.
    //Severity Options: confirm, info, warning, error
    createUIMessageComponent: function(component, event, helper, severity, title, message, duration) {
        var randomNumber = new Date().getTime();
        var uiMessageId = 'uiMessageId' + new Date().getTime();
        $A.createComponent(
            "ui:message", {
                "title": title,
                "body": message,
                "severity": severity,
                "closable": "true",
                "aura:id": uiMessageId,
                "class": "showOnTop"
            },
            function(message, status, errorMessage) {
                //Add the new button to the body array
                if (status === "SUCCESS") {
                    var messageContainer = '';
                    if (component.get('v.inModal')) {
                        messageContainer = 'modalMessageContainer';
                    } else {
                        messageContainer = 'pageMessageContainer';
                    }
                    var targetComponent = component.find(messageContainer);
                    var body = targetComponent.get("v.body");
                    body.push(message);
                    targetComponent.set("v.body", body);
                    //A timeout to make the message fade away. Then, delete the component after half a second
                    try {
                        window.setTimeout($A.getCallback(function() {
                            $A.util.addClass(component.find(uiMessageId), "slds-transition-hide");
                            window.setTimeout($A.getCallback(function() {
                                component.find(uiMessageId).destroy();
                                //console.log('Destroyed');
                            }), 500);
                        }), duration);
                    } catch (err) {
                        //console.log(err);
                        //console.log('This error should be resolved on Feb9th/Feb10th when Spring\'18 is live.');
                    }

                } else if (status === "INCOMPLETE") {
                    //console.log("No response from server or client is offline.")
                } else if (status === "ERROR") {
                    //console.log("Error creating toast: " + errorMessage);
                }
            }
        );
    },

    //This method retrieves Labels from the server for use in the component. These labels support translations.
    populateLabelIdMap: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.getClaimsIdLabelMap");
        var countryInput = component.get("v.productDestinationCountryParent");
        action.setParams({});
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                //console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                var labelMap = responseMap['labelMap'];
                component.set('v.fieldIdLabelMap', labelMap);
                if (countryInput == null || countryInput == undefined) {
                    this.setDefaultPicklistValue(component, event, helper);
                }

                //this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Labels Retrieved', 2000);
            } else if (state == 'ERROR') {
                //console.log(data.getError());
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                //console.log(data.getError());
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },

    //HELPER METHODS
    //This method uses the "editCaseId" attribute to fill in the temporary attributes using the
    //Claim Case that was clicked on.
    fillValuesOnEdit: function(component, event, helper) {
        var editCaseId = component.get('v.editCaseId');
        var claimsMap = component.get('v.claimsMap');
        var claimTypeMap = component.get('v.claimTypeMap');

        var claim = claimsMap[editCaseId];
        var claimType = claim.Type;

        var fieldIdList = claimTypeMap[claimType];
        var fieldIdValueMap = component.get('v.fieldIdValueMap');
        var fieldIdAPINameMap = component.get('v.fieldIdAPINameMap');

        for (var i in fieldIdList) {
            var fieldId = fieldIdList[i];
            var claimValue = claim[fieldIdAPINameMap[fieldId]];
            component.set('v.' + fieldIdValueMap[fieldId], claimValue);
        }
    },

    //This method takes the type of Claim and renders the appropriate field from the list of 
    //rendered fields
    setRenderedValues: function(component, event, helper) {
        var claimType = component.get('v.selectedClaimType');
        var claimTypeMap = component.get('v.claimTypeMap');
        var fieldList = claimTypeMap[claimType];
        var renderMap = component.get('v.fieldIdRenderMap');

        for (var i in fieldList) {
            component.set('v.' + renderMap[fieldList[i]], true);
        }
    },
    //This method takes the type of Claim and sets the appropriate field required from the list of 
    //required fields
    setRequiredValues: function(component, event, helper) {
        var claimType = component.get('v.selectedClaimType');
        var claimTypeRequiredMap = component.get('v.claimTypeRequiredMap');
        var fieldList = claimTypeRequiredMap[claimType];

        var requiredMap = component.get('v.fieldIdRequiredMap');

        for (var i in fieldList) {
            component.set('v.' + requiredMap[fieldList[i]], true);
        }
    },

    //This method opens the modal and sets the attribute "inModal" to true
    openModal: function(component, event, helper) {
        this.showPopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.showPopupHelper(component, 'backdrop', 'slds-backdrop_');
        component.set('v.inModal', true);
    },

    //This method closes the modal and sets the attribute "inModal" to false. Additionally,
    //existing validation messages (required fields, etc) will be cleared out on close.
    closeModal: function(component, event, helper) {
        this.hidePopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.hidePopupHelper(component, 'backdrop', 'slds-backdrop_');
        this.clearValidationMessages(component, event, helper);
        component.set('v.inModal', false);
    },

    //A helper method that removes a "hide" class and adds an "open" class
    showPopupHelper: function(component, componentId, className) {
        var modal = component.find(componentId);
        $A.util.removeClass(modal, className + 'hide');
        $A.util.addClass(modal, className + 'open');
    },

    //A helper method that removes an "open" class and adds a "hide" class
    hidePopupHelper: function(component, componentId, className) {
        var modal = component.find(componentId);
        $A.util.addClass(modal, className + 'hide');
        $A.util.removeClass(modal, className + 'open');
    },

    //A helper method that sets the "editMode" flag to false.
    setEditModeOnAdd: function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
                component.find("type").focus();
                component.set('v.editMode', false);
            }), 1
        );
    },

    //A helper method that sets the "editMode" flag to true.
    setEditModeOnEdit: function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
                component.find("type").focus();
                component.set('v.editMode', true);
            }), 1
        );
    },

    //A helper method that sets the "Spinner" flag to true
    showSpinner: function(component, event, helper) {
        component.set("v.Spinner", true);
    },
    showParentSpinner: function(component, event, helper) {
        component.set("v.parentSpinner", true);
    },

    //A helper method that sets the "Spinner" flag to false
    hideSpinner: function(component, event, helper) {
        component.set("v.Spinner", false);
    },
    hideParentSpinner: function(component, event, helper) {
        component.set("v.parentSpinner", false);
    },

    //A helper method that assigns lists of Field Ids to a map with Claim Type as a key
    populateFieldIdMap: function(component, event, helper, populateStateCode) {
        var damageClaimList = component.get('v.damageClaimFieldIdList');
        var freightClaimList = component.get('v.freightClaimFieldIdList');
        var misShipmentClaimList = component.get('v.misShipmentClaimFieldIdList');
        var overageClaimList = component.get('v.overageClaimFieldIdList');
        var shortageClaimList = component.get('v.shortageClaimFieldIdList');
        var stateCodeClaimList = component.get('v.stateCodeClaimFieldIdList');
        var typeMap = {
            'Damage Claim': damageClaimList,
            'Freight Claim': freightClaimList,
            'Mis-Shipment Claim': misShipmentClaimList,
            'Overage Claim': overageClaimList,
            'Shortage Claim': shortageClaimList
        }
        if (populateStateCode) {
            typeMap['State Code Claim'] = stateCodeClaimList;
        }
        component.set('v.claimTypeMap', typeMap);
    },

    //A helper method that assigns lists of Required Fields to a map with Claim Type as a key
    populateRequiredIdMap: function(component, event, helper, populateStateCode) {
        var damageClaimList = component.get('v.damageClaimRequiredIdList');
        var freightClaimList = component.get('v.freightClaimRequiredIdList');
        var misShipmentClaimList = component.get('v.misShipmentClaimRequiredIdList');
        var overageClaimList = component.get('v.overageClaimRequiredIdList');
        var shortageClaimList = component.get('v.shortageClaimRequiredIdList');
        var stateCodeClaimList = component.get('v.stateCodeClaimRequiredIdList');
        var typeMap = {
            'Damage Claim': damageClaimList,
            'Freight Claim': freightClaimList,
            'Mis-Shipment Claim': misShipmentClaimList,
            'Overage Claim': overageClaimList,
            'Shortage Claim': shortageClaimList
        }
        if (populateStateCode) {
            typeMap['State Code Claim'] = stateCodeClaimList;
        }
        component.set('v.claimTypeRequiredMap', typeMap);
    },

    //This method sets all render fields to false, un-rendering all displayed fields in the modal
    unRenderAllFields: function(component, event, helper) {
        var renderMap = component.get('v.fieldIdRenderMap');
        for (var i in renderMap) {
            component.set('v.' + renderMap[i], false);
        }
    },

    //This method sets all required fields to false, un-requiring all displayed fields in the modal
    unRequireAllFields: function(component, event, helper) {
        var requiredMap = component.get('v.fieldIdRequiredMap');
        for (var i in requiredMap) {
            component.set('v.' + requiredMap[i], false);
        }
    },

    //This method clears the values of all temporary field values
    clearAllValues: function(component, event, helper) {
        var valueMap = component.get('v.fieldIdValueMap');
        for (var i in valueMap) {
            if (i != 'type' && i != 'distributor_currency' && i != 'product_destination_country_parent' && i != 'purchase_order_number' && i != 'beam_suntory_order_number' && i != 'carrier' && i != 'state') {
                component.set('v.' + valueMap[i], null);
            }
        }
    },

    //This method clears all field validation messages by un-rendering and re-rendering them in an aura:if
    clearValidationMessages: function(component, event, helper) {
        component.set('v.clearValidations', false);
        component.set('v.clearValidations', true);
    },

    //This method validates the temporary field values in the modal. First, the selected claim type is retrieved.
    //Then, list of aura ids for that type is retrieved and iterated over. Each field value is checked for validity.
    //All inputs except for Radio Groups have the attribute "validity". Radio Groups, based on documentation, should 
    //have the "validity" attribute but it comes back undefined in Spring'18. In place of this, we can use the 
    //"checkValidity" method on Radio Groups. If "validity.valid" is false (the component is not valid), we record
    //the Id of the invalid input and store its Field Label. If any fields are invalid, the method "showhelpMessageIfInvalid"
    //is executed, showing validations on each input, if applicable. A dict is returned with the Boolean for "hasErrors" and 
    //a list of the error Ids.
    validateModalInput: function(component, event, helper) {
        var none = component.get("v.fieldIdLabelMap").nonePicklist;
        var selectedClaimType = component.get('v.selectedClaimType');
        var nonePicklist = component.get("v.fieldIdLabelMap").nonePicklist;
        var auraIdList = component.get('v.claimTypeMap')[selectedClaimType];
        var claimsMapToList = component.get("v.claimsTypeToList");
        var requiredFields = component.get('v.fieldIdRequiredMap');
        var fieldValues = component.get('v.fieldIdValueMap');
        var fieldTypes = component.get('v.fieldTypeMap');

        var dateFields = fieldTypes['date'];
        var radioFields = fieldTypes['radio'];
        var picklistFields = fieldTypes['picklist'];
        var textFields = fieldTypes['text'];
        var integerFields = fieldTypes['integer'];
        var doubleFields = fieldTypes['double'];

        var self = this;

        var hasErrors = false;
        var errorIdList = [];
        auraIdList.forEach(function(auraId, index) {

            try {
                if (!$A.util.isEmpty(auraId)) {
                    var field = component.find(auraId);
                    var isRequired = component.get("v." + requiredFields[auraId]);
                    var cmpValue = component.get("v." + fieldValues[auraId]);

                    if (isRequired) {
                        if (!$A.util.isEmpty(textFields) && textFields.indexOf(auraId) > -1 && $A.util.isEmpty(cmpValue)) {
                            hasErrors = true;
                            errorIdList.push(auraId);

                        } else if (!$A.util.isEmpty(picklistFields) && picklistFields.indexOf(auraId) > -1 && (cmpValue == nonePicklist || $A.util.isEmpty(cmpValue))) {
                            hasErrors = true;
                            errorIdList.push(auraId);

                        } else if (!$A.util.isEmpty(integerFields) && integerFields.indexOf(auraId) > -1 && $A.util.isEmpty(cmpValue)) {
                            hasErrors = true;
                            errorIdList.push(auraId);

                        } else if (!$A.util.isEmpty(doubleFields) && doubleFields.indexOf(auraId) > -1 && $A.util.isEmpty(cmpValue)) {
                            hasErrors = true;
                            errorIdList.push(auraId);

                        } else if (!$A.util.isEmpty(dateFields) && dateFields.indexOf(auraId) > -1) {
                            var validDate = self.checkShipDate(component, event, helper, auraId, fieldValues[auraId]);
                            if (validDate.hasErrors) {
                                hasErrors = true;
                                errorIdList.push(auraId);
                            }

                        } else if (!$A.util.isEmpty(radioFields) && radioFields.indexOf(auraId) > -1 && $A.util.isEmpty(cmpValue)) {
                            hasErrors = true;
                            errorIdList.push(auraId);
                        }

                        /*if (hasErrors) {
                            field[0].set('v.validity', {
                                valid: false,
                                badInput: true
                            });
                            field[0].showHelpMessageIfInvalid();
                        }
                        */

                    }
                }
            } catch (err) {
                //console.log('Exception > ', auraId);
                //console.log(err);
            }

        });
        return {
            'hasErrors': hasErrors,
            'errorIdList': errorIdList
        };
    },
    getPicklistValues: function(component, event, helper) {
        var action = component.get("c.getPicklistValues");

        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var returnVal = response.getReturnValue();

                component.set("v.typePicklistValues", Object.values(returnVal['type']));
                component.set("v.freightClaimTypePicklistValues", Object.values(returnVal['freight_claim_type']));
                component.set("v.productSizePicklistValues", Object.values(returnVal['product_size']));
                component.set("v.sealIntactPicklistValues", Object.values(returnVal['seal_intact']));
                component.set("v.distributorCurrencyPicklistValues", Object.values(returnVal['distributor_currency']));
                component.set("v.shippingPlantPicklistValues", Object.values(returnVal['shipping_plant']));
                component.set("v.otcStorageLocationPicklistValues", Object.values(returnVal['otc_storage_location']));
                component.set("v.productDestinationCountryPicklistValues", Object.values(returnVal['product_destination_country']));
                component.set("v.overageDispositionPicklistValues", Object.values(returnVal['overage_disposition']));
                component.set("v.productDestinationCountryParentPicklistValues", Object.values(returnVal['product_destination_country_parent']));
                component.set("v.quantityTypePickListValues", Object.values(returnVal['quantity_type']));
                component.set("v.statePicklistValues", Object.values(returnVal['state']));


                this.setRadioGroupValues(component, event, helper, Object.values(returnVal['quantity_type']));

            } else if (response.getState() === "ERROR") {
                //console.log("Errors", response.getError());
            }
        });

        $A.enqueueAction(action);
    },
    focusOnPurchaseOrderInput: function(component, event, helper) {
        window.setTimeout(
            $A.getCallback(function() {
                component.find('purchase_order_number').focus();
            }), 1
        );
    },
    toggleAddClaimButton: function(component, event, helper, enableButton) {
        //console.log(enableButton);
        if (enableButton) {
            component.set("v.showEnabledAddClaimButton", true);
            component.set("v.showDisabledAddClaimButton", false);
        } else {
            component.set("v.showEnabledAddClaimButton", false);
            component.set("v.showDisabledAddClaimButton", true);
        }
    },
    validateParentInputFields: function(component, event, helper) {
        //console.log('validating parent fields');
        var po = component.find('purchase_order_number');
        var country = component.find('product_destination_country_parent');
        var countryInput = component.get("v.productDestinationCountryParent");
        var poInput = component.get("v.purchaseOrderNumber");
        var nonePicklist = component.get("v.fieldIdLabelMap").nonePicklist;

        try {
            var PoValidity = po.get('v.validity');
            //var CountryValidity = country.get('v.validity');

            if (PoValidity != null) {
                if ((PoValidity.valid) && countryInput != nonePicklist && countryInput != undefined && poInput != undefined && poInput != null) {
                    this.toggleAddClaimButton(component, event, helper, true);
                } else {
                    this.toggleAddClaimButton(component, event, helper, false);
                }
            }


            //po.showHelpMessageIfInvalid();
        } catch (err) {
            //console.log('Exception', err);
        }
    },
    onRadioButtonChange: function(component, event, helper) {
        var gtr = component.get("v.GTR");
        var bailment = component.get("v.Bailment");
        var bailGtr = component.get("v.bailmentGtrVal");
        var typePicklistValues = component.get('v.typePicklistValues');
        var nonePicklist = component.get("v.fieldIdLabelMap").nonePicklist;
        var none = component.get("v.fieldIdLabelMap").none;
        var addStateCodeClaim = true;

        if (bailGtr == 'GTR') {
            var claimsMap = component.get("v.claimTypeMap");
            component.set("v.GTR", true);
            component.set("v.Bailment", false);
            for (var i in typePicklistValues) {
                if (typePicklistValues[i] == 'State Code Claim') {
                    typePicklistValues.splice(i, 1);
                }
            }
            component.set('v.typePicklistValues', typePicklistValues);
            component.set("v.showEnabledCountryField", true);
            component.set("v.showDisabledCountryField", false);

            this.removeFieldFromRequiredMapping(component, event, helper, 'otc_storage_location');
            this.removeFieldFromRenderMapping(component, event, helper, 'otc_storage_location');
        } else if (bailGtr == 'Bailment') {

            component.set("v.GTR", false);
            component.set("v.Bailment", true);

            // default parent country to US
            component.set("v.productDestinationCountryParent", "US");
            component.set("v.showEnabledCountryField", false);
            component.set("v.showDisabledCountryField", true);
            // add 'State Code Claim': stateCodeClaimList
            for (var i in typePicklistValues) {
                if (typePicklistValues[i] == 'State Code Claim') {
                    addStateCodeClaim = false;
                }
            }
            if (addStateCodeClaim) {
                typePicklistValues.push('State Code Claim');
            }

            component.set('v.typePicklistValues', typePicklistValues);

            this.populateFieldIdMap(component, event, helper, true);
            this.populateRequiredIdMap(component, event, helper, true);
            this.addFieldToRenderMapping(component, event, helper, 'otc_storage_location');
            this.addFieldToRequiredMapping(component, event, helper, 'otc_storage_location');

            this.removeFieldFromRenderMapping(component, event, helper, 'product_destination_country');
            this.removeFieldFromRequiredMapping(component, event, helper, 'product_destination_country');

        } else if (bailGtr == none) {
            component.set("v.Bailment", false);
            component.set("v.GTR", false);

            for (var i in typePicklistValues) {
                if (typePicklistValues[i] == 'State Code Claim') {
                    typePicklistValues.splice(i, 1);
                }
            }
            component.set('v.typePicklistValues', typePicklistValues);
            component.set("v.showEnabledCountryField", true);
            component.set("v.showDisabledCountryField", false);
            this.removeFieldFromRequiredMapping(component, event, helper, 'otc_storage_location');
            this.removeFieldFromRenderMapping(component, event, helper, 'otc_storage_location');

            this.removeFieldFromRequiredMapping(component, event, helper, 'product_destination_country');
            this.removeFieldFromRenderMapping(component, event, helper, 'product_destination_country');
        }
        this.updateParentCaseFields(component, event, helper);


    },
    updateParentCaseFields: function(component, event, helper) {

        var poNumber = component.get("v.purchaseOrderNumber");
        var beamOrderNumber = component.get("v.beamSuntoryOrderNumber");
        var isGTR = component.get("v.GTR");
        var isBailment = component.get("v.Bailment");
        var caseId = component.get("v.caseId");
        var carrier = component.get("v.carrierVal");
        var state = component.get("v.stateVal");
        var country = component.get("v.productDestinationCountryParent");
        var noneLabel = component.get("v.fieldIdLabelMap").nonePicklist;
        if (country == noneLabel) {
            country = null;
        }
        if (country != 'US') {
            this.clearStateValue(component, event, helper);
        }
        //console.log('bailment ', isBailment);
        //console.log('country', country);

        // enable add claim button if there is a value in for the Purchase Order
        this.validateParentInputFields(component, event, helper);

        var action = component.get("c.updateParentCase");

        action.setParams({
            parentCaseId: caseId,
            poNumber: poNumber,
            beamOrderNumber: beamOrderNumber,
            isBailment: isBailment,
            isGTR: isGTR,
            country: country,
            carrier: carrier,
            state: state
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                //console.log('parent case updated ', responseMap);

                if ('success' in requestObject && !requestObject['success']) {
                    //console.log('success');

                    //helper.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                }

                //helper.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Case Updated', 2000);
            } else if (state == 'ERROR') {
                //helper.createUIMessageComponent(component, event, helper, 'error', 'Error', 'An unexpected error occurred, the Case was not created.', 2000);
            } else {
                //helper.createUIMessageComponent(component, event, helper, 'info', 'Warning', 'Callback did not complete successfully.', 2000);
            }
        });
        $A.enqueueAction(action);
    },
    setDefaultPicklistValue: function(component, event, helper) {
        var noneLabel = component.get("v.fieldIdLabelMap").nonePicklist;
        component.set("v.productDestinationCountryParent", noneLabel);
        component.set("v.distributorCurrency", noneLabel);
    },
    setRadioGroupValues: function(component, event, helper, values) {
        var radioButtonChoices = component.get("v.radioButtonChoices");

        var masterObject = {};
        var objList = [];

        for (var item in values) {
            objList.push({
                label: values[item],
                value: values[item]
            });
        }
        component.set("v.quantityTypeChoices", objList);
    },
    checkShipDate: function(component, event, helper, auraId, fieldVal) {
        var dateVal = component.get("v." + fieldVal);
        var dateAuraId = component.find(auraId);
        var maxDate = new Date(9999, 0, 1);
        var lastYear = new Date().getFullYear() - 1;
        var lastYearDate = new Date(lastYear, 0, 1);
        var formatedDate;
        var hasErrors = false;
        component.set('v.previousYear', lastYear);

        if ($A.util.isEmpty(dateVal)) {
            hasErrors = true;
        }
        try {
            formatedDate = $A.localizationService.formatDate(dateVal, 'MMM d, yyyy');
        } catch (err) {
            // unable to parse date
        }
        var parsedDate = new Date(formatedDate);

        if (!$A.util.isEmpty(dateAuraId)) {
            try {
                if (parsedDate < lastYearDate || parsedDate > maxDate || parsedDate.toDateString() == 'Invalid Date') {
                    hasErrors = true;
                    component.set('v.invalidDate', true);
                    if (!$A.util.isEmpty(dateVal)) {
                        component.set('v.parsedDate', formatedDate);
                    }
                } else {
                    component.set('v.invalidDate', false);
                }
            } catch (err) {
                console.log(err);
            }
        }

        return {
            'hasErrors': hasErrors
        };

    },
    addStateCodeClaim: function(component, event, helper) {
        var stateCodeClaimList = component.get('v.stateCodeClaimRequiredIdList');
    },

    addFieldToRenderMapping: function(component, event, helper, field) {
        var claimsMap = component.get("v.claimTypeMap");
        for (var type in claimsMap) {
            if (!claimsMap[type].hasOwnProperty(field)) {
                claimsMap[type].push(field);
            }
        }
    },
    removeFieldFromRenderMapping: function(component, event, helper, field) {
        var claimsMap = component.get("v.claimTypeMap");
        for (var type in claimsMap) {
            if (Object.values(claimsMap[type]).indexOf(field) > -1) {
                claimsMap[type].splice(claimsMap[type].indexOf(field), 1);
            }
        }
    },
    addFieldToRequiredMapping: function(component, event, helper, field) {
        var claimsMap = component.get("v.claimTypeRequiredMap");
        for (var type in claimsMap) {
            if (!claimsMap[type].hasOwnProperty(field)) {
                claimsMap[type].push(field);
            }
        }
    },
    removeFieldFromRequiredMapping: function(component, event, helper, field) {
        var claimsMap = component.get("v.claimTypeRequiredMap");
        for (var type in claimsMap) {
            if (Object.values(claimsMap[type]).indexOf(field) > -1) {
                claimsMap[type].splice(claimsMap[type].indexOf(field), 1);
            }
        }
    },
    resetValidity: function(component, event, helper) {
        var nonePicklist = component.get("v.fieldIdLabelMap").nonePicklist;
        var selectedClaimType = component.get('v.selectedClaimType');
        var auraIdList = component.get('v.claimTypeMap')[selectedClaimType];

        var hasErrors = false;
        var errorIdList = [];

        //this.checkShipDate(component, event, helper);
        if (!$A.util.isEmpty(auraIdList) && selectedClaimType != nonePicklist) {
            auraIdList.forEach(function(auraid) {

                try {
                    var field = component.find(auraid);

                    try {
                        field.set('v.validity', {
                            valid: false,
                            badInput: true
                        });
                    } catch (err1) {

                    }
                } catch (err2) {

                }
            });
        }

    },
    clearStateValue: function(component, event, helper) {
        component.set('v.stateVal', null);
    }

})