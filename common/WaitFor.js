// Function to simplify the waiting process to run a function
// If testFunc returns true then runs callback, otherwise will test again after waitTime (in ms) has past

/// Example: Checks every 400 ms for the current time of second to be at 10 and then logs the current time to the console
// waitFor(function() {
//     return Date().indexOf(':10') != -1;
// }, function() {
//     console.log('It is now: ', Date());
// }, 400);

/// testFunc: Function that returns boolean
/// callback: Function that's called if testFunc returns TRUE
/// waitTime: How often to check in milliseconds.  Defaults to 100 ms.
function waitFor(testFunc, callback, waitTime) {
    if (waitTime == undefined) {
        waitTime = 100;
    }
    if (testFunc()) {
        callback();
    } else {
        console.log('Had to wait');
        setTimeout(function() {
            waitFor(testFunc, callback, waitTime);
        }, waitTime);
    }
}