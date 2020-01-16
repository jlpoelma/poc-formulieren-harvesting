import Component from '@glimmer/component';
import moment from 'moment';

export default class TimeTrackerTimeLineTimingSummaryComponent extends Component {

  get displayDate(){
    return this.args.timeLineTiming.date.toDateString();
  }

  get displayTimeSpent(){
    return moment
      .duration( this.args.timeLineTiming.totalTime)
      .humanize();
  }
}
