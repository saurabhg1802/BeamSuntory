({
	init: function(component, event, helper) {
        var getPicklistValuesPromise = helper.getPicklistValues(component, event, helper);
        getPicklistValuesPromise.then(
            $A.getCallback(function(result) {
                helper.buildPicklistOptions(component, 'options', result);
            })
        );
    },

    setValidity: function(component, event, helper) {
        var validity = component.find("dualListbox").get("v.validity");
        component.set("v.validity", validity);
    },

    // get picklist options for drop down fields in the form
    getPicklistValues: function(component, event, helper) {
        var action = component.get("c.getIncidentPicklistValues");

        action.setParams({apiName : component.get('v.apiName')});

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    resolve(retVal);

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

    buildPicklistOptions: function(component, targetAttribute, values) {
        var options = [];
        
        for (var i in values) {
            options.push({
                'label': values[i],
                'value': values[i]
            });
        }
        component.set('v.' + targetAttribute, options);
        if (component.get("v.label") === 'Brand Type') {
            component.set("v.globalBrandTypes", options);
        }
    },

    //Update Brand Types based on the Brand(s) selected
    updateBrandString : function(component, event, helper) {
        var options = component.get("v.globalBrandTypes");
        var brandStrings = component.get("v.brandString").split(';');

        var updatedOptions = [];

        for (var i = 0; i < brandStrings.length; i++) {
            for (var j = 0; j < options.length; j++) {
                if (options[j].label.toLowerCase().substring(0, brandStrings[i].length) === brandStrings[i].toLowerCase()) {
                    updatedOptions.push({
                        'label' : options[j].label,
                        'value' : options[j].value
                    }); 
                }
            }
        }
        component.set("v.options", updatedOptions);
    }
})