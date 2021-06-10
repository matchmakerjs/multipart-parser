import { Multipart } from '../../api/multipart';
import { Part } from '../../api/part';
import { PartHeader } from '../../api/part-header';
import { PartBuilder } from './part-builder';

export interface MultipartBuilder {
  createPartBuilder(header: PartHeader): PartBuilder;
  append(part: Part): void;
  build(): Promise<Multipart>;
}
