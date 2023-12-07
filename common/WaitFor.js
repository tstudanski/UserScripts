// Function to simplify the waiting process to run a function
// If testFunc returns true then runs callback, otherwise will test again after waitTime (in ms) has past
// If waitTime isn't assigned then 100ms is assumed
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