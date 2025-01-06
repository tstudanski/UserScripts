// ==UserScript==
// @name         LMS Easy Sign On
// @namespace    https://github.com/tstudanski/
// @version      2025.1.6.1
// @description  Adds an Attempt SSSO button to the page to help speed up login
// @author       Tyler Studanski
// @match        https://mac.certpointsystems.com/Portal/Login.aspx?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mac.certpointsystems.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/LMS-Easy-SignOn.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/LMS-Easy-SignOn.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/BaseModel.js
// @grant        none
// ==/UserScript==

'use strict';
class LmsSso extends BaseModel {
    constructor() {
        super();
        this.lmsUrl = 'http://lms.mspmac.org/';
        this.addAttemptButton();
    }
    addAttemptButton() {
        var loginBtn = document.querySelector('#LoginButton');
        var attemptBtn = loginBtn.cloneNode(true);
        attemptBtn.id = 'AttemptSso';
        attemptBtn.value = 'Attempt SSO';
        attemptBtn.type = 'button';
        var self = this;
        attemptBtn.onclick = function() {
            window.location.href = self.lmsUrl;
        };
        loginBtn.insertAdjacentElement('beforebegin', attemptBtn);
        this.debug('Added "Attempt SSO" button');
    }
}

window.onload = function() {
    document.lmsSso = new LmsSso();
}