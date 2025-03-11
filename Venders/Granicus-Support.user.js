// ==UserScript==
// @name         Granicus Support Enhancements
// @namespace    https://github.com/tstudanski/
// @version      2025.03.11.0
// @description  Adds helpful functionality to the site such as giving support members names
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://support.granicus.com/s/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=support.granicus.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Venders/Granicus-Support.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Venders/Granicus-Support.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/WaitFor.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/ChangeModule.js
// @grant        none
// ==/UserScript==

'use strict';
class Enhancements {
    constructor() {
        // Remember previous users
        this.userMemory = JSON.parse(localStorage.getItem('userMemory'));
        if (!this.userMemory) {
            this.userMemory = {};
        }
    }
    // Learn any new names
    learnFromPage() {
        var self = this;
        this.learnChangesModule = new OnChangeModule(500, function() {
            return document.body.textContent;
        }, function() {
            waitFor(function() {
                return document.querySelector('.ownerName') && document.querySelectorAll('.uiOutputTextArea').length > 0;
            }, function() {
                var caseOwner = document.querySelector('.ownerName').textContent;
                var caseOwnerName = document.querySelectorAll('.uiOutputTextArea')[0].textContent;
                if (caseOwner.trim() != caseOwnerName.trim()) {
                    self.userMemory[caseOwner] = caseOwnerName.trim();
                }
                console.log('Found name: ' + caseOwner + ' = ' + caseOwnerName);
                localStorage.setItem('userMemory',JSON.stringify(self.userMemory));
            })
        })
        console.log('Prepared LearnFromPage');
    }
    // Update names
    updateNames() {
        var self = this;
        this.updateChangesModule = new OnChangeModule(500, function() {
            return document.body.textContent;
        }, function() {
            waitFor(function() {
                return document.querySelector('.ownerName') && document.querySelectorAll('span.uiOutputTextArea').length > 0;
            }, function() {
                var caseOwner = document.querySelector('.ownerName').querySelector('a');
                // Update "Case Owner"
                for (var key in self.userMemory) {
                    if (caseOwner.textContent.indexOf(key) != -1) {
                        caseOwner.textContent = self.userMemory[key];
                    }
                }
                // Update feed
                var possibleNames = document.querySelectorAll('span.uiOutputText');
                possibleNames.forEach(function(element) {
                    for (var key in self.userMemory) {
                        if (element.textContent.indexOf(key) != -1) {
                            element.textContent = self.userMemory[key];
                        }
                    }
                })
            });
        });
        console.log('Prepared UpdateNames');
    }
    // Update names in the notification dropdown
    monitorNotifications() {
        var self = this;
        this.updateChangesModule = new OnChangeModule(500, function() {
            return document.querySelectorAll('.titleContainer').length;
        }, function() {
            waitFor(function() {
                return document.querySelectorAll('.notification-text-title').length > 0;
            }, function() {
                // Update notifications
                var notifications = document.querySelectorAll('.notification-text-title');
                notifications.forEach(function(title) {
                    for (var key in self.userMemory) {
                        if (title.textContent.indexOf(key) != -1) {
                            title.textContent = title.textContent.replaceAll(key, self.userMemory[key]);
                        }
                    }
                })
            });
        });
        console.log('Prepared MonitorNotifications');
    }
    run() {
        this.learnFromPage();
        this.updateNames();
        this.monitorNotifications();
    }
}

document.enhancements = new Enhancements();
document.enhancements.run();