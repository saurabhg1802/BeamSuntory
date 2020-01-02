({
    init: function(component, event, helper) {
        var overrideControllingFieldValues = component.get('v.overrideControllingFieldValues');
        var controllingFieldOptions = component.get('v.controllingFieldOptions');
        var nonePicklist = component.get('v.nonePicklistLabel');

        var fetchPicklistValuesPromise = helper.fetchPicklistValues(component, event, helper);
        fetchPicklistValuesPromise.then(
            $A.getCallback(function(result) {

                // once set #ctrlResponse to dependentFieldMap attribute
                component.set("v.dependentFieldMap", result);
                console.log(result);

                // create a empty array for store map keys(@@--->which is controller picklist values)
                var listOfkeys = []; // for store all map keys (controller picklist values)
                var ControllerField = []; // for store controller picklist value to set on ui field.
                var DependentField = [];

                // play a for loop on Return map
                // and fill the all map key on listOfkeys variable.
                for (var singlekey in result) {
                    listOfkeys.push(singlekey);
                }

                //set the controller field value for
                if (listOfkeys != undefined && listOfkeys.length > 0 && !overrideControllingFieldValues) {
                    for (var i = 0; i < listOfkeys.length; i++) {
                        if (listOfkeys[i] == 'Makers Mark') {
                            continue;
                        }
                        if (i == 0) {
                            ControllerField.push({
                                label: nonePicklist,
                                value: null
                            });
                        }
                        ControllerField.push({
                            label: listOfkeys[i],
                            value: listOfkeys[i]
                        });
                    }
                    component.set("v.controllingFieldOptions", ControllerField);
                }
                DependentField.push({
                    label: nonePicklist,
                    value: null
                });

                // set the ControllerField variable values to (controller picklist field)
                component.set("v.dependentFieldOptions", DependentField);
                helper.lookupDependentValues(component, event, helper);
            })
        );
    },

    fetchPicklistValues: function(component, event, helper) {
        // call the server side function
        var action = component.get("c.getDependentOptions");
        var overrideControllingFieldValues = component.get('v.overrideControllingFieldValues');
        var controllingField = component.get('v.controllingField');
        var dependentField = component.get('v.dependentField');

        action.setParams({
            'objApiName': component.get("v.objInfo"),
            'contrfieldApiName': controllingField,
            'depfieldApiName': dependentField
        });
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

    loadDependentValues: function(component, helper, ListOfDependentFields) {
        // create a empty array var for store dependent picklist values for controller field)
        var controllingFieldValue = component.get('v.controllingFieldValue');
        var nonePicklist = component.get('v.nonePicklistLabel');

        var dependentFields = [];
        if (helper.isNullOrEmpty(ListOfDependentFields)) {
            return;
        }

        if (ListOfDependentFields != undefined && ListOfDependentFields.length > 0) {
            dependentFields.push({
                class: "optionClass",
                label: nonePicklist,
                value: null
            });
        }

        for (var i = 0; i < ListOfDependentFields.length; i++) {
            if (ListOfDependentFields[i] == 'Makers Mark') {
                continue;
            }
            dependentFields.push({
                class: "optionClass",
                label: ListOfDependentFields[i],
                value: ListOfDependentFields[i]
            });
        }
        // set the dependentFields variable values to (dependent picklist field)
        component.set("v.dependentFieldOptions", dependentFields);
    },
    lookupDependentValues: function(component, event, helper) {
        var controllerValueKey = component.get('v.controllingFieldValue');
        var dependentFieldMap = component.get("v.dependentFieldMap");
        var nonePicklist = component.get('v.nonePicklistLabel');

        if (controllerValueKey != nonePicklist) {
            var dependentFields = dependentFieldMap[controllerValueKey];

            if (helper.isNullOrEmpty(dependentFields)) {
                return;
            }

            if (dependentFields.length > 0) {
                component.set("v.dependentFieldDisabled", false);
                helper.loadDependentValues(component, helper, dependentFields);
            } else {
                component.set("v.dependentFieldDisabled", true);
                component.set("v.dependentFieldOptions", [nonePicklist]);
            }

        } else {
            component.set("v.dependentFieldOptions", [nonePicklist]);
            component.set("v.dependentFieldDisabled", true);
        }
    },
    isNullOrEmpty: function(data) {

        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    isPageValid: function(component, event, helper) {
        var fieldTypes = ['controlling_field', 'dependent_field'];
        var allFieldsValid = true;
        for (var i in fieldTypes) {
            var isValid = helper.validateFields(component, event, helper, fieldTypes[i]);
            if (!isValid) {
                allFieldsValid = false
            }
        }

        return allFieldsValid;
    },
    validateFields: function(component, event, helper, fieldType) {
        var fields = component.find(fieldType);
        var allValid = true;
        if (fields == undefined) {
            return true;
        }
        if (fields.length > 1) {
            allValid = fields.reduce(function(validSoFar, inputCmp) {
                inputCmp.showHelpMessageIfInvalid();
                return validSoFar && inputCmp.get('v.validity').valid;
            }, true);
        } else {
            allValid = component.find(fieldType).get('v.validity').valid;
        }

        return allValid;
    },
})