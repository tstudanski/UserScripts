// ==UserScript==
// @name         Service Now Enhancements
// @namespace    https://github.com/tstudanski/
// @version      2023.10.24.1
// @description  Adds things to Service Now to make it easier to navigate
// @author       Tyler Studanski <tyler.studanski@mspmac.org>
// @match        https://mac.service-now.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=service-now.com
// @downloadURL  https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/SNOW.user.js
// @updateURL    https://github.com/tstudanski/UserScripts/raw/main/Internal-Tools/SNOW.user.js
// @require      https://github.com/tstudanski/UserScripts/raw/main/common/Elmtify.js
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
    }
}

class SnowModel {
    constructor() {
        this.frame = document.getElementById('gsft_main').contentWindow.document;
    }
    venderSites = [
        { name: 'August Ash', url: 'https://changes.augustash.com/hc/en-us' },
        { name: 'Granicus Support', url: 'https://support.granicus.com/s' }
    ]
    Constants = {
        // regex copied from: https://stackoverflow.com/a/8234912/3416155
        urlRegex: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        linkTemplate: '<a href="@url" target="_blank">@url</a>'
    }
    addVendors() {
        var template = elmtify('<div class="col-auto"><img src="" /> <a class="dropdown-item" target="_blank" href="#">Action</a></div>');
        var iconBase = 'https://www.google.com/s2/favicons?sz=16&domain=';
        var menu = document.getElementById('vendorLinks');
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
        var header = document.getElementsByClassName('navbar-header')[0];
        if (header == undefined) {
            console.error('Expected header is not present.  Not adding elements.');
            return;
        }
        var input = elmtify('<input id="gSearch" class="me-2 nav-item" type="search" placeholder="Global Search" aria-label="Global Search">');
        var button = elmtify('<input id="gsButton" class="btn btn-primary nav-item" type="submit">Search</input>');
        var globalTable = elmtify('<input class="btn btn-primary nav-item" type="button" onclick="location.href=\'https://mac.service-now.com/nav_to.do?uri=%2Ftask_list.do%3F\';" value="Go To Global Search Table" />');
        var vendorDropdown = elmtify('<div class="dropdown"><a class="btn btn-primary nav-item dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-expanded="false">Vendor Support Links</a><div id="vendorLinks" class="dropdown-menu"></div></div>');

        header.appendChild(input);
        header.appendChild(button);
        header.appendChild(globalTable);
        header.appendChild(vendorDropdown);
        this.addVendors();
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
        console.debug('Attempted to search: ' + text);
        var tag = document.snowModel.findTag(text);

        if (tag != null) {
            console.debug('Generated search URL: ' + tag.url);
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

        // Add post via Ctrl + ENTER key combo
        if (this.frame == undefined) {
            console.error('No iframe detected');
            return;
        }
        this.frame.getElementById("activity-stream-textarea").addEventListener("keydown", function(event) {
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
        console.log('Found URL: ' + match[0]);
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
    initialize() {
        this.addElements();
        this.connectToUi();
        this.convertCommentLinks();
    }
}

window.onload = function() {
    document.snowModel = new SnowModel();
    document.snowModel.initialize();
}