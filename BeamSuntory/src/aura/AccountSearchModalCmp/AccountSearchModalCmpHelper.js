({
    //This method opens the modal and sets the attribute "inModal" to true
    openModal: function(component, event, helper) {
        this.showPopupHelper(component, 'modalprompt', 'slds-slide-up-');
        this.showPopupHelper(component, 'backdrop', 'slds-backdrop_');
        component.set('v.inModal', true);
    },

    closeModal: function(component, event, helper) {
        console.log('closing modal');
        component.get('v.modalPromise').then(
            function(modal) {
                modal.close();
            }
        );
    },

    //A helper method that removes a "hide" class and adds an "open" class
    showPopupHelper: function(component, componentId, className) {
        var modal = component.find(componentId);
        $A.util.removeClass(modal, className + 'hide');
        $A.util.addClass(modal, className + 'open');
    },

    //A helper method that removes an "open" class and adds a "hide" class
    hidePopupHelper: function(component, componentId, className) {
        var modal = component.find(componentId);
        $A.util.addClass(modal, className + 'hide');
        $A.util.removeClass(modal, className + 'open');
    },
    clearInput: function(component, event, helper) {
        component.set('v.selectedRecord', null);
        component.set('v.recordSelected', false);

    }
})