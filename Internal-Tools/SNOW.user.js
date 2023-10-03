// ==UserScript==
// @name         Service Now Enhancements
// @namespace    https://github.com/tstudanski/
// @version      2023.10.3.4
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
        }
    }
}

class SnowModel {
    constructor() {}
    addElements() {
        var header = document.getElementsByClassName('navbar-header')[0];
        var input = elmtify('<input id="gSearch" class="me-2 nav-item" type="search" placeholder="Global Search" aria-label="Global Search">');
        var button = elmtify('<button id="gsButton" class="btn btn-primary nav-item" type="submit">Search</button>');

        header.appendChild(input);
        header.appendChild(button);
    }
    findTag(text) {
        var tag = null;
        for (var type in document.SnowModel.Types) {
            var cType = document.SnowModel.Types[type];
            if (text.indexOf(cType.tag) == 0) {
                tag = cType;
                console.log('Found ' + cType.tag);
                break;
            }
        }
        if (tag === null) {
            console.error("Could not identify type for: " + text);
            return null;
        }
        tag.url = tag.searchTemplate.replaceAll('@Ticket', text);
        return tag;
    }
    search() {
        var text = document.getElementById('gSearch').value.trim();
        console.log('Attempted to search: ' + text);
        var tag = document.snowModel.findTag(text);

        if (tag != null) {
            console.log('Generated search URL: ' + tag.url);
            window.location.href = tag.url;
        }
    }
    connectToUi() {
        var self = this;
        var searchButton = document.getElementById('gsButton');
        searchButton.onclick = self.search;

        // Add search via ENTER key
        document.getElementById("gSearch").addEventListener("keyup", function(event) {
            event.preventDefault();
            if (event.key === "Enter") {
                document.getElementById("gsButton").click();
            }
        });
    }
    initialize() {
        this.addElements();
        this.connectToUi();
    }
}

document.snowModel = new SnowModel();
window.onload = function() {
    document.snowModel.initialize();
}