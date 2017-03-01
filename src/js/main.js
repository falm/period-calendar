
import $ from 'jquery';
import Handlebars from './vendor/handlebars.js';
import _ from 'lodash';
import moment from 'moment/moment';
import 'moment/locale/zh-cn'
// import '../css/style.css';
import {Period, Context, Calendar} from './period';
import {FORMAT} from './constants';

function getPeriods() {
    let result;
    if(process.env.NODE_ENV == 'development') {
        result = [{start_on: '2017-01-08', duration: 5, confirm: true}, {start_on: '2017-02-25', duration: 5, predict: false}];
    } else {

        result = window.Period.getPeriods();
    }
    return eval(result);
}

function getTitle() {
    var result;
    if(process.env.NODE_ENV == 'development') {

        result = '距离下一次,还有 18 天';

    } else {

        result = window.Period.getDistance();
    }

    return result.split(',');
}


function buildPeriod(start_on, today = false){
    let period = new Period(start_on);
    period.setIsToday(today);
    return period;
}

function behavior() {

    $('.calender').on('click', function () {
        var link = 'moon://date/' + $(this).data('param');
        // console.log('open:' + link);
        window.open(link);
    });
    var title = getTitle();
    let prefix = title[0];
    let distance = title[1];

    $('.prefix').text(prefix);
    $('.distance').text(distance);

}

function renderCalender(context) {

    let source = $("#entry-template").html();

    let template = Handlebars.compile(source);

    let html = template(context);

    $('.calenders').append(html);
}

function buildCalendar(times, currentDate) {
    return _.map(_.range(times), _.partial(Calendar.initializeBy, currentDate));
}

function processTerminal(start) {
    let currentDate = moment(start);
    let startOfMonth =  moment(start).startOf('month');
    let endOfMonth =  moment(start).endOf('month');

    let calendar = buildCalendar(endOfMonth.date(), currentDate);

    calendar = _.times(startOfMonth.weekday(), _.constant(Calendar.getBlank())).concat(calendar);

    calendar = convertToTable(calendar);

    return new Context(currentDate, calendar);

}

function h(period, calender) {

    return processTable(calender, function (day) {
        if(day.date() && day.date().isBetween(period.start_on, period.endOnFormat(), null, '[]')){
            day.heighlight = day.heighlight || !period.isToday;
            day.confirm = _.isUndefined(day.confirm) ? period.confirm : day.confirm;
        }

        if(day.date()){
            day.today = day.date().isSame(moment().format(FORMAT), 'day');
        }

        if(day.date() && day.date().isSame(period.start_on, 'day')){
            day.content = day.date().get('date');

        }
        return day;
    })

}

function processTable(table, fun) {
    return convertToTable(_.map(_.flatten(table), fun));
}

function getDuration(periods) {
    let last = _.last(periods).date().add((_.last(periods).duration -1 || 0), 'day');
    let num = last.startOf('month').diff(_.first(periods).date().startOf('month'), 'month', true);
    return Math.round(num) + 1;
}

function buildContext(periods){
    let duration = getDuration(periods);
    return _.map(_.range(duration), function (i) {
        let start_on = _.first(periods).date().add(i, 'months').format(FORMAT);
        return processTerminal(start_on);
    });
}

const renderCalendars = _.partialRight(_.each, renderCalender);

const convertToTable = _.partialRight(_.chunk, 7);

const sortByDate = _.partialRight(_.sortBy, (period) => period.moment.valueOf());

const appendMoments = _.partialRight(_.map, Period.fromPeriod);

const appendToday = _.partialRight(_.concat, buildPeriod(moment().format(FORMAT), true));

const processPeriods = _.flowRight(sortByDate, appendToday, appendMoments);

function processContexts(periods){
    let contexts = buildContext(periods);
    return _.reduce(periods, (contexts, period) => {
        return _.map(contexts, (context) => {
            context.data = h(period, context.data);
            context.setDescription(period);
            return context;
        });
    }, contexts);
}

(function (periods) {

    const render = _.flowRight(renderCalendars, processContexts, processPeriods);

    render(periods);

    behavior();

})(
    getPeriods()
);

