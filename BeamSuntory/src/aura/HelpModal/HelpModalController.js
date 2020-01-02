({
    handleShowModal: function (component, evt, helper) {
        let message = component.get('v.message');
        let title = component.get('v.title');

        $A.createComponent(
            "ui:outputText", {
                "value": message
            },
            function (content, status) {
                if (status === "SUCCESS") {

                    component.find('modal').showCustomModal({
                        header: title,
                        body: content,
                        footer: '',
                        showCloseButton: true,
                        cssClass: '',
                        closeCallback: function () {
                            //alert('You closed the alert!');
                        }
                    });
                }
            });
    },
})