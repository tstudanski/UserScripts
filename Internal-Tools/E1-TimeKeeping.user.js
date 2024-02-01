// ==UserScript==
// @name         E1 Time Keeping
// @namespace    https://github.com/tstudanski/
// @version      2024.2.1.0
// @description  Simplifying time weekly entry
// @author       Tyler Studanski
// @match        https://myinfo.mspairport.com/jde/E1Menu.maf
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mspairport.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/E1-TimeKeeping.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/E1-TimeKeeping.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/Elmtify.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/ChangeModule.js
// @grant        none
// ==/UserScript==

'use strict';
class E1TimeKeeping {
    constructor() {
        this.monitor = new OnChangeModule(500, function(){
            return document.getElementById('e1menuAppIframe').contentDocument;
        })
        var self = this;
        this.monitor.onChange = function() {
            console.debug('frame changed');
            if (self.isTimeEntry()) {
                console.debug("Found time entry");
                self.convertToButtons();
            }
        }
    }
    updateField(field, value) {
        field.value = value;
        field.dispatchEvent(new Event('change', { 'bubbles': true }));
    }
    inputDate(button, self) {
        var date = button.value;
        var latestLine = $(self.frame).find('.editableModifier');
        // Insert date
        self.updateField($(latestLine[1]).find('input')[0], date);
        // Set to Regular pay
        self.updateField($(latestLine[2]).find('input')[0], 1);
        // Fill in Week
        for (var i = 6; i < 11; i++) {
            self.updateField($(latestLine[i]).find('input')[0], 8);
        }

        // Select next row
        var nonEntries = $(self.frame).find('.textModifier');
        nonEntries[nonEntries.length - 19].click();
        console.debug('Added: ' + date);
    }
    convertToButtons() {
        var buttonList = [];
        var firstDate = $(this.frame).find('[title="Week Start Dates"]')[1];
        if (firstDate == undefined) {
            console.error('Could not find date button');
            return;
        }
        buttonList.push(firstDate);
        buttonList.push($(this.frame).find('[title="-"]')[3]);
        var self = this;

        buttonList.forEach(button => {
            button.className += ' button';
            button.onclick = function() {
                self.inputDate(button, self);
            }
        });
        console.log(buttonList);
    }
    setup() {
        this.updateFrameHandles();
        this.convertToButtons();
    }
    updateFrameHandles() {
        this.frame = document.getElementById('e1menuAppIframe').contentWindow.document;
        this.dataTable = $(this.frame).find('.dataGrid')[0];
    }
    isTimeEntry() {
        this.updateFrameHandles();
        return $(this.frame).find('[title="Week Start Dates"]')[1] != undefined;
    }
    addButtonToHeader() {
        var menu = document.getElementById('menuContainer');
        var activateButton = elmtify('<div id="e1TimeKeeping" class="e1MenuBarItem" aria-describedby="Custom UserScript enhancements" title="Custom UserScript enhancements">' +
            '<img border="0" src="/jde/share/images/alta/mainmenu/personalize.png" /></div>');
        var self = this;
        activateButton.onclick = function() {
            self.setup();
        }
        menu.append(activateButton);
    }
    initialize() {
        this.addButtonToHeader();
    }
}

window.onload = function() {
    document.timeKeeping = new E1TimeKeeping();
    //document.timeKeeping.initialize();
}