/// Easy function to generate deep elements from text
/// Copied from https://stackoverflow.com/a/14565049/3416155
var elmtify = function(html) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return wrapper.firstChild;
}