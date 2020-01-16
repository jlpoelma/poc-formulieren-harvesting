import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DatetimeInputComponent extends Component {
  @tracked
  fullDate = null;

  constructor(){
    super(...arguments);
    this.fullDate = new Date();
  }

  get date() {
    return this.fullDate.toLocaleDateString();
  }
  set date(date) {
    if( date && this.time && this.time != "Invalid Date")
      this.fullDate = new Date(`${date} ${this.time}`);
    else if( date )
      this.fullDate = new Date(date);

    console.log( this.fullDate );
  }

  get time() {
    return this.fullDate.toLocaleTimeString();
  }
  set time(time) {
    if( time )
      this.fullDate = new Date(`${this.date} ${time}`);
    console.log( this.fullDate );
  }

  @action
  now(){
    this.fullDate = new Date();
  }

  // @action
  // onInput(){
  //   this.args.update( new Date(`${this.someDate} ${this.someTime}`) );
  // }
}
