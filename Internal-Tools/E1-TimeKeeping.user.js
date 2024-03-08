// ==UserScript==
// @name         E1 Time Keeping
// @namespace    https://github.com/tstudanski/
// @version      2024.3.8.0
// @description  Simplifying time weekly entry
// @author       Tyler Studanski
// @match        https://myinfo.mspairport.com/jde/E1Menu.maf
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mspairport.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/E1-TimeKeeping.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/E1-TimeKeeping.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/BaseModel.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/Elmtify.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/ChangeModule.js
// @grant        none
// ==/UserScript==

'use strict';
class E1TimeKeeping extends BaseModel {
    constructor() {
        super();
        this.monitor = new OnChangeModule(500, function(){
            return document.getElementById('e1menuAppIframe').contentDocument;
        })
        var self = this;
        this.monitor.onChange = function() {
            self.debug('frame changed');
            if (self.isTimeEntry()) {
                self.debug("Found time entry");
                self.convertToButtons();
            }
        }
        this.monitor.onChange();
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
        // Set to selected pay type
        var payType = $(self.frame).find("input[type='radio'][name='payType']:checked").val();
        self.updateField($(latestLine[2]).find('input')[0], payType);
        // Fill in Week
        for (var i = 6; i < 11; i++) {
            self.updateField($(latestLine[i]).find('input')[0], 8);
        }

        // Select next row
        var nonEntries = $(self.frame).find('.textModifier');
        nonEntries[nonEntries.length - 19].click();
        this.debug('Added: ' + date);
    }
    convertToButtons() {
        this.debug('Adding buttons');
        this.changeDatesToButtons();
        this.changePayTypeToRadio();
    }
    changeDatesToButtons() {
        this.debug('Converting dates to buttons');
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
        this.debug(buttonList);
    }
    changePayTypeToRadio() {
        this.debug('Adding radio buttons');
        var payTypeDiv = $(this.frame).find('#div0_639');
        var labels = payTypeDiv.find('div.WebLabel').toArray();

        labels.forEach(label => {
            var radioButton = elmtify('<input type="radio" name="payType" value="HTML">');
            radioButton.value = label.title.match(/^[0-9]+/)[0];
            label.prepend(radioButton);
            // Add click event to select the radio
            label.onclick = function() {
                this.children[0].click();
            }
            this.debug('Adding radio button for: ' + radioButton.value);
        });

        // Start with Regular selected
        payTypeDiv.find('input[name="payType"][value="1"]').click();
    }
    updateFrameHandles() {
        this.debug('Updating frame reference');
        this.frame = document.getElementById('e1menuAppIframe').contentWindow.document;
        this.dataTable = $(this.frame).find('.dataGrid')[0];
    }
    isTimeEntry() {
        this.updateFrameHandles();
        return $(this.frame).find('[title="Week Start Dates"]')[1] != undefined;
    }
}

window.onload = function() {
    document.timeKeeping = new E1TimeKeeping();
}