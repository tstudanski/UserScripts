/// Plugin for single page sites to track when the address bar changes
/// Depends on ChangeModule
/// Inspired by https://stackoverflow.com/a/1930942/3416155
class PageChangeModule extends OnChangeModule {
    constructor(frequency) {
        super(frequency, function() {
            return location.href;
        })
    }
    onChange() {
        console.log('Location changed.  Feel free to override this with the action you want to happen.');
    }
}