({
    init: function (component, event, helper) {
        var getFieldLabelsPromise = helper.getFieldLabels(component, event, helper);
        getFieldLabelsPromise.then(
            $A.getCallback(function (result) {
                component.set('v.labelMap', result['fieldMap']);
                helper.buildBreadCrumbs(component, event, helper);
            })
        );
    },
    getFieldLabels: function (component, event, helper) {
        var action = component.get("c.getCaseFieldLabels");

        action.setParams({
            fieldApiMap: component.get('v.apiNameMap')

        });
        return new Promise(function (resolve, reject) {
            action.setCallback(this, function (response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log('Results from Apex Controller: ', retVal);
                    var responseMap = retVal['responseMap'];
                    resolve(responseMap);

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
    buildBreadCrumbs: function (component, event, helper) {
        var objectRecord = component.get('v.objectRecord');
        var labelMap = component.get('v.labelMap');
        var apiNameMap = component.get('v.apiNameMap');
        var fieldTypes = Object.keys(apiNameMap);
        var breadCrumbList = [];

        for (var i in fieldTypes) {

            var apiName = fieldTypes[i];
            var fieldLabel = apiNameMap[apiName];
            var recordValue = component.get('v.' + fieldLabel);
            console.log('fieldLabel ', fieldLabel);
            console.log('apiName ', apiName);
            console.log('recordValue ', recordValue);
            console.log('labelMap[apiName][recordValue] ', labelMap[apiName][recordValue]);

            if (!helper.isNullOrEmpty(recordValue)) {
                breadCrumbList.push({
                    label: labelMap[apiName][recordValue],
                    name: apiName
                });
            }

            component.set('v.breadCrumbs', breadCrumbList);
        }
    },
    isNullOrEmpty: function (data) {
        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    buildBreadCrumbs2: function (component, event, helper) {
        var labelMap = component.get('v.labelMap');
        var apiNameMap = component.get('v.apiNameMap');
        var apiNames = Object.keys(apiNameMap);
        var breadCrumbList = [];
        var breadCrumb = '';

        for (var i in apiNames) {
            var apiName = apiNames[i];
            var fieldLabel = apiNameMap[apiName];
            var recordValue = component.get('v.' + fieldLabel);

            console.log('apiNames ', apiNames[i]);
            console.log('apiName ', apiName);
            console.log('recordValue ', recordValue);
            console.log('labelMap[apiName][recordValue] ', labelMap[apiName][recordValue]);
            if (Object.keys(labelMap).indexOf(apiName) > -1) {
                var translatedLabel = labelMap[apiName][recordValue];
                if (!helper.isNullOrEmpty(recordValue)) {
                    if (helper.isNullOrEmpty(breadCrumb)) {
                        breadCrumb = translatedLabel;
                    } else {
                        breadCrumb += ' > ' + translatedLabel;
                    }
                }
            }


            if (!helper.isNullOrEmpty(recordValue)) {
                breadCrumbList.push({
                    label: labelMap[apiName][recordValue],
                    name: apiName
                });
            }
        }
        console.log('bread ', breadCrumb);

        component.set('v.breadCrumb', breadCrumb);
    }
})