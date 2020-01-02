({

    checkAccountStatus: function(component, event, helper) {
        var action = component.get("c.getAccountStatus");

        action.setParams({
            "accountId": component.get('v.accountRecord').Id,
            "brand": component.get('v.brand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

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

    getQuestions: function(component, event, helper) {

        var action = component.get("c.getAccountApplicationData");

        var isInternational = false;
        var country = $A.get("$Locale.userLocaleCountry");

        if (country != 'US') {
            isInternational = true;
        }

        action.setParams({
            "brand": component.get('v.brand'),
            "isInternational": isInternational
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log(retVal);
                    var requestObject = retVal['responseMap'];
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

    buildQuestions: function(component, event, helper) {
        var questionMap = component.get('v.questionMap');
        var body = component.get('v.questionBody');
        var newBody = [];

        while (body.length > 0) {
            body.pop();
        }

        for (var i in questionMap) {
            //console.log('---------------------');
            //console.log(questionMap[i]);
            if (questionMap[i].Type__c == 'Radio') {
                var answers = questionMap[i].Application_Answers__r;
                var optionList = [];

                for (var x in answers) {
                    var options = {};
                    //console.log(answers[x]);
                    options['label'] = answers[x].Answer__c;
                    options['value'] = answers[x].Answer__c;
                    optionList.push(options);
                }
                $A.createComponent(
                    "lightning:radioGroup", {
                        "aura:id": questionMap[i].Id,
                        "name": questionMap[i].Id,
                        "label": questionMap[i].Question__c,
                        "options": optionList,
                        "class": "slds-p-bottom_medium",
                        "type": 'radio',
                        "onchange": component.getReference('c.handleInputChange'),
                        "required": true
                    },
                    function(radioQuestion, status, errorMessage) {
                        if (status === "SUCCESS") {
                            body.push(radioQuestion);
                            component.set("v.questionBody", body);

                        } else if (status === "INCOMPLETE") {
                            console.log("No response from server or client is offline.")
                                // Show offline error
                        } else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                    }
                );
            } else if (questionMap[i].Type__c == 'Text') {
                $A.createComponent(
                    "lightning:textArea", {
                        "aura:id": questionMap[i].Id,
                        "name": questionMap[i].Id,
                        "class": "slds-p-bottom_medium",
                        "label": questionMap[i].Question__c,
                        "maxlength": "255",
                        "onchange": component.getReference('c.handleInputChange'),
                        "required": true
                    },
                    function(text, status, errorMessage) {
                        if (status === "SUCCESS") {
                            body.push(text);
                            component.set("v.questionBody", body);

                        } else if (status === "INCOMPLETE") {
                            console.log("No response from server or client is offline.")
                                // Show offline error
                        } else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                    }
                );
            } else if (questionMap[i].Type__c == 'Checkbox Group') {
                var answers = questionMap[i].Application_Answers__r;
                var optionList = [];

                for (var x in answers) {
                    var options = {};
                    //console.log(answers[x]);
                    options['label'] = answers[x].Answer__c;
                    options['value'] = answers[x].Answer__c;
                    optionList.push(options);
                }
                $A.createComponent(
                    "lightning:checkboxGroup", {
                        "aura:id": questionMap[i].Id,
                        "value": '',
                        "class": "slds-p-bottom_medium",
                        "name": questionMap[i].Id,
                        "options": optionList,
                        "label": questionMap[i].Question__c,
                        "onchange": component.getReference('c.handleInputChange'),
                        "required": true
                    },
                    function(checkBoxOption, status, errorMessage) {
                        if (status === "SUCCESS") {
                            body.push(checkBoxOption);
                            console.log('BODY ', body);
                            component.set("v.questionBody", body);

                        } else if (status === "INCOMPLETE") {
                            console.log("No response from server or client is offline.")
                                // Show offline error
                        } else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                            // Show error message
                        }
                    }
                );
            }
        }

    },

    showQuestions: function(component, event, helper) {
        component.set('v.showQuestions', true);
    },
    hideQuestions: function(component, event, helper) {
        component.set('v.showQuestions', false);
    },

    addQuestionToMap: function(component, event, helper, questionId, response) {
        var questionResponseMap = component.get('v.questionResponseMap');

        if (typeof response === 'object') {
            console.log('string val ', Object.values(response).toString());
            questionResponseMap[questionId] = Object.values(response).toString();
        } else {
            questionResponseMap[questionId] = response;
        }

        component.set('v.questionResponseMap', questionResponseMap);
        console.log('questions Map: ', questionResponseMap);

    },


    createApplication: function(component, event, helper) {
        var action = component.get("c.insertAccountApplication");
        console.log('Questions>>, ', JSON.stringify(helper.buildResponseRecords(component, event, helper)));
        var applications = helper.buildAccountApplication(component, event, helper);

        console.log('App>>, ', JSON.stringify(Object.values(applications)));

        action.setParams({
            "questionMap": JSON.stringify(helper.buildResponseRecords(component, event, helper)),
            "jsonApplications": JSON.stringify(Object.values(applications))
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

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

    buildResponseRecords: function(component, event, helper) {
        var questionResponseMap = component.get('v.questionResponseMap');
        var keys = Object.keys(questionResponseMap);
        var responses = [];

        for (var i in keys) {
            console.log('i ', i);
            console.log('keys ', questionResponseMap[keys[i]]);
            var responseObjectMap = {};
            responseObjectMap['Application_Question__c'] = keys[i];
            responseObjectMap['Answer_Text__c'] = questionResponseMap[keys[i]];
            responses.push(responseObjectMap);
        }
        return responses;
    },
    resetAccountStatus: function(component, event, helper) {
        component.set('v.accountStatus', null);
    },
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },
    clearQuestionBody: function(component, event, helper) {
        var body = component.get('v.questionBody');

        while (body.length > 0) {
            body.pop();
        }
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
    moveToNextScreen: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate('FINISH');
    },
    showNotice: function(component, event, helper, type, message, title) {
        component.find('account_approval_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
    showSpinner: function(component, event, helper) {
        var spinner = component.find("account_approval_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        var spinner = component.find("account_approval_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.isDoneRendering', true);

    },


    buildApplication: function(component, event, helper) {
        var getQuestionsPromise = helper.getQuestions(component, event, helper);
        getQuestionsPromise.then(
            $A.getCallback(function(result) {
                component.set('v.questionMap', result['appQuestions']);
                component.set('v.questionSetId', result['questionSetId']);
                component.set('v.states', result['picklistValues']['states']);
                helper.setStateValues(component, event, helper);
                helper.buildQuestions(component, event, helper);
                helper.showQuestions(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
    },

    submitApplicationWithExistingResponses: function(component, event, helper) {
        var action = component.get("c.sendRequestWithPreviousAnswers");
        var accountId;
        if (component.get('v.accountRecord')) {
            accountId = component.get('v.accountRecord').Id;
        }

        action.setParams({
            "accountId": accountId,
            "brand": component.get('v.brand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

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
    moveToFinalScreen: function(component, event, helper) {
        var navigate = component.get("v.navigateFlow");
        navigate('FINISH');
    },

    isCurrentProgramAvailable: function(component, event, helper) {
        var action = component.get("c.isProgramAvailable");

        action.setParams({
            "brand": component.get('v.brand')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal['responseMap']);

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
    buildAccountApplication: function(component, event, helper) {
        var currentUserCountry = component.get('v.currentUserCountry');
        var applications = [];
        var application = {};

        application['Premise_Type__c'] = component.get('v.premiseType');
        if (!helper.isEmpty(component.get('v.accountRecord'))) {
            application['Account__c'] = component.get('v.accountRecord').Id;
        }
        if (currentUserCountry != undefined && currentUserCountry != '') {
            if (currentUserCountry != 'US') {
                application['Type__c'] = 'International';
            }
        }

        application['City__c'] = component.get('v.city');
        application['State__c'] = component.get('v.state');
        application['Country__c'] = component.get('v.country');
        application['Brand__c'] = component.get('v.brand');
        application['Application_Question_Set__c'] = component.get('v.questionSetId');
        application['Account_Name__c'] = component.get('v.accountName');
        applications.push(application);

        return applications;
    },
    setStateValues: function(component, event, helper) {
        var states = component.get('v.states');
        var stateOptions = [];

        for (var i in states) {
            stateOptions.push({
                label: states[i],
                value: states[i]
            });
        }
        component.set("v.stateOptions", stateOptions);
    },
})