({
    getListViewInfo: function(component, event, helper) {
        var action = component.get("c.getListView");

        action.setParams({
            "listViewName": component.get('v.listViewName'),
            "objectApiName": component.get('v.objectType')
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            if (state == 'SUCCESS') {
                var requestObject = data.getReturnValue();
                console.log(requestObject);
                component.set('v.listView', requestObject);                

            } else if (state == 'ERROR') {
                console.log('error has occured');
            }
        });
        $A.enqueueAction(action);
    },
    showToast: function(message, title, type) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
            "mode": "dismissible"
        });
        toastEvent.fire();
    },
})