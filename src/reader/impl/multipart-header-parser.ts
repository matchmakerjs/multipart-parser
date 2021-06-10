import { PartHeader } from '../../api/part-header';
import { MultipartHeaderParser } from '../api/header-parser';

const newLine = Buffer.from('\r\n');
export class SimpleMultipartHeaderParser implements MultipartHeaderParser {
  parseHeader(buffer: Buffer): PartHeader {
    let name: string;
    let contentType: string;
    let fileName: string;

    buffer
      .toString()
      .split(newLine.toString())
      .forEach((header) => {
        if (header.startsWith('Content-Disposition')) {
          header.split(/; ?/).forEach((pair) => {
            const [key, value] = pair.split('=');
            switch (key.toLowerCase()) {
              case 'name':
                name = value.slice(1, value.length - 1);
                break;
              case 'filename':
                fileName = value.slice(1, value.length - 1);
                break;
            }
          });
        } else if (header.startsWith('Content-Type')) {
          contentType = header.split(/: ?/)[1];
        }
      });
    return new PartHeader({
      name,
      contentType,
      fileName,
    });
  }
}
