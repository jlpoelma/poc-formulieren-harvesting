import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';
import auth from 'solid-auth-client';

export default class SolidAuthService extends Service {

  @tracked
  session = null;

  async ensureLogin(){
    let session = await auth.currentSession();
    if( session ) {
      this.session = session;
    } else {
      const identityProvider = "https://solid.community";
      auth.login(identityProvider);
    }
  }

  get webId(){
    return this.session ? this.session.webId : undefined;
  }
}
