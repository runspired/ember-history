
export default class HorizontalPan {
  constructor(options) {
    this.name = 'horizontal-pan';
    this.options = options;
    this.layer = undefined;
    this.stream = undefined;

    this.isRecognizing = false;
  }

  beginRecognizing(input, stream, streamEvent) {
    this.isRecognizing = true;

    this.stream = stream;
    let { series } = this.stream;

    series.forEach((event) => {
      this.relay(event);
    });
  }

  relay(event) {
    if (event.name === 'start') {
      this.layer.emit({ name: 'panStart', event });

    } else if (event.name === 'end') {
      this.isRecognizing = false;
      this.layer.emit({ name: 'panEnd', event });
      this.stream = undefined;

    } else if (event.totalX < 0 || event.prev.get('totalX') < 0) {
      this.layer.emit({ name: 'panLeft', event });

    } else {
      this.layer.emit({ name: 'panRight', event });
    }
  }

  emit(name, event) {
    this.layer.emit({ name, event });
  }

  recognize(input, stream, streamEvent) {
    if (this.isRecognizing) {
      this.relay(streamEvent);
    } else if (input.activePointers === 1 && streamEvent.get('totalY') === 0 && streamEvent.get('totalX') !== 0) {
      this.beginRecognizing(input, stream, streamEvent);
    }

    return this.isRecognizing;
  }
}
