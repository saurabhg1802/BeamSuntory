({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
    },
    handleOnClick: function(component, event, helper) {
    	var baseUrl = component.get('v.baseUrl');
        window.open(baseUrl+'/console');
    },

})