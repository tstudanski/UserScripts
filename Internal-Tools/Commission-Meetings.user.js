// ==UserScript==
// @name         Commission Meetings
// @namespace    https://github.com/tstudanski/
// @version      2026.07.10.2
// @description  Adds helpful functions to the site.  Currently this adds playback speed buttons and remembers how much of the video has been watched.
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://metroairports.granicus.com/player/clip/*
// @match        https://metroairports.granicus.com/ViewPublisher.php*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=metroairports.granicus.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/Commission-Meetings.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/Commission-Meetings.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/BaseModel.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/RepoServices/BaseRepoService.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/RepoServices/GMRepoService.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==

'use strict';
class Enhancements extends BaseModel {
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

    ProgressTemplate = Object.assign(document.createElement('div'), {
        style: 'height:4px;width:0;background:#3b82f6;z-index:999999'
    });

    constructor() {
        super();
        this.repo = new GMRepoService('CommissionMeetings', this.env);
        this.videoId = window.location.href.substring(window.location.href.lastIndexOf('/') + 1, window.location.href.indexOf('?'));
        this.isVideoPage = false;
        if (parseInt(this.videoId)) {
            this.isVideoPage = true;
            this.playerElement = document.querySelector('.fp-player');
            this.seekForward = document.querySelector('.seek-forward');
            this.player = flowplayer('.flowplayer');
        }
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

        this.debug('Added playback speed buttons to the video player');
    }

    // Updates the player to just before the requested time
    // time: the desired time to go to in the format [hh:]mm:ss
    jumpToTime(time) {
        // ensure player is ready before seeking
        this.player.on('ready', function(e, api) {
            // Example: jump to 1 minute 15 seconds
            api.seek(time);
        });

        // Calling this to make this function work outside of the page load.
        this.player.seek(time);
    }

    // Monitors what timestamp the video is on and periodically updates a reference for this specific video on the client machine
    monitorTime() {
        var self = this;
        setInterval(function () {
            var ctime = self.player.video.time;
            var ttime = self.player.video.duration;
            self.repo.set(self.videoId, ctime);
            self.repo.set(self.videoId + '_percent', ctime / ttime);
        }, this.TimeCheckInMils);
        this.debug('Now monitoring watch time');
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

    // This feature captures the watched status of the video and updates the UI to reflect that.
    addWatchedStatus() {
        var self = this;
        var allVideos = this.repo.getAll();
        this.debug('All videos watched status: ', allVideos);
        var videoLinks = Array.from(document.querySelector('#archive').querySelectorAll('a')).filter(link => 'Video' === link.textContent.trim());
        var videoIds = Object.keys(allVideos).filter(key => !isNaN(key));
        // Loop through each video link and update the UI to reflect the watched status
        videoIds.forEach(videoId => {
            var videoLink = videoLinks.find(link => link.onclick.toString().indexOf('clip_id='+videoId) > -1);
            if (videoLink) {
                var percentWatched = allVideos[videoId + '_percent'];
                var progressElement = self.ProgressTemplate.cloneNode(true);
                progressElement.style.width = (percentWatched * 100) + '%';
                if (percentWatched >= 0.9) {
                    progressElement.style.background = 'green';
                } else if (percentWatched >= 0.5) {
                    progressElement.style.background = 'orange';
                } else {
                    progressElement.style.background = 'red';
                }
                var timeElement = videoLink.parentElement.previousElementSibling.previousElementSibling.previousElementSibling;
                timeElement.appendChild(progressElement);
            }
        });
    }

    // Requests spectific features
    run() {
        if (this.isVideoPage) {
            this.addButtons();
            this.resume();
        } else {
            this.addWatchedStatus();
        }
    }
}

document.enhancements = new Enhancements();
document.enhancements.run();