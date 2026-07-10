// ==UserScript==
// @name         Commission Meetings
// @namespace    https://github.com/tstudanski/
// @version      2025.09.17.0
// @description  Adds helpful functions to the site.  Currently this adds playback speed buttons and remembers how much of the video has been watched.
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://metroairports.granicus.com/player/clip/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=metroairports.granicus.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/Commission-Meetings.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/Commission-Meetings.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/BaseModel.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/LocalStorageRepoService.js
// @grant        none
// ==/UserScript==

'use strict';
class Enhancements {
    // How often to remember watch time
    TimeCheckInMils = 5000
    // Represents pressing shift + right arrow key
    ShiftRightProps = {
        key: "ArrowRight",
        code: "ArrowRight",
        keyCode: 39,
        which: 39,
        shiftKey: true,
        bubbles: true,
        cancelable: true
    }
    // Represents pressing shift + left arrow key
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
        this.seekForward = document.querySelector('.seek-forward');
        this.videoId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1, window.location.href.indexOf('?'));
        this.repo = new LocalStorageRepoService('CommissionMeetings');
    }

    // Fakes a keystroke to allow the user to click instead
    // props: The properties of which key is pressed and depressed
    // target: The element that should be affected by the keystroke
    sendKeystroke(props, target = document.activeElement) {
        const down = new KeyboardEvent("keydown", props);
        const up = new KeyboardEvent("keyup", props);

        target.dispatchEvent(down);
        target.dispatchEvent(up);
    }

    // Adds buttons to the video player
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

    // Captures how far into the video the user is
    captureTime() {
        return document.querySelector('.fp-elapsed').textContent;
    }

    // Convert time to an object
    // timeString: Takes a string in the format [hh:]mm:ss and returns it as an object
    createTime(timeString) {
        var parts = timeString.split(':');
        var hour, min, sec;
        if (parts.length == 3) {
            hour = parseInt(parts[0]);
            min = parseInt(parts[1]);
            sec = parseInt(parts[2]);
        } else {
            hour = 0;
            min = parseInt(parts[0]);
            sec = parseInt(parts[1]);
        }
        return {hours: hour, minutes: min, seconds: sec};
    }

    // Updates the player to just before the requested time
    // time: the desired time to go to in the format [hh:]mm:ss
    jumpToTime(time) {
        // convert time to seconds
        var timeObj = this.createTime(time);
        var seconds = timeObj.seconds;
        seconds += timeObj.minutes * 60;
        seconds += timeObj.hours * 3600;

        var player = flowplayer('.flowplayer');

        // ensure player is ready before seeking
        player.on('ready', function(e, api) {
            // Example: jump to 1 minute 15 seconds
            api.seek(seconds);
        });

        // Calling this to make this function work outside of the page load.
        player.seek(seconds);
    }

    // Monitors what timestamp the video is on and periodically updates a reference for this specific video on the client machine
    monitorTime() {
        var self = this;
        setInterval(function () {
            self.repo.set(self.videoId, self.captureTime());
        }, this.TimeCheckInMils);
        console.log('Now monitoring watch time');
    }

    // This jumps the video to nearly the same place it was previously watched to resume viewing if the user left
    resume() {
        // Get the previous watched time
        var previousTime = this.repo.get(this.videoId);
        if (previousTime) {
            // Jump to that point in the video
            this.jumpToTime(previousTime);
        }

        // Start monitoring the current watch time
        this.monitorTime();
    }

    // Requests spectific features
    run() {
        this.addButtons();
        this.resume();
    }
}

document.enhancements = new Enhancements();
document.enhancements.run();