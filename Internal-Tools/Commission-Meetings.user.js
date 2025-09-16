// ==UserScript==
// @name         Commission Meetings
// @namespace    https://github.com/tstudanski/
// @version      2025.09.16.0
// @description  Adds helpful functions to the site.  Currently just adds playback speed buttons.
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://metroairports.granicus.com/player/clip/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=metroairports.granicus.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/Commission-Meetings.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/Commission-Meetings.user.js
// @grant        none
// ==/UserScript==

'use strict';
class Enhancements {
    ShiftRightProps = {
        key: "ArrowRight",
        code: "ArrowRight",
        keyCode: 39,
        which: 39,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    }
    ShiftLeftProps = {
        key: "ArrowLeft",
        code: "ArrowLeft",
        keyCode: 37,
        which: 37,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    }

    constructor() {
        this.playerElement = document.querySelector('.fp-player');
    }
    sendKeystroke(props, target = document.activeElement) {
        const down = new KeyboardEvent("keydown", props);
        const up = new KeyboardEvent("keyup", props);

        target.dispatchEvent(down);
        target.dispatchEvent(up);
    }

    addButtons() {
        var self = this;
        var faster = document.createElement('strong');
        faster.textContent = 'Faster';
        faster.className = 'fp-speed';
        faster.onclick = function() {
            self.sendKeystroke(self.ShiftRightProps,self.playerElement);
        };

        var slower = document.createElement('strong');
        slower.textContent = 'Slower';
        slower.className = 'fp-speed';
        slower.onclick = function() {
            self.sendKeystroke(self.ShiftLeftProps,self.playerElement);
        };

        var sideColumn = document.querySelector('.fp-controls');
        sideColumn.append(slower);
        sideColumn.append(faster);
    }

    run() {
        // request spectific features
        this.addButtons();
    }
}

document.enhancements = new Enhancements();
document.enhancements.run();