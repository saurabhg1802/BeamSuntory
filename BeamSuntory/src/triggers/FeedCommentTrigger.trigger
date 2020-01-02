trigger FeedCommentTrigger on FeedComment (after insert)  {
	if(Trigger.isAfter && Trigger.isInsert){
		FeedCommentTriggerHandler.handleNewCaseFeedComment(Trigger.new);
	}
}