/// Plugin to simplify triggering an action when some value changes
/// Inspired by https://stackoverflow.com/a/1930942/3416155

/// Example: Creates a monitor for the document that logs a textContent change
// var monitor = new OnChangeModule(500, function(){
//     return document.textContent;
// }, function() {
//     console.log('Value changed from ' + oldValue + ' to ' + newValue);
// });

/// frequency: How often to check for changes in milliseconds
/// getValueFunction: function that returns a value
/// onChange: function that is called if getValueFunction returns a new value.  This function is passed 2 parameters (oldValue, newValue)
class OnChangeModule {
    constructor(frequency, getValueFunction, onChange) {
        this.getValueFunction = getValueFunction;
        this.oldValue = getValueFunction();
        if (onChange) {
            this.onChange = onChange;
        }
        if (frequency == null) {
            frequency = 1000;
        }
        var self = this;
        setInterval(function() {
            self.checkValue();
        }, frequency);
    }
    onChange(oldValue, newValue) {
        console.log('Value changed from ' + oldValue + ' to ' + newValue + '.  Override onChange() with the action you want to happen.');
    }
    checkValue() {
        var currentValue = this.getValueFunction();
        if (this.oldValue != currentValue) {
            var previousValue = this.oldValue;
            this.oldValue = currentValue;
            this.onChange(previousValue, currentValue);
        }
    }
}