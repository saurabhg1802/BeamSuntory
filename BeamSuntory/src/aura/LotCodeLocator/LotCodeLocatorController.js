({
    init: function(component, event, helper) {
        helper.init(component, event, helper);
    },
    handleShowModal: function(component, evt, helper) {
        var lotCodeStaticResource = component.get('v.lotCodeStaticResource');
        var modalBody;

        if (helper.isNullOrEmpty(lotCodeStaticResource)) {
            return;
        }

        $A.createComponent(
            "aura:html", {
                tag: "img",
                HTMLAttributes: {
                    "src": $A.get('$Resource.'+ lotCodeStaticResource),
                    "class": "slds-align_absolute-center"
                }
            },
            function(content, status) {
                if (status === "SUCCESS") {
                    modalBody = content;

                    var modalPromise = component.find('imageModal').showCustomModal({
                        header: "Lot Code Locator",
                        body: modalBody,
                        showCloseButton: true,
                        cssClass: "",
                        closeCallback: function() {
                            //alert('You closed the alert!');
                        }
                    });

                    component.set('v.modalPromise', modalPromise);
                }
            });
    },
})