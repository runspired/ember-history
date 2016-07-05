import Ember from 'ember';
import cloneRange from '../utils/dom/clone-range';
import appendRange from '../utils/dom/append-range';

const {
  Service,
  } = Ember;

export default Service.extend({
  init() {
    this.set('cache', new Map());
  },

  update(url, outletName, element) {
    const cache = this.get('cache');
    const key = `${url}-${outletName}`;
    const dom = cloneRange('outlet-segment', element.firstChild, element.lastChild);

    let stale = cache.get(key);

    if (stale) {
      stale.dom = null;
    }

    this.get('cache').set(key, { url, outletName, dom });
  },

  restore(url, outletName, element) {
    element.innerHTML = '';

    const cache = this.get('cache');
    const key = `${url}-${outletName}`;

    const cached = cache.get(key);


    if (cached && cached.dom) {
      appendRange(element, cached.dom.firstChild, cached.dom.lastChild);
    }
  }
});
