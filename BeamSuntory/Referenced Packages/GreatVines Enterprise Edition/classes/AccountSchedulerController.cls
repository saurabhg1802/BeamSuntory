/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class AccountSchedulerController {
    @RemoteAction
    global static List<Event> getExistingEvents(Long startTime, Long endTime) {
        return null;
    }
    @RemoteAction
    global static List<gvp.AccountSchedulerController.NativeEvent> getExistingNativeEvents(Long startTime, Long endTime) {
        return null;
    }
global class EventSorter implements gvp.ObjectComparator {
    global EventSorter() {

    }
    global Integer compare(gvp.AccountSchedulerController.ScheduledEvent e1, gvp.AccountSchedulerController.ScheduledEvent e2) {
        return null;
    }
    global Integer compare(Object e1, Object e2) {
        return null;
    }
}
global class NativeEvent {
    global NativeEvent() {

    }
}
global class RelatedObject {
}
global class RelatedObjectSorter implements gvp.ObjectComparator {
    global RelatedObjectSorter() {

    }
    global Integer compare(gvp.AccountSchedulerController.RelatedObject e1, gvp.AccountSchedulerController.RelatedObject e2) {
        return null;
    }
    global Integer compare(Object e1, Object e2) {
        return null;
    }
}
global class ScheduledEvent {
}
}
