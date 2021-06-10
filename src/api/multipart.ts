import { Part } from './part';

export class Multipart {
  constructor(public readonly parts: Part[]) {}

  get length() {
    return this.parts?.length;
  }
}
