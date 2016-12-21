/* Most code here modified from https://github.com/Wysie/ics.js. */

var ics = function () {
    'use strict';

    if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') == -1) {
        console.log('Unsupported Browser');
        return;
    }

    var SEPARATOR = (navigator.appVersion.indexOf('Win') !== -1) ? '\r\n' : '\n';
    var calendarEvents = [];
    var calendarStart = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0'
    ].join(SEPARATOR);
    var calendarEnd = SEPARATOR + 'END:VCALENDAR';

    var validDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    var knoxvilleTimezone = 'ET';

    return {
        /**
         * Returns events array
         * @return {array} Events
         */
        'events': function () {
            return calendarEvents;
        },

        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function () {
            return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        },

        /**
         * Add event to the calendar
         * @param  {string} subject     Subject/Title of event
         * @param  {string} description Description of event
         * @param  {string} location    Location of event
         * @param  {string} begin       Beginning date of event
         * @param  {string} stop        Ending date of event
		 * @param  {boolean} isAllDay	Specifies if it's an all day event
         */
        'addEvent': function (subject, description, location, begin, stop, isAllDay, rrule) {
            // I'm not in the mood to make these optional... So they are all required
            if (typeof subject === 'undefined' ||
                typeof description === 'undefined' ||
                typeof location === 'undefined' ||
                typeof begin === 'undefined' ||
                typeof stop === 'undefined'
            ) {
                return false;
            }

            if (typeof isAllDay === 'undefined') {
                isAllDay = false;
            }

            // validate rrule
            if (rrule) {
                if (!rrule.rule) {
                    if (rrule.freq !== 'YEARLY' && rrule.freq !== 'MONTHLY' && rrule.freq !== 'WEEKLY' && rrule.freq !== 'DAILY') {
                        throw "Recurrence rule frequency must be provided and be one of the following: 'YEARLY', 'MONTHLY', 'WEEKLY', or 'DAILY'";
                    }

                    if (rrule.until) {
                        if (isNaN(Date.parse(rrule.until))) {
                            throw "Recurrence rule 'until' must be a valid date string";
                        }
                    }

                    if (rrule.interval) {
                        if (isNaN(parseInt(rrule.interval))) {
                            throw "Recurrence rule 'interval' must be an integer";
                        }
                    }

                    if (rrule.count) {
                        if (isNaN(parseInt(rrule.count))) {
                            throw "Recurrence rule 'count' must be an integer";
                        }
                    }
                }
            }

            var start_date = moment(begin);
            var end_date = moment(stop);
            var start = '';
            var end = '';

            //Hackish, this should be ideally handled in ics.js
            if (isAllDay) {
                end_date.add(1, 'days');
            }

            if (isAllDay) {
                start = start_date.format('YYYYMMDD');
                end = end_date.format('YYYYMMDD');
            }
            else {
                start = start_date.format('YYYYMMDDTHHmmss');
                end = end_date.format('YYYYMMDDTHHmmss');
            }

            // recurrence rule vars
            var rruleString;
            if (rrule) {
                if (rrule.rule) {
                    rruleString = rrule.rule;
                } else {
                    rruleString = 'RRULE:FREQ=' + rrule.freq;

                    if (rrule.until) {
                        var uDate = moment(rrule.until).format('YYYYMMDDTHHmmss');
                        rruleString += ';UNTIL=' + uDate;
                    }

                    if (rrule.interval) {
                        rruleString += ';INTERVAL=' + rrule.interval;
                    }

                    if (rrule.count) {
                        rruleString += ';COUNT=' + rrule.count;
                    }
                    if (rrule.byDay != null && rrule.byDay.length > 0) {
                        rruleString += ';BYDAY=';
                        for (var i = 0; i < rrule.byDay.length; i++) {
                            if (!validDays.includes(rrule.byDay[i])) {
                                throw "BYDAY value '" + rrule.byDay[i] + "' is not valid.";
                            }
                            rruleString += rrule.byDay[i] + ',';
                        }

                        // Remove the extra comma.
                        rruleString = rruleString.substring(0, rruleString.length - 1);
                    }
                }
            }

            description = description.escapeSpecialChars();
            subject = subject.escapeSpecialChars();
            location = location.escapeSpecialChars();

            var calendarEvent = [
                'BEGIN:VEVENT',
                'CLASS:PUBLIC',
                'DESCRIPTION:' + description,
                'DTSTART;TZID=' + knoxvilleTimezone + ':' + start,
                'DTEND;TZID=' + knoxvilleTimezone + ':' + end,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=en-us:' + subject,
                'END:VEVENT'
            ];

            if (rruleString) {
                calendarEvent.splice(4, 0, rruleString);
            }

            calendarEvent = calendarEvent.join(SEPARATOR);

            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using the saveAs function from filesave.js
         * @param  {string} filename Filename
         * @param  {string} ext      Extention
         */
        'download': function (filename, ext) {
            if (calendarEvents.length < 1) {
                return false;
            }

            ext = (typeof ext !== 'undefined') ? ext : '.ics';
            filename = (typeof filename !== 'undefined') ? filename : 'calendar';
            var calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;

            var blob = new Blob([calendar], { type: 'text/x-vCalendar;charset=' + document.characterSet });
            saveAs(blob, filename + ext);
            return calendar;
        }
    };
};

String.prototype.escapeSpecialChars = function () {
    return this.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f")
        .replace(/\\;/g, "\\;")
        .replace(/\\,/g, "\\,");
};
