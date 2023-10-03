// ==UserScript==
// @name         LMS Training Window Resize
// @namespace    https://github.com/tstudanski/
// @version      2023.10.3.2
// @description  Resizes the window so there are no scroll bars
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://mac.certpointsystems.com/repository/online/scorm/scp2006/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=certpointsystems.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/LMS-Training.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/LMS-Training.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    class LmsTraining {
        constructor() {
            this.rememberSize = false;
        }
        updateScreenSize() {
            var width = 1155;
            var height = 832;
            if (this.rememberSize) {
                width = localStorage.getItem('width');
                height = localStorage.getItem('height');
            }
            window.resizeTo(width, height);
            console.log("Updated screen size");
        }
        memorizeSize() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            localStorage.setItem('width', width);
            localStorage.setItem('height', height);
        }
        run() {
            this.updateScreenSize();
            var self = this;
            window.addEventListener('resize', function(event) {
                self.memorizeSize();
            }, true);
        }
    }

    document.lmsTraining = new LmsTraining();
    window.onload = function() {
        document.lmsTraining.run();
    }
})();