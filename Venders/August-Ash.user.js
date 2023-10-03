// ==UserScript==
// @name         August Ash New Request Button
// @namespace    https://github.com/tstudanski/
// @version      2023.10.3.2
// @description  Adds helpful buttons to the site
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://changes.augustash.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=augustash.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Venders/August-Ash.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Venders/August-Ash.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    var Enhancements = function() {
        var self = {};
        self.addRequestButton = function() {
            var nav = $('.nav-inner')[0];
            nav.innerHTML = nav.innerHTML + nav.childNodes[7].data;
        }

        self.addJumpButtons = function() {
            var toBottom = document.createElement('a');
            toBottom.textContent = 'Jump to latest update';
            toBottom.role = 'button';
            toBottom.onclick = function() {
                $('html, body').animate({ scrollTop: $('.comment-list').height() }, 'slow');
            };
            $('.side-column').append(toBottom);

            var toTop = document.createElement('a');
            toTop.textContent = 'Return to Top';
            toTop.role = 'button';
            toTop.onclick = function() {
                $('html, body').animate({ scrollTop: 0 }, 'slow');
            };
            $('.comment-form-controls').append(toTop);
        };

        self.changeUrlToLink = function() {
            var linkDd = self.FindUrlElement();
            var url = linkDd.textContent.trim();
            var link = document.createElement('a');
            link.href = url;
            link.textContent = url;
            link.target = '_blank';
            linkDd.children[0].remove();
            linkDd.append(link);
        };
        self.FindUrlElement = function() {
            var detailsPanel = $('.request-details')[0];
            for (var i = 0; i < detailsPanel.children.length; i++) {
                if (detailsPanel.children[i].textContent.indexOf('URL (Website Address)') >= 0) {
                    return detailsPanel.children[i + 1];
                }
            }
        }

        self.stickyDetails = function() {
            var details = $('.side-column')[0];
            details.style.position = 'sticky';
            details.style.top = '5px';
        };

        self.run = function() {
            self.addRequestButton();
            self.addJumpButtons();
            self.changeUrlToLink();
            self.stickyDetails();
        }

        return self;
    };

    document.enhancements = Enhancements();
    document.enhancements.run();
})();