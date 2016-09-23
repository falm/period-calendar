
import moment from 'moment/moment';
import {PREVIOUS, FORMAT, EXPECTED} from './constants';

class Period{

    constructor(start_on, duration, confirm){
        this.start_on = start_on;
        this.duration = duration;
        this.confirm = confirm;
        this.moment = moment(start_on);
    }

    setIsToday(today){
        this.isToday = today;
    }

    date() {
        return moment(this.start_on);
    }

    end_on() {
        return this.date().add(this.duration - 1, 'day')
    }

    endOnFormat(format = FORMAT) {
        return this.end_on().format(format);
    }

    static fromPeriod(period){
        return new Period(period.start_on, period.duration, period.confirm);
    }
}

class Context{

    constructor(currentDate, calendar){
        this.title = currentDate.format('MMM YYYY').toUpperCase();
        this.description = [];
        this.month = currentDate.month();
        this.param = currentDate.format('YYYY-MM');
        this.data = calendar;
    }

    setDescription(period){

        if(this.month == period.date().get('month') && !period.isToday) {
            this.description.push(period.confirm ? PREVIOUS : EXPECTED);
            this.description.push(period.date().format('ddd, MMM D'));
            this.description.push('&nbsp;');
        }
    }


}

class Calendar{
    constructor(date){
        this._date = date;
        this.heighlight = null;
        this.content = null;
        this.blank = false;
        this.confirm = undefined;
        this.today = false;
    }

    date(){
        //moment(this._date);
        return this._date;
    }

    static initializeBy(currentDate, day){

        return new Calendar(moment([currentDate.get('year'), currentDate.get('month') , day + 1]));
    }

    empty(){
        this.blank = true;
    }

    static getBlank(){
        let calendar = new Calendar(null);
        calendar.empty();
        return calendar;
    }

}

export {Period, Calendar, Context};
