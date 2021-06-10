export class PartHeader {
  readonly name: string;
  readonly contentType: string;
  readonly fileName: string;

  constructor(values: { name: string; contentType: string; fileName: string }) {
    this.name = values.name;
    this.contentType = values.contentType;
    this.fileName = values.fileName;
  }
}
