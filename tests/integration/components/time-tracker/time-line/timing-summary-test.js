import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | time-tracker/time-line/timing-summary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<TimeTracker::TimeLine::TimingSummary />`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      <TimeTracker::TimeLine::TimingSummary>
        template block text
      </TimeTracker::TimeLine::TimingSummary>
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
