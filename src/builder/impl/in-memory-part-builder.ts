import { Readable } from 'stream';
import { Part } from '../../api/part';
import { PartHeader } from '../../api/part-header';
import { PartBuilder } from '../api/part-builder';

export class InMemoryPartBuilder implements PartBuilder {
  private contentBuffer = Buffer.of();

  constructor(private header: PartHeader) {}

  append(data: Buffer): Promise<void> {
    this.contentBuffer = Buffer.concat([this.contentBuffer, data]);
    return Promise.resolve();
  }

  build(): Promise<Part> {
    const part = new Part(this.header, {
      inMemory: true,
      length: this.contentBuffer.length,
      content: Readable.from(this.contentBuffer),
      data: this.contentBuffer,
    });
    return Promise.resolve(part);
  }
}
