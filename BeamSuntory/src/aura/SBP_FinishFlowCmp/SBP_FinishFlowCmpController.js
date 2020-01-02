({
    init: function(component, event, helper) {
    	helper.showToast('Your Order Has Been Submitted!', 'Success', 'success');
    	try{
    		helper.getListViewInfo(component, event, helper);
    	}catch(err){
    		console.log(err);
    	}
        
        
    },
    handleOnClick: function(component, event, helper) {
    	var listView = component.get('v.listView');

        var navEvent = $A.get("e.force:navigateToList");
        navEvent.setParams({
            "listViewId": listView.Id,
            "listViewName": component.get('listViewName'),
            "scope": component.get('v.objectType')
        });
        navEvent.fire();
    },
})