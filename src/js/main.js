
import $ from 'jquery';
import Handlebars from './vendor/handlebars.js';
import _ from 'lodash';
import moment from 'moment/moment';
import '../css/style.css';

function getPeriods() {
    // var result = window.Period.getPeriods();
    return [{start_on: '2016-08-08', duration: 5, confirm: true}, {start_on: '2016-09-29', duration: 5, predict: false}];
    return eval(result);
}

function getTitle() {
    // var result = '18 days Left';
    var result = window.Period.getDistance();
    return result;
}

function processSameMonth(periods, calendar) {

    var m = moment(_.first(periods).start_on);
    var e = moment(_.last(periods).start_on);
    if(m.isSame(e, 'month')){

        calendar = _.drop(calendar);
        var high = function (data){
            return assignHeightLight(data, getPeriodRange(new Date(periods[0].start_on), periods[0].duration));
        };
        calendar[0].data = _.flowRight(convertToTable, high, _.flatten)(calendar[0].data);
    }

    return calendar;
}

function constructPeriods(periods) {

    var duration = moment(_.last(periods).start_on).diff(moment(_.first(periods).start_on), 'month');
    return _(_.map(_.range(duration - 1), function (i) {
        var start_on = moment(periods[0].start_on).add(i + 1, 'months');
        return {start_on: start_on};
    })).tap(function (results) {
        periods[0].prefix = 'Previous';
        periods[1].prefix = 'Next';
        results.unshift(periods[0]);
        results.push(periods[1]);
    }).value();
}

function crossMonth(periods) {
    return _.reduce(periods, function (result, period) {

        result.push(period);

        var m = moment(period.start_on).add(period.duration - 1, 'day');
        var end = moment(period.start_on).endOf('month');
        if(m.isAfter(end, 'day')){
            result.push({start_on: m.add(1, 'm').format('YYYY-M-D')})

        }
        return result;
    }, []);
}

var build =  _.flowRight(crossMonth, constructPeriods);

function processToday(calendar) {
    return _.map(calendar, function (day) {
        if(moment().isSame(day.date, 'day')){
            day.content = day.day;
        }
        return day;
    });
}

function buildCalendar(times, currentDate) {
    return _.map(_.range(times), function (day) {
        var date = moment([currentDate.get('year'), currentDate.get('month') , day + 1]);
        return {content: null, day: day + 1, blank: false, heighlight: false, date: date};
    });
}

function processTerminal(period) {
    var currentDate = moment(period.start_on);
    var startOfMonth =  moment(period.start_on).startOf('month');
    var endOfMonth =  moment(period.start_on).endOf('month');

    var calendar = buildCalendar(endOfMonth.date(), currentDate);

    if (period.hasOwnProperty('duration')){
        calendar = processToday(calendar);
        var description = period.prefix + ' Period: </br>' + currentDate.format('ddd, MMM D');
    }


    calendar = _.times(startOfMonth.weekday(), _.constant({blank: true})).concat(calendar);

    calendar = assignHeightLight(calendar, getPeriodRange(new Date(period.start_on), period.duration));
    calendar = convertToTable(calendar);
    return {
        title: currentDate.format('MMM YYYY').toUpperCase(),
        description: description,
        month: currentDate.month(),
        param: currentDate.format('YYYY-MM'),
        data: calendar
    };

}


function getPeriodRange(date, duration) {
    return _.map(_.range(duration), function (n) {
        return date.getDate() + n;
    });
}

function assignHeightLight(month, range) {
    var first = true;
   return _.map(month, function (day) {

        if(_.includes(range, day.day)){
            if (first){
                day.content = day.day;
                first = false;
            }
            day.heighlight = true
        }

        return day;
    });
}

var convertToTable = _.partialRight(_.chunk, 7);

function h(period, calender) {
    var m = moment(period.start_on);
    var e = m.add(period.duration, 'day').format('YYYY-MM-DD');

    return processTable(calender, function (day) {
        if(!day.blank && day.date && day.date.isBetween(period.start_on, e)){
            day.heighlight = true;
        }
        return day;
    })

}

function processTable(table, fun) {
     return convertToTable(_.map(_.flatten(table), fun));
}

function crossMonthHeightLight(periods, contexts) {
    _.last(contexts).data = h(_.last(periods), _.last(contexts).data);
    return contexts;
}

function renderCalender(context) {

    var source = $("#entry-template").html();

    var template = Handlebars.compile(source);

    var html = template(context);

    $('.calenders').append(html);
}

var buildContext = _.flowRight(_.partialRight(_.map, processTerminal), build);

var renderCalendars = _.partialRight(_.each, renderCalender);

function behavior(periods) {

    $('.calender').on('click', function () {
        var link = 'moon://date/' + $(this).data('param');
        console.log('open:' + link);
        window.open(link);
    });

    $('.title').text(getTitle());

    $('.li-heighlight-true').slice(-_.last(periods).duration).addClass('li-predict');
}

(function (periods) {

    var contexts = buildContext(periods);

    contexts = crossMonthHeightLight(periods, contexts);

    contexts = processSameMonth(periods, contexts);

    renderCalendars(contexts);

    behavior(periods);

})(
    getPeriods()
);


