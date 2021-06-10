import { Part } from '../../api/part';
import { PartBuilder } from '../api/part-builder';

export class NoOpPartBuilder implements PartBuilder {
  private closed: boolean;

  append(_: Buffer): Promise<void> {
    if (this.closed) {
      throw new Error('store already closed');
    }
    return Promise.resolve();
  }

  build(): Promise<Part> {
    if (this.closed) {
      throw new Error('store already closed');
    }
    this.closed = true;
    return Promise.resolve(null);
  }
}
