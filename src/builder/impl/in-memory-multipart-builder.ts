import { Multipart } from '../../api/multipart';
import { Part } from '../../api/part';
import { PartHeader } from '../../api/part-header';
import { MultipartBuilder } from '../api/multipart-builder';
import { PartBuilder } from '../api/part-builder';
import { InMemoryPartBuilder } from './in-memory-part-builder';

export class InMemoryMultipartBuilder implements MultipartBuilder {
  private parts: Part[] = [];

  createPartBuilder(header: PartHeader): PartBuilder {
    return new InMemoryPartBuilder(header);
  }

  append(part: Part) {
    this.parts.push(part);
  }

  // getParts(): Part[] {
  //     return this.parts;
  // }

  build(): Promise<Multipart> {
    return Promise.resolve(new Multipart(this.parts));
  }
}
