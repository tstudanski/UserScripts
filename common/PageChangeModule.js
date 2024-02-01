/// Plugin for single page sites to track when the address bar changes
// Inspired by https://stackoverflow.com/a/1930942/3416155
class PageChangeModule {
    constructor(frequency) {
        this.oldLocation = location.href;
        if (frequency == null) {
            frequency = 1000;
        }
        var self = this;
        setInterval(function() {
            self.checkPage();
        }, frequency);
    }
    onChange() {
        console.log('Location changed.  Feel free to override this with the action you want to happen.');
    }
    checkPage() {
        if (location.href != this.oldLocation) {
            this.oldLocation = location.href;
            this.onChange();
        }
    }
}