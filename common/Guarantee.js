/// A function wrapper that's aim is to periodically check to see if the action has taken place and not been overwritten

/// stateIsCorrect: This is a function that checks if the desired state is in place
/// action: This is a function that will be called to change the state
/// checkTime: How often (in milliseconds) to run the check function to make sure the desired state is still correct.  Defaulted to 500 ms
function guarantee(stateIsCorrect, action, checkTime = 500) {
    if (!stateIsCorrect()) {
        console.log('Need to update the state')
        action();
    } else {
        console.log('State is still good');
    }
    setTimeout(function() {
        guarantee(stateIsCorrect, action, checkTime);
    }, checkTime);
}