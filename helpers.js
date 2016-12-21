// Retrieves the first day of the term from a server.
function getTermStart(term) {
    return getTermDate(term, 'begin');
}

// Retrieves the last day of the term from a server.
function getTermEnd(term) {
    return getTermDate(term, 'end');
}

function getTermDate(term, which){
	var termArray = term.split(' ');
    var semester = termArray[0].toLowerCase();
    var year = termArray[1];
	
	switch(semester){
		case 'spring':
			break;
		case 'mini-term':
			semester = 'mini';
			break;
		case 'summer':
			break;
		case 'fall':
			break;
	}

	var date = moment(termDates[year.toString()][semester][which], "YYYY-MM-DD");

	// Set end date to end of day.
	if(which == 'end')
		date.endOf('day');
	
    return date.toDate();
}

// Get the 0-based index (matching javascript getDay) from the date abbreviation.
function dayOfWeekCharToInt(day) {
    switch (day) {
        case 'U':
            return 0;
        case 'M':
            return 1;
        case 'T':
            return 2;
        case 'W':
            return 3;
        case 'R':
            return 4;
        case 'F':
            return 5;
        case 'S':
            return 6;
        default:
            null;
    }
}

// Returns the date and time of the start of the first occurrence of the class.
function getClassStart(term, cl) {
    // An array of days of the week the class is on.
    var classDays = [];
    for (d in cl.days) {
        classDays.push(dayOfWeekCharToInt(cl.days[d]));
    }

    // Move date to the first day of class.
    var date;
    for (date = moment(getTermStart(term)); !classDays.includes(parseInt(date.format('d'))); date.add(1, 'd')) {}

    // Add the start time to the date.
    date = moment(date.format('YYYY-MM-DD ') + cl.startTime, 'YYYY-MM-DD hh:mmA');
    return date.toDate();
}

// Returns the date and time of the end of the first occurrence of the class.
function getClassEnd(term, cl) {
    // An array of days of the week the class is on.
    var classDays = [];
    for (d in cl.days) {
        classDays.push(dayOfWeekCharToInt(cl.days[d]));
    }

    // Move date to the first day of class.
    var date;
    for (date = moment(getTermStart(term)); !classDays.includes(parseInt(date.format('d'))); date.add(1, 'd')) { }

    // Add the end time to the date.
    date = moment(date.format('YYYY-MM-DD ') + cl.endTime, 'YYYY-MM-DD hh:mmA');

    return date.toDate();
}

// Cleans day abbreviations for use with .ical format.
function cleanDays(days) {
    var outDays = [];
    for (d in days) {
        switch (days[d]) {
            case 'M':
                outDays.push('MO');
                break;
            case 'T':
                outDays.push('TU');
                break;
            case 'W':
                outDays.push('WE');
                break;
            case 'R':
                outDays.push('TH');
                break;
            case 'F':
                outDays.push('FR');
                break;
            default:
                outDays.push(null);
        }
    }

    return outDays;
}

// Iterates through the dom table and adds events that don't have null dates or times.
function tableToClassList(table) {
    var list = [];
    // 1 is the first body row.
    for (var i = 1, row = table.rows[i]; i < table.rows.length - 1; row = table.rows[++i]) {
        var cl = new Class();

        var firstCol = row.cells[0].textContent.split(/\s+/);

        var times = row.cells[3].textContent.split('-');

        cl.startTime = times[0];
        if (cl.startTime == ' ' || cl.startTime == null)
            continue;

        cl.endTime = times[1];
        if (cl.endTime == ' ' || cl.endTime == null)
            continue;

        cl.days = row.cells[2].textContent.split('');
        if (cl.days == null || cl.days.length < 1)
            continue;

        cl.courseNumber = firstCol[0];
        cl.crn = firstCol[1];
        cl.courseLink = row.cells[0].querySelector('td a').href;
        cl.place = row.cells[1].textContent;

        cl.instructor = row.cells[5].querySelector('a').getAttribute('data-content');

        list.push(cl);
    }

    return list;
}


function Class() {
    this.courseNumber;
    this.courseLink;
    this.crn;
    this.place;
    this.days;
    this.startTime;
    this.endTime;
    this.instructor;
}