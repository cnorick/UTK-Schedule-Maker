// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([
                {
                    // That fires when the user navigates to myutk.
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: { urlMatches: '(https:\/\/)?((my.utk.edu)|(myutk.utk.edu))(\/(\s\S))*' },
                        })
                    ],
                    // And shows the extension's page action.
                    actions: [ new chrome.declarativeContent.ShowPageAction() ]
                }
        ]);
    });
});



// Listen for message to be sent back from getPageSource.
chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "getSource") {
        createCalendar(request.source)
    }
});


// Fires when the icon is pressed on the allowed pages.
chrome.pageAction.onClicked.addListener(function(tab) {

    chrome.tabs.executeScript(null, { file: "getPageSource.js" }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError);
        }
    });
});




function createCalendar(source) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, "text/html");

    // table is the html table from myutk.
    var table = doc.getElementById('upClasses').querySelector('table');

    // Term is the title of the table (the semester and year of the schedule).
    var term = doc.getElementById('lblScheduleTerm').textContent;

    var classList = tableToClassList(table);
    var cal = ics();
    for (var i in classList) {
        var c = classList[i];
        var a = cal.addEvent(
            c.courseNumber,
            c.crn + '  ' + c.instructor + '  ' + c.courseLink,
            c.place, getClassStart(term, c),
            getClassEnd(term, c),
            false,
            { byDay: cleanDays(c.days), freq: 'WEEKLY', until: getTermEnd(term), interval: 1 }
        );
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "download", cal: cal.calendar(), term: term }, function (response) { });
    });
}