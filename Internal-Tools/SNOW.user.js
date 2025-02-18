// ==UserScript==
// @name         Service Now Enhancements
// @namespace    https://github.com/tstudanski/
// @version      2025.2.18.0
// @description  Adds things to Service Now to make it easier to navigate
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://mac.service-now.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/SNOW.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/SNOW.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/BaseModel.js
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
        Change: {name:'Change',search:'change_request.do'},
        Dashboard: {name:'Dashboard',search:'dashboard.do'},
        Incident: {name:'Incident',search:'incident.do'},
        Problem: {name:'Problem',search:'problem.do'},
        RequestItem: {name:'RequestItem',search:'req_item.do'},
        TimeCard: {name:'TimeCard',search:'tcp'},
        Tasks: {name:'Tasks',search:'task_list.do'},
        Unknown: {name:'Unknown',search:'.'},
        values: function() {
            return [this.Change, this.Dashboard, this.Incident, this.Problem, this.RequestItem,
            this.TimeCard, this.Tasks, this.Unknown];
        },
        findType: function() {
            var cUrl = window.location.href;
            var values = this.values();
            for (var i = 0; i < values.length; i++) {
                if (cUrl.indexOf(values[i].search) >= 0) {
                    return values[i];
                }
            }
        }
    }
}
class RetryModel extends BaseModel {
    constructor(count) {
        super();
        this.MAX_COUNT = count;
        this.map = {};
    }
    canRetry(name) {
        if (this.map[name] == null) {
            this.map[name] = this.MAX_COUNT;
        } else if (this.map[name] <= 0) {
            console.warn('Made ' + this.MAX_COUNT + ' attempts with: ' + name);
            return false;
        }
        this.debug(name + ' attempt #' + this.map[name]);
        this.map[name]--;
        return true;
    }
}
class SnowModel extends BaseModel {
    constructor() {
        super('dev');
        this.frame = null;
        this.workingOn = null;
        this.delayTime = 100; // in milliseconds
        this.pageModule = new PageChangeModule(500);
        this.retry = new RetryModel(50);
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
    updateFrame() {
        var mainFrame = document.getElementById('gsft_main');
        if (!mainFrame) {
            mainFrame = this.recursiveShadowSearch(document, '#gsft_main');
        }
        if (!mainFrame) {
            console.error('Could not find main iframe');
        } else {
            this.frame = mainFrame.contentWindow.document;
        }
        this.frameBasedChanges();
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
        var globalAlreadyExists = this.recursiveShadowSearch(document,'.sn-global-typeahead-input') != undefined;
        var buttonsObj = this.createSearchButtons(header.className.indexOf('navbar-header') == -1);
        if (!globalAlreadyExists) {
            if (buttonsObj.gSearch && !header.querySelector('#gSearch')) {
                header.appendChild(buttonsObj.gSearch);
            }
            if (buttonsObj.gsButton && !header.querySelector('#gsButton')) {
                header.appendChild(buttonsObj.gsButton);
            }
            if (buttonsObj.gTable && !header.querySelector('#gTable')) {
                header.appendChild(buttonsObj.gTable);
            }
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
            this.debug('Global Search button isn\'t present');
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
        return document.SnowModel.PageTypes.findType();
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
    addSelfAssignBtn() {
        // The frame is required
        this.debug(this.pageType.name, document, this.frame);
        // if (this.retry.canRetry('addSelfAssignBtn') && this.frame == null) {
             this.updateFrame();
        //     this.addSelfAssignBtn();
        //     return;
        // }
        // if (this.frame == null) {
        //     console.error("Couldn't add SelfAssign button: ", this.pageType.name, document, this.frame);
        //     return;
        // }
        // Create button
        var btn = elmtify('<span class="btn btn-default btn-ref" style="padding-left: -;padding-left: 0px;padding-right: 0px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-fill" viewBox="0 0 16 16"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path></svg></span>');
        // Add button];
        var assignedToLine = document.snowModel.frame.querySelectorAll('div[id$="assigned_to"]')[0];
        var addons = assignedToLine.querySelector('.form-field-addons');
        // Add function
        var self = this;
        btn.onclick = function() {
            self.selfAssign();
        }
        addons.appendChild(btn);
    }    
    selfAssign() {
        // Find fields
        var groupInput = this.frame.querySelectorAll('input[name$="assignment_group"]')[3];
        var assignedInput = this.frame.querySelectorAll('input[name$="assigned_to"]')[3];
        var comments = this.frame.querySelector('#activity-stream-work_notes-textarea');
        var userName = this.recursiveShadowSearch(document, '.user-menu').ariaLabel;
        this.debug(groupInput, assignedInput, comments, userName);

        // Find username
        userName = userName.substring(0, userName.indexOf(':'));
        // Assign values
        groupInput.value = 'Application Development Support';
        groupInput.dispatchEvent(new Event('blur', { 'bubbles': true }));
        assignedInput.value = userName;
        assignedInput.dispatchEvent(new Event('blur', { 'bubbles': true }));
        // Add comment
        comments.value = 'Self Assigned';
        comments.dispatchEvent(new Event('change', { 'bubbles': true }));
    }
    // Opens the only result automatically
    autoOpen() {
        // Make sure there is only 1 result
        var results = this.frame.querySelectorAll('.formlink');
        if (results.length == 0) {
            this.debug('No results');
        } else if (results.length > 1) {
            this.debug('Too man results');
        } else {
            console.log('Found 1 result.  Opening soon...');
        }
        
        // Open result after a breif pause
        setTimeout(function() {
            results[0].click();
        },500);
    }
    // 1st method to be called to trigger everything
    initialize() {
        var self = this;
        var pageType = this.identifyPageType();
        this.pageType = pageType;
        console.log('Found page type: ' + pageType.name);
        switch(pageType) {
            case document.SnowModel.PageTypes.TimeCard:
                waitFor(function() {
                    return $(document).find('div.pull-right').length > 0 && $(document).find('.loader').length == 0;
                }, function() {
                    self.addCleanButton();
                }, this.delayTime);
                break;
            case document.SnowModel.PageTypes.Change:
            case document.SnowModel.PageTypes.Incident:
            case document.SnowModel.PageTypes.Problem:
            case document.SnowModel.PageTypes.RequestItem:
                self.addSelfAssignBtn();
            case document.SnowModel.PageTypes.Dashboard:
                this.addElements();
                this.connectToUi();
                break;
            case document.SnowModel.PageTypes.Tasks:
                this.updateFrame();
                waitFor(function() {
                    return self.frame;
                }, function() {
                    self.autoOpen();
                }, this.delayTime);
                break;
            default:
                console.error("Not sure how to handle this page type", pageType);
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