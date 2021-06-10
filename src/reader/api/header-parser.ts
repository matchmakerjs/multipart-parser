import { PartHeader } from '../../api/part-header';

export interface MultipartHeaderParser {
  parseHeader(buffer: Buffer): PartHeader;
}
