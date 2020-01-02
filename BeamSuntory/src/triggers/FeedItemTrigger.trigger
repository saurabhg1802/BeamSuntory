trigger FeedItemTrigger on FeedItem (after insert){
	if(Trigger.isAfter && Trigger.isInsert){
        System.debug(LoggingLevel.INFO, 'got here');
		FeedItemTriggerHandler.handleNewCaseFeedItem(Trigger.new);
	}
}