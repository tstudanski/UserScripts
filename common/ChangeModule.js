/// Plugin to simplify triggering an action when some value changes
/// Inspired by https://stackoverflow.com/a/1930942/3416155
class OnChangeModule {
    constructor(frequency, getValueFunction) {
        this.getValueFunction = getValueFunction;
        this.oldValue = getValueFunction();
        if (frequency == null) {
            frequency = 1000;
        }
        var self = this;
        setInterval(function() {
            self.checkValue();
        }, frequency);
    }
    onChange() {
        console.log('Value changed.  Feel free to override this with the action you want to happen.');
    }
    checkValue() {
        var currentValue = this.getValueFunction();
        if (this.oldValue != currentValue) {
            this.oldValue = currentValue;
            this.onChange();
        }
    }
}