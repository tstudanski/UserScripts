// ==UserScript==
// @name         Password Safe Beyond Insight
// @namespace    https://github.com/tstudanski/
// @version      2024.5.16.0
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
    MENU_HOME_BTN_QUERY = 'sh-icon[data-icon-name="menu_home"]';
    constructor() {
        super();
        this.debug('Generated Model');
        var self = this;
        if (!this.onPage('dashboard')) {
            waitFor(function() {
                return document.querySelector(self.MENU_HOME_BTN_QUERY);
            }, function() {
                document.querySelector(self.MENU_HOME_BTN_QUERY).click();
            })
        }
        // Make sure side panel large menu exists and has children before adding button
        waitFor(function() {
            var maxMenu = document.querySelectorAll('ul[role="list"]');
            if (maxMenu.length == 0) {
                return false;
            }
            if (maxMenu[0].children.length == 0) {
                return false;
            }
            return true;
        }, function() {
            self.addQuickPasswordButton()
        });
    }
    addQuickPasswordButton() {
        this.debug('Adding quick button');
        var miniMenu = document.querySelector('.menu__minimized.flex-y.h-center.v-start');
        var maxMenu = document.querySelector('ul[role="list"]');
        if (document.querySelector('#qButtonMin')) {
            document.querySelector('#qButtonMin').remove();
        }
        if (document.querySelector('#qButtonMax')) {
            document.querySelector('#qButtonMax').remove();
        }
        var quickButton = elmtify('<div id="qButtonMin">' + this.lightningSvg + '</div>');
        
        this.makeButtonInteractive(quickButton);
        miniMenu.appendChild(quickButton);

        quickButton = maxMenu.children[0].cloneNode(true);
        quickButton.id = "qButtonMax";
        quickButton.removeAttribute('data-assigned-id');
        quickButton.setAttribute('aria-label', 'Quick Password');
        quickButton.children[0].removeAttribute('data-ref');
        var icon = quickButton.querySelector('sh-icon');
        icon.removeAttribute('data-icon-name');
        icon.children[0].remove();
        icon.appendChild(elmtify(this.lightningSvg));
        quickButton.querySelector('sh-translate').textContent = 'Quick Password';
        
        this.makeButtonInteractive(quickButton);
        maxMenu.appendChild(quickButton);
    }
    makeButtonInteractive(button) {
        var self = this;
        button.onclick = function() {
            self.jumpToPassword();
        }
        button.addEventListener('mouseover', function() {
            var svg = button.querySelector('svg');
            svg.style.color = 'orange';
        });
        button.addEventListener('mouseleave', function() {
            var svg = button.querySelector('svg');
            svg.style.color = 'yellow';
        });
    }
    jumpToPassword() {
        this.debug('Jumping to change password');
        if (!this.onPage('passwordsafe/home')) {
            // Go to passwords
            document.querySelector('sh-icon[data-icon-name="menu_passwordsafe"]').click();
        }
        var self = this;
        // Go into iframe
        waitFor(function() {
            // Verify records exist in favorites
            return document.querySelectorAll('tr.grid__row').length > 0;
        }, function() {
            if (!self.mostChg) {
                self.mostChg = self.findChangeName(document);
            }
            self.debug(self.mostChg);
            
            // Select most common chg account lightning bolt // TODO Change this to make sure it matches the logged in user account
            self.mostChg.row.querySelector('sh-icon[title="Access"]').click();
            // Retrieve Password
            waitFor(function() {
                // Make sure Access Menu has popped up
                return document.querySelector('ps-quick-launch-form');
            }, function() {
                var passwordBtn = Array.from(document.querySelector('ps-quick-launch-form').querySelectorAll('sh-button.filled')).find(e => e.textContent.indexOf('Password') != -1);
                self.debug(passwordBtn);
                passwordBtn.children[0].click();
            })
        })
    }
    onPage(expectedEnding) {
        return document.location.href.indexOf(expectedEnding) != -1;
    }
    findChangeName(frame) {
        var nameMap = {};
        var favAccounts = frame.querySelectorAll('tr.grid__row');
        for (var i = 0; i < favAccounts.length; i++) {
            var account = favAccounts[i].children[3].textContent;
            if (account.indexOf('chg.') != -1) {
                if (!nameMap[account]) {
                    nameMap[account] = {
                        name: account,
                        count: 0,
                        row: favAccounts[i]
                    };
                }
                nameMap[account].count++;
            }
        }
        this.debug(nameMap);
        var most = null;
        for (var name in nameMap) {
            if (most == null || nameMap[name].count > most.count) {
                most = nameMap[name];
            }
        }
        return most;
    }
}

window.onload = function() {
    document.pwSafeModel = new PwSafeModel();
}