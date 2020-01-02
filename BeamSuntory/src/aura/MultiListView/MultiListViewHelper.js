({
    getCaseList: function (component) {
        var action = component.get("c.getOpenCases");

        //Set up the callback
        var self = this;
        action.setCallback(this, function (actionResult) {
            component.set("v.cases", actionResult.getReturnValue());
            component.set("v.Open", true);
            console.log('actionResult==>' + actionResult.getReturnValue().length);
            //$('#pop').hide();
            component.set('v.isLoading', false);
            if (actionResult.getReturnValue().length == 0)
                $('#Norecs').show();
            console.log('I ran again actionResult==>' + actionResult.getReturnValue().length);

        });
        $A.enqueueAction(action);
    },

    getUserProf: function (component) {
        var action = component.get("c.getUserProf");
        //Set up the callback
        var self = this;
        action.setCallback(this, function (actionResult) {
            component.set("v.NotPlus", actionResult.getReturnValue());
            component.set('v.isLoading', false);
        });
        $A.enqueueAction(action);
    },

    getClosedCases: function (component) {
        $('#Norecs').hide();
        var action = component.get("c.getClosedCases");
        //Set up the callback
        var self = this;
        action.setCallback(this, function (actionResult) {
            var today = new Date();
            var dd = today.getUTCDate();
            var mm = today.getUTCMonth() + 1; //January=0
            var yyyy = today.getUTCFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }
            today = yyyy + '-' + mm + '-' + dd;
            var result = actionResult.getReturnValue();
            for (var i = 0; i < result.length; i++) {
                var closedDate = Date.parse(result[i].ClosedDate);
                var todayDate = Date.parse(today);
                var diff = (todayDate - closedDate) / 1000 / 60 / 60 / 24;
                result[i].DaysClosed = diff;
            }
            component.set("v.cases", result);
            component.set("v.Open", false);
            //$('#pop').hide();
            component.set('v.isLoading', false);
            if (actionResult.getReturnValue().length == 0)
                $('#Norecs').show();
        });
        $A.enqueueAction(action);
    },

    getAllOpenCases: function (component) {
        $('#Norecs').hide();
        var action = component.get("c.getAllOpenCases");
        //Set up the callback
        var self = this;
        action.setCallback(this, function (actionResult) {
            component.set("v.cases", actionResult.getReturnValue());
            //$('#pop').hide();
            component.set('v.isLoading', false);
            if (actionResult.getReturnValue().length == 0)
                $('#Norecs').show();
        });
        $A.enqueueAction(action);
    },

    getAllClosedCases: function (component) {
        $('#Norecs').hide();
        var action = component.get("c.getAllClosedCases");
        //Set up the callback
        var self = this;
        action.setCallback(this, function (actionResult) {
            component.set("v.cases", actionResult.getReturnValue());
            //$('#pop').hide();
            component.set('v.isLoading', false);
            if (actionResult.getReturnValue().length == 0)
                $('#Norecs').show();
        });
        $A.enqueueAction(action);
    },

    navigateToSObject: function (component, recordId) {
        console.log('Record Id' + recordId);
        console.log('chatter');
        $A.get("e.force:navigateToSObject").setParams({
            "recordId": recordId,
            "slideDevName": "chatter"
        }).fire();
    },

    reopenCase: function (component, recordId, explanation) {
        var action = component.get("c.reopenCases");
        var idArray = [];
        var explanationDict = {};
        idArray.push(recordId);
        explanationDict[recordId] = explanation;
        action.setParams({
            caseIdList: idArray,
            reopenExplanation: JSON.stringify(explanationDict)
        });
        action.setCallback(this, function (actionResult) {
            //Expecting a true/false value for success
            var returnValue = actionResult.getReturnValue();
            var toastEvent = $A.get("e.force:showToast");
            if (returnValue === true) {
                toastEvent.setParams({
                    "title": "Success",
                    "message": "The case was successfully re-opened",
                    "type": "success"
                });
                this.getClosedCases(component);
            } else {
                toastEvent.setParams({
                    "title": "Error",
                    "message": "The record could not be updated. Please contact an Administrator for assistance and ensure you are using a compatible browser",
                    "type": "error"
                });
            }
            toastEvent.fire();
        });
        $A.enqueueAction(action);
    }
})