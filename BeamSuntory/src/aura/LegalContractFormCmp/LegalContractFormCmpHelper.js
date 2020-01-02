({    
	getQuestions: function(component, event, helper) {
        var action = component.get("c.getApplicationQuestionData");
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
         var stqmap = component.get('v.SectiontoQuestionMap');
         console.log('---Order of QuestionMap---',JSON.stringify(stqmap));
         var questionMap = component.get('v.questionMap');  
         var orderedSection = component.get('v.orderedSection');
         var questionAnswerMapSet =  component.get('v.questionAnswerMap');
         console.log("questionAnswerMapSet: " + JSON.stringify(questionAnswerMapSet));
         var newBody = [];       
         var body = component.get('v.questionBody');
         component.set("v.questionBody", "");
         while (body.length > 0) {
            body.pop();
         }
         console.log("orderedSection: " + orderedSection);    
         for(var t in orderedSection){           
             var questionSet = [];
             questionSet = stqmap[orderedSection[t]];
             console.log("questionSet: " + questionSet);
             $A.createComponent(
                 "lightning:badge", {                    
                     "class": "slds-text-heading--label",
                     "label": orderedSection[t]
                 },                  
                 function(textsections, status, errorMessage) {
                         if (status === "SUCCESS") {                             
                             body.push(textsections);
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
             for (var i in questionSet) { 
                 var quesAnswers = questionAnswerMapSet[questionSet[i].Id];                 
                 if(questionSet[i].Type__c == 'Text'){
                 	//console.log("Answers: " + questionAnswerMapSet[questionSet[i].Id]);
                 	var requiredText = '';
                 	if(questionSet[i].Required__c)
                        requiredText = 'requiredField';
                     else
                        requiredText = questionSet[i].Id;
                  	$A.createComponent(
                      "lightning:textarea",{
                         "aura:id": requiredText,                          
                         "name": questionSet[i].Id,
                         "class": "slds-p-bottom_medium",
                         "label": questionSet[i].Question__c,
                         "maxlength": "500", 
                         "placeholder":questionSet[i].Help_Text__c,                         
                         "onchange": component.getReference('c.handleInputChange'),                        
                         "required": questionSet[i].Required__c,
                          "value": quesAnswers
                      },
                      function(textquestions, status, errorMessage) {
                         if (status === "SUCCESS") { 
							 //var body = component.get("v.questionBody");                     
                             body.push(textquestions);  
                             component.set("v.questionBody", body);
                         } else if (status === "INCOMPLETE") {
                             console.log("No response from server or client is offline.")
                             // Show offline error
                         } else if (status === "ERROR") {
                             console.log("Error: " + errorMessage);
                             // Show error message
                         }
                     });                                     
                 }else if(questionSet[i].Type__c == 'Date Range'){
                     	var requiredText = '';
                        if(questionSet[i].Required__c)
                            requiredText = 'requiredField';
                         else
                            requiredText = questionSet[i].Id;
                         
                         $A.createComponent(                              
                         "lightning:input", {
                            "aura:id": requiredText,                          
                            "name": questionSet[i].Id,
                            "type": "date",
                            "class": "slds-p-bottom_medium",
                            "label": questionSet[i].Question__c,
                            "onchange": component.getReference('c.handleInputChange'), 
                            "required": questionSet[i].Required__c,
                             "value": questionAnswerMapSet[questionSet[i].Id]
                        },
                        function(datelem, status, errorMessage) {
                            if (status === "SUCCESS") {
                                body.push(datelem);
                                component.set("v.questionBody", body);                                 
                            } else if (status === "INCOMPLETE") {
                                console.log("No response from server or client is offline.")
                                    // Show offline error
                            } else if (status === "ERROR") {
                                console.log("Error: " + errorMessage);
                                // Show error message
                            }
                        });
             	} //date ends               
               }
          }
     },  
    //Method to build question set
	buildApplication: function(component, event, helper){
        //Call getquestions helper method
		var getQuestionsPromise = helper.getQuestions(component, event, helper);
        getQuestionsPromise.then(
            $A.getCallback(function(result) {
                component.set('v.questionMap', result['appQuestions']);
                component.set('v.SectiontoQuestionMap', result['SectiontoQuestionMap']);
                component.set('v.orderedSection', result['orderedSection']);
                //Call buildquestions helper method
                helper.buildQuestions(component, event, helper);
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred getting events : ' + error.message);
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });
	},   
    viewQuestions: function(component, event, helper) {
        console.log('viewQuestions:::');       
        var legalFormId = component.get("v.legalRecordId");
        console.log('legalFormId::: ',legalFormId);
        
        var action = component.get("c.getSelectedlegalForms");
        action.setParams({ "LegalId" : legalFormId });
        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log('Success:::');
                    var retVal = response.getReturnValue();
                    console.log('retVal:::'+ retVal);
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
    // Update Legal Contract record
    updateLegalContract: function(component, event, helper) {
        var action = component.get("c.updateLegalContractForm");        
        console.log('Questions>>, ', JSON.stringify(helper.updateResponseRecords(component, event, helper)));
        var applications = helper.buildLegalResponses(component, event, helper);
        console.log('AppUpdate>>, ', JSON.stringify(Object.values(applications)));
        action.setParams({
            "questionMap": JSON.stringify(helper.updateResponseRecords(component, event, helper)),
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
    //Validate  requried fields in legal form
    isFormValid: function (component) {       
        return (component.find('requiredField') || [])
        .filter(function (i) {
            var value = i.get('v.value');
            console.log('value::::' +value);
            return !value || value == '' || value.trim().length === 0;
        })
        .map(function (i) {
            return i.get('v.fieldName');
        });
	},
    // Insert Legal Contract record
    createLegalContract: function(component, event, helper) {
        var action = component.get("c.insertLegalContractForm");
        console.log('Questions>>, ', JSON.stringify(helper.buildResponseRecords(component, event, helper)));
        var applications = helper.buildLegalContractForm(component, event, helper);
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
    updateQuestionToMap: function(component, event, helper, questionId, response) {
        var answerResponseMap = component.get('v.answerResponseMap');
		var questionResponseMap = component.get('v.questionResponseMap');       
        if (typeof response === 'object') {
            console.log('string val ', Object.values(response).toString());
            questionResponseMap[questionId] = Object.values(response).toString();
        } else {
            questionResponseMap[questionId] = response;
        }
        component.set('v.questionResponseMap', questionResponseMap);
        console.log('questions Map: ', questionResponseMap);        
        component.set('v.answerResponseMap', answerResponseMap);
        console.log('update questions Map: ', answerResponseMap);
    },
    buildResponseRecords: function(component, event, helper) {
        var questionResponseMap = component.get('v.questionResponseMap');        
        var keys = Object.keys(questionResponseMap);
        var responses = [];        
        console.log('QuestionResponseMapKeys:::', keys);
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
    updateResponseRecords: function(component, event, helper) {
        var answerResponseMap = component.get('v.answerResponseMap');  
        var answerIdsMap = component.get('v.answerIdsMap');
        var questionResponseMap = component.get('v.questionResponseMap'); 
        var legalRecordId = component.get("v.legalRecordId");
        
        var keys = Object.keys(questionResponseMap);
        var responses = [];        
        console.log('QuestionResponseMapKeys:::', keys);
        console.log('answerIdsMap:::', JSON.stringify(questionResponseMap));
        for (var i in keys) {            
            console.log('i ', i);
            console.log('keys ', questionResponseMap[keys[i]]);
            
            var responseObjectMap = {};
			responseObjectMap['Application_Question__c'] = keys[i];            
            responseObjectMap['Answer_Text__c'] = questionResponseMap[keys[i]];
            responseObjectMap['Id'] = answerIdsMap[keys[i]];
            responseObjectMap['Legal_Contract_Form__c'] = legalRecordId;
            responses.push(responseObjectMap);
        }
        return responses;
    },
    isEmpty: function(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
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
    buildLegalContractForm: function(component, event, helper) {        
        var applications = [];
        var application = {};      
        application['Application_Question_Set__c'] = component.get('v.questionSetId');
        applications.push(application);
        return applications;
    },
    buildLegalResponses: function(component, event, helper) {        
        var applications = [];
        var application = {};      
        application['Legal_Contract_Form__c'] = component.get('v.legalRecordId');
        applications.push(application);
        return applications;
    },   
    showNotice: function(component, event, helper, type, message, title) {
        component.find('legal_approval_prompt').showNotice({
            "variant": type,
            "header": title,
            "message": message
        });
    },
    showSpinner: function (component, event, helper) {
        var spinner = component.find("legal_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function (component, event, helper) {
        var spinner = component.find("legal_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
    pageDoneRendering: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
        component.set('v.isDoneRendering', true);
    }    
})