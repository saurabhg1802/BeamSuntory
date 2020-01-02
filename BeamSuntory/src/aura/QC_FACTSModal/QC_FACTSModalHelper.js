({
	createParentIncident : function(component, event, helper) {
      var action = component.get("c.createIncident");
      console.log(JSON.stringify(component.get('v.caseList')));

      action.setParams({ casesForIncident : JSON.stringify(component.get('v.caseList')) });

      return new Promise(function(resolve, reject) {
      action.setCallback(this, function(response) {
        var state = response.getState();
        if (state === "SUCCESS") {
          var parentIncident = response.getReturnValue();
          resolve(parentIncident);
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

  beginFACTSFlow : function(component, event, helper) {
    var createParentIncidentPromise = helper.createParentIncident(component, event, helper);
    createParentIncidentPromise.then(
        $A.getCallback(function(result) {
          var incidentRecord = result;
          component.set("v.parentIncident", incidentRecord);
          var caseList = component.get("v.caseList");
          var inputVariables = [
            {
              name: "Cases",
              type: "SObject",
              value: caseList
            },
            {
              name: "ParentIncident",
              type: "SObject",
              value: incidentRecord
            }
          ];
          //now launch flow
          component.set("v.showFlow", true);
          var flow = component.find("FACTS_Flow");
          flow.startFlow("FACTS_Flow", inputVariables);
          component.set("v.closeDisabled", false);
        }
      )
    );
  },

  getSelectedCases : function(component, event, helper) {
    var caseList = component.get("v.caseList");
    var cases = [];
    for (var i = 0; i < caseList.length; i++) {
      cases.push({
           id : caseList[i]['Id'],
           num : caseList[i]['CaseNumber'],
           url : 'https://'+window.location.host.split('.')[0]+'.lightning.force.com/lightning/r/Case/'+caseList[i]['Id']+'/view'
      });
    }
    component.set("v.cases", cases);
  },

	statusChange : function(component, event) {
		if (event.getParam("status") === "FINISHED") {
    		component.set("v.showFlow", false);
    		var outputVariables = event.getParam("outputVariables");
    		var outputVar;
    		var incidentID;
    		for (var i = 0; i < outputVariables.length; i++) {
    			outputVar = outputVariables[i];
    			if (outputVar.name === "ParentIncidentId") {
    				incidentID = outputVar.value;
    				break;
    			}
    		}
    		var nav = $A.get("e.force:navigateToSObject");
        nav.setParams({
            "recordId": incidentID,
            "slideDevName": "detail"
       	});
        nav.fire();
        this.showToast("A FACTS Incident Has Been Created Successfully.", "Success!", "success");
    	}
    	else if (event.getParam("status") === "ERROR") {
    		this.showToast("Please try again.", "An unexpected error occurred.", "error");
    	}
	},

	showToast : function(message, title, type) {
		var toastEvent = $A.get("e.force:showToast");
    toastEvent.setParams({
        "title": title,
        "message": message,
        "type": type,
        "mode": "dismissible"
    });
    toastEvent.fire();
	},

  closeModal : function(component, event, helper) {
    if (confirm('Are you sure you want to close the FACTS Flow?  Any current progress will not be saved.')) {
      var deleteIncidentsPromise = helper.deleteIncidents(component, event, helper);
      deleteIncidentsPromise.then(
          $A.getCallback(function(result) {
              component.set("v.showFlow", false);
              var navEvent = $A.get("e.force:navigateToList");
              navEvent.setParams({
                  "listViewName": "All",
                  "scope": "Incident__c"
              });
              navEvent.fire();
            }
          )
        );
      }
    },

  deleteIncidents : function(component, event, helper) {
    var parentIncident = component.get("v.parentIncident");
    var parentIncidentId = parentIncident['Id'];
    var action = component.get("c.destroyIncident");

    action.setParams({ parentIncId : parentIncidentId });

    return new Promise(function(resolve, reject) {
      action.setCallback(this, function(response) {
        var state = response.getState();
        if (state === "SUCCESS") {
          var incidentsDeleted = response.getReturnValue();
          resolve(incidentsDeleted);
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
})