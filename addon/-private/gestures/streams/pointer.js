/* global Math, performance */
import FastArray from '../../cache-list/fast-array';
const POINTER_POOL = new FastArray(undefined, 'Pointer Pool');

export default class Pointer {

  constructor(info, prev) {
    this.init(info, prev);
  }

  init(info, prev) {
    this.pointerId = info.pointerId;
    this.prev = prev;

    // time
    this.time = performance.now();
    this.dT = prev ? this.time - prev.time : 0;

    // current position (clientX/Y)
    this.x = info.x;
    this.y = info.y;

    // deltas off of origin event
    this.originX = prev ? (prev.originX || prev.x) : info.x;
    this.originY = prev ? (prev.originY || prev.y) : info.y;
    this.totalX = info.x - this.originX;
    this.totalY = info.y - this.originY;

    // deltas off of last event
    this.dX = prev ? info.x - prev.x : 0;
    this.dY = prev ? info.y - prev.y : 0;

    // prediction values
    this.acceleration = 0;
    this.aX = 0;
    this.aY = 0;

    this.velocity = 0;
    this.vX = 0;
    this.vY = 0;

    this.nextX = 0;
    this.nextY = 0;
  }

  getAccelerationX() {
    const { dT, prev } = this;
    const vX = this.getVelocityX();
    const { vX: _vX } = prev;

    return this.aX = (vX - _vX) / dT;
  }

  getAccelerationY() {
    const { dT, prev } = this;
    const vY = this.getVelocityY();
    const { vY: _vY } = prev;

    return this.aY = (vY - _vY) / dT;
  }

  getAcceleration() {
    const aX = this.getAccelerationX();
    const aY = this.getAccelerationY();
    let acceleration = this.acceleration = Math.sqrt(aX * aX + aY * aY);

    return { aX, aY, acceleration };
  }

  getVelocityX() {
    const { dX, dT } = this;

    debugger;

    return this.vX = dX / dT;
  }

  getVelocityY() {
    const { dY, dT } = this;

    return this.vY = dY / dT;
  }

  getVelocity() {
    const vX = this.getVelocityX();
    const vY = this.getVelocityY();
    let velocity = this.velocity = Math.sqrt(vX * vX + vY * vY);

    return { vX, vY, velocity };
  }

  predictX() {
    const aX = this.getAccelerationX();
    const { x, dX, vX, dT, totalX } = this;

    // distance = initial distance + velocity * time + 1/2 acceleration * time^2
    let nextDeltaX = Math.round((vX * dT) + (0.5 * aX * dT * dT));
    let nextdX = dX + nextDeltaX;
    let nextX = x + nextDeltaX;
    let nextTotalX = totalX + nextDeltaX;

    return this.nextX = { x: nextX, dX: nextdX, totalX: nextTotalX };
  }

  predictY() {
    const aY = this.getAccelerationY();
    const { y, dY, vY, dT, totalY } = this;

    // distance = initial distance + velocity * time + 1/2 acceleration * time^2
    let nextDeltaY = Math.round((vY * dT) + (0.5 * aY * dT * dT));
    let nextdY = dY + nextDeltaY;
    let nextY = y + nextDeltaY;
    let nextTotalY = totalY + nextDeltaY;

    return this.nextY = { y: nextY, dY: nextdY, totalY: nextTotalY };
  }

  predict() {
    const nextX = this.predictX();
    const nextY = this.predictY();

    return { x: nextX, y: nextY };
  }

  static create(name, info, prev) {
    let event = POINTER_POOL.pop();

    if (event) {
      event.init(name, info, prev);
      return event;
    }

    return new Pointer(name, info, prev);
  }

  destroy() {
    this._source = undefined;
    this.prev = undefined;
    this.pointerId = undefined;

    POINTER_POOL.push(this);
  }

}
