import Component from '@glimmer/component';
import moment from 'moment';

export default class TimeTrackerTimeLineShowTimeRangeComponent extends Component {
  get timeRange(){
    if( this.args.timeLine && this.args.timeLine.startedAt && this.args.timeLine.endedAt ) {
      return moment
        .duration( this.args.timeLine.endedAt - this.args.timeLine.startedAt )
        .humanize();
    }
  }

  get milliseconds(){
    if( this.args.timeLine && this.args.timeLine.startedAt && this.args.timeLine.endedAt ) {
      return this.args.timeLine.endedAt - this.args.timeLine.startedAt;
    } else
      return null;
  }

  get onlySeconds(){
    return this.milliseconds < ( 60 * 1000 );
  }

  get seconds(){
    return this.milliseconds && ( Math.round( this.milliseconds / 1000.0 ) % 60 );
  }

  get minutes(){
    return this.milliseconds && ( Math.round(this.milliseconds / (60 * 1000.0 )) % 60 );
  }

  get hours(){
    const hours = this.milliseconds && Math.floor( Math.floor(this.milliseconds / (60 * 60 * 1000)) % 24 );
    return hours != 0 && hours;
  }

  get days(){
    const days = this.milliseconds && Math.floor( this.milliseconds / (1000 * 60 * 60 * 24 ) );
    return days != 0 && days;
  }

  get timeString(){
    const start = this.args.timeLine.startedAt;
    const end = this.args.timeLine.endedAt || new Date();
    return `${ start.toTimeString() } - ${ end.toTimeString() }`;

    // TODO: write nicer time string or find other rendering method.
  }
}
