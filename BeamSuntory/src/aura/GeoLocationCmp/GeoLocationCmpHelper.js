({
    updateGeolocationOnRecord: function(component, event, helper) {
        var action = component.get("c.updateGeoLocation");
        console.log('record Id ', component.get('v.recordId'));
        console.log('fieldName ', component.get('v.fieldName'));
        console.log('latitude ', component.get('v.latitude'));
        console.log('longitude ', component.get('v.longitude'));

        action.setParams({
            recordId : component.get('v.recordId'),
            geoLocationFieldName : component.get('v.fieldName'),
            latitude: component.get('v.latitude'),
            longitude: component.get('v.longitude')
        });

        return new Promise(function(resolve, reject) {
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === "SUCCESS") {
                    var retVal = response.getReturnValue();
                    console.log(retVal);
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
})