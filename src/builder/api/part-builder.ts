import { Part } from '../../api/part';

export interface PartBuilder {
  append(data: Buffer): Promise<void>;
  build(): Promise<Part>;
}
