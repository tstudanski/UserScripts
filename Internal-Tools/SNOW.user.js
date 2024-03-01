// ==UserScript==
// @name         Service Now Enhancements
// @namespace    https://github.com/tstudanski/
// @version      2024.3.1.0
// @description  Adds things to Service Now to make it easier to navigate
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://mac.service-now.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/SNOW.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/SNOW.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/Elmtify.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/WaitFor.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/ChangeModule.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/PageChangeModule.js
// @grant        none
// ==/UserScript==

'use strict';
// Your code here...
document.SnowModel = {
    Types: {
        ChangeRequest: {
            tag: 'CHG',
            searchTemplate: 'https://mac.service-now.com/nav_to.do?uri=%2Fchange_request_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOnumber%3D@Ticket%26sysparm_query_encoded%3DGOTOnumber%3D@Ticket%26sysparm_view%3D'
        },
        Demand: {
            tag: 'DMND',
            searchTemplate: 'https://mac.service-now.com/nav_to.do?uri=%2Fdmn_demand_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOnumber%3D@Ticket%26sysparm_query_encoded%3DGOTOnumber%3D@Ticket%26sysparm_view%3Dess'
        },
        Incident: {
            tag: 'INC',
            searchTemplate: 'https://mac.service-now.com/nav_to.do?uri=%2Fincident_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOnumber%3D@Ticket%26sysparm_query_encoded%3DGOTOnumber%3D@Ticket%26sysparm_view%3D'
        },
        Problem: {
            tag: 'PRB',
            searchTemplate: 'https://mac.service-now.com/nav_to.do?uri=%2Fproblem_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOnumber%3D@Ticket%26sysparm_query_encoded%3DGOTOnumber%3D@Ticket%26sysparm_view%3D'
        },
        RequestItem: {
            tag: 'RITM',
            searchTemplate: 'https://mac.service-now.com/nav_to.do?uri=%2Fsc_req_item_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOnumber%3D@Ticket%26sysparm_query_encoded%3DGOTOnumber%3D@Ticket%26sysparm_view%3Dess'
        },
        Task: {
            tag: '',
            searchTemplate: 'https://mac.service-now.com/nav_to.do?uri=%2Ftask_list.do%3Fsysparm_first_row%3D1%26sysparm_query%3DGOTOnumber%3D@Ticket%26sysparm_query_encoded%3DGOTOnumber%3D@Ticket%26sysparm_view%3D'
        }
    },
    PageTypes: {
        TimeCard: "TimeCard",
        Unknown: "Unknown"
    }
}

