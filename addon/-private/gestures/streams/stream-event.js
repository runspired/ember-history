/* global Math, performance */
import FastArray from '../../cache-list/fast-array';
import Pointer from './pointer';

const STREAM_EVENT_POOL = new FastArray(undefined, 'StreamEvent Pool');

export default class StreamEvent {

  constructor(name, info, prev) {
    this.init(name, info, prev);
  }

  init(name, info, prev) {
    this.name = name;
    this.element = info.event.target;
    this._data = {};
    this._isImportantEvent = (name === 'end' || name === 'start' || (prev && prev.name === 'start'));
    this._source = this._isImportantEvent ? info.event : undefined;
    this.silenced = false;
    this.prev = prev;

    this.pointers = info.pointers.map((pointerInfo) => {
      let prevPointer;

      if (prev) {
        prevPointer = prev.pointers.find((pointer) => pointer.pointerId === pointerInfo.pointerId);
      }

      return Pointer.create(pointerInfo, prevPointer);
    })
  }

  get(key) {
    if (this._data[key]) {
      return this._data[key];
    }

    if (this.pointers.length === 1) {
      this._data[key] = this.pointers[0][key];
    }

    return this._data[key];
  }

  // cancel any default behaviors from this event
  silence() {
    if (this._source && this._source.cancelable) {
      this._source.preventDefault();
      this._source.stopPropagation();
      this.silenced = true;
    }
  }

  static create(name, info, prev) {
    let event = STREAM_EVENT_POOL.pop();

    if (event) {
      event.init(name, info, prev);
      return event;
    }

    return new StreamEvent(name, info, prev);
  }

  destroy() {
    this._source = undefined;
    this.prev = undefined;
    this.element = undefined;

    STREAM_EVENT_POOL.push(this);
  }

}
