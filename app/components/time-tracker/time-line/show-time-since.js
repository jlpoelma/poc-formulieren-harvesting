import Component from '@glimmer/component';
import moment from 'moment';

export default class TimeTrackerTimeLineShowTimeSinceComponent extends Component {
  get timeSince(){
    if( this.args.date )
      return moment().to( this.args.date );
    else
      return null;
  }
}
