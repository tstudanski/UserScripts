// ==UserScript==
// @name         Password Safe Beyond Insight
// @namespace    https://github.com/tstudanski/
// @version      2024.3.7.1
// @description  Shortcuts for using this password management tool
// @author       Tyler Studanski
// @match        https://pwsafe.mac.msp.airport/webconsole/*
// @icon         https://pwsafe.mac.msp.airport/webconsole/favicon.ico?fav=bt
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/PwSafe.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/PwSafe.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/BaseModel.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/WaitFor.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/Elmtify.js
// @grant        none
// ==/UserScript==

'use strict';
class PwSafeModel extends BaseModel {
    lightningSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightning-fill" viewBox="0 0 16 16" style="color: yellow;width: 25px;height:auto"><path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z"></path></svg>';
    constructor() {
        super();
        this.debug('Generated Model');
        var self = this;
        if (!this.onPage('dashboard')) {
            document.querySelector('ae-icon[data-icon-name="menu_home"]').click();
        }
        waitFor(function() {
            return document.querySelectorAll('.flex-y.ae-card.card-link').length > 0;
        }, function() {
            self.addQuickPasswordButton()
        });
    }
    addQuickPasswordButton() {
        this.debug('Adding quick button');
        var miniMenu = document.querySelector('.menu__minimized.flex-y.h-center.v-start');
        var maxMenu = document.querySelector('ul[role="listbox"]');
        if (document.querySelector('#qButtonMin')) {
            document.querySelector('#qButtonMin').remove();
        }
        if (document.querySelector('#qButtonMax')) {
            document.querySelector('#qButtonMax').remove();
        }
        var quickButton = elmtify('<div id="qButtonMin">' + this.lightningSvg + '</div>');
        
        var self = this;
        quickButton.onclick = function() {
            self.jumpToPassword();
        }
        miniMenu.appendChild(quickButton);

        quickButton = maxMenu.children[0].cloneNode(true);
        quickButton.id = "qButtonMax";
        quickButton.removeAttribute('data-assigned-id');
        quickButton.setAttribute('aria-label', 'Quick Password');
        quickButton.children[0].removeAttribute('data-ref');
        var aeIcon = quickButton.querySelector('ae-icon');
        aeIcon.removeAttribute('data-icon-name');
        aeIcon.children[0].remove();
        aeIcon.appendChild(elmtify(this.lightningSvg));
        quickButton.querySelector('ae-translate').textContent = 'Quick Password';
        
        quickButton.onclick = function() {
            self.jumpToPassword();
        }
        maxMenu.appendChild(quickButton);
    }
    jumpToPassword() {
        this.debug('Jumping to change password');
        if (!this.onPage('passwordsafe/home')) {
            // Go to passwords
            document.querySelector('ae-icon[data-icon-name="menu_passwordsafe"]').click();
        }

        // Go into iframe
        waitFor(function() {
            return document.querySelector('iframe#passwordsafeIframe');
        }, function() {
            var frame = document.querySelector('iframe#passwordsafeIframe').contentWindow.document;
            // Select 1st lightning bolt // TODO Change this to make sure it matches the logged in user account
            frame.querySelectorAll('.icon-action.onecl')[0].click();
            
            // Retrieve Password
            waitFor(function() {
                return frame.querySelector('.btn-retrieve-password-ql');
            }, function() {
                frame.querySelector('.btn-retrieve-password-ql').click();
            })
        })
        
    }
    onPage(expectedEnding) {
        return document.location.href.indexOf(expectedEnding) != -1;
    }
}

window.onload = function() {
    document.pwSafeModel = new PwSafeModel();
}