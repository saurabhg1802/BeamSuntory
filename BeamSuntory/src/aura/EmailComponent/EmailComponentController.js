({
    init: function(component, event, helper) {
    	helper.populateLabelIdMap(component, event, helper);
        helper.getEmailFieldFromUser(component, event, helper);


        setTimeout(function() {
            component.set('v.isDoneRendering', true);
        }, 250);

    },

    validateEmail: function(component, event, helper) {
        helper.validateEmail(component, event, helper);
        //helper.updateUserRecord(component, event, helper);
        /*
        var emailInput = component.find("emailInputLarge");
        if (emailInput == null) {
            return;
        }
        var validity = emailInput.get('v.validity');

        if (validity != null) {
            if (validity.valid) {
                helper.addEmail(component, event, helper);
            }
        }
        */
    },
    addEmail: function(component, event, helper) {
        helper.addEmail(component, event, helper);
        helper.closeModal(component, event, helper);
        helper.clearOutEmailInput(component, event, helper);
    },
    onInputChange: function(component, event, helper) {

    },
    removeEmail: function(component, event, helper) {
        var emailToRemove = event.currentTarget.getAttribute("data-index");
        //var emailToRemove = event.currentTarget.dataset.index;
        var emailList = component.get("v.emailList");
        var emailToRemoveFromCase = emailList[emailToRemove];

        for (var index in emailList) {
            if (emailList[index] == emailList[emailToRemove]) {
                emailList.splice(index, 1);
            }

            /*var filteredList = emailList.filter(function(value) {
            	console.log('indexOf(value) ' + emailList.indexOf(value));
            	console.log('value ' + value);
            	return emailList.indexOf(value) != emailToRemove;
            });
            */
        }
        helper.removeEmailFromCase(component, event, helper, emailToRemoveFromCase);
        component.set("v.emailList", emailList);
    },
    //A helper method that sets the "Spinner" flag to true
    showSpinner: function(component, event, helper) {
        helper.showSpinner(component, event, helper);
    },

    //A helper method that sets the "Spinner" flag to false
    hideSpinner: function(component, event, helper) {
        helper.hideSpinner(component, event, helper);
    },
    handleChange: function(component, event, helper) {
        console.log('in change');
        helper.validateEmail(component, event, helper);
        //helper.handleChange(component, event, helper);
        //helper.updateUserRecord(component, event, helper);
    },
    openModal: function(component, event, helper) {
        helper.openModal(component, event, helper);
    },
    closeModal: function(component, event, helper) {
        //helper.clearAllValues(component, event, helper);
        helper.closeModal(component, event, helper);
        //component.set('v.editMode', null);
        //component.set('v.editCaseId', null);
    },


})