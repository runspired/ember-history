import Ember from 'ember';
import HistoryStack from '../models/history-stack';

const {
  computed,
  inject,
  Service,
  Evented
  } = Ember;

const {
  Promise // jshint ignore:line
  } = Ember.RSVP;

export default Service.extend(Evented, {
  routing: inject.service('-routing'),
  router: computed.alias('routing.router'),

  cache: inject.service('history-cache'),

  activeOutletName: undefined,
  activeOutlet: undefined,
  activeStack: undefined,
  stacks: undefined,

  _isHistoryOperation: false,

  previous: computed.alias('activeStack.previous'),
  next: computed.alias('activeStack.next'),
  current: computed.alias('activeStack.current'),

  activate(outletName, outletElement, name = 'default') {
    Ember.assert(`Only one history-outlet can be active at once, tried to activate ${name} while ${this.get('activeOutletName')} was already active`, !this.get('activeOutletName'));

    let stacks = this.get('stacks');
    let historyStack = stacks.get(name);

    if (historyStack === undefined) {
      let router = this.get('router');
      let location = router.get('_location') || router.get('location');
      let url = location.lastSetURL || router.get('url');
      let routeName = router.currentRouteName;
      let current = { url, routeName };

      historyStack = HistoryStack.create({ current });

      stacks.set(name, historyStack);
    }

    this.set('activeStack', historyStack);
    this.set('activeOutletElement', outletElement);
    this.set('activeOutletName', outletName);
  },

  deactivate() {
    this.set('activeStack', undefined);
    this.set('activeOutlet', undefined);
    this.set('activeOutletName', undefined);
  },

  back() {
    let previous = this.get('previous');

    if (previous) {
      this._isHistoryOperation = true;

      return this.get('router').transitionTo(previous.url)
        .then(() => {
          this.get('activeStack').back();
        })
        .finally(() => {
          this._isHistoryOperation = false;
        });
    }

    return Promise.reject('no history present');
  },

  forward() {
    let next = this.get('next');

    if (next) {
      this._isHistoryOperation = true;

      return this.get('router').transitionTo(next.url)
        .then(() => {
          this.get('activeStack').forward();
        })
        .finally(() => {
          this._isHistoryOperation = false;
        });
    }

    return Promise.reject('no forward history present');
  },

  restoreFromCache(url, element) {
    let outletName = this.get('activeOutletName');

    this.get('cache').restore(url, outletName, element);
  },

  init() {
    this._super();

    this.set('stacks', Ember.Object.create());

    const router = this.get('router');

    router.on('willTransition', () => {
      let outletName = this.get('activeOutletName');
      let outletElement = this.get('activeOutletElement');
      let current = this.get('current');

      if (current) {
        this.get('cache').update(current.url, outletName, outletElement);
      }
    });

    router.on('didTransition', () => {
      if (!this._isHistoryOperation) {
        let location = router.get('_location') || router.get('location');
        let url = location.lastSetURL || router.get('url');
        let routeName = router.currentRouteName;

        this.get('activeStack').push({ url, routeName });
      }

      this.trigger(
        'didTransition',
        this.getProperties('previous', 'current', 'next')
      );
    });
  }
});
