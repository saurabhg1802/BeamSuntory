({
    init: function(component, event, helper) { },
    
    moveToNextScreen: function(component, event, helper) {
        
        var validateSampleKitInfo = helper.validateSampleKitInfo(component, event, helper);
        
        validateSampleKitInfo.then(
            $A.getCallback(function(result) {
                if (result) {
			        return helper.saveSampleKitDetails(component, event, helper);
                } else {
                    helper.showToast('An error occurred please contact the support team', 'Error', 'error');
                }
            }),
            $A.getCallback(function(error) {
                // Something went wrong
                alert('An error occurred : ' + error.message);
                console.log('ERROR: ', error);
            })
        ).then(
            $A.getCallback(function(result) {
                console.log(result);
                component.set('v.SampleKitUpdated', result['responseMap']['SampleKit']);
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
        }
	);
    }
})