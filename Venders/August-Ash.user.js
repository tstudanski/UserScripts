// ==UserScript==
// @name         August Ash New Request Button
// @namespace    https://github.com/tstudanski/
// @version      2023.11.2.1
// @description  Adds helpful functions to the site
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://changes.augustash.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=augustash.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Venders/August-Ash.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Venders/August-Ash.user.js
// @grant        none
// ==/UserScript==

'use strict';
class Enhancements {
    constructor() {}
    addRequestButton() {
        var nav = $('.nav-inner')[0];
        nav.innerHTML = nav.innerHTML + nav.childNodes[7].data;
    }
    addJumpButtons() {
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
    }
    changeUrlToLink() {
        var linkDd = this.FindUrlElement();
        var url = linkDd.textContent.trim();
        var link = document.createElement('a');
        link.href = url;
        link.textContent = url;
        link.target = '_blank';
        linkDd.children[0].remove();
        linkDd.append(link);
    }
    FindUrlElement() {
        var detailsPanel = $('.request-details')[0];
        for (var i = 0; i < detailsPanel.children.length; i++) {
            if (detailsPanel.children[i].textContent.indexOf('URL (Website Address)') >= 0) {
                return detailsPanel.children[i + 1];
            }
        }
    }
    stickyDetails() {
        var details = $('.side-column')[0];
        details.style.position = 'sticky';
        details.style.top = '5px';
    }
    easyEntry() {
        // Add submit via Ctrl + ENTER key combo
        document.getElementById("request_comment_body").addEventListener("keydown", function(event) {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                var button = $("input[name='commit']")[0];
                if (button != undefined) {
                    button.click();
                }
            }
        });
    }
    run() {
        this.addRequestButton();
        this.addJumpButtons();
        this.changeUrlToLink();
        this.stickyDetails();
        this.easyEntry();
    }
}

document.enhancements = new Enhancements();
document.enhancements.run();