import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SolidLoginComponent extends Component {
  @service auth;

  @action
  async login() {
    await this.auth.ensureLogin();
  }
}
