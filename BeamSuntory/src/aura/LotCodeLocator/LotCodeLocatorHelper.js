({
    init: function(component, event, helper) {
        var getLotCodesImagesApexPromise = helper.getLotCodesImagesApex(component, event, helper);
        getLotCodesImagesApexPromise.then(
            $A.getCallback(function(result) {
                console.log('RECORDS FROM APEX ', result);
                component.set('v.lotCodeMap', result['brandToLotCodeImage']);
                helper.getLotCodeByBrand(component, event, helper);
            })
        ).catch(
            function(error) {
                var errorDetail;
                if (error.hasOwnProperty('message')) {
                    errorDetail = error.message;
                } else {
                    errorDetail = error;
                }
                console.log('Error ', error);
                console.log('Error Message ', errorDetail);
                helper.showToast(errorDetail, 'Error', 'error', 'sticky');
            }
        )
    },
    getLotCodesImagesApex: function(component, event, helper) {
        var action = component.get("c.getLotCodeImages");

        action.setParams({});

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
    getLotCodeByBrand: function(component, event, helper) {
        var lotCodeMap = component.get('v.lotCodeMap');
        var genericLotCodeBrand = component.get('v.genericLotCodeBrand');
        var brand = component.get('v.brand');

        if (lotCodeMap.hasOwnProperty(brand)) {
            component.set('v.lotCodeStaticResource', lotCodeMap[brand].Static_Resource_Name__c);
        } else {
            component.set('v.lotCodeStaticResource', lotCodeMap[genericLotCodeBrand].Static_Resource_Name__c);
        }
    },
    isNullOrEmpty: function(data) {

        if (data == '' || data == null || data == undefined) {
            return true;
        }
        return false;
    },
    showToast: function(message, title, type, mode) {
        var toastEvent = $A.get("e.force:showToast");

        if (this.isNullOrEmpty(toastEvent)) {
            alert(message);
        } else {
            toastEvent.setParams({
                "title": title,
                "message": message,
                "type": type,
                "mode": mode || "dismissible"
            });
            toastEvent.fire();
        }
    },
})