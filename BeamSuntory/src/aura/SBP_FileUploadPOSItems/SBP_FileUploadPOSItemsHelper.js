({

    uploadHelper: function(component, event, helper) {
        // start/show the loading spinner   
        // get the selected files using aura:id [return array of files]
        var fileInput = component.find("fileId").get("v.files");
        // get the first file using array index[0]  
        var file = fileInput[0];
        var brand = component.get('v.brand');
        var object = component.get('v.objectType');
        var recordMap = {};
        var brandMap = component.get('v.brandMap')
        brandMap = brandMap[brand][object];

        var topRowArray = [];
        // create a FileReader object 
        var objFileReader = new FileReader();
        var fieldApiMap = component.get('v.fieldApiMap');
        // set onload function of FileReader object   
        objFileReader.onload = $A.getCallback(function() {
            var fileContents = objFileReader.result;
            var objectType = component.get('v.objectType');

            var lines = fileContents.split("\r");
            for (var count = 0; count < lines.length; count++) {
                var rowContent = lines[count].split(",");

                if (count == 0) {
                    topRowArray = rowContent;
                }
                if (count > 0 && count < lines.length - 1) {
                    recordMap[count] = {};
                } else {
                    continue;
                }

                for (var i = 0; i < rowContent.length; i++) {
                    console.log(rowContent[i]);
                    if (count == 0) {

                    } else {
                        console.log('rowContent[i]: ', rowContent[i]);
                        console.log('topRowArray[i][i]: ', topRowArray[i]);
                        if (topRowArray[i] != undefined) {
                            var val = brandMap[topRowArray[i].trim()];
                            console.log('val ', val);
                            if (rowContent[i] != null && rowContent[i] != '' && rowContent[i] != ' ' && val != undefined) {
                                recordMap[count][val] = rowContent[i].trim();
                            }
                        }
                    }
                }
            }
            helper.uploadRecords(component, event, helper, Object.values(recordMap));

            var base64 = 'base64,';
            var dataStart = fileContents.indexOf(base64) + base64.length;

            fileContents = fileContents.substring(dataStart);
        });

        objFileReader.readAsText(file);
    },
    uploadRecords: function(component, event, helper, map) {
        var objectType = component.get('v.objectType');
        var action;
        if (objectType == 'Application') {
            action = component.get("c.updateApplications");
        } else if (objectType == 'POS') {
            action = component.get("c.updatePOS");
        }

        console.log('json ', JSON.stringify(Object.values(map)));
        action.setParams({
            jsonPOS: JSON.stringify(Object.values(map)),
        });

        // set call back 
        action.setCallback(this, function(response) {
            // store the response / Attachment Id   
            var state = response.getState();
            if (state === "SUCCESS") {
                var responseObj = response.getReturnValue();
                console.log(responseObj);
                if (responseObj) {
                    alert('File Uploaded!');
                    helper.closeModal(component, event, helper);
                    helper.showToast('Success', 'File Uploaded', 'success');
                } else {
                    alert('Error Occured Please Contact Customer Service');
                }
                component.set('v.isLoading', false);

            } else if (state === "INCOMPLETE") {
                alert("From server: " + response.getReturnValue());
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        // enqueue the action
        $A.enqueueAction(action);
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
    closeModal: function(component, event, helper) {
        $A.get("e.force:closeQuickAction").fire()
    },
    validateCode: function(component, event, helper) {
        var action = component.get("c.validateVerificationCode");

        action.setParams({
            'verificationCode': component.get('v.verificationCode')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var requestObject = response.getReturnValue();
                    resolve(requestObject['responseMap']);

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
    showSpinner: function(component, event, helper) {
        var spinner = component.find("file_upload_spinner");
        $A.util.addClass(spinner, "slds-show");
        $A.util.removeClass(spinner, "slds-hide");
    },
    hideSpinner: function(component, event, helper) {
        console.log('hiding spinner');
        var spinner = component.find("file_upload_spinner");
        $A.util.addClass(spinner, "slds-hide");
        $A.util.removeClass(spinner, "slds-show");
    },
})