import Input from './input';

export default class TouchInput extends Input {

  attach() {
    if (this.attached) {
      return;
    }
    const { element } = this;

    element.addEventListener('touchstart', this._bind('start') , true);
    element.addEventListener('touchend', this._bind('end') , true);
    element.addEventListener('touchcancel', this._bind('interrupt') , true);
    element.addEventListener('touchmove', this._bind('update') , true);

    this.attached = true;
  }

  deattach() {
    if (this.attached) {
      return;
    }
    const { element, _handlers } = this;

    element.removeEventListener('touchstart', _handlers.start , true);
    element.removeEventListener('touchend', _handlers.end , true);
    element.removeEventListener('touchcancel', _handlers.interrupt , true);
    element.removeEventListener('touchmove', _handlers.update , true);
  }

}
