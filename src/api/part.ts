import { Readable } from 'stream';
import { PartHeader } from './part-header';

export class Part extends PartHeader {
  readonly contentLength: number;
  readonly inMemory: boolean;
  readonly content: Readable;
  readonly data: Buffer;

  constructor(
    header: PartHeader,
    content: {
      length: number;
      inMemory: boolean;
      content: Readable;
      data: Buffer;
    },
  ) {
    super(header);
    this.contentLength = content.length;
    this.inMemory = content.inMemory;
    this.content = content.content;
    this.data = content.data;
  }
}
