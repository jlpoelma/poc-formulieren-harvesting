import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

export default class TimeTrackerProjectUpdateComponent extends Component {
  @tracked
  name = null;

  @tracked
  order = null;
  
  @tracked
  showTimeline

  get projectName(){
    return this.name || (this.args.project && this.args.project.name);
  }
  set projectName(name){
    this.name = name;
  }
  get projectOrder(){
    return this.order || (this.args.project && this.args.project.order);
  }
  set projectOrder( order ) {
    this.order = order;
  }

  @action
  submit(event){
    event.preventDefault();
    this.args.project.name = this.projectName;
    this.args.project.order = this.projectOrder;
  }
}
