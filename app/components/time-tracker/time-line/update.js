import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class TimeTrackerTimeLineUpdateComponent extends Component {
  @action
  stopTimeLine(timeLine) {
    timeLine.endedAt = new Date();
  }
}
