/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class BatchPullTaskResponse implements Database.AllowsCallouts, Database.Batchable<gsc_mc.PullIterable.PullIteration> {
    global BatchPullTaskResponse() {

    }
    global void execute(Database.BatchableContext bc, List<gsc_mc.PullIterable.PullIteration> scope) {

    }
    global void finish(Database.BatchableContext bc) {

    }
    global System.Iterable start(Database.BatchableContext BC) {
        return null;
    }
global class ActivityTaskResponse {
}
global class SortableTask implements System.Comparable {
    global Integer position;
    global gsc_mc.TaskAPI.GSCTask taskHeader;
    global gsc_mc.TaskResponseAPI.TaskResponse taskResponse;
    global SortableTask() {

    }
    global Integer compareTo(Object compareTo) {
        return null;
    }
}
}
