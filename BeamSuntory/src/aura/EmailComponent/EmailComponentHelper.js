({
    validateEmail: function(component, event, helper) {
        var inputTextArea = component.get("v.emailInputLarge");
        var emailList = component.get("v.emailList");
        var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        var invalidEmails = [];
        var duplicateEmails = [];
        var masterEmails = [];
        var showAddEmail = false;

        for (var key in inputTextArea) {
            var emails = inputTextArea[key].split(';');
            for (var email in emails) {
                var emailInputVal = emails[email].trim();
                if ((emailInputVal == '') || (emailInputVal == null)) {
                    continue;
                }

                // email does not already exist in list AND it is a valid email
                if ((emailList.indexOf(emailInputVal) == -1) && emailRegex.test(emailInputVal)) {
                    showAddEmail = true;
                }
                // email is invalid
                else if (!emailRegex.test(emailInputVal) && emailInputVal != null && emailInputVal != '') {
                    invalidEmails.push(emailInputVal);
                }
                // email already exists
                else if (emailList.indexOf(emailInputVal) != -1 && emailInputVal != null && emailInputVal != '') {
                    duplicateEmails.push(emailInputVal);
                }
            }
        }

        if (showAddEmail && invalidEmails.length === 0 && duplicateEmails.length === 0) {
            component.set("v.showEnabledAddEmailButton", true);
            component.set("v.showDisabledAddEmailButton", false);

        } else {
            component.set("v.showEnabledAddEmailButton", false);
            component.set("v.showDisabledAddEmailButton", true);
        }

        //this.updateMasterEmails(component, event, helper, masterEmails.join(','));
        //this.updateSelectedEmails(component, event, helper, masterEmails.join(',').toString());
        this.setInvalidEmails(component, event, helper, invalidEmails);
        this.setDuplicateEmails(component, event, helper, duplicateEmails);
        //this.clearOutEmailInput(component, event, helper);
        //this.closeModal(component, event, helper);
        //component.set("v.emailList", emailList);
    },

    addEmail: function(component, event, helper) {
        var emailInput = component.get("v.emailInputLarge");
        var emailList = component.get("v.emailList");
        var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        var emailListOnCase = component.get("v.emailListOnCase");


        for (var key in emailInput) {
            var emails = emailInput[key].split(';');
            for (var email in emails) {
                console.log('emails[email] ' + emails[email]);
                var emailInputVal = emails[email].trim();
                if ((emailInputVal == '') || (emailInputVal == null)) {
                    continue;
                }

                // email does not already exist in list AND it is a valid email
                if ((emailList.indexOf(emailInputVal) == -1) && emailRegex.test(emailInputVal)) {
                    try {
                        emailList.push(emailInputVal);
                    } catch (e) {
                        console.log(e);
                    }


                }
                if ((emailListOnCase.indexOf(emailInputVal) == -1) && emailRegex.test(emailInputVal)) {
                    emailListOnCase.push(emailInputVal);
                }
            }
        }
        component.set("v.emailList", emailList);
        component.set("v.emailListOnCase", emailListOnCase);

        this.updateCaseEmailField(component, event, helper);
    },
    clearOutEmailInput: function(component, event, helper) {
        component.set("v.emailInputLarge", null);
    },
    getEmailFieldFromUser: function(component, event, helper) {
        try {
            var userId = component.get("v.userId");
            var action = component.get("c.getLastCaseEmailFieldByUser");
            action.setParams({
                userId: userId
            });
            action.setCallback(this, function(data) {
                var state = data.getState();
                if (state == 'SUCCESS') {
                    var requestObject = data.getReturnValue();
                    var responseMap = requestObject['responseMap'];
                    console.log('Response Map', responseMap);
                    if ('success' in requestObject && !requestObject['success']) {
                        //this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                    }
                    console.log('userid ' + userId);
                    console.log('responseMap ', responseMap);

                    var allEmails = responseMap['allEmails'];
                    component.set("v.ccEmailField", allEmails);
                    if (allEmails != null) {
                        this.validateEmailsFromCase(component, event, helper, allEmails);
                    } else {
                        component.set("v.Spinner", false);
                    }

                    //this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Labels Retrieved', 2000);
                } else if (state == 'ERROR') {
                    //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
                } else {
                    //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                }
                //this.hideSpinner(component, event, helper);
            });
            $A.enqueueAction(action);
        } catch (err) {
            console.log(err);
        }
    },

    validateEmailsFromCase: function(component, event, helper, emails) {
        var emailsOnCaseRecord = emails.split(';');
        var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        var emailList = component.get("v.emailList");
        for (var email in emailsOnCaseRecord) {

            if ((emailsOnCaseRecord.indexOf(emailsOnCaseRecord[email]) != -1) &&
                (emailsOnCaseRecord[email] != '') &&
                (emailsOnCaseRecord[email] != null) &&
                emailRegex.test(emailsOnCaseRecord[email])) {
                emailList.push(emailsOnCaseRecord[email]);
            }
        }
        component.set("v.emailList", emailList);
        component.set("v.emailListOnCase", emailList);
        component.set("v.Spinner", false);
        this.updateCaseEmailField(component, event, helper);
        
    },

    updateCaseEmailField: function(component, event, helper) {
        var action = component.get("c.updateCaseEmailField");
        var emailList = component.get("v.emailList");
        var caseId = component.get("v.caseId");
        var emails = '';

        for (var email in emailList) {
            emails += emailList[email] + ';';
        }

        action.setParams({
            caseId: caseId,
            ccEmail: emails
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    //this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                    console.log('success');
                }

                //this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Labels Retrieved', 2000);
            } else if (state == 'ERROR') {
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }
            //this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);

    },
    removeEmailFromCase: function(component, event, helper, emailToRemove) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.removeEmailFromCase");
        var caseId = component.get("v.caseId");

        action.setParams({
            caseId: caseId,
            emailToRemove: emailToRemove
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                var responseMap = requestObject['responseMap'];
                console.log('Response Map', responseMap);
                if ('success' in requestObject && !requestObject['success']) {
                    //this.createUIMessageComponent(component, event, helper, 'error', 'Error', requestObject['message'], 2000);
                    console.log('success');
                }

                //this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Labels Retrieved', 2000);
            } else if (state == 'ERROR') {
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);

    },
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
                    messageContainer = 'pageMessageContainer';

                    var targetComponent = component.find(messageContainer);
                    var body = targetComponent.get("v.body");
                    body.push(message);
                    targetComponent.set("v.body", body);
                    //A timeout to make the message fade away. Then, delete the component after half a second
                    try {
                        window.setTimeout($A.getCallback(function() {
                            $A.util.addClass(component.find(uiMessageId), "slds-transition-hide");
                            window.setTimeout($A.getCallback(function() { /*component.find(uiMessageId).destroy()}*/
                                console.log('Destroyed');
                            }), duration + 500);
                        }), duration);
                    } catch (err) {
                        console.log(err);
                        console.log('This error should be resolved on Feb9th/Feb10th when Spring\'18 is live.');
                    }

                } else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.")
                } else if (status === "ERROR") {
                    console.log("Error creating toast: " + errorMessage);
                }
            }
        );
    },
    handleChange: function(component, event, helper) {
        // Get the list of the "value" attribute on all the selected options
        var selectedOptionsList = event.getParam("value");
        //var selectedOptionsList = event.getParam("label");
        console.log("Options selected: " + selectedOptionsList);
        console.log('component.get("v.selectedEmails") ', component.get("v.selectedEmails"));
        console.log('component.get("v.masterEmailList") ', component.get("v.masterEmailList"));

    },
    setDuplicateEmails: function(component, event, helper, duplicateEmails) {
        if (duplicateEmails.length > 0) {
            if (duplicateEmails.length == 1) {
                component.set("v.duplicateEmails", 'Duplicate email: ' + duplicateEmails.join(','));
            } else {
                component.set("v.duplicateEmails", 'Duplicate emails: ' + duplicateEmails.join(','));
            }
        } else {
            component.set("v.duplicateEmails", null);
        }
    },
    setInvalidEmails: function(component, event, helper, invalidEmails) {
        if (invalidEmails.length > 0) {
            if (invalidEmails.length == 1) {
                component.set("v.invalidEmails", 'Invalid email: ' + invalidEmails.join(','));
            } else {
                component.set("v.invalidEmails", 'Invalid emails: ' + invalidEmails.join(','));
            }
        } else {
            component.set("v.invalidEmails", null);
        }
    },
    openModal: function(component, event, helper) {
        this.showPopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.showPopupHelper(component, 'backdrop', 'slds-backdrop_');
        //component.set('v.inModal', true);
    },
    showPopupHelper: function(component, componentId, className) {
        var modal = component.find(componentId);
        $A.util.removeClass(modal, className + 'hide');
        $A.util.addClass(modal, className + 'open');
    },
    closeModal: function(component, event, helper) {
        this.hidePopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.hidePopupHelper(component, 'backdrop', 'slds-backdrop_');
        //this.clearValidationMessages(component, event, helper);
        //component.set('v.inModal', false);
    },
    hidePopupHelper: function(component, componentId, className) {
        var modal = component.find(componentId);
        $A.util.addClass(modal, className + 'hide');
        $A.util.removeClass(modal, className + 'open');
    },
    //A helper method that sets the "Spinner" flag to true
    showSpinner: function(component, event, helper) {
        component.set("v.Spinner", true);
    },

    //A helper method that sets the "Spinner" flag to false
    hideSpinner: function(component, event, helper) {
        component.set("v.Spinner", false);
    },
    populateLabelIdMap: function(component, event, helper) {
        this.showSpinner(component, event, helper);
        var action = component.get("c.getEmailLabelMap");
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

                //this.createUIMessageComponent(component, event, helper, 'confirm', 'Success', 'Labels Retrieved', 2000);
            } else if (state == 'ERROR') {
                console.log('error');
                console.log(data.getError());
                //this.displayToast('Fatal Error', 'An unexpected error occurred, the Case was not created.', 'error');
            } else {
                //this.displayToast('Warning', 'Callback did not complete successfully.', 'warning');
                console.log('error');
                console.log(data.getError());
            }
            this.hideSpinner(component, event, helper);
        });
        $A.enqueueAction(action);
    },
})