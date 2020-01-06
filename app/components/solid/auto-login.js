import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class SolidAutoLoginComponent extends Component {
  @service("solid/auth") auth;

  constructor(){
    super(...arguments);
    this.auth.ensureLogin();
  }
}
