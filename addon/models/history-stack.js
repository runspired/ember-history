import Ember from 'ember';

const {
  A,
  computed
} = Ember;

export default Ember.Object.extend({
  stack: undefined,
  seen: undefined,

  previous: computed.alias('stack.lastObject'),
  next: computed.alias('seen.lastObject'),
  current: undefined,

  init() {
    this.set('stack', new A([]));
    this.set('seen', new A([]));
  },

  forward() {
    let next = this.get('seen').popObject();

    if (next) {
      let current = this.get('current');

      this.get('stack').pushObject(current);
      this.set('current', next);
    }
  },

  back() {
    let prev = this.get('stack').popObject();

    if (prev) {
      let current = this.get('current');

      this.get('seen').pushObject(current);
      this.set('current', prev);
    }
  },

  push(item) {
    let previous = this.get('current');

    this.get('stack').pushObject(previous);
    this.set('current', item);

    this.get('seen').clear();
  }
});
