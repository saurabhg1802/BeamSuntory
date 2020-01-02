({
    init: function (component, event, helper) {
        var openModal = component.get('v.autoOpenModal');
        if (openModal) {
            helper.openModal(component, event, helper);
        }

    },
    openModal: function (component, event, helper) {
        console.log('opening modal');
        helper.openModal(component, event, helper);
    },
    closeModal: function (component, event, helper) {
        helper.closeModal(component, event, helper);
    },
    clearInput: function (component, event, helper) {
        helper.clearInput(component, event, helper);
    },
    handleShowModal: function (component, evt, helper) {
        console.log('creating modal');
        var modalBody;
        $A.createComponent("c:AccountSearchCmp", {
                "selectedRecord": component.getReference('v.selectedRecord'),
                "recordTypeNames": component.getReference('v.recordTypeNames')
            },
            function (content, status) {
                if (status === "SUCCESS") {
                    modalBody = content;

                    var modalPromise = component.find('accountSearchModal').showCustomModal({
                        header: "Account Search",
                        body: modalBody,
                        showCloseButton: true,
                        cssClass: "slds-modal_large modal_background",
                        closeCallback: function () {
                            //alert('You closed the alert!');
                        }
                    });

                    component.set('v.modalPromise', modalPromise);
                }
            });
    },
})