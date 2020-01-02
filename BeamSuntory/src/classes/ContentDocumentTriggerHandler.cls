public class ContentDocumentTriggerHandler {
	/*public static void handleBeforeInsert(List<ContentDocument> files) {
	}

	public static void handleBeforeUpdate(List<ContentDocument> files, Map<Id, ContentDocument> oldFiles) {
	}
	*/

	public static void handleBeforeDelete(List<ContentDocument> files, Map<Id, ContentDocument> oldFiles) {
		ContentDocumentServices.updatePoUploadFlagOnCase(files, oldFiles);
	}
/*
	public static void handleAfterInsert(List<ContentDocument> files, Map<Id, ContentDocument> newFiles) {
	}

	public static void handleAfterUpdate(List<ContentDocument> files, Map<Id, ContentDocument> oldFiles) {
	}
	*/
}