import { IncomingMessage } from 'http';
import { Readable } from 'stream';
import { Multipart } from '../../api/multipart';
import { MultipartBuilder } from '../../builder/api/multipart-builder';
import { PartBuilder } from '../../builder/api/part-builder';
import { InMemoryMultipartBuilder } from '../../builder/impl/in-memory-multipart-builder';
import { MultipartHeaderParser } from '../api/header-parser';
import { SimpleMultipartHeaderParser } from './multipart-header-parser';

const newLineBuffer = Buffer.from('\r\n');
type MultipartReaderOptions = {
  store?: MultipartBuilder;
  headerParser?: MultipartHeaderParser;
};

export class MultipartReader {
  public static readRequest(request: IncomingMessage, options?: MultipartReaderOptions): Promise<Multipart> {
    const boundary = MultipartReader.getBoundary(request.headers['content-type']);
    return MultipartReader.read(request, boundary, options);
  }

  public static getBoundary(contentType: string) {
    if (!contentType) {
      return;
    }
    let parts = contentType.split(';');
    if (parts.length < 2) {
      return;
    }
    parts = parts[1].trim().split('=');
    return parts.length > 1 ? parts[1] : null;
  }

  public static read(stream: Readable, boundary: string, options?: MultipartReaderOptions): Promise<Multipart> {
    if (!boundary) {
      throw new Error('boundary cannot be null or undefined');
    }
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const store = options?.store || new InMemoryMultipartBuilder();
    const headerParser = options?.headerParser || new SimpleMultipartHeaderParser();

    let headerBuffer = Buffer.of();
    let partStore: PartBuilder;

    return new Promise((res, rej) => {
      let temp = Buffer.of();
      let headerFetched: boolean;
      let working = false;
      stream.on('data', async (chunk) => {
        working = true;
        temp = Buffer.concat([temp, chunk]);
        let newLineBreak = -1;
        do {
          newLineBreak = temp.indexOf(newLineBuffer);
          if (newLineBreak < 0) {
            break;
          }
          const line = temp.subarray(0, newLineBreak);
          temp = Buffer.from(temp.subarray(newLineBreak + newLineBuffer.length));
          if (line.includes(boundaryBuffer)) {
            if (headerBuffer.length) {
              store.append(await partStore.build());
            }
            partStore = null;
            headerBuffer = Buffer.of();
            headerFetched = false;
          } else {
            if (headerFetched) {
              if (partStore != null) {
                partStore.append(newLineBuffer);
              } else {
                partStore = store.createPartBuilder(headerParser.parseHeader(headerBuffer));
              }
              partStore.append(line);
            } else if (!line.toString().match(/^\s*$/)) {
              if (headerBuffer.length) {
                headerBuffer = Buffer.concat([headerBuffer, newLineBuffer, line]);
              } else {
                headerBuffer = Buffer.concat([headerBuffer, line]);
              }
            } else {
              headerFetched = true;
            }
          }
        } while (newLineBreak >= 0);
        working = false;
      });
      stream.on('error', (e) => {
        rej(e);
      });
      stream.on('end', async () => {
        while (working) {
          await new Promise((res) => setTimeout(res));
        }
        if (headerBuffer.length) {
          return rej('Unexpected end of stream');
        }
        try {
          res(await store.build());
        } catch (e) {
          rej(e);
        }
      });
    });
  }
}
