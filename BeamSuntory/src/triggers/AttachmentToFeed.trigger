trigger AttachmentToFeed on Attachment (after insert) {
    if(Trigger.isAfter)
    {   
     AttachmentHandler.AttachmentToFeed(Trigger.new);
    }

}