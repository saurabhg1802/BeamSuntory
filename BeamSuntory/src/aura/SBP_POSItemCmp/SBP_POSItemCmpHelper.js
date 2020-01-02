({
    init: function(component, event, helper) {},
    selectPosItem: function(component, event, helper, textChange) {
        var selectedOptionValue = event.getParam("value");
        var showTextOptions = component.get('v.showTextOptions');
        var insertText = component.get('v.textOptionVal');

        if (showTextOptions && (selectedOptionValue == 'Include' || selectedOptionValue == 'Insert Only') && insertText != '' && insertText != '') {
            helper.defaultTextOption(component, event, helper);
        } else if(!showTextOptions){
            helper.clearTextOption(component, event, helper);
        }
        
        var posId = component.get('v.posId');
        var action;
        var isInsert = false;
        var auraId = component.get("v.itemText");

        if (textChange) {
            action = 'INSERT';
        } else if (selectedOptionValue === 'Include') {
            action = 'INSERT';
        } else if (selectedOptionValue === 'Don\'t Include') {
            console.log('Dont Include');
            action = 'DELETE';
        } else if (selectedOptionValue === 'Insert Only') {
            console.log('Insert Only Selected');
            action = 'INSERT';
            isInsert = true;
        }

        var posObj = {
            isInsert: isInsert,
            getInsertTextFrom: component.get('v.textOptionVal'),
            action: action,
            auraId: auraId,
            posId: posId
        };


        console.log('----- ', posObj);


        // call the event   
        var compEvent = component.getEvent("includePosItem");
        // set the Selected item attribute
        compEvent.setParams({
            "auraId": auraId,
            "posId": posId,
            "action": action,
            "isInsert": isInsert,
            "insertText": insertText,
            "posMap": posObj
        });
        // fire the event  
        compEvent.fire();

    },

    toggleButton: function(component, event, helper) {
        var itemIncluded = component.get('v.itemIncluded');
        component.set('v.itemIncluded', !itemIncluded);
    },
    showToast: function(component, event, helper, type, title, message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type,
        });
        toastEvent.fire();
    },
    defaultTextOption: function(component, event, helper) {
        component.set('v.textOptionVal', 'Account Name');
    },
    clearTextOption: function(component, event, helper) {
        component.set('v.textOptionVal', '');
    }
})