({
    init: function(component, event, helper) {
        var brand = component.get('v.brand');
        var barrelTypeMap = component.get('v.barrelTypeMap');
        var programType = component.get('v.programType');
        var oneBarrelMaxBrands = component.get('v.oneBarrelMaxBrands');

        if (barrelTypeMap.hasOwnProperty(brand) && programType != 'Sample Kit' || barrelTypeMap.hasOwnProperty(brand) && brand == 'Cruzan') {
            component.set('v.barrelTypes', barrelTypeMap[brand]);
        }

        if(oneBarrelMaxBrands.indexOf(brand) > -1){
            component.set('v.disableBarrelNumber', true);
        }
    },
    handleBarrelNumberChange: function(component, event, helper) {
        helper.handleBarrelNumberChange(component, event, helper);
    },
    moveToNextScreen: function(component, event, helper) {
        var createBarrelPromise = helper.createBarrel(component, event, helper);
        createBarrelPromise.then(
            $A.getCallback(function(result) {
                console.log(result);
                component.set('v.barrelId', result['responseMap']['barrelId']);
                try{
                    helper.navigateFlow(component, event, helper);
                }catch(err){
                    console.log(err);
                }
                

            }),
            $A.getCallback(function(error) {
                // Something went wrong
                var message = 'Please Contact Your System Administrator: \n\n';
                helper.showNotice(component, event, helper, 'error', message + error, 'An Error Occured');
            })
        ).catch(function(error) {
            $A.reportError("error message here", error);
        });

    }


})