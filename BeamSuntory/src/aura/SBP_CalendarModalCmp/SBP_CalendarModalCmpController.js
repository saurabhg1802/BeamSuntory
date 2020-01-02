({
    init: function(component, event, helper) {
        var openModal = component.get('v.autoOpenModal');
        if (openModal) {
            helper.openModal(component, event, helper);
        }

    },
    openModal: function(component, event, helper) {
        console.log('opening modal');
        helper.openModal(component, event, helper);
    },
    closeModal: function(component, event, helper) {
        helper.closeModal(component, event, helper);

    },
})