class SnowModel {
    env = 'prod'
    constructor() {
        this.frame = null;
        this.workingOn = null;
        this.delayTime = 100; // in milliseconds
        this.pageModule = new PageChangeModule(500);
        var self = this;
        this.pageModule.onChange = function() {
            self.debug('Page change happened----------------------');
            self.initialize();
        }
    }
    venderSites = [
        { name: 'August Ash', url: 'https://changes.augustash.com/hc/en-us' },
        { name: 'Granicus Support', url: 'https://support.granicus.com/s' }
    ]
    Constants = {
        // regex copied from: https://stackoverflow.com/a/8234912/3416155
        urlRegex: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        linkTemplate: '<a href="@url" target="_blank">@url</a>',
        frameCheck: 200 // time between iframe change check in ms
    }
    debug(...data) {
        if (this.env != 'prod') {
            console.log(data);
        }
    }
    updateFrame() {
        var mainFrame = document.getElementById('gsft_main');
        if (mainFrame == undefined) {
            console.error('Could not find main iframe');
        } else {
            this.frame = mainFrame.contentWindow.document;
        }
        this.frameBasedChanges();
    }
    // based on code found here: https://stackoverflow.com/a/20156615/3416155
    monitorFrame() {
        // TODO update with new shadow DOM
        // Check for changes
        var self = this;
        var frame = window.document.children[0].getElementsByTagName('iframe')[0];
        if (frame != null) {
            var observer = new MutationObserver(function(e) {
                if (e[0].removedNodes) {
                    // update if different
                    self.debug('iframe changed');
                    self.updateFrame();
                }
            });
            observer.observe(frame, { attributes: true });
        } else {
            this.debug('frame not loaded yet');
            setTimeout(function() {
                self.monitorFrame();
            }, self.Constants.frameCheck);
        }
    }
    addVendors(menu) {
        var template = elmtify('<div class="col-auto"><img src="" /> <a class="dropdown-item" target="_blank" href="#">Action</a></div>');
        var iconBase = 'https://www.google.com/s2/favicons?sz=16&domain=';
        this.venderSites.forEach(vendor => {
            var item = template.cloneNode(true);
            var link = item.getElementsByClassName('dropdown-item')[0];
            link.href = vendor.url;
            link.textContent = vendor.name;
            var icon = item.getElementsByTagName('img')[0];
            icon.src = iconBase + vendor.url;
            menu.appendChild(item);
        });
    }
    addElements() {
        var header = this.findHeader();
        if (!header) {
            console.error('Expected header is not present.  Not adding elements.');
            return;
        }
        var buttonsObj = this.createSearchButtons(header.className.indexOf('navbar-header') == -1);
        if (buttonsObj.gSearch && !header.querySelector('#gSearch')) {
            header.appendChild(buttonsObj.gSearch);
        }
        if (buttonsObj.gsButton && !header.querySelector('#gsButton')) {
            header.appendChild(buttonsObj.gsButton);
        }
        if (buttonsObj.gTable && !header.querySelector('#gTable')) {
            header.appendChild(buttonsObj.gTable);
        }
        if (buttonsObj.vDropdown && !header.querySelector('#vDropdown')) {
            header.appendChild(buttonsObj.vDropdown);
            var vendorLinks = buttonsObj.vDropdown.querySelector('#vendorLinks');
            this.addVendors(vendorLinks);
        }
    }
    findHeader() {
        var header = document.getElementsByClassName('navbar-header')[0];
        if (!header) {
            // Attempt to find shadowDOM header
            var searchFor = '.sn-polaris-navigation.polaris-header-menu';
            header = this.recursiveShadowSearch(document, searchFor);
        }
        if (!header) {
            console.error('Could not find header');
            return;
        }
        return header;
    }
    recursiveShadowSearch(currentRoot, selectorString) {
        var result = currentRoot.querySelector(selectorString);
        this.debug(result);
        if (!result) {
            var possibleShadows = currentRoot.querySelectorAll('[component-id]');
            this.debug(possibleShadows);
            if (possibleShadows.length > 0) {
                var found = false;
                var self = this;
                for (var i = 0; i < possibleShadows.length; i++) {
                    if (found) {
                        break;
                    }
                    found = self.recursiveShadowSearch(possibleShadows[i].shadowRoot, selectorString);
                }
                if (found) {
                    return found;
                }
            }
            this.debug('Could not find anymore shadows');
        } else {
            return result;
        }

        console.error('Couldn\'t find element');
    }
    createSearchButtons(isInShadow) {
        var result = {};
        if (isInShadow) {
            result.vDropdown = elmtify('<div id="vDropdown" class="dropdown" style="position: absolute;margin-inline-end: 0px;left: 415px;"><input type="button" class="dropdown-toggle" value="Vendor Support Links" onclick="this.nextSibling.hidden = !this.nextSibling.hidden;" /><div id="vendorLinks" class="dropdown-menu" hidden></div></div>');

        } else {
            result.gSearch = elmtify('<input id="gSearch" class="me-2 nav-item" type="search" placeholder="Global Search" aria-label="Global Search">');
            result.gsButton = elmtify('<input id="gsButton" class="btn btn-primary nav-item" type="submit">Search</input>');
            result.gTable = elmtify('<input id="gTable" class="btn btn-primary nav-item" type="button" onclick="location.href=\'https://mac.service-now.com/nav_to.do?uri=%2Ftask_list.do%3F\';" value="Go To Global Search Table" />');
            result.vDropdown = elmtify('<div id="vDropdown" class="dropdown"><a class="btn btn-primary nav-item dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-expanded="false">Vendor Support Links</a><div id="vendorLinks" class="dropdown-menu"></div></div>');
        }

        return result;
    }
    findTag(text) {
        var tag = null;
        for (var type in document.SnowModel.Types) {
            var cType = document.SnowModel.Types[type];
            if (text.indexOf(cType.tag) == 0) {
                tag = cType;
                break;
            }
        }
        if (tag === document.SnowModel.Types.Task) {
            console.warn("Could not identify type for: " + text + ' so attempting to search via Task');
        }
        tag.url = tag.searchTemplate.replaceAll('@Ticket', text);
        return tag;
    }
    search() {
        var text = document.getElementById('gSearch').value.trim();
        this.debug('Attempted to search: ' + text);
        var tag = document.snowModel.findTag(text);

        if (tag != null) {
            this.debug('Generated search URL: ' + tag.url);
            window.location.href = tag.url;
        }
    }
    connectToUi() {
        var self = this;
        var searchButton = document.getElementById('gsButton');
        if (searchButton == undefined) {
            console.error('Global Search button isn\'t present');
            return;
        }
        searchButton.onclick = self.search;

        // Add search via ENTER key
        document.getElementById("gSearch").addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.key === "Enter") {
                document.getElementById("gsButton").click();
            }
        });
    }
    addCommentViaCtrlEnter() {
        var self = this;
        // Add post via Ctrl + ENTER key combo
        if (this.frame == undefined) {
            console.error('No iframe detected');
            return;
        }
        var activityStream = this.frame.getElementById("activity-stream-textarea");
        if (activityStream == undefined) {
            console.error('No activity stream detected');
            return;
        }
        activityStream.addEventListener("keydown", function(event) {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                event.preventDefault();
                var button = self.frame.getElementsByClassName('activity-submit')[0];
                if (button != undefined) {
                    button.click();
                }
            }
        });
    }
    generateLinks(remainingText) {
        var match = remainingText.match(this.Constants.urlRegex);
        if (!match) {
            return remainingText;
        }
        this.debug('Found URL: ' + match[0]);
        var newHtml = match.input.substring(0, match.index);
        newHtml += this.Constants.linkTemplate.replaceAll('@url', match[0]);
        newHtml += this.generateLinks(match.input.substring(match.index + match[0].length));
        return newHtml;
    }
    convertCommentLinks() {
        // Need to go into iframe 1st
        if (this.frame == undefined) {
            console.error('No iframe detected');
            return;
        }
        var comments = Array.from(this.frame.getElementsByClassName('sn-widget-textblock-body'));
        comments.forEach(comment => {
            var newHtml = this.generateLinks(comment.innerHTML);
            comment.innerHTML = newHtml;
        });
    }
    // Identifies which type of page we are currently working with
    identifyPageType() {
        // Pretty sure TCP stands for Time Card Portal
        if (window.location.href.indexOf('tcp') >= 0) {
            return document.SnowModel.PageTypes.TimeCard;
        } else {
            return document.SnowModel.PageTypes.Unknown;
        }
    }
    // Adds a Clean button to the UI
    addCleanButton() {
        var buttonBar = $('div.pull-right')[0];
        var cleanButton = elmtify('<button id="cleanbtn" type="button" class="btn btn-primary">Clean</button>');
        var self = this;
        cleanButton.onclick = function() {
            self.markCleanupRows();
            self.recursiveCleanup();
        }
        buttonBar.appendChild(cleanButton);

        var progressBar = elmtify('<div id="progressbar" hidden class="progress" role="progressbar" aria-label="Clean up progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width: 0%"></div></div>');
        this.progressBar = progressBar;
        buttonBar.parentElement.appendChild(progressBar);
    }
    // Identifies which rows are empty and should be deleted
    markCleanupRows() {
        var rows = [];
        $('.tc-row').toArray().forEach(row => {
            var newObj = {
                name: $(row).find('.anchor-tag')[0].textContent,
                total: $(row).find('.total')[0].textContent.trim(),
                button: row.children[10].children[0]
            };
            newObj.button.id = newObj.name + 'btn';
            rows.push(newObj);
        });
        rows = rows.filter(row => {
            return row.total == 0;
        })

        this.debug('Rows to clean')
        this.debug(rows);
        this.cleanRows = rows;
        this.originalRowCount = rows.length;
    }
    // Triggers a delete for 1 row at a time until all rows have been removed
    recursiveCleanup() {
        if (this.cleanRows.length > 0) {
            this.workingOn = this.cleanRows[0];
            this.workingOn.button.click();
            var popover = this.workingOn.button.nextSibling;
            console.log('Removing: ' + this.workingOn.name);
            $(popover).find('a')[2].click();
            $('#confirmOk').click();
            this.cleanRows.splice(0, 1);
            this.previousRowId = this.workingOn.name + 'btn';
            this.workingOn = null;
            var self = this;
            this.updateProgressBar(1 - (this.cleanRows.length / this.originalRowCount));
            waitFor(function() {
                return $('#' + self.previousRowId).length == 0;
            }, function() {
                self.recursiveCleanup();
            }, this.delayTime)
        }
    }
    updateProgressBar(percent) {
        this.progressBar.hidden = false;
        var txt = (percent * 100) + '%';
        this.progressBar.children[0].style.width = txt;
        if (percent == 1) {
            this.progressBar.hidden = true;
        }
    }
    frameBasedChanges() {
        this.addCommentViaCtrlEnter();
        this.convertCommentLinks();
    }
    isShadowDomPresent() {
        var possibleShadow = $('[component-id]');
        if (possibleShadow) {
            this.shadowRoot = possibleShadow.shadowRoot;
            return true;
        }
        return false;
    }
    // 1st method to be called to trigger everything
    initialize() {
        var self = this;
        var pageType = this.identifyPageType();
        if (document.SnowModel.PageTypes.TimeCard == pageType) {
            waitFor(function() {
                return $(document).find('div.pull-right').length > 0 && $(document).find('.loader').length == 0;
            }, function() {
                self.addCleanButton();
            }, this.delayTime);
        } else {
            this.addElements();
            this.connectToUi();
            this.monitorFrame();
        }
    }
}

window.onload = function() {
    document.snowModel = new SnowModel();
    console.log('model created');
    setTimeout(function(){
        console.log('model initializing');
        document.snowModel.initialize();
    }, 1000);
}