import Stream from '../streams/stream';
import StreamEvent from '../streams/stream-event';

export default class Input {

  constructor(element, manager) {
    this.element = element;
    this.activePointers = 0;
    this.stream = null;
    this.attached = false;
    this.handler = null;
    this.handlerStack = [];
    this.streaming = false;
    this.hasMoved = false;
    this._nextEvent = undefined;

    this._handlers = { start: null, update: null, end: null, interrupt: null };
    this.manager = manager;

    this.attach();
  }

  _bind(name) {
    const { _handlers } = this;

    return _handlers[name] = this[name].bind(this);
  }

  start(event) {
    if (this.stream === null) {
      this.stream = Stream.create();
    } else {
      this.stream.split();
    }

    this.activePointers++;
    this.streaming = true;

    const pointers = this.extractPointers(event);

    // console.log('opening new stream');
    let streamEvent = this.stream.open({ event, pointers });

    if (this.handler) {
      this.handlerStack.push(this.handler);
      this.handler = null;
    }

    this.manager.recognize(this, this.stream, streamEvent);

    this._poll();
  }

  trigger(streamEvent) {
    if (this.handler) {
      this.handler.recognize(this, this.stream, streamEvent);
    } else {
      this.manager.recognize(this, this.stream, streamEvent);
    }
  }

  _update(event) {
    // console.log('updating');
    let streamEvent;
    const pointers = this.extractPointers(event);

    if (!this.streaming) {
      if (!this.handler) {

      }
      // console.log('closing stream');
      streamEvent = this.stream.close({ event, pointers });

      this.hasMoved = false;
      this.trigger(streamEvent);

      let wasRecognizing = this.handler;

      this.handler = null;

      // vacate this stream
      // console.log('removing stream');
      this.stream = null;

      if (wasRecognizing && !this.stream) {
        this.manager.endInputRecognition();
      }

    } else {
      streamEvent = this.stream.push({ event, pointers });

      this.trigger(streamEvent);
    }

  }

  _poll() {
    return void requestAnimationFrame(() => {
      let event = this._nextEvent;

      if (event) {
        this._update(event);
        this._nextEvent = undefined;
      }

      if (this.streaming) {
        this._poll();
      }
    });
  }

  update(event) {
    if (!this.streaming) {
      return;
    }

    this._nextEvent = event;
    if (!this.hasMoved) {
      this.hasMoved = true;
      this._update(event);
    }
  }

  _close(event) {
    if (this.streaming) {
      // console.log('received close event');
      this.activePointers--;


      if (this.activePointers !== 0) {
        this.stream.split();
      } else {
        this.streaming = false;
      }

      this._nextEvent = event;
    }
  }

  end(event) {
    if (this.streaming) {
      this._close(event);
    }
  }

  interrupt(event) {
    if (this.streaming) {
      this._close(event);
    }
  }

  attach() {
    throw new Error('Interface Method Not Implemented');
  }

  deattach() {
    throw new Error('Interface Method Not Implemented');
  }

  destroy() {
    this.deattach();
    this.manager = null;
    this.element = null;
    this.stream = null;
    this.handler = null;
  }

}